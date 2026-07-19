// 历史排盘列表页面
import React, { useState, useEffect } from 'react';
import { getHistoryRecords, deleteHistoryRecord, type HistoryRecord } from '../scripts/historyManager';
import { getFavorites, isFavorite, toggleFavorite } from '../scripts/favoriteManager';

const SectionLabel = ({ children }: any) => (
  <span className="text-[11px] font-black text-ink-mid uppercase tracking-[0.3em] block mb-2 opacity-50">{children}</span>
);

export const HistoryPage = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'favorite'>('history');

  useEffect(() => {
    const loadRecords = () => {
      const history = getHistoryRecords();
      setRecords(history);
      setLoading(false);
    };
    loadRecords();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条历史记录吗？')) {
      deleteHistoryRecord(id);
      setRecords(getHistoryRecords());
    }
  };

  const handleRecordClick = (record: HistoryRecord) => {
    const result = record.result;
    // 保存到当前结果
    localStorage.setItem('xuankong_result', JSON.stringify(result));
    // 保存recordId
    localStorage.setItem('xuankong_current_record_id', record.id);
    window.location.href = '/liuyao-paipan.html';
  };

  const handleToggleFavorite = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(recordId);
    setRecords([...records]); // 触发重新渲染
  };

  // 根据当前tab过滤记录
  const filteredRecords = activeTab === 'favorite' 
    ? records.filter(r => isFavorite(r.id))
    : records;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black font-black text-lg">加载中...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="min-h-screen py-10 flex flex-col items-center">
        <header className="text-center mb-12">
          <h1 className="text-7xl font-black text-black tracking-tighter mb-3">历史排盘</h1>
          <p className="text-black text-[11px] font-black tracking-[0.8em] uppercase opacity-30">History Records</p>
        </header>
        <div className="bg-white border border-black/5 p-16 text-center">
          <p className="text-2xl font-black text-black/40 mb-4">暂无历史记录</p>
          <p className="text-sm text-black/30 mb-8">开始起卦后，您的排盘记录将显示在这里</p>
          <button onClick={() => window.location.href = '/liuyao-qigua.html'} className="bg-black text-white border-2 border-black px-8 py-4 hover:bg-white hover:text-black transition-all">
            <span className="text-[12px] font-black tracking-[0.4em] uppercase">前往起卦</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-7xl font-black text-black tracking-tighter mb-3">历史排盘</h1>
        <p className="text-black text-[11px] font-black tracking-[0.8em] uppercase opacity-30">History Records</p>
      </header>
      
      <div className="w-full max-w-6xl px-8">
        {/* Tab 切换 */}
        <div className="mb-6 flex gap-4 border-b border-black/10">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-black tracking-widest uppercase transition-all ${
              activeTab === 'history'
                ? 'text-[#991A1A] border-b-2 border-[#991A1A]'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            历史排盘
          </button>
          <button
            onClick={() => setActiveTab('favorite')}
            className={`px-6 py-3 text-sm font-black tracking-widest uppercase transition-all ${
              activeTab === 'favorite'
                ? 'text-[#991A1A] border-b-2 border-[#991A1A]'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            收藏排盘
          </button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-black/5 p-16 text-center">
            <p className="text-2xl font-black text-black/40 mb-4">
              {activeTab === 'favorite' ? '暂无收藏记录' : '暂无历史记录'}
            </p>
            <p className="text-sm text-black/30 mb-8">
              {activeTab === 'favorite' 
                ? '点击排盘结果中的五角星可以收藏' 
                : '开始起卦后，您的排盘记录将显示在这里'}
            </p>
            {activeTab === 'history' && (
              <button onClick={() => window.location.href = '/liuyao-qigua.html'} className="bg-black text-white border-2 border-black px-8 py-4 hover:bg-white hover:text-black transition-all">
                <span className="text-[12px] font-black tracking-[0.4em] uppercase">前往起卦</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-black/5 p-10 space-y-4 border-t-4 border-[#991A1A] shadow-2xl">
            {filteredRecords.map((record) => {
            const date = new Date(record.timestamp);
            const dateStr = date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={record.id}
                onClick={() => handleRecordClick(record)}
                className="border border-black/10 p-6 hover:border-[#991A1A] hover:bg-[#FAF8F5]/50 transition-all cursor-pointer group relative"
              >
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {/* 收藏按钮 */}
                  <button
                    onClick={(e) => handleToggleFavorite(record.id, e)}
                    className={`w-8 h-8 flex items-center justify-center transition-all ${
                      isFavorite(record.id)
                        ? 'text-yellow-500'
                        : 'text-black/30 hover:text-yellow-500'
                    }`}
                    title={isFavorite(record.id) ? '取消收藏' : '收藏'}
                  >
                    <svg className="w-5 h-5" fill={isFavorite(record.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="w-8 h-8 flex items-center justify-center text-black/30 hover:text-[#991A1A] hover:bg-[#991A1A]/10 transition-all"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-6 items-center">
                  {/* 占问事项 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SectionLabel>占问事项</SectionLabel>
                      {isFavorite(record.id) && (
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-black">{record.matter || '无事不占'}</h3>
                    <p className="text-sm text-black/40">{dateStr}</p>
                  </div>

                  {/* 分类 */}
                  <div className="text-center">
                    <SectionLabel>分类</SectionLabel>
                    <div className="px-4 py-2 bg-[#991A1A]/10 text-[#991A1A] font-black text-sm">
                      {record.category}
                    </div>
                  </div>

                  {/* 本卦 */}
                  <div className="text-center">
                    <SectionLabel>本卦</SectionLabel>
                    <div className="px-4 py-2 bg-black/5 text-black font-black text-xl">
                      {record.result.benTitle}
                    </div>
                  </div>

                  {/* 变卦 */}
                  <div className="text-center">
                    <SectionLabel>变卦</SectionLabel>
                    <div className="px-4 py-2 bg-black/5 text-black font-black text-xl">
                      {record.result.bianTitle}
                    </div>
                  </div>
                </div>

                {/* 点击提示 */}
                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs text-black/30">点击查看完整排盘</span>
                  <svg className="w-5 h-5 text-black/30 group-hover:text-[#991A1A] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
            })}
          </div>
        )}
        
        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/liuyao-qigua.html'}
            className="text-black font-black text-[13px] tracking-[0.3em] flex items-center group opacity-70 hover:opacity-100 transition-all uppercase mx-auto"
          >
            <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
            返回起卦
          </button>
        </div>
      </div>
    </div>
  );
};
