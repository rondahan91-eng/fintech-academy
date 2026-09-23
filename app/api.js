// ══════════════════════════════════════════════════════════════════════
//  הדיבור עם השרת · Google Apps Script
//
//  ⚠️ **הכיתה לא נופלת אם השרת נופל.** כל קריאה כאן יכולה להיכשל,
//     והאפליקציה ממשיכה לעבוד מקומית. שיעור שנעצר בגלל תקלת רשת
//     הוא כישלון גרוע יותר מעבודה שלא הסתנכרנה.
// ══════════════════════════════════════════════════════════════════════

// ⚠️ **לא `import` מ-config.js.** ‏config.js אינו בגיט — הכתובת היא
//    בפועל המפתח לשרת — ובשכפול נקי הוא פשוט לא קיים. ‏import סטטי
//    שנכשל הורג את כל המודול לפני שנרשם מאזין אחד, והמסך נראה תקין
//    ולא מגיב לכלום. תג script רגיל שנכשל הוא 404 בקונסולה, וזהו.
// ⚠️ **let ולא const, וזה לב ההגנה.** ‏2026-09-23: פריסה חדשה הרגה את
//    הכתובת הישנה, לשוניות שכבר היו פתוחות המשיכו לפנות אליה, וכל
//    שמירה נכשלה. הכתובת החדשה כבר הייתה ב-config.js על השרת — פשוט
//    לא בזיכרון של אותה לשונית. עכשיו כישלון גורר קריאה חוזרת של
//    config.js, ואם הכתובת התחלפה הלשונית מתקנת את עצמה בלי רענון.
let endpoint = (globalThis.FINTECH_ENDPOINT || '').trim();

/** מחזיר true אם נמצאה כתובת **אחרת** מזו שבזיכרון. */
async function refreshEndpoint() {
  try {
    const url = new URL('config.js', document.baseURI).href;
    const txt = await (await fetch(url, { cache: 'no-store' })).text();
    // ⚠️ הכתובת נשלפת מהטקסט ולא מ-eval: config.js שהוחלף בדף חסימה
    //    היה מריץ אצלנו קוד זר.
    const m = txt.match(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/);
    if (m && m[0] !== endpoint) { endpoint = m[0]; return true; }
  } catch { /* אין רשת בכלל. הקריאה הבאה תנסה שוב */ }
  return false;
}

const TOKEN_KEY = 'fintech:token';
const STUDENT_KEY = 'fintech:student';

export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  set token(v) { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY); },
  get student() {
    try { return JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null'); }
    catch { return null; }
  },
  set student(v) { localStorage.setItem(STUDENT_KEY, JSON.stringify(v)); },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(STUDENT_KEY); },
};

/** האם השרת ענה בפעם האחרונה. מי שמציג מצב חיבור קורא את זה. */
export const health = { online: true, lastError: null };

const listeners = new Set();
export const onHealthChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
function setOnline(ok, err) {
  const changed = health.online !== ok;
  health.online = ok;
  health.lastError = ok ? null : err;
  if (changed) listeners.forEach((fn) => fn(health));
}

/**
 * ⚠️ ‏text/plain ולא application/json — **בכוונה, וזה לא רשלנות.**
 * ‏application/json מפעיל preflight מסוג OPTIONS, ו-Apps Script לא
 * עונה עליו. הבקשה נופלת ב-CORS לפני שהיא מגיעה לשרת. הגוף עדיין JSON,
 * והשרת עושה JSON.parse בעצמו.
 */
// ⚠️ **45 שניות ולא 20.** ‏Apps Script עולה קר, והקריאה הראשונה אחרי
//    פריסה או אחרי שקט ארוך לוקחת יותר מ-20 — נמדד: ‏POST ידני ב-30
//    שניות הצליח בזמן שהטופס נכשל ב-20. **זה בדיוק מה שקורה בתלמיד
//    הראשון בבוקר**, ואחריו כולם נהנים משרת חם.
export async function call(action, payload = {}, { timeout = 45000 } = {}) {
  if (!endpoint) throw new Error('לא הוגדרה כתובת שרת ב-app/config.js');
  try {
    return await attempt(action, payload, timeout);
  } catch (err) {
    // ⚠️ **רק כשל תעבורה מצדיק בדיקת כתובת.** "קוד לא נכון" הוא תשובה
    //    תקינה של השרת, ולקרוא בגללה את config.js הוא רעש מיותר.
    if (!err.transport || !(await refreshEndpoint())) throw err;
    return attempt(action, payload, timeout);   // כתובת חדשה — ניסיון שני
  }
}

