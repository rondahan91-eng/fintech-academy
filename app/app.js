// ══════════════════════════════════════════════════════════════════════
//  FinTech Academy · פרוסה אנכית של שבוע 1
//
//  מה יש כאן:  Pyodide · עורך · הרצה · בדיקות גלויות · פאנל אלעד
//  מה אין:     LLM · שרת · הגשה · חנות · ציונים · שאר 29 השבועות
//
//  ‏Pyodide נטען מ-vendor/pyodide/ המקומי. אפס תלות ברשת חיצונית.
//     ‏עדכון גרסה = החלפת חמשת הקבצים שם + שינוי המספר ב-README.
// ══════════════════════════════════════════════════════════════════════

import { WEEK } from './content.js';
import { api, session, health, onHealthChange, saveOnExit } from './api.js';

// §16.2 — הכניסה אינה תפריט, היא המשך. בלי אסימון אין מסך עבודה.
if (!session.token) location.replace('login.html');

// ⚠️ **כבוי אצל תלמידים.** התלמיד ראה קופסה שחורה עם מספרים בפינה
//    ולא ידע מה היא. נדלק רק עם ‏?debug=1 בכתובת.
//
//    ⚠️ **ומוגדר כאן ולא ליד probe().** הוא נקרא מ-setResults בשורה
//       456, ו-const בסוף הקובץ הוא אזור מת זמני — ReferenceError
//       שמפיל את כל המודול.
const DEBUG = new URLSearchParams(location.search).has('debug');

const $ = (id) => document.getElementById(id);

const el = {
  chat: $('chat'), chatForm: $('chat-form'), chatText: $('chat-text'),
  code: $('code'), gutter: $('gutter'), saved: $('saved'),
  handle: $('handle'), results: $('results'),
  rbTests: $('rb-tests'), rbOut: $('rb-out'), rhint: $('rhint'),
  testsCount: $('tests-count'),
  btnRun: $('btn-run'), btnTests: $('btn-tests'),
  btnReset: $('btn-reset'), btnSubmit: $('btn-submit'),
  taskTitle: $('task-title'), taskBody: $('task-body'),
  tbWeek: $('tb-week'), probe: $('probe'),
  avatar: $('avatar'), avatarImg: $('avatar-img'),
  avatarFallback: $('avatar-fallback'), avatarNote: $('avatar-note'),
  mirror: $('mirror'), starterView: $('starter-view'),
  btnFocus: $('btn-focus'), focusLabel: $('focus-label'), focusPip: $('focus-pip'),
};

// כל טקסט שמגיע מהתלמיד או מקובץ תוכן עובר כאן לפני innerHTML.
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ⚠️ **המפתח חייב לשאת את מזהה התלמיד.** הגרסה הקודמת הייתה
//    `fintech:week-1:code` — גלובלי. במעבדה עם פרופיל Chrome משותף
//    התלמיד של שיעור שלישי היה פותח ורואה את הקוד של השיעור השני,
//    מתחיל לערוך, והשמירה האוטומטית הייתה דורסת אותו לתמיד.
const STORE = `fintech:${session.student?.id ?? 'anon'}:week-${WEEK.week}:code`;

// ⚠️ **כל גישה ל-localStorage עטופה.** מדיניות ארגונית שחוסמת אחסון
//    אתרים גורמת ל-getItem לזרוק — והמודול היה מת בשורה הזאת, לפני
//    שנרשם ולו מאזין אחד. המסך היה נראה תקין ולא מגיב לכלום.
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
};

// ══ המשימה · עמודה ימנית ══════════════════════════════════════════════

el.tbWeek.textContent = `שבוע ${WEEK.week}`;
el.taskTitle.textContent = WEEK.title;

el.taskBody.innerHTML = WEEK.requirements.map((sec) => `
  <h2>${esc(sec.section)}</h2>
  ${sec.items.map((it) => `
    <div class="req"><span>${esc(it.label)}</span><b dir="auto">${esc(it.value)}</b></div>
  `).join('')}
`).join('');

// ══ האווטאר ═══════════════════════════════════════════════════════════
// המצבים מגיעים מ-assets/persona/manifest.yml דרך סקריפט הבנייה.
// **נטען מ-panel/ ולא מהמקור** — המקורות הם פריים רחב 2816×1536 שבו
// הראש היה יוצא בגודל 40 פיקסלים. ‏tools/crop_persona.py מנרמל אותם.

const AVATAR_DIR = '../assets/persona/panel';
const AVATARS = new Map((WEEK.avatars || []).map((a) => [a.id, a.file]));
const AVATAR_DEFAULT = (WEEK.avatars || []).find((a) => a.default)?.id ?? 'neutral';

