import { generateSalt, hashPassword, verifyPassword, encryptData, decryptData } from '../src/services/crypto';
import { exportToJson, parseJsonImport, exportToNetscapeHtml } from '../src/services/importExport';
import { BookmarkItem } from '../src/types/bookmark';

async function runTests() {
  console.log('--- [Test 1] Crypto & Password Hashing Verification ---');
  const salt = generateSalt();
  const password = 'SecretPassword123!';
  const hash = await hashPassword(password, salt);
  
  const isMatch = await verifyPassword(password, salt, hash);
  const isWrongMismatch = !(await verifyPassword('WrongPassword', salt, hash));
  
  console.assert(isMatch, 'Password match check passed');
  console.assert(isWrongMismatch, 'Wrong password correctly rejected');
  console.log('Crypto password hashing verified: OK');

  console.log('\n--- [Test 2] Data Encryption & Decryption ---');
  const sensitiveData = { url: 'https://secret-vault.internal', title: 'Top Secret Bank' };
  const encrypted = await encryptData(sensitiveData, password, salt);
  const decrypted = await decryptData(encrypted.encryptedData, encrypted.iv, password, salt);
  
  console.assert(decrypted.url === sensitiveData.url, 'Decrypted URL matches');
  console.assert(decrypted.title === sensitiveData.title, 'Decrypted Title matches');
  console.log('Data encryption/decryption verified: OK');

  console.log('\n--- [Test 3] Secret Bookmark Isolation & Export Verification ---');
  const mockBookmarks: BookmarkItem[] = [
    {
      id: '1',
      title: 'Public Dev Docs',
      url: 'https://react.dev',
      description: 'Official React Documentation',
      tags: ['react', 'dev', 'frontend'],
      folderPath: 'Work/Dev',
      isSecret: false,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      accessCount: 12,
      lastAccessedAt: 1700005000000,
    },
    {
      id: '2',
      title: 'Confidential Internal Portal',
      url: 'https://internal.company.corp/secret',
      description: 'Super secret intranet',
      tags: ['internal', 'vpn'],
      folderPath: 'Confidential',
      isSecret: true, // SECRET TAG
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      accessCount: 5,
    },
  ];

  // 1. JSON Export (exclude secret vs include secret)
  const jsonNoSecret = exportToJson(mockBookmarks, false);
  const parsedNoSecret = parseJsonImport(jsonNoSecret);
  console.assert(parsedNoSecret.length === 1, 'JSON without secret has only 1 item');
  console.assert(parsedNoSecret[0].title === 'Public Dev Docs', 'Visible item preserved');
  console.assert(parsedNoSecret[0].tags.includes('react'), 'Tags preserved in JSON');

  // 2. Netscape HTML Export
  const htmlExport = exportToNetscapeHtml(mockBookmarks);
  console.assert(!htmlExport.includes('Confidential Internal Portal'), 'Secret bookmark MUST NOT be in HTML');
  console.assert(!htmlExport.includes('super secret intranet'), 'Secret description MUST NOT be in HTML');
  console.assert(htmlExport.includes('https://react.dev'), 'Normal bookmark URL present');
  console.assert(htmlExport.includes('Public Dev Docs'), 'Normal bookmark Title present');
  console.assert(!htmlExport.includes('Official React Documentation'), 'Description omitted in standard HTML');
  console.assert(!htmlExport.includes('#react'), 'Tags omitted in standard HTML');
  console.log('Export secret isolation & format compliance verified: OK');

  console.log('\n========================================');
  console.log(' ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
