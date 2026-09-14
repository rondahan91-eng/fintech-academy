/**
 * FinTech Academy — שרת הכיתה
 * Google Apps Script, קשור לגיליון. אין תשתית נוספת ואין עלות.
 *
 * מה הוא עושה:  זהות · שמירה · הגשה · אלעד
 * מה הוא לא:    לא מריץ קוד של תלמידים. הקוד רץ בדפדפן שלהם.
 *
 * ⛔ **הטסטים הנסתרים לא נמצאים כאן ולא נמצאים בדפדפן.** הציון מחושב
 *    אחרי השיעור עם tools/run_week.py על ההגשות מהגיליון. שרת שמריץ
 *    קוד זר הוא בעיית אבטחה בפני עצמה, והיא לא נפתרת ביומיים.
 *
 * פריסה: ראה server/README.md
 */

// ═══ הגדרות ═══════════════════════════════════════════════════════════

var MODEL = 'claude-opus-5';
var MAX_TOKENS = 4096;
var EFFORT = 'low';          // תשובה קצרה של מנטור. ‏high כאן הוא בזבוז
var CHAT_HISTORY = 12;       // כמה תורות אחרונות נשלחות כהקשר
var TOKEN_TTL_HOURS = 14;    // יום לימודים אחד ועוד שוליים

var SHEETS = {
  roster: ['id', 'name', 'code', 'class', 'active'],
  progress: ['id', 'week', 'code', 'updated', 'onboarded'],
  submissions: ['ts', 'id', 'name', 'week', 'visiblePass', 'visibleTotal', 'code'],
  chat: ['ts', 'id', 'week', 'role', 'text'],
  // ⚠️ שש שאלות הבסיס. **הדלתא מול שבוע 30 היא הראיה היחידה שיש**
  //    שהחינוך הפיננסי עבד — ולכן זה הגיליון שאסור למחוק.
  baseline: ['ts', 'id', 'name', 'q', 'answer', 'matched', 'note'],
  onboard: ['ts', 'id', 'role', 'text'],
  // נגזרת בלבד — נבנה מחדש מהתפריט. מחיקתו לא מוחקת דבר.
  dashboard: ['id', 'שם', 'קליטה', 'בסיס', 'הגשות', 'בדיקות', 'שיחות',
              'פעילות אחרונה', 'מצב'],
};

// ═══ נקודת הכניסה ═════════════════════════════════════════════════════

function doGet() {
  return json({ ok: true, service: 'fintech-academy', time: new Date().toISOString() });
}

/**
 * ⚠️ הלקוח שולח Content-Type: text/plain **בכוונה.**
 * ‏application/json מפעיל preflight מסוג OPTIONS, ו-Apps Script לא עונה
 * עליו — הבקשה נכשלת ב-CORS לפני שהיא מגיעה לכאן. הגוף עדיין JSON.
 */
function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var handler = ACTIONS[req.action];
    if (!handler) return json({ error: 'פעולה לא מוכרת: ' + req.action });
    return json(handler(req));
  } catch (err) {
    return json({ error: String(err && err.message || err) });
  }
}

var ACTIONS = {
  login: doLogin,
  state: doState,
  save: doSave,
  submit: doSubmit,
  chat: doChat,
  onboard: doOnboard,
};

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══ זהות ═════════════════════════════════════════════════════════════
//
// ⚠️ **זו לא אבטחה, וחשוב שתדע את זה.** קוד בן שש ספרות מונע מתלמיד
//    להיכנס בטעות בשם חבר; הוא לא מונע ממי שרוצה. אין כאן ציונים ואין
//    מידע רגיש — יש קוד פייתון ושיחות עם מנטור. **אל תשים כאן שום דבר
//    שלא היית תולה על לוח הכיתה.**

function doLogin(req) {
  var name = String(req.name || '').trim();
  var code = String(req.code || '').trim();
  if (!name || !code) return { error: 'חסר שם או קוד' };

  var rows = table('roster');
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (String(r.name).trim() === name && String(r.code).trim() === code) {
      if (String(r.active).toLowerCase() === 'no') return { error: 'החשבון אינו פעיל' };
      return {
        token: makeToken(r.id),
        student: { id: r.id, name: r.name, class: r.class },
        state: loadState(r.id),
      };
    }
  }
  return { error: 'שם או קוד לא נכונים' };
}

