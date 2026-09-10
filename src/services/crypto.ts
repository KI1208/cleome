/**
 * Web Crypto API based security module for Cleome
 * Handles PBKDF2 key derivation, master password hashing, and AES-GCM encryption/decryption
 */

// Helper: Uint8Array <-> Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate random salt (16 bytes)
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt);
}

// Derive a CryptoKey using PBKDF2
async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  const salt = base64ToBuffer(saltBase64);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Compute password verification hash
export async function hashPassword(password: string, saltBase64: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const salt = base64ToBuffer(saltBase64);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256
  );

  return bufferToBase64(bits);
}

export async function verifyPassword(
  password: string,
  saltBase64: string,
  expectedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, saltBase64);
  return hash === expectedHash;
}

// Encrypt payload object into base64 string + iv
export async function encryptData(
  data: Record<string, unknown>,
  password: string,
  saltBase64: string
): Promise<{ encryptedData: string; iv: string }> {
  const key = await deriveKey(password, saltBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData
  );

  return {
    encryptedData: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
  };
}

// Decrypt base64 string back into object
export async function decryptData<T = Record<string, unknown>>(
  encryptedData: string,
  ivBase64: string,
  password: string,
  saltBase64: string
): Promise<T> {
  const key = await deriveKey(password, saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const cipherBytes = base64ToBuffer(encryptedData);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer,
    },
    key,
    cipherBytes.buffer as ArrayBuffer
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}
