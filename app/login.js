// ‏layout.md §16 — הדלת. ההכרעה היחידה עליה היא כמה מעט היא עושה.
//
// §16.1 אין בורר תפקיד · §16.2 אין ניווט, המערכת יודעת לאן ·
// §16.4 אין "זכור אותי", אין Google, אין "שכחת סיסמה"

import { api, session } from './api.js';

const $ = (id) => document.getElementById(id);
const form = $('login-form'), err = $('err'), go = $('go');

// כבר מחובר — §16.2: הכניסה אינה תפריט, היא המשך
if (session.token) location.replace('index.html');

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
