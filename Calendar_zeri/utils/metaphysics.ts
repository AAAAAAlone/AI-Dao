
import { GANS, ZHIS, LIFE_STAGES, SOLAR_TERMS } from '../constants';
import { 
  ZHI_TO_ELEMENT, RELATION_CLASHES, RELATION_HARMONIES, RELATION_MEETINGS, 
  RELATION_PUNISHMENTS, ELEMENT_BIRTH_ZHI, SIX_HARMONIES 
} from '../metaphysics_config';
import { GanZhi, Zhi, Element, DayInfo } from '../types';

export const getDayGanZhi = (date: Date): GanZhi => {
  const reference = new Date(2024, 0, 1);
  const d1 = Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const d2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  let cycleIndex = diffDays % 60;
  if (cycleIndex < 0) cycleIndex += 60;
  const gan = GANS[cycleIndex % 10];
  const zhi = ZHIS[cycleIndex % 12];
  return { gan, zhi, name: gan + zhi };
};

export const getXun = (gz: GanZhi) => {
  const ganIdx = GANS.indexOf(gz.gan);
  const zhiIdx = ZHIS.indexOf(gz.zhi);
  const xunStartIdx = (zhiIdx - ganIdx + 12) % 12;
  return { name: `甲${ZHIS[xunStartIdx]}旬`, kong: [ZHIS[(xunStartIdx + 10) % 12], ZHIS[(xunStartIdx + 11) % 12]] };
};

export const getXunName = (gz: GanZhi): string => {
  const ganIdx = GANS.indexOf(gz.gan);
  const zhiIdx = ZHIS.indexOf(gz.zhi);
  const xunStartIdx = (zhiIdx - ganIdx + 12) % 12;
  return `甲${ZHIS[xunStartIdx]}旬`;
};

export const getYongShenElementStatus = (ysZhi: Zhi, dayZhi: Zhi): string => {
  const ysEl = ZHI_TO_ELEMENT[ysZhi];
  const dayEl = ZHI_TO_ELEMENT[dayZhi];
  const cycle = [Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER];
  const yIdx = cycle.indexOf(ysEl);
  const dIdx = cycle.indexOf(dayEl);

  if (yIdx === dIdx || (dIdx + 1) % 5 === yIdx) return '生助';
  if ((dIdx + 2) % 5 === yIdx || (yIdx + 2) % 5 === dIdx) return '克泄';
  return '平';
};

export const getElementEnergyLevel = (targetEl: Element, dayZhi: Zhi): { level: number, status: string } => {
  const dayEl = ZHI_TO_ELEMENT[dayZhi];
  const cycle = [Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER];
  const tIdx = cycle.indexOf(targetEl);
  const dIdx = cycle.indexOf(dayEl);

  if (tIdx === dIdx) return { level: 5, status: '旺' };
  if ((dIdx + 1) % 5 === tIdx) return { level: 4, status: '相' };
  if ((tIdx + 1) % 5 === dIdx) return { level: 3, status: '休' };
  if ((tIdx + 2) % 5 === dIdx) return { level: 2, status: '囚' };
  if ((dIdx + 2) % 5 === tIdx) return { level: 1, status: '死' };
  return { level: 3, status: '平' };
};

export const getStageOfBranchForElement = (targetZhi: Zhi, element: Element): string => {
  const birthZhi = ELEMENT_BIRTH_ZHI[element];
  const birthIdx = ZHIS.indexOf(birthZhi);
  const targetIdx = ZHIS.indexOf(targetZhi);
  const diff = (targetIdx - birthIdx + 12) % 12;
  return LIFE_STAGES[diff];
};

