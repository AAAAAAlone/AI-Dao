// 移动端历史排盘列表页面
import React, { useState, useEffect } from 'react';
import { getHistoryRecords, deleteHistoryRecord, type HistoryRecord } from '../scripts/historyManager';
import { getFavorites, isFavorite, toggleFavorite } from '../scripts/favoriteManager';

export const HistoryPageMobile = () => {
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
    localStorage.setItem('xuankong_current_record_id', record.id);
    // 保存到移动端结果
    localStorage.setItem('xuankong_mobile_result', JSON.stringify(result));
    window.location.href = '/liuyao-paipan.html';
  };

  const handleToggleFavorite = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recordId);
    setRecords([...records]); // 触发重新渲染
  };

  // 根据当前tab过滤记录
  const filteredRecords = activeTab === 'favorite' 
    ? records.filter(r => isFavorite(r.id))
    : records;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <p className="text-black font-black" style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div id="liuyao-history-container" className="flex-1 flex flex-col bg-[#FAF8F5] overflow-hidden min-h-0">
      {/* Tab 切换 - 移到顶部，去掉大标题 */}
      <div id="liuyao-history-tabs" className="flex gap-2 border-b border-black/10 bg-white px-4 shrink-0 pb-1">
        <button
          id="liuyao-history-tab-history"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center font-black uppercase transition-all relative flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'history'
              ? 'text-[#991A1A]'
              : 'text-black/40'
          }`}
        >
          <span id="liuyao-history-tab-history-text" className="relative z-10" style={{ fontSize: '16px' }}>历史排盘</span>
          {activeTab === 'history' && (
            <>
              <span id="liuyao-history-tab-history-decorative" className="text-[8px] font-black text-[#991A1A] opacity-30 tracking-[0.15em] whitespace-nowrap leading-none">
                HISTORY
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#991A1A]" />
            </>
          )}
        </button>
        <button
          id="liuyao-history-tab-favorite"
          onClick={() => setActiveTab('favorite')}
          className={`flex-1 py-3 text-center font-black uppercase transition-all relative flex flex-col items-center justify-center gap-0.5 ${
            activeTab === 'favorite'
              ? 'text-[#991A1A]'
              : 'text-black/40'
          }`}
        >
          <span id="liuyao-history-tab-favorite-text" className="relative z-10" style={{ fontSize: '16px' }}>收藏排盘</span>
          {activeTab === 'favorite' && (
            <>
              <span id="liuyao-history-tab-favorite-decorative" className="text-[8px] font-black text-[#991A1A] opacity-30 tracking-[0.15em] whitespace-nowrap leading-none">
                FAVORITE
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#991A1A]" />
            </>
          )}
        </button>
      </div>

      {/* 内容区域 - 使用 flex-1 自适应高度 */}
      <div id="liuyao-history-list" className="flex-1 overflow-y-auto px-4 py-6 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {filteredRecords.length === 0 ? (
          <div id="liuyao-history-empty" className="bg-white border border-black/5 p-8 text-center rounded-lg">
            <p className="font-black text-black/40 mb-4" style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>
              {activeTab === 'favorite' ? '暂无收藏记录' : '暂无历史记录'}
            </p>
            <p className="text-black/30 mb-6" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
              {activeTab === 'favorite' 
                ? '点击排盘结果中的五角星可以收藏' 
                : '开始起卦后，您的排盘记录将显示在这里'}
            </p>
            {activeTab === 'history' && (
              <button 
                id="liuyao-history-empty-goto-btn"
                onClick={() => window.location.href = '/liuyao-qigua.html'} 
                className="bg-black text-white px-6 py-3 rounded-lg active:bg-black/80 transition-all"
                style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
              >
                <span className="font-black tracking-widest uppercase">前往起卦</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
                  id={`liuyao-history-item-${record.id}`}
                  onClick={() => handleRecordClick(record)}
                  className="bg-white border border-black/10 p-4 rounded-lg active:bg-[#FAF8F5]/50 transition-all relative"
                >
                  {/* 收藏和删除按钮 */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      id={`liuyao-history-item-favorite-btn-${record.id}`}
                      onClick={(e) => handleToggleFavorite(record.id, e)}
                      className={`transition-all active:scale-90 ${
                        isFavorite(record.id) ? 'text-yellow-500' : 'text-black/30'
                      }`}
                      style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}
                    >
                      <svg fill={isFavorite(record.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1em', height: '1em' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      id={`liuyao-history-item-delete-btn-${record.id}`}
                      onClick={(e) => handleDelete(record.id, e)}
                      className="text-black/30 active:text-[#991A1A] transition-all"
                      style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1em', height: '1em' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 占问事项 */}
                  <div id={`liuyao-history-item-matter-${record.id}`} className="pr-16 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-[#991A1A] uppercase tracking-widest opacity-60" style={{ fontSize: 'clamp(8px, 2vw, 9px)' }}>占问事项</span>
                      {isFavorite(record.id) && (
                        <svg className="text-yellow-500" fill="currentColor" viewBox="0 0 24 24" style={{ width: 'clamp(12px, 3vw, 14px)', height: 'clamp(12px, 3vw, 14px)' }}>
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </div>
                    <h3 id={`liuyao-history-item-matter-text-${record.id}`} className="font-black text-black leading-tight mb-1" style={{ fontSize: 'clamp(18px, 4.5vw, 22px)' }}>
                      {record.matter || '无事不占'}
                    </h3>
                    <p id={`liuyao-history-item-date-${record.id}`} className="text-black/40" style={{ fontSize: 'clamp(11px, 2.75vw, 13px)' }}>{dateStr}</p>
                  </div>

                  {/* 分类和卦名 */}
                  <div id={`liuyao-history-item-info-${record.id}`} className="flex items-center gap-3 flex-wrap">
                    <div id={`liuyao-history-item-category-${record.id}`} className="px-3 py-1.5 bg-[#991A1A]/10 rounded">
                      <span className="text-[#991A1A] font-black" style={{ fontSize: 'clamp(11px, 2.75vw, 13px)' }}>
                        {record.category}
                      </span>
                    </div>
                    <div id={`liuyao-history-item-title-${record.id}`} className="px-3 py-1.5 bg-black/5 rounded">
                      <span className="text-black font-black" style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                        {record.result.benTitle}
                      </span>
                    </div>
                    <span className="text-black/40" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>→</span>
                    <div id={`liuyao-history-item-bian-title-${record.id}`} className="px-3 py-1.5 bg-black/5 rounded">
                      <span className="text-black font-black" style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                        {record.result.bianTitle}
                      </span>
                    </div>
                  </div>

                  {/* 点击提示 */}
                  <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-black/30" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>点击查看完整排盘</span>
                    <svg className="w-4 h-4 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
