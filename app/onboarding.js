// ══════════════════════════════════════════════════════════════════════
//  שיחת הקליטה · layout.md §10 · content/_shared/onboarding.yml
//
//  **רצה פעם אחת בחיים.** ארבעה שלבים, שש שאלות מדידה, ואז המשימה.
//
//  ⚠️ המסך לא מנהל את השיחה — **אלעד מנהל אותה.** ‏onboarding.yml הוא
//     תדריך ולא תסריט, ולכן כאן אין רשימת שאלות ואין לוגיקת שלבים.
//     הלקוח מציג טקסט, שולח טקסט, ומסמן את השלב שהשרת החזיר.
// ══════════════════════════════════════════════════════════════════════

import { call, session } from './api.js';

if (!session.token) location.replace('login.html');

const $ = (id) => document.getElementById(id);
const el = {
  hist: $('ob-history'), form: $('ob-form'), text: $('ob-text'),
  send: $('ob-send'), avatar: $('ob-avatar'), img: $('ob-img'),
  steps: [...document.querySelectorAll('.ob-step')],
};

const STAGES = ['arrival', 'role', 'baseline', 'handoff'];
let lastSpeaker = null;

// ── האווטאר ───────────────────────────────────────────────────────────
// המסגור המלא של §10.2 — talk/ ולא panel/. שם הראש 26% מהגובה
// והמחוות שלמות; ‏panel/ הוא חיתוך לרוחב למסך העבודה.
function setAvatar(state) {
  el.avatar.dataset.state = state;
  el.img.src = `../assets/persona/talk/elad-${state}.png`;
}
el.img.addEventListener('load', () => { el.img.hidden = false; });
el.img.addEventListener('error', () => { el.img.hidden = true; });
setAvatar('neutral');

// ── ההתקדמות ──────────────────────────────────────────────────────────
// ⚠️ **בלי מונה "3 מתוך 6".** ‏never_judge קובע שהתלמיד לא ירגיש
//    שנבחן, ומונה שאלות הוא בדיוק תחושת המבחן.
function setStage(stage) {
  const i = STAGES.indexOf(stage);
  el.steps.forEach((s, n) => {
    s.classList.toggle('is-done', i > -1 && n < i);
    s.classList.toggle('is-now', n === i);
  });
}

// ── השיחה ─────────────────────────────────────────────────────────────
function say(text, who = 'אלעד') {
  const wrap = document.createElement('div');
  wrap.className = who === 'אתה' ? 'ob-msg me' : 'ob-msg';
  if (who !== lastSpeaker) {
    const n = document.createElement('div');
    n.className = 'who';
    n.textContent = who;
    wrap.append(n);
    lastSpeaker = who;
  }
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;              // ולא innerHTML — התלמיד מקליד לכאן
  wrap.append(b);
  el.hist.append(wrap);
  el.hist.scrollTop = el.hist.scrollHeight;
}

function typing(on) {
  const old = $('ob-typing');
  if (old) old.remove();
  if (!on) return;
  const d = document.createElement('div');
  d.className = 'ob-msg';
  d.id = 'ob-typing';
  d.innerHTML = '<div class="bubble ob-typing"><i></i><i></i><i></i></div>';
  el.hist.append(d);
  el.hist.scrollTop = el.hist.scrollHeight;
}

function ready(on) {
  el.text.disabled = el.send.disabled = !on;
  if (on) el.text.focus();
}

async function turn(message) {
  typing(true);
  ready(false);
  try {
    const r = await call('onboard', { token: session.token, message },
                         { timeout: 60000 });
    typing(false);
    if (r.avatar) setAvatar(r.avatar);
    if (r.stage) setStage(r.stage);
    say(r.say);

    if (r.done) {
      // §10.3 — הופעת הסרגל היא בעצמה הרגע שבו העבודה מתחילה
      ready(false);
      el.text.placeholder = 'פותח את המשימה…';
      setTimeout(() => location.replace('index.html'), 2500);
      return;
    }
    ready(true);
  } catch (err) {
    typing(false);
    say(/fetch|Failed|NetworkError|abort/i.test(err.message)
      ? 'משהו ברשת נתקע. תנסה לשלוח שוב, ואם זה חוזר — קרא למורה.'
      : err.message);
    ready(true);
  }
}

el.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const t = el.text.value.trim();
  if (!t) return;
  say(t, 'אתה');
  el.text.value = '';
  turn(t);
});

// ── פתיחה, או המשך ────────────────────────────────────────────────────
// ‏SPEC §11.1: מושב שנקטע חוזר מנקודת העצירה, **כולל כל מה שנאמר.**
// התלמיד שסגר את הדפדפן באמצע לא מתחיל מהתחלה.
(async () => {
  try {
    const { state } = await call('state', { token: session.token });
    if (state.onboarded) { location.replace('index.html'); return; }

    const turns = state.onboardTurns || [];
    if (turns.length) {
      turns.forEach((t) => say(t.text, t.role === 'elad' ? 'אלעד' : 'אתה'));
      ready(true);
      return;
    }
  } catch { /* אין שרת — ננסה בכל זאת לפתוח */ }
  turn('');                          // הודעה ריקה = אלעד פותח
})();
