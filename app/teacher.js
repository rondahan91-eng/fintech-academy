// ══════════════════════════════════════════════════════════════════════
//  פאנל המורה
//
//  ⛔ **אסימון המורה ב-sessionStorage בלבד.** סגירת הלשונית מנתקת.
//     ב-localStorage הוא היה שורד במחשב הכיתה שמונה שעות, וכל מי שיושב
//     אחריו היה רואה תמלולי שיחות של תלמידים.
//
//  ⚠️ הדף משתמש ב-call מ-api.js ולא ב-api, כי אלה פעולות מורה.
//     ‏api.js כבר יודע לטפל בכתובת שהתחלפה ובשרת איטי.
// ══════════════════════════════════════════════════════════════════════

import { call } from './api.js';
import { WEEKS, DEFAULT_WEEK } from './content.js';

const TOKEN_KEY = 'fintech:admin';
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const token = {
  get() { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(v) { try { v ? sessionStorage.setItem(TOKEN_KEY, v) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* חסום */ } },
};

let DATA = null;          // תשובת adminData האחרונה

// ══ כניסה ═════════════════════════════════════════════════════════════

$('gate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('gate-err').textContent = '';
  $('gate-go').disabled = true;
  $('gate-go').textContent = 'בודק…';
  try {
    const res = await call('adminLogin', { password: $('pass').value });
    token.set(res.token);
    $('pass').value = '';
    await enterPanel();
  } catch (err) {
    $('gate-err').textContent = err.message;
  } finally {
    $('gate-go').disabled = false;
    $('gate-go').textContent = 'כניסה';
  }
});

$('btn-out').addEventListener('click', () => {
  token.set(null);
  location.reload();
});

async function enterPanel() {
  $('gate').classList.add('hide');
  $('panel').classList.remove('hide');
  $('btn-out').classList.remove('hide');
  await loadData();
}

// ══ נתוני הכיתה ═══════════════════════════════════════════════════════

async function loadData() {
  $('list').innerHTML = '<p class="muted">טוען…</p>';
  try {
    DATA = await call('adminData', { token: token.get() });
  } catch (err) {
    // אסימון שפג — חזרה לשער, ולא מסך ריק בלי הסבר
    if (/אסימון|פג תוקף/.test(err.message)) {
      token.set(null);
      location.reload();
      return;
    }
    $('list').innerHTML = `<p class="err">${esc(err.message)}</p>`;
    return;
  }
  $('whoami').textContent = `${DATA.students.length} תלמידים`;
  fillWeekSelect(DATA.activeWeek);
  renderList();
}

function fillWeekSelect(active) {
  const sel = $('week-select');
  sel.innerHTML = '';
  Object.keys(WEEKS).map(Number).sort((a, b) => a - b).forEach((n) => {
    const o = document.createElement('option');
    o.value = String(n);
    o.textContent = `שבוע ${n} · ${WEEKS[n].title}`;
    if (n === Number(active)) o.selected = true;
    sel.append(o);
  });
  if (!WEEKS[active]) {
    const o = document.createElement('option');
    o.value = String(active);
    o.textContent = `שבוע ${active} · לא ארוז באפליקציה`;
    o.selected = true;
    sel.prepend(o);
  }
}

$('btn-week').addEventListener('click', async () => {
  const n = Number($('week-select').value);
  const open = DATA.students.filter((s) => !s.override).length;
  if (!confirm(`לפתוח את שבוע ${n} ל-${open} תלמידים?\n\n` +
               'מי שהמסך שלו פתוח יעבור אליו ברענון הבא. ' +
               'העבודה על השבוע הקודם נשמרת.')) return;
  $('btn-week').disabled = true;
  try {
    await call('adminSetWeek', { token: token.get(), week: n });
    $('week-msg').textContent = `שבוע ${n} פתוח.`;
    await loadData();
  } catch (err) {
    $('week-msg').textContent = err.message;
  } finally {
    $('btn-week').disabled = false;
  }
});

$('btn-reload').addEventListener('click', loadData);
$('btn-export').addEventListener('click', exportTable);
$('btn-export-code').addEventListener('click', exportSubmissions);

/**
 * ייצוא ההגשות עצמן — קוד מלא לכל תלמיד, לקובץ אחד.
 * ⚠️ מושך כרטיס תלמיד אחד-אחד, כי הטבלה אינה נושאת קוד. בכיתה של 22
 *    זה כמה שניות, והכפתור ננעל בינתיים כדי שלא יילחץ פעמיים.
 */
