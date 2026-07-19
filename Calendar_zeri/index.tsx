import '../styles/tailwind.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Zhi, CategoryKey, AppTab } from './types';

// 导入拆分后的组件
import ConfigPanel from './ConfigPanel';
import CalendarView from './CalendarView';
import RelationshipsView from './RelationshipsView';
import IntentionsView from './IntentionsView';
import { GlobalNavigation } from '../shared/GlobalNavigation';

// URL到板块的映射
const slugToCategory: Record<string, CategoryKey> = {
  'health': '健康',
  'career': '事业',
  'wealth': '财运',
  'love': '感情',
  'travel': '出行',
  'fengshui': '风水'
};

/**
 * 主应用组件
 * 严格保持 PC 和 移动端两套交互系统
 */
const App = () => {
  // 从URL读取初始状态
  const getInitialTab = (): AppTab => {
    const path = window.location.pathname;
    if (path.includes('/relationships')) return 'relationships';
    if (path.includes('/intentions')) return 'intentions';
    return 'calendar';
  };

  const getInitialCategory = (): CategoryKey => {
    const path = window.location.pathname;
    // 匹配板块页面：/calendar/health.html 或 /calendar/health/2026-01-05.html
    const categoryMatch = path.match(/\/(?:m-)?calendar\/(health|career|wealth|love|travel|fengshui)(?:\.html|\/)/);
    if (categoryMatch) {
      return slugToCategory[categoryMatch[1]] || '事业';
    }
    return '事业';
  };

  const showApplication = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.display = 'block';
      rootElement.style.visibility = 'visible';
      rootElement.style.opacity = '1';
    }
    document.body.classList.add('js-loaded');
    document.documentElement.classList.add('js-loaded');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  // 全局共享状态
  const [activeTab, setActiveTab] = useState<AppTab>(getInitialTab());
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(getInitialCategory());
  const [yongShen, setYongShen] = useState<Zhi[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 标记React已加载
  useEffect(() => {
    (window as any).__REACT_LOADED__ = true;

    showApplication();

    return () => {
      document.body.classList.remove('js-loaded');
      document.documentElement.classList.remove('js-loaded');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 监听浏览器前进后退
  useEffect(() => {
    const handlePopState = () => {
      const newTab = getInitialTab();
      const newCategory = getInitialCategory();
      setActiveTab(newTab);
      setActiveCategory(newCategory);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 当URL变化时同步状态（处理直接访问URL的情况）
  useEffect(() => {
    const syncFromURL = () => {
      const newTab = getInitialTab();
      const newCategory = getInitialCategory();
      if (newTab !== activeTab) setActiveTab(newTab);
      if (newCategory !== activeCategory) setActiveCategory(newCategory);
    };
    
    // 初始同步
    syncFromURL();
    
    // 监听URL变化（通过定时检查，避免过度检查）
    const interval = setInterval(syncFromURL, 500);
    return () => clearInterval(interval);
  }, [activeTab, activeCategory]);

  return (
    <div id="calendar-app-container" className="flex flex-col lg:flex-row h-screen bg-[#fdfaf6] text-gray-900 transition-all duration-300 overflow-hidden relative" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
      
      {/* 全局导航 - PC端顶部 */}
      <div id="calendar-global-nav-wrapper" className="hidden xl:block absolute top-0 left-0 right-0 z-30">
        <GlobalNavigation currentPage="calendar" />
      </div>
      
      {/* 1. PC 侧边栏 (1200px以上固定展示) */}
      <aside id="calendar-pc-sidebar" className="hidden xl:flex w-96 bg-white border-r border-red-100 flex-col shadow-sm overflow-hidden z-20 shrink-0">
        <ConfigPanel 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          yongShen={yongShen}
          setYongShen={setYongShen}
        />
      </aside>

      {/* 2. 移动端配置抽屉 (1200px以下通过齿轮开启) */}
      {/* Fix: z-index 300 (Drawer) > 250 (Header) > 200 (Modal) */}
      <div id="calendar-mobile-config-drawer" className={`xl:hidden fixed inset-0 z-[300] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div id="calendar-mobile-config-overlay" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <div id="calendar-mobile-config-panel" className={`absolute top-0 left-0 w-[85%] max-w-sm h-full bg-white shadow-2xl drawer-transition transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <ConfigPanel 
            activeCategory={activeCategory} 
            setActiveCategory={(cat) => { setActiveCategory(cat); setIsDrawerOpen(false); }}
            yongShen={yongShen}
            setYongShen={setYongShen}
          />
        </div>
      </div>

      {/* 3. 主内容区域 */}
      <main id="calendar-main-content" className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* 日历专属筛选入口，放在统一品牌导航的菜单按钮左侧。 */}
        <button
          id="calendar-mobile-gear-button"
          onClick={() => setIsDrawerOpen(true)}
          className="xl:hidden fixed top-[11px] right-[66px] z-[310] w-10 h-10 flex items-center justify-center text-[#991A1A] bg-white border border-black/15 active:opacity-60 transition"
          aria-label="打开日历筛选"
          title={`当前板块：${activeCategory}`}
        >
          <i className="fa-solid fa-gear text-[16px]"></i>
        </button>

        {/* PC 端页签导航 - 调整位置，为全局导航让出空间 */}
        <div id="calendar-pc-tab-container" className="hidden xl:flex justify-center mt-20 z-20">
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-full border border-red-50 shadow-lg flex gap-2">
            {[
              { id: 'calendar', label: '择日万年历', icon: 'fa-calendar-days', url: '/calendar.html' },
              { id: 'relationships', label: '刑冲合会生旺库', icon: 'fa-diagram-project', url: '/relationships.html' },
              { id: 'intentions', label: '意向解析', icon: 'fa-brain', url: '/intentions.html' }
            ].map(tab => (
              <a
                key={tab.id}
                id={`calendar-pc-tab-${tab.id}`}
                href={tab.url}
                onClick={(e) => {
                  if ((window as any).__REACT_LOADED__) {
                    e.preventDefault();
                    setActiveTab(tab.id as AppTab);
                    window.history.pushState({ tab: tab.id }, '', tab.url);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 no-underline
                  ${activeTab === tab.id ? 'bg-red-900 text-white shadow-md scale-105' : 'text-gray-400 hover:text-red-900 hover:bg-red-50/50'}`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>{tab.label}
              </a>
            ))}
          </div>
        </div>

        {/* 调试按钮已通过原生DOM创建，不在这里渲染 */}

        {/* 动态内容容器 */}
        {/* 移动端增加 top padding 让出标题栏位置，并使用 h-full flex-col 布局 */}
        {/* PC端增加top padding为全局导航让出空间，减少高度保持体验 */}
        {/* 移动端增加bottom padding为底部导航（内部Tab + 全局导航）让出空间 */}
        <div id="calendar-content-container" className="flex-1 overflow-hidden relative pt-[62px] xl:pt-4 pb-32 xl:pb-4 flex flex-col">
          <div id="calendar-content-scroll" className="flex-1 w-full h-full overflow-y-auto px-4 xl:px-10 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            {activeTab === 'calendar' && (
              <CalendarView 
                activeCategory={activeCategory} 
                yongShen={yongShen} 
                onOpenConfig={() => setIsDrawerOpen(true)}
              />
            )}
            {activeTab === 'relationships' && (
              <RelationshipsView yongShen={yongShen} />
            )}
            {activeTab === 'intentions' && (
              <IntentionsView activeCategory={activeCategory} />
            )}
          </div>
        </div>

        {/* 移动端底部导航栏 - 包含全局导航和内部Tab导航 */}
        <div id="calendar-mobile-bottom-nav" className="xl:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col">
          {/* 内部Tab导航 */}
          <nav id="calendar-mobile-tab-nav" className="bg-white/95 backdrop-blur-xl border-t border-red-50">
            <div className="flex justify-around items-center h-14">
              {[
                { id: 'calendar', label: '日历', icon: 'fa-calendar-days', url: '/calendar.html' },
                { id: 'relationships', label: '刑冲', icon: 'fa-diagram-project', url: '/relationships.html' },
                { id: 'intentions', label: '意向', icon: 'fa-brain', url: '/intentions.html' }
              ].map(tab => (
                <a
                  key={tab.id}
                  id={`calendar-mobile-tab-${tab.id}`}
                  href={tab.url}
                  onClick={(e) => {
                    if ((window as any).__REACT_LOADED__) {
                      e.preventDefault();
                      setActiveTab(tab.id as AppTab);
                      window.history.pushState({ tab: tab.id }, '', tab.url);
                    }
                  }}
                  className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative no-underline
                    ${activeTab === tab.id ? 'text-red-900 scale-110 font-black' : 'text-gray-400 font-bold'}`}
                >
                  <i className={`fa-solid ${tab.icon} text-base mb-0.5`}></i>
                  <span className="text-[9px] uppercase tracking-widest">{tab.label}</span>
                  {activeTab === tab.id && <div className="absolute top-0 w-8 h-1 bg-red-800 rounded-b-full"></div>}
                </a>
              ))}
            </div>
          </nav>
          {/* 全局导航 */}
          <GlobalNavigation currentPage="calendar" />
        </div>
      </main>

      {/* PC 端背景装饰 */}
      <footer id="calendar-pc-footer" className="hidden xl:block fixed bottom-0 right-0 p-8 pointer-events-none opacity-[0.05] z-0">
        <p id="calendar-pc-footer-text" className="text-[120px] font-black text-red-900 leading-none select-none">玄空数术</p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
