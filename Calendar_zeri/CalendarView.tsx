
import React, { useState, useMemo, useEffect } from 'react';
import { 
  getDayInfo, 
  getMonthZhi, 
  getStageOfBranchForElement, 
  generateProfessionalSummary, 
  getSolarTermInfo,
  getYongShenElementStatus,
  getElementEnergyLevel
} from './utils/metaphysics';
import { 
  ZHI_TO_ELEMENT, 
  RELATION_CLASHES, 
  SIX_HARMONIES, 
  CATEGORY_CONFIG, 
  RELATION_HARMS, 
  RELATION_DESTRUCTIONS, 
  SELF_PUNISHMENTS, 
  RELATION_PUNISHMENTS 
} from './metaphysics_config';
import { Zhi, DayInfo, CategoryKey, Element } from './types';

interface Props {
  activeCategory: CategoryKey;
  yongShen: Zhi[];
  onOpenConfig?: () => void;
}

// 板块URL映射
const categorySlugs: Record<CategoryKey, string> = {
  '健康': 'health',
  '事业': 'career',
  '财运': 'wealth',
  '感情': 'love',
  '出行': 'travel',
  '风水': 'fengshui'
};

const getDateFromPath = (): Date | null => {
  const pathMatch = window.location.pathname.match(/\/(\d{4}-\d{2}-\d{2})\.html$/);
  if (!pathMatch) return null;
  const [year, month, day] = pathMatch[1].split('-').map(Number);
  return new Date(year, month - 1, day);
};

