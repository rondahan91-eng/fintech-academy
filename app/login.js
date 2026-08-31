// ‏layout.md §16 — הדלת. ההכרעה היחידה עליה היא כמה מעט היא עושה.
//
// §16.1 אין בורר תפקיד · §16.2 אין ניווט, המערכת יודעת לאן ·
// §16.4 אין "זכור אותי", אין Google, אין "שכחת סיסמה"

import { api, session } from './api.js';

const $ = (id) => document.getElementById(id);
const form = $('login-form'), err = $('err'), go = $('go');

// כבר מחובר — §16.2: הכניסה אינה תפריט, היא המשך
if (session.token) location.replace('index.html');

function fail(message) {
  err.textContent = message;
  go.disabled = false;
  go.textContent = 'כניסה';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.textContent = '';
  go.disabled = true;
  go.textContent = 'מתחבר…';

  try {
    const res = await api.login($('f-name').value.trim(), $('f-code').value.trim());
    session.token = res.token;
    session.student = res.student;
    // המצב שהתקבל נשמר כדי שמסך העבודה לא יבקש אותו שוב מיד
    sessionStorage.setItem('fintech:boot', JSON.stringify(res.state));
    location.replace('index.html');
  } catch (e2) {
    // הודעה מהשרת מוצגת כמות שהיא; תקלת רשת מקבלת ניסוח משלה
    fail(/fetch|Failed|NetworkError|abort/i.test(e2.message)
      ? 'אין חיבור לשרת. קרא למורה.'
      : e2.message);
  }
});