async function attempt(action, payload, timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      signal: ctrl.signal,
      redirect: 'follow',           // ‏Apps Script מפנה מחדש. חובה
    });
    // ⚠️ **לא res.json() ישירות.** ‏Apps Script מחזיר לפעמים דף HTML
    //    של שגיאה במקום JSON — ראיתי את זה קורה פעם אחת באמצע בדיקה,
    //    והניסיון הבא הצליח. ‏res.json() היה זורק SyntaxError, והתלמיד
    //    היה רואה "Unexpected token '<'". זו הודעה חסרת פשר, והיא
    //    גם לא מרמזת שכדאי פשוט לנסות שוב.
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      // דף HTML במקום JSON, או 404 של פריסה שנמחקה. שניהם כשל תעבורה,
      // ולכן call ינסה כתובת מעודכנת לפני שהתלמיד רואה משהו.
      setOnline(false, res.status === 404 ? 'gone' : 'non-json');
      throw transport(res.status === 404
        ? 'כתובת השרת התחלפה. רענן את הדף (Ctrl+F5).'
        : 'השרת החזיר תשובה לא צפויה. נסה שוב.');
    }
    setOnline(true);
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    // ⚠️ **פסק זמן אינו היעדר שרת.** שניהם נראים אותו דבר ל-fetch,
    //    אבל למורה הם שתי בעיות שונות לגמרי: "אין חיבור" שולח אותו
    //    לבדוק רשת, כשבפועל השרת פשוט איטי והניסיון הבא יעבוד.
    if (err.name === 'AbortError') {
      setOnline(false, 'timeout');
      throw new Error('השרת איטי מהרגיל. נסה שוב.');
    }
    if (!/^(שם|קוד|הודעה|אסימון|פג|החשבון|לא הוגדר)/.test(err.message)) {
      setOnline(false, err.message);
    }
    // ⚠️ **כתובת מתה נכשלת כאן, לא בתשובה.** דף 404 של גוגל מגיע בלי
    //    כותרות CORS, ולכן fetch נדחה עם TypeError ואין מה לבדוק בגוף.
    //    זה בדיוק מה שהכיתה חוותה, ולכן הוא חייב להיחשב כשל תעבורה.
    if (err instanceof TypeError) err.transport = true;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** שגיאה שמסמנת "הבעיה בצינור, לא בתשובה" — ראה call. */
function transport(message) {
  const e = new Error(message);
  e.transport = true;
  return e;
}

/**
 * שמירה אחרונה כשהדף נסגר. ‏keepalive מאפשר לבקשה לשרוד את סגירת
 * הדף — ‏fetch רגיל היה מבוטל, ו-sendBeacon לא יכול לקבוע Content-Type
 * שנמנע מ-preflight.
 */
export function saveOnExit(week, code) {
  if (!endpoint || !session.token) return;
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'save', token: session.token, week, code }),
      keepalive: true,
    });
  } catch { /* הדף נסגר. אין למי לדווח */ }
}

/**
 * מזהה קבוע לדפדפן הזה, כדי שבגיליון יהיה "מחשב" ולא רק "תלמיד".
 * תלמידים מחליפים מקומות; התקלה שייכת למחשב.
 * ⚠️ אם בית הספר מוחק פרופילים בכל כניסה, המזהה יתחדש — ואז שם התלמיד
 *    והשעה הם מה שמאתר את המחשב.
 */
export function machineId() {
  try {
    let m = localStorage.getItem('fintech:machine');
    if (!m) {
      m = 'PC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem('fintech:machine', m);
    }
    return m;
  } catch { return 'PC-?'; }
}

/**
 * דיווח על מצב המחשב. ⚠️ **שגר ושכח:** לא מחכה, לא זורק, ולא נוגע
 * ב-health — דיווח שנכשל לא יציג לתלמיד "אין חיבור". ‏keepalive כדי
 * שדיווח כשל ישרוד גם אם התלמיד סוגר את הלשונית בתסכול.
 */
