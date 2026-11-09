// ‏layout.md §16 — הדלת. ההכרעה היחידה עליה היא כמה מעט היא עושה.
//
// §16.1 בורר תפקיד — תלמיד או מורה · §16.2 אין ניווט, המערכת יודעת
// לאן · §16.4 אין "זכור אותי", אין Google, אין "שכחת סיסמה"

import { api, session, call } from './api.js';

const $ = (id) => document.getElementById(id);
const form = $('login-form'), err = $('err'), go = $('go');

// ⚠️ **דלת חירום למחשב תקוע.** תלמיד שקם בלי לצאת משאיר אסימון, והשורה
//    הבאה מחזירה את הבא אחריו ישר לחשבון שלו — בלי דרך להגיע למסך הזה.
//    ‏login.html?switch=1 מנתק ונשאר כאן. שווה לכתוב על הלוח.
if (new URLSearchParams(location.search).has('switch')) {
  session.clear();
  try { sessionStorage.removeItem('fintech:boot'); } catch { /* חסום */ }
}

// כבר מחובר — §16.2: הכניסה אינה תפריט, היא המשך
// ⚠️ **זה חל על תלמיד בלבד.** מורה שניגש למחשב שתלמיד השאיר מחובר
//    ייזרק מכאן למסך העבודה שלו. שתי הדלתות הפתוחות לו: הקישור
//    הישיר ל-teacher.html, או login.html?switch=1 שמנתק ונשאר כאן.
if (session.token) location.replace('index.html');

// ── הבורר ────────────────────────────────────────────────────────────
const tabStudent = $('role-student'), tabTeacher = $('role-teacher');
const formTeacher = $('teacher-form');

function setRole(teacher) {
  tabStudent.setAttribute('aria-selected', String(!teacher));
  tabTeacher.setAttribute('aria-selected', String(teacher));
  form.hidden = teacher;
  formTeacher.hidden = !teacher;
  err.textContent = '';
  $('t-err').textContent = '';
  (teacher ? $('t-pass') : $('f-name')).focus();
}

tabStudent.addEventListener('click', () => setRole(false));
tabTeacher.addEventListener('click', () => setRole(true));

// חצים בין שתי הלשוניות, כמו בכל tablist
[tabStudent, tabTeacher].forEach((tab) => {
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const other = tab === tabStudent ? tabTeacher : tabStudent;
    other.focus();
    setRole(other === tabTeacher);
  });
});

// ── כניסת המורה ──────────────────────────────────────────────────────
// ⚠️ **האסימון נכתב ל-sessionStorage, ושם teacher.js מחפש אותו.** הוא
//    עולה עם אסימון קיים ישר לפאנל, ולכן אין כאן כפילות של שער —
//    ‏teacher.html נשאר דלת ישירה למי שמגיע אליה מהסימנייה.
formTeacher.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tErr = $('t-err'), tGo = $('t-go');
  tErr.textContent = '';
  tGo.disabled = true;
  tGo.textContent = 'בודק…';
  try {
    const res = await call('adminLogin', { password: $('t-pass').value });
    sessionStorage.setItem('fintech:admin', res.token);
    location.replace('teacher.html');
  } catch (e2) {
    tErr.textContent = e2.message;
    tGo.disabled = false;
    tGo.textContent = 'כניסה לפאנל';
    $('t-pass').select();
  }
});

// ── גילוי הקוד ────────────────────────────────────────────────────────
// ⚠️ **חוזר למוסתר בהגשה.** תלמיד שגילה, טעה, וקיבל שגיאה — הקוד שלו
//    נשאר על המסך בזמן שהוא קורא אותה, והשכן קורא איתו.
const code = $('f-code'), peek = $('peek'), slash = $('peek-slash');

function reveal(on) {
  code.type = on ? 'text' : 'password';
  slash.hidden = !on;
  peek.setAttribute('aria-pressed', String(on));
  peek.setAttribute('aria-label', on ? 'הסתר את הקוד' : 'הצג את הקוד');
}

peek.addEventListener('click', () => {
  reveal(code.type === 'password');
  code.focus();
});

function fail(message) {
  err.textContent = message;
  go.disabled = false;
  go.textContent = 'כניסה';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.textContent = '';
  reveal(false);                 // לא להשאיר קוד גלוי מול שגיאה
  go.disabled = true;
  go.textContent = 'מתחבר…';

  try {
    const res = await api.login($('f-name').value.trim(), $('f-code').value.trim());
    session.token = res.token;
    session.student = res.student;
    // המצב שהתקבל נשמר כדי שמסך העבודה לא יבקש אותו שוב מיד
    sessionStorage.setItem('fintech:boot', JSON.stringify(res.state));

    // §16.2 — הכניסה אינה תפריט, היא המשך. **המערכת יודעת לאן**,
    // ואיש לא בוחר: מי שטרם עבר קליטה הולך לשם, וזה קורה פעם אחת.
    location.replace(res.state.onboarded ? 'index.html' : 'onboarding.html');
  } catch (e2) {
    // הודעה מהשרת מוצגת כמות שהיא — כולל "השרת איטי מהרגיל", שכבר
    // מנוסח ב-api.js. רק כשל רשת אמיתי מקבל ניסוח משלו כאן.
    fail(/fetch|Failed|NetworkError/i.test(e2.message)
      ? 'אין חיבור לשרת. קרא למורה.'
      : e2.message);
  }
});