function setAvatar(state) {
  const file = AVATARS.get(state) ?? AVATARS.get(AVATAR_DEFAULT);
  if (!file) return;
  el.avatar.dataset.state = state;
  el.avatarImg.src = `${AVATAR_DIR}/${file}`;
}

el.avatarImg.addEventListener('load', () => {
  el.avatarImg.hidden = false;
  el.avatarFallback.hidden = true;
  el.avatarNote.textContent = '';
});
el.avatarImg.addEventListener('error', () => {
  el.avatarImg.hidden = true;
  el.avatarFallback.hidden = false;
  el.avatarNote.textContent =
    `חסר: ${AVATAR_DIR}/${AVATARS.get(el.avatar.dataset.state) ?? '?'}\n` +
    `הרץ  py tools/crop_persona.py`;
});

setAvatar('presenting');   // מסירת המשימה — manifest.yml → presenting.use_for

// בפרוסה אין מודל שיבחר מצב, ואי אפשר לאמת "הראש לא קופץ" בלי להחליף.
// לחיצה על האווטאר עוברת למצב הבא. **כלי פיתוח — יורד עם ה-stub.**
el.avatar.addEventListener('click', () => {
  const ids = [...AVATARS.keys()];
  const next = ids[(ids.indexOf(el.avatar.dataset.state) + 1) % ids.length];
  setAvatar(next);
  el.avatarNote.textContent = next;
});

// ══ אלעד ══════════════════════════════════════════════════════════════
// בפרוסה אין LLM. הטקסט כאן הוא **stub** שמחזיק את המקום ומראה את
// הפריסה. בייצור הוא נוצר מ-manager.yml + persona.yml דרך המודל.

// הודעת הפתיחה נאמרת פעם אחת, כשאין עדיין שיחה. משם והלאה אלעד עונה
// מהשרת, שמחזיק את הפרומפט ואת המפתח. **המפתח לעולם לא מגיע לכאן.**
const OPENING = [
  'הכרטיס והתלוש. שני חלקים, ובכל אחד כמה שורות — כל פרט בשורה משלו.',
  'את הנטו אתה מחשב בעצמך ומקליד. בשבוע 4 המחשב יעשה את זה במקומך.',
  'תתחיל. נדבר תוך כדי.',
];

// השם מופיע רק כשהדובר מתחלף. שלוש הודעות רצופות של אלעד עם השם שלו
// מעל כל אחת קוראות כשלושה אנשים, ובפאנל של 344 זה גם בזבוז שליש.
let lastSpeaker = null;

function say(text, who = 'אלעד') {
  if (who !== lastSpeaker) {
    const name = document.createElement('div');
    name.className = 'who';
    name.textContent = who;
    el.chat.append(name);
    lastSpeaker = who;
  }
  const bubble = document.createElement('div');
  bubble.className = who === 'אתה' ? 'bubble me' : 'bubble';
  bubble.textContent = text;               // ולא innerHTML — התלמיד מקליד לכאן
  el.chat.append(bubble);
  el.chat.scrollTop = el.chat.scrollHeight;

  // אלעד דיבר והפאנל מקופל — נקודה על הכפתור. לא מודאל, לא צליל.
  if (who === 'אלעד' && document.body.classList.contains('focus')) {
    el.focusPip.hidden = false;
  }
}

el.chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = el.chatText.value.trim();
  if (!t) return;
  say(t, 'אתה');
  el.chatText.value = '';

  const input = el.chatText;
  input.disabled = true;
  input.placeholder = 'אלעד כותב…';
  setAvatar('thinking');
  try {
    const { reply } = await api.chat(WEEK.week, t);
    say(reply);
    setAvatar('neutral');
  } catch (err) {
    // ההודעה של התלמיד כבר על המסך. לא מוחקים אותה ולא מעמידים פנים.
    say(/fetch|Failed|NetworkError|abort/i.test(err.message)
      ? 'אין לי חיבור כרגע. תמשיך לעבוד — הקוד שלך נשמר. קרא למורה אם זה נמשך.'
      : err.message);
    setAvatar('concerned');
  } finally {
    input.disabled = false;
    input.placeholder = 'כתוב לאלעד…';
    input.focus();
  }
});

// ══ אתחול · מקומי קודם, שרת אחר כך ════════════════════════════════════
//
// **הכלל: מה שיש במחשב הזה מנצח.** התלמיד יכול היה להקליד כאן דקה
// לפני שהרשת נפלה, ולמשוך מהשרת אחרי זה היה דורס את זה. השרת נכנס
// רק כשאין כלום מקומית — וזה בדיוק המקרה של מחשב חדש, שהוא הסיבה
// שיש שרת מלכתחילה.

function takeBoot() {
  try {
    const raw = sessionStorage.getItem('fintech:boot');
    if (!raw) return null;
    sessionStorage.removeItem('fintech:boot');
    return JSON.parse(raw);
  } catch { return null; }
}

