import React from 'react';
import { Search, Plus, Download, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenImportExportModal: () => void;
  hasSecretBookmarks: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportExportModal,
  hasSecretBookmarks,
}) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo-container">
          <img src="icons/icon48.png" alt="Cleome" className="logo-app-icon" />
          <div className="logo-text">
            <h1>Cleome</h1>
            <span className="logo-badge">Bookmark Manager</span>
          </div>
        </div>

        {hasSecretBookmarks && (
          <div className="secret-indicator" title="シークレットブックマークはダッシュボード上では安全に非表示になっています">
            <ShieldAlert size={14} />
            <span>シークレット保護中</span>
          </div>
        )}
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="タイトル、説明、タグ、URLで検索... (Ctrl+Shift+Kでパレット起動)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn btn-secondary"
          onClick={onOpenImportExportModal}
          title="インポート / エクスポート"
        >
          <Download size={16} />
          <span>入出力</span>
        </button>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          <span>ブックマーク追加</span>
        </button>
      </div>
    </header>
  );
};
