import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Returns a 32-byte Buffer key derived from environment secrets.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.GITHUB_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY or JWT_SECRET must be configured in production');
    }
    // Safe deterministic development key
    return crypto.createHash('sha256').update('devhub-local-dev-encryption-key-fallback').digest();
  }
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string (e.g. GitHub OAuth access token) using AES-256-GCM.
 * Output format: `ivHex:tagHex:encryptedHex`
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token string.
 * If the string does not match the `iv:tag:cipher` format (e.g. legacy plaintext token),
 * it returns the input as-is for backward compatibility.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return '';

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Might be an unencrypted legacy token (e.g. starts with gho_ or ghp_)
    return encryptedText;
  }

  const [ivHex, tagHex, contentHex] = parts;
  if (ivHex.length !== IV_LENGTH * 2 || tagHex.length !== TAG_LENGTH * 2) {
    // Malformed format, fallback to raw string
    return encryptedText;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(contentHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('[CRYPTO] Failed to decrypt token:', err);
    throw new Error('Failed to decrypt stored credentials');
  }
}
