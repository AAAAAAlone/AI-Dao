// 历史排盘列表页面入口
import '../styles/tailwind.css';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HistoryPage } from './HistoryPage';
import { HistoryPageMobile } from './HistoryPageMobile';

function HistoryApp() {
  // 检测是否为移动端
  const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 如果是移动端但访问的是PC页面，跳转到移动端"我的"页面
  useEffect(() => {
    if (isMobile && !window.location.pathname.includes('m-')) {
      window.location.href = '/liuyao-qigua.html?tab=my';
    } else if (!isMobile && window.location.pathname.includes('m-')) {
      window.location.href = '/liuyao-history.html';
    }
  }, [isMobile]);
  
  return isMobile ? <HistoryPageMobile /> : (
    <div className="min-h-screen py-10 flex flex-col items-center overflow-x-hidden">
      <HistoryPage />
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<HistoryApp />);
}

