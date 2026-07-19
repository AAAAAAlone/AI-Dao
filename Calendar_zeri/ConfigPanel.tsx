import type { FC } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Zhi, CategoryKey } from './types';
import { ZHIS } from './constants';
import { CATEGORY_CONFIG } from './metaphysics_config';

// 板块URL映射
const categorySlugs: Record<CategoryKey, string> = {
  '健康': 'health',
  '事业': 'career',
  '财运': 'wealth',
  '感情': 'love',
  '出行': 'travel',
  '风水': 'fengshui'
};

interface Props {
  activeCategory: CategoryKey;
  setActiveCategory: (cat: CategoryKey) => void;
  yongShen: Zhi[];
  setYongShen: Dispatch<SetStateAction<Zhi[]>>;
}

/**
 * 配置面板：维护预测板块和用神选择
 * 象义速查也在此处统一定义
 */
const ConfigPanel: FC<Props> = ({ activeCategory, setActiveCategory, yongShen, setYongShen }) => {
  const activeCategoryData = CATEGORY_CONFIG.find(c => c.title === activeCategory)!;

  return (
    <div id="calendar-config-panel" className="h-full flex flex-col gap-8 bg-white p-6 no-scrollbar overflow-y-auto">
      {/* 头部 LOGO */}
      <div id="calendar-config-header">
        <div className="flex items-center gap-3 mb-2">
          <div id="calendar-config-logo" className="w-10 h-10 bg-red-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">玄</div>
          <div>
            <h1 id="calendar-config-title" className="text-lg font-bold text-red-900 leading-tight">玄空择日万年历</h1>
            <p id="calendar-config-subtitle" className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Xuan Kong Calendar</p>
          </div>
        </div>
        <hr className="border-red-50 my-4" />
      </div>

      {/* 1. 板块选择 */}
      <section id="calendar-config-category-section">
        <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-layer-group"></i> 1. 预测板块
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORY_CONFIG.map(cat => {
            const categoryUrl = `/calendar/${categorySlugs[cat.title]}.html`;
            return (
              <a
              key={cat.title} 
              id={`calendar-config-category-${categorySlugs[cat.title]}`}
                href={categoryUrl}
                onClick={(e) => {
                  if ((window as any).__REACT_LOADED__) {
                    e.preventDefault();
                    setActiveCategory(cat.title);
                    window.history.pushState({ category: cat.title }, '', categoryUrl);
                  }
                }}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 text-xs border no-underline
                  ${activeCategory === cat.title ? 'bg-red-800 text-white border-red-800 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-red-50/50'}`}
              >
              <i className={`fa-solid ${cat.icon} text-lg`}></i>
              <span>{cat.title}</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* 2. 用神勾选 */}
      <section id="calendar-config-yongshen-section">
        <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bullseye"></i> 2. 标记用神地支
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ZHIS.map(z => (
            <button 
              key={z} 
              id={`calendar-config-yongshen-${z}`}
              onClick={() => setYongShen(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])}
              className={`h-11 xl:h-10 rounded-lg font-bold transition-all border
                ${yongShen.includes(z) ? 'bg-red-800 text-white border-red-800 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'}`}>
              {z}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 象义速查 - 与选择板块联动 */}
      <section id="calendar-config-meaning-section" className="mt-auto pt-6 border-t border-red-100 pb-10 xl:pb-0">
        <h3 id="calendar-config-meaning-title" className="text-base font-black text-red-900 mb-4 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-book-open text-red-800"></i>
          {activeCategory}象义
        </h3>
        <div className="flex flex-col gap-1.5 text-sm">
          {ZHIS.map((z, idx) => (
            <div key={z} id={`calendar-config-meaning-item-${idx}`} className={`flex items-center justify-between p-2 rounded-lg border-b border-gray-50
              ${yongShen.includes(z) ? 'bg-red-50 border-red-100' : 'hover:bg-gray-50'}`}>
              <span className="font-bold text-red-900 w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-red-50 shrink-0">{z}</span>
              <span className="text-gray-600 flex-1 ml-3 truncate font-medium text-right">{activeCategoryData.branchMeanings[z]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConfigPanel;