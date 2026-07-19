import React, { useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { EIGHT_GUA } from './constants';
import { isFavorite, toggleFavorite } from '../scripts/favoriteManager';

const YONG_SHEN_ADVICE: Record<string, { yong: string, note: string }> = {
  '感情': { yong: '官鬼/妻财', note: '男占看财，女占看官。官财相生则吉，若逢旬空则心意难托。' },
  '事业': { yong: '官鬼/父母', note: '官鬼为职权名望，父母为文书合同。官动生世则进职，父旺则有名。' },
  '财富': { yong: '妻财/子孙', note: '妻财为本，子孙为源。子孙旺相则财路宽阔，忌兄弟劫财。' },
  '综合': { yong: '世爻/应爻', note: '世为己，应为人。世旺自胜，应生世则得助。' },
  '健康': { yong: '子孙/官鬼', note: '子孙为良药，官鬼为病灶。子孙克官鬼则愈，忌官鬼持世。' },
  '出行': { yong: '世爻/子孙', note: '子孙发动路途平安。若官鬼发动则恐有阻碍惊扰。' }
};

const SectionLabel = ({ children }: any) => (
  <span className="text-[11px] font-black text-ink-mid uppercase tracking-[0.3em] block mb-2 opacity-50">{children}</span>
);

export const ResultPage = ({ data, onBack }: any) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isFav, setIsFav] = React.useState(false);
  const [recordId, setRecordId] = React.useState<string | null>(null);
  const advice = YONG_SHEN_ADVICE[data.category] || YONG_SHEN_ADVICE['综合'];

  // 获取当前记录的ID
  useEffect(() => {
    const savedId = localStorage.getItem('xuankong_current_record_id');
    if (savedId) {
      setRecordId(savedId);
      setIsFav(isFavorite(savedId));
    } else {
      // Fallback: 从历史记录中查找匹配的记录
      try {
        const { getHistoryRecords } = require('../scripts/historyManager');
        const records = getHistoryRecords();
        const matched = records.find((r: any) => 
          r.result.matter === data.matter &&
          r.result.solarDate === data.solarDate &&
          r.result.benTitle === data.benTitle
        );
        if (matched) {
          setRecordId(matched.id);
          setIsFav(isFavorite(matched.id));
        }
      } catch (e) {
        console.error('Failed to load record ID:', e);
      }
    }
  }, [data]);
  
  const saveImage = async () => {
    if (!chartRef.current) return;
    const url = await htmlToImage.toPng(chartRef.current, { backgroundColor: '#FAF8F5', pixelRatio: 2.5 });
    const link = document.createElement('a'); link.download = `玄空-${data.benTitle}.png`; link.href = url; link.click();
  };

  return (
    <div id="liuyao-result-container" className="w-full max-w-[1600px] px-10 py-6 animate-reveal flex flex-col items-center">
      <style>{`
        /* 小屏幕响应式样式（13寸笔记本等） */
        @media (max-width: 1440px) and (max-height: 900px) {
          #liuyao-result-container {
            padding: 16px 24px !important;
          }
          #liuyao-result-header {
            margin-bottom: 16px !important;
            padding: 0 8px !important;
          }
          #liuyao-result-back-btn,
          #liuyao-result-history-btn {
            font-size: 12px !important;
          }
          /* #liuyao-result-share-btn, */
          #liuyao-result-save-btn {
            padding: 8px 16px !important;
          }
          /* #liuyao-result-share-btn span, */
          #liuyao-result-save-btn span {
            font-size: 9px !important;
          }
          #liuyao-result-user-btn {
            padding: 6px 12px !important;
          }
          #liuyao-result-user-avatar {
            width: 24px !important;
            height: 24px !important;
            font-size: 10px !important;
          }
          #liuyao-result-user-name {
            font-size: 11px !important;
          }
          #liuyao-result-sidebar {
            width: 280px !important;
            padding: 24px !important;
          }
          #liuyao-result-sidebar h2 {
            font-size: 28px !important;
            margin-bottom: 8px !important;
          }
          #liuyao-result-sidebar dt {
            font-size: 10px !important;
            margin-bottom: 6px !important;
          }
          #liuyao-result-sidebar dd {
            font-size: 16px !important;
            margin-bottom: 16px !important;
          }
          #liuyao-result-sidebar dl[style*="grid"] {
            gap: 24px !important;
          }
          #liuyao-result-sidebar dl[style*="grid"] dd {
            font-size: 20px !important;
          }
          #liuyao-result-sidebar-advice {
            padding: 16px !important;
            margin-bottom: 24px !important;
          }
          #liuyao-result-sidebar-advice h3 {
            font-size: 9px !important;
            margin-bottom: 6px !important;
          }
          #liuyao-result-sidebar-advice p:first-of-type {
            font-size: 16px !important;
          }
          #liuyao-result-sidebar-advice p:last-of-type {
            font-size: 11px !important;
          }
          #liuyao-result-sidebar footer {
            margin-top: 24px !important;
            padding-top: 24px !important;
          }
          #liuyao-result-sidebar footer dd {
            font-size: 48px !important;
          }
          #liuyao-result-main-panel {
            padding: 32px !important;
          }
          #liuyao-result-chart-header {
            padding-bottom: 24px !important;
            margin-bottom: 12px !important;
          }
          #liuyao-result-title {
            font-size: 56px !important;
          }
          #liuyao-result-palace {
            font-size: 20px !important;
          }
          #liuyao-result-bian-title {
            font-size: 56px !important;
          }
          #liuyao-result-bian-palace {
            font-size: 20px !important;
          }
          #liuyao-result-chart-main table {
            margin-top: 24px !important;
          }
          #liuyao-result-chart-main th {
            padding: 6px !important;
            font-size: 10px !important;
          }
          #liuyao-result-chart-main td {
            padding: 6px !important;
            min-height: 60px !important;
          }
          #liuyao-result-chart-main td span[style*="font-size: 18px"] {
            font-size: 14px !important;
          }
          #liuyao-result-chart-main td span[style*="font-size: 36px"] {
            font-size: 28px !important;
          }
        }
      `}</style>
      <div id="liuyao-result-header" className="w-full flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-4">
          <button id="liuyao-result-back-btn" onClick={() => {
            // 清除结果数据，确保切换移动端时在起卦页面
            localStorage.removeItem('xuankong_result');
            localStorage.removeItem('xuankong_mobile_result');
            localStorage.removeItem('xuankong_current_record_id');
            onBack();
          }} className="text-black font-black text-[16px] tracking-[0.3em] flex items-center group opacity-70 hover:opacity-100 transition-all uppercase"><svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>重新起卦</button>
          <span className="text-black/30 text-[16px]">|</span>
          <button id="liuyao-result-history-btn" onClick={() => window.location.href = '/liuyao-history.html'} className="text-black font-black text-[16px] tracking-[0.3em] flex items-center group opacity-70 hover:opacity-100 transition-all uppercase"><svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>历史排盘</button>
        </div>
        <div className="flex gap-4 items-center">
          <button id="liuyao-result-save-btn" onClick={saveImage} className="bg-[#991A1A] text-white border-2 border-[#991A1A] px-8 py-3 shadow-xl hover:bg-transparent hover:text-[#991A1A] transition-all"><span className="text-[11px] font-black tracking-[0.3em] uppercase">导出记录 / Export</span></button>
        </div>
      </div>
      <div id="liuyao-result-content" ref={chartRef} className="flex flex-row gap-8 items-stretch w-full p-2">
        {/* 左侧详情面板 */}
        <div id="liuyao-result-sidebar" className="w-[360px] bg-white border-l-[12px] border-l-[#991A1A] border-y border-r border-black/5 p-10 flex flex-col justify-between shrink-0 shadow-sm overflow-hidden relative">
          <div className="absolute -left-16 -top-2 flex items-start pointer-events-none opacity-5" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
            <span className="text-[135px] font-black tracking-[0.2em] text-[#991A1A] uppercase">XUANKONG</span>
          </div>
          
          <div className="relative z-10 space-y-8">
            <div id="liuyao-result-matter" className="pb-6 border-b border-black/5">
              <SectionLabel>{data.category} / Context</SectionLabel>
              <div className="flex items-center gap-3">
                <h1 id="liuyao-result-matter-text" className="text-4xl font-black text-black leading-[1.1] tracking-tighter">{data.matter || "无事不占"}</h1>
                {recordId && (
                  <button
                    id="liuyao-result-sidebar-favorite-btn"
                    onClick={() => {
                      const newFavState = toggleFavorite(recordId);
                      setIsFav(newFavState);
                    }}
                    className={`transition-all hover:scale-110 ${
                      isFav ? 'text-yellow-500' : 'text-black/30 hover:text-yellow-500'
                    }`}
                    title={isFav ? '取消收藏' : '收藏'}
                  >
                    <svg className="w-6 h-6" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div id="liuyao-result-date-info" className="space-y-6">
              <div id="liuyao-result-sidebar-solar-date" className="pb-4 border-b border-black/5"><SectionLabel>Solar / 公历</SectionLabel><p className="text-lg font-bold">{data.solarDate}</p></div>
              <div id="liuyao-result-sidebar-lunar-date" className="pb-4 border-b border-black/5"><SectionLabel>Lunar / 农历</SectionLabel><p className="text-lg font-bold">{data.lunarStr}</p></div>
              <div className="grid grid-cols-2 gap-8 pt-2">
                <div id="liuyao-result-sidebar-year"><SectionLabel>Year</SectionLabel><p className="text-[24px] font-black">{data.dateGZ.year}</p></div>
                <div id="liuyao-result-sidebar-month"><SectionLabel>Month</SectionLabel><p className="text-[24px] font-black">{data.dateGZ.month[0]}<span className="text-[#991A1A]">{data.dateGZ.month[1]}</span></p></div>
                <div id="liuyao-result-sidebar-day"><SectionLabel>Day</SectionLabel><p className="text-[24px] font-black">{data.dateGZ.day[0]}<span className="text-[#991A1A]">{data.dateGZ.day[1]}</span></p></div>
                <div id="liuyao-result-sidebar-hour"><SectionLabel>Hour</SectionLabel><p className="text-[24px] font-black">{data.dateGZ.hour}</p></div>
              </div>
            </div>
            <div id="liuyao-result-sidebar-advice" className="bg-[#991A1A]/[0.03] border border-[#991A1A]/10 p-5 space-y-2">
              <p className="text-lg font-black text-[#991A1A] uppercase text-[10px] tracking-widest mb-2">用神建议</p>
              <p className="text-lg font-black">首选：<span className="text-[#991A1A]">{advice.yong}</span></p>
              <p className="text-[12px] leading-relaxed opacity-60">{advice.note}</p>
            </div>
          </div>
          <div id="liuyao-result-sidebar-void" className="mt-8 pt-8 border-t-[5px] border-[#991A1A] relative z-10 flex justify-between items-end">
            <div><SectionLabel>Void / 旬空</SectionLabel><p className="text-6xl font-black text-black tracking-tighter leading-none">{data.dateGZ.dayVoid}</p></div>
            <p className="text-[15px] font-black uppercase opacity-30">{data.dateGZ.xun} 旬</p>
          </div>
        </div>

        {/* 右侧排盘面板 */}
        <div id="liuyao-result-main-panel" className="flex-1 bg-white border border-black/5 p-12 flex flex-col shadow-2xl overflow-hidden relative">
          <div className="absolute -right-2 top-10 flex items-start pointer-events-none" >
            <span className="text-[220px] font-black tracking-[0.1em] text-[#F9F9F9]">玄空</span>
          </div>
          <header id="liuyao-result-chart-header" className="flex border-b-[6px] border-black pb-8 relative z-10">
            <div id="liuyao-result-ben-section" className="flex-1 border-r-2 border-black/5 pr-14">
              <SectionLabel>Primary / 本卦</SectionLabel>
              <h2 id="liuyao-result-title" className="text-7xl font-black mt-1 tracking-tighter">{data.benTitle}</h2>
              <div className="inline-flex mt-6 items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-[#991A1A]"></span>
                <span id="liuyao-result-palace" className="text-2xl font-black tracking-widest text-black">{data.palace}宫 ({data.palaceElement})</span>
              </div>
            </div>
            <div id="liuyao-result-bian-section" className="flex-1 pl-14 flex flex-col justify-end">
              <SectionLabel>Transformed / 变卦</SectionLabel>
              <h2 id="liuyao-result-bian-title" className="text-7xl font-black mt-1 tracking-tighter">{data.bianTitle}</h2>
              <div className="inline-flex mt-6 items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-black"></span>
                <span id="liuyao-result-bian-palace" className="text-2xl font-black tracking-widest text-black">{data.bianPalace}宫 ({data.bianElement})</span>
              </div>
            </div>
          </header>

          <main id="liuyao-result-chart-main" className="flex-1 flex flex-col justify-between relative z-10 py-4">
            {[...data.lines].reverse().map((line: any, idx: number) => {
              const isMv = line.isMoving;
              const lineNum = 6 - idx;
              // 关键修正：仅主卦爻位变红，其余全部变深
              const benBarColor = isMv ? 'bg-[#991A1A]' : 'bg-black';
              const bianBarColor = isMv ? 'bg-black' : 'bg-black opacity-20';
              const symbolColor = 'text-black'; // 动爻符号保持深色

              return (
                <div key={6-idx} id={`liuyao-result-line-${lineNum}`} className="grid grid-cols-[80px_1.4fr_70px_1fr_70px_1fr_1.4fr] items-center gap-0 border-b border-black/10 last:border-b-0 hover:bg-[#FAF8F5]/40 transition-colors py-2 min-h-[80px]">
                  {/* 六神 */}
                  <div id={`liuyao-result-line-liushen-${lineNum}`} className="text-lg font-black text-black text-center tracking-[0.4em]">{line.liuShen}</div>
                  
                  {/* 本卦六亲地支 & 伏神样式 */}
                  <div id={`liuyao-result-line-ben-${lineNum}`} className="text-right pr-8">
                     <div className="flex flex-col items-end">
                        <div className="flex items-center gap-6">
                          <span id={`liuyao-result-line-relative-${lineNum}`} className="text-lg font-black text-black">{line.relative}</span>
                          <span id={`liuyao-result-line-branch-${lineNum}`} className="text-4xl font-black text-black">{line.branch}{line.element}</span>
                        </div>
                        {/* 伏神回归：下方显示 */}
                        {line.fuShenList?.map((fu: any, fi: number) => (
                          <div key={fi} id={`liuyao-result-line-fushen-${lineNum}-${fi}`} className="text-[14px] font-bold text-black mt-0.5 pr-0.5">
                            伏: {fu.relative} {fu.branch}{fu.element}
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* 世应标记：维持指定样式 */}
                  <div id={`liuyao-result-line-shiying-${lineNum}`} className="flex justify-center items-center">
                    {line.isShi && <div className="w-8 h-8 flex items-center justify-center bg-[#991A1A] text-white font-black text-sm">世</div>}
                    {line.isYing && <div className="w-8 h-8 flex items-center justify-center border-2 border-[#991A1A] text-[#991A1A] font-black text-sm">应</div>}
                  </div>

                  {/* 本卦爻位：动爻变红 */}
                  <div id={`liuyao-result-line-bit-${lineNum}`} className="px-8">
                    {line.bit === 1 ? (
                      <div className={`h-2.5 w-full ${benBarColor}`} />
                    ) : (
                      <div className="h-2.5 w-full flex justify-between">
                        <div className={`w-[44%] ${benBarColor}`} />
                        <div className={`w-[44%] ${benBarColor}`} />
                      </div>
                    )}
                  </div>

                  {/* 动爻标记：符号深色 */}
                  <div id={`liuyao-result-line-moving-${lineNum}`} className="flex justify-center">
                    <span className={`text-4xl font-black ${symbolColor}`}>
                      {isMv ? (line.bit === 1 ? '○' : '×') : ''}
                    </span>
                  </div>

                  {/* 变卦爻位：非动爻浅色 */}
                  <div id={`liuyao-result-line-bian-bit-${lineNum}`} className="px-8">
                    {line.bianBit === 1 ? (
                      <div className={`h-3 w-full ${bianBarColor}`} />
                    ) : (
                      <div className="h-3 w-full flex justify-between">
                        <div className={`w-[44%] ${bianBarColor}`} />
                        <div className={`w-[44%] ${bianBarColor}`} />
                      </div>
                    )}
                  </div>

                  {/* 变卦六亲地支：非动爻行浅色 */}
                  <div id={`liuyao-result-line-bian-${lineNum}`} className="pl-14 border-l border-black/5">
                    <div className="flex items-center gap-4">
                      <span id={`liuyao-result-line-bian-branch-${lineNum}`} className={`text-4xl font-black ${isMv ? 'text-black' : 'text-black opacity-30'}`}>
                        {line.bianBranch}{line.bianElement}
                      </span>
                      <span id={`liuyao-result-line-bian-relative-${lineNum}`} className={`text-lg font-black ${isMv ? 'text-black' : 'text-black opacity-30'}`}>{line.bianRelative}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </main>
          <footer className="mt-8 pt-6 border-t-2 border-black/5 flex justify-between items-center opacity-40">
            <span className="text-[12px] font-black tracking-[1em] uppercase italic">STUDIO PROFESSIONAL // ANALYTICAL DIVINATION</span>
          </footer>
        </div>
      </div>
    </div>
  );
};