function restoreChat(turns) {
  turns.forEach((t) => say(String(t.text), t.role === 'elad' ? 'אלעד' : 'אתה'));
}

function applyState(state, { force = false } = {}) {
  if (!state) return false;
  const localCode = store.get(STORE);
  if (state.code && (force || !localCode)) {
    el.code.value = state.code;
    store.set(STORE, state.code);
    drawGutter();
  }
  if (state.chat && state.chat.length && !el.chat.children.length) {
    restoreChat(state.chat);
    return true;
  }
  return false;
}

// ‏bootState ולא boot — ‏boot() היא כבר פונקציית העלייה של Pyodide
const bootState = takeBoot();
el.code.value = store.get(STORE) ?? (bootState && bootState.code) ?? WEEK.starter;

const student = session.student;
if (student && student.name) {
  const chip = document.createElement('span');
  chip.className = 'tb';
  chip.textContent = student.name;
  el.tbWeek.after(chip, Object.assign(document.createElement('span'), { className: 'sep' }));
}

if (!(bootState && applyState(bootState))) OPENING.forEach((t) => say(t));

// מחשב חדש בלי היסטוריה מקומית — מושכים מהשרת
if (!bootState) {
  api.state()
    .then(({ state }) => {
      // סימנייה ישירה למסך העבודה לא מדלגת על הקליטה
      if (!state.onboarded) { location.replace('onboarding.html'); return; }
      applyState(state);
    })
    .catch(() => { /* השרת אופציונלי. הבאנר כבר יודיע */ });
}

// ══ העורך ═════════════════════════════════════════════════════════════

// ── מונה השורות ───────────────────────────────────────────────────────
// שורה לוגית אחת יכולה לתפוס כמה שורות מסך: §2 קובע ששבירת שורות
// מופעלת מתחת ל-1220. ‏1..N נאיבי היה מוצג מוסט כלפי מעלה מהשורה 20
// והלאה בדיוק במסכים הצרים. המראה מודדת, ומספר מקבל את הרווח שלו.
function drawGutter() {
  const lines = el.code.value.split('\n');

  el.mirror.style.width = `${el.code.clientWidth}px`;
  el.mirror.textContent = '';
  const probes = lines.map((ln) => {
    const d = document.createElement('div');
    d.textContent = ln || ' ';     // שורה ריקה עדיין תופסת שורה אחת
    el.mirror.append(d);
    return d;
  });

  const lh = parseFloat(getComputedStyle(el.code).lineHeight);
  let out = '';
  probes.forEach((d, i) => {
    const rows = Math.max(1, Math.round(d.offsetHeight / lh));
    out += `${i + 1}${'\n'.repeat(rows)}`;
  });
  el.gutter.textContent = out;
  el.gutter.scrollTop = el.code.scrollTop;
}

// ── שמירה ─────────────────────────────────────────────────────────────
// ⚠️ ‏saveNow חייב לקרוא את el.code.value **ברגע הקריאה**. טיימר שנשאר
//    תלוי אחרי שהערך הוחלף היה כותב את הערך החדש על העבודה של התלמיד.
let saveTimer;
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = undefined;
  // ⚠️ QuotaExceededError היה משאיר את הסטטוס על "שומר…" לנצח,
  //    והתלמיד היה מאמין שהעבודה נשמרת.
  el.saved.textContent = store.set(STORE, el.code.value)
    ? 'נשמר אוטומטית' : '⚠ לא נשמר במחשב';
  dirty = true;
}

// ── סנכרון לשרת ───────────────────────────────────────────────────────
//
// ⚠️ **לא על כל הקשה.** שלושים תלמידים שכותבים בו-זמנית היו מייצרים
//    מאות קריאות בדקה, ו-Apps Script מגביל הרצות מקבילות הרבה לפני
//    שהגיליון נחנק. מקומי הוא רציף; השרת מקבל תמונת מצב כל 30 שניות,
//    וגם ביציאה מהעורך ובהגשה.
let dirty = false;

async function pushToServer() {
  if (!dirty) return;
  const code = el.code.value;
  try {
    await api.save(WEEK.week, code);
    dirty = false;
  } catch { /* נשאר dirty, ננסה בסבב הבא */ }
}

setInterval(pushToServer, 30000);
el.code.addEventListener('blur', pushToServer);
addEventListener('pagehide', () => { if (dirty) saveOnExit(WEEK.week, el.code.value); });

el.code.addEventListener('input', () => {
  drawGutter();
  el.saved.textContent = 'שומר…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
});
el.code.addEventListener('blur', () => { if (saveTimer) saveNow(); });
addEventListener('pagehide', () => { if (saveTimer) saveNow(); });

