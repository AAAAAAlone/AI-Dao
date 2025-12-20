
import { Gan, Zhi, Element } from './types';

export const GANS: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const ZHIS: Zhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const ZHI_ELEMENTS: Record<Zhi, Element> = {
  '寅': Element.WOOD, '卯': Element.WOOD, '辰': Element.EARTH,
  '巳': Element.FIRE, '午': Element.FIRE, '未': Element.EARTH,
  '申': Element.METAL, '酉': Element.METAL, '戌': Element.EARTH,
  '亥': Element.WATER, '子': Element.WATER, '丑': Element.EARTH
};

export const SIX_CLASHES: Record<Zhi, Zhi> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
};

export const THREE_HARMONIES: Record<Zhi, Zhi[]> = {
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'],
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉']
};

export const THREE_MEETINGS: Record<Zhi, Zhi[]> = {
  '亥': ['子', '丑'], '子': ['亥', '丑'], '丑': ['亥', '子'],
  '寅': ['卯', '辰'], '卯': ['寅', '辰'], '辰': ['寅', '卯'],
  '巳': ['午', '未'], '午': ['巳', '未'], '未': ['巳', '午'],
  '申': ['酉', '戌'], '酉': ['申', '戌'], '戌': ['申', '酉']
};

export const THREE_PUNISHMENTS: Record<Zhi, Zhi[]> = {
  '寅': ['巳', '申'], '巳': ['申', '寅'], '申': ['寅', '巳'],
  '丑': ['戌', '未'], '戌': ['未', '丑'], '未': ['丑', '戌'],
  '子': ['卯'], '卯': ['子'],
  '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥']
};

// 12 Life Stages (Sheng Wang Ku) - Fire & Earth are the same
// Standard Cycle for Yang Fire (Bing): Birth(寅) -> Grave(戌)
// Standard Cycle for Yin Fire (Ding): Birth(酉) -> Grave(丑)
// Here we use general Element logic: Fire/Earth cycles together
export const LIFE_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

export const ELEMENT_LIFE_CYCLE: Record<Element, Zhi> = {
  [Element.WOOD]: '亥', // Wood born in Hai
  [Element.FIRE]: '寅', // Fire born in Yin
  [Element.EARTH]: '寅', // Earth born in Yin (Bazi/Liuyao style)
  [Element.METAL]: '巳', // Metal born in Si
  [Element.WATER]: '申'  // Water born in Shen
};

export const BODY_CORRESPONDENCES: Record<Zhi, string> = {
  '子': '膀胱、耳、血液',
  '丑': '脾脏、胃、足下',
  '寅': '胆、手、筋脉',
  '卯': '肝、手指、目',
  '辰': '皮肤、背、胸',
  '巳': '心、面部、牙齿',
  '午': '小肠、目、舌',
  '未': '胃、脊椎',
  '申': '大肠、呼吸道、经络',
  '酉': '肺、口鼻',
  '戌': '胃、腿、命门',
  '亥': '肾、头、分泌物'
};

export const DIRECTION_MAP: Record<Zhi, string> = {
  '子': '正北', '丑': '东北偏北', '寅': '东北偏东', '卯': '正东',
  '辰': '东南偏东', '巳': '东南偏南', '午': '正南', '未': '西南偏南',
  '申': '西南偏西', '酉': '正西', '戌': '西北偏西', '亥': '西北偏北'
};

export const INTENTION_MAP: Record<Zhi, string> = {
  '子': '智慧、流动、隐私',
  '丑': '稳定、收藏、晦暗',
  '寅': '生发、权力、急躁',
  '卯': '仁慈、灵活、欲望',
  '辰': '包容、变化、权术',
  '巳': '热情、礼仪、突发',
  '午': '热烈、显露、奔波',
  '未': '躁动、温暖、医药',
  '申': '变革、刚健、金融',
  '酉': '法律、艺术、口舌',
  '戌': '厚重、宗教、忠诚',
  '亥': '深邃、思考、技术'
};
