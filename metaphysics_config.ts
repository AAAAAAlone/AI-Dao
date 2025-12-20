
import { Zhi, Element, CategoryData } from './types';

export const ZHI_TO_ELEMENT: Record<Zhi, Element> = {
  '寅': Element.WOOD, '卯': Element.WOOD, '辰': Element.EARTH,
  '巳': Element.FIRE, '午': Element.FIRE, '未': Element.EARTH,
  '申': Element.METAL, '酉': Element.METAL, '戌': Element.EARTH,
  '亥': Element.WATER, '子': Element.WATER, '丑': Element.EARTH
};

export const RELATION_CLASHES: Record<Zhi, Zhi> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
};

export const SIX_HARMONIES: Record<Zhi, { target: Zhi, type: '生合' | '制合' }> = {
  '子': { target: '丑', type: '制合' },
  '丑': { target: '子', type: '制合' },
  '寅': { target: '亥', type: '生合' },
  '亥': { target: '寅', type: '生合' },
  '卯': { target: '戌', type: '制合' },
  '戌': { target: '卯', type: '制合' },
  '辰': { target: '酉', type: '生合' },
  '酉': { target: '辰', type: '生合' },
  '巳': { target: '申', type: '制合' },
  '申': { target: '巳', type: '制合' },
  '午': { target: '未', type: '生合' },
  '未': { target: '午', type: '生合' }
};

// Added RELATION_HARMONIES mapping for compatibility with logic in index.tsx and utils/metaphysics.ts
export const RELATION_HARMONIES: Record<Zhi, Zhi[]> = {
  '子': ['丑'], '丑': ['子'], '寅': ['亥'], '亥': ['寅'],
  '卯': ['戌'], '戌': ['卯'], '辰': ['酉'], '酉': ['辰'],
  '巳': ['申'], '申': ['巳'], '午': ['未'], '未': ['午']
};

// Added RELATION_MEETINGS (San Hui) for compatibility with logic in utils/metaphysics.ts
export const RELATION_MEETINGS: Record<Zhi, Zhi[]> = {
  '亥': ['子', '丑'], '子': ['亥', '丑'], '丑': ['亥', '子'],
  '寅': ['卯', '辰'], '卯': ['寅', '辰'], '辰': ['寅', '卯'],
  '巳': ['午', '未'], '午': ['巳', '未'], '未': ['巳', '午'],
  '申': ['酉', '戌'], '酉': ['申', '戌'], '戌': ['申', '酉']
};

// Full sets for 3-Harmony (Triangle)
export const THREE_HARMONY_SETS = [
  ['申', '子', '辰'], // Water
  ['亥', '卯', '未'], // Wood
  ['寅', '午', '戌'], // Fire
  ['巳', '酉', '丑']  // Metal
];

// Full sets for 3-Punishment
export const THREE_PUNISHMENT_SETS = [
  ['寅', '巳', '申'], // 无恩之刑
  ['丑', '戌', '未'], // 恃势之刑
  ['子', '卯']        // 无礼之刑
];

// Self-Punishment
export const SELF_PUNISHMENTS: Zhi[] = ['辰', '午', '酉', '亥'];

export const RELATION_PUNISHMENTS: Record<Zhi, Zhi[]> = {
  '寅': ['巳', '申'], '巳': ['申', '寅'], '申': ['寅', '巳'],
  '丑': ['戌', '未'], '戌': ['未', '丑'], '未': ['丑', '戌'],
  '子': ['卯'], '卯': ['子'],
  '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥']
};

export const ELEMENT_BIRTH_ZHI: Record<Element, Zhi> = {
  [Element.WOOD]: '亥', [Element.FIRE]: '寅', [Element.EARTH]: '寅',
  [Element.METAL]: '巳', [Element.WATER]: '申'
};

