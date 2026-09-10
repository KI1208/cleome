# Chrome Web Store 掲載用テキスト・アセット作成ガイド

Google Chrome Web Store デベロッパーダッシュボードの「**ストア掲載情報（Store Listing）**」に入力するためのテキスト一式です。  
ダッシュボードの各入力欄にそのままコピー＆ペーストしてご利用いただけます。

---

## 🇯🇵 日本語（Japanese）掲載用テキスト

### 1. 拡張機能名（Name）
```text
Cleome - Bookmark Manager with Secret
```
*(45文字以内)*

### 2. 簡単な説明（Summary / Short Description）
```text
暗号化シークレット保護・コマンドパレット・アクセス分析を備えた高機能ブックマークマネージャー。外部通信ゼロで完全ローカル動作。
```
*(132文字以内)*

### 3. 詳細な説明（Detailed Description）
```text
Cleome（クレオメ）は、日常の Web ブラウジングを快適かつ安全にするための高機能なブックマークマネージャーです。
タグや説明、フォルダ階層による直感的な整理に加え、「人に見られたくない秘密のブックマーク」を完全に隠蔽・保護し、Web 閲覧中にショートカットキーから呼び出せる Raycast / Spotlight 風のコマンドパレットを備えています。

外部サーバーとの通信は一切行わず、すべてのデータはお使いのブラウザ内（ローカル）にのみ安全に保管されます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 主な機能
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🏷️ タグ・フォルダ・説明による柔軟な整理
・タグ機能: 複数タグの付与、タグクラウドからのワンクリック絞り込み。
・メモ・説明: 各ブックマークに詳細な用途やメモを記録可能。
・フォルダツリー: 階層構造による直感的なフォルダ分け。
・高速インクリメンタル検索: タイトル、URL、タグ、メモをリアルタイムで横断検索。

2. 🔒 特別なタグ「シークレット」とプライバシー保護
・完全な隠蔽: シークレットタグが付いたブックマークは、通常の一覧・タグ・検索から完全に除外されます。
・マスターパスワード保護: Web Crypto API（PBKDF2 / SHA-256）を用いた強固なローカルハッシュで保護。
・シークレットウィンドウ自動起動: シークレットブックマークを開く際は、Chrome のシークレットモード（Incognito Window）で自動的に開きます。

3. ⚡ グローバル・コマンドパレット
・どこでも即座に呼び出し: Web ページ閲覧中に [Ctrl + Shift + K]（Mac: [Cmd + Shift + K]）を押すだけで、画面中央に美しいオーバーレイパレットが起動。
・キーボード操作に完全対応: ↑ / ↓ キーでの移動、Enter でオープン、Esc でクローズ。
・パレット内シークレット解除: パスワードを入力することで、パレット上でも秘密のブックマークを瞬時に検索・起動可能。
・安心の Shadow DOM 設計: 閲覧中の Web サイトのデザインやスクリプトと一切干渉しません。

4. 📊 ダッシュボード ＆ アクセス頻度分析
・よく使うブックマーク TOP 5 や最近アクセスした項目を自動集計。
・利用傾向をグラフやメトリックカードで可視化。

5. 🔄 インポート / エクスポート
・独自 JSON 形式: メタデータ、タグ、説明、フォルダ、アクセス頻度を完全バックアップ。
・Chrome 標準 HTML 形式: 他のブラウザや Chrome 標準ブックマークとの相互移行に対応。

6. 📌 ツールバーポップアップ
・拡張機能アイコンをクリックするだけで、現在開いているタブのタイトルと URL を自動取得。ワンクリックでブックマーク保存できます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ プライバシー & セキュリティ方針
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
・完全ローカル動作: 外部サーバー、追跡トラッカー、アナリティクスは一切使用していません。
・データ非送信: ブックマーク情報、閲覧履歴、パスワードハッシュが外部に送信されることは 1 バイトもありません。
・最小権限の原則: 必要な最小限のブラウザ権限のみを要求します。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌨️ ショートカットキー一覧
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
・[Ctrl + Shift + K] (Mac: [Cmd + Shift + K]): コマンドパレットを開く / 閉じる
・[↑] / [↓]: コマンドパレット内のアイテム選択
・[Enter]: 選択したブックマークを開く
・[Esc]: コマンドパレットを閉じる

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 初回利用時の推奨設定
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
シークレットタグ付きブックマークを Chrome のシークレットウィンドウで自動起動するため、以下の設定を推奨します：
1. Chrome のアドレスバーに chrome://extensions/ を入力。
2. Cleome の「詳細」をクリック。
3.「シークレット モードでの実行を許可する」を ON にする。
```

---

## 🇺🇸 英語（English）掲載用テキスト

### 1. Extension Name
```text
Cleome - Bookmark Manager with Secret
```

### 2. Summary / Short Description
```text
Smart bookmark manager with encrypted secret bookmarks, global command palette, and local access analytics. 100% private & offline.
```
*(Within 132 characters)*