function makeToken(id) {
  var issued = Date.now();
  return [id, issued, sign(id + '.' + issued)].join('.');
}

function readToken(token) {
  var parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('אסימון לא תקין');
  var id = parts[0], issued = Number(parts[1]);
  if (sign(id + '.' + issued) !== parts[2]) throw new Error('אסימון לא תקין');
  if (Date.now() - issued > TOKEN_TTL_HOURS * 3600 * 1000) throw new Error('פג תוקף. התחבר שוב');
  return id;
}

function sign(text) {
  var secret = prop('SESSION_SECRET');
  if (!secret) {
    secret = Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty('SESSION_SECRET', secret);
  }
  var raw = Utilities.computeHmacSha256Signature(text, secret);
  return Utilities.base64EncodeWebSafe(raw).slice(0, 22);
}

// ═══ מצב התלמיד ═══════════════════════════════════════════════════════
// SPEC §11.1: מושב שנקטע חוזר מנקודת העצירה, כולל היסטוריית השיחה.

function doState(req) {
  return { state: loadState(readToken(req.token)) };
}

function loadState(id) {
  var rows = table('progress');
  var mine = null;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) mine = rows[i];
  }
  return {
    week: mine ? Number(mine.week) : 1,
    code: mine ? String(mine.code) : '',
    updated: mine ? mine.updated : null,
    // ⚠️ **הדגל הזה הוא מה שמנתב.** ‏layout.md §16.2: הכניסה אינה
    //    תפריט אלא המשך — היא יודעת לאן, ואיש לא בוחר.
    //
    //    ⛔ **וזו גם חסימה קשה.** שיחת הקליטה חייבת להסתיים כדי
    //       שהתלמיד יגיע למשימה, והיא מסתיימת רק דרך המודל. אם
    //       המפתח חסר או שה-API נופל באמצע שיעור — **כל הכיתה
    //       תקועה במסך אחד ואי אפשר להתקדם.** מתג החירום למטה
    //       הוא מה שמונע ששיעור יאבד בגלל זה.
    onboarded: bypassOnboarding() ||
               !!(mine && String(mine.onboarded) === 'yes'),
    onboardTurns: onboardTurns(id),
    chat: loadChat(id),
  };
}

function onboardTurns(id) {
  var rows = table('onboard');
  var mine = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) {
      mine.push({ role: rows[i].role, text: String(rows[i].text) });
    }
  }
  return mine;
}

function loadChat(id) {
  var rows = table('chat');
  var mine = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) {
      mine.push({ role: rows[i].role, text: String(rows[i].text) });
    }
  }
  return mine.slice(-CHAT_HISTORY * 2);
}

// ═══ שמירה ════════════════════════════════════════════════════════════
//
// ⚠️ הלקוח **לא** שולח לכאן על כל הקשה. הוא שומר מקומית ברצף ודוחף
//    לכאן כל 30 שניות. שלושים תלמידים × הקשה = גיליון שנחנק, ולא
//    בגלל שהוא איטי אלא בגלל מכסת ההרצות המקבילות של Apps Script.

function doSave(req) {
  var id = readToken(req.token);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    upsertProgress(id, Number(req.week) || 1, String(req.code || ''));
    return { ok: true, saved: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function upsertProgress(id, week, code) {
  var sh = sheet('progress');
  var last = sh.getLastRow();
  var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sh.getRange(i + 2, 2, 1, 3).setValues([[week, code, new Date()]]);
      return;
    }
  }
  sh.appendRow([id, week, code, new Date()]);
}

// ═══ הגשה ═════════════════════════════════════════════════════════════