el.code.addEventListener('scroll', () => { el.gutter.scrollTop = el.code.scrollTop; });
addEventListener('resize', drawGutter);     // שינוי רוחב משנה את השבירה

// ‏Tab מזיז פוקוס בדפדפן. בעורך הוא צריך להזיח. ‏4 רווחים — PEP 8.
//
// ⚠️ הגרסה הראשונה כתבה ארבעה רווחים **במקום** הבחירה. תלמיד שסימן
//    שלוש שורות והקיש Tab כדי להזיח אותן — איבד אותן. משבוע 6 יש
//    לולאות, וזו הפעולה הכי שגרתית בעורך.
//
// ‏execCommand ולא השמה ישירה ל-value: השמה מוחקת את מחסנית הביטול
// של הדפדפן, כלומר Ctrl+Z מפסיק לעבוד אחרי כל הזחה.
const UNIT = '    ';

el.code.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || el.code.readOnly) return;
  e.preventDefault();

  const { selectionStart: s, selectionEnd: t, value: v } = el.code;

  if (s === t && !e.shiftKey) {              // אין בחירה — פשוט מזיחים
    document.execCommand('insertText', false, UNIT);
    return;
  }

  // בחירה, או Shift — פועלים על כל שורה שהבחירה נוגעת בה
  const from = v.lastIndexOf('\n', s - 1) + 1;
  const toNl = v.indexOf('\n', t === s ? t : t - 1);
  const to = toNl === -1 ? v.length : toNl;

  const lines = v.slice(from, to).split('\n');
  const next = e.shiftKey
    ? lines.map((ln) => ln.replace(/^ {1,4}/, ''))
    : lines.map((ln) => (ln.trim() ? UNIT + ln : ln));

  el.code.setSelectionRange(from, to);
  document.execCommand('insertText', false, next.join('\n'));
  el.code.setSelectionRange(from, from + next.join('\n').length);
});

drawGutter();

// ══ מסך מלא לעריכה ════════════════════════════════════════════════════
// ‏§3 קובע שאלעד אינו מתקפל ושהמשימה גלויה תמיד, **וזה נשאר ברירת
// המחדל.** ההבדל הוא מי מקפל: קיפול אוטומטי מסתיר מהתלמיד דברים
// שהוא לא ביקש להסתיר; קיפול יזום הוא בחירה שלו, והוא יודע לבטל.
//
// ⚠️ ואלעד הוא ערוץ ההוראה (SPEC §7). להסתיר אותו בלי סימן פירושו
//    שתלמיד יפספס הסבר. לכן הכפתור נושא נקודה כשנאמר משהו בזמן קיפול.
const FOCUS_KEY = 'fintech:focus';
let focused = false;

function setFocus(on) {
  focused = on;
  document.body.classList.toggle('focus', on);
  el.focusLabel.textContent = on ? '⤡ יציאה · Esc' : '⤢ מסך מלא';
  el.btnFocus.title = on ? 'חזרה לתצוגה מלאה (Esc)' : 'מסך מלא לעריכה';
  if (!on) el.focusPip.hidden = true;
  store.set(FOCUS_KEY, on ? '1' : '');
  drawGutter();          // הרוחב השתנה — השבירה, ולכן גם מונה השורות
  probe();
}

el.btnFocus.addEventListener('click', () => setFocus(!focused));

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && focused) { setFocus(false); el.code.focus(); }
});

if (store.get(FOCUS_KEY)) setFocus(true);

el.btnReset.addEventListener('click', () => {
  if (!confirm('לאפס לקוד הפתיחה? מה שכתבת יימחק.')) return;
  el.code.value = WEEK.starter;
  saveNow();
  drawGutter();
});

// ══ טאבים ═════════════════════════════════════════════════════════════

function showTab(which) {
  document.querySelectorAll('.rtab').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.rtab === which));
  el.rbTests.hidden = which !== 'tests';
  el.rbOut.hidden = which !== 'out';
}
document.querySelectorAll('.rtab').forEach((b) =>
  b.addEventListener('click', () => {
    showTab(b.dataset.rtab);
    if (isCollapsed()) setResults(lastOpenH);   // הרצועה היא גם הידית
  }));
// הרמז עצמו לחיץ — הוא זה שאומר "לחץ לפתיחה"
el.rhint.addEventListener('click', () => {
  if (isCollapsed()) setResults(lastOpenH);
});
showTab('tests');