async function exportSubmissions() {
  const btn = $('btn-export-code');
  btn.disabled = true;
  const original = btn.textContent;
  const rows = [['שם', 'שבוע', 'מועד ההגשה', 'בדיקות גלויות', 'מתוך', 'הקוד']];
  try {
    let done = 0;
    for (const s of DATA.students) {
      btn.textContent = `אוסף… ${++done}/${DATA.students.length}`;
      const d = await call('adminStudent', { token: token.get(), id: s.id });
      d.submissions.forEach((sub) => {
        rows.push([d.name, sub.week, sub.ts, sub.pass, sub.total, sub.code]);
      });
    }
    download(`הגשות-שבוע-${DATA.activeWeek}.csv`, toCsv(rows));
  } catch (err) {
    alert('הייצוא נעצר: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

// ══ טבלת הכיתה ════════════════════════════════════════════════════════
//
// ⚠️ **"לא הגיש" אינו "תקוע".** תלמיד יכול לעבוד בשקט חצי שיעור ולהגיש
//    בסוף. מה שבאמת מסמן קושי הוא הרבה שאלות לאלעד בלי הגשה, ולכן
//    עמודת השיחות יושבת ליד עמודת ההגשות ולא בסוף.

// ⚠️ **עמודה אחת = שאלה אחת.** הגרסה הקודמת שמה ארבעה מספרים זה לצד
//    זה — 2, ‏3/3, ‏7 — ואי אפשר היה לדעת מה כל אחד מהם. עכשיו כל תא
//    נושא את היחידה שלו במילים, ומספר בלי הקשר לא מופיע.

function stateCell(s) {
  if (!s.startedOnboarding) return '<span class="pill dim">לא נכנס</span>';
  if (!s.onboarded) return '<span class="pill warn">בשיחת קליטה</span>';
  if (s.grade) {
    const cls = s.grade === 'הושלם' ? 'ok'
              : (s.grade === 'לא הגיש' ? 'dim'
              : (s.grade === 'הקוד קרס' ? 'bad' : 'warn'));
    return `<span class="pill ${cls}">${esc(s.grade)}</span>`;
  }
  if (!s.submissions) return '<span class="pill dim">טרם הגיש</span>';
  return '<span class="pill warn">הוגש · טרם נבדק</span>';
}

/** הגשה: מתי, וכמה פעמים — במילים, לא כמספר ערום. */
function submitCell(s) {
  if (!s.submissions) return '<span class="muted">לא הגיש</span>';
  const when = String(s.lastSubmit || '').replace(/:\d\d$/, '');
  const again = s.submissions > 1 ? `<br><span class="muted">הגיש ${s.submissions} פעמים</span>` : '';
  return `${esc(when)}${again}`;
}

/** ציון: מה שחושב, ומה שעוד חסר כדי להשלים אותו. */
function scoreCell(s) {
  if (s.score === null || s.score === undefined) {
    return '<span class="muted">—</span>';
  }
  const rubric = s.rubric === null
    ? '<br><span class="muted">בלי איכות קוד</span>' : '';
  return `<b class="num">${s.score + (s.rubric || 0)}</b>
          <span class="muted">מתוך 800</span>${rubric}`;
}

function testsCell(s) {
  if (s.hiddenTotal) {
    return `עברו <b class="num">${s.hiddenPass}</b> מתוך
            <span class="num">${s.hiddenTotal}</span>
            <br><span class="muted">בדיקות נסתרות</span>`;
  }
  if (s.visibleTotal) {
    return `עברו <b class="num">${s.visiblePass}</b> מתוך
            <span class="num">${s.visibleTotal}</span>
            <br><span class="muted">גלויות בלבד</span>`;
  }
  return '<span class="muted">—</span>';
}

function renderList() {
  const rows = DATA.students.map((s) => `
    <tr class="row" data-id="${esc(s.id)}">
      <td><b>${esc(s.name)}</b>${s.override ? ` <span class="pill dim">שבוע ${s.override}</span>` : ''}</td>
      <td>${submitCell(s)}</td>
      <td>${testsCell(s)}</td>
      <td>${scoreCell(s)}</td>
      <td>${s.talked ? `${s.talked} <span class="muted">שאלות</span>` : '<span class="muted">—</span>'}</td>
      <td>${stateCell(s)}</td>
    </tr>`).join('');

  $('list').innerHTML = `
    <table>
      <tr><th>תלמיד</th><th>הגשה אחרונה</th><th>בדיקות</th><th>ציון</th>
          <th>פנה לאלעד</th><th>מצב</th></tr>
      ${rows}
    </table>
    <p class="muted" style="margin-top:10px">
      הציון והבדיקות הנסתרות מגיעים מלשונית <b>grades</b> בגיליון, שאליה
      מדביקים את <span class="num">week-NN-grades.csv</span> שמייצר
      ‏tools/grade_week.py. בלעדיה מוצגות הבדיקות הגלויות בלבד, ואין ציון.
    </p>`;

  $('list').querySelectorAll('tr.row').forEach((tr) => {
    tr.addEventListener('click', () => openStudent(tr.dataset.id));
  });
}

// ══ ייצוא ═════════════════════════════════════════════════════════════
//
// ⚠️ **‏utf-8-sig.** אקסל בעברית פותח CSV בלי BOM כג'יבריש, והמורה
//    חושב שהקובץ נשבר. שלושת הבתים האלה הם ההבדל.

function toCsv(rows) {
  return rows.map((r) => r.map((c) => {
    const s = String(c ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\r\n');
}

function download(name, text) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function exportTable() {
  const head = ['מזהה', 'שם', 'שבוע', 'הגשות', 'הגשה אחרונה',
                'בדיקות נסתרות', 'מתוך', 'בדיקות גלויות', 'מתוך',
                'ציון ללא איכות קוד', 'איכות קוד', 'ציון כולל',
                'שאלות לאלעד', 'מצב', 'הערה'];
  const rows = DATA.students.map((s) => [
    s.id, s.name, s.override || DATA.activeWeek, s.submissions, s.lastSubmit,
    s.hiddenPass ?? '', s.hiddenTotal ?? '',
    s.visiblePass ?? '', s.visibleTotal ?? '',
    s.score ?? '', s.rubric ?? '',
    s.score === null || s.score === undefined ? '' : s.score + (s.rubric || 0),
    s.talked, s.grade || stateText(s), s.gradeNote || '',
  ]);
  download(`כיתה-שבוע-${DATA.activeWeek}.csv`, toCsv([head, ...rows]));
}

function stateText(s) {
  if (!s.startedOnboarding) return 'לא נכנס';
  if (!s.onboarded) return 'בשיחת קליטה';
  if (!s.submissions) return 'טרם הגיש';
  return 'הוגש · טרם נבדק';
}

// ══ כרטיס תלמיד ═══════════════════════════════════════════════════════

async function openStudent(id) {
  $('detail').innerHTML = '<div class="card"><p class="muted">טוען…</p></div>';
  $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  let d;
  try {
    d = await call('adminStudent', { token: token.get(), id });
  } catch (err) {
    $('detail').innerHTML = `<div class="card"><p class="err">${esc(err.message)}</p></div>`;
    return;
  }

  const subs = d.submissions.slice().reverse().map((s) => `
    <h3>הגשה · שבוע ${s.week} · ${esc(s.ts)} · גלויות ${s.pass}/${s.total}</h3>
    <pre>${esc(s.code)}</pre>`).join('') ||
    '<h3>הגשות</h3><p class="muted">אין הגשות.</p>';

  const turns = (list) => list.map((t) => {
    const elad = t.role === 'elad';
    return `<div class="turn ${elad ? 'elad' : ''}">
      <span class="who">${elad ? 'אלעד' : esc(d.name)}</span>
      <span class="bubble">${esc(t.text)}</span></div>`;
  }).join('');

  const baseline = d.baseline.length ? `
    <h3>שש שאלות הבסיס</h3>
    <table>
      <tr><th>שאלה</th><th>התשובה שנתן</th><th>נכונה</th></tr>
      ${d.baseline.map((b) => `<tr><td class="num">${esc(b.q)}</td>
        <td>${esc(b.answer)}</td>
        <td>${b.matched === 'yes' ? '<span class="pill ok">כן</span>'
                                  : '<span class="pill dim">לא</span>'}</td></tr>`).join('')}
    </table>` : '';

  $('detail').innerHTML = `
    <div class="card">
      <h2>${esc(d.name)}</h2>
      <p class="muted">רואה כרגע שבוע ${d.week}${d.override ? ' (חריגה אישית)' : ''}
        · ${d.submissions.length} הגשות · ${d.chat.filter((t) => t.role === 'student').length} שאלות לאלעד</p>

      <h3>שבוע אישי</h3>
      <p class="muted">חריגה למי שנעדר ונשאר מאחור, או למי שרץ קדימה.
         ריק מחזיר אותו לשבוע של הכיתה.</p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <input type="text" id="ov-week" style="width:120px"
               placeholder="מספר שבוע" value="${d.override || ''}">
        <button type="button" id="ov-save">שמור</button>
        <span class="muted" id="ov-msg"></span>
      </div>

      ${subs}

      <h3>השיחה עם אלעד</h3>
      ${d.chat.length ? turns(d.chat) : '<p class="muted">לא פנה לאלעד.</p>'}

      <h3>שיחת הקליטה</h3>
      ${d.intake.length ? turns(d.intake) : '<p class="muted">לא התחיל שיחת קליטה.</p>'}

      ${baseline}
    </div>`;

  $('ov-save').addEventListener('click', async () => {
    const raw = $('ov-week').value.trim();
    $('ov-save').disabled = true;
    try {
      await call('adminSetStudentWeek', { token: token.get(), id, week: Number(raw) || 0 });
      $('ov-msg').textContent = raw ? `שבוע ${raw} נקבע לתלמיד זה.` : 'החריגה בוטלה.';
      await loadData();
    } catch (err) {
      $('ov-msg').textContent = err.message;
    } finally {
      $('ov-save').disabled = false;
    }
  });
}

// ══ עלייה ═════════════════════════════════════════════════════════════

if (token.get()) {
  enterPanel();
} else {
  $('pass').focus();
}

// ‏DEFAULT_WEEK מיובא כדי שכשל בטעינת השבועות ייראה כאן ולא בשקט
if (!WEEKS[DEFAULT_WEEK]) {
  $('week-msg').textContent = 'אזהרה: לא נטענו שבועות מ-content.js';
}
