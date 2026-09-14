import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { verifyPassword } from '../../services/crypto';
import { getSecuritySettings } from '../../services/storage';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const settings = await getSecuritySettings();
      if (!settings.passwordHash || !settings.passwordSalt) {
        setError('マスターパスワードが設定されていません');
        return;
      }

      const isValid = await verifyPassword(password, settings.passwordSalt, settings.passwordHash);
      if (isValid) {
        setPassword('');
        setError('');
        onSuccess();
        onClose();
      } else {
        setError('パスワードが正しくありません');
      }
    } catch (err) {
      console.error(err);
      setError('認証中にエラーが発生しました');
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
            <h3>プライベートの解除</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="password-intro">
          <ShieldAlert size={20} className="shield-icon" />
          <p>
            保護されたプライベートブックマークを表示するには、設定されたマスターパスワードを入力してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label>
              <KeyRound size={14} /> マスターパスワード
            </label>
            <input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary secret-btn" disabled={isSubmitting}>
              {isSubmitting ? '認証中...' : '解除する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
