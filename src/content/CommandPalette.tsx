import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Lock, Unlock, CornerDownLeft } from 'lucide-react';
import { BookmarkItem } from '../types/bookmark';
import {
  getAllBookmarks,
  recordBookmarkAccess,
  getSecuritySettings,
} from '../services/storage';
import { verifyPassword } from '../services/crypto';

interface CommandPaletteProps {
  onClose: () => void;
}

interface DisplayBookmarkItem extends BookmarkItem {
  sectionTitle?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [allBookmarks, setAllBookmarks] = useState<BookmarkItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [hasMasterPassword, setHasMasterPassword] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load bookmarks & settings on mount
  useEffect(() => {
    async function init() {
      const items = await getAllBookmarks();
      setAllBookmarks(items);

      const settings = await getSecuritySettings();
      setHasMasterPassword(!!(settings.passwordHash && settings.passwordSalt));
    }
    init();
    inputRef.current?.focus();
  }, []);

  // Filtered and sorted bookmarks:
  // When no query: Top 10 most accessed bookmarks first, then the rest
  // When searching: Filtered results sorted with priority to frequently accessed items
  const filteredBookmarks: DisplayBookmarkItem[] = useMemo(() => {
    const available = allBookmarks.filter((b) => {
      // Secret isolation check
      if (b.isSecret && !isSecretUnlocked) {
        return false;
      }
      return true;
    });

    const q = query.toLowerCase().trim();

    if (!q) {
      // Sort by access count descending, then by last accessed timestamp descending
      const sorted = [...available].sort(
        (a, b) => (b.accessCount || 0) - (a.accessCount || 0) || (b.lastAccessedAt || 0) - (a.lastAccessedAt || 0)
      );

      const topAccessed = sorted.filter((b) => (b.accessCount || 0) > 0).slice(0, 10);
      const topIds = new Set(topAccessed.map((b) => b.id));
      const remaining = sorted.filter((b) => !topIds.has(b.id));

      if (topAccessed.length > 0) {
        return [
          ...topAccessed.map((b) => ({ ...b, sectionTitle: '🔥 よく使うブックマーク (TOP 10)' })),
          ...remaining.map((b) => ({ ...b, sectionTitle: '📚 その他のブックマーク' })),
        ];
      } else {
        return sorted.map((b) => ({ ...b, sectionTitle: '📚 すべてのブックマーク' }));
      }
    } else {
      const matched = available.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        const urlMatch = b.url.toLowerCase().includes(q);
        const tagMatch = b.tags.some((t) => t.toLowerCase().includes(q));

        return titleMatch || descMatch || urlMatch || tagMatch;
      });

      // Frequently accessed results appear first
      matched.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));

      return matched.map((b) => ({
        ...b,
        sectionTitle: `🔍 検索結果 (${matched.length}件)`,
      }));
    }
  }, [allBookmarks, query, isSecretUnlocked]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredBookmarks]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle open bookmark
  const handleOpen = async (item: BookmarkItem) => {
    await recordBookmarkAccess(item.id);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'OPEN_BOOKMARK',
        url: item.url,
        isSecret: !!item.isSecret,
      });
    } else {
      window.open(item.url, '_blank');
    }

    onClose();
  };

  // Password verification
  const handleUnlockSecret = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) return;

    try {
      const settings = await getSecuritySettings();
      if (!settings.passwordHash || !settings.passwordSalt) {
        // No password configured yet
        setShowPasswordInput(false);
        return;
      }

      const isValid = await verifyPassword(password, settings.passwordSalt, settings.passwordHash);
      if (isValid) {
        setIsSecretUnlocked(true);
        setShowPasswordInput(false);
        setPassword('');
        setPasswordError(false);
        inputRef.current?.focus();
      } else {
        setPasswordError(true);
      }
    } catch {
      setPasswordError(true);
    }
  };

  // Global Keydown Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredBookmarks.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredBookmarks.length - 1));
    } else if (e.key === 'Enter') {
      if (showPasswordInput) return; // handled by form
      e.preventDefault();
      if (filteredBookmarks[selectedIndex]) {
        handleOpen(filteredBookmarks[selectedIndex]);
      }
    }
  };

  return (
    <div className="cleome-palette-backdrop" onClick={onClose}>
      <div
        className="cleome-palette-window"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search row */}
        <div className="cleome-palette-search-row">
          <Search size={18} className="cleome-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cleome-palette-input"
            placeholder={
              isSecretUnlocked
                ? 'シークレット含むすべてのブックマークを検索...'
                : 'ブックマークを検索... (タイトル、説明、タグ)'
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Quick trigger: typing /secret opens password prompt
              if (e.target.value.startsWith('/secret') && !isSecretUnlocked) {
                setShowPasswordInput(true);
                setTimeout(() => passwordInputRef.current?.focus(), 50);
              }
            }}
          />

          {/* Secret Mode Toggle Button */}
          {hasMasterPassword && (
            <button
              type="button"
              className={`cleome-secret-toggle-btn ${isSecretUnlocked ? 'unlocked' : ''}`}
              onClick={() => {
                if (isSecretUnlocked) {
                  setIsSecretUnlocked(false);
                } else {
                  setShowPasswordInput(!showPasswordInput);
                  if (!showPasswordInput) {
                    setTimeout(() => passwordInputRef.current?.focus(), 50);
                  }
                }
              }}
              title={isSecretUnlocked ? 'クリックしてシークレットを再ロック' : 'パスワードでシークレットを解除'}
            >
              {isSecretUnlocked ? (
                <>
                  <span className="cleome-secret-indicator-dot" />
                  <Unlock size={14} />
                  <span>シークレット解除中</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>シークレット解除</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Password input form if prompt is active */}
        {showPasswordInput && !isSecretUnlocked && (
          <form className="cleome-password-form-row" onSubmit={handleUnlockSecret}>
            <Lock size={16} color="#fb7185" />
            <input
              ref={passwordInputRef}
              type="password"
              placeholder="シークレット解除パスワードを入力"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              style={passwordError ? { borderColor: '#f43f5e' } : {}}
            />
            <button type="submit" className="cleome-pw-btn submit">
              解除
            </button>
            <button
              type="button"
              className="cleome-pw-btn cancel"
              onClick={() => {
                setShowPasswordInput(false);
                inputRef.current?.focus();
              }}
            >
              キャンセル
            </button>
          </form>
        )}

        {/* Results List */}
        <div className="cleome-palette-results" ref={resultsContainerRef}>
          {filteredBookmarks.length === 0 ? (
            <div className="cleome-empty-results">
              {query ? '該当するブックマークがありません' : 'ブックマークが登録されていません'}
            </div>
          ) : (
            filteredBookmarks.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isFirstInSection =
                index === 0 || item.sectionTitle !== filteredBookmarks[index - 1].sectionTitle;

              const hostname = (() => {
                try {
                  return new URL(item.url).hostname;
                } catch {
                  return item.url;
                }
              })();
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

              return (
                <React.Fragment key={item.id}>
                  {isFirstInSection && item.sectionTitle && (
                    <div className="cleome-palette-section-title">
                      {item.sectionTitle}
                    </div>
                  )}

                  <div
                    data-index={index}
                    className={`cleome-palette-item ${isSelected ? 'selected' : ''} ${
                      item.isSecret ? 'is-secret' : ''
                    }`}
                    onClick={() => handleOpen(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="cleome-item-left">
                      <img
                        src={faviconUrl}
                        alt=""
                        className="cleome-item-favicon"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="cleome-item-details">
                        <div className="cleome-item-title-row">
                          <span className="cleome-item-title">{item.title}</span>
                          {item.isSecret && (
                            <span
                              className="cleome-secret-tag-badge"
                              title="Chromeのシークレットウィンドウで開きます"
                            >
                              🕶️ シークレット
                            </span>
                          )}
                        </div>
                        {item.description ? (
                          <span className="cleome-item-desc">{item.description}</span>
                        ) : (
                          <span className="cleome-item-desc">{hostname}</span>
                        )}
                      </div>
                    </div>

                    <div className="cleome-item-right">
                      {item.folderPath && (
                        <span className="cleome-palette-folder">📁 {item.folderPath}</span>
                      )}
                      {item.tags.slice(0, 2).map((t) => (
                        <span key={t} className="cleome-palette-tag">
                          #{t}
                        </span>
                      ))}
                      {(item.accessCount || 0) > 0 && (
                        <span
                          className="cleome-palette-access-badge"
                          title={`利用回数: ${item.accessCount}回`}
                        >
                          🔥 {item.accessCount}
                        </span>
                      )}
                      {isSelected && <CornerDownLeft size={14} color="#818cf8" />}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="cleome-palette-footer">
          <div className="cleome-footer-keys">
            <span>
              <kbd className="cleome-kbd">↑</kbd>
              <kbd className="cleome-kbd">↓</kbd> 移動
            </span>
            <span>
              <kbd className="cleome-kbd">↵</kbd> 開く
            </span>
            <span>
              <kbd className="cleome-kbd">esc</kbd> 閉じる
            </span>
          </div>

          <div className="cleome-footer-right">
            <span>Cleome</span>
          </div>
        </div>
      </div>
    </div>
  );
};
