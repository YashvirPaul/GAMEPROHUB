// LocalStorage persistence for scores, recently played, and favorites

const HIGH_SCORE_PREFIX = 'gamehub_hs_';
const RECENT_KEY = 'gamehub_recently_played';
const FAVORITES_KEY = 'gamehub_favorites';

export function getHighScore(gameId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(`${HIGH_SCORE_PREFIX}${gameId}`);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(gameId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(`${HIGH_SCORE_PREFIX}${gameId}`, String(score));
      return true; // New record!
    }
  } catch {
    // Ignore storage quota
  }
  return false;
}

export function getRecentlyPlayed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordGamePlayed(gameId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getRecentlyPlayed().filter(id => id !== gameId);
    list.unshift(gameId);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    // Ignore
  }
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(gameId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const favs = getFavorites();
    const index = favs.indexOf(gameId);
    let isNowFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
    } else {
      favs.push(gameId);
      isNowFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return isNowFav;
  } catch {
    return false;
  }
}
