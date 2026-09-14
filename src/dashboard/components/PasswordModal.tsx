import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { generateSalt, hashPassword } from '../../services/crypto';
import { saveSecuritySettings, getSecuritySettings } from '../../services/storage';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    if (password.length < 4) {
      setError('パスワードは4文字以上で設定してください');
      return;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const currentSettings = await getSecuritySettings();
      await saveSecuritySettings({
        ...currentSettings,
        passwordHash: hash,
        passwordSalt: salt,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('パスワードの設定中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <div className="modal-icon-badge secret">
              <Lock size={18} />
            </div>
            <h3>マスターパスワードの設定</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="password-intro">
          <ShieldCheck size={20} className="shield-icon" />
          <p>
            プライベートタグが付与されたブックマークを保護するためのパスワードを設定します。
            ダッシュボードやコマンドパレットからプライベートブックマークを閲覧・起動する際に必要となります。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label>
              <KeyRound size={14} /> 新しいパスワード
            </label>
            <input
              type="password"
              placeholder="4文字以上のパスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <KeyRound size={14} /> パスワードの確認
            </label>
            <input
              type="password"
              placeholder="再度入力してください"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary secret-btn" disabled={isSubmitting}>
              {isSubmitting ? '設定中...' : 'パスワードを設定して有効化'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
