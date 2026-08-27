// ══════════════════════════════════════════════════════════════════════
//  FinTech Academy · פרוסה אנכית של שבוע 1
//
//  מה יש כאן:  Pyodide · עורך · הרצה · בדיקות גלויות · פאנל אלעד
//  מה אין:     LLM · שרת · הגשה · חנות · ציונים · שאר 29 השבועות
//
//  ⚠️ Pyodide נטען כאן מ-CDN. **בייצור זה אסור** — רשת בית ספר סגורה.
//     הפרוסה מוכיחה שהמנגנון עובד; האריזה המקומית היא משימה נפרדת.
// ══════════════════════════════════════════════════════════════════════

import { WEEK } from './content.js';

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
};

// כל טקסט שמגיע מהתלמיד או מקובץ תוכן עובר כאן לפני innerHTML.
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const STORE = `fintech:week-${WEEK.week}:code`;

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
// ⚠️ תשעת קובצי ה-PNG מעולם לא נשמרו לריפו. ברגע שיונחו ב-assets/persona/
//    בשמות שב-manifest, זה נדלק בלי שינוי קוד.

const AVATARS = new Map((WEEK.avatars || []).map((a) => [a.id, a.file]));
const AVATAR_DEFAULT = (WEEK.avatars || []).find((a) => a.default)?.id ?? 'neutral';

function setAvatar(state) {
  const file = AVATARS.get(state) ?? AVATARS.get(AVATAR_DEFAULT);
  if (!file) return;
  el.avatar.dataset.state = state;
  el.avatarImg.src = `../assets/persona/${file}`;
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
    `חסר: assets/persona/${AVATARS.get(el.avatar.dataset.state) ?? '?'}\n` +
    `${AVATARS.size} מצבים רשומים ב-manifest`;
});

setAvatar('presenting');   // מסירת המשימה — manifest.yml → presenting.use_for

// ══ אלעד ══════════════════════════════════════════════════════════════
// בפרוסה אין LLM. הטקסט כאן הוא **stub** שמחזיק את המקום ומראה את
// הפריסה. בייצור הוא נוצר מ-manager.yml + persona.yml דרך המודל.

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
}

OPENING.forEach((t) => say(t));

el.chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const t = el.chatText.value.trim();
  if (!t) return;
  say(t, 'אתה');
  el.chatText.value = '';
  say('בפרוסה הזאת אני עוד לא באמת עונה — אין כאן מודל. הפריסה עובדת.');
});

// ══ העורך ═════════════════════════════════════════════════════════════

el.code.value = localStorage.getItem(STORE) ?? WEEK.starter;

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
  localStorage.setItem(STORE, el.code.value);
  el.saved.textContent = 'נשמר אוטומטית';
}

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

// Tab מזיז פוקוס בדפדפן. בעורך הוא צריך להזיח. ‏4 רווחים — PEP 8.
el.code.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: t, value: v } = el.code;
  el.code.value = v.slice(0, s) + '    ' + v.slice(t);
  el.code.selectionStart = el.code.selectionEnd = s + 4;
  el.code.dispatchEvent(new Event('input'));
});

drawGutter();

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
  b.addEventListener('click', () => showTab(b.dataset.rtab)));
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

const R_MIN = 196, R_MAX = 376;
let resultsH = R_MIN, autoOpened = false;

function setResults(h) {
  resultsH = Math.max(R_MIN, Math.min(R_MAX, Math.round(h)));
  el.results.style.height = `${resultsH}px`;
  probe();
}
setResults(R_MIN);

let dragging = null;
el.handle.addEventListener('pointerdown', (e) => {
  dragging = { y: e.clientY, h: resultsH };
  el.handle.setPointerCapture(e.pointerId);
});
el.handle.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  setResults(dragging.h - (e.clientY - dragging.y));  // גרירה למעלה = הגדלה
  autoOpened = true;                                  // התלמיד בחר — לא נתערב
});
el.handle.addEventListener('pointerup', () => { dragging = null; });
el.handle.addEventListener('keydown', (e) => {
  const step = { ArrowUp: 24, ArrowDown: -24 }[e.key];
  if (step === undefined) return;
  e.preventDefault();
  setResults(resultsH + step);
  autoOpened = true;
});

// פתיחה אוטומטית **פעם אחת בלבד** — בכישלון הראשון, כשיש מה לקרוא.
function openOnce() {
  if (autoOpened) return;
  autoOpened = true;
  setResults(300);
}

// ══ Pyodide ═══════════════════════════════════════════════════════════

// שם הקובץ הפיקטיבי נשאר לטיני בכוונה — הודעת השגיאה היא בלוק LTR,
// ושם עברי בתוכה מתהפך ומבלבל. ‏expected_friction של שבוע 1 מזהיר מזה.
const HARNESS = `
import sys, io, json, traceback

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

def _fintech_run(src, tests_src):
    buf, old = io.StringIO(), sys.stdout
    sys.stdout = buf
    ns, err = {"__name__": "__main__"}, None
    try:
        exec(compile(src, FILE, "exec"), ns)
    except BaseException as e:
        err = _fintech_error(e)
    finally:
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

async function boot() {
  el.btnRun.disabled = el.btnTests.disabled = true;
  el.rhint.textContent = 'טוען את פייתון…';
  py = await loadPyodide({ stdin: () => '' });
  py.runPython(HARNESS);
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
  showTab('out');
  if (r.error) openOnce();
});

// ══ בדיקות ════════════════════════════════════════════════════════════

el.btnTests.addEventListener('click', () => {
  const r = execute(true);
  el.rbOut.textContent = r.error ? `${r.output}\n${r.error}` : (r.output || '(אין פלט)');

  if (r.error) {
    el.rbTests.innerHTML =
      `<div class="tr pend"><span class="mark">■</span>
         <span class="label">הקוד לא רץ, ולכן אין מה לבדוק עדיין.
           <span class="why">תסתכל בטאב "פלט" — השגיאה שם.</span>
         </span></div>`;
    el.testsCount.textContent = '—';
    showTab('tests');
    openOnce();
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
  if (pass < r.tests.length) openOnce();
});

el.btnSubmit.addEventListener('click', () => {
  alert('הגשה אינה חלק מהפרוסה. הטסטים הנסתרים רצים בשרת, ואין כאן שרת.');
});

// ══ מד הפריסה ═════════════════════════════════════════════════════════
// כלי פיתוח. קיים כדי לבדוק טענה אחת מ-layout.md §2: "20 שורות קוד".

function probe() {
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
