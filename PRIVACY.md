# Privacy Policy / プライバシーポリシー

**Cleome - Bookmark Manager with Secret**  
*Last updated: September 10, 2026 / 最終更新日: 2026年9月10日*

---

## English Version

### 1. Introduction
Cleome ("the Extension", "we", "us", or "our") is a browser extension designed to help users manage, organize, and protect their web bookmarks. We are committed to protecting your privacy. This Privacy Policy explains how Cleome handles your information.

### 2. Core Principle: Zero External Data Collection
- **No External Servers**: Cleome does **NOT** operate any external servers, backend APIs, analytics services, or tracking databases.
- **No Telemetry / No Tracking**: Cleome does **NOT** track, monitor, or collect any user activity, browsing history, or personal data.
- **Local Storage Only**: All data created or managed by Cleome (bookmarks, tags, folders, access frequency, and settings) is stored exclusively on your local device using Chrome's local storage API (`chrome.storage.local`).

### 3. Types of Data Handled Locally
- **Bookmarks & Metadata**: Titles, URLs, custom tags, user notes/descriptions, folder hierarchy, and access timestamps.
- **Security Settings**: When using the Secret Bookmark feature, your master password is never stored in plain text. It is securely hashed on your device using Web Crypto API (PBKDF2 with SHA-256 and a random salt) and kept solely in local storage.
- **Access Analytics**: Access count and last-accessed dates are tracked locally solely to provide sorting and dashboard metrics within the extension.

### 4. Browser Permissions & Purpose
Cleome requests only the minimum necessary permissions to function:
- **`storage`**: Required to save and persist your bookmarks, tags, folders, and settings locally in your browser.
- **`tabs` & `activeTab`**: Used to retrieve the current webpage's title and URL when you click the extension popup to add a bookmark, and to open bookmarks or the dashboard in new browser tabs.
- **`scripting`**: Used to inject the command palette script into existing open tabs when the keyboard shortcut is triggered.
- **`<all_urls>` (Content Scripts)**: Required solely to display the command palette overlay (`Ctrl+Shift+K` / `Cmd+Shift+K`) on top of active webpages in an isolated Shadow DOM. Cleome does **NOT** read, collect, analyze, or modify any content or DOM of the websites you visit.

### 5. Third-Party Sharing and Sale of Data
Cleome does **NOT** sell, rent, monetize, transfer, or disclose any user data to any third party, advertiser, or data broker under any circumstances.

### 6. Data Retention and Deletion
- All data remains on your local browser.
- You can export your data at any time via the extension's export feature (JSON or HTML format).
- Uninstalling the Cleome extension from `chrome://extensions/` permanently deletes all associated data stored in `chrome.storage.local`.

### 7. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. Any changes will be posted within this repository and updated on the Chrome Web Store listing.

### 8. Contact
If you have any questions or feedback regarding this Privacy Policy, please open an issue in the project's repository.

---

## 日本語版

### 1. はじめに
Cleome（以下「本拡張機能」）は、ユーザーのWebブラウジングにおけるブックマーク管理・整理・保護を支援するChrome拡張機能です。本プライバシーポリシーでは、本拡張機能におけるユーザー情報の取り扱い方針について説明します。

### 2. 基本方針：外部データ収集の完全な不実施
- **外部サーバーの不使用**: 本拡張機能は、独自のバックエンドサーバー、API、アナリティクスサーバー、追跡用データベース等を一切保持・運用していません。
- **追跡・テレメトリの不実施**: ユーザーの操作ログ、閲覧履歴、個人情報等の収集・外部送信・トラッキングは一切行いません。
- **完全ローカル保存**: 本拡張機能で作成・管理されるすべてのデータ（ブックマーク、タグ、フォルダ、アクセス頻度、設定等）は、ChromeのローカルストレージAPI（`chrome.storage.local`）を通じて、お使いの端末（ブラウザ内）にのみ保存されます。

### 3. ローカルで取り扱われるデータ
- **ブックマークおよびメタデータ**: タイトル、URL、カスタムタグ、メモ・説明文、フォルダ階層、アクセス日時。
- **セキュリティ設定**: シークレットブックマーク機能を利用する際のマスターパスワードは、平文では保存されません。Web Crypto API（ランダムソルトを用いたPBKDF2 / SHA-256）によって端末ローカルで安全にハッシュ化され、ローカルストレージにのみ保持されます。
- **アクセス統計**: アクセス回数および最終アクセス日時は、拡張機能内の並び替えやダッシュボード表示機能を提供するためだけに、ローカル環境でのみ記録されます。

### 4. 要求する権限（Permissions）とその目的
本拡張機能は、機能提供に必要な最小限の権限のみを要求します：
- **`storage`**: ブックマーク、タグ、フォルダ、設定情報をブラウザ内にローカル保存・永続化するために使用します。
- **`tabs` / `activeTab`**: ポップアップからブックマークを追加する際に閲覧中のページのURL・タイトルを取得するため、およびブックマークやダッシュボードを新規タブで開くために使用します。
- **`scripting`**: ショートカットキーが押された際、インストール前から開かれていたタブに対してコマンドパレットのスクリプトを動的に注入するために使用します。
- **`<all_urls>`（Content Scripts）**: 任意のWebページ上でショートカット（`Ctrl+Shift+K` / `Cmd+Shift+K`）を押した際に、コマンドパレットをオーバーレイ表示するために使用します。独立したShadow DOM内で描画され、**閲覧中のWebページの本文、DOM情報、個人情報を読み取ったり監視したりすることは一切ありません**。

### 5. 第三者への提供およびデータの販売
本拡張機能は、ユーザーのデータを第三者、広告事業者、データブローカー等に販売、貸与、譲渡、または共有することは一切ありません。

### 6. データの保管と削除
- すべてのデータはお使いのブラウザ内にのみ保管されます。
- ユーザーは拡張機能のエクスポート機能（JSONまたはHTML形式）を利用して、いつでもデータをバックアップ・出力できます。
- Chromeの拡張機能管理画面（`chrome://extensions/`）からCleomeを削除（アンインストール）することで、保存されたすべてのローカルデータは端末から完全に削除されます。

### 7. ポリシーの変更
本プライバシーポリシーは、必要に応じて改定されることがあります。改定された場合は、本リポジトリおよびChrome Web Store掲載ページにて速やかに公表されます。

### 8. お問い合わせ
本プライバシーポリシーに関するご質問やお問い合わせは、本プロジェクトのリポジトリ（GitHub Issues等）よりご連絡ください。
