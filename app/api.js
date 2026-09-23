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
const ENDPOINT = (globalThis.FINTECH_ENDPOINT || '').trim();

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
  if (!ENDPOINT) throw new Error('לא הוגדרה כתובת שרת ב-app/config.js');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(ENDPOINT, {
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
      setOnline(false, 'non-json');
      throw new Error('השרת החזיר תשובה לא צפויה. נסה שוב.');
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
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * שמירה אחרונה כשהדף נסגר. ‏keepalive מאפשר לבקשה לשרוד את סגירת
 * הדף — ‏fetch רגיל היה מבוטל, ו-sendBeacon לא יכול לקבוע Content-Type
 * שנמנע מ-preflight.
 */
export function saveOnExit(week, code) {
  if (!ENDPOINT || !session.token) return;
  try {
    fetch(ENDPOINT, {
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
  if (!ENDPOINT) return;
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'machine', token: session.token,
                             machine: machineId(), ua: navigator.userAgent,
                             ...info }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* דיווח בלבד */ }
}

export const api = {
  login: (name, code) => call('login', { name, code }),
  state: () => call('state', { token: session.token }),
  save: (week, code) => call('save', { token: session.token, week, code }),
  submit: (week, code, pass, total) =>
    call('submit', { token: session.token, week, code, pass, total }),
  chat: (week, message) =>
    call('chat', { token: session.token, week, message }, { timeout: 60000 }),
};
