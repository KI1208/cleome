import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsOverview } from './components/StatsOverview';
import { BookmarkList } from './components/BookmarkList';
import { BookmarkModal } from './components/BookmarkModal';
import { PasswordModal } from './components/PasswordModal';
import { UnlockModal } from './components/UnlockModal';
import { ImportExportModal } from './components/ImportExportModal';
import { BookmarkItem } from '../types/bookmark';
import {
  getVisibleBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  recordBookmarkAccess,
  isMasterPasswordSet,
  getAllBookmarks,
} from '../services/storage';

export const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [hasSecretBookmarks, setHasSecretBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Private unlock state
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Sidebar resizable width state
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('cleome_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 180 && parsed <= 600) {
        return parsed;
      }
    }
    return 260;
  });
  const [isResizing, setIsResizing] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;

  // Modals state
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isPasswordConfigured, setIsPasswordConfigured] = useState(false);

  // Load data (shows all bookmarks when private unlocked, otherwise visible only)
  const loadData = useCallback(async () => {
    const all = await getAllBookmarks();
    const visible = await getVisibleBookmarks();
    setBookmarks(isPrivateUnlocked ? all : visible);
    setHasSecretBookmarks(all.some((b) => b.isSecret));

    const pwSet = await isMasterPasswordSet();
    setIsPasswordConfigured(pwSet);
  }, [isPrivateUnlocked]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle resizing side effects
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!contentAreaRef.current) return;
      const left = contentAreaRef.current.getBoundingClientRect().left;
      const newWidth = Math.min(Math.max(Math.round(e.clientX - left), 180), 600);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('cleome_sidebar_width', String(sidebarWidthRef.current));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleDoubleClickResizer = () => {
    setSidebarWidth(260);
    localStorage.setItem('cleome_sidebar_width', '260');
  };

  const handleTogglePrivateLock = () => {
    if (isPrivateUnlocked) {
      setIsPrivateUnlocked(false);
    } else {
      if (isPasswordConfigured) {
        setIsUnlockModalOpen(true);
      } else {
        setIsPasswordModalOpen(true);
      }
    }
  };

  // Existing unique folders list for auto-completion
  const existingFolders = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.folderPath) set.add(b.folderPath);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Filtered bookmarks based on search, folder, tag
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      // Folder filter (match exact or subfolder)
      if (selectedFolder !== null) {
        const folder = b.folderPath || '';
        if (selectedFolder === '') {
          if (folder !== '') return false;
        } else {
          if (folder !== selectedFolder && !folder.startsWith(`${selectedFolder}/`)) {
            return false;
          }
        }
      }

      // Tag filter
      if (selectedTag !== null) {
        if (!b.tags.includes(selectedTag)) return false;
      }

      // Search query (title, description, tags, url)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = b.title.toLowerCase().includes(q);
        const descMatch = (b.description || '').toLowerCase().includes(q);
        const urlMatch = b.url.toLowerCase().includes(q);
        const tagMatch = b.tags.some((t) => t.toLowerCase().includes(q));

        if (!titleMatch && !descMatch && !urlMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [bookmarks, selectedFolder, selectedTag, searchQuery]);

  const handleSelectFolder = useCallback((folder: string | null) => {
    setSelectedFolder(folder);
    setSelectedTag(null);
  }, []);

  const handleSelectTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setSelectedFolder(null);
  }, []);

  // Open bookmark and track access
  const handleOpenBookmark = async (item: BookmarkItem) => {
    await recordBookmarkAccess(item.id);

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'OPEN_BOOKMARK',
        url: item.url,
        isSecret: !!item.isSecret,
      });
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }

    // Refresh counts in UI
    await loadData();
  };

  // Save handler (Add or Update)
  const handleSaveBookmark = async (item: BookmarkItem) => {
    if (editingBookmark) {
      await updateBookmark(item);
    } else {
      await addBookmark(item);
    }
    await loadData();
  };

  // Delete handler
  const handleDeleteBookmark = async (id: string) => {
    if (window.confirm('このブックマークを削除してもよろしいですか？')) {
      await deleteBookmark(id);
      await loadData();
    }
  };

  // Import success handler
  const handleImportSuccess = async (importedItems: BookmarkItem[]) => {
    for (const item of importedItems) {
      await addBookmark(item);
    }
    await loadData();
  };

  return (
    <div className="dashboard-layout">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => {
          setEditingBookmark(null);
          setIsBookmarkModalOpen(true);
        }}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        hasSecretBookmarks={hasSecretBookmarks}
        isPrivateUnlocked={isPrivateUnlocked}
        onTogglePrivateLock={handleTogglePrivateLock}
      />

      <div
        ref={contentAreaRef}
        className={`dashboard-content-area ${isResizing ? 'is-resizing' : ''}`}
      >
        <Sidebar
          bookmarks={bookmarks}
          selectedFolder={selectedFolder}
          selectedTag={selectedTag}
          onSelectFolder={handleSelectFolder}
          onSelectTag={handleSelectTag}
          width={sidebarWidth}
        />

        <div
          className={`dashboard-resizer ${isResizing ? 'is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          onDoubleClick={handleDoubleClickResizer}
          title="境界線をドラッグして幅を変更 (ダブルクリックで初期幅に戻す)"
        />

        <main className="dashboard-main">
          {/* Show Stats Overview only when no filter and no search */}
          {!searchQuery && selectedFolder === null && selectedTag === null && (
            <StatsOverview
              bookmarks={bookmarks}
              onOpenBookmark={handleOpenBookmark}
            />
          )}

          {/* Active Filter Bar if filtered */}
          {(selectedFolder !== null || selectedTag !== null || searchQuery) && (
            <div className="active-filter-bar">
              <span className="filter-title">絞り込み中:</span>
              {selectedFolder !== null && (
                <span className="filter-tag">
                  📁 フォルダ: {selectedFolder || 'ルート'}
                  <button onClick={() => handleSelectFolder(null)}>✕</button>
                </span>
              )}
              {selectedTag !== null && (
                <span className="filter-tag">
                  🏷️ タグ: #{selectedTag}
                  <button onClick={() => handleSelectTag(null)}>✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-tag">
                  🔍 検索: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
              <span className="filter-count">({filteredBookmarks.length} 件)</span>
            </div>
          )}

          <BookmarkList
            bookmarks={filteredBookmarks}
            onOpen={handleOpenBookmark}
            onEdit={(b) => {
              setEditingBookmark(b);
              setIsBookmarkModalOpen(true);
            }}
            onDelete={handleDeleteBookmark}
            onSelectTag={handleSelectTag}
            onSelectFolder={handleSelectFolder}
          />
        </main>
      </div>

      {/* Bookmark Add/Edit Modal */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
        existingFolders={existingFolders}
        isPasswordSet={isPasswordConfigured}
        onRequestSetPassword={() => setIsPasswordModalOpen(true)}
      />

      {/* Master Password Setup Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setIsPasswordConfigured(true);
          // Re-open or resume bookmark modal
        }}
      />

      {/* Unlock Password Modal */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccess={() => setIsPrivateUnlocked(true)}
      />

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        bookmarks={bookmarks}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};
