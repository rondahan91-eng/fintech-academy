/* ══════════════════════════════════════════════════════════════════════
   machine-check.js · האם המחשב הזה יריץ פייתון, ואם לא — למה

   מקור אמת יחיד לשלושה צרכנים:
     ‏login.html   → fast() בטעינה. אזהרה מוקדמת, לפני שהתלמיד עובד.
     ‏app.js       → full() כשהעלייה של Pyodide נכשלת. סיבה במקום שגיאה גולמית.
     ‏check.html   → הכל, כדף אבחון למורה.

   ⚠️ **תג רגיל, ES5 בלבד. בלי מודול, בלי חיצים, בלי let/const, בלי fetch.**
      הקובץ הזה מאבחן דפדפנים שבורים, ולכן הוא חייב לרוץ עליהם.
      מודול עם תחביר מודרני מת בשקט בדיוק במחשב שרצינו לאבחן, והתלמיד
      מקבל מסך ריק במקום הסבר.

   ⚠️ **שום דבר כאן לא חוסם את הכניסה.** שיחת הקליטה כולה עובדת בלי
      פייתון — היא צ'אט. תלמיד במחשב בלי WebAssembly עדיין יכול להיקלט,
      ולכן אזהרה, לא חסימה. ראה login.js.
   ══════════════════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  var FILES = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm',
               'python_stdlib.zip', 'pyodide-lock.json'];

  /* גדלים של Pyodide 0.26.2. **מידע, לא פסק דין** — אחרי שדרוג גרסה הם
     ישתנו, ואי אפשר לסמוך עליהם כדי לקבוע תקינות. מה שקובע הוא חתימת
     הקובץ ומספר הבתים שהובטח בכותרת מול מה שהגיע בפועל. */
  var EXPECT = {
    'pyodide.js':        14767,
    'pyodide.asm.js':    1229628,
    'pyodide.asm.wasm':  10087885,
    'python_stdlib.zip': 2341761,
    'pyodide-lock.json': 105980
  };

  /* מתחת לזה Pyodide 0.26 לא עולה, או עולה ומתרסק. */
  var MIN = { Chrome: 90, Edg: 90, Firefox: 90, Safari: 15 };

  /* מודול wasm חוקי ומינימלי: כותרת בלבד. שמונה בתים. */
  var TINY = [0, 0x61, 0x73, 0x6d, 1, 0, 0, 0];

  /* ───────────────────────── סביבה ───────────────────────── */

  function env() {
    var ua = '';
    try { ua = navigator.userAgent || ''; } catch (e) {}
    var fam = '', ver = 0;
    var m = ua.match(/(Edg|Chrome|Firefox|Version)\/(\d+)/);
    if (m) { fam = m[1] === 'Version' ? 'Safari' : m[1]; ver = parseInt(m[2], 10); }
    /* Edge מדווח גם Chrome. מי שמופיע אחרון בזיהוי הוא הדפדפן האמיתי. */
    if (/Edg\//.test(ua)) { fam = 'Edg'; ver = parseInt(ua.match(/Edg\/(\d+)/)[1], 10); }
    var o = {
      ua: ua,
      family: fam,
      version: ver,
      label: fam ? (fam === 'Edg' ? 'Edge' : fam) + ' ' + ver : 'דפדפן לא מזוהה',
      ie: /Trident|MSIE/.test(ua),
      wasm: false,
      deviceMemory: 0,
      secure: true
    };
    try { o.wasm = (typeof WebAssembly === 'object' && !!WebAssembly.validate); } catch (e) {}
    try { o.deviceMemory = navigator.deviceMemory || 0; } catch (e) {}
    try { o.secure = window.isSecureContext !== false; } catch (e) {}
    return o;
  }

  /* שורה אחת שאפשר להקריא בטלפון. */
  function line() {
    var e = env(), b = [e.label, 'wasm:' + (e.wasm ? 'יש' : 'אין')];
    if (e.deviceMemory) b.push(e.deviceMemory + 'GB');
    if (!e.secure) b.push('לא-מאובטח');
    return b.join(' · ');
  }

  /* ───────────────── בדיקה מיידית · ללא רשת ─────────────────
     עולה פחות ממילישנייה. בטוחה לקריאה בכל עמוד, בכל טעינה. */

  function fast() {
    var e;
    try { e = env(); } catch (err) {
      return { ok: true, code: 'UNKNOWN', title: '', detail: '', env: null };
    }

    /* ⚠️ ברירת המחדל היא **עובר**. בדיקה שלא הצליחה לקבוע כלום לא
       מדווחת תקלה — מוטב לפספס מחשב שבור מאשר להבהיל כיתה שלמה
       בגלל באג שלי. */
    function bad(code, title, detail) {
      return { ok: false, code: code, title: title, detail: detail, env: e };
    }

    if (e.ie) {
      return bad('MC-IE', 'הדף נפתח ב-Internet Explorer',
        'הדפדפן הזה לא מריץ קוד פייתון. פתח את אותה כתובת ב-Chrome או ב-Edge.');
    }
    if (!e.wasm) {
      return bad('MC-WASM', 'הדפדפן לא תומך בהרצת קוד',
        'רכיב WebAssembly חסר או חסום במחשב הזה. אין מה להתקין — צריך דפדפן מעודכן, או שמדיניות בית הספר חוסמת אותו.');
    }

    var tiny;
    try { tiny = new Uint8Array(TINY); } catch (err) { return { ok: true, code: 'UNKNOWN', env: e }; }

    var valid = false;
    try { valid = WebAssembly.validate(tiny); } catch (err) {}
    if (!valid) {
      return bad('MC-BLOCK', 'הרצת קוד חסומה במחשב הזה',
        'הדפדפן דוחה אפילו תוכנית בדיקה ריקה ותקינה. כמעט תמיד זו מדיניות ארגונית או אנטי-וירוס. זה משהו שאנשי המחשוב צריכים לראות.');
    }
    try { new WebAssembly.Module(tiny); } catch (err) {
      return bad('MC-BLOCK', 'הרצת קוד חסומה במחשב הזה',
        'קומפילציה של תוכנית בדיקה נכשלה: ' + (err && err.message ? err.message : String(err)));
    }

    if (e.version && MIN[e.family] && e.version < MIN[e.family]) {
      return bad('MC-OLD', 'הדפדפן ישן מדי',
        'נדרש ' + (e.family === 'Edg' ? 'Edge' : e.family) + ' ' + MIN[e.family] +
        ' ומעלה, והמחשב הזה מריץ ' + e.version + '. עדכן את הדפדפן או פתח את הכתובת בדפדפן אחר.');
    }

    return { ok: true, code: 'OK', title: '', detail: '', env: e };
  }

  /* ───────────────────── זיכרון ─────────────────────
     Pyodide צריך כ-256MB. גדלים בקפיצות קטנות ומשחררים מיד, כדי לא
     להפיל את הלשונית על מחשב חלש — קריסת לשונית לא מגיעה לשום catch
     ולא משאירה לתלמיד שום הודעה. */

  function memoryMB() {
    var pages = 0, mem = null;
    try {
      mem = new WebAssembly.Memory({ initial: 16 });
      pages = 16;
      var steps = [256, 1024, 2048, 4096];
      for (var i = 0; i < steps.length; i++) {
        mem.grow(steps[i] - pages);
        pages = steps[i];
      }
    } catch (e) {}
    mem = null;
    return Math.round(pages / 16);
  }

  /* ───────────────── הקבצים · דורש רשת ─────────────────
     ‏XHR ולא fetch: fetch חסר בדיוק בדפדפנים שאנחנו מנסים לזהות. */

  function grab(url, cb) {
    var x;
    try { x = new XMLHttpRequest(); }
    catch (e) { cb({ err: 'אין XMLHttpRequest' }); return; }
    x.open('GET', url, true);
    try { x.responseType = 'arraybuffer'; } catch (e) {}
    x.onreadystatechange = function () {
      if (x.readyState !== 4) return;
      var o = { status: x.status, ct: '', enc: '', promised: 0, len: 0, magic: '' };
      try { o.ct = x.getResponseHeader('Content-Type') || ''; } catch (e) {}
      try { o.enc = x.getResponseHeader('Content-Encoding') || ''; } catch (e) {}
      try { o.promised = parseInt(x.getResponseHeader('Content-Length') || '0', 10) || 0; } catch (e) {}
      try {
        if (x.response && x.response.byteLength !== undefined) {
          o.len = x.response.byteLength;
          var b = new Uint8Array(x.response), h = [], n = Math.min(4, b.length);
          for (var i = 0; i < n; i++) {
            var s = b[i].toString(16);
            h.push(s.length < 2 ? '0' + s : s);
          }
          o.magic = h.join(' ');
        } else if (x.responseText) { o.len = x.responseText.length; }
      } catch (e) {}
      cb(o);
    };
    x.onerror = function () { cb({ err: 'החיבור נכשל' }); };
    try { x.send(null); } catch (e) { cb({ err: String(e && e.message) }); }
  }

  /* ⚠️ **סטטוס 200 אינו הוכחה לכלום.** סינון אינטרנט של בית ספר מחזיר
     דף חסימה עם 200 ועם Content-Type של HTML. מה שקובע הוא חתימת
     הקובץ: wasm מתחיל ב-00 61 73 6D, ו-zip מתחיל ב-PK.
     גודל מול EXPECT הוא אזהרה בלבד — הוא משתנה בכל שדרוג Pyodide. */
  function judge(o, nm) {
    if (o.err) return { bad: true, note: o.err, kind: 'net' };
    if (o.status !== 200) return { bad: true, note: 'HTTP ' + o.status, kind: 'net' };
    /* ⚠️ **רק כשהקובץ לא מכווץ.** ‏GitHub Pages שולח ארבעה מחמשת הקבצים
       ב-gzip: הכותרת נותנת את הגודל המכווץ, והדפדפן מוסר את הגודל אחרי
       פריסה. בלי התנאי הזה כל מחשב תקין בכיתה סומן "קוצץ" (נבדק מול
       האתר החי, 2026-09-17). */
    var packed = o.enc && !/^\s*identity\s*$/i.test(o.enc);
    if (!packed && o.promised && o.len && o.promised !== o.len) {
      return { bad: true, note: 'קוצץ באמצע', kind: 'cut' };
    }
    if (nm === 'pyodide.asm.wasm' && o.magic && o.magic !== '00 61 73 6d') {
      return { bad: true, note: 'לא קובץ wasm', kind: 'blocked' };
    }
    if (nm === 'python_stdlib.zip' && o.magic && o.magic.substr(0, 5) !== '50 4b') {
      return { bad: true, note: 'לא קובץ zip', kind: 'blocked' };
    }
    if (/text\/html/i.test(o.ct)) return { bad: true, note: 'התקבל דף HTML', kind: 'blocked' };
    if (EXPECT[nm] && o.len && o.len !== EXPECT[nm]) {
      return { bad: false, warn: true, note: 'גודל שונה מהצפוי', kind: 'size' };
    }
    return { bad: false, note: 'תקין', kind: 'ok' };
  }

  function files(base, cb) {
    var out = [], i = 0;
    function step() {
      if (i >= FILES.length) { cb(out); return; }
      var nm = FILES[i];
      grab(base + nm, function (res) {
        res.nm = nm;
        res.expect = EXPECT[nm] || 0;
        res.verdict = judge(res, nm);
        out.push(res);
        i++;
        step();
      });
    }
    step();
  }

  /* ─────────────── האבחון המלא, בשורה אחת של סיבה ───────────────
     ‏app.js קורא לזה אחרי שהעלייה נכשלה, כדי להחליף "שגיאה גולמית"
     ב"למה זה קרה ומה לעשות". */

  function full(base, cb) {
    var f = fast();
    if (!f.ok) { cb({ code: f.code, title: f.title, detail: f.detail, files: null, mem: 0 }); return; }

    var mem = memoryMB();
    files(base, function (list) {
      var broken = [], cut = false, blocked = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].verdict.bad) {
          broken.push(list[i].nm);
          if (list[i].verdict.kind === 'cut') cut = true;
          if (list[i].verdict.kind === 'blocked') blocked = true;
        }
      }
      if (broken.length) {
        cb({
          code: blocked ? 'MC-FILTER' : cut ? 'MC-CUT' : 'MC-NET',
          title: blocked ? 'סינון האינטרנט חוסם את קבצי פייתון'
                         : 'קבצי פייתון לא ירדו במלואם',
          detail: 'הקבצים שנפגעו: ' + broken.join(', ') + '. ' +
                  (blocked
                    ? 'השרת החזיר דף חסימה במקום הקובץ. צריך שאנשי המחשוב יאשרו את הכתובת הזו.'
                    : 'ההורדה נקטעה באמצע. נסה לרענן; אם זה חוזר, זו הרשת של בית הספר.'),
          files: list, mem: mem
        });
        return;
      }
      if (mem && mem < 128) {
        cb({
          code: 'MC-MEM',
          title: 'אין מספיק זיכרון פנוי',
          detail: 'הצלחתי להקצות רק ' + mem + 'MB, ופייתון צריך כ-256MB. סגור לשוניות ותוכנות אחרות ונסה שוב.',
          files: list, mem: mem
        });
        return;
      }
      cb({
        code: 'MC-UNKNOWN',
        title: 'פייתון לא עלה, והבדיקות לא מצאו למה',
        detail: 'הדפדפן, הקבצים והזיכרון כולם תקינים. הראה את השורה הזו למורה.',
        files: list, mem: mem
      });
    });
  }

  root.MachineCheck = {
    FILES: FILES, EXPECT: EXPECT, MIN: MIN,
    env: env, line: line, fast: fast, memoryMB: memoryMB,
    files: files, judge: judge, full: full
  };

})(window);
