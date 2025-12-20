
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { getDayInfo, getLifeStage, getWangXiang, getMonthZhi, getStageOfBranchForElement } from './utils/metaphysics';
import { ZHIS, GANS, LIFE_STAGES } from './constants';
import { 
  ZHI_TO_ELEMENT, RELATION_CLASHES, RELATION_HARMONIES, SIX_HARMONIES, 
  CATEGORY_CONFIG, THREE_HARMONY_SETS, THREE_PUNISHMENT_SETS, SELF_PUNISHMENTS, INTENTIONS_DATA,
  RELATION_PUNISHMENTS, ELEMENT_BIRTH_ZHI
} from './metaphysics_config';
import { DayInfo, Zhi, Element, CategoryKey, AppTab } from './types';

const ELEMENTS: Element[] = [Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER];

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('事业');
  const [yongShen, setYongShen] = useState<Zhi[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('calendar');

  const monthZhi = useMemo(() => getMonthZhi(currentDate), [currentDate]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (DayInfo | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(getDayInfo(new Date(year, month, d)));
    return days;
  }, [currentDate]);

  const getYongShenShengWang = (ys: Zhi, dayZhi: Zhi) => {
    const el = ZHI_TO_ELEMENT[ys];
    const stage = getStageOfBranchForElement(dayZhi, el);
    const highlights: Record<string, string> = { '长生': '生', '临官': '禄', '帝旺': '旺', '死': '死', '绝': '绝', '墓': '库' };
    return highlights[stage] || null;
  };

  const getDayHighlights = (dayZhi: Zhi) => {
    if (yongShen.length === 0) return { type: null, tags: [] };
    
    let relationType: '合' | '冲' | '刑' | null = null;
    const tags: string[] = [];

    yongShen.forEach(ys => {
      // Tags for status (No highlighting background for these)
      const sw = getYongShenShengWang(ys, dayZhi);
      if (sw) tags.push(`${ys}${sw}`);

      // 1. Direct Relationships (Type A)
      // Clash
      if (RELATION_CLASHES[ys] === dayZhi) relationType = '冲';
      // 6-Harmony
      if (SIX_HARMONIES[ys]?.target === dayZhi) relationType = '合';
      // Punishment (2-branch or self)
      const isPunishment = (
        (ys === '子' && dayZhi === '卯') || (ys === '卯' && dayZhi === '子') ||
        (SELF_PUNISHMENTS.includes(ys) && ys === dayZhi)
      );
      if (isPunishment) relationType = '刑';

      // 2. Full Triangle Relationships (Type B)
      // Full 3-Harmony
      THREE_HARMONY_SETS.forEach(set => {
        if (set.includes(monthZhi) && set.includes(dayZhi) && set.includes(ys)) {
          relationType = '合';
        }
      });
      // Full 3-Punishment
      THREE_PUNISHMENT_SETS.forEach(set => {
        if (set.includes(monthZhi) && set.includes(dayZhi) && set.includes(ys)) {
          relationType = '刑';
        }
      });
    });

    return { type: relationType, tags: [...new Set(tags)] };
  };

  const activeCategoryData = CATEGORY_CONFIG.find(c => c.title === activeCategory)!;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fdfaf6] text-gray-900 transition-all duration-300">
      {/* Sidebar */}
      <aside className="w-full lg:w-96 bg-white border-b lg:border-r border-red-100 p-6 flex flex-col gap-8 shadow-sm overflow-y-auto z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">玄</div>
            <div>
              <h1 className="text-lg font-bold text-red-900 leading-tight">玄空数术</h1>
              <p className="text-[10px] text-gray-400 font-medium">八字六爻快速择日工具</p>
            </div>
          </div>
          <hr className="border-red-50 my-4" />
        </div>

        <section>
          <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> 1. 选择预测板块</h3>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORY_CONFIG.map(cat => (
              <button key={cat.title} onClick={() => setActiveCategory(cat.title)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 text-xs border
                  ${activeCategory === cat.title ? 'bg-red-800 text-white border-red-800 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-100 hover:bg-red-50/20'}`}>
                <i className={`fa-solid ${cat.icon} text-lg`}></i>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-50/50 rounded-lg text-[11px] text-red-700 leading-relaxed border border-red-100">
            <strong>{activeCategory}解析：</strong>{activeCategoryData.description}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2"><i className="fa-solid fa-bullseye"></i> 2. 标记用神地支</h3>
          <div className="grid grid-cols-4 gap-2">
            {ZHIS.map(z => (
              <button key={z} onClick={() => setYongShen(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])}
                className={`h-10 rounded-lg font-bold transition-all border
                  ${yongShen.includes(z) ? 'bg-red-800 text-white border-red-800 shadow-sm scale-105' : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'}`}>
                {z}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-auto pt-6 border-t border-red-50">
          <h3 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">{activeCategory}象义速查</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            {ZHIS.map(z => (
              <div key={z} className={`flex justify-between border-b border-dashed border-gray-100 pb-1 ${yongShen.includes(z) ? 'bg-red-50' : ''}`}>
                <span className="font-bold text-red-900">{z}</span>
                <span className="text-gray-500 truncate ml-2">{activeCategoryData.branchMeanings[z]}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 flex flex-col h-screen overflow-y-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-red-50">
          <div className="flex items-center gap-8">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="text-red-800 hover:scale-125 transition-transform"><i className="fa-solid fa-circle-arrow-left fa-2xl"></i></button>
            <div className="text-center">
              <h2 className="text-4xl font-black text-red-900 tracking-tighter">{currentDate.getFullYear()}<span className="text-red-200 mx-2 text-2xl">/</span>{currentDate.getMonth() + 1}月</h2>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.3em]">值月：<span className="text-red-800">{monthZhi}月</span></p>
            </div>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="text-red-800 hover:scale-125 transition-transform"><i className="fa-solid fa-circle-arrow-right fa-2xl"></i></button>
          </div>
          <div className="mt-6 md:mt-0 flex gap-2">
            <button onClick={() => setActiveTab('calendar')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'calendar' ? 'bg-red-900 text-white' : 'bg-gray-100 text-gray-400'}`}>择日万年历</button>
            <button onClick={() => setActiveTab('relationships')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'relationships' ? 'bg-red-900 text-white' : 'bg-gray-100 text-gray-400'}`}>刑冲合会生旺库</button>
            <button onClick={() => setActiveTab('intentions')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${activeTab === 'intentions' ? 'bg-red-900 text-white' : 'bg-gray-100 text-gray-400'}`}>意向解析</button>
          </div>
        </header>

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-7 gap-4 mb-8 flex-1">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center font-bold text-gray-300 text-[11px] mb-2 uppercase tracking-[0.5em]">{d}</div>
            ))}
            {daysInMonth.map((day, idx) => {
              const hl = day ? getDayHighlights(day.ganZhi.zhi) : { type: null, tags: [] };
              return (
                <div key={idx} onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[160px] lg:min-h-[180px] border rounded-[2rem] p-4 transition-all duration-300 cursor-pointer relative flex flex-col overflow-hidden
                    ${day?.isToday ? 'ring-2 ring-red-500/50 bg-red-50/20' : 'bg-white'}
                    ${hl.type === '冲' ? 'border-orange-400 bg-orange-50/10' : hl.type === '合' ? 'border-green-400 bg-green-50/10' : hl.type === '刑' ? 'border-red-400 bg-red-50/10' : 'border-gray-50 shadow-sm'}
                    ${!day ? 'bg-transparent border-none pointer-events-none' : 'hover:shadow-xl hover:scale-[1.03] hover:z-10'}`}>
                  
                  {/* Background Large Indicator Character */}
                  {hl.type && (
                    <div className="absolute -bottom-4 -left-4 text-[100px] font-black opacity-[0.05] text-gray-900 select-none pointer-events-none leading-none">
                      {hl.type}
                    </div>
                  )}

                  {day && (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-300">{day.solarDay}</span>
                        {day.xunKong.length > 0 && (
                          <div className="text-right">
                            <span className="text-[9px] text-red-900/40 font-black block leading-tight">旬空</span>
                            <span className="text-[11px] text-red-900 font-black">{day.xunKong.join('')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center flex-1 justify-center">
                        <div className="text-3xl font-black text-red-900 tracking-tighter leading-none mb-2">{day.ganZhi.name}</div>
                        <div className="text-xs font-bold text-gray-700">{day.lunarDay}</div>
                        {day.solarTerm && <div className="text-[10px] bg-green-800 text-white px-2 py-0.5 rounded-full mt-2 font-black shadow-sm">{day.solarTerm}</div>}
                        <div className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-widest">{day.xun}</div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1 justify-center relative z-10">
                        {hl.tags.map(t => <span key={t} className="text-[9px] bg-white border border-red-50 px-1.5 py-0.5 rounded text-gray-600 font-black shadow-sm">{t}</span>)}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Existing Relationship & Intention tabs remain visible/same logic but updated structure if needed */}
        {activeTab === 'relationships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-red-50">
            {/* Same as before... */}
            <div>
              <h4 className="font-black text-red-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-link"></i> 核心刑冲合会</h4>
              <div className="space-y-4">
                {ZHIS.map(z => (
                  <div key={z} className="flex items-center gap-4 p-3 bg-red-50/30 rounded-xl border border-red-100">
                    <span className="w-8 h-8 bg-red-800 text-white flex items-center justify-center rounded-lg font-bold">{z}</span>
                    <div className="flex-1 grid grid-cols-3 text-[11px] font-bold">
                      <div className="text-red-700">冲: {RELATION_CLASHES[z]}</div>
                      <div className="text-green-700">合: {SIX_HARMONIES[z]?.target}</div>
                      <div className="text-orange-700">刑: {RELATION_PUNISHMENTS[z]?.join(' ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black text-red-900 mb-6 flex items-center gap-2"><i className="fa-solid fa-dna"></i> 十二生旺库速查</h4>
              <div className="grid grid-cols-1 gap-3">
                {ELEMENTS.map(el => (
                  <div key={el} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">{el}行 周期表</div>
                    <div className="flex flex-wrap gap-2">
                      {LIFE_STAGES.map((s, i) => {
                        const z = ZHIS[(ZHIS.indexOf(ELEMENT_BIRTH_ZHI[el]) + i) % 12];
                        return <div key={s} className="flex flex-col items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          <span className="text-[10px] font-black text-red-800">{z}</span>
                          <span className="text-[9px] text-gray-400">{s}</span>
                        </div>
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'intentions' && (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-red-50 space-y-12">
            {/* Same as before... */}
            <section>
              <h4 className="text-xl font-black text-red-900 mb-8 border-b border-red-100 pb-2">八卦万物类象</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(INTENTIONS_DATA.gua).map(([k, v]) => (
                  <div key={k} className="p-5 bg-red-50/20 rounded-2xl border border-red-50">
                    <span className="text-2xl font-black text-red-900 block mb-2">{k}</span>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{v}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-xl font-black text-red-900 mb-8 border-b border-red-100 pb-2">六神 (六兽) 意向</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(INTENTIONS_DATA.sixGods).map(([k, v]) => (
                  <div key={k} className="p-4 bg-gray-50 rounded-xl text-center">
                    <span className="text-lg font-black text-red-800 block mb-1">{k}</span>
                    <p className="text-[10px] text-gray-500 font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Modal: Day Details Overlaid only on main area */}
        {selectedDay && (
          <div className="absolute inset-0 bg-[#fdfaf6]/95 backdrop-blur-sm z-[50] flex flex-col p-8 transition-all animate-in fade-in slide-in-from-right-10 duration-500 overflow-y-auto">
            <button onClick={() => setSelectedDay(null)} className="absolute top-8 right-12 text-red-900 hover:rotate-90 hover:scale-110 transition-all z-20">
              <i className="fa-solid fa-circle-xmark fa-4xl"></i>
            </button>
            
            <header className="text-center mb-16 pt-8">
              <p className="text-red-900/40 font-black mb-2 text-xs uppercase tracking-[0.5em]">{selectedDay.date.toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'})}</p>
              <h2 className="text-9xl font-black text-red-900 my-4 tracking-[0.1em]">{selectedDay.ganZhi.name}</h2>
              <div className="flex justify-center gap-6 mt-8">
                <div className="bg-red-900 text-white px-8 py-3 rounded-full font-black text-sm shadow-xl">{selectedDay.xun}</div>
                <div className="bg-orange-100 text-orange-800 px-8 py-3 rounded-full font-black text-sm shadow-inner">农历：{selectedDay.lunarMonth}{selectedDay.lunarDay}</div>
                {selectedDay.solarTerm && <div className="bg-green-100 text-green-900 px-8 py-3 rounded-full font-black text-sm">{selectedDay.solarTerm}</div>}
              </div>
            </header>

            <div className="max-w-5xl mx-auto w-full space-y-12 pb-20">
              {/* Category Intention */}
              <section className="bg-white p-10 rounded-[3rem] border border-red-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><i className={`fa-solid ${activeCategoryData.icon} text-[120px]`}></i></div>
                <h4 className="text-sm font-black text-red-900 mb-8 flex items-center gap-2 uppercase tracking-widest border-b border-red-50 pb-4">
                  <i className="fa-solid fa-map-pin"></i> 当前目标板块：{activeCategory}
                </h4>
                <div className="relative z-10">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">地支象义解析</span>
                  <p className="text-4xl font-black text-red-900 leading-tight">{activeCategoryData.branchMeanings[selectedDay.ganZhi.zhi]}</p>
                </div>
              </section>

              {/* YongShen Specific ShengWang Section */}
              {yongShen.length > 0 && (
                <section className="space-y-6">
                  <h4 className="text-center text-sm font-black text-red-900 uppercase tracking-[0.5em]">选中用神生旺深度分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {yongShen.map(ys => {
                      const el = ZHI_TO_ELEMENT[ys];
                      const mWX = getWangXiang(monthZhi, el);
                      const mStage = getStageOfBranchForElement(monthZhi, el);
                      const dWX = getWangXiang(selectedDay.ganZhi.zhi, el);
                      const dStage = getStageOfBranchForElement(selectedDay.ganZhi.zhi, el);

                      return (
                        <div key={ys} className="bg-white p-8 rounded-[2.5rem] border-2 border-red-800 shadow-lg flex flex-col gap-6">
                          <div className="flex items-center justify-between border-b border-red-50 pb-4">
                            <span className="text-4xl font-black text-red-900">用神：{ys}</span>
                            <span className="text-xs bg-red-900 text-white px-3 py-1 rounded-full font-bold">{el}行</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100">
                              <span className="text-[10px] font-black text-red-400 block mb-2 uppercase tracking-widest">居月令({monthZhi})</span>
                              <div className="flex flex-col">
                                <span className="text-2xl font-black text-red-900">{mWX}</span>
                                <span className="text-sm font-bold text-red-700">{mStage}</span>
                              </div>
                            </div>
                            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100">
                              <span className="text-[10px] font-black text-red-400 block mb-2 uppercase tracking-widest">居日令({selectedDay.ganZhi.zhi})</span>
                              <div className="flex flex-col">
                                <span className="text-2xl font-black text-red-900">{dWX}</span>
                                <span className="text-sm font-bold text-red-700">{dStage}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* General Elements ShengWang - Redesigned Structure */}
              <section className="space-y-6">
                <h4 className="text-center text-sm font-black text-red-900 uppercase tracking-[0.5em]">五行生气状态 (月：{monthZhi} | 日：{selectedDay.ganZhi.zhi})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {ELEMENTS.map(el => {
                    const mWX = getWangXiang(monthZhi, el);
                    const mStage = getStageOfBranchForElement(monthZhi, el);
                    const dWX = getWangXiang(selectedDay.ganZhi.zhi, el);
                    const dStage = getStageOfBranchForElement(selectedDay.ganZhi.zhi, el);

                    return (
                      <div key={el} className="bg-white p-6 rounded-[2rem] border border-red-50 shadow-sm flex flex-col gap-4">
                        <div className="text-center pb-2 border-b border-gray-50">
                          <span className="text-lg font-black text-red-900">{el}行</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase">月令:</span>
                            <span className="text-sm font-black text-red-800">{mWX} | {mStage}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase">日令:</span>
                            <span className="text-sm font-black text-red-800">{dWX} | {dStage}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Relationship Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-red-50 shadow-sm">
                  <h4 className="text-sm font-black text-red-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <i className="fa-solid fa-diagram-project"></i> 地支关系
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <span className="text-[10px] font-black text-red-400 block mb-1">六冲</span>
                      <span className="text-3xl font-black text-red-900">{RELATION_CLASHES[selectedDay.ganZhi.zhi] || '无'}</span>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                      <span className="text-[10px] font-black text-green-400 block mb-1">六合</span>
                      <span className="text-3xl font-black text-green-900">{SIX_HARMONIES[selectedDay.ganZhi.zhi]?.target || '无'}</span>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                      <span className="text-[10px] font-black text-orange-400 block mb-1">三刑</span>
                      <span className="text-2xl font-black text-orange-900">{selectedDay.punishments.join(' ') || '无'}</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <span className="text-[10px] font-black text-blue-400 block mb-1">旬空</span>
                      <span className="text-2xl font-black text-blue-900">{selectedDay.xunKong.join('') || '无'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-red-50 shadow-sm flex flex-col justify-center items-center text-center">
                   <h4 className="text-sm font-black text-red-900 mb-6 uppercase tracking-widest border-b border-red-50 pb-4 w-full">值日总结</h4>
                   <p className="text-xl font-bold text-gray-700 leading-relaxed max-w-xs">
                     今日 {selectedDay.ganZhi.name} 日，月令 {monthZhi}。
                     {yongShen.length > 0 ? `重点观察用神 ${yongShen.join('、')} 之动态。` : '点击左侧选择板块及标记用神以获得深度解析。'}
                   </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
      
      <footer className="fixed bottom-0 right-0 p-6 pointer-events-none opacity-20 hidden lg:block">
        <p className="text-[80px] font-black text-red-900 leading-none select-none">玄空数术</p>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
