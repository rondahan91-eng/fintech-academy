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

// ⚠️ **‏Sonnet ולא Opus, וזו הכרעה של כיתה ולא של איכות.**
//    אלעד כותב שתיים-שלוש שורות של מנטור. ‏Opus חושב לפני כל תשובה
//    ומוסיף שניות שהתלמיד מחכה מולן, ו-Apps Script כבר גובה 3–7
//    שניות משלו. **החזרה ל-Opus היא שינוי של מילה אחת כאן.**
var MODEL = 'claude-sonnet-5';
// ⚠️ **לא להוריד את זה.** ניסיתי 1024 כדי לקצר תגובות והתקבל 400:
//    חשיבה אדפטיבית פעילה כברירת מחדל, ותקרה נמוכה לא משאירה מקום
//    גם לה וגם לתשובה. **אורך התשובה נקבע בפרומפט** — אלעד מונחה
//    לענות בשתיים-שלוש שורות — ולא בתקרה הזאת.
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

// ⚠️ **חותמת הגרסה.** ‏Apps Script מגיש את הגרסה הפרוסה, לא את מה
//    שבעורך — והדבקה ושמירה לא משנות כלום עד Version: New. בלי
//    החותמת הזאת "האם זה נפרס?" היא שאלה שאי אפשר לענות עליה בלי
//    לנסות פעולה ולראות אם היא מתנהגת אחרת. **להעלות בכל שינוי.**
var VERSION = '2026-09-15a';

