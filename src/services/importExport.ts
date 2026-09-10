import { BookmarkItem, CleomeExportData } from '../types/bookmark';

/**
 * Custom Cleome JSON Export / Import
 */

export function exportToJson(bookmarks: BookmarkItem[], includeSecrets = false): string {
  const exportItems = includeSecrets
    ? bookmarks
    : bookmarks.filter((b) => !b.isSecret);

  const payload: CleomeExportData = {
    version: 1,
    exportedAt: Date.now(),
    bookmarks: exportItems,
  };

  return JSON.stringify(payload, null, 2);
}

export function parseJsonImport(jsonString: string): BookmarkItem[] {
  const data = JSON.parse(jsonString) as CleomeExportData;
  if (!data || !Array.isArray(data.bookmarks)) {
    throw new Error('不正なCleomeエクスポートファイルです。');
  }

  return data.bookmarks.map((b) => ({
    id: b.id || crypto.randomUUID(),
    url: b.url || '',
    title: b.title || '無題のブックマーク',
    description: b.description || '',
    tags: Array.isArray(b.tags) ? b.tags : [],
    folderPath: b.folderPath || '',
    isSecret: !!b.isSecret,
    createdAt: b.createdAt || Date.now(),
    updatedAt: b.updatedAt || Date.now(),
    accessCount: b.accessCount || 0,
    lastAccessedAt: b.lastAccessedAt,
    encryptedData: b.encryptedData,
    iv: b.iv,
  }));
}

/**
 * Netscape Bookmark HTML (Chrome Standard Format) Export / Import
 */

// Escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportToNetscapeHtml(bookmarks: BookmarkItem[]): string {
  // CRITICAL: Secret bookmarks and tags/descriptions/stats MUST BE OMITTED in standard format.
  const visibleBookmarks = bookmarks.filter((b) => !b.isSecret);

  // Group bookmarks by folderPath
  // Structure: { [folderPath]: BookmarkItem[] }
  const folderMap = new Map<string, BookmarkItem[]>();
  visibleBookmarks.forEach((b) => {
    const path = (b.folderPath || '').trim();
    if (!folderMap.has(path)) {
      folderMap.set(path, []);
    }
    folderMap.get(path)!.push(b);
  });

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  // Root bookmarks (no folder)
  const rootItems = folderMap.get('') || [];
  rootItems.forEach((b) => {
    const addDate = Math.floor(b.createdAt / 1000);
    html += `    <DT><A HREF="${escapeHtml(b.url)}" ADD_DATE="${addDate}">${escapeHtml(b.title)}</A>\n`;
  });

  // Other folders
  for (const [folderPath, items] of folderMap.entries()) {
    if (!folderPath) continue;

    // Simple nesting support by splitting folderPath
    const parts = folderPath.split('/').filter(Boolean);
    let indent = '    ';
    for (const part of parts) {
      html += `${indent}<DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${escapeHtml(part)}</H3>\n`;
      html += `${indent}<DL><p>\n`;
      indent += '    ';
    }

    items.forEach((b) => {
      const addDate = Math.floor(b.createdAt / 1000);
      html += `${indent}<DT><A HREF="${escapeHtml(b.url)}" ADD_DATE="${addDate}">${escapeHtml(b.title)}</A>\n`;
    });

    for (let i = 0; i < parts.length; i++) {
      indent = indent.slice(0, -4);
      html += `${indent}</DL><p>\n`;
    }
  }

  html += `</DL><p>\n`;
  return html;
}

/**
 * Parse Netscape Bookmark HTML into Cleome bookmarks
 * Tags and descriptions are omitted as per requirements
 */
export function parseNetscapeHtmlImport(htmlString: string): BookmarkItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const results: BookmarkItem[] = [];

  function traverse(element: Element, currentFolderPath: string) {
    const children = Array.from(element.children);
    let pendingFolderName: string | null = null;

    for (const child of children) {
      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT') {
        // Look inside DT
        const h3 = child.querySelector(':scope > H3');
        const a = child.querySelector(':scope > A');
        const dl = child.querySelector(':scope > DL');

        if (h3 && dl) {
          const folderName = h3.textContent?.trim() || 'Folder';
          const newPath = currentFolderPath ? `${currentFolderPath}/${folderName}` : folderName;
          traverse(dl, newPath);
        } else if (h3) {
          pendingFolderName = h3.textContent?.trim() || 'Folder';
        } else if (a) {
          const url = a.getAttribute('HREF') || a.getAttribute('href') || '';
          const title = a.textContent?.trim() || url || 'Bookmark';
          const addDateStr = a.getAttribute('ADD_DATE') || a.getAttribute('add_date');
          const createdAt = addDateStr ? parseInt(addDateStr, 10) * 1000 : Date.now();

          if (url && !url.startsWith('javascript:')) {
            results.push({
              id: crypto.randomUUID(),
              url,
              title,
              description: '', // Omitted in standard format
              tags: [],        // Omitted in standard format
              folderPath: currentFolderPath,
              isSecret: false, // Standard format is never secret
              createdAt,
              updatedAt: createdAt,
              accessCount: 0,
            });
          }
        }
      } else if (tagName === 'DL') {
        const nextPath = pendingFolderName
          ? (currentFolderPath ? `${currentFolderPath}/${pendingFolderName}` : pendingFolderName)
          : currentFolderPath;
        pendingFolderName = null;
        traverse(child, nextPath);
      } else if (tagName === 'A') {
        const url = child.getAttribute('HREF') || child.getAttribute('href') || '';
        const title = child.textContent?.trim() || url || 'Bookmark';
        if (url && !url.startsWith('javascript:')) {
          results.push({
            id: crypto.randomUUID(),
            url,
            title,
            description: '',
            tags: [],
            folderPath: currentFolderPath,
            isSecret: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            accessCount: 0,
          });
        }
      }
    }
  }

  const rootDl = doc.querySelector('DL') || doc.body;
  if (rootDl) {
    traverse(rootDl, '');
  }

  // Fallback: If DOMParser structure was flat or non-standard, query all <A> tags
  if (results.length === 0) {
    const allLinks = doc.querySelectorAll('a');
    allLinks.forEach((a) => {
      const url = a.getAttribute('href') || '';
      if (url && !url.startsWith('javascript:')) {
        results.push({
          id: crypto.randomUUID(),
          url,
          title: a.textContent?.trim() || url,
          description: '',
          tags: [],
          folderPath: '',
          isSecret: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          accessCount: 0,
        });
      }
    });
  }

  return results;
}

// Download helper
export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
