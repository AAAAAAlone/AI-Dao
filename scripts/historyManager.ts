// 历史记录管理工具（基于 localStorage）
// 用于客户端存储和读取历史排盘记录

export interface HistoryRecord {
  id: string;
  timestamp: string;
  matter: string;
  category: string;
  result: any; // 完整的排盘结果
}

const HISTORY_KEY = 'xuankong_history_records';
const MAX_RECORDS = 100; // 最多保存 100 条记录

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 保存历史记录
 */
export function saveHistoryRecord(result: any): string {
  const record: HistoryRecord = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    matter: result.matter || '无事不占',
    category: result.category || '综合',
    result: result
  };

  const records = getHistoryRecords();
  records.unshift(record); // 添加到开头
  const limited = records.slice(0, MAX_RECORDS); // 只保留最近 100 条
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  return record.id;
}

/**
 * 获取所有历史记录
 */
export function getHistoryRecords(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load history records:', e);
    return [];
  }
}

/**
 * 根据 ID 获取历史记录
 */
export function getHistoryRecordById(id: string): HistoryRecord | null {
  const records = getHistoryRecords();
  return records.find(r => r.id === id) || null;
}

/**
 * 更新已有历史记录的完整排盘结果。
 * 主要用于给旧记录补写固定卦例 URL，保留原记录 ID、收藏状态和时间。
 */
export function updateHistoryRecordResult(id: string, result: any): HistoryRecord | null {
  const records = getHistoryRecords();
  const index = records.findIndex(record => record.id === id);
  if (index < 0) return null;
  records[index] = {
    ...records[index],
    matter: result?.matter || records[index].matter,
    category: result?.category || records[index].category,
    result,
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  return records[index];
}

/**
 * 删除历史记录
 */
export function deleteHistoryRecord(id: string): boolean {
  const records = getHistoryRecords();
  const filtered = records.filter(r => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  return filtered.length < records.length;
}

/**
 * 清空所有历史记录
 */
export function clearHistoryRecords(): void {
  localStorage.removeItem(HISTORY_KEY);
}
