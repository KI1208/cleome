import React from 'react';
import { ExternalLink, Edit3, Trash2, Folder, Clock, Activity } from 'lucide-react';
import { BookmarkItem } from '../../types/bookmark';

interface BookmarkListProps {
  bookmarks: BookmarkItem[];
  onOpen: (item: BookmarkItem) => void;
  onEdit: (item: BookmarkItem) => void;
  onDelete: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectFolder: (folder: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onOpen,
  onEdit,
  onDelete,
  onSelectTag,
  onSelectFolder,
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔖</div>
        <h3>ブックマークが見つかりません</h3>
        <p>条件を変更するか、右上の「ブックマーク追加」から登録してください。</p>
      </div>
    );
  }

  return (
    <div className="bookmark-grid">
      {bookmarks.map((b) => {
        const hostname = (() => {
          try {
            return new URL(b.url).hostname;
          } catch {
            return b.url;
          }
        })();

        const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

        return (
          <div key={b.id} className="bookmark-card">
            <div className="card-top">
              <div className="card-header-left" onClick={() => onOpen(b)}>
                <img
                  src={faviconUrl}
                  alt=""
                  className="card-favicon"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="card-titles">
                  <h4 className="card-title" title={b.title}>
                    {b.title}
                  </h4>
                  <span className="card-url" title={b.url}>
                    {hostname}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="action-btn"
                  onClick={() => onOpen(b)}
                  title="リンクを開く"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => onEdit(b)}
                  title="編集"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(b.id)}
                  title="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            {b.description && (
              <p className="card-description" title={b.description}>
                {b.description}
              </p>
            )}

            {/* Tags */}
            {b.tags && b.tags.length > 0 && (
              <div className="card-tags">
                {b.tags.map((tag) => (
                  <span
                    key={tag}
                    className="card-tag"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag(tag);
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Card Footer: Folder, Access Count, Last Access */}
            <div className="card-footer">
              <div className="footer-left">
                {b.folderPath ? (
                  <span
                    className="folder-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFolder(b.folderPath);
                    }}
                    title={`フォルダ: ${b.folderPath}`}
                  >
                    <Folder size={12} />
                    {b.folderPath}
                  </span>
                ) : (
                  <span className="folder-badge root">
                    <Folder size={12} />
                    ルート
                  </span>
                )}
              </div>

              <div className="footer-right">
                <span className="meta-stat" title={`アクセス頻度: ${b.accessCount || 0}回`}>
                  <Activity size={12} />
                  {b.accessCount || 0}
                </span>

                {b.lastAccessedAt && (
                  <span
                    className="meta-stat"
                    title={`最終アクセス: ${new Date(b.lastAccessedAt).toLocaleString('ja-JP')}`}
                  >
                    <Clock size={12} />
                    {new Date(b.lastAccessedAt).toLocaleDateString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
