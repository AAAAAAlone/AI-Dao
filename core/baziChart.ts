import lunar from 'lunar-javascript';

const { Solar, Lunar, LunarUtil } = lunar as any;

export type CalendarType = 'solar' | 'lunar';
export type Gender = 'male' | 'female';
export type DayBoundary = '23:00' | '00:00';

export interface BaziChartInput {
  name?: string;
  gender: Gender;
  calendarType: CalendarType;
  date: string;
  time: string;
  isLeapMonth?: boolean;
  locationName: string;
  longitude: number;
  timezone: string;
  trueSolarTime: boolean;
  dayBoundary: DayBoundary;
  yunSect: 1 | 2;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

interface ShenShaContext {
  dayGan: string;
  dayZhi: string;
  yearZhi: string;
  monthZhi: string;
}

interface StarMatch {
  id: string;
  name: string;
  basis: string;
}

const PILLAR_KEYS = ['Year', 'Month', 'Day', 'Time'] as const;
const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];
const GAN_ELEMENT: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const TIAN_YI: Record<string, string[]> = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['寅', '午'],
};
const WEN_CHANG: Record<string, string> = { 甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' };
const TAI_JI: Record<string, string[]> = {
  甲: ['子', '午'], 乙: ['子', '午'], 丙: ['卯', '酉'], 丁: ['卯', '酉'],
  戊: ['辰', '戌', '丑', '未'], 己: ['辰', '戌', '丑', '未'],
  庚: ['寅', '亥'], 辛: ['寅', '亥'], 壬: ['巳', '申'], 癸: ['巳', '申'],
};
const GUO_YIN: Record<string, string> = { 甲: '戌', 乙: '亥', 丙: '丑', 丁: '寅', 戊: '丑', 己: '寅', 庚: '辰', 辛: '巳', 壬: '未', 癸: '申' };
const LU_SHEN: Record<string, string> = { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
const YANG_REN: Record<string, string> = { 甲: '卯', 乙: '寅', 丙: '午', 丁: '巳', 戊: '午', 己: '巳', 庚: '酉', 辛: '申', 壬: '子', 癸: '亥' };
const HONG_LUAN: Record<string, string> = { 子: '卯', 丑: '寅', 寅: '丑', 卯: '子', 辰: '亥', 巳: '戌', 午: '酉', 未: '申', 申: '未', 酉: '午', 戌: '巳', 亥: '辰' };
const TIAN_XI: Record<string, string> = { 子: '酉', 丑: '申', 寅: '未', 卯: '午', 辰: '巳', 巳: '辰', 午: '卯', 未: '寅', 申: '丑', 酉: '子', 戌: '亥', 亥: '戌' };
const TIAN_DE: Record<string, string> = { 寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲', 申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚' };
const YUE_DE: Record<string, string> = { 寅: '丙', 午: '丙', 戌: '丙', 亥: '甲', 卯: '甲', 未: '甲', 申: '壬', 子: '壬', 辰: '壬', 巳: '庚', 酉: '庚', 丑: '庚' };

const TRIAD_RULES: Record<string, Record<string, string>> = {
  驿马: { 申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申', 巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳' },
  桃花: { 申: '酉', 子: '酉', 辰: '酉', 寅: '卯', 午: '卯', 戌: '卯', 巳: '午', 酉: '午', 丑: '午', 亥: '子', 卯: '子', 未: '子' },
  华盖: { 申: '辰', 子: '辰', 辰: '辰', 寅: '戌', 午: '戌', 戌: '戌', 巳: '丑', 酉: '丑', 丑: '丑', 亥: '未', 卯: '未', 未: '未' },
  将星: { 申: '子', 子: '子', 辰: '子', 寅: '午', 午: '午', 戌: '午', 巳: '酉', 酉: '酉', 丑: '酉', 亥: '卯', 卯: '卯', 未: '卯' },
  劫煞: { 申: '巳', 子: '巳', 辰: '巳', 寅: '亥', 午: '亥', 戌: '亥', 巳: '寅', 酉: '寅', 丑: '寅', 亥: '申', 卯: '申', 未: '申' },
  亡神: { 申: '亥', 子: '亥', 辰: '亥', 寅: '巳', 午: '巳', 戌: '巳', 巳: '申', 酉: '申', 丑: '申', 亥: '寅', 卯: '寅', 未: '寅' },
  灾煞: { 申: '午', 子: '午', 辰: '午', 寅: '子', 午: '子', 戌: '子', 巳: '卯', 酉: '卯', 丑: '卯', 亥: '酉', 卯: '酉', 未: '酉' },
};

function pad(n: number): string { return String(n).padStart(2, '0'); }
function formatParts(p: DateParts): string { return `${p.year}-${pad(p.month)}-${pad(p.day)} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`; }

function parseInputDate(date: string, time: string): DateParts {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  const tm = /^(\d{2}):(\d{2})$/.exec(String(time || ''));
  if (!dm || !tm) throw new Error('请填写完整的出生日期和时间');
  const p = { year: +dm[1], month: +dm[2], day: +dm[3], hour: +tm[1], minute: +tm[2], second: 0 };
  if (p.year < 1900 || p.year > 2100) throw new Error('出生年份暂支持 1900—2100 年');
  if (p.month < 1 || p.month > 12 || p.day < 1 || p.day > 31 || p.hour > 23 || p.minute > 59) throw new Error('出生日期或时间格式有误');
  return p;
}

function timezoneParts(date: Date, timezone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => +(parts.find(p => p.type === type)?.value || 0);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') };
}

function offsetAtInstant(timezone: string, instant: number): number {
  const p = timezoneParts(new Date(instant), timezone);
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - instant) / 60000);
}

