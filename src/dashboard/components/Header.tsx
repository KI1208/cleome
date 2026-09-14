import React from 'react';
import { Search, Plus, Download, ShieldAlert, Unlock } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenImportExportModal: () => void;
  hasSecretBookmarks: boolean;
  isPrivateUnlocked: boolean;
  onTogglePrivateLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportExportModal,
  hasSecretBookmarks,
  isPrivateUnlocked,
  onTogglePrivateLock,
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

        {(hasSecretBookmarks || isPrivateUnlocked) && (
          <button
            type="button"
            className={`secret-indicator clickable ${isPrivateUnlocked ? 'unlocked' : ''}`}
            onClick={onTogglePrivateLock}
            title={
              isPrivateUnlocked
                ? 'クリックしてプライベートブックマークを再ロック'
                : 'クリックしてパスワードを入力し、プライベートブックマークを解除'
            }
          >
            {isPrivateUnlocked ? (
              <>
                <Unlock size={14} />
                <span>プライベート解除中</span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} />
                <span>プライベート保護中</span>
              </>
            )}
          </button>
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
