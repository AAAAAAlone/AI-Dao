import React, { useState } from 'react';
import { ZHIS, LIFE_STAGES } from './constants';
import { ZHI_TO_ELEMENT, RELATION_CLASHES, THREE_HARMONY_SETS, RELATION_PUNISHMENTS, SIX_CLASHES_DESC, SIX_HARMONIES_DESC, RELATION_MEETINGS, RELATION_HARMS, RELATION_DESTRUCTIONS, ELEMENT_BIRTH_ZHI } from './metaphysics_config';
import { Zhi, Element } from './types';

interface Props {
  yongShen: Zhi[];
}

/**
 * 刑冲合会视图
 * 重点恢复 PC 端地支卡片的倾斜样式
 */
const RelationshipsView: React.FC<Props> = ({ yongShen }) => {
  const [expandedZhi, setExpandedZhi] = useState<Zhi | null>(null);

  const getRelationText = (z: Zhi, type: string) => {
    switch (type) {
      case 'clash': return SIX_CLASHES_DESC[z] || '无';
      case 'harmony': return SIX_HARMONIES_DESC[z] || '无';
      case 'punish': return RELATION_PUNISHMENTS[z] ? `${z}${RELATION_PUNISHMENTS[z].join('')}刑` : '无';
      case '3harmony': {
        const set = THREE_HARMONY_SETS.find(s => s.includes(z));
        return set ? `${set.join('')}合${ZHI_TO_ELEMENT[set[1] as Zhi]}` : '无';
      }
      case 'meeting': {
        const set = RELATION_MEETINGS[z];
        const all = [z, ...(set || [])].sort((a,b) => ZHIS.indexOf(a as Zhi) - ZHIS.indexOf(b as Zhi));
        const dirMap: any = { '亥子丑': '会水', '寅卯辰': '会木', '巳午未': '会火', '申酉戌': '会金' };
        return dirMap[all.join('')] ? `${all.join('')}${dirMap[all.join('')]}` : '无';
      }
      case 'harm': return `${z}${RELATION_HARMS[z]}相害`;
      case 'destruction': return `${z}${RELATION_DESTRUCTIONS[z]}相破`;
      default: return '无';
    }
  };

  return (
    <div id="relationships-view-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-10">
      {/* 左侧：十二地支关系列表 */}
      <div id="relationships-view-zhi-list" className="xl:col-span-7 bg-white p-6 xl:p-10 rounded-3xl xl:rounded-[3rem] shadow-sm border border-red-50">
        <h4 id="relationships-view-title" className="font-black text-xl xl:text-3xl text-red-900 mb-6 xl:mb-10 flex items-center gap-3">
          <i className="fa-solid fa-link text-red-800"></i>十二地支刑冲合会
        </h4>
        <div className="space-y-3 xl:space-y-8">
          {ZHIS.map((z, idx) => {
            const isYongShen = yongShen.includes(z);
            const isExpanded = expandedZhi === z;
            // 恢复 PC 端倾斜细节
            const pcTiltClass = isYongShen ? (idx % 2 === 0 ? 'pc-yong-shen-tilt-even' : 'pc-yong-shen-tilt-odd') : '';
            
            return (
              <div key={z} id={`relationships-view-zhi-${z}`} className={`flex flex-col p-4 xl:p-6 rounded-2xl xl:rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden
                ${isYongShen ? 'bg-red-800/5 border-red-200 shadow-md ' + pcTiltClass : 'bg-gray-50/40 border-gray-100'}
                ${isExpanded ? 'ring-2 ring-red-100' : ''}`}>
                
                <div className="flex items-center gap-4 xl:gap-8 cursor-pointer xl:cursor-default" onClick={() => setExpandedZhi(isExpanded ? null : z)}>
                  <span id={`relationships-view-zhi-label-${z}`} className={`w-12 h-12 xl:w-16 xl:h-16 flex items-center justify-center rounded-xl xl:rounded-2xl font-black text-2xl xl:text-3xl shadow-lg
                    ${isYongShen ? 'bg-red-900 text-white scale-110' : 'bg-white text-red-900 border border-red-50'}`}>
                    {z}
                  </span>
                  
                  {/* PC 网格内容 (1200px以上展示) */}
                  <div id={`relationships-view-zhi-relations-pc-${z}`} className="hidden xl:grid flex-1 grid-cols-4 gap-4">
                    {[
                      { label: '六冲', val: getRelationText(z, 'clash'), color: 'orange' },
                      { label: '六合', val: getRelationText(z, 'harmony'), color: 'green' },
                      { label: '三刑', val: getRelationText(z, 'punish'), color: 'red' },
                      { label: '三合', val: getRelationText(z, '3harmony'), color: 'blue' }
                    ].map(rel => (
                      <div key={rel.label} id={`relationships-view-zhi-relation-${z}-${rel.label}`} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <span className={`text-[10px] font-black uppercase text-${rel.color}-400 mb-1`}>{rel.label}</span>
                        <span className={`text-base font-black text-${rel.color}-900`}>{rel.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* 移动端简要行 (1200px以下展示) */}
                  <div id={`relationships-view-zhi-relations-mobile-${z}`} className="xl:hidden flex-1 flex gap-2 overflow-hidden items-center">
                     <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{getRelationText(z, 'clash')}</span>
                     <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full truncate">{getRelationText(z, 'harmony')}</span>
                  </div>
                  <button id={`relationships-view-zhi-expand-btn-${z}`} className={`xl:hidden transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-red-900/20`}><i className="fa-solid fa-chevron-down"></i></button>
                </div>

                {/* 移动端详情折叠区域 */}
                <div id={`relationships-view-zhi-relations-${z}`} className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[600px] mt-4 opacity-100' : 'max-h-0 opacity-0 xl:max-h-none xl:opacity-100 xl:mt-6'}`}>
                   <div className="xl:hidden grid grid-cols-2 gap-2 mb-4">
                     <div className="bg-white p-3 rounded-2xl border border-red-50">
                       <span className="text-[10px] font-black text-gray-300 uppercase block mb-1">三刑</span>
                       <span className="text-sm font-black text-gray-900">{getRelationText(z, 'punish')}</span>
                     </div>
                     <div className="bg-white p-3 rounded-2xl border border-red-50">
                       <span className="text-[10px] font-black text-gray-300 uppercase block mb-1">三合</span>
                       <span className="text-sm font-black text-gray-900">{getRelationText(z, '3harmony')}</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2 xl:gap-6 pt-2 xl:pt-5 xl:border-t xl:border-gray-100">
                    {[
                      { label: '三会 Meeting', val: getRelationText(z, 'meeting') },
                      { label: '六害 Harm', val: getRelationText(z, 'harm') },
                      { label: '六破 Break', val: getRelationText(z, 'destruction') }
                    ].map(sub => (
                      <div key={sub.label} className="flex items-center justify-between px-4 py-2.5 bg-white/50 rounded-xl xl:rounded-2xl border border-gray-100">
                        <span className="text-[9px] xl:text-[10px] font-black text-gray-400 uppercase leading-none">{sub.label}</span>
                        <span className="text-xs xl:text-sm font-bold text-gray-700">{sub.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧：生旺库卡片 */}
      <div id="relationships-view-shengwang-section" className="xl:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 xl:p-10 rounded-3xl xl:rounded-[3rem] shadow-sm border border-red-50">
          <h4 id="relationships-view-shengwang-title" className="font-black text-xl xl:text-3xl text-red-900 mb-6 flex items-center gap-3">
            <i className="fa-solid fa-dna text-red-800"></i>生旺库状态
          </h4>
          <div className="space-y-4 xl:space-y-8">
            {([Element.WOOD, Element.FIRE, Element.EARTH, Element.METAL, Element.WATER]).map(el => {
              const isElYongShen = yongShen.some(ys => ZHI_TO_ELEMENT[ys] === el);
              return (
                <div key={el} id={`relationships-view-shengwang-${el}`} className={`p-4 xl:p-8 rounded-2xl xl:rounded-[3rem] border-2 transition-all overflow-hidden
                  ${isElYongShen ? 'bg-red-800/10 border-red-800 shadow-xl scale-[1.02]' : 'bg-gray-50/20 border-gray-50'}`}>
                  <div className="text-lg xl:text-2xl font-black text-red-900 mb-4 flex justify-between items-center">
                    {el}行周期
                    <span className="text-[10px] font-bold text-gray-400">长生于{ELEMENT_BIRTH_ZHI[el]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {LIFE_STAGES.map((s, i) => {
                      const z = ZHIS[(ZHIS.indexOf(ELEMENT_BIRTH_ZHI[el]) + i) % 12];
                      const isZhiYongShen = yongShen.includes(z);
                      return (
                        <div key={s} id={`relationships-view-shengwang-${el}-${z}`} className={`flex flex-col items-center p-2 rounded-xl border transition-all
                          ${isZhiYongShen ? 'bg-red-900 text-white shadow-xl scale-110 z-10' : 'bg-white text-gray-300 border-gray-50'}`}>
                          <span className="text-lg xl:text-2xl font-black leading-none">{z}</span>
                          <span className="text-[8px] xl:text-[10px] font-bold uppercase mt-1">{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipsView;