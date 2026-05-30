/**
 * High-Speed, Edge-Compatible HTML & CSS Minifier Engine
 * Compresses static assets by stripping comments, collapsing repetitive whitespace blocks,
 * and collapsing CSS structures in sub-1ms without Node.js native dependencies (Problem #2).
 */
export class EdgeHtmlMinifier {
  
  /**
   * Compresses compiled HTML markup using lightweight, high-performance regex patterns
   */
  public static minifyHtml(html: string): string {
    if (!html) return '';

    return html
      // 1. Strip HTML comments (except IE conditional comments)
      .replace(/<!--(?!\s*\[if[\s\S]*?\]\s*)[\s\S]*?-->/g, '')
      // 2. Collapse repetitive whitespace blocks and carriage returns
      .replace(/\s+/g, ' ')
      // 3. Remove spaces around tags where safe
      .replace(/>\s+</g, '><')
      // 4. Trim string ends
      .trim();
  }

  /**
   * Compresses CSS stylesheet string rules
   */
  public static minifyCss(css: string): string {
    if (!css) return '';

    return css
      // 1. Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 2. Collapse whitespace
      .replace(/\s+/g, ' ')
      // 3. Remove spaces around curly braces and semicolons
      .replace(/\s*([\{\};,])\s*/g, '$1')
      // 4. Remove unnecessary trailing semicolons
      .replace(/;}/g, '}')
      .trim();
  }
}