export const CATEGORY_CONFIG: CategoryData[] = [
  {
    title: '健康',
    icon: 'fa-heart-pulse',
    description: '关注脏腑机能与病灶位置。木主肝胆，火主心血，土主脾胃，金主肺，水主肾。',
    branchMeanings: {
      '子': '膀胱/血液/肾水/耳', '丑': '脾胃/足部/腹部/肿块', '寅': '胆/手/筋脉/毛发', '卯': '肝/指/目/四肢',
      '辰': '皮肤/背/胃/肌肉', '巳': '心/面部/牙齿/咽喉', '午': '小肠/舌/目/精神', '未': '胃/脊椎/小腹',
      '申': '大肠/肺/气管/骨骼', '酉': '肺/口鼻/皮毛', '戌': '胃/腿/命门/肛门', '亥': '肾/头/分泌系统'
    }
  },
  {
    title: '事业',
    icon: 'fa-briefcase',
    description: '职场晋升、权力、官非与竞争。寅申巳亥为驿马，主变动。',
    branchMeanings: {
      '子': '幕后策划/稳健/隐私', '丑': '基础管理/保守/稳扎稳打', '寅': '开拓进取/领导权/政务', '卯': '协调沟通/文书/行政',
      '辰': '综合规划/多变/工程', '巳': '公关外交/迅速响应/电力', '午': '荣誉名望/传播/演艺', '未': '后勤保障/土地/传统业',
      '申': '管理重组/金融业/法律', '酉': '严谨执行/珠宝/鉴赏', '戌': '安保/技术核心/宗教', '亥': '核心策划/物流/深层研究'
    }
  },
  {
    title: '财运',
    icon: 'fa-coins',
    description: '求财方位、财源类型（正财/偏财）及得失。',
    branchMeanings: {
      '子': '暗财/隐秘资金', '丑': '库财/存款积累', '寅': '大财/爆发性财', '卯': '细水长流/偏财',
      '辰': '合作求财/中介财', '巳': '急财/虚财/变动财', '午': '显财/竞争求财', '未': '实业/土产收益',
      '申': '远方财/金融财', '酉': '精细财/艺术收益', '戌': '技术财/资源性财', '亥': '技术折现/智慧财'
    }
  },
  {
    title: '感情',
    icon: 'fa-venus-mars',
    description: '合婚、择偶及情感沟通。子午卯酉为桃花。',
    branchMeanings: {
      '子': '深沉克制/柏拉图', '丑': '务实稳重/木讷', '寅': '积极主动/热情', '卯': '细腻温柔/多情',
      '辰': '包容心强/思虑多', '巳': '热烈短暂/变动', '午': '光鲜亮丽/虚荣', '未': '母性关怀/柔顺',
      '申': '理性独立/高冷', '酉': '感性精致/浪漫', '戌': '忠诚厚重/固执', '亥': '天真浪漫/理想化'
    }
  },
  {
    title: '出行',
    icon: 'fa-plane-departure',
    description: '行程吉凶、驿马方位及安全保障。',
    branchMeanings: {
      '寅': '东北/极速/山林', '申': '西南/变更/器械阻滞', '巳': '东南/惊吓/热闹处', '亥': '西北/水路/漂泊',
      '子': '北方/夜行/阴寒', '午': '南方/白昼/旷野', '卯': '东方/曲折/草木茂盛', '酉': '西方/肃杀/关隘',
      '辰': '东南/湖泊/阻滞', '戌': '西北/高亢/陆路', '丑': '东北/阴湿/地窖', '未': '西南/干旱/饮食'
    }
  },
  {
    title: '风水',
    icon: 'fa-house-chimney',
    description: '环境建筑、砂水意象及内外局。',
    branchMeanings: {
      '寅': '高大树木/电线杆/大桥', '卯': '灌木/门窗/家具/竹林', '巳': '灶台/变压器/闹市/红墙', '午': '电视/书画/南窗/空地',
      '申': '金属构件/大路/钢架', '酉': '钟表/神龛/珠宝/水井', '亥': '鱼池/洗手间/水管', '子': '暗沟/自来水/下水道',
      '辰': '水库/池塘/山坡/坟墓', '戌': '砖窑/佛堂/围墙/土坡', '未': '花园/院子/围栏', '丑': '地下室/阴冷/废品站'
    }
  }
];

export const INTENTIONS_DATA = {
  gua: {
    '乾': '为天、为父、为君、为首、为刚健、为西北、为金。',
    '坤': '为地、为母、为众、为腹、为柔顺、为西南、为土。',
    '震': '为雷、为长男、为足、为动、为东方、为木。',
    '巽': '为风、为长女、为股、为入、为东南、为木。',
    '坎': '为水、为中男、为耳、为陷、为北方、为水。',
    '离': '为火、为中女、为目、为丽、为南方、为火。',
    '艮': '为山、为少男、为手、为止、为东北、为土。',
    '兑': '为泽、为少女、为口、为说、为西方、为金。'
  },
  sixGods: {
    '青龙': '主喜庆、文书、财帛、高贵、生气。',
    '朱雀': '主口舌、文书、火烛、言语、飞速。',
    '勾陈': '主迟滞、土地、田产、捕役、勾连。',
    '螣蛇': '主惊恐、怪异、缠绕、虚幻、阴私。',
    '白虎': '主凶灾、丧服、武职、道路、肃杀。',
    '玄武': '主阴私、盗贼、奸诈、玄学、暗昧。'
  }
};
