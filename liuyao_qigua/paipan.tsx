import React, { useState, useEffect } from 'react';
import '../styles/tailwind.css';
import { createRoot } from 'react-dom/client';
import { ResultPage } from './ResultPage';
import { GlobalNavigation } from '../shared/GlobalNavigation';

function PaipanApp() {
  const [result, setResult] = useState<any>(null);

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

  useEffect(() => {
    // 从 localStorage 加载结果
    const loadResult = () => {
      try {
        const saved = localStorage.getItem('xuankong_result');
        if (saved) {
          setResult(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load result:', e);
      }
    };
    loadResult();
  }, []);

  const handleBack = () => {
    // 清除结果数据
    setResult(null);
    localStorage.removeItem('xuankong_result');
    localStorage.removeItem('xuankong_mobile_result');
    // 直接跳转，不显示"暂无排盘"页面
    window.location.href = '/liuyao-qigua.html';
  };

  // 如果没有结果，直接跳转到起卦页，不显示"暂无排盘"
  useEffect(() => {
    if (!result) {
      const saved = localStorage.getItem('xuankong_result');
      if (!saved) {
        // 如果没有保存的结果，直接跳转
        window.location.href = '/liuyao-qigua.html';
      }
    }
  }, [result]);
  
  if (!result) {
    // 返回空内容，避免闪烁
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 全局导航 - PC端顶部，移动端汉堡菜单 */}
      <GlobalNavigation currentPage="liuyao-qigua" />
      
      <div className="flex-1 py-10 flex flex-col items-center overflow-x-hidden xl:pt-4">
        {result ? <ResultPage data={result} onBack={handleBack} /> : null}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PaipanApp />);
}