// ⚠️ הטאב **אינו נוגע** ב-textarea. הגרסה הקודמת דרסה את הערך שלו
//    ושמה readOnly בלי שום סימן על המסך — התלמיד ראה קוד, הקליד,
//    ושום דבר לא קרה. וגרוע מזה: טיימר שמירה תלוי היה כותב את קוד
//    הפתיחה על העבודה שלו. קוד הפתיחה מקבל משטח משלו.
document.querySelectorAll('.tab').forEach((b) =>
  b.addEventListener('click', () => {
    const starter = b.dataset.tab === 'starter';
    document.querySelectorAll('.tab').forEach((x) =>
      x.classList.toggle('is-active', x === b));
    el.starterView.textContent = starter ? WEEK.starter : '';
    el.starterView.hidden = !starter;
    el.saved.textContent = starter ? 'לקריאה בלבד' : 'נשמר אוטומטית';
    if (!starter) el.code.focus();
  }));

// ══ הידית · 196–376 ═══════════════════════════════════════════════════

// ‏R_TAB — רצועת הטאבים בלבד: 36 של הרצועה + 1 הגבול שלה + 1 הגבול
// התחתון של .results. פחות מזה, והרצועה עצמה נחתכת.
// ‏R_TAB היא הרצפה **תמיד**, גם אחרי שנפתח. ‏R_MIN הוא ברירת המחדל
// שאליה נפתחים, לא גבול תחתון.
//
// ⚠️ גרסה קודמת העלתה את הרצפה ל-196 ברגע שהיה מה להראות, ומאותו
//    רגע התלמיד לא יכול היה להחזיר את האזור לרצועה. **במסך מלא זה
//    בדיוק הפוך מהכוונה** — מי שביקש את כל הרוחב לעריכה רוצה גם את
//    כל הגובה. המיקום הוא של התלמיד, ולכן גם הקיפול.
const R_TAB = 38, R_FLOOR = 76, R_MIN = 196, R_MAX = 376;
let resultsH = R_TAB, opened = false, autoOpened = false;
let lastOpenH = R_MIN;                 // לאן לחזור כשפותחים מחדש

const isCollapsed = () => resultsH <= R_TAB;

function setResults(h) {
  const v = Math.round(h);
  // מתחת ל-76 אין מה להציג בכל מקרה — נצמד לרצועה במקום להשאיר חריץ
  resultsH = v < R_FLOOR ? R_TAB : Math.max(R_FLOOR, Math.min(R_MAX, v));
  if (resultsH > R_TAB) lastOpenH = resultsH;
  el.results.style.height = `${resultsH}px`;
  el.results.classList.toggle('is-collapsed', isCollapsed());
  if (!isCollapsed()) markFresh(false);
  probe();
}

function openResults() {
  if (opened) return;
  opened = true;
  setResults(R_MIN);
}

// פלט חדש נכתב בזמן שהאזור מקופל. **לא פותחים בכוח** — המיקום שלו.
// אבל הוא חייב לדעת שיש שם משהו, אחרת "הרצה" נראית כאילו לא עשתה כלום.
function markFresh(on) {
  el.results.classList.toggle('has-fresh', on);
  el.rhint.textContent = on
    ? 'יש פלט חדש — לחץ לפתיחה'
    : 'הרצה → פלט · בדיקות → בדיקות';
}

setResults(R_TAB);

let dragging = null;
el.handle.addEventListener('pointerdown', (e) => {
  dragging = { y: e.clientY, h: resultsH };
  el.handle.setPointerCapture(e.pointerId);
});
el.handle.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  opened = true;              // גרירה פותחת גם לפני ההרצה הראשונה
  setResults(dragging.h - (e.clientY - dragging.y));  // גרירה למעלה = הגדלה
  autoOpened = true;                                  // התלמיד בחר — לא נתערב
});
el.handle.addEventListener('pointerup', () => { dragging = null; });
el.handle.addEventListener('keydown', (e) => {
  const step = { ArrowUp: 24, ArrowDown: -24 }[e.key];
  if (step === undefined) return;
  e.preventDefault();
  opened = true;
  setResults(resultsH + step);
  autoOpened = true;
});

// פתיחה אוטומטית **פעם אחת בלבד**, ו-§2 מדייק מתי: "בפעם הראשונה
// שפלט חורג מהאזור... עד לגובה שמכיל את הפלט או עד 376, הנמוך מביניהם."
//
// ⚠️ הגרסה הראשונה קפצה ל-300 קבוע על כל כישלון — גם על שתי שורות
//    שנכנסו ממילא ב-196, וגזלה חמש שורות קוד בלי סיבה. **התנאי הוא
//    חריגה, לא כישלון**, והגובה נמדד ולא נבחר.
function openOnce() {
  if (autoOpened) return;
  const body = el.rbOut.hidden ? el.rbTests : el.rbOut;
  const overflow = body.scrollHeight - body.clientHeight;
  if (overflow <= 0) return;                 // נכנס — לא נוגעים, ולא שורפים
  autoOpened = true;
  setResults(resultsH + overflow);           // ‏setResults תוחמת ל-376
}

// ══ Pyodide ═══════════════════════════════════════════════════════════

