import React, { useState, useEffect } from 'react';
import { X, Lock, Tag, Folder, AlignLeft, Globe, Type } from 'lucide-react';
import { BookmarkItem } from '../../types/bookmark';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: BookmarkItem) => void;
  initialData?: BookmarkItem | null;
  existingFolders: string[];
  isPasswordSet: boolean;
  onRequestSetPassword: () => void;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingFolders,
  isPasswordSet,
  onRequestSetPassword,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSecret, setIsSecret] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setFolderPath(initialData.folderPath || '');
      setTags(initialData.tags || []);
      setIsSecret(!!initialData.isSecret);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setFolderPath('');
      setTags([]);
      setIsSecret(false);
    }
    setTagInput('');
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleToggleSecret = () => {
    const nextState = !isSecret;
    if (nextState && !isPasswordSet) {
      // Prompt master password creation first
      onRequestSetPassword();
      return;
    }
    setIsSecret(nextState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    const item: BookmarkItem = {
      id: initialData?.id || crypto.randomUUID(),
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
      tags,
      folderPath: folderPath.trim(),
      isSecret,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
      accessCount: initialData?.accessCount || 0,
      lastAccessedAt: initialData?.lastAccessedAt,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>{initialData ? 'ブックマーク編集' : '新規ブックマーク追加'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          {/* URL */}
          <div className="form-group">
            <label>
              <Globe size={14} /> URL <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>

          {/* Title */}
          <div className="form-group">
            <label>
              <Type size={14} /> タイトル <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="ページタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Folder */}
          <div className="form-group">
            <label>
              <Folder size={14} /> フォルダ
            </label>
            <input
              type="text"
              placeholder="例: Work/Project または 空欄でルート"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              list="folder-suggestions"
            />
            <datalist id="folder-suggestions">
              {existingFolders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>
              <Tag size={14} /> タグ
            </label>
            <div className="tag-input-container">
              <div className="tag-chips">
                {tags.map((t) => (
                  <span key={t} className="chip">
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="タグを入力してEnter (例: react, design)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              <AlignLeft size={14} /> 説明・メモ
            </label>
            <textarea
              placeholder="このブックマークについてのメモや説明"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Private Tag Toggle */}
          <div className={`secret-toggle-box ${isSecret ? 'active' : ''}`}>
            <div className="secret-toggle-info">
              <div className="secret-title-row">
                <Lock size={16} className="secret-lock-icon" />
                <strong>特別なタグ: プライベート</strong>
                {isSecret && <span className="secret-badge">プライベート有効</span>}
              </div>
              <p className="secret-desc">
                プライベートタグを付与すると、保護中はダッシュボードや通常フォルダから完全に非表示になります。
                閲覧・起動にはダッシュボードまたはコマンドパレットからパスワード認証が必要になります。
              </p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${isSecret ? 'on' : ''}`}
              onClick={handleToggleSecret}
              aria-label="プライベートタグの切り替え"
            >
              <span className="toggle-handle" />
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? '更新する' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
