
import { GANS, ZHIS, LIFE_STAGES } from '../constants';
import { 
  ZHI_TO_ELEMENT, RELATION_CLASHES, RELATION_HARMONIES, RELATION_MEETINGS, 
  RELATION_PUNISHMENTS, ELEMENT_BIRTH_ZHI, SIX_HARMONIES 
} from '../metaphysics_config';
import { GanZhi, Zhi, Element, DayInfo } from '../types';

export const getDayGanZhi = (date: Date): GanZhi => {
  const reference = new Date(2000, 0, 1);
  const d1 = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const d2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  const baseIndex = 30; 
  let cycleIndex = (baseIndex + diffDays) % 60;
  if (cycleIndex < 0) cycleIndex += 60;
  return { gan: GANS[cycleIndex % 10], zhi: ZHIS[cycleIndex % 12], name: GANS[cycleIndex % 10] + ZHIS[cycleIndex % 12] };
};

export const getXun = (gz: GanZhi) => {
  const ganIdx = GANS.indexOf(gz.gan);
  const zhiIdx = ZHIS.indexOf(gz.zhi);
  const xunStartIdx = (zhiIdx - ganIdx + 12) % 12;
  return { name: `甲${ZHIS[xunStartIdx]}旬`, kong: [ZHIS[(xunStartIdx + 10) % 12], ZHIS[(xunStartIdx + 11) % 12]] };
};

export const getLifeStage = (element: Element, dayZhi: Zhi): string => {
  const birthZhi = ELEMENT_BIRTH_ZHI[element];
  const birthIdx = ZHIS.indexOf(birthZhi);
  const targetIdx = ZHIS.indexOf(dayZhi);
  const diff = (targetIdx - birthIdx + 12) % 12;
  return LIFE_STAGES[diff];
};

export const getStageOfBranchForElement = (targetZhi: Zhi, element: Element): string => {
  const birthZhi = ELEMENT_BIRTH_ZHI[element];
  const birthIdx = ZHIS.indexOf(birthZhi);
  const targetIdx = ZHIS.indexOf(targetZhi);
  const diff = (targetIdx - birthIdx + 12) % 12;
  return LIFE_STAGES[diff];
};

export const getWangXiang = (monthZhi: Zhi, targetElement: Element): string => {
  const monthElement = ZHI_TO_ELEMENT[monthZhi];
  const cycle: Element[] = [Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER];
  const mIdx = cycle.indexOf(monthElement);
  const tIdx = cycle.indexOf(targetElement);
  if (mIdx === tIdx) return '旺';
  if ((mIdx + 1) % 5 === tIdx) return '相';
  if ((tIdx + 1) % 5 === mIdx) return '休';
  if ((tIdx + 2) % 5 === mIdx) return '囚';
  if ((mIdx + 2) % 5 === tIdx) return '死';
  return '平';
};

// Simplified 24 Solar Terms Logic
const SOLAR_TERMS = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];
export const getSolarTerm = (date: Date): string | undefined => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  // Approximations for demonstration
  const termDates: Record<number, number[]> = {
    0: [5, 20], 1: [3, 18], 2: [5, 20], 3: [4, 19], 4: [5, 20], 5: [5, 21],
    6: [7, 22], 7: [7, 22], 8: [7, 23], 9: [8, 23], 10: [7, 22], 11: [7, 22]
  };
  const dates = termDates[month];
  if (day === dates[0]) return SOLAR_TERMS[month * 2];
  if (day === dates[1]) return SOLAR_TERMS[month * 2 + 1];
  return undefined;
};

// Simple Lunar Day approximation (Cycle of 29.53 days)
export const getLunarInfo = (date: Date) => {
  const baseDate = new Date(1900, 0, 31); // New Moon on 1900-01-31
  const diff = (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53059;
  const dayInCycle = Math.floor(diff % lunarCycle) + 1;
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  return { lunarDay: lunarDays[dayInCycle - 1] || '初一', lunarMonth: '正月' }; // Simplified
};

export const getDayInfo = (date: Date): DayInfo => {
  const gz = getDayGanZhi(date);
  const xunInfo = getXun(gz);
  const lunar = getLunarInfo(date);
  const term = getSolarTerm(date);
  
  return {
    date,
    solarDay: date.getDate(),
    ganZhi: gz,
    isToday: new Date().toDateString() === date.toDateString(),
    xun: xunInfo.name,
    xunKong: xunInfo.kong,
    clashes: RELATION_CLASHES[gz.zhi] ? [RELATION_CLASHES[gz.zhi]] : [],
    harmonies: [RELATION_HARMONIES[gz.zhi] || [], RELATION_MEETINGS[gz.zhi] || []],
    punishments: RELATION_PUNISHMENTS[gz.zhi] || [],
    lunarMonth: lunar.lunarMonth,
    lunarDay: lunar.lunarDay,
    solarTerm: term
  };
};

export const getMonthZhi = (date: Date): Zhi => {
  const branches: Zhi[] = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];
  return branches[date.getMonth()];
};
