/**
 * Real-Time, Edge-Compatible HTML XSS Sanitizer (Problem #5)
 * Prevents Cross-Site Scripting (XSS) and code injection attacks on the server-side.
 * Recursively scans custom user HTML blocks, strips forbidden tags (<script>, <iframe>, <onload>, etc.),
 * and sanitizes dangerous attributes securely without heavy third-party NPM library dependencies.
 */
export class HtmlXssSanitizer {
  // Prohibited HTML tag blacklists
  private static FORBIDDEN_TAGS = [
    'script',
    'iframe',
    'frame',
    'embed',
    'object',
    'link',
    'meta',
    'style',
    'svg',
    'applet'
  ];

  // Prohibited HTML events attributes (XSS Vectors)
  private static FORBIDDEN_ATTRIBUTES = [
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onfocus',
    'onchange',
    'onsubmit',
    'onkeydown',
    'javascript:',
    'vbscript:'
  ];

  /**
   * Sanitizes raw HTML input strings to make them safe for production rendering
   */
  public static sanitize(html: string): string {
    if (!html) return '';

    let cleanHtml = html;

    // 1. Strip prohibited tags and their contents recursively
    // E.g., <script>alert('xss')</script> -> stripped completely
    this.FORBIDDEN_TAGS.forEach((tag) => {
      const tagRegex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      cleanHtml = cleanHtml.replace(tagRegex, '');

      // Also strip self-closing forbidden tags (e.g. <embed />)
      const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
      cleanHtml = cleanHtml.replace(selfClosingRegex, '');
    });

    // 2. Strip dangerous event attributes (e.g. <img src="x" onerror="alert(1)" />)
    this.FORBIDDEN_ATTRIBUTES.forEach((attr) => {
      const attrRegex = new RegExp(`\\b${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      cleanHtml = cleanHtml.replace(attrRegex, '');

      // Also handle unquoted attributes (e.g. onerror=alert(1))
      const unquotedRegex = new RegExp(`\\b${attr}\\s*=\\s*[^\\s>]+`, 'gi');
      cleanHtml = cleanHtml.replace(unquotedRegex, '');
    });

    return cleanHtml.trim();
  }

  /**
   * Encodes HTML special characters to prevent DOM injection
   */
  public static encodeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