function doGet(e) {
  // ⚠️ **בלי שמות וקודים.** האבחון אומר כמה שורות ואיזה כותרות, ולא
  //    מי בכיתה — הכתובת הזאת ציבורית.
  var head = [], rows = 0, ss = null;
  try {
    ss = SpreadsheetApp.getActive();
    var sh = sheet('roster');
    rows = Math.max(0, sh.getLastRow() - 1);
    head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
             .map(function (h) { return norm(h); });
  } catch (err) { head = ['<' + err.message + '>']; }

  var out = {
    ok: true, service: 'fintech-academy', version: VERSION,
    hasKey: !!prop('ANTHROPIC_API_KEY'),
    skipOnboarding: bypassOnboarding(),
    // ⚠️ **לאיזה גיליון הסקריפט קשור בפועל.** אם זה לא הגיליון
    //    שמסתכלים עליו, כל השאר חסר משמעות — קוראים כאן טבלה אחרת.
    sheetId: ss ? ss.getId() : null,
    sheetName: ss ? ss.getName() : null,
    rosterRows: rows, rosterHeaders: head,
    sheets: ss ? ss.getSheets().map(function (s) { return s.getName(); }) : [],
    time: new Date().toISOString(),
  };

  // ‏?probe=<קוד> — בודק את ההשוואה עצמה. מחזיר רק צורות, לא נתונים.
  var probe = e && e.parameter ? norm(e.parameter.probe) : '';
  if (probe) {
    var r = table('roster');
    var exact = 0, numeric = 0;
    for (var i = 0; i < r.length; i++) {
      var x = norm(r[i].code);
      if (x === probe) exact++;
      else if (/^\d+$/.test(x) && /^\d+$/.test(probe) &&
               Number(x) === Number(probe)) numeric++;
    }
    out.probe = {
      typed: probe, typedLen: probe.length,
      parsedRows: r.length,
      keys: r.length ? Object.keys(r[0]) : [],
      firstCodeLen: r.length ? norm(r[0].code).length : -1,
      firstCodeType: r.length ? typeof r[0].code : 'none',
      // כמה מהתאים הם באמת תאריכים — התקלה שהפילה את כל הכניסות
      dateCells: r.filter(function (x) { return cellDate(x.code) !== null; }).length,
      exact: exact, numeric: numeric,
    };
  }
  return json(out);
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

/**
 * ⚠️ **‏trim לבדו לא מספיק לעברית.** טקסט שמודבק לגיליון נושא לעיתים
 *    סימני כיווניות בלתי נראים — RLM ו-LRM וחבריהם. הם אינם רווחים,
 *    ‏trim לא נוגע בהם, והם גורמים לכל השוואה להיכשל **בלי שרואים
 *    שום דבר חריג בתא.** זה הפיל את כל 22 הכניסות.
 */
var BIDI_CODES = [0x200E, 0x200F, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E,
                  0x2066, 0x2067, 0x2068, 0x2069, 0xFEFF];

// ⚠️ **נבנית ממספרים ולא נכתבת כתווים.** התווים האלה בלתי נראים, והקובץ
//    הזה עובר העתק-הדבק לעורך של Apps Script — עורך או לוח גזירים
//    שיבלעו אותם היו הורגים את התיקון **בלי שאיש יראה שינוי בקוד.**
var BIDI = new RegExp('[' + BIDI_CODES.map(function (c) {
  return String.fromCharCode(c);
}).join('') + ']', 'g');

/**
 * ⛔ **תא שנראה כמו קוד אבל הוא תאריך.**
 *
 * הקודים הם תאריכי לידה בפורמט DDMMYY — 190211, 310511, 061210 —
 * ו-Sheets מפרש אותם אוטומטית כתאריכים. ‏getValues מחזיר אז אובייקט
 * Date, ו-String עליו נותן "Sat Feb 19 2011 00:00:00 GMT+0200…"
 * באורך 53 תווים. **בתא נראה 190211, ובקוד מגיע משהו אחר לגמרי.**
 *
 * זה הפיל את כל 22 הכניסות, ושום בדיקה של כותרות או של נרמול לא
 * יכלה לגלות את זה — ‏`?probe=` שהחזיר `firstCodeType: "object"` כן.
 *
 * ההמרה חזרה ל-DDMMYY משחזרת בדיוק את מה שהתלמיד רואה על הפתק.
 */
/**
 * ⚠️ **אזור הזמן נשלף פעם אחת להרצה.**
 *
 * ‏getSpreadsheetTimeZone היא קריאת API לשירות Sheets, לא קריאת
 * זיכרון. ‏cellDate נקראת על כל ערך, וכל 22 הקודים הם תאריכים —
 * כלומר **22 נסיעות הלוך-חזור בכל כניסה בודדת.** זה מה שהפך את
 * התגובה לאיטית מ-45 שניות אחרי שגרסה g עלתה.
 */
var TZ_CACHE = null;

function tz() {
  if (TZ_CACHE) return TZ_CACHE;
  try { TZ_CACHE = SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }
  catch (e) { TZ_CACHE = Session.getScriptTimeZone(); }
  return TZ_CACHE;
}

function cellDate(v) {
  if (Object.prototype.toString.call(v) !== '[object Date]') return null;
  if (isNaN(v.getTime())) return null;
  return Utilities.formatDate(v, tz(), 'ddMMyy');
}

function norm(v) {
  var asDate = cellDate(v);
  if (asDate !== null) v = asDate;
  return String(v == null ? '' : v).replace(BIDI, '').trim();
}

/**
 * ⚠️ **קוד עם אפס מוביל.** ‏050411 בתא שעוצב כמספר נשמר כ-50411,
 *    והתלמיד מקליד את מה שמודפס לו על הפתק. משווים גם מספרית.
 */
function codeEq(a, b) {
  var x = norm(a), y = norm(b);
  if (x === y) return true;
  return /^\d+$/.test(x) && /^\d+$/.test(y) && Number(x) === Number(y);
}

/**
 * ⛔ **הקוד הוא המפתח. השם אינו משתתף בהתאמה.**
 *
 * הגרסה הקודמת דרשה ששניהם יתאימו, וכל 22 הכניסות נדחו — כולל שורות
 * שראיתי בעיניי בגיליון. הכותרות היו נקיות, 22 שורות נקראו, והנרמול
 * רץ. **לא מצאתי את הסיבה, וזה בדיוק למה הורדתי את התלות.**
 *
 * התאמת שמות בעברית שבירה מיסודה: רווח כפול, איות, כתיב מלא מול חסר,
 * וסימנים בלתי נראים שאיש לא רואה בתא. **הקוד ייחודי לכל תלמיד וממילא
 * הוא הסוד היחיד כאן** — דרישת השם לא הוסיפה אבטחה, רק דרך להיכשל.
 *
 * השם שהתלמיד הקליד מוחזר **מהרשימה ולא ממה שהוא כתב**, כך שמי שטעה
 * בכתיב רואה מיד בסרגל העליון בשם מי הוא נכנס.
 */
function doLogin(req) {
  var code = norm(req.code);
  if (!code) return { error: 'חסר קוד' };

  var rows = table('roster');
  var hits = [];
  for (var i = 0; i < rows.length; i++) {
    if (codeEq(rows[i].code, code)) hits.push(rows[i]);
  }

  if (!hits.length) return { error: 'קוד לא נכון' };

  // שני תלמידים עם אותו קוד — כאן השם כן מכריע, וזו הפעם היחידה
  var r = hits[0];
  if (hits.length > 1) {
    var name = norm(req.name);
    for (var j = 0; j < hits.length; j++) {
      if (norm(hits[j].name) === name) { r = hits[j]; break; }
    }
  }

  if (norm(r.active).toLowerCase() === 'no') return { error: 'החשבון אינו פעיל' };
  return {
    token: makeToken(r.id),
    student: { id: r.id, name: r.name, class: r.class },
    state: loadState(r.id),
  };
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
    return { error: 'אלעד לא זמין כרגע — ' + apiError(code, res) };
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

/**
 * ⚠️ **קוד מספרי לבדו אינו אבחון.** ‏400 מ-Anthropic נשא הודעה
 *    מדויקת על מה שגוי בבקשה, והיא נבלעה — מה שהפך תקלה של שורה
 *    אחת לסבב ניחושים. ההודעה עולה החוצה, קצוצה.
 */
function apiError(code, res) {
  var msg = '';
  try {
    var d = JSON.parse(res.getContentText());
    msg = (d.error && d.error.message) || '';
  } catch (e) { msg = res.getContentText().slice(0, 120); }
  return code + (msg ? ': ' + msg.slice(0, 160) : '');
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

// ⚠️ **הרישום לא נסמך על המודל, וזו הכרעה אחרי כישלון.**
//    בבדיקה המודל שאל את השאלות בניסוח מדויק, כיבד never_judge —
//    **והחזיר record: null בכל פעם.** התשובות פשוט לא נרשמו.
//
//    השרת יודע איזו שאלה הוא שאל בתור הקודם, ולכן הוא יכול לזהות
//    דטרמיניסטית על מה התלמיד עונה עכשיו. **המודל אחראי לשפה;
//    הבוקקיפינג הוא של השרת.** אותו עיקרון כמו SPEC §7 עם הטסטים.
//
//    הטביעות הן קטעים ייחודיים מהניסוחים הקבועים ב-onboarding.yml.
//    הניסוח נעול שם ממילא — הוא נשאל שוב מילה במילה בשבוע 30.
// ‏`right` — האם התשובה הלכה לכיוון הנכון. **גם זה דטרמיניסטי.**
// בבדיקה המודל מילא matched באחת מארבע תשובות, וזו העמודה שמזינה
// את הדלתא מול שבוע 30. ‏`correct` כאן זהה ל-onboarding.yml.
//
// ⚠️ **זה לא ציון ולא נאמר לתלמיד** — never_judge. זה רק למורה.
var BASELINE_Q = [
  { id: 'q1_gross_net', probe: 'נכנס לו בפועל',
    right: function (a) {
      if (/פחות|אחרי|ניכוי|מס\b/.test(a)) return true;
      var n = numberIn(a);
      return n !== null && n < 6000;
    } },
  { id: 'q2_percent', probe: 'הנחה של 25',
    right: function (a) { return numberIn(a) === 150; } },
  { id: 'q3_compound', probe: 'ריבית של 10',
    right: function (a) { return numberIn(a) === 1210; } },
  { id: 'q4_loans', probe: 'הלוואה של 10',
    right: function (a) { return /יותר/.test(a); } },
  { id: 'q5_fees', probe: '0.2',
    right: function (a) { return /עצום/.test(a); } },
  { id: 'q6_risk', probe: 'בוודאות',
    right: function (a) { return /פיקדון|פקדון/.test(a); } },
];

/** המספר הראשון בתשובה, בלי פסיקים. "1,210 שקל" → 1210 */
function numberIn(text) {
  var m = String(text).replace(/,/g, '').match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function judge(qid, answer) {
  for (var i = 0; i < BASELINE_Q.length; i++) {
    if (BASELINE_Q[i].id === qid) {
      try { return BASELINE_Q[i].right(String(answer)); } catch (e) { return null; }
    }
  }
  return null;
}

function questionIn(text) {
  var t = String(text || '');
  for (var i = 0; i < BASELINE_Q.length; i++) {
    if (t.indexOf(BASELINE_Q[i].probe) !== -1) return BASELINE_Q[i].id;
  }
  return null;
}

function alreadyRecorded(id, q) {
  var rows = table('baseline');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id) && String(rows[i].q) === q) return true;
  }
  return false;
}

/**
 * השלב נגזר מהשיחה ולא מהצהרת המודל, מאותה סיבה.
 * ⚠️ **רק התור האחרון של אלעד נבדק.** סריקה אחורה על כל השיחה
 *    הייתה מחזירה baseline לנצח — שאלה שנשאלה פעם נשארת בתמלול —
 *    וההתקדמות לא הייתה מגיעה ל"המשימה" אף פעם.
 */
function lastEladTurn(turns) {
  for (var i = turns.length - 1; i >= 0; i--) {
    if (turns[i].role === 'elad') return turns[i];
  }
  return null;
}

function askedCount(turns) {
  var seen = {};
  for (var i = 0; i < turns.length; i++) {
    if (turns[i].role !== 'elad') continue;
    var q = questionIn(turns[i].text);
    if (q) seen[q] = true;
  }
  return Object.keys(seen).length;
}

function stageFrom(turns, done) {
  if (done) return 'handoff';
  var last = lastEladTurn(turns);
  if (last && questionIn(last.text)) return 'baseline';
  if (askedCount(turns) >= BASELINE_Q.length) return 'handoff';
  if (askedCount(turns) > 0) return 'baseline';
  return turns.length >= 3 ? 'role' : 'arrival';
}

/**
 * ⚠️ **הסיום לא נסמך על המודל.** בבדיקה הוא סגר את השיחה כמו שצריך
 *    — "תפתח את המשימה, נדבר תוך כדי" — והחזיר done: false. בלי
 *    הדגל הזה התלמיד **לא מגיע למשימה לעולם**, וזו אותה חסימה
 *    קשה שכבר עלתה כאן פעמיים.
 *
 *    הכלל: שש השאלות נשאלו, אין שאלה פתוחה בתור האחרון, ואלעד
 *    קיבל שני תורים אחרי האחרונה כדי למסור את המשימה.
 */
function doneFrom(turns, modelDone) {
  if (modelDone) return true;
  if (askedCount(turns) < BASELINE_Q.length) return false;

  var since = 0, hit = false;
  for (var i = turns.length - 1; i >= 0; i--) {
    if (turns[i].role !== 'elad') continue;
    if (questionIn(turns[i].text)) { hit = true; break; }
    since += 1;
  }
  return hit && since >= 2;
}

var STAGE_AVATAR = {
  arrival: 'neutral', role: 'explaining',
  baseline: 'thinking', handoff: 'presenting',
};

/**
 * השאלה הבאה בתור, לפי מה שכבר נשאל. **הניסוחים כאן חייבים להיות
 * זהים לאלה שב-onboarding.yml** — הם נשאלים שוב מילה במילה בשבוע 30.
 */
var BR = String.fromCharCode(10);

var STEMS = {
  q1_gross_net: 'חבר שלך מספר שהוא התחיל לעבוד ומרוויח 6,000 שקל בחודש. כמה כסף לדעתך נכנס לו בפועל לחשבון?',
  q2_percent: 'מוצר עולה 200 שקל ויש עליו הנחה של 25%. כמה תשלם?',
  q3_compound: 'שמת 1,000 שקל בבנק בריבית של 10% לשנה. כמה יהיה לך אחרי שנתיים?',
  q4_loans: 'לקחת הלוואה של 10,000 שקל ואתה מחזיר אותה על פני שלוש שנים. בסך הכול תחזיר יותר מ-10,000, פחות, או בדיוק 10,000?',
  q5_fees: 'שתי קרנות פנסיה משיגות בדיוק אותה תשואה. אחת גובה דמי ניהול של 0.2% והשנייה 2%. אחרי 30 שנה ההפרש בכסף יהיה: זניח, בינוני, או עצום?',
  q6_risk: 'יש לך כסף שתצטרך בעוד חודש. עדיף לשים אותו בהשקעה שיכולה לעלות 10% או לרדת 10%, או בפיקדון שנותן 2% בוודאות?',
};

function nextQuestion(turns, justSaid) {
  var asked = {};
  for (var i = 0; i < turns.length; i++) {
    if (turns[i].role !== 'elad') continue;
    var q = questionIn(turns[i].text);
    if (q) asked[q] = true;
  }
  if (questionIn(justSaid)) return null;          // כבר שאל, רק בלי סימן

  for (var k = 0; k < BASELINE_Q.length; k++) {
    var id = BASELINE_Q[k].id;
    if (!asked[id]) {
      // הראשונה מקבלת מסגור, כדי שלא תיפול על התלמיד מהאוויר
      return (k === 0)
        ? 'לפני שאתה נוגע במשימה הראשונה — יש לי שש שאלות קצרות על כסף. ' +
          'זה לא מבחן ואין לזה קשר לציון.' + BR + BR + STEMS[id]
        : STEMS[id];
    }
  }
  return 'אתה יודע מה ההבדל בין ברוטו לנטו?';      // handoff
}

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

  // ⛔ **חייב להיגמר בהודעת תלמיד.** היסטוריה שנגמרת בתור של אלעד
  //    היא prefill, והמודל דוחה אותה ב-400. זה קורה בכל פתיחה מחדש
  //    של שיחה שנקטעה — התלמיד סגר את הדפדפן אחרי שאלעד דיבר.
  if (!history.length || history[history.length - 1].role !== 'user') {
    history.push({ role: 'user', content: '(התלמיד נכנס)' });
  }

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // ‏low ולא medium. השיחה מובנית היטב בתדריך ואינה דורשת עומק —
      // ומול תלמיד שמחכה, כל שנייה כאן נמדדת.
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: ONBOARD_SYSTEM_PROMPT,
                 cache_control: { type: 'ephemeral' } }],
      messages: history,
    }),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    return { error: 'אלעד לא זמין כרגע — ' + apiError(res.getResponseCode(), res) };
  }

  var raw = '';
  var content = JSON.parse(res.getContentText()).content;
  for (var i = 0; i < content.length; i++) {
    if (content[i].type === 'text') raw += content[i].text;
  }

  var out = parseOnboard(raw);

  // על איזו שאלה התלמיד ענה עכשיו — לפי מה שאלעד שאל בתור הקודם
  var prev = null;
  for (var j = turns.length - 1; j >= 0; j--) {
    if (turns[j].role === 'elad') { prev = turns[j]; break; }
  }
  var answered = (text && prev) ? questionIn(prev.text) : null;

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (text) sheet('onboard').appendRow([new Date(), id, 'student', text]);
    sheet('onboard').appendRow([new Date(), id, 'elad', out.say]);

    if (answered && !alreadyRecorded(id, answered)) {
      // ‏q, התשובה **וההתאמה** — כולם מהשרת. מהמודל נלקח רק ה-note,
      // שהוא היחיד שבאמת דורש שיפוט: נימוק שהתלמיד נתן מיוזמתו.
      var rec = (out.record && out.record.q === answered) ? out.record : {};
      var ok = judge(answered, text);
      sheet('baseline').appendRow([
        new Date(), id, nameOf(id), answered, text,
        ok === true ? 'yes' : (ok === false ? 'no' : ''),
        String(rec.note || ''),
      ]);
    }
  } finally {
    lock.releaseLock();
  }

  // ⚠️ **רשת ביטחון למבוי סתום.** הכלל כתוב בפרומפט, והמודל שבר אותו
  //    פעמיים: הודעה נכונה לגמרי שמסתיימת בנקודה, ולתלמיד אין מה
  //    להקליד. **אם אין סימן שאלה ולא סיימנו — מוסיפים את השאלה
  //    הבאה בתור.** דטרמיניסטי, ולכן לא יישבר שוב.
  //    ⛔ **וגם הודעה ריקה.** קרה בפועל בסוף שש השאלות: אלעד החזיר
  //       say ריק, התלמיד ראה בועה ריקה, ורק אחרי ששאל "לאן ממשיכים"
  //       השיחה התקדמה. ריק הוא מבוי סתום חמור יותר מנקודה.
  if (!out.done && out.say.indexOf('?') === -1) {
    var next = nextQuestion(turns, out.say);
    if (next) out.say = out.say ? out.say + '\n\n' + next : next;
  }
  if (!out.say) out.say = 'בוא נמשיך. יש לך שאלה לפני שנתחיל?';

  // השלב, האווטאר והסיום נגזרים מהשיחה. הצהרת המודל היא רמז, לא מקור.
  turns.push({ role: 'elad', text: out.say });
  out.done = doneFrom(turns, out.done);
  out.stage = stageFrom(turns, out.done);
  out.avatar = STAGE_AVATAR[out.stage] || out.avatar || 'neutral';

  if (out.done) markOnboarded(id);
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
  // ⚠️ **גם הכותרות מנורמלות.** כותרת עם רווח נגרר נותנת o['name ']
  //    במקום o['name'], ואז r.name הוא undefined — וכל שורה נכשלת
  //    בהשוואה בלי שום סימן שמשהו לא בסדר.
  return body.map(function (row) {
    var o = {};
    head.forEach(function (h, i) { o[norm(h)] = row[i]; });
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
    .addItem('תקן קודים שהפכו לתאריכים', 'fixCodeColumn')
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

/**
 * מחזיר את עמודת הקודים לטקסט, ומקבע את התצוגה כטקסט רגיל.
 *
 * ⚠️ **השרת כבר מסתדר עם תאריכים** — ‏norm ממיר אותם חזרה. הפונקציה
 *    הזאת מיותרת לתפקוד ונחוצה לשפיות: קוד שנראה בתא כמו `19/02/2011`
 *    הוא קוד שאי אפשר להקריא לתלמיד.
 */
function fixCodeColumn() {
  var sh = sheet('roster');
  var last = sh.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert('אין שורות ב-roster'); return; }

  var rng = sh.getRange(2, 3, last - 1, 1);      // עמודה C = code
  var vals = rng.getValues();
  var fixed = 0;
  for (var i = 0; i < vals.length; i++) {
    var d = cellDate(vals[i][0]);
    if (d !== null) { vals[i][0] = d; fixed++; }
    else vals[i][0] = norm(vals[i][0]);
  }
  rng.setNumberFormat('@');                      // טקסט רגיל, לא תאריך
  rng.setValues(vals);

  SpreadsheetApp.getUi().alert(
    fixed + ' קודים היו תאריכים והוחזרו לטקסט.\n\n' +
    'העמודה מקובעת עכשיו כטקסט — הדבקה חדשה לא תהפוך שוב.');
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