// שם הקובץ הפיקטיבי נשאר לטיני בכוונה — הודעת השגיאה היא בלוק LTR,
// ושם עברי בתוכה מתהפך ומבלבל. ‏expected_friction של שבוע 1 מזהיר מזה.
const HARNESS = `
import sys, io, json, time, traceback

FILE = "your_code.py"

def _fintech_error(e):
    """שורה + סוג + הודעה. בלי מסגרות של המנוע — התלמיד לא כתב אותן."""
    if isinstance(e, SyntaxError):
        caret = "\\n    " + e.text.strip() if e.text else ""
        return f'File "{FILE}", line {e.lineno}{caret}\\n{type(e).__name__}: {e.msg}'
    tb, line = e.__traceback__, None
    while tb:
        if tb.tb_frame.f_code.co_filename == FILE:
            line = tb.tb_lineno
        tb = tb.tb_next
    head = f'File "{FILE}", line {line}\\n' if line else ""
    return f'{head}{type(e).__name__}: {e}'

# ⚠️ **לולאה אינsופית מקפיאה את הלשונית לצמיתות.** הקוד רץ על החוט
#    הראשי, ולכן while True: מביא את Chrome ל-"הדף אינו מגיב", התלמיד
#    לוחץ "המתן" כי זה הכפתור המרגיע, והלשונית אבודה.
#    בשבוע 1 אין לולאות; **משבוע 6 זה כמעט ודאי בכל שיעור.**
#    ‏settrace עולה בערך פי 2 בזמן ריצה, וזה לא משנה למשימות האלה.
LIMIT_SECONDS = 5
OUTPUT_CAP = 200000

class _Capped(io.StringIO):
    """‏while True: print(x) היה מנפח זיכרון עד שהלשונית נהרגת."""
    def write(self, s):
        if self.tell() > OUTPUT_CAP:
            raise KeyboardInterrupt(
                "התוכנית הדפיסה יותר מדי והופסקה. אולי יש לולאה שלא נגמרת?")
        return io.StringIO.write(self, s)

def _deadline_tracer(deadline):
    def local(frame, event, arg):
        if time.monotonic() > deadline:
            raise KeyboardInterrupt(
                "הקוד רץ יותר מ-%d שניות והופסק. אולי יש לולאה אינסופית?"
                % LIMIT_SECONDS)
        return local
    def top(frame, event, arg):
        return local
    return top

def _fintech_run(src, tests_src):
    buf, old = _Capped(), sys.stdout
    sys.stdout = buf
    ns, err = {"__name__": "__main__"}, None
    try:
        sys.settrace(_deadline_tracer(time.monotonic() + LIMIT_SECONDS))
        exec(compile(src, FILE, "exec"), ns)
    except BaseException as e:
        err = _fintech_error(e)
    finally:
        sys.settrace(None)
        sys.stdout = old

    out = buf.getvalue()
    res = {"output": out, "error": err, "tests": []}
    if tests_src is None:
        return json.dumps(res, ensure_ascii=False)

    g = {"OUTPUT": out, "LINES": out.split(chr(10)),
         "VARS": {k: v for k, v in ns.items() if not k.startswith("__")}}
    exec(compile(tests_src, "בדיקות", "exec"), g)

    for name, fn in list(g.items()):
        if not (name.startswith("test_") and callable(fn)):
            continue
        row = {"name": name, "label": (fn.__doc__ or name).strip(), "ok": True, "why": ""}
        try:
            fn()
        except AssertionError as e:
            row["ok"], row["why"] = False, str(e)
        except BaseException as e:
            row["ok"], row["why"] = False, f"{type(e).__name__}: {e}"
        res["tests"].append(row)
    return json.dumps(res, ensure_ascii=False)
`;

let py = null;

// ⚠️ **עלייה שנכשלת חייבת להגיד את זה.** בלי ה-catch, כל תקלה — קובץ
//    vendor חסר, ‏MIME שגוי שחוסם את המודול, זיכרון — משאירה את
//    הכפתורים מנוטרלים ואת הרמז על "טוען את פייתון…" **לנצח.**
//    שלושים תלמידים אומרים למורה "זה עוד נטען", ואי אפשר להבחין בין
//    איטי למת. **קוד השגיאה הוא העיקר** — הוא מה שמאפשר למורה לאבחן
//    מקדמת הכיתה במקום ללכת ממסך למסך.
// שורה אחת שהמורה יכול להקריא בטלפון. בלי זה "זה לא עובד" הוא כל המידע
// שמגיע אליו משלושים מחשבים, והאבחון נעשה בניחוש.
// ‏machine-check.js הוא מקור האמת; זו רק נפילה לאחור אם התג לא נטען.
function diagLine() {
  if (window.MachineCheck) { try { return window.MachineCheck.line(); } catch (e) {} }
  const ua = navigator.userAgent || '';
  const m = ua.match(/(Edg|Chrome|Firefox|Safari)\/(\d+)/);
  return (m ? `${m[1]} ${m[2]}` : 'דפדפן לא מזוהה') +
         ' · wasm:' + (typeof WebAssembly === 'object' ? 'יש' : 'אין');
}

