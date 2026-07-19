import React from 'react';
import { INTENTIONS_DATA } from './metaphysics_config';
import { CategoryKey } from './types';

interface Props {
  activeCategory: CategoryKey;
}

/**
 * 意向解析组件 - 全面还原版本
 * 包含：八卦象义、六神象义、六亲象义、六爻爻位
 * 支持根据当前预测板块展示“深度分类象义”
 */
const IntentionsView: React.FC<Props> = ({ activeCategory }) => {
  return (
    <div id="intentions-view-container" className="bg-white p-6 xl:p-12 rounded-3xl xl:rounded-[4rem] shadow-sm border border-red-50 space-y-16 xl:space-y-28">
      
      {/* 模块 1: 八卦万类物象 */}
      <section id="intentions-view-gua-section" aria-label="八卦解析">
        <h4 className="text-2xl xl:text-4xl font-black text-red-900 mb-8 border-b-4 border-red-100 pb-3 inline-block">
          <i className="fa-solid fa-yin-yang mr-4"></i>八卦万类物象
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-8">
          {Object.entries(INTENTIONS_DATA.gua).map(([name, detail]) => (
            <article key={name} id={`intentions-view-gua-${name}`} className="bg-white p-6 xl:p-8 rounded-2xl xl:rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl xl:text-4xl font-black text-red-900">{name}</span>
                <span className="text-[10px] font-black text-red-800/40 uppercase tracking-widest">{detail.direction}</span>
              </div>
              <div className="space-y-3 text-sm xl:text-base">
                <p className="text-gray-800 font-bold leading-tight"><span className="text-red-800 opacity-60">［象］</span>{detail.general}</p>
                <p className="text-gray-600"><span className="text-red-800 opacity-60">［性］</span>{detail.nature}</p>
                <div className="pt-3 border-t border-red-50">
                   <p className="text-xs font-black text-red-900 uppercase mb-1">当前板块·{activeCategory}</p>
                   <p className="text-sm font-bold text-red-800 leading-snug">
                     {detail.categorySpecial[activeCategory] || '通用解析：' + detail.people}
                   </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 模块 2: 六神动态象义 */}
      <section id="intentions-view-liushen-section" aria-label="六神解析">
        <h4 className="text-2xl xl:text-4xl font-black text-red-900 mb-8 border-b-4 border-red-100 pb-3 inline-block">
          <i className="fa-solid fa-dragon mr-4"></i>六神动态象义
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-8">
          {Object.entries(INTENTIONS_DATA.sixGods).map(([name, detail]) => (
            <article key={name} id={`intentions-view-liushen-${name}`} className="bg-[#fdfaf6] p-6 xl:p-8 rounded-2xl xl:rounded-[3rem] border border-red-50 group hover:bg-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-12 bg-red-900 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">{name[0]}</span>
                <h5 className="text-xl font-black text-red-900">{name}</h5>
              </div>
              <p className="text-base font-bold text-gray-800 mb-4 pb-4 border-b border-red-100">{detail.general}</p>
              <div className="bg-white/50 p-4 rounded-2xl border border-red-50">
                <span className="text-[10px] font-black text-red-900/40 uppercase mb-2 block tracking-widest">{activeCategory}深度解析</span>
                <p className="text-sm xl:text-base font-black text-red-800 leading-relaxed">{detail.categorySpecial[activeCategory]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 模块 3: 六亲万类象义 */}
      <section id="intentions-view-liuqin-section" aria-label="六亲象义">
        <h4 className="text-2xl xl:text-4xl font-black text-red-900 mb-8 border-b-4 border-red-100 pb-3 inline-block">
          <i className="fa-solid fa-users-rectangle mr-4"></i>六亲万类象义
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 xl:gap-6">
          {Object.entries(INTENTIONS_DATA.liuqin).map(([k, v]) => (
            <article key={k} id={`intentions-view-liuqin-${k}`} className={`p-6 xl:p-8 rounded-2xl xl:rounded-[3rem] border transition-all flex flex-col h-full ${k === '官鬼' ? 'bg-red-50 border-red-200' : 'bg-white shadow-md border-gray-100'}`}>
              <span className="text-xl xl:text-3xl font-black text-red-900 block mb-3">{k}</span>
              <p className="text-sm xl:text-lg font-bold text-gray-700 leading-tight mb-4">{v.general}</p>
              <div className="mt-auto pt-4 border-t border-red-50">
                <span className="text-[10px] font-black text-red-900/40 block mb-1 uppercase">{activeCategory}</span>
                <p className="text-xs xl:text-sm font-black text-red-800 leading-snug">{v.categorySpecial[activeCategory]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 模块 4: 六爻爻位解析 */}
      <section id="intentions-view-yaowei-section" aria-label="六爻解析">
        <h4 className="text-2xl xl:text-4xl font-black text-red-900 mb-8 border-b-4 border-red-100 pb-3 inline-block">
          <i className="fa-solid fa-stairs mr-4"></i>六爻爻位解析
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-8">
          {INTENTIONS_DATA.liuyao.map((y, idx) => (
            <article key={idx} id={`intentions-view-yaowei-${idx + 1}`} className="bg-white p-6 xl:p-8 rounded-2xl xl:rounded-[3rem] border border-gray-100 group hover:shadow-2xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-red-800 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black shadow-md">{idx + 1}</span>
                <span className="text-xl font-black text-red-900">{['初', '二', '三', '四', '五', '六'][idx]}爻</span>
              </div>
              <div className="space-y-3 text-sm xl:text-base">
                <p className="flex justify-between border-b border-red-50/50 pb-2"><strong className="text-red-800 shrink-0">人物：</strong><span className="text-gray-700 font-bold">{y.person}</span></p>
                <p className="flex justify-between border-b border-red-50/50 pb-2"><strong className="text-red-800 shrink-0">事物：</strong><span className="text-gray-700 font-bold">{y.matter}</span></p>
                <p className="flex justify-between border-b border-red-50/50 pb-2"><strong className="text-red-800 shrink-0">空间：</strong><span className="text-gray-700 font-bold">{y.space}</span></p>
                {y.categorySpecial[activeCategory] && (
                  <div className="mt-2 p-3 bg-red-50 rounded-xl text-xs font-bold text-red-900">
                    <i className="fa-solid fa-circle-info mr-2"></i>{y.categorySpecial[activeCategory]}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IntentionsView;