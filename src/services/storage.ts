import { BookmarkItem, UserSecuritySettings } from '../types/bookmark';

const STORAGE_KEYS = {
  BOOKMARKS: 'cleome_bookmarks',
  SETTINGS: 'cleome_security_settings',
};

// Check if chrome.storage.local is available
function isChromeStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}

// LocalStorage fallback for dev preview
async function storageGet<T>(key: string, defaultValue: T): Promise<T> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage get error:', chrome.runtime.lastError);
          resolve(defaultValue);
        } else {
          resolve((result[key] as T) ?? defaultValue);
        }
      });
    });
  } else {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

async function storageSet<T>(key: string, value: T): Promise<void> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Bookmark Storage Service
 */

// Get all bookmarks stored in Cleome (internal use / secret management)
export async function getAllBookmarks(): Promise<BookmarkItem[]> {
  return storageGet<BookmarkItem[]>(STORAGE_KEYS.BOOKMARKS, []);
}

// Get only normal (non-secret) bookmarks.
// CRITICAL REQUIREMENT: Secret bookmarks must NEVER appear in dashboard or normal views.
export async function getVisibleBookmarks(): Promise<BookmarkItem[]> {
  const all = await getAllBookmarks();
  return all.filter((item) => !item.isSecret);
}

// Get secret bookmarks only
export async function getSecretBookmarks(): Promise<BookmarkItem[]> {
  const all = await getAllBookmarks();
  return all.filter((item) => item.isSecret);
}

// Save or update bookmarks list
export async function saveAllBookmarks(bookmarks: BookmarkItem[]): Promise<void> {
  await storageSet(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

// Add a single bookmark
export async function addBookmark(item: BookmarkItem): Promise<void> {
  const all = await getAllBookmarks();
  all.unshift(item);
  await saveAllBookmarks(all);
}

// Update a single bookmark
export async function updateBookmark(updatedItem: BookmarkItem): Promise<void> {
  const all = await getAllBookmarks();
  const index = all.findIndex((item) => item.id === updatedItem.id);
  if (index !== -1) {
    all[index] = { ...updatedItem, updatedAt: Date.now() };
    await saveAllBookmarks(all);
  }
}

// Delete a single bookmark
export async function deleteBookmark(id: string): Promise<void> {
  const all = await getAllBookmarks();
  const filtered = all.filter((item) => item.id !== id);
  await saveAllBookmarks(filtered);
}

// Record bookmark access (frequency & last access timestamp)
export async function recordBookmarkAccess(id: string): Promise<void> {
  const all = await getAllBookmarks();
  const item = all.find((b) => b.id === id);
  if (item) {
    item.accessCount = (item.accessCount || 0) + 1;
    item.lastAccessedAt = Date.now();
    await saveAllBookmarks(all);
  }
}

/**
 * Security & Settings Service
 */
export async function getSecuritySettings(): Promise<UserSecuritySettings> {
  return storageGet<UserSecuritySettings>(STORAGE_KEYS.SETTINGS, {
    secretLockTimeoutMinutes: 15,
  });
}

export async function saveSecuritySettings(settings: UserSecuritySettings): Promise<void> {
  await storageSet(STORAGE_KEYS.SETTINGS, settings);
}

export async function isMasterPasswordSet(): Promise<boolean> {
  const settings = await getSecuritySettings();
  return !!(settings.passwordHash && settings.passwordSalt);
}
