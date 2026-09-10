export interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  folderPath: string; // e.g. "Work/Dev" or "" for root
  isSecret: boolean;
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  lastAccessedAt?: number;
  // 暗号化時用
  encryptedData?: string; // AES-GCM encrypted payload (URL, title, description, custom tags)
  iv?: string;            // Initialization Vector
}

export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  bookmarkCount: number;
}

export interface UserSecuritySettings {
  passwordHash?: string; // PBKDF2 hash of master password
  passwordSalt?: string; // Salt used for hashing
  secretLockTimeoutMinutes: number; // e.g. 15 minutes
}

export interface CleomeExportData {
  version: number;
  exportedAt: number;
  bookmarks: BookmarkItem[];
}
