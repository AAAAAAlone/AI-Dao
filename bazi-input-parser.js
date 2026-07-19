const CHINESE_DIGITS = { '零': 0, '〇': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function chineseInteger(value) {
  if (!value) return NaN;
  if (/^\d+$/.test(value)) return Number(value);
  if ([...value].every((char) => char in CHINESE_DIGITS)) {
    return Number([...value].map((char) => CHINESE_DIGITS[char]).join(''));
  }
  let total = 0;
  let current = 0;
  for (const char of value) {
    if (char in CHINESE_DIGITS) current = CHINESE_DIGITS[char];
    else if (char === '十') { total += (current || 1) * 10; current = 0; }
    else if (char === '百') { total += (current || 1) * 100; current = 0; }
    else if (char === '千') { total += (current || 1) * 1000; current = 0; }
  }
  return total + current;
}

function normalize(text) {
  return String(text || '')
    .trim()
    .replace(/[０-９]/g, (char) => String(char.charCodeAt(0) - 0xfee0))
    .replace(/[：]/g, ':')
    .replace(/[－–—−]/g, '-')
    .replace(/[，,]/g, ' ')
    .replace(/\s+/g, ' ');
}

function pad(value) { return String(value).padStart(2, '0'); }

function validDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function makeResult(year, month, day, hour = 12, minute = 0, extras = {}) {
  if (!validDate(year, month, day) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { date: `${year}-${pad(month)}-${pad(day)}`, time: `${pad(hour)}:${pad(minute)}`, ...extras };
}

export function parseBaziClipboard(text) {
  const value = normalize(text);
  if (!value) return null;
  const extras = {};
  if (/女(?:命|性)?/.test(value)) extras.gender = 'female';
  else if (/男(?:命|性)?/.test(value)) extras.gender = 'male';
  if (/农历|阴历/.test(value)) extras.calendarType = 'lunar';
  else if (/公历|阳历/.test(value)) extras.calendarType = 'solar';

  const shichenMatch = value.match(new RegExp(`([${SHICHEN.join('')}])时(?:辰)?`));
  if (/晚子时|子初/.test(value)) extras.shichen = '晚子时';
  else if (shichenMatch) extras.shichen = `${shichenMatch[1]}时`;

  // 带年月日单位，可识别阿拉伯数字、逐字中文年份及中文数词月日。
  const unitPattern = /([0-9零〇一二两三四五六七八九十百千]{2,})\s*年\s*([0-9零〇一二两三四五六七八九十]{1,3})\s*月\s*([0-9零〇一二两三四五六七八九十]{1,3})\s*(?:日|号)?(?:\s*(?:上午|下午|晚上|早上|凌晨)?\s*([0-9零〇一二两三四五六七八九十]{1,3})\s*(?:点|时|:)\s*([0-9零〇一二两三四五六七八九十]{1,3})?\s*分?)?/;
  const unit = value.match(unitPattern);
  if (unit) {
    let hour = unit[4] ? chineseInteger(unit[4]) : 12;
    const minute = unit[5] ? chineseInteger(unit[5]) : 0;
    const prefix = unit[0];
    if ((/下午|晚上/.test(prefix)) && hour < 12) hour += 12;
    if (/凌晨/.test(prefix) && hour === 12) hour = 0;
    return makeResult(chineseInteger(unit[1]), chineseInteger(unit[2]), chineseInteger(unit[3]), hour, minute, extras);
  }

  // 常见分隔格式：2000-02-03-6:36、2000/2/3 06:36、2000.2.3 6时36分。
  const numeric = value.match(/(?:^|\D)(\d{4})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})(?:\s*(?:[-T ]|\s)\s*(\d{1,2})(?:\s*(?::|点|时)\s*(\d{1,2}))?)?/);
  if (numeric) return makeResult(Number(numeric[1]), Number(numeric[2]), Number(numeric[3]), numeric[4] ? Number(numeric[4]) : 12, numeric[5] ? Number(numeric[5]) : 0, extras);

  return null;
}

export function shichenMidpoint(shichen) {
  if (String(shichen || '') === '晚子时') return '23:30';
  const index = SHICHEN.indexOf(String(shichen || '').replace('时', ''));
  if (index < 0) return null;
  const hour = index === 0 ? 0 : index * 2;
  return `${pad(hour)}:00`;
}