// ⚠️ **"PYO-2: WebAssembly.instantiate(): Out of memory" לא אומר כלום
//    למורה.** כשהעלייה נכשלת, הבדיקה רצה מאליה ומחליפה את השגיאה
//    הגולמית בסיבה ובפעולה: דפדפן ישן · wasm חסום · סינון שקטע קובץ ·
//    זיכרון. זה ההבדל בין "קרא למורה" לבין "עבור למחשב אחר".
function diagnose(code, err) {
  const tail = (title, detail) => {
    el.rbOut.textContent = el.rbOut.textContent.replace(
      /מחפש את הסיבה…$/, `${title}\n${detail}`);
  };
  if (!window.MachineCheck) {
    tail('אבחון מלא: פתח את check.html מאותה כתובת.', '');
    return;
  }
  try {
    window.MachineCheck.full('vendor/pyodide/', (d) => {
      tail(d.title, `${d.detail}\n\nקוד: ${code} · ${d.code}`);
    });
  } catch (e) {
    tail('אבחון מלא: פתח את check.html מאותה כתובת.', '');
  }
}

async function boot() {
  el.btnRun.disabled = el.btnTests.disabled = true;
  el.rhint.textContent = 'טוען את פייתון…';
  try {
    if (typeof loadPyodide !== 'function') throw new Error('הקובץ vendor/pyodide/pyodide.js לא נטען');
    // ‏indexURL מוחלט ביחס לעמוד — משם Pyodide שולף בעצמו את
    // ‏pyodide.asm.js · pyodide.asm.wasm · python_stdlib.zip · pyodide-lock.json.
    // ‏חייב להסתיים בלוכסן.
    py = await loadPyodide({
      indexURL: new URL('vendor/pyodide/', document.baseURI).href,
      stdin: () => '',
    });
    py.runPython(HARNESS);
  } catch (err) {
    const code = typeof loadPyodide !== 'function' ? 'PYO-1' : 'PYO-2';
    el.rhint.textContent = `פייתון לא נטען · ${code}`;
    // ⚠️ **הנוסח הקודם גרם למורה להתקין פייתון על מחשבי הכיתה.**
    //    "פייתון לא עלה במחשב הזה" נקרא בדיוק כמו "פייתון לא מותקן כאן".
    //    פייתון רץ **בתוך הדפדפן** (Pyodide/WebAssembly) ואין מה להתקין.
    //    השלילה חייבת להיות במשפט הראשון, לפני כל פרט טכני.
    el.rbOut.textContent =
      `הדפדפן לא הצליח להפעיל את פייתון.\n\n` +
      `אין מה להתקין. פייתון רץ בתוך הדפדפן עצמו —\n` +
      `התקנת פייתון על המחשב לא תפתור את זה ואינה נדרשת.\n\n` +
      `קרא למורה. מה שכתבת נשמר ולא ילך לאיבוד.\n\n` +
      `─────────────  לדיווח למורה  ─────────────\n` +
      `${code}  ${err.name || 'Error'}\n${err.message}\n` +
      `${diagLine()}\n\n` +
      `מחפש את הסיבה…`;
    showTab('out');
    openResults();
    diagnose(code, err);          // רץ מאליו. לא ממתינים לו כאן
    return;                       // הכפתורים נשארים מנוטרלים, וזה נכון
  }
  el.btnRun.disabled = el.btnTests.disabled = false;
  el.rhint.textContent = 'הרצה → פלט · בדיקות → בדיקות';
  probe();
}

function execute(withTests) {
  const fn = py.globals.get('_fintech_run');
  const raw = fn(el.code.value, withTests ? WEEK.testsVisible : null);
  fn.destroy();
  return JSON.parse(raw);
}

// ══ הרצה ══════════════════════════════════════════════════════════════

el.btnRun.addEventListener('click', () => {
  const r = execute(false);
  el.rbOut.textContent = r.error ? `${r.output}\n${r.error}` : (r.output || '(אין פלט)');
  openResults();       // בפעם הראשונה בלבד — הרצועה נפרשת ל-196
  showTab('out');
  if (isCollapsed()) markFresh(true);   // התלמיד קיפל. מסמנים, לא פותחים
  else openOnce();     // אחרי showTab — הפאנל הנמדד חייב להיות הגלוי
});

// ══ בדיקות ════════════════════════════════════════════════════════════