export const getFestival = (date: Date, lunarMonth: string, lunarDay: string) => {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (m === 1 && d === 1) return '元旦';
  if (m === 2 && d === 14) return '情人节';
  if (m === 5 && d === 1) return '劳动节';
  if (m === 6 && d === 1) return '儿童节';
  if (m === 10 && d === 1) return '国庆节';
  if (m === 12 && d === 25) return '圣诞节';
  
  if (lunarMonth === '正月' && lunarDay === '初一') return '春节';
  if (lunarMonth === '正月' && lunarDay === '十五') return '元宵节';
  if (lunarMonth === '二月' && lunarDay === '初二') return '龙抬头';
  if (lunarMonth === '五月' && lunarDay === '初五') return '端午节';
  if (lunarMonth === '七月' && lunarDay === '初七') return '七夕节';
  if (lunarMonth === '七月' && lunarDay === '十五') return '中元节';
  if (lunarMonth === '八月' && lunarDay === '十五') return '中秋节';
  if (lunarMonth === '九月' && lunarDay === '初九') return '重阳节';
  if (lunarMonth === '腊月' && lunarDay === '初八') return '腊八节';
  if (lunarMonth === '腊月' && (lunarDay === '三十' || lunarDay === '廿九')) return '除夕';

  return undefined;
};

export const getSolarTermInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const termDates: Record<number, number[]> = {
    0: [5, 20], 1: [3, 18], 2: [5, 20], 3: [4, 19], 4: [5, 21], 5: [5, 21],
    6: [7, 22], 7: [7, 23], 8: [7, 23], 9: [8, 23], 10: [7, 22], 11: [7, 22]
  };
  const currentMonthTerms = termDates[month];
  let termName: string | undefined;
  if (day === currentMonthTerms[0]) termName = SOLAR_TERMS[month * 2];
  if (day === currentMonthTerms[1]) termName = SOLAR_TERMS[month * 2 + 1];
  let prevDate: Date;
  let prevName: string;
  if (day >= currentMonthTerms[1]) {
    prevDate = new Date(year, month, currentMonthTerms[1]);
    prevName = SOLAR_TERMS[month * 2 + 1];
  } else if (day >= currentMonthTerms[0]) {
    prevDate = new Date(year, month, currentMonthTerms[0]);
    prevName = SOLAR_TERMS[month * 2];
  } else {
    const prevMonth = (month - 1 + 12) % 12;
    const prevYear = month === 0 ? year - 1 : year;
    prevDate = new Date(prevYear, prevMonth, termDates[prevMonth][1]);
    prevName = SOLAR_TERMS[prevMonth * 2 + 1];
  }
  const diffDays = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
  return { termName, proximityText: diffDays === 0 ? prevName : `${prevName}后 ${diffDays} 天` };
};

export const getLunarInfo = (date: Date) => {
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  try {
    const formatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { month: 'long', day: 'numeric' });
    const parts = formatter.formatToParts(date);
    const monthPart = parts.find(p => p.type === 'month');
    const dayPart = parts.find(p => p.type === 'day');
    return { 
      lunarMonth: monthPart ? monthPart.value : '正月', 
      lunarDay: lunarDays[parseInt(dayPart?.value || '1') - 1] || '初一' 
    };
  } catch (e) {
    return { lunarDay: '初一', lunarMonth: '正月' };
  }
};

export const getDayInfo = (date: Date): DayInfo => {
  const gz = getDayGanZhi(date);
  const xunInfo = getXun(gz);
  const lunar = getLunarInfo(date);
  const termInfo = getSolarTermInfo(date);
  const fest = getFestival(date, lunar.lunarMonth, lunar.lunarDay);
  return {
    date,
    solarDay: date.getDate(),
    ganZhi: gz,
    isToday: new Date().toDateString() === date.toDateString(),
    xun: getXunName(gz),
    xunKong: xunInfo.kong,
    clashes: RELATION_CLASHES[gz.zhi] ? [RELATION_CLASHES[gz.zhi]] : [],
    harmonies: [RELATION_HARMONIES[gz.zhi] || []],
    punishments: RELATION_PUNISHMENTS[gz.zhi] || [],
    lunarMonth: lunar.lunarMonth,
    lunarDay: lunar.lunarDay,
    solarTerm: termInfo.termName,
    festival: fest
  };
};

export const getMonthZhi = (date: Date): Zhi => {
  const branches: Zhi[] = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];
  return branches[date.getMonth()];
};

