import React from 'react';
import { Folder, Tag, Layers, Hash } from 'lucide-react';
import { BookmarkItem } from '../../types/bookmark';

interface SidebarProps {
  bookmarks: BookmarkItem[];
  selectedFolder: string | null; // null = all, "" = root, "path/sub"
  selectedTag: string | null;
  onSelectFolder: (folder: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  bookmarks,
  selectedFolder,
  selectedTag,
  onSelectFolder,
  onSelectTag,
  width,
}) => {
  // Compute folder list and counts
  const folderCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    bookmarks.forEach((b) => {
      const p = (b.folderPath || '').trim();
      map.set(p, (map.get(p) || 0) + 1);
    });
    return map;
  }, [bookmarks]);

  // Compute tag counts
  const tagCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    bookmarks.forEach((b) => {
      b.tags.forEach((tag) => {
        map.set(tag, (map.get(tag) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [bookmarks]);

  const uniqueFolders = React.useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.folderPath) {
        set.add(b.folderPath);
      }
    });
    return Array.from(set).sort();
  }, [bookmarks]);

  return (
    <aside
      className="dashboard-sidebar"
      style={width ? { width: `${width}px` } : undefined}
    >
      {/* Overview / All */}
      <div className="sidebar-section">
        <button
          className={`nav-item ${selectedFolder === null && selectedTag === null ? 'active' : ''}`}
          onClick={() => {
            onSelectFolder(null);
            onSelectTag(null);
          }}
        >
          <Layers size={18} />
          <span className="nav-label">すべてのブックマーク</span>
          <span className="nav-count">{bookmarks.length}</span>
        </button>
      </div>

      {/* Folders */}
      <div className="sidebar-section">
        <div className="section-title">
          <Folder size={14} />
          <span>フォルダ</span>
        </div>

        <button
          className={`nav-item sub ${selectedFolder === '' ? 'active' : ''}`}
          onClick={() => onSelectFolder('')}
        >
          <span className="folder-icon">📁</span>
          <span className="nav-label">（ルート）</span>
          <span className="nav-count">{folderCounts.get('') || 0}</span>
        </button>

        {uniqueFolders.map((path) => {
          const isSelected = selectedFolder === path;
          return (
            <button
              key={path}
              className={`nav-item sub ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectFolder(path)}
              title={path}
            >
              <span className="folder-icon">📂</span>
              <span className="nav-label">{path}</span>
              <span className="nav-count">{folderCounts.get(path) || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Tags */}
      <div className="sidebar-section">
        <div className="section-title">
          <Tag size={14} />
          <span>タグ</span>
        </div>

        {tagCounts.length === 0 ? (
          <div className="empty-hint">タグはまだありません</div>
        ) : (
          <div className="tag-cloud">
            {tagCounts.map(([tag, count]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  className={`tag-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                >
                  <Hash size={12} />
                  <span className="tag-name">{tag}</span>
                  <span className="tag-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
