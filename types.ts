
export type Gan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type Zhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

export interface GanZhi {
  gan: Gan;
  zhi: Zhi;
  name: string;
}

export interface DayInfo {
  date: Date;
  solarDay: number;
  ganZhi: GanZhi;
  isToday: boolean;
  xun: string;
  xunKong: Zhi[];
  clashes: Zhi[];
  harmonies: Zhi[][];
  punishments: Zhi[];
  lunarMonth: string;
  lunarDay: string;
  solarTerm?: string;
  festival?: string;
}

export enum Element {
  WOOD = '木',
  FIRE = '火',
  EARTH = '土',
  METAL = '金',
  WATER = '水'
}

export type CategoryKey = '健康' | '事业' | '财运' | '感情' | '出行' | '风水';

export interface CategoryData {
  title: CategoryKey;
  icon: string;
  description: string;
  branchMeanings: Record<Zhi, string>;
}

export type AppTab = 'calendar' | 'relationships' | 'intentions';