function doSubmit(req) {
  var id = readToken(req.token);
  var name = nameOf(id);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    sheet('submissions').appendRow([
      new Date(), id, name, Number(req.week) || 1,
      Number(req.pass) || 0, Number(req.total) || 0,
      String(req.code || ''),
    ]);
    upsertProgress(id, Number(req.week) || 1, String(req.code || ''));
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

// ═══ אלעד ═════════════════════════════════════════════════════════════

function doChat(req) {
  var id = readToken(req.token);
  var week = Number(req.week) || 1;
  var text = String(req.message || '').trim();
  if (!text) return { error: 'הודעה ריקה' };

  var key = prop('ANTHROPIC_API_KEY');
  if (!key) return { error: 'לא הוגדר מפתח API. ראה server/README.md' };

  var history = loadChat(id).map(function (m) {
    return { role: m.role === 'elad' ? 'assistant' : 'user', content: m.text };
  });
  history.push({ role: 'user', content: text });

  var body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    output_config: { effort: EFFORT },
    // ⚠️ cache_control על הבלוק היחיד של ה-system: הפרומפט של אלעד הוא
    //    כמה אלפי טוקנים והוא זהה לכל שלושים התלמידים. בלי זה משלמים
    //    עליו מחדש בכל הודעה.
    system: [{ type: 'text', text: ELAD_SYSTEM_PROMPT,
               cache_control: { type: 'ephemeral' } }],
    messages: history,
  };

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  var code = res.getResponseCode();
  if (code !== 200) {
    logChat(id, week, 'error', res.getContentText().slice(0, 500));
    return { error: 'אלעד לא זמין כרגע (' + code + ')' };
  }

  var data = JSON.parse(res.getContentText());
  var reply = '';
  for (var i = 0; i < data.content.length; i++) {
    if (data.content[i].type === 'text') reply += data.content[i].text;
  }
  reply = reply.trim();

  logChat(id, week, 'student', text);
  logChat(id, week, 'elad', reply);
  return { reply: reply, usage: data.usage };
}

function logChat(id, week, role, text) {
  sheet('chat').appendRow([new Date(), id, week, role, text]);
}

// ═══ שיחת הקליטה ══════════════════════════════════════════════════════
//
// רצה **פעם אחת בחיים**. ‏SPEC §11.1: מושב שנקטע חוזר מנקודת העצירה —
// ולכן כל תור נשמר, והשיחה נבנית מחדש מהגיליון בכל טעינה.
//
// ⚠️ המודל מחזיר JSON ולא טקסט. ‏`record` הוא מה שהופך את השיחה
//    למדידה: שש תשובות שנשמרות **כלשונן**, ונשאלות שוב בשבוע 30.

function doOnboard(req) {
  var id = readToken(req.token);
  var key = prop('ANTHROPIC_API_KEY');
  if (!key) return { error: 'לא הוגדר מפתח API. ראה server/README.md' };

  var turns = onboardTurns(id);
  var text = String(req.message || '').trim();

  // הודעה ריקה = פתיחת השיחה. אלעד מתחיל.
  var history = turns.map(function (t) {
    return { role: t.role === 'elad' ? 'assistant' : 'user', content: t.text };
  });
  if (text) history.push({ role: 'user', content: text });
  if (!history.length) history.push({ role: 'user', content: '(התלמיד נכנס)' });

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: 'medium' },   // שיחה, לא רמז. שווה קצת יותר
      system: [{ type: 'text', text: ONBOARD_SYSTEM_PROMPT,
                 cache_control: { type: 'ephemeral' } }],
      messages: history,
    }),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    return { error: 'אלעד לא זמין כרגע (' + res.getResponseCode() + ')' };
  }

  var raw = '';
  var content = JSON.parse(res.getContentText()).content;
  for (var i = 0; i < content.length; i++) {
    if (content[i].type === 'text') raw += content[i].text;
  }

  var out = parseOnboard(raw);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (text) sheet('onboard').appendRow([new Date(), id, 'student', text]);
    sheet('onboard').appendRow([new Date(), id, 'elad', out.say]);

    if (out.record && out.record.q) {
      sheet('baseline').appendRow([
        new Date(), id, nameOf(id), out.record.q,
        String(out.record.answer || ''),
        out.record.matched === true ? 'yes' : 'no',
        String(out.record.note || ''),
      ]);
    }
    if (out.done) markOnboarded(id);
  } finally {
    lock.releaseLock();
  }
  return out;
}

/** המודל אמור להחזיר JSON. אם לא — לא מפילים שיחה על עיצוב. */
function parseOnboard(raw) {
  var t = String(raw).trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  try {
    var o = JSON.parse(t);
    return {
      say: String(o.say || '').trim(),
      stage: String(o.stage || 'arrival'),
      avatar: String(o.avatar || 'neutral'),
      record: o.record || null,
      done: o.done === true,
    };
  } catch (e) {
    return { say: t, stage: 'arrival', avatar: 'neutral', record: null, done: false };
  }
}

