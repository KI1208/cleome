import React, { useState, useEffect } from 'react';
import { Bookmark, LayoutDashboard, Globe, Type, Folder, Tag, AlignLeft, Lock, Check } from 'lucide-react';
import { addBookmark, isMasterPasswordSet, getAllBookmarks } from '../services/storage';
import { BookmarkItem } from '../types/bookmark';
import { PasswordModal } from '../dashboard/components/PasswordModal';

export const Popup: React.FC = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSecret, setIsSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [existingFolders, setExistingFolders] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      // Get current active tab
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          setUrl(tab.url || '');
          setTitle(tab.title || '');
        }
      }

      const pwSet = await isMasterPasswordSet();
      setIsPasswordSet(pwSet);

      const all = await getAllBookmarks();
      const folders = Array.from(new Set(all.map((b) => b.folderPath).filter(Boolean)));
      setExistingFolders(folders);
    }
    init();
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleToggleSecret = () => {
    if (!isSecret && !isPasswordSet) {
      setShowPasswordModal(true);
      return;
    }
    setIsSecret(!isSecret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    const newItem: BookmarkItem = {
      id: crypto.randomUUID(),
      url,
      title,
      description,
      tags,
      folderPath,
      isSecret,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessCount: 0,
    };

    await addBookmark(newItem);
    setIsSaved(true);

    setTimeout(() => {
      window.close();
    }, 1200);
  };

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    } else {
      window.open('/dashboard.html', '_blank');
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <div className="popup-logo">
          <img src="icons/icon48.png" alt="Cleome" className="popup-app-icon" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <h2>Cleome</h2>
        </div>
        <button className="popup-dashboard-btn" onClick={openDashboard}>
          <LayoutDashboard size={14} />
          <span>ダッシュボード</span>
        </button>
      </div>

      {isSaved ? (
        <div className="popup-success-banner">
          <Check size={18} />
          <span>ブックマークを保存しました！</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label>
              <Type size={13} /> タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Globe size={13} /> URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Folder size={13} /> フォルダ
            </label>
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="例: Work/Project (空欄でルート)"
              list="popup-folder-list"
            />
            <datalist id="popup-folder-list">
              {existingFolders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>
              <Tag size={13} /> タグ
            </label>
            <div className="tag-input-container">
              <div className="tag-chips">
                {tags.map((t) => (
                  <span key={t} className="chip">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="タグ入力後Enter"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <AlignLeft size={13} /> 説明・メモ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="メモや説明"
            />
          </div>

          {/* Secret toggle */}
          <div className={`secret-toggle-box ${isSecret ? 'active' : ''}`} style={{ padding: '8px 12px' }}>
            <div className="secret-toggle-info">
              <div className="secret-title-row">
                <Lock size={14} className="secret-lock-icon" />
                <span style={{ fontSize: '12px' }}>シークレットタグ</span>
              </div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${isSecret ? 'on' : ''}`}
              onClick={handleToggleSecret}
            >
              <span className="toggle-handle" />
            </button>
          </div>

          <div className="modal-footer" style={{ marginTop: '4px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Bookmark size={16} /> 保存する
            </button>
          </div>
        </form>
      )}

      <div className="popup-footer-tip">
        <span>ショートカット: <kbd>Ctrl+Shift+K</kbd> (Mac: <kbd>Cmd+Shift+K</kbd>) でパレット起動</span>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setIsPasswordSet(true);
          setIsSecret(true);
        }}
      />
    </div>
  );
};