export function reportMachine(info) {
  if (!endpoint) return;
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'machine', token: session.token,
                             machine: machineId(), ua: navigator.userAgent,
                             ...info }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* דיווח בלבד */ }
}

// ══ תור השחזור ════════════════════════════════════════════════════════
//
// ⚠️ **הגשה שנכשלה הייתה נעלמת.** הקוד נשאר במחשב, אבל רישום ההגשה לא
//    הגיע לגיליון אלא אם התלמיד לחץ שוב — והוא לא תמיד שם לב. עכשיו
//    היא נכנסת לתור ונשלחת מאליה בטעינה הבאה או כשהחיבור חוזר.
// ⚠️ **התור נושא את מזהה התלמיד** ונשלח רק כשאותו תלמיד מחובר. אחרת
//    הגשה של תלמיד אחד הייתה נרשמת על שם מי שיושב אחריו במעבדה.
// ⚠️ האסימון **אינו** נשמר בתור: הוא פג אחרי 14 שעות, והתור נשלח עם
//    האסימון התקף של הרגע.
const QUEUE_KEY = 'fintech:queue';
const QUEUE_MAX = 40;

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function writeQueue(items) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-QUEUE_MAX))); }
  catch { /* אחסון חסום. אין מה לעשות מעבר לזה */ }
}

function enqueue(action, payload) {
  const id = session.student?.id ?? 'anon';
  const items = readQueue();
  // שמירה היא תמונת מצב, לא אירוע: אין טעם בשתי שמירות תקועות לאותו
  // שבוע. הגשות נשמרות כולן — כל אחת היא רגע שהתלמיד הצהיר עליו.
  const keep = action === 'save'
    ? items.filter((it) => !(it.action === 'save' && it.id === id &&
                             it.payload.week === payload.week))
    : items;
  keep.push({ action, payload, id, at: Date.now() });
  writeQueue(keep);
}

/** כמה פריטים ממתינים לתלמיד הנוכחי. מסך העבודה מציג את זה. */
export function pending() {
  const id = session.student?.id ?? 'anon';
  return readQueue().filter((it) => it.id === id).length;
}

/**
 * ⚠️ **אחד-אחד ובסדר.** שליחה מקבילה של חמש הגשות לאותו גיליון מתנגשת
 *    בנעילה של Apps Script, וגם הופכת את הסדר בעמודת הזמן.
 * ⚠️ פריט שנכשל **נשאר בתור**, והריצה נעצרת. אין טעם לנסות את הבא
 *    כשברור שהשרת לא זמין.
 */
export async function flushQueue() {
  if (!endpoint || !session.token) return 0;
  const id = session.student?.id ?? 'anon';
  let items = readQueue(), sent = 0;
  while (true) {
    const i = items.findIndex((it) => it.id === id);
    if (i === -1) break;
    const it = items[i];
    let ok = true;
    try {
      await call(it.action, { ...it.payload, token: session.token });
    } catch (err) {
      // ⚠️ אסימון פסול לא יתוקן בניסיון נוסף — הפריט היה נתקע לנצח
      //    וחוסם את התור. מוותרים עליו ומתקדמים.
      if (!/אסימון|פג תוקף/.test(err.message)) break;
      ok = false;
    }
    items = items.filter((x) => x !== it);
    writeQueue(items);
    // ⚠️ **נספר רק מה שבאמת הגיע.** פריט שנזרק בגלל אסימון פסול נספר
    //    פעם אחת כ"נשלח", והתלמיד קיבל "הכול אצלי" על הגשה שלא נרשמה.
    if (ok) sent++;
  }
  return sent;
}

export const api = {
  login: (name, code) => call('login', { name, code }),
  state: () => call('state', { token: session.token }),
  save: (week, code) => call('save', { token: session.token, week, code })
    .catch((err) => { enqueue('save', { week, code }); throw err; }),
  submit: (week, code, pass, total) =>
    call('submit', { token: session.token, week, code, pass, total })
      .catch((err) => { enqueue('submit', { week, code, pass, total }); throw err; }),
  chat: (week, message) =>
    call('chat', { token: session.token, week, message }, { timeout: 60000 }),
};