function markOnboarded(id) {
  var sh = sheet('progress');
  var last = sh.getLastRow();
  var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sh.getRange(i + 2, 5).setValue('yes');
      return;
    }
  }
  sh.appendRow([id, 1, '', new Date(), 'yes']);
}

// ═══ גיליון ═══════════════════════════════════════════════════════════

function sheet(name) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function table(name) {
  var sh = sheet(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var body = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  return body.map(function (row) {
    var o = {};
    head.forEach(function (h, i) { o[h] = row[i]; });
    return o;
  });
}

function nameOf(id) {
  var rows = table('roster');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) return rows[i].name;
  }
  return '';
}

function prop(k) {
  return PropertiesService.getScriptProperties().getProperty(k);
}

// ═══ מתג החירום ═══════════════════════════════════════════════════════
//
// ⚠️ **להדליק רק כששיחת הקליטה לא עובדת ויש כיתה בחדר.**
//    כשהוא דלוק כולם עוברים ישר למשימה — **ושש שאלות הבסיס לא
//    נשאלות.** זה מוחק את נקודת ההשוואה מול שבוע 30, וזו הראיה
//    היחידה שיש שהחינוך הפיננסי עבד. **שיעור עדיף על ראיה, אבל
//    לכבות מיד אחר כך.**

function bypassOnboarding() {
  return prop('SKIP_ONBOARDING') === 'yes';
}

function toggleBypass() {
  var ui = SpreadsheetApp.getUi();
  var on = bypassOnboarding();
  if (!on) {
    var ok = ui.alert(
      'לדלג על שיחת הקליטה?',
      'כל התלמידים יעברו ישר למשימה, ושש שאלות הבסיס לא יישאלו.\n\n' +
      'זה מוחק את ההשוואה מול שבוע 30.\n\n' +
      'להדליק רק אם השיחה לא עובדת ויש כיתה בחדר.',
      ui.ButtonSet.YES_NO);
    if (ok !== ui.Button.YES) return;
  }
  PropertiesService.getScriptProperties()
    .setProperty('SKIP_ONBOARDING', on ? 'no' : 'yes');
  ui.alert(on ? 'שיחת הקליטה חזרה לפעול.'
              : '⚠️ דילוג פעיל. לכבות מיד אחרי השיעור.');
}

// ═══ תפריט למורה ══════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('FinTech')
    .addItem('רענן לוח מעקב', 'rebuildDashboard')
    .addSeparator()
    .addItem('הכן את הגיליונות', 'setupSheets')
    .addItem('צור קודים לתלמידים חדשים', 'generateCodes')
    .addItem('בדוק שהמפתח עובד', 'testKey')
    .addSeparator()
    .addItem('⚠ דלג על שיחת הקליטה (חירום)', 'toggleBypass')
    .addToUi();
}

// ═══ לוח המעקב ════════════════════════════════════════════════════════
//
// שורה לתלמיד, נבנית מחדש מהגיליונות האחרים. **אפשר למחוק אותו בכל
// רגע** — הוא נגזרת, לא מקור.
//
// ⚠️ העמודה שבאמת שווה משהו היא **"מצב"**. השאר הוא ספירה; היא
//    התשובה לשאלה היחידה שמעניינת אותך תוך כדי שיעור — מי תקוע.

var DASH = ['id', 'שם', 'קליטה', 'בסיס', 'הגשות', 'בדיקות', 'שיחות',
            'פעילות אחרונה', 'מצב'];

