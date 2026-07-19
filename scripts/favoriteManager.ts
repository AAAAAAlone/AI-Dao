// 收藏管理工具（基于 localStorage）
// 用于管理收藏的排盘记录

const FAVORITE_KEY = 'xuankong_favorites';

export interface FavoriteRecord {
  recordId: string;
  timestamp: string;
}

/**
 * 获取所有收藏的ID列表
 */
export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITE_KEY);
    if (!stored) return [];
    const favorites: FavoriteRecord[] = JSON.parse(stored);
    return favorites.map(f => f.recordId);
  } catch (e) {
    console.error('Failed to load favorites:', e);
    return [];
  }
}

/**
 * 检查是否已收藏
 */
export function isFavorite(recordId: string): boolean {
  return getFavorites().includes(recordId);
}

/**
 * 添加收藏
 */
export function addFavorite(recordId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(recordId)) {
    const favoriteRecords: FavoriteRecord[] = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]');
    favoriteRecords.push({
      recordId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favoriteRecords));
  }
}

/**
 * 取消收藏
 */
export function removeFavorite(recordId: string): void {
  const favoriteRecords: FavoriteRecord[] = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]');
  const filtered = favoriteRecords.filter(f => f.recordId !== recordId);
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(filtered));
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(recordId: string): boolean {
  if (isFavorite(recordId)) {
    removeFavorite(recordId);
    return false;
  } else {
    addFavorite(recordId);
    return true;
  }
}

