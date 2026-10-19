// ══════════════════════════════════════════════════════════════════════
//  צביעת תחביר — שדרוג דרגה D2
//
//  **שכבה מתחת ל-textarea, לא החלפה שלו.** התלמיד ממשיך להקליד
//  ב-textarea אמיתי: בחירה, גזירה, ביטול, הדבקה, מקריא-מסך והתנהגות
//  המקלדת של הדפדפן נשארות כפי שהן. מה שמשתנה הוא שהטקסט שלו הופך
//  שקוף, ומתחתיו יושב <pre> עם אותו טקסט בדיוק, צבוע.
//
//  ⚠️ **שתי השכבות חייבות לשבור שורות באותו מקום.** כל הבדל בגופן,
//     בריפוד, ברוחב או בכללי השבירה מזיז את הטקסט הצבוע ביחס לסמן.
//     ‏styles.css מחזיק את שני הסלקטורים צמודים זה לזה בדיוק בגלל זה.
//
//  ⚠️ **ה-span-ים אינם משנים דו-כיווניות.** ‏unicode-bidi: plaintext
//     יושב על ה-pre ופועל על תוכן הטקסט; אלמנט inline שמגדיר רק color
//     אינו פותח הקשר דו-כיווני חדש, ולכן הערה בעברית מסתדרת מתחת
//     בדיוק כמו ב-textarea. **אל תוסיף כאן direction או unicode-bidi
//     על ה-span-ים** — זה מה שישבור את היישור.
// ══════════════════════════════════════════════════════════════════════

const KEYWORDS = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
  'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
  'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

// ⚠️ **‏self אינו מילה שמורה בפייתון** — הוא שם פרמטר ככל שם אחר.
//    הוא צבוע כאן כי בשבוע 2 הוא מופיע בכל שורה במחלקה, ותלמיד
//    שרואה אותו בולט מבין מהר יותר שהוא אותו דבר בכל המתודות.
const CONSTANTS = new Set(['True', 'False', 'None', 'self']);

// הפונקציות המובנות שהקורס נוגע בהן. לא כל פייתון — רק מה שתלמיד
// עשוי לכתוב, כדי שצבע יסמן "זה קיים מראש" ולא "זה משהו שהכרתי".
const BUILTINS = new Set([
  'abs', 'all', 'any', 'bin', 'bool', 'chr', 'dict', 'divmod',
  'enumerate', 'filter', 'float', 'format', 'getattr', 'hasattr', 'hex',
  'input', 'int', 'isinstance', 'len', 'list', 'map', 'max', 'min',
  'open', 'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round',
  'set', 'setattr', 'sorted', 'str', 'sum', 'super', 'tuple', 'type',
  'zip',
]);

// ⚠️ **מחרוזת בגרש בודד אינה חוצה שורה.** בלי ה-\n ברשימת ההחרגה,
//    גרש פתוח אחד באמצע הקלדה היה צובע את שארית הקובץ כמחרוזת.
//    משולשת כן חוצה שורות, וזו ההתנהגות הנכונה שלה.
const TOKEN = new RegExp([
  '"""[\\s\\S]*?"""',
  "'''[\\s\\S]*?'''",
  '"(?:\\\\.|[^"\\\\\\n])*"',
  "'(?:\\\\.|[^'\\\\\\n])*'",
  '#[^\\n]*',
  '\\b\\d[\\d_]*(?:\\.\\d*)?(?:[eE][+-]?\\d+)?\\b',
  '\\b[A-Za-z_]\\w*\\b',
].join('|'), 'g');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrap(cls, text) {
  return `<span class="t-${cls}">${esc(text)}</span>`;
}

/**
 * מקבל את הקוד כטקסט ומחזיר HTML צבוע.
 *
 * ⚠️ **תמיד מוסיף שורה חדשה בסוף.** ‏<pre> בולע את תו השורה האחרון,
 *    ובלי זה שורה ריקה בסוף הקוד הייתה נעלמת מהשכבה הצבועה בזמן
 *    שב-textarea היא קיימת — וכל הגלילה בתחתית הייתה זזה בשורה.
 */
export function highlight(code) {
  let out = '';
  let last = 0;
  let afterDef = false;          // השם שאחרי def/class מקבל צבע משלו

  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    last = m.index + m[0].length;

    const t = m[0];
    const head = t[0];

    if (head === '#') {
      out += wrap('com', t);
    } else if (head === '"' || head === "'") {
      out += wrap('str', t);
    } else if (head >= '0' && head <= '9') {
      out += wrap('num', t);
    } else if (afterDef) {
      out += wrap('def', t);
      afterDef = false;
    } else if (KEYWORDS.has(t)) {
      out += wrap('kw', t);
      afterDef = (t === 'def' || t === 'class');
    } else if (CONSTANTS.has(t)) {
      out += wrap('const', t);
    } else if (BUILTINS.has(t)) {
      out += wrap('bi', t);
    } else {
      out += esc(t);
    }
  }
  out += esc(code.slice(last));
  return `${out}\n`;
}