function offsetForLocal(timezone: string, p: DateParts): number {
  const localAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  let offset = offsetAtInstant(timezone, localAsUtc);
  offset = offsetAtInstant(timezone, localAsUtc - offset * 60000);
  return offset;
}

function standardOffsetForYear(timezone: string, year: number): number {
  const jan: DateParts = { year, month: 1, day: 15, hour: 12, minute: 0, second: 0 };
  const jul: DateParts = { year, month: 7, day: 15, hour: 12, minute: 0, second: 0 };
  return Math.min(offsetForLocal(timezone, jan), offsetForLocal(timezone, jul));
}

function dayOfYear(p: DateParts): number {
  return Math.floor((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 0)) / 86400000);
}

function equationOfTimeMinutes(p: DateParts): number {
  const gamma = 2 * Math.PI / 365 * (dayOfYear(p) - 1 + (p.hour - 12) / 24);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
}

function shiftParts(p: DateParts, minutes: number): DateParts {
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) + minutes * 60000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds() };
}

function validateTimezone(timezone: string): void {
  try { new Intl.DateTimeFormat('zh-CN', { timeZone: timezone }).format(new Date()); }
  catch { throw new Error('时区名称无效，请重新选择出生地点'); }
}

function normalizeCivilDate(input: BaziChartInput, raw: DateParts): DateParts {
  if (input.calendarType === 'solar') {
    const d = new Date(Date.UTC(raw.year, raw.month - 1, raw.day));
    if (d.getUTCFullYear() !== raw.year || d.getUTCMonth() + 1 !== raw.month || d.getUTCDate() !== raw.day) throw new Error('公历出生日期不存在');
    return raw;
  }
  try {
    const lunarMonth = input.isLeapMonth ? -raw.month : raw.month;
    const solar = Lunar.fromYmdHms(raw.year, lunarMonth, raw.day, raw.hour, raw.minute, raw.second).getSolar();
    return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(), hour: solar.getHour(), minute: solar.getMinute(), second: solar.getSecond() };
  } catch {
    throw new Error('农历日期或闰月选择有误');
  }
}

function solarTime(input: BaziChartInput, civil: DateParts) {
  const actualOffset = offsetForLocal(input.timezone, civil);
  const standardOffset = standardOffsetForYear(input.timezone, civil.year);
  const daylightMinutes = Math.max(0, actualOffset - standardOffset);
  const standardMeridian = standardOffset / 60 * 15;
  const longitudeMinutes = (input.longitude - standardMeridian) * 4;
  const equationMinutes = equationOfTimeMinutes(civil);
  const correctionMinutes = input.trueSolarTime ? -daylightMinutes + longitudeMinutes + equationMinutes : 0;
  return {
    actualOffset,
    standardOffset,
    daylightMinutes,
    standardMeridian,
    longitudeMinutes,
    equationMinutes,
    correctionMinutes,
    corrected: shiftParts(civil, correctionMinutes),
  };
}