### 3. Detailed Description
```text
Cleome is a powerful, privacy-first bookmark manager designed to make your web browsing seamless, organized, and secure.
Organize bookmarks with multi-tagging, markdown notes, and folder trees. Protect your sensitive links with encrypted secret bookmarks that automatically open in Chrome Incognito windows, and jump to any link in milliseconds using the Raycast/Spotlight-style global command palette.

100% offline and local: Cleome does not use any external servers or telemetry. All your data stays strictly in your browser.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🏷️ Flexible Organization (Tags, Folders & Notes)
• Multi-Tagging: Add multiple tags and filter with a single click from the tag cloud.
• Rich Descriptions: Add personal notes and context to each bookmark.
• Folder Trees: Clean hierarchical folder structure with intuitive filtering.
• Instant Search: Real-time search across titles, URLs, tags, and notes.

2. 🔒 Encrypted Secret Bookmarks & Privacy Isolation
• Complete Isolation: Secret bookmarks are completely hidden from normal lists, tags, dashboard, and search.
• Master Password: Protected with client-side Web Crypto API (PBKDF2 with SHA-256 and cryptographic salt).
• Incognito Mode Integration: Secret links automatically open in Chrome Incognito (private) windows.

3. ⚡ Global Command Palette (Raycast / Spotlight Style)
• Anywhere Access: Press [Ctrl + Shift + K] (Mac: [Cmd + Shift + K]) on any webpage to launch the overlay palette instantly.
• Keyboard-Driven: Navigate with ↑ / ↓ arrow keys, hit Enter to open, Esc to dismiss.
• In-Palette Unlock: Unlock secret bookmarks directly from the palette by entering your master password.
• Isolated Shadow DOM: Completely isolated from the host webpage's styles and scripts.

4. 📊 Dashboard & Access Analytics
• Automatically tracks visit counts and last-accessed timestamps.
• Highlights your Top 5 most-used links, recent history, and total visit metrics.

5. 🔄 Import & Export
• Native JSON Backup: Full backup and restore including tags, notes, folders, and visit analytics.
• Standard HTML (Netscape format): Seamless migration to and from Chrome, Edge, Safari, or Firefox.

6. 📌 Quick-Save Popup
• Click the extension toolbar icon to automatically grab the current page's title and URL for instant saving.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ ZERO TELEMETRY & PRIVACY GUARANTEE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 100% Local Storage: Zero external servers, zero backend APIs, zero analytics or telemetry.
• No Data Tracking: Your browsing habits and bookmarks never leave your device.
• Least Privilege Principle: Only the strictly required browser permissions are requested.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⌨️ DEFAULT SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Ctrl + Shift + K] (Mac: [Cmd + Shift + K]): Open / Close Command Palette
• [↑] / [↓]: Navigate search results
• [Enter]: Open selected bookmark
• [Esc]: Close palette

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 RECOMMENDED SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To allow secret bookmarks to automatically launch in Incognito windows:
1. Navigate to chrome://extensions/ in your browser.
2. Click "Details" under Cleome.
3. Turn ON "Allow in Incognito".
```

---

## 🎨 スクリーンショット撮影シナリオ（推奨 5 枚）

ストア審査の通過とユーザー獲得において、スクリーンショットは極めて重要です。  
**推奨解像度: 1280 x 800 px (または 640 x 400 px) / PNG または JPEG**

| # | 画面 | 撮影内容・キャプション提案 |
|---|---|---|
| **1** | **メインダッシュボード** | メトリックカード（総ブックマーク数、アクセス数、TOP 5 ブックマーク）と最近アクセスしたリストを表示。<br>*「直感的なダッシュボードとお気に入りアクセス分析」* |
| **2** | **コマンドパレット** | 任意のWebサイト上で `Ctrl+Shift+K` を起動し、検索候補が浮かび上がっている画面。<br>*「Web閲覧中にどこでも瞬時に呼び出せるコマンドパレット」* |
| **3** | **フォルダ＆タグ整理** | サイドバーのフォルダツリー、タグ一覧、検索バーによる絞り込み画面。<br>*「タグ・階層フォルダ・キーワードによる高速リアルタイム検索」* |
| **4** | **シークレット保護** | シークレットタグ付きブックマークのパスワード認証モーダル、およびシークレットウィンドウで開く動作。<br>*「マスターパスワード保護とシークレットウィンドウ自動起動」* |
| **5** | **ツールバーポップアップ** | ブラウザ右上ポップアップから現在タブをワンクリック保存している画面。<br>*「閲覧中のページをワンクリックでタグ・フォルダ保存」* |

---

## 🏷️ その他の設定項目

- **カテゴリ（Category）**: `生産性 (Productivity)`
- **価格設定（Pricing）**: `無料 (Free)`
- **公開地域（Visibility）**: `全世界 (All regions)`