// --- 专业总结核心逻辑 ---

export const generateProfessionalSummary = (day: DayInfo, monthZhi: Zhi, yongShen: Zhi[], category: string) => {
  const points: { text: string; type: 'warn' | 'success' | 'info' }[] = [];
  const dayZhi = day.ganZhi.zhi;
  const xunKong = day.xunKong;

  // 1. 月建关系 (宏观基调) - 增强文案深度
  const categoryAdvices: Record<string, { clash: string, same: string, harm: string }> = {
    '事业': {
        clash: '岁破月破，大耗当头。今日官鬼临冲，职场如履薄冰，忌签署契约，防上司责难，宜韬光养晦。',
        same: '日建当值，临官得禄。权威稳固，利于发号施令、巩固地盘，凡事可从权独断。',
        harm: '六害穿心，小人暗箭。防同僚排挤或文书细节陷阱，合作项目恐面和心不和。'
    },
    '财运': {
        clash: '财库逢冲，金木相战。大耗之日，资金链恐受冲击，忌借贷、投资，防诈骗或意外破财。',
        same: '财气通门户，得气得势。利于盘点旧债、回收资金，守成有余，激进不足。',
        harm: '财源受损，因人失财。合作生变，防因兄弟朋友而破耗，利益分配需谨慎。'
    },
    '健康': {
        clash: '气血刑冲，金木交战。今日忌动刀手术、针灸，防突发外伤、跌打或心脑血管剧烈波动。',
        same: '元气得地，适宜静养。气机强盛，利于康复治疗，但过犹不及，不可大补。',
        harm: '气机郁结，六害伤身。情绪起伏大，易伤肝胆，防生闷气导致旧疾复发。'
    },
    '感情': {
        clash: '红鸾星碎，冲则离散。今日极易因琐事爆发争吵，忌相亲、求婚，若强求恐生怨怼。',
        same: '比肩重重，感情沉闷。利于老夫老妻日常相处，平淡是真，不利寻求激情或新欢。',
        harm: '相爱相杀，心生嫌隙。六害主分离，容易因误会产生隔阂，沟通需多一份耐心。'
    },
    '出行': {
        clash: '驿马逢冲，路途坎坷。今日出行防交通延误、车辆故障，甚至擦碰，非必要不出远门。',
        same: '行程稳健，如履平地。适合按既定路线公务出行，虽无惊喜，亦无惊吓。',
        harm: '路途蹇滞，关津受阻。防证件遗失、关卡盘查或行程被意外打断。'
    },
    '风水': {
        clash: '气场激荡，龙虎相斗。今日绝对忌安床、修造、动土，恐惊动三煞，招致不安。',
        same: '地气深厚，利于安座。气场稳固，适合摆放神位、镇宅重物，可收纳旺气。',
        harm: '气场不和，六害干扰。易受邻里噪音、外部形煞影响，环境磁场紊乱。'
    }
  };

  const advice = categoryAdvices[category] || categoryAdvices['事业']; // 默认兜底

  if (dayZhi === RELATION_CLASHES[monthZhi]) {
    points.push({ text: `【月破】${advice.clash}`, type: 'warn' });
  } else if (dayZhi === monthZhi) {
    points.push({ text: `【日建】${advice.same}`, type: 'success' });
  } else if (RELATION_HARMONIES[monthZhi]?.includes(dayZhi)) { // 增加六合
    points.push({ text: `【六合】月德合日，贵人扶持。${category}之事多有助力，逢凶化吉。`, type: 'success' });
  }

  // 2. 用神关系 (核心变量)
  if (yongShen.length > 0) {
    yongShen.forEach(ys => {
      const ysEl = ZHI_TO_ELEMENT[ys];
      const stage = getStageOfBranchForElement(dayZhi, ysEl);
      const vitality = getYongShenElementStatus(ys, dayZhi);

      // 用神-旬空
      if (xunKong.includes(ys)) {
        let kongText = `【旬空】用神${ys}落空亡，有名无实。`;
        if (category === '财运') kongText += '求财如水中捞月，竹篮打水。';
        else if (category === '事业') kongText += '权位被架空，承诺多为空头支票。';
        else if (category === '感情') kongText += '对方心意难测，态度暧昧不明。';
        else if (category === '健康') kongText += '虚症难愈，查无病因，需防误诊。';
        else kongText += '所谋之事多虚少实，宜缓图之。';
        points.push({ text: kongText, type: 'warn' });
      }

      // 用神-得时 (生旺)
      if (vitality === '生助' && ['长生', '临官', '帝旺'].includes(stage)) {
        let successText = `【得时】用神${ys}临${stage}旺地。`;
        if (category === '财运') successText += '财源茂盛，禄马同乡，利于资产增值。';
        else if (category === '事业') successText += '青龙得位，贵人提拔，升职加薪有望。';
        else if (category === '感情') successText += '桃花绚烂，魅力四射，利于表白定情。';
        else if (category === '健康') successText += '身强体健，元气淋漓，利于运动康复。';
        else successText += '天时地利人和，诸事顺遂。';
        points.push({ text: successText, type: 'success' });
      }
      
      // 用神-受冲
      if (RELATION_CLASHES[ys] === dayZhi) {
        let clashText = `【冲散】用神${ys}被日辰冲散。`;
        if (category === '财运') clashText += '大耗破财，财来财去一场空。';
        else if (category === '事业') clashText += '职位变动，或与上司发生正面冲突。';
        else if (category === '感情') clashText += '缘分易散，聚少离多，防突发分手。';
        else if (category === '健康') clashText += `注意${ZHI_TO_ELEMENT[ys]}五行对应的脏腑急症。`;
        else clashText += '根基不稳，事多反复，不宜决断。';
        points.push({ text: clashText, type: 'warn' });
      }

      // 用神-入墓 (修正：土不入土墓)
      if (stage === '墓') {
         // 土五行不入土库 (辰戌丑未)
         if (ysEl !== Element.EARTH) {
            let graveText = `【入墓】用神${ys}入日墓。`;
            if (category === '健康') graveText += '精气神衰弱，旧疾缠绵难愈，宜静养。';
            else if (category === '事业') graveText += '才华被埋没，如明珠蒙尘，难遇伯乐。';
            else graveText += `${category}之事陷入停滞，如泥牛入海，难有进展。`;
            points.push({ text: graveText, type: 'info' });
         }
      }
    });
  } else {
    // 3. 无用神时的通用断语 (基于五行)
    const elements = [Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER];
    const wangEl = elements.find(el => getElementEnergyLevel(el, dayZhi).status === '旺');
    
    let elAdvice = '';
    if (wangEl === Element.METAL) elAdvice = '今日金气肃杀，白虎值日，宜行刑罚、决断、清理门户。';
    else if (wangEl === Element.WOOD) elAdvice = '今日木气生发，青龙得势，宜规划、创意、社交往来。';
    else if (wangEl === Element.WATER) elAdvice = '今日水气流动，玄武潜行，宜谋略、隐秘行事、物流运输。';
    else if (wangEl === Element.FIRE) elAdvice = '今日火气炎上，朱雀喧闹，宜宣传、演讲、展示才华。';
    else if (wangEl === Element.EARTH) elAdvice = '今日土气厚重，勾陈不动，宜地产交易、建筑、静坐。';

    points.push({ text: `【五行】${elAdvice}`, type: 'info' });
    
    if (day.festival) {
        points.push({ text: `【节日】值${day.festival}。借节日之吉气，利于${category}人脉拓展与维系。`, type: 'success' });
    }
  }

  if (points.length === 0) {
    points.push({ text: `今日气场平和，五行流通。${category}之事按既定计划执行即可，无大碍亦无大喜。`, type: 'info' });
  }

  // 保证只有 4 条，且 Warn 优先
  return points.sort((a, b) => (a.type === 'warn' ? -1 : 1)).slice(0, 4);
};