function starsForTarget(ctx: ShenShaContext, gan: string, zhi: string): StarMatch[] {
  const hits: StarMatch[] = [];
  const add = (id: string, name: string, basis: string) => { if (!hits.some(h => h.id === id)) hits.push({ id, name, basis }); };
  if (TIAN_YI[ctx.dayGan]?.includes(zhi)) add('tian-yi', '天乙贵人', `日干${ctx.dayGan}查${TIAN_YI[ctx.dayGan].join('、')}`);
  if (WEN_CHANG[ctx.dayGan] === zhi) add('wen-chang', '文昌贵人', `日干${ctx.dayGan}查${zhi}`);
  if (TAI_JI[ctx.dayGan]?.includes(zhi)) add('tai-ji', '太极贵人', `日干${ctx.dayGan}查${TAI_JI[ctx.dayGan].join('、')}`);
  if (GUO_YIN[ctx.dayGan] === zhi) add('guo-yin', '国印贵人', `日干${ctx.dayGan}查${zhi}`);
  if (LU_SHEN[ctx.dayGan] === zhi) add('lu-shen', '禄神', `日干${ctx.dayGan}查${zhi}`);
  if (YANG_REN[ctx.dayGan] === zhi) add('yang-ren', '羊刃', `日干${ctx.dayGan}查${zhi}`);

  for (const [name, map] of Object.entries(TRIAD_RULES)) {
    if (map[ctx.dayZhi] === zhi) add(`triad-${name}`, name, `日支${ctx.dayZhi}查${zhi}`);
  }
  if (HONG_LUAN[ctx.yearZhi] === zhi) add('hong-luan', '红鸾', `年支${ctx.yearZhi}查${zhi}`);
  if (TIAN_XI[ctx.yearZhi] === zhi) add('tian-xi', '天喜', `年支${ctx.yearZhi}查${zhi}`);

  const seasonal = '亥子丑'.includes(ctx.yearZhi) ? { gu: '寅', gua: '戌' }
    : '寅卯辰'.includes(ctx.yearZhi) ? { gu: '巳', gua: '丑' }
      : '巳午未'.includes(ctx.yearZhi) ? { gu: '申', gua: '辰' } : { gu: '亥', gua: '未' };
  if (seasonal.gu === zhi) add('gu-chen', '孤辰', `年支${ctx.yearZhi}查${zhi}`);
  if (seasonal.gua === zhi) add('gua-su', '寡宿', `年支${ctx.yearZhi}查${zhi}`);

  const tianDeTarget = TIAN_DE[ctx.monthZhi];
  if (tianDeTarget === gan || tianDeTarget === zhi) add('tian-de', '天德贵人', `月支${ctx.monthZhi}查${tianDeTarget}`);
  const yueDeTarget = YUE_DE[ctx.monthZhi];
  if (yueDeTarget === gan) add('yue-de', '月德贵人', `月支${ctx.monthZhi}查${yueDeTarget}`);
  return hits;
}

const JIE_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
const jieCache = new Map<number, Record<string, any>>();
function jieTable(year: number): Record<string, any> {
  if (!jieCache.has(year)) jieCache.set(year, Solar.fromYmd(year, 7, 1).getLunar().getJieQiTable());
  return jieCache.get(year)!;
}
function jieAt(flowYear: number, index: number): any {
  if (index < 11) return jieTable(flowYear)[JIE_NAMES[index]];
  if (index === 11) return jieTable(flowYear + 1).小寒;
  return jieTable(flowYear + 1).立春;
}

