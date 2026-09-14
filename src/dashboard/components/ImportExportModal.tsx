import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileText, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { BookmarkItem } from '../../types/bookmark';
import {
  exportToJson,
  exportToNetscapeHtml,
  parseJsonImport,
  parseNetscapeHtmlImport,
  downloadFile,
} from '../../services/importExport';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[]; // All visible bookmarks
  onImportSuccess: (newBookmarks: BookmarkItem[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export handlers
  const handleExportJson = () => {
    try {
      const json = exportToJson(bookmarks, false);
      const filename = `cleome-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
      downloadFile(filename, json, 'application/json');
      setMessage({ type: 'success', text: 'Cleome独自形式 (JSON) でエクスポートしました' });
    } catch (err) {
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
    }
  };

  const handleExportHtml = () => {
    try {
      const html = exportToNetscapeHtml(bookmarks);
      const filename = `bookmarks_${new Date().toISOString().slice(0, 10)}.html`;
      downloadFile(filename, html, 'text/html');
      setMessage({
        type: 'success',
        text: 'Chrome標準形式 (HTML) でエクスポートしました (タグ・説明・プライベート情報はオミットされています)',
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
    }
  };

  // Import handler
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let imported: BookmarkItem[] = [];

      if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
        imported = parseJsonImport(text);
        setMessage({
          type: 'success',
          text: `独自形式ファイルから ${imported.length} 件のブックマークを読み込みました`,
        });
      } else {
        imported = parseNetscapeHtmlImport(text);
        setMessage({
          type: 'success',
          text: `Chrome標準形式 (HTML) から ${imported.length} 件のブックマークを読み込みました (タグ・説明は初期空)`,
        });
      }

      onImportSuccess(imported);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'ファイルの解析に失敗しました。対応形式（.json または .html）を確認してください。',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container io-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <h3>ブックマークの入出力 (インポート / エクスポート)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('export');
              setMessage(null);
            }}
          >
            <Download size={16} /> エクスポート (書き出し)
          </button>
          <button
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('import');
              setMessage(null);
            }}
          >
            <Upload size={16} /> インポート (読み込み)
          </button>
        </div>

        {message && (
          <div className={`io-message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="modal-body-content">
          {activeTab === 'export' ? (
            <div className="export-options">
              {/* Custom JSON */}
              <div className="io-card">
                <div className="io-card-icon json">
                  <FileCode size={24} />
                </div>
                <div className="io-card-details">
                  <h4>Cleome 独自形式 (.json)</h4>
                  <p>
                    タグ、説明、フォルダ階層、アクセス履歴など、Cleome内の全メタデータを完全にバックアップします。
                  </p>
                  <button className="btn btn-primary" onClick={handleExportJson}>
                    <Download size={16} /> JSONで書き出す
                  </button>
                </div>
              </div>

              {/* Standard HTML */}
              <div className="io-card">
                <div className="io-card-icon html">
                  <FileText size={24} />
                </div>
                <div className="io-card-details">
                  <h4>Chrome 標準形式 (.html)</h4>
                  <p>
                    Chrome、Firefox、Safari等にそのまま取り込めるNetscape形式です。
                    要件に基づき、タグ・説明・プライベート情報はオミットされます。
                  </p>
                  <button className="btn btn-secondary" onClick={handleExportHtml}>
                    <Download size={16} /> HTMLで書き出す
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="import-area">
              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={36} className="drop-icon" />
                <h4>ファイルを選択してインポート</h4>
                <p>
                  Cleome独自形式 (.json) または Chrome標準形式 (.html) のブックマークファイルを選択してください。
                </p>
                <button type="button" className="btn btn-secondary">
                  ファイルを選択
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.html,.htm"
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
              </div>

              <div className="import-notes">
                <h5>インポートの仕様:</h5>
                <ul>
                  <li><strong>独自形式 (.json):</strong> タグや説明を含むすべてのメタデータが復元されます。</li>
                  <li><strong>Chrome標準形式 (.html):</strong> フォルダ構造とURL・タイトルをインポートし、タグや説明は初期状態で空となります。</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
