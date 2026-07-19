import React, { useState, useMemo, useEffect } from 'react';
import { Solar } from 'lunar-javascript';
import { EIGHT_GUA, NA_JIA_MAP, GUA_PALACES } from './constants';
import { getGuaTitle, getShiIndex, getRelative, SIX_SHEN_ORDER, GUA_64_MAP } from './logic';

const PALACE_NATURE: Record<string, string> = {
  '乾': '乾天', '兑': '兑泽', '离': '离火', '震': '震雷',
  '巽': '巽风', '坎': '坎水', '艮': '艮山', '坤': '坤地'
};

const SectionLabel = ({ children }: any) => (
  <span className="text-[11px] font-black text-ink-mid uppercase tracking-[0.3em] block mb-2 opacity-50">{children}</span>
);

const NavButton = ({ children, active, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 py-3 text-[13px] font-black uppercase tracking-[0.1em] transition-all border-b-2 ${active ? 'border-vermilion text-vermilion bg-vermilion/[0.02]' : 'border-transparent text-ink-mid opacity-40 hover:opacity-80'}`}>{children}</button>
);

const GuaSymbol = ({ pcm, active = false, className = "" }: { pcm: string, active?: boolean, className?: string }) => (
  <div className={`flex flex-col-reverse gap-1 shrink-0 ${className}`}>
    {pcm.split('').map((bit, i) => (
      <div key={i} className={`h-1 flex ${bit === '1' ? (active ? 'bg-vermilion' : 'bg-ink-deep') : 'justify-between'}`}>
        {bit === '0' && (
          <><div className={`w-[44%] h-full ${active ? 'bg-vermilion' : 'bg-ink-deep'}`}></div><div className={`w-[44%] h-full ${active ? 'bg-vermilion' : 'bg-ink-deep'}`}></div></>
        )}
      </div>
    ))}
  </div>
);

const GuaPickerModal = ({ onSelect, onClose }: any) => {
  const palaceOrder = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
  const groupedGuas = useMemo(() => {
    const groups: Record<string, [string, string][]> = {};
    palaceOrder.forEach(p => groups[p] = []);
    Object.entries(GUA_64_MAP).forEach(([pcm, name]) => {
      const palace = GUA_PALACES[pcm];
      if (groups[palace]) groups[palace].push([pcm, name]);
    });
    return groups;
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/90 backdrop-blur-md p-2">
      <div className="bg-[#FAF8F5] w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-black/5 shadow-2xl border-t-[6px] border-[#991A1A] flex flex-col">
        <div className="flex justify-between items-center px-8 py-5 border-b border-black/10 sticky top-0 bg-[#FAF8F5] z-10">
          <div><h3 className="text-2xl font-black text-black tracking-tight">六十四卦全图</h3><p className="text-[9px] font-bold tracking-[0.4em] uppercase opacity-30">Full Matrix of 64 Hexagrams</p></div>
          <button onClick={onClose} className="text-black font-black hover:text-[#991A1A] transition-all px-6 py-2 border-2 border-black hover:border-[#991A1A] tracking-widest text-sm">✕ 关闭</button>
        </div>
        <div className="p-6 space-y-4">
          {palaceOrder.map(palace => (
            <div key={palace} className="flex border border-black/10 bg-white overflow-hidden">
              <div className="w-32 flex flex-col items-center justify-center bg-[#991A1A]/[0.04] shrink-0 border-r-2 border-[#991A1A]/10 p-2">
                <span className="text-2xl font-black text-[#991A1A]">{palace}宫</span>
                <span className="text-[11px] font-bold text-black opacity-60 mt-1">{PALACE_NATURE[palace]}</span>
              </div>
              <div className="flex-1 grid grid-cols-8">
                {groupedGuas[palace].map(([pcm, name]) => (
                  <button key={pcm} onClick={() => onSelect(pcm)} className="h-14 border-r border-b border-black/5 flex items-center justify-center font-black text-lg hover:bg-[#991A1A] hover:text-white transition-all">
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 起卦时间统一用北京时间（UTC+8）——面向海外中文用户，术数惯例以北京时间排盘
const beijingNow = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 16);

// 刷新后数字框重置规则：有值的保留，尾部空框裁掉，最少 3 个
const normalizeDigits = (arr?: string[]) => {
  const filled = (arr || []).filter(d => d);
  return filled.length >= 3 ? filled : [...filled, ...Array(3 - filled.length).fill('')];
};

export const ConfigPage = ({ onCalculate }: any) => {

  // 从 localStorage 恢复配置状态。
  // divineTime 不恢复旧值：每次进入/刷新都用当前北京时间（旧行为会把几天前的时间带回来）
  const loadConfigFromStorage = () => {
    try {
      const saved = localStorage.getItem('xuankong_config');
      if (saved) {
        const config = JSON.parse(saved);
        return {
          method: config.method || 'number',
          matter: config.matter || '',
          category: config.category || '综合',
          divineTime: beijingNow(),
          digits: normalizeDigits(config.digits),
          manualStates: config.manualStates || Array(6).fill(null).map(() => ({ bit: 1, moving: false })),
          benPcm: config.benPcm || '111111',
          bianPcm: config.bianPcm || '000000',
        };
      }
    } catch (e) {
      console.error('Failed to load config from storage:', e);
    }
    return {
      method: 'number' as const,
      matter: '',
      category: '综合',
      divineTime: beijingNow(),
      digits: ['', '', ''],
      manualStates: Array(6).fill(null).map(() => ({ bit: 1, moving: false })),
      benPcm: '111111',
      bianPcm: '000000',
    };
  };

  const savedConfig = loadConfigFromStorage();
  const [method, setMethod] = useState<'number' | 'time' | 'manual' | 'name'>(savedConfig.method);
  const [matter, setMatter] = useState(savedConfig.matter);
  const [category, setCategory] = useState(savedConfig.category);
  const [divineTime, setDivineTime] = useState(savedConfig.divineTime);
  const [digits, setDigits] = useState<string[]>(savedConfig.digits);
  const [manualStates, setManualStates] = useState(savedConfig.manualStates);
  const [benPcm, setBenPcm] = useState(savedConfig.benPcm);
  const [bianPcm, setBianPcm] = useState(savedConfig.bianPcm);
  const [isPickerOpen, setIsPickerOpen] = useState<'ben' | 'bian' | null>(null);

  // 保存配置到 localStorage
  useEffect(() => {
    const config = {
      method,
      matter,
      category,
      divineTime,
      digits,
      manualStates,
      benPcm,
      bianPcm,
    };
    localStorage.setItem('xuankong_config', JSON.stringify(config));
  }, [method, matter, category, divineTime, digits, manualStates, benPcm, bianPcm]);

  const handleSubmit = () => {
    if (method === 'number') {
      const nums = digits.filter(d => d).map(Number);
      if (!nums.length) return;
      let u, l, mv: number[] = [];
      if (nums.length === 1) {
        const lunar = Solar.fromDate(new Date(divineTime)).getLunar();
        const y = lunar.getYearZhiIndex()+1, mo = lunar.getMonth(), d = lunar.getDay();
        u = (y+mo+d)%8||8; l = (y+mo+d+lunar.getTimeZhiIndex()+1)%8||8; mv = [nums[0]%6||6];
      } else if (nums.length === 2) {
        u = nums[0]%8||8; l = nums[1]%8||8; mv = [(nums[0]+nums[1])%6||6];
      } else {
        const isEven = nums.length % 2 === 0;
        const work = isEven ? nums : nums.slice(0, -1);
        const sum1 = work.slice(0, Math.ceil(work.length/2)).reduce((a, b) => a + b, 0);
        const sum2 = work.slice(Math.ceil(work.length/2)).reduce((a, b) => a + b, 0);
        u = sum1%8||8; l = sum2%8||8; mv = [isEven ? (sum1+sum2)%6||6 : nums[nums.length-1]%6||6];
      }
      onCalculate(u, l, mv, divineTime, matter, category);
    } else if (method === 'time') {
      const lunar = Solar.fromDate(new Date(divineTime)).getLunar();
      const y = lunar.getYearZhiIndex()+1, mo = lunar.getMonth(), d = lunar.getDay(), h = lunar.getTimeZhiIndex()+1;
      onCalculate((y+mo+d)%8||8, (y+mo+d+h)%8||8, [(y+mo+d+h)%6||6], divineTime, matter, category);
    } else if (method === 'name') {
      const mv: number[] = [];
      for (let i = 0; i < 6; i++) { if (benPcm[i] !== bianPcm[i]) mv.push(6 - i); }
      const up = EIGHT_GUA.find(g => g.pcm === benPcm.slice(0, 3))!.num;
      const lo = EIGHT_GUA.find(g => g.pcm === benPcm.slice(3, 6))!.num;
      onCalculate(up, lo, mv, divineTime, matter, category);
    } else {
      const ben = manualStates.map(s => s.bit.toString()).reverse().join('');
      const mv: number[] = [];
      manualStates.forEach((s, i) => { if (s.moving) mv.push(i + 1); });
      const up = EIGHT_GUA.find(g => g.pcm === ben.slice(0, 3))!.num;
      const lo = EIGHT_GUA.find(g => g.pcm === ben.slice(3, 6))!.num;
      onCalculate(up, lo, mv, divineTime, matter, category);
    }
  };

  return (
    <div id="liuyao-config-page-container" className="w-full max-w-5xl px-8 py-10 flex flex-col items-center animate-reveal relative">
      <style>{`
        /* 矮视口紧凑样式：按高度判断（宽屏但窗口矮时同样生效，避免底部按钮被推出视口） */
        @media (max-height: 900px) {
          #liuyao-config-page-container {
            padding: 16px 24px !important;
          }
          #liuyao-config-page-header {
            margin-bottom: 24px !important;
          }
          #liuyao-config-page-header h1 {
            font-size: 3.5rem !important;
            margin-bottom: 8px !important;
          }
          #liuyao-config-page-header p {
            font-size: 9px !important;
          }
          #liuyao-config-page-form-container {
            padding: 24px !important;
            gap: 24px !important;
          }
          #liuyao-config-subject-input-section input {
            font-size: 1.75rem !important;
            padding: 8px 0 !important;
          }
          #liuyao-config-time-category-section {
            gap: 24px !important;
          }
          #liuyao-config-time-input-section input {
            font-size: 0.875rem !important;
            padding: 6px 0 !important;
          }
          #liuyao-config-category-select-section > div > div {
            padding: 8px 4px !important;
            font-size: 11px !important;
          }
          #liuyao-config-method-content-area {
            min-height: 180px !important;
          }
          #liuyao-config-number-inputs {
            gap: 24px !important;
            padding: 16px 0 !important;
          }
          #liuyao-config-number-inputs > div {
            gap: 24px !important;
          }
          #liuyao-config-number-inputs input {
            width: 72px !important;
            height: 96px !important;
            font-size: 3rem !important;
          }
          #liuyao-config-number-add-btn {
            font-size: 0.875rem !important;
            padding-bottom: 4px !important;
          }
          #liuyao-config-name-section {
            gap: 24px !important;
            padding: 24px !important;
          }
          #liuyao-config-name-section button {
            padding: 16px !important;
          }
          #liuyao-config-manual-lines {
            gap: 12px !important;
            padding: 8px 0 !important;
          }
          #liuyao-config-manual-line-1,
          #liuyao-config-manual-line-2,
          #liuyao-config-manual-line-3,
          #liuyao-config-manual-line-4,
          #liuyao-config-manual-line-5,
          #liuyao-config-manual-line-6 {
            height: 48px !important;
            gap: 16px !important;
          }
          #liuyao-config-time-display {
            padding: 32px !important;
          }
          #liuyao-config-time-display span {
            font-size: 1.125rem !important;
          }
          #liuyao-config-time-display p {
            font-size: 8px !important;
          }
          #liuyao-config-submit-btn {
            padding: 24px !important;
          }
          #liuyao-config-submit-btn span:first-child {
            font-size: 1.5rem !important;
          }
          #liuyao-config-submit-btn span:last-child {
            font-size: 8px !important;
          }
          #liuyao-config-history-btn {
            padding: 12px 16px !important;
          }
          #liuyao-config-history-btn span:first-child {
            font-size: 0.875rem !important;
          }
          #liuyao-config-history-btn span:last-child {
            font-size: 8px !important;
          }
        }
      `}</style>
      {isPickerOpen && <GuaPickerModal onSelect={(pcm: string) => { if (isPickerOpen === 'ben') setBenPcm(pcm); else setBianPcm(pcm); setIsPickerOpen(null); }} onClose={() => setIsPickerOpen(null)} />}
      <header id="liuyao-config-page-header" className="text-center mb-12">
        <h1 className="text-7xl font-black text-black tracking-tighter mb-3">玄空六爻</h1>
        <p className="text-black text-[11px] font-black tracking-[0.8em] uppercase opacity-30">Analytical Divination Studio</p>
      </header>
      <div id="liuyao-config-page-form-container" className="bg-white border border-black/5 p-10 space-y-10 border-t-4 border-[#991A1A] shadow-2xl w-full">
        <div id="liuyao-config-subject-input-section" className="w-full"><SectionLabel>占问事项 / Divination Subject</SectionLabel><input id="liuyao-config-subject-input" value={matter} onChange={e => setMatter(e.target.value)} placeholder="心中默念所占之意..." className="w-full bg-transparent border-b-2 border-black/10 outline-none py-3 text-3xl font-black tracking-tight focus:border-[#991A1A] transition-all" /></div>
        <div id="liuyao-config-time-category-section" className="grid grid-cols-2 gap-8">
          <div id="liuyao-config-time-input-section" className="space-y-4"><SectionLabel>起卦时间 / Temporal Coordinate</SectionLabel><input id="liuyao-config-time-input" type="datetime-local" value={divineTime} onChange={e => setDivineTime(e.target.value)} className="w-full bg-transparent border-b-2 border-black/10 outline-none py-2 text-lg font-bold" /></div>
          <div id="liuyao-config-category-select-section" className="space-y-4"><SectionLabel>事项分类 / Classification</SectionLabel><div className="flex w-full">{['综合', '感情', '事业', '财富', '健康', '出行'].map(c => (<div key={c} id={`liuyao-config-category-${c}`} onClick={() => setCategory(c)} className={`flex-1 py-3 text-center text-[13px] font-bold border border-black/5 cursor-pointer ${category === c ? 'bg-[#991A1A] text-white' : 'bg-white'}`}>{c}</div>))}</div></div>
        </div>
        <div id="liuyao-config-method-section"><SectionLabel>起卦方式 / Method Selection</SectionLabel><div id="liuyao-config-method-tabs" className="flex w-full border-b border-black/5">{[['number', '数字起卦'], ['time', '时间起卦'], ['name', '卦名起卦'], ['manual', '手动定爻']].map(([v, l]) => (<NavButton key={v} id={`liuyao-config-method-${v}`} active={method === v} onClick={() => setMethod(v as any)}>{l}</NavButton>))}</div></div>
        <div id="liuyao-config-method-content-area" className="min-h-[250px] flex items-center justify-center bg-[#FAF8F5]/50 rounded-lg">
          {method === 'number' && (
            <div id="liuyao-config-number-inputs" className="flex flex-col items-center gap-10 w-full py-6">
              <div className="flex gap-10 flex-wrap justify-center max-w-full px-4">
                {digits.map((d, i) => (<input key={i} id={`liuyao-config-number-input-${i}`} value={d} onChange={e => { const nd = [...digits]; nd[i] = e.target.value.replace(/\D/g, ''); setDigits(nd); }} onKeyDown={e => {
                  // 空框按退格：删除该框（最少保留 1 个），与移动端行为一致
                  if (e.key === 'Backspace' && !digits[i] && digits.length > 1) { e.preventDefault(); setDigits(digits.filter((_, x) => x !== i)); }
                }} className="w-24 h-32 text-center text-6xl font-black bg-transparent border-b-4 border-black/20 focus:border-[#991A1A] outline-none" />))}
              </div>
              <button id="liuyao-config-number-add-btn" onClick={() => setDigits([...digits, ''])} className="text-lg font-black tracking-widest text-black/40 border-b-2 border-[#991A1A]/30 pb-2 hover:text-[#991A1A] transition-all">增维报数 / Add Dimension</button>
            </div>
          )}
          {method === 'name' && (
            <div id="liuyao-config-name-section" className="w-full grid grid-cols-2 gap-8 p-10">
              <div className="space-y-2"><SectionLabel>本卦 / Primary</SectionLabel><button id="liuyao-config-name-ben-btn" onClick={() => setIsPickerOpen('ben')} className="w-full p-6 text-left font-black border-2 border-black bg-white hover:border-[#991A1A] flex justify-between items-center group"><span>{getGuaTitle(benPcm)}</span><GuaSymbol pcm={benPcm} active={true} className="w-8" /></button></div>
              <div className="space-y-2"><SectionLabel>变卦 / Changed</SectionLabel><button id="liuyao-config-name-bian-btn" onClick={() => setIsPickerOpen('bian')} className="w-full p-6 text-left font-black border-2 border-black bg-white hover:border-[#991A1A] flex justify-between items-center group"><span>{getGuaTitle(bianPcm)}</span><GuaSymbol pcm={bianPcm} active={true} className="w-8" /></button></div>
            </div>
          )}
          {method === 'manual' && (
            <div id="liuyao-config-manual-lines" className="w-full max-w-[420px] flex flex-col-reverse gap-4 py-2">
              {manualStates.map((s, i) => (
                <div key={i} id={`liuyao-config-manual-line-${i + 1}`} className="flex items-center gap-6 h-14 border-b border-black/5">
                  <span className="text-[14px] font-black text-black/40 w-16 text-center">{["一", "二", "三", "四", "五", "六"][i]}爻</span>
                  <div id={`liuyao-config-manual-line-bit-${i + 1}`} onClick={() => { const ns = [...manualStates]; ns[i].bit = ns[i].bit === 1 ? 0 : 1; setManualStates(ns); }} className="flex-1 cursor-pointer flex items-center justify-center h-full px-4">
                    {s.bit === 1 ? <div className={`h-2.5 w-full bg-black ${s.moving ? 'bg-[#991A1A]' : ''}`} /> : <div className="h-2.5 w-full flex justify-between"><div className={`w-[44%] bg-black ${s.moving ? 'bg-[#991A1A]' : ''}`} /><div className={`w-[44%] bg-black ${s.moving ? 'bg-[#991A1A]' : ''}`} /></div>}
                  </div>
                  <button id={`liuyao-config-manual-line-moving-${i + 1}`} onClick={() => { const ns = [...manualStates]; ns[i].moving = !ns[i].moving; setManualStates(ns); }} className={`w-14 h-10 border font-black transition-all ${s.moving ? 'bg-[#991A1A] border-[#991A1A] text-white' : 'bg-white border-black/10'}`}>动</button>
                </div>
              ))}
            </div>
          )}
          {method === 'time' && (
            <div id="liuyao-config-time-display" className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-black/10 rounded-xl space-y-4">
              <span className="text-[22px] font-black text-black tracking-widest">基于选定时空参数演算</span>
              <p className="text-[10px] font-bold text-black/30 tracking-[0.5em] uppercase">Temporal Calculation Algorithm</p>
            </div>
          )}
        </div>
        <div id="liuyao-config-action-button-section" className="space-y-4">
          <button id="liuyao-config-submit-btn" onClick={handleSubmit} className="w-full py-10 bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all group shadow-xl"><div className="flex flex-col items-center gap-1"><span className="text-3xl font-black tracking-[0.8em] pl-[0.8em]">开卦启玄</span><span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Initiate Divine Resonance</span></div></button>
          <div className="flex justify-center">
            <button id="liuyao-config-history-btn" onClick={() => window.location.href = '/liuyao-history.html'} className="inline-flex items-center justify-center gap-3 px-6 py-3 text-black hover:text-[#991A1A] transition-all group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-black tracking-[0.4em]">历史排盘</span>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-40">History Records</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