el.btnTests.addEventListener('click', () => {
  const r = execute(true);
  el.rbOut.textContent = r.error ? `${r.output}\n${r.error}` : (r.output || '(אין פלט)');
  openResults();

  if (r.error) {
    el.rbTests.innerHTML =
      `<div class="tr pend"><span class="mark">■</span>
         <span class="label">הקוד לא רץ, ולכן אין מה לבדוק עדיין.
           <span class="why">תסתכל בטאב "פלט" — השגיאה שם.</span>
         </span></div>`;
    el.testsCount.textContent = '—';
    showTab('tests');
    if (isCollapsed()) markFresh(true);
    else openOnce();
    return;
  }

  const pass = r.tests.filter((t) => t.ok).length;
  el.testsCount.textContent = `${pass}/${r.tests.length}`;
  el.rbTests.innerHTML = r.tests.map((t) => `
    <div class="tr ${t.ok ? 'pass' : 'pend'}">
      <span class="mark">${t.ok ? '✓' : '■'}</span>
      <span class="label">${esc(t.label)}${t.ok ? '' : `<span class="why">${esc(t.why)}</span>`}</span>
    </div>`).join('');

  showTab('tests');
  if (isCollapsed()) markFresh(true);
  else openOnce();
});

// ══ הגשה ══════════════════════════════════════════════════════════════
//
// ⚠️ **ההגשה אינה מציגה ציון, כי אין ציון עדיין.** הטסטים הנסתרים
//    קובעים אותו, והם לא כאן ולא בשרת — הם רצים אצל המורה אחרי
//    השיעור, עם tools/run_week.py על ההגשות מהגיליון. ‏SPEC §7:
//    הטסטים קובעים, לא המודל. שרת שמריץ קוד של תלמידים הוא בעיה
//    בפני עצמה, ולא פותרים אותה בשני ימים.

el.btnSubmit.addEventListener('click', async () => {
  const r = execute(true);
  if (r.error) {
    alert('הקוד לא רץ, ולכן אי אפשר להגיש.\nתקן את השגיאה ונסה שוב.');
    document.querySelector('[data-rtab="out"]').click();
    return;
  }
  const pass = r.tests.filter((t) => t.ok).length;
  if (!confirm(`להגיש? ${pass} מתוך ${r.tests.length} בדיקות גלויות עוברות.\n` +
               'אפשר להגיש שוב עד סוף השיעור.')) return;

  el.btnSubmit.disabled = true;
  el.btnSubmit.textContent = 'מגיש…';
  try {
    await api.submit(WEEK.week, el.code.value, pass, r.tests.length);
    dirty = false;
    say('קיבלתי. תודה.');
    el.btnSubmit.textContent = 'הוגש ✓';
    setTimeout(() => { el.btnSubmit.textContent = 'הגשה'; el.btnSubmit.disabled = false; }, 4000);
  } catch (err) {
    el.btnSubmit.disabled = false;
    el.btnSubmit.textContent = 'הגשה';
    alert('ההגשה לא נשלחה: ' + err.message +
          '\n\nהקוד שלך שמור במחשב. קרא למורה.');
  }
});

// ══ מצב חיבור ═════════════════════════════════════════════════════════
// באנר, לא מודאל. התלמיד ממשיך לעבוד — הקוד נשמר מקומית בכל מקרה.

const banner = document.createElement('div');
banner.className = 'offline';
banner.hidden = true;
banner.textContent = 'אין חיבור לשרת. העבודה נשמרת במחשב הזה בלבד — קרא למורה.';
document.body.prepend(banner);
onHealthChange((h) => { banner.hidden = h.online; });

// ══ מד הפריסה ═════════════════════════════════════════════════════════
// כלי פיתוח. קיים כדי לבדוק טענה אחת מ-layout.md §2: "20 שורות קוד".

function probe() {
  if (!DEBUG) return;
  const wrap = document.querySelector('.code-wrap');
  const lh = parseFloat(getComputedStyle(el.code).lineHeight);
  const pad = parseFloat(getComputedStyle(el.code).paddingTop)
            + parseFloat(getComputedStyle(el.code).paddingBottom);
  const lines = (wrap.clientHeight - pad) / lh;

  el.probe.hidden = false;
  el.probe.textContent = [
    `viewport   ${innerWidth}×${innerHeight}`,
    `elad ${document.querySelector('.elad').offsetWidth}  ` +
    `editor ${document.querySelector('.editor-col').offsetWidth}  ` +
    `task ${document.querySelector('.task').offsetWidth}`,
    `editor blk ${document.querySelector('.editor').offsetHeight}` +
    `  code ${wrap.clientHeight}  results ${el.results.offsetHeight}`,
    `line-height ${lh}  →  ${lines.toFixed(1)} lines visible`,
  ].join('\n');
}

addEventListener('resize', probe);
probe();
boot();