function rebuildDashboard() {
  var roster = table('roster');
  var prog = index(table('progress'), 'id');
  var subs = table('submissions');
  var chats = table('chat');
  var base = table('baseline');
  var onb = table('onboard');

  var rows = roster.filter(function (r) { return String(r.name).trim(); })
    .map(function (r) {
      var id = String(r.id);
      var p = prog[id];
      var mySubs = subs.filter(function (s) { return String(s.id) === id; });
      var last = mySubs[mySubs.length - 1];
      var myBase = base.filter(function (b) { return String(b.id) === id; });
      var matched = myBase.filter(function (b) {
        return String(b.matched) === 'yes';
      }).length;
      var talk = chats.filter(function (c) {
        return String(c.id) === id && c.role === 'student';
      }).length;

      var seen = p && p.updated ? new Date(p.updated) : null;
      var obDone = p && String(p.onboarded) === 'yes';
      var started = onb.some(function (o) { return String(o.id) === id; });

      return [
        id, r.name,
        obDone ? '✓' : (started ? 'באמצע' : '—'),
        myBase.length ? matched + '/' + myBase.length : '—',
        mySubs.length,
        last ? last.visiblePass + '/' + last.visibleTotal : '—',
        talk,
        seen || '',
        statusOf({ obDone: obDone, started: started, subs: mySubs.length,
                   last: last, talk: talk, seen: seen }),
      ];
    });

  var sh = sheet('dashboard');
  sh.clear();
  sh.appendRow(DASH);
  sh.setFrozenRows(1);
  if (rows.length) sh.getRange(2, 1, rows.length, DASH.length).setValues(rows);
  sh.getRange(2, 8, Math.max(rows.length, 1), 1).setNumberFormat('HH:mm');
  sh.autoResizeColumns(1, DASH.length);

  SpreadsheetApp.getUi().alert(rows.length + ' תלמידים. הלוח מעודכן.');
}

/**
 * ⚠️ **"תקוע" הוא לא "לא הגיש".** תלמיד שעובד בשקט ולא הגיש עדיין הוא
 *    תלמיד שעובד. מה שמסמן מצוקה הוא **הרבה שאלות בלי התקדמות**, או
 *    שקט ממושך אחרי שהתחיל.
 */
function statusOf(x) {
  if (!x.started) return 'לא נכנס';
  if (!x.obDone) return 'בשיחת קליטה';

  var quietMin = x.seen ? (Date.now() - x.seen.getTime()) / 60000 : 999;

  if (x.last && x.last.visiblePass === x.last.visibleTotal) return '✓ הגיש, הכול עובר';
  if (x.subs) return 'הגיש · ' + x.last.visiblePass + '/' + x.last.visibleTotal;
  if (x.talk >= 6) return '⚠ הרבה שאלות, לא הגיש';
  if (quietMin > 20) return '⚠ שקט ' + Math.round(quietMin) + ' דק׳';
  return 'עובד';
}

function index(rows, key) {
  var m = {};
  for (var i = 0; i < rows.length; i++) m[String(rows[i][key])] = rows[i];
  return m;
}

function setupSheets() {
  Object.keys(SHEETS).forEach(function (n) { sheet(n); });
  SpreadsheetApp.getUi().alert(
    'מוכן.\n\nעכשיו הדבק ב-roster את שמות התלמידים בעמודת name, ' +
    'ואז הרץ "צור קודים לתלמידים חדשים".');
}

/** ממלא id ו-code לכל שורה שיש בה שם ואין בה קוד. */
function generateCodes() {
  var sh = sheet('roster');
  var last = sh.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert('אין שמות ב-roster'); return; }

  var rng = sh.getRange(2, 1, last - 1, 5);
  var vals = rng.getValues();
  var made = 0;
  for (var i = 0; i < vals.length; i++) {
    var name = String(vals[i][1]).trim();
    if (!name) continue;
    if (!vals[i][0]) vals[i][0] = 'S' + Utilities.formatString('%03d', i + 1);
    if (!vals[i][2]) {
      vals[i][2] = String(Math.floor(100000 + Math.random() * 900000));
      made++;
    }
    if (!vals[i][4]) vals[i][4] = 'yes';
  }
  rng.setValues(vals);
  SpreadsheetApp.getUi().alert('נוצרו ' + made + ' קודים חדשים.');
}

function testKey() {
  var key = prop('ANTHROPIC_API_KEY');
  if (!key) { SpreadsheetApp.getUi().alert('לא הוגדר ANTHROPIC_API_KEY'); return; }
  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: MODEL, max_tokens: 32,
      messages: [{ role: 'user', content: 'ping' }],
    }),
    muteHttpExceptions: true,
  });
  SpreadsheetApp.getUi().alert(res.getResponseCode() === 200
    ? 'המפתח עובד. המודל: ' + MODEL
    : 'שגיאה ' + res.getResponseCode() + '\n\n' + res.getContentText().slice(0, 300));
}
