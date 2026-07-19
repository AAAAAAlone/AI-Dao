import React, { useState } from 'react';

interface GlobalNavigationProps {
  currentPage?: 'calendar' | 'liuyao-qigua' | 'bazi';
}

const navItems = [
  { id: 'liuyao-qigua', label: '六爻排盘', href: '/liuyao-qigua.html' },
  { id: 'calendar', label: '择日万年历', href: '/calendar.html' },
  { id: 'bazi', label: '八字排盘', href: '/bazi-paipan.html' },
] as const;

export const GlobalNavigation: React.FC<GlobalNavigationProps> = ({ currentPage = 'calendar' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <nav className="hidden xl:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-50 shadow-sm" aria-label="全局导航">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-black text-[#991A1A] tracking-tight no-underline">玄空数术</a>
          <div className="flex items-center gap-8">
            {navItems.map(item => (
              <a key={item.id} href={item.href} className={`text-sm font-black tracking-[0.1em] border-b-2 no-underline pb-1 ${currentPage === item.id ? 'border-[#991A1A] text-[#991A1A]' : 'border-transparent text-[#5A544E] opacity-50 hover:opacity-90'}`}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <header className="xl:hidden fixed top-0 left-0 right-0 z-[300] h-[62px] bg-[#FFFDF9]/95 backdrop-blur-md border-b border-black/10 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline text-[#1A1816]"><span className="w-9 h-9 grid place-items-center bg-[#991A1A] text-white font-black text-lg">玄</span><strong>玄空数术</strong></a>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 border border-black/15 bg-white text-[#991A1A] font-black" aria-label="打开导航菜单">{isMenuOpen ? '×' : '☰'}</button>
        </div>
        {isMenuOpen && (
          <nav className="fixed top-[62px] right-3 left-3 bg-[#FFFDF9] border border-black/15 shadow-2xl p-3" aria-label="移动端导航">
            {navItems.map(item => <a key={item.id} href={item.href} className={`block px-4 py-3.5 border-b border-black/10 text-[16px] font-black no-underline ${currentPage === item.id ? 'text-[#991A1A]' : 'text-[#1A1816]'}`}>{item.label}</a>)}
          </nav>
        )}
      </header>
    </>
  );
};