export function buildBaziChart(input: BaziChartInput) {
  if (!input || !['male', 'female'].includes(input.gender)) throw new Error('请选择性别');
  if (!['solar', 'lunar'].includes(input.calendarType)) throw new Error('请选择公历或农历');
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) throw new Error('出生地经度应在 -180 到 180 之间');
  validateTimezone(input.timezone);

  const raw = parseInputDate(input.date, input.time);
  const civil = normalizeCivilDate(input, raw);
  const correction = solarTime(input, civil);
  const used = input.trueSolarTime ? correction.corrected : civil;
  const solar = Solar.fromYmdHms(used.year, used.month, used.day, used.hour, used.minute, used.second);
  const lunarDate = solar.getLunar();
  const eight = lunarDate.getEightChar();
  eight.setSect(input.dayBoundary === '23:00' ? 1 : 2);

  const ctx: ShenShaContext = {
    dayGan: eight.getDayGan(), dayZhi: eight.getDayZhi(),
    yearZhi: eight.getYearZhi(), monthZhi: eight.getMonthZhi(),
  };

  const natalStars = new Map<string, { id: string; name: string; basis: string; positions: string[] }>();
  const pillars = PILLAR_KEYS.map((key, index) => {
    const gan = eight[`get${key}Gan`]();
    const zhi = eight[`get${key}Zhi`]();
    const hidden = eight[`get${key}HideGan`]();
    const hiddenGods = eight[`get${key}ShiShenZhi`]();
    const stars = starsForTarget(ctx, gan, zhi);
    for (const star of stars) {
      const current = natalStars.get(star.id) || { ...star, positions: [] };
      current.positions.push(PILLAR_NAMES[index]);
      natalStars.set(star.id, current);
    }
    return {
      key: key.toLowerCase(), name: PILLAR_NAMES[index], ganZhi: eight[`get${key}`](), gan, zhi,
      shiShenGan: eight[`get${key}ShiShenGan`](),
      hiddenGan: hidden.map((stem: string, i: number) => ({ stem, shiShen: hiddenGods[i] })),
      wuXing: eight[`get${key}WuXing`](), naYin: eight[`get${key}NaYin`](),
      diShi: eight[`get${key}DiShi`](), xun: eight[`get${key}Xun`](), xunKong: eight[`get${key}XunKong`](),
      shenSha: stars.map(s => s.name),
    };
  });

  const elements: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const p of pillars) {
    elements[GAN_ELEMENT[p.gan]]++;
    for (const h of p.hiddenGan) elements[GAN_ELEMENT[h.stem]]++;
  }

  const yun = eight.getYun(input.gender === 'male' ? 1 : 0, input.yunSect);
  const daYun = yun.getDaYun(10).filter((d: any) => d.getIndex() > 0).map((d: any) => {
    const ganZhi = d.getGanZhi();
    const gan = ganZhi.charAt(0), zhi = ganZhi.charAt(1);
    return {
      index: d.getIndex(), ganZhi, startYear: d.getStartYear(), endYear: d.getEndYear(),
      startAge: d.getStartAge(), endAge: d.getEndAge(), xun: d.getXun(), xunKong: d.getXunKong(),
      naYin: LunarUtil.NAYIN[ganZhi], shiShen: LunarUtil.SHI_SHEN[ctx.dayGan + gan],
      shenSha: starsForTarget(ctx, gan, zhi).map(s => s.name),
      liuNian: d.getLiuNian(10).map((n: any) => {
        const ngz = n.getGanZhi(), ngan = ngz.charAt(0), nzhi = ngz.charAt(1), flowYear = n.getYear();
        return {
          year: flowYear, age: n.getAge(), ganZhi: ngz, xun: n.getXun(), xunKong: n.getXunKong(),
          shiShen: LunarUtil.SHI_SHEN[ctx.dayGan + ngan], shenSha: starsForTarget(ctx, ngan, nzhi).map(s => s.name),
          liuYue: n.getLiuYue().map((m: any, monthIndex: number) => {
            const mgz = m.getGanZhi(), mgan = mgz.charAt(0), mzhi = mgz.charAt(1);
            return {
              index: monthIndex + 1, name: `${mzhi}月`, ganZhi: mgz,
              startJie: JIE_NAMES[monthIndex], endJie: monthIndex === 11 ? '立春' : JIE_NAMES[monthIndex + 1],
              startAt: jieAt(flowYear, monthIndex).toYmdHms(), endAt: jieAt(flowYear, monthIndex + 1).toYmdHms(),
              xun: m.getXun(), xunKong: m.getXunKong(), shiShen: LunarUtil.SHI_SHEN[ctx.dayGan + mgan],
              shenSha: starsForTarget(ctx, mgan, mzhi).map(s => s.name),
            };
          }),
        };
      }),
    };
  });

  return {
    success: true,
    meta: { engine: 'lunar-javascript', engineVersion: '1.7.7', ruleSetVersion: 'bazi-chart-1.0.0', generatedAt: new Date().toISOString() },
    input: { ...input, name: String(input.name || '我的命盘').slice(0, 40) },
    time: {
      civil: formatParts(civil), corrected: formatParts(correction.corrected), used: formatParts(used),
      actualOffsetMinutes: correction.actualOffset, standardOffsetMinutes: correction.standardOffset,
      daylightSavingMinutes: correction.daylightMinutes,
      longitudeCorrectionMinutes: Math.round(correction.longitudeMinutes * 10) / 10,
      equationOfTimeMinutes: Math.round(correction.equationMinutes * 10) / 10,
      totalCorrectionMinutes: Math.round(correction.correctionMinutes * 10) / 10,
    },
    calendar: { solar: solar.toYmdHms(), lunar: lunarDate.toString(), yearShengXiao: lunarDate.getYearShengXiaoExact() },
    pillars,
    elements,
    auxiliary: {
      taiYuan: eight.getTaiYuan(), taiXi: eight.getTaiXi(), mingGong: eight.getMingGong(), shenGong: eight.getShenGong(),
      dayMaster: `${eight.getDayGan()}${GAN_ELEMENT[eight.getDayGan()]}`,
      dayXunKong: eight.getDayXunKong(),
    },
    yun: {
      forward: yun.isForward(), startYears: yun.getStartYear(), startMonths: yun.getStartMonth(),
      startDays: yun.getStartDay(), startHours: yun.getStartHour(), startAt: yun.getStartSolar().toYmdHms(), daYun,
    },
    shenSha: [...natalStars.values()],
  };
}
