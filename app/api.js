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
export async function call(action, payload = {}, { timeout = 20000 } = {}) {
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
    const data = await res.json();
    setOnline(true);
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    // ביטול מרצון אינו נפילת שרת
    if (err.name !== 'AbortError' && !/^(שם|קוד|הודעה|אסימון|פג|החשבון|לא הוגדר)/.test(err.message)) {
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

export const api = {
  login: (name, code) => call('login', { name, code }),
  state: () => call('state', { token: session.token }),
  save: (week, code) => call('save', { token: session.token, week, code }),
  submit: (week, code, pass, total) =>
    call('submit', { token: session.token, week, code, pass, total }),
  chat: (week, message) =>
    call('chat', { token: session.token, week, message }, { timeout: 60000 }),
};