const CalendarView: React.FC<Props> = ({ activeCategory, yongShen, onOpenConfig }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // 从URL读取当前月份，日期详情页优先使用路径里的月份
    const urlParams = new URLSearchParams(window.location.search);
    const year = urlParams.get('year');
    const month = urlParams.get('month');
    if (year && month) {
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    const dateFromPath = getDateFromPath();
    if (dateFromPath) {
      return new Date(dateFromPath.getFullYear(), dateFromPath.getMonth(), 1);
    }
    return new Date();
  });
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(() => {
    // 从URL读取选中的日期
    const dateFromPath = getDateFromPath();
    return dateFromPath ? getDayInfo(dateFromPath) : null;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 监听浏览器前进后退
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const year = urlParams.get('year');
      const month = urlParams.get('month');
      if (year && month) {
        setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
      }
      
      const dateFromPath = getDateFromPath();
      if (dateFromPath) {
        setCurrentDate(new Date(dateFromPath.getFullYear(), dateFromPath.getMonth(), 1));
        setSelectedDay(getDayInfo(dateFromPath));
      } else {
        setSelectedDay(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const monthZhi = useMemo(() => getMonthZhi(currentDate), [currentDate]);

  // 计算当月日历数据，并在移动端强制填充至 42 个格子 (6行)，保证布局高度一致
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (DayInfo | null)[] = [];
    
    // 头部填充
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    // 日期填充
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(getDayInfo(new Date(year, month, d)));
    
    // 尾部填充 (仅移动端需要强制填满 6 行，PC 端保持自然)
    if (window.innerWidth < 1024) {
        const totalSlots = 42; // 6 rows * 7 cols
        while (days.length < totalSlots) {
            days.push(null);
        }
    }
    
    return days;
  }, [currentDate, isMobile]);

  const getDayHighlights = (dayZhi: Zhi) => {
    if (yongShen.length === 0) return { type: null, tags: [] };
    let relationType: '合' | '冲' | '刑' | null = null;
    const tags: string[] = [];
    yongShen.forEach(ys => {
      if (RELATION_CLASHES[ys] === dayZhi) relationType = '冲';
      if (SIX_HARMONIES[ys]?.target === dayZhi) relationType = '合';
      const isPunishment = ((ys === '子' && dayZhi === '卯') || (ys === '卯' && dayZhi === '子') || (SELF_PUNISHMENTS.includes(ys) && ys === dayZhi));
      if (isPunishment) relationType = '刑';
      const el = ZHI_TO_ELEMENT[ys];
      const stage = getStageOfBranchForElement(dayZhi, el);
      const swMap: any = { '长生': '生', '临官': '禄', '帝旺': '旺', '墓': '库', '死': '死', '绝': '绝' };
      if (swMap[stage]) tags.push(`${ys}${swMap[stage]}`);
    });
    return { type: relationType, tags: [...new Set(tags)] };
  };

  const activeCategoryData = CATEGORY_CONFIG.find(c => c.title === activeCategory)!;
  const summaryPoints = useMemo(() => selectedDay ? generateProfessionalSummary(selectedDay, monthZhi, yongShen, activeCategory) : [], [selectedDay, monthZhi, yongShen, activeCategory]);

  // --- PC 端详情模态框 ---
  const renderPCModal = (day: DayInfo) => {
    const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
    return (
    <div id="calendar-view-pc-modal" className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-red-50 my-4">
      <button id="calendar-view-pc-modal-close" onClick={() => setSelectedDay(null)} className="absolute top-8 right-8 bg-red-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-[210] hover:scale-105 transition">
        <i className="fa-solid fa-xmark text-2xl"></i>
      </button>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 20px)' }}>
        {/* 1. Header 头部区域 */}
        <header id={`calendar-view-pc-modal-header-${dateStr}`} className="px-12 py-10 border-b border-red-50 bg-red-50/10 flex items-end gap-12 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-20 text-[20rem] font-black text-red-900/5 select-none">{day.ganZhi.zhi}</div>
          <div className="flex items-center gap-10 relative z-10">
            <h2 id={`calendar-view-pc-modal-ganzhi-${dateStr}`} className="text-[10rem] font-black text-red-900 tracking-tighter leading-none">{day.ganZhi.name}</h2>
            {day.festival && (
               <div id={`calendar-view-pc-modal-festival-${dateStr}`} className="bg-red-600 text-white px-8 py-3 rounded-3xl text-2xl font-black shadow-xl animate-pulse flex flex-col items-center">
                  <span className="text-[10px] opacity-60 mb-1 uppercase tracking-widest">FESTIVAL</span>
                  {day.festival}
               </div>
            )}
          </div>
          <div className="flex-1 relative z-10 mb-4">
            <div id={`calendar-view-pc-modal-xun-${dateStr}`} className="text-3xl font-black text-red-800/40 tracking-widest mb-2 uppercase">{day.xun} 空{day.xunKong.join('')}</div>
            <div id="calendar-view-pc-modal-date" className="flex items-center gap-4 mt-6">
              <span id={`calendar-view-pc-modal-lunar-${dateStr}`} className="bg-red-900 text-white px-6 py-2 rounded-full shadow-lg text-base font-bold">农历 {day.lunarMonth}{day.lunarDay}</span>
              <span id={`calendar-view-pc-modal-solar-${dateStr}`} className="text-3xl font-black text-green-700">
                {day.date.getMonth() + 1}月{day.date.getDate()}日
                <span className="mx-4 text-gray-200 font-normal">|</span>
                {getSolarTermInfo(day.date).proximityText}
              </span>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-8">
          {/* 2. 顶部通栏：值日专业总结 */}
          <section id={`calendar-view-pc-modal-summary-${dateStr}`} className="p-10 bg-[#fdfaf6] rounded-[3rem] border border-red-100 shadow-inner">
            <div className="mb-8 flex justify-between items-end border-b border-red-200 pb-4">
              <h3 className="text-2xl font-black text-red-900 flex items-center gap-4">
                <i className="fa-solid fa-scroll text-red-800"></i>值日专业总结
              </h3>
              <div className="text-right flex flex-col items-end opacity-20">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase">Professional Analysis</span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {summaryPoints.map((p, i) => (
                <div key={i} id={`calendar-view-pc-modal-summary-point-${dateStr}-${i}`} className="flex gap-5 items-start">
                  <div className={`mt-3 w-3 h-3 rounded-full shrink-0 shadow-sm ${p.type === 'warn' ? 'bg-orange-500' : p.type === 'success' ? 'bg-green-500' : 'bg-red-800/40'}`}></div>
                  <p className="text-2xl font-bold text-gray-800 leading-relaxed tracking-tight">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 左右分栏布局 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-1 md:col-span-7 flex flex-col gap-8">
              <div id={`calendar-view-pc-modal-yongshen-${dateStr}`} className="space-y-6 flex-1">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                  <h3 className="text-2xl font-black text-red-900 flex items-center gap-4">
                    <i className="fa-solid fa-bolt-lightning text-red-700"></i>重点用神分析
                  </h3>
                  <div className="text-right flex flex-col items-end opacity-20">
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">Yongshen Resonance</span>
                  </div>
                </div>
                {yongShen.length > 0 ? (
                  <div className="space-y-6">
                    {yongShen.map(ys => {
                      const ysEl = ZHI_TO_ELEMENT[ys];
                      const stage = getStageOfBranchForElement(day.ganZhi.zhi, ysEl);
                      const vitality = getYongShenElementStatus(ys, day.ganZhi.zhi);
                      const energy = getElementEnergyLevel(ysEl, day.ganZhi.zhi);
                      const isGreen = (energy.status === '旺' || energy.status === '相') && ['长生', '临官', '帝旺'].includes(stage);
                      const isRed = (energy.status === '囚' || energy.status === '死') && (['绝', '死'].includes(stage) || (stage === '墓' && ysEl !== Element.EARTH));
                      return (
                        <div key={ys} id={`calendar-view-pc-modal-yongshen-item-${dateStr}-${ys}`} className={`flex items-center gap-8 p-8 rounded-[2.5rem] border transition-all 
                          ${isGreen ? 'bg-green-50 border-green-200 shadow-md' : isRed ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}>
                          <div id={`calendar-view-pc-modal-yongshen-zhi-${dateStr}-${ys}`} className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-5xl shadow-md shrink-0
                            ${isGreen ? 'bg-green-600 text-white' : isRed ? 'bg-red-600 text-white' : 'bg-red-50 text-red-900'}`}>
                            {ys}
                          </div>
                          <div className="grid grid-cols-3 flex-1 gap-6">
                            <div className="flex flex-col"><span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">五行 Vitality</span><span className={`text-3xl font-black ${vitality === '生助' ? 'text-green-600' : vitality === '克泄' ? 'text-red-600' : 'text-gray-700'}`}>{vitality}</span></div>
                            <div className="flex flex-col"><span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">长生 Stage</span><span className={`text-3xl font-black ${['长生', '临官', '帝旺'].includes(stage) ? 'text-green-700' : 'text-gray-700'}`}>{stage}</span></div>
                            <div className="flex flex-col justify-center items-end opacity-20"><div className="text-[8px] font-black uppercase tracking-widest mb-1">Resonance</div><div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${isGreen ? 'bg-green-500 w-full' : isRed ? 'bg-red-500 w-full' : 'bg-gray-300 w-1/2'}`}></div></div></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div id={`calendar-view-pc-modal-yongshen-empty-${dateStr}`} className="border-2 border-dashed border-red-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-60 bg-red-50/10 min-h-[200px]">
                     <i className="fa-solid fa-bullseye text-5xl text-red-800 mb-5 opacity-50"></i>
                     <p className="text-2xl font-bold text-red-900 mb-2">暂无用神标记</p>
                  </div>
                )}
              </div>
              <div id={`calendar-view-pc-modal-atmosphere-${dateStr}`} className={`p-10 bg-[#3a3535] text-white rounded-[3rem] shadow-2xl relative overflow-hidden ${yongShen.length > 0 ? 'mt-auto' : ''}`}>
                <div className="absolute -top-6 -right-6 text-[12rem] font-black opacity-[0.05] select-none pointer-events-none">气</div>
                <div className="flex justify-between items-start mb-8"><h3 className="text-xl font-black text-white flex items-center gap-3"><i className="fa-solid fa-wind text-gray-400"></i> 气场总结</h3><span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Atmosphere Summary</span></div>
                <div className="mb-4"><span className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-black text-white/60 mb-2 uppercase tracking-widest border border-white/5">{activeCategory}意向</span><p id={`calendar-view-pc-modal-atmosphere-meaning-${dateStr}`} className="text-2xl font-black text-white/90 leading-tight">{activeCategoryData.branchMeanings[day.ganZhi.zhi] || '无特殊意向'}</p></div>
                <p id={`calendar-view-pc-modal-atmosphere-text-${dateStr}`} className="font-bold leading-relaxed opacity-60 italic font-serif text-lg border-t border-white/10 pt-4 mt-2">今日值{day.ganZhi.name}之气，属{day.xun}。空亡在{day.xunKong.join('')}，务必顺天应时，不宜强求。</p>
              </div>
            </div>
            <div id={`calendar-view-pc-modal-relations-${dateStr}`} className="col-span-1 md:col-span-5 space-y-8">
              <div id={`calendar-view-pc-modal-relations-panel-${dateStr}`} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                 <div className="mb-6 flex justify-between items-end border-b border-gray-100 pb-4"><h3 className="text-2xl font-black text-red-900 flex items-center gap-3"><i className="fa-solid fa-network-wired text-red-700"></i>地支全景关系</h3><div className="text-right flex flex-col items-end opacity-20"><span className="text-[9px] font-black tracking-[0.3em] uppercase">Panorama Relationships</span></div></div>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: '六冲 Clash', val: RELATION_CLASHES[day.ganZhi.zhi] || '无', icon: 'fa-burst', color: 'text-orange-900' },
                      { label: '六合 Harmony', val: SIX_HARMONIES[day.ganZhi.zhi]?.target || '无', icon: 'fa-link', color: 'text-green-900' },
                      { label: '相害 Harm', val: RELATION_HARMS[day.ganZhi.zhi] || '无', icon: 'fa-bolt', color: 'text-gray-700' },
                      { label: '相破 Break', val: RELATION_DESTRUCTIONS[day.ganZhi.zhi] || '无', icon: 'fa-hand-fist', color: 'text-gray-700' },
                      { label: '刑伤 Punishment', val: (() => { const p = RELATION_PUNISHMENTS[day.ganZhi.zhi] || []; return p.length > 0 ? `${day.ganZhi.zhi}${p.join('')}刑` : '无'; })(), icon: 'fa-gavel', color: 'text-red-800', fullWidth: true }
                    ].map(item => (
                      <div key={item.label} className={`bg-gray-50/40 p-5 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center ${item.fullWidth ? 'col-span-2 bg-red-50/20 border-red-50' : ''}`}>
                         <i className={`fa-solid ${item.icon} ${item.color} opacity-20 text-2xl mb-2`}></i>
                         <div className={`text-2xl font-black ${item.color} mb-1`}>{item.val}</div>
                         <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</div>
                      </div>
                    ))}
                 </div>
              </div>
              <div id={`calendar-view-pc-modal-energy-${dateStr}`} className="bg-[#fdfaf6] p-8 rounded-[3rem] border border-red-50 shadow-inner">
                <div className="mb-6 flex justify-between items-end border-b border-red-200 pb-4"><h3 className="text-2xl font-black text-red-900 flex items-center gap-3"><i className="fa-solid fa-chart-simple text-red-700"></i>今日五行生气</h3><div className="text-right flex flex-col items-end opacity-20"><span className="text-[9px] font-black tracking-[0.3em] uppercase">Energy Distribution</span></div></div>
                <div className="grid grid-cols-5 gap-3 h-48 items-end">
                  {[Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER].map(el => {
                    const { level, status } = getElementEnergyLevel(el, day.ganZhi.zhi);
                    const isWang = status === '旺';
                    const isSi = status === '死';
                    return (
                      <div key={el} className="flex flex-col items-center h-full justify-end group cursor-default">
                        <div className="relative w-full flex flex-col items-center flex-1 justify-end"><div className={`w-full rounded-t-2xl shadow-md transition-all duration-700 ease-out relative ${isWang ? `bg-gradient-to-t from-red-400 to-red-700 ring-2 ring-white` : isSi ? 'bg-gray-300/40 opacity-50' : 'bg-gray-200'}`} style={{ height: `${(level/5)*100}%` }}></div></div>
                        <div className="mt-3 text-center"><span className={`text-xl font-black block leading-none mb-1 ${isWang ? 'text-red-900' : isSi ? 'text-gray-300' : 'text-gray-800'}`}>{el}</span><span className={`text-[8px] font-black uppercase ${isWang ? 'text-red-700' : 'text-gray-400'}`}>{status}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // --- 移动端详情渲染 (高密度排版，顶部避让) ---
  const renderMobileModal = (day: DayInfo) => {
    const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
    return (
    <div id="calendar-view-mobile-modal" className="bg-white w-full h-full flex flex-col relative">
      <button id="calendar-view-mobile-modal-close" onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 bg-red-900 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-[210]">
        <i className="fa-solid fa-xmark text-lg"></i>
      </button>
      
      <div id="calendar-view-mobile-modal-content" className="flex-1 overflow-y-auto pt-safe pb-safe px-2 py-4 custom-scrollbar">
        <header id="calendar-view-mobile-modal-header" className="text-center mb-6">
          {day.festival && <div id={`calendar-view-mobile-modal-festival-${dateStr}`} className="text-red-600 font-black text-sm mb-2 animate-pulse"><i className="fa-solid fa-gift mr-1"></i>{day.festival}</div>}
          <div id={`calendar-view-mobile-modal-ganzhi-${dateStr}`} className="text-[7rem] font-black text-red-900 leading-none tracking-tighter">{day.ganZhi.name}</div>
          <div id={`calendar-view-mobile-modal-xun-${dateStr}`} className="text-sm font-black text-red-800/40 uppercase tracking-widest mt-2">{day.xun} | 空{day.xunKong.join('')}</div>
          <div id="calendar-view-mobile-modal-date" className="mt-6 flex flex-col gap-2 items-center">
            <span id={`calendar-view-mobile-modal-lunar-${dateStr}`} className="bg-red-900 text-white px-8 py-2 rounded-full text-sm font-bold shadow-xl">农历 {day.lunarMonth}{day.lunarDay}</span>
            <span id={`calendar-view-mobile-modal-solar-${dateStr}`} className="text-lg font-black text-green-700">
              {day.date.getMonth() + 1}月{day.date.getDate()}日 · {getSolarTermInfo(day.date).proximityText}
            </span>
          </div>
        </header>

        <section className="space-y-5 px-2">
          {/* 1. 总结 */}
          <div className="p-5 bg-red-50/40 rounded-3xl border border-red-100">
            <h3 className="text-sm font-black text-red-900 mb-3 border-b border-red-200 pb-2 flex justify-between items-center">
              <span>值日分析总结</span>
              <span className="text-[8px] opacity-30 uppercase tracking-[0.2em]">Summary</span>
            </h3>
            <div className="space-y-3">
              {summaryPoints.map((p, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${p.type === 'warn' ? 'bg-orange-500' : p.type === 'success' ? 'bg-green-500' : 'bg-red-800/40'}`}></div>
                  <p className="text-base font-bold text-gray-800 leading-relaxed tracking-tight">{p.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 用神 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">用神动态 Resonance</h3>
              {yongShen.length > 0 && onOpenConfig && (
                <button onClick={onOpenConfig} className="text-red-800/60 active:scale-90 transition">
                  <i className="fa-solid fa-gear"></i>
                </button>
              )}
            </div>

            {yongShen.length > 0 ? (
              yongShen.map(ys => {
                const ysEl = ZHI_TO_ELEMENT[ys];
                const stage = getStageOfBranchForElement(day.ganZhi.zhi, ysEl);
                const vitality = getYongShenElementStatus(ys, day.ganZhi.zhi);
                const energy = getElementEnergyLevel(ysEl, day.ganZhi.zhi);
                const isGreen = (energy.status === '旺' || energy.status === '相') && ['长生', '临官', '帝旺'].includes(stage);
                const isRed = (energy.status === '囚' || energy.status === '死') && (['绝', '死'].includes(stage) || (stage === '墓' && ysEl !== Element.EARTH));
                return (
                  <div key={ys} className={`flex items-center gap-4 p-5 rounded-[2rem] border-2 shadow-sm ${isGreen ? 'bg-green-50 border-green-200' : isRed ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shrink-0 ${isGreen ? 'bg-green-600 text-white' : isRed ? 'bg-red-600 text-white' : 'bg-red-50 text-red-900'}`}>{ys}</div>
                    <div className="flex-1 grid grid-cols-2 gap-2 text-center">
                      <div className="flex flex-col"><span className="text-[8px] text-gray-400 uppercase font-black mb-1 tracking-tighter">Vitality</span><span className={`text-xl font-black ${vitality === '生助' ? 'text-green-700' : vitality === '克泄' ? 'text-red-700' : ''}`}>{vitality}</span></div>
                      <div className="flex flex-col"><span className="text-[8px] text-gray-400 uppercase font-black mb-1 tracking-tighter">Life Stage</span><span className={`text-xl font-black ${isGreen ? 'text-green-800' : ''}`}>{stage}</span></div>
                    </div>
                  </div>
                );
              })
            ) : (
              onOpenConfig && (
                <button onClick={onOpenConfig} className="w-full py-3 border-2 border-dashed border-red-200 rounded-xl bg-red-50/20 text-red-800/60 font-bold flex items-center justify-center gap-2 active:bg-red-50/50 transition text-sm">
                  <i className="fa-solid fa-bullseye"></i><span>点击快速标记用神</span>
                </button>
              )
            )}
          </div>

          {/* 3. 关系 */}
          <div className="p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
             <h3 className="text-[10px] font-black text-red-900/30 mb-4 uppercase tracking-[0.3em]">地支关系 Relationships</h3>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '六冲', val: RELATION_CLASHES[day.ganZhi.zhi] || '无' },
                  { label: '六合', val: SIX_HARMONIES[day.ganZhi.zhi]?.target || '无' },
                  { label: '相害', val: RELATION_HARMS[day.ganZhi.zhi] || '无' },
                  { label: '相破', val: RELATION_DESTRUCTIONS[day.ganZhi.zhi] || '无' }
                ].map(r => (
                  <div key={r.label} className="bg-gray-50/50 p-4 rounded-2xl text-center border border-gray-100">
                    <span className="text-xl font-black block mb-1 text-red-900">{r.val}</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{r.label}</span>
                  </div>
                ))}
             </div>
             <div className="mt-3 p-4 bg-red-50/50 rounded-2xl border border-red-100 text-center">
                <span className="text-[9px] font-black text-red-900/40 uppercase mb-1 block tracking-widest">刑伤及自刑</span>
                <span className="text-xl font-black text-red-800">
                  {(() => {
                      const p = RELATION_PUNISHMENTS[day.ganZhi.zhi] || [];
                      return p.length > 0 ? `${day.ganZhi.zhi}${p.join('')}刑` : '气场平和';
                  })()}
                </span>
             </div>
          </div>

          {/* 4. 分布 */}
          <div className="p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-300 mb-4 uppercase tracking-[0.3em]">五行分布 Energy Distributions</h3>
            <div className="grid grid-cols-5 gap-2 h-28 items-end px-1">
              {[Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER].map(el => {
                const { level, status } = getElementEnergyLevel(el, day.ganZhi.zhi);
                return (
                  <div key={el} className="flex flex-col items-center h-full justify-end">
                    <div className={`w-full rounded-t-lg transition-all duration-500 shadow-md ${status === '旺' ? 'bg-red-800 ring-2 ring-white' : 'bg-gray-100'}`} style={{ height: `${(level/5)*100}%` }}></div>
                    <span className={`text-xs font-black mt-2 ${status === '旺' ? 'text-red-900' : 'text-gray-400'}`}>{el}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. 气场总结 */}
          <div className="p-6 bg-[#3a3535] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute -top-6 -right-6 text-[8rem] font-black opacity-[0.05] select-none pointer-events-none">气</div>
             <div className="mb-3">
                <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-[9px] font-black text-white/60 mb-2 uppercase tracking-widest border border-white/5">{activeCategory}意向</span>
                <p className="text-lg font-black text-white/90 leading-tight">
                  {activeCategoryData.branchMeanings[day.ganZhi.zhi] || '无特殊意向'}
                </p>
             </div>
             <p className="text-sm font-bold opacity-60 italic leading-relaxed tracking-tight border-t border-white/10 pt-3 mt-1">
                今日处于{day.ganZhi.name}之气。空亡在{day.xunKong.join('')}，务必顺天应时，不宜强求。
             </p>
          </div>
        </section>
      </div>
    </div>
  );
  };

  // --- 主视图渲染 ---
  return (
    <div id="calendar-view-container" className={`flex flex-col h-full ${isMobile ? 'overflow-hidden' : ''}`}>
      <style>{`
        /* ===== 中矮视口响应式（13/14 寸笔记本等，视觉语言不变只压密度）=====
           目标：整月尽量一屏可见；详情卡片尽量展示、放不下才滚动 */
        @media (min-width: 1024px) and (max-height: 1000px) {
          /* 顶部年月导航压缩 */
          #calendar-view-header { padding: 8px 24px !important; margin-bottom: 10px !important; }
          #calendar-view-month-year-text { font-size: clamp(22px, 3.1vh, 40px) !important; }
          #calendar-view-month-zhi { font-size: 11px !important; margin-top: 0 !important; }
          /* 月历格子：高度/字号随视口收缩（6 行月份 + 头部 ≈ 一屏） */
          a[id^="calendar-view-day-2"] {
            min-height: 0 !important;
            padding: clamp(6px, 0.9vh, 20px) !important;
            border-radius: clamp(14px, 2vh, 48px) !important;
          }
          [id^="calendar-view-day-ganzhi-"] { font-size: clamp(19px, 3.2vh, 42px) !important; margin-bottom: clamp(1px, 0.4vh, 10px) !important; }
          [id^="calendar-view-day-lunar-"] { font-size: clamp(10px, 1.4vh, 15px) !important; margin-bottom: 1px !important; }
          [id^="calendar-view-day-xunkong-"] { font-size: 9px !important; }
          [id^="calendar-view-day-solarterm-"] { font-size: 9px !important; padding: 1px 7px !important; margin-bottom: 1px !important; }
          /* 旬名是低层级装饰行（移动端本就不渲染），矮屏隐藏换整月一屏 */
          [id^="calendar-view-day-xun-"] { display: none !important; }
          /* 收紧网格/星期行/顶部 tabs */
          div:has(> a[id^="calendar-view-day-2"]) { gap: 8px !important; }
          #calendar-view-weekdays { gap: 8px !important; margin-bottom: 6px !important; }
          #calendar-view-weekdays > * { font-size: 12px !important; padding: 2px 0 !important; }
          #calendar-pc-tab-container { margin-bottom: 8px !important; }
          #calendar-pc-tab-container a, #calendar-pc-tab-container button { padding-top: 7px !important; padding-bottom: 7px !important; }
          /* 详情卡片：头部与内容块整体压缩，先展示后滚动 */
          #calendar-view-pc-modal { max-height: 94vh !important; border-radius: 1.75rem !important; }
          [id^="calendar-view-pc-modal-header-"] { padding: clamp(14px, 2.4vh, 40px) clamp(24px, 3vw, 48px) !important; }
          [id^="calendar-view-pc-modal-ganzhi-"] { font-size: clamp(56px, 12vh, 150px) !important; }
          [id^="calendar-view-pc-modal-xun-"] { font-size: clamp(15px, 2.2vh, 28px) !important; margin-bottom: 2px !important; }
          [id^="calendar-view-pc-modal-festival-"] { font-size: 16px !important; padding: 8px 18px !important; }
          [id^="calendar-view-pc-modal-yongshen-item-"] { padding: clamp(12px, 1.8vh, 32px) clamp(16px, 2vw, 32px) !important; gap: clamp(12px, 2vw, 32px) !important; border-radius: 1.25rem !important; }
          [id^="calendar-view-pc-modal-atmosphere-text-"] { font-size: 14px !important; padding-top: 10px !important; margin-top: 6px !important; }
          [id^="calendar-view-pc-modal-summary-"] { font-size: 14px !important; }
        }
        /* 矮小手机（iPhone SE 等）：移动详情头部干支压缩，正文更早进入视口 */
        @media (max-width: 1023px) and (max-height: 750px) {
          [id^="calendar-view-mobile-modal-ganzhi-"] { font-size: clamp(60px, 22vw, 96px) !important; }
          #calendar-view-mobile-modal-header { margin-bottom: 12px !important; }
        }
      `}</style>
      {/* 顶部标题栏 (PC/Mobile) */}
      {/* 优化: 移动端增加 mt-4 和 py-4，与顶部导航拉开距离，不再拥挤 */}
      <header id="calendar-view-header" className={`flex flex-col md:flex-row items-center bg-white shadow-sm border border-red-50 relative shrink-0 z-10 ${isMobile ? 'mt-4 mb-3 p-3 rounded-2xl justify-between' : 'mb-10 p-8 rounded-3xl justify-center'}`}>
        
        {/* 日期控制器 */}
        <div id="calendar-view-date-control" className={`flex items-center ${isMobile ? 'gap-6' : 'gap-10'}`}>
          {(() => {
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const prevYear = prevMonth.getFullYear();
            const prevMonthNum = prevMonth.getMonth() + 1;
            // 根据当前URL路径决定跳转URL
            const currentPath = window.location.pathname;
            const isCategoryPage = currentPath.match(/\/(?:m-)?calendar\/(health|career|wealth|love|travel|fengshui)\.html/);
            const basePath = isCategoryPage
              ? currentPath.replace(/\.html.*$/, '.html')
              : '/calendar.html'; // 响应式一份为准，移动端不再用 m- 壳页
            const prevUrl = `${basePath}?year=${prevYear}&month=${prevMonthNum}`;
            return (
              <a
                id="calendar-view-prev-month"
                href={prevUrl}
                onClick={(e) => {
                  if ((window as any).__REACT_LOADED__) {
                    e.preventDefault();
                    setCurrentDate(prevMonth);
                    window.history.pushState({ year: prevYear, month: prevMonthNum }, '', prevUrl);
                  }
                }}
                className="text-red-800 transition active:scale-90 no-underline"
                title={`查看${prevYear}年${prevMonthNum}月择日日历`}
              >
                <i className={`fa-solid fa-circle-arrow-left ${isMobile ? 'fa-xl' : 'fa-2xl'}`}></i>
              </a>
            );
          })()}
          <div id="calendar-view-month-year" className="text-center">
            <h2 id="calendar-view-month-year-text" className={`font-black text-red-900 tracking-tighter ${isMobile ? 'text-2xl' : 'text-5xl'}`}>
              {currentDate.getFullYear()}<span className="text-red-200 mx-2 text-lg xl:text-2xl">/</span>{currentDate.getMonth() + 1}月
            </h2>
            <p id="calendar-view-month-zhi" className={`font-bold text-gray-400 mt-1 uppercase tracking-widest ${isMobile ? 'text-[9px]' : 'text-lg'}`}>月建 <span className="text-red-800 ml-1">{monthZhi}</span></p>
          </div>
          {(() => {
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            const nextYear = nextMonth.getFullYear();
            const nextMonthNum = nextMonth.getMonth() + 1;
            // 根据当前URL路径决定跳转URL
            const currentPath = window.location.pathname;
            const isCategoryPage = currentPath.match(/\/(?:m-)?calendar\/(health|career|wealth|love|travel|fengshui)\.html/);
            const basePath = isCategoryPage
              ? currentPath.replace(/\.html.*$/, '.html')
              : '/calendar.html'; // 响应式一份为准，移动端不再用 m- 壳页
            const nextUrl = `${basePath}?year=${nextYear}&month=${nextMonthNum}`;
            return (
              <a
                id="calendar-view-next-month"
                href={nextUrl}
                onClick={(e) => {
                  if ((window as any).__REACT_LOADED__) {
                    e.preventDefault();
                    setCurrentDate(nextMonth);
                    window.history.pushState({ year: nextYear, month: nextMonthNum }, '', nextUrl);
                  }
                }}
                className="text-red-800 transition active:scale-90 no-underline"
                title={`查看${nextYear}年${nextMonthNum}月择日日历`}
              >
                <i className={`fa-solid fa-circle-arrow-right ${isMobile ? 'fa-xl' : 'fa-2xl'}`}></i>
              </a>
            );
          })()}
        </div>

        {!isMobile && (
          <div id="calendar-view-category-display" className="absolute right-8 flex items-center gap-3 text-2xl font-black text-red-900">
            <i className={`fa-solid ${activeCategoryData.icon} text-red-700`}></i>{activeCategory}
          </div>
        )}
      </header>

      {/* 星期抬头 */}
      <div id="calendar-view-weekdays" className={`grid grid-cols-7 shrink-0 ${isMobile ? 'gap-2 mb-2' : 'gap-5 mb-6'}`}>
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} id={`calendar-view-weekday-${d}`} className={`text-center font-black text-gray-400 uppercase tracking-widest flex items-center justify-center ${isMobile ? 'text-[10px] h-6' : 'text-sm'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 日历网格区域 - 移动端使用 flex-1 撑满剩余空间 */}
      {/* 优化: 间距加大至 gap-2，并在底部留出 pb-2 缓冲，配合 flex-1 撑满高度，消除底部大面积留白 */}
      <div id="calendar-view-grid" className={`grid grid-cols-7 ${isMobile ? 'gap-2 flex-1 grid-rows-6 min-h-0 pb-2' : 'gap-5 mb-10'}`}>
        
        {/* 日期格子 */}
        {daysInMonth.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="bg-transparent border-none pointer-events-none opacity-0"></div>;
          }
          
          const hl = getDayHighlights(day.ganZhi.zhi);
          const year = day.date.getFullYear();
          const month = day.date.getMonth() + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day.solarDay).padStart(2, '0')}`;
          // 根据当前URL路径决定日期页面URL
          const currentPath = window.location.pathname;
          const categoryMatch = currentPath.match(/\/(?:m-)?calendar\/(health|career|wealth|love|travel|fengshui)(?:\.html|\/)/);
          const categoryPath = categoryMatch ? `${categoryMatch[1]}/` : '';
          // 日期详情页只有 /calendar/ 一份（响应式，2026-07-08 起），移动端不再加 m- 前缀
          const dateUrl = `/calendar/${categoryPath}${dateStr}.html`;
          
          return (
            <a
              key={idx}
              id={`calendar-view-day-${dateStr}`}
              href={dateUrl}
              onClick={(e) => {
                if ((window as any).__REACT_LOADED__) {
                  e.preventDefault();
                  setSelectedDay(day);
                  window.history.pushState({ day: day.date }, '', dateUrl);
                }
              }}
              className={`border transition-all duration-300 cursor-pointer relative flex flex-col overflow-hidden no-underline
                ${isMobile ? 'h-full rounded-xl p-1' : 'min-h-[220px] rounded-[3rem] p-6'}
                ${day.isToday ? 'ring-2 xl:ring-4 ring-red-500/30 bg-red-50/10' : 'bg-white'}
                ${hl.type === '冲' ? 'border-orange-200 bg-orange-50/5' : hl.type === '合' ? 'border-green-200 bg-green-50/5' : hl.type === '刑' ? 'border-red-200 bg-red-50/5' : 'border-gray-50 shadow-sm'}
                hover:shadow-xl active:scale-95`}
              title={`${year}年${month}月${day.solarDay}日 ${day.ganZhi.name}择日分析`}
            >
                  {/* PC 水印 */}
                  {!isMobile && hl.type && <div className="calendar-relation-stamp">{hl.type}</div>}

                  <div className="flex justify-between items-start z-10">
                <span id={`calendar-view-day-label-${dateStr}`} className={`font-black text-gray-300 ${isMobile ? 'text-xs pl-1 pt-1' : 'text-sm'}`}>{day.solarDay}</span>
                {!isMobile && <span id={`calendar-view-day-xunkong-${dateStr}`} className="text-[10px] font-black text-red-800/40 uppercase tracking-widest">空 {day.xunKong.join('')}</span>}
                  </div>

                  {/* 优化：移动端改为 justify-start + pt-1.5，确保对齐更舒适且统一 */}
                  <div className={`flex flex-col items-center flex-1 z-10 ${isMobile ? 'justify-start pt-1.5' : 'justify-center'}`}>
                <div id={`calendar-view-day-ganzhi-${dateStr}`} className={`font-black text-red-900 tracking-tighter leading-none whitespace-nowrap ${isMobile ? 'text-xl mb-0.5' : 'text-5xl mb-3'}`}>
                      {day.ganZhi.name}
                    </div>
                    
                <div id={`calendar-view-day-lunar-${dateStr}`} className={`font-bold truncate w-full text-center ${isMobile ? 'text-[9px] leading-tight' : 'text-base mb-1'} ${day.festival ? 'text-red-600' : 'text-gray-500'}`}>
                      {day.festival || day.lunarDay}
                    </div>
                    
                    {!isMobile && (
                      <>
                    {day.solarTerm && <div id={`calendar-view-day-solarterm-${dateStr}`} className="text-xs font-black text-green-700 bg-green-50 px-3 py-0.5 rounded-full mb-1 border border-green-100">{day.solarTerm}</div>}
                    <div id={`calendar-view-day-xun-${dateStr}`} className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{day.xun}</div>
                      </>
                    )}

                    {isMobile && day.solarTerm && (
                  <div id={`calendar-view-day-solarterm-mobile-${dateStr}`} className="text-[8px] font-black text-green-700 bg-green-50 px-1 py-0 rounded-full border border-green-100 mt-1 scale-90">{day.solarTerm}</div>
                    )}
                  </div>
            </a>
          );
        })}
      </div>

      {/* 详情卡片模态框 - 移动端 top-14 避让 Header。
          PC 端必须 fixed（旧的 xl:absolute 会相对 1300px+ 高的日历容器定位，
          用户滚到月中打开时卡片落在视口外——"展示不完整"的根因） */}
      {selectedDay && (
        <div id="calendar-view-modal" className={`fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in zoom-in duration-300 overflow-y-auto
           ${isMobile ? 'top-14 bg-white' : 'bg-red-900/10 backdrop-blur-xl p-4'}`}
           style={{ maxHeight: '100vh', overflow: 'hidden' }}>
          {isMobile ? renderMobileModal(selectedDay) : renderPCModal(selectedDay)}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
