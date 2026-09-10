import React from 'react';
import { TrendingUp, Clock, Bookmark, ExternalLink } from 'lucide-react';
import { BookmarkItem } from '../../types/bookmark';

interface StatsOverviewProps {
  bookmarks: BookmarkItem[];
  onOpenBookmark: (bookmark: BookmarkItem) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ bookmarks, onOpenBookmark }) => {
  // Top 5 most accessed
  const topAccessed = React.useMemo(() => {
    return [...bookmarks]
      .filter((b) => (b.accessCount || 0) > 0)
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 5);
  }, [bookmarks]);

  // Top 5 recently accessed
  const recentlyAccessed = React.useMemo(() => {
    return [...bookmarks]
      .filter((b) => !!b.lastAccessedAt)
      .sort((a, b) => (b.lastAccessedAt || 0) - (a.lastAccessedAt || 0))
      .slice(0, 5);
  }, [bookmarks]);

  // Total accesses
  const totalAccesses = React.useMemo(() => {
    return bookmarks.reduce((sum, b) => sum + (b.accessCount || 0), 0);
  }, [bookmarks]);

  if (bookmarks.length === 0) return null;

  return (
    <div className="stats-overview-container">
      {/* Metric Cards */}
      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-icon bookmark-color">
            <Bookmark size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-title">保存中ブックマーク</span>
            <span className="metric-value">{bookmarks.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon access-color">
            <TrendingUp size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-title">総アクセス回数</span>
            <span className="metric-value">{totalAccesses}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon recent-color">
            <Clock size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-title">利用中アイテム</span>
            <span className="metric-value">
              {bookmarks.filter((b) => (b.accessCount || 0) > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Top Accessed & Recently Accessed Columns */}
      {(topAccessed.length > 0 || recentlyAccessed.length > 0) && (
        <div className="stats-lists-grid">
          {/* Top Frequency */}
          {topAccessed.length > 0 && (
            <div className="stats-box">
              <div className="stats-box-header">
                <TrendingUp size={16} className="accent-text" />
                <h3>よく使うブックマーク (TOP 5)</h3>
              </div>
              <div className="stats-box-list">
                {topAccessed.map((item) => (
                  <div
                    key={item.id}
                    className="stats-item"
                    onClick={() => onOpenBookmark(item)}
                    title={item.title}
                  >
                    <div className="stats-item-left">
                      <span className="stats-item-title">{item.title}</span>
                      <span className="stats-item-url">{item.url}</span>
                    </div>
                    <div className="stats-item-badge">
                      <span>{item.accessCount} 回</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Accessed */}
          {recentlyAccessed.length > 0 && (
            <div className="stats-box">
              <div className="stats-box-header">
                <Clock size={16} className="recent-text" />
                <h3>最近アクセスした項目</h3>
              </div>
              <div className="stats-box-list">
                {recentlyAccessed.map((item) => {
                  const dateStr = item.lastAccessedAt
                    ? new Date(item.lastAccessedAt).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';
                  return (
                    <div
                      key={item.id}
                      className="stats-item"
                      onClick={() => onOpenBookmark(item)}
                      title={item.title}
                    >
                      <div className="stats-item-left">
                        <span className="stats-item-title">{item.title}</span>
                        <span className="stats-item-url">{item.url}</span>
                      </div>
                      <div className="stats-item-badge">
                        <span>{dateStr}</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
