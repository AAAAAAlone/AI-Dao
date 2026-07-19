import React, { useEffect } from 'react';
import '../styles/tailwind.css';
import { createRoot } from 'react-dom/client';
import { ConfigPage } from './ConfigPage';
import { Solar } from 'lunar-javascript';
import { EIGHT_GUA, NA_JIA_MAP, GUA_PALACES } from './constants';
import { getGuaTitle, getShiIndex, getRelative, SIX_SHEN_ORDER } from './logic';
import { GlobalNavigation } from '../shared/GlobalNavigation';

function QiguaApp() {
  // 标记React已加载
  useEffect(() => {
    (window as any).__REACT_LOADED__ = true;
    
    // 添加js-loaded类，用于CSS控制静态内容显示
    document.body.classList.add('js-loaded');
    
    // 立即隐藏静态内容，避免闪现
    const staticContent = document.querySelector('.static-content');
    if (staticContent) {
      (staticContent as HTMLElement).style.display = 'none';
      (staticContent as HTMLElement).style.opacity = '0';
      (staticContent as HTMLElement).style.visibility = 'hidden';
      (staticContent as HTMLElement).style.pointerEvents = 'none';
    }
    
    // 禁用body和html的滚动条
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.classList.remove('js-loaded');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  const handleCalculate = async (up: number, lo: number, mvLines: number[], dateStr: string, matter: string, category: string) => {
    const solar = Solar.fromDate(new Date(dateStr));
    const lunar = solar.getLunar();
    const dateGZ = { 
      year: lunar.getYearInGanZhi(), 
      month: lunar.getMonthInGanZhi(), 
      day: lunar.getDayInGanZhi(), 
      hour: lunar.getTimeInGanZhi(), 
      dayVoid: lunar.getDayXunKong(), 
      xun: lunar.getDayXun() 
    };
    
    const upG = EIGHT_GUA[up - 1], loG = EIGHT_GUA[lo - 1];
    const benPcm = upG.pcm + loG.pcm;
    const palaceName = GUA_PALACES[benPcm];
    const palaceElement = EIGHT_GUA.find(g => g.name === palaceName)!.element;
    const shiPos = getShiIndex(benPcm);
    const yingPos = (shiPos + 3) % 6;
    
    const bianArr = benPcm.split('');
    mvLines.forEach(m => { if(m >= 1 && m <= 6) bianArr[6 - m] = (bianArr[6 - m] === '1' ? '0' : '1'); });
    const bianPcm = bianArr.join('');
    const bianPalaceName = GUA_PALACES[bianPcm];
    const bianPalaceElement = EIGHT_GUA.find(g => g.name === bianPalaceName)?.element || '?';
    
    // 提取日干：使用 lunar.getDayGan() 直接获取
    const dayGan = lunar.getDayGan();
    const liuShenList = SIX_SHEN_ORDER[dayGan] || SIX_SHEN_ORDER['甲'];
    const benRelatives = new Set();
    const lines = benPcm.split('').reverse().map((bitStr, i) => {
      const bit = parseInt(bitStr), isUp = i >= 3;
      const actualUpG = EIGHT_GUA.find(g => g.pcm === benPcm.slice(0, 3))!;
      const actualLoG = EIGHT_GUA.find(g => g.pcm === benPcm.slice(3, 6))!;
      const nj = NA_JIA_MAP[isUp ? actualUpG.name : actualLoG.name][i % 3 + (isUp ? 3 : 0)];
      const rel = getRelative(palaceElement, nj.slice(1));
      benRelatives.add(rel);
      const bUpG = EIGHT_GUA.find(g => g.pcm === bianPcm.slice(0, 3))!;
      const bLoG = EIGHT_GUA.find(g => g.pcm === bianPcm.slice(3, 6))!;
      const bnj = NA_JIA_MAP[isUp ? bUpG.name : bLoG.name][i % 3 + (isUp ? 3 : 0)];
      return { 
        bit, branch: nj[0], element: nj.slice(1), relative: rel, liuShen: liuShenList[i], 
        isShi: i === shiPos, isYing: i === yingPos, isMoving: mvLines.includes(i + 1),
        bianBit: parseInt(bianPcm[5 - i]), bianBranch: bnj[0], bianElement: bnj.slice(1), 
        bianRelative: getRelative(palaceElement, bnj.slice(1)) 
      };
    });
    
    const missingRels = ['兄', '孙', '财', '官', '父'].filter(r => !benRelatives.has(r));
    const linesWithFu = lines.map((line, i) => {
      const palaceLines = NA_JIA_MAP[palaceName];
      const pnj = palaceLines[i];
      const prel = getRelative(palaceElement, pnj.slice(1));
      return { ...line, fuShenList: missingRels.includes(prel) ? [{ branch: pnj[0], element: pnj.slice(1), relative: prel }] : [] };
    });
    
    const result = { 
      matter, category, solarDate: solar.toFullString().slice(0, 16), 
      lunarStr: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`, 
      dateGZ, palace: palaceName, palaceElement, 
      benTitle: getGuaTitle(benPcm), 
      bianTitle: getGuaTitle(bianPcm),
      bianPalace: bianPalaceName,
      bianElement: bianPalaceElement,
      lines: linesWithFu 
    };
    
    // 保存结果到 localStorage
    localStorage.setItem('xuankong_result', JSON.stringify(result));
    
    // 历史记录只保存在当前浏览器。
    let recordId: string;
    try {
      const { saveHistoryRecord } = await import('../scripts/historyManager');
      recordId = saveHistoryRecord(result);
    } catch (error) {
      recordId = Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
    }
    
    // 保存recordId到localStorage，供ResultPage使用
    localStorage.setItem('xuankong_current_record_id', recordId);
    
    // 跳转到排盘页面
    window.location.href = '/liuyao-paipan.html';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 全局导航 - PC端顶部，移动端汉堡菜单 */}
      <GlobalNavigation currentPage="liuyao-qigua" />
      
      <div className="flex-1 py-10 flex flex-col items-center overflow-x-hidden xl:pt-4">
      <ConfigPage onCalculate={handleCalculate} />
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<QiguaApp />);
}
