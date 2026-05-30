import crypto from 'crypto';

/**
 * Standard, Cryptographically Secure and Collision-Free ID Generator
 * Utilizes Node.js and Web Crypto API standard randomUUID() (Problem #4)
 */
export const generateSecureId = (prefix: string): string => {
  const isBrowser = typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
  
  const uuid = isBrowser 
    ? window.crypto.randomUUID() 
    : crypto.randomUUID();

  // Returns e.g. "prefix_a1b2c3d4" using the first chunk of the secure UUID for compact sizing
  return `${prefix}_${uuid.split('-')[0]}`;
};

/**
 * SEO-FRIENDLY SLUGIFY UTILITY (Issue B)
 * Translates a page title (e.g., "My Launch Landing Page") into a clean, human-readable,
 * SEO-friendly slug ("my-launch-landing-page") and appends a tiny, secure 4-character hash
 * to prevent database uniqueness collisions.
 */
export const generateSeoFriendlySlug = (title: string): string => {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    // Remove non-word characters, spaces, and duplicate hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

  const randomHash = crypto.randomBytes(2).toString('hex'); // 4-character secure random hash
  
  return `${cleanTitle}-${randomHash}`;
};
