import { PageBuilderSchema } from '../../types/builder';
import { ASTCompiler } from './compiler';
import { ThemeEngine } from '../theme/tokens';
import { CSSExtractor } from './cssExtractor';
import { AssetGraphResolver } from './assetGraph';
import { EdgeHtmlMinifier } from './minifier';
import { CriticalCssInliner } from './criticalCss';

export interface PublishedPayload {
  html: string;
  css: string;
  js: string;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  compressedOutput: string;
}

export class PublishingPipeline {
  /**
   * Compiles JSON dynamic schema structures into an ultra-fast production-ready HTML bundle
   * Utilizing AST Tree Compilation, Full CSS Extraction, Asset Graphs, Atomic CSS Deduplication,
   * Critical CSS Inlining, and Edge Minification.
   */
  public static async compile(schema: PageBuilderSchema): Promise<PublishedPayload> {
    
    // 1. Reset state
    CSSExtractor.reset();

    // 2. Resolve Asset & Dependency Graph (For preloads and font integration)
    const assetGraph = AssetGraphResolver.resolve(schema);
    const preloadTagsHtml = AssetGraphResolver.compilePreloadTags(assetGraph);

    // 3. Build AST (Abstract Syntax Tree) from JSON Schema
    const rawAstRoot = ASTCompiler.buildAST(schema);

    // 4. Extract styles recursively and replace with compiled minified class selectors
    const optimizedAstRoot = CSSExtractor.extractAndCompile(rawAstRoot);

    // 5. Render the optimized AST Node Tree into highly-semantic, clean HTML markup
    const compiledHtmlBody = ASTCompiler.renderASTToHTML(optimizedAstRoot);

    // 6. Generate extracted minified static stylesheet
    const extractedCss = CSSExtractor.generateMinifiedStylesheet();

    // 7. Generate Global Design Tokens & Responsive Media Queries
    const designTokensCss = ThemeEngine.compileThemeVariables('light');
    const mediaQueriesCss = ASTCompiler.compileResponsiveStylesheets(schema);

    // Combine CSS rules
    const rawCss = `
      ${designTokensCss}
      ${extractedCss}
      ${mediaQueriesCss}
    `;

    // 8. ATOMIC DEDUPLICATION & CRITICAL CSS INLINING (Optimization #1 & #4)
    // Minimizes final HTML payload size and speeds up Above-the-fold rendering speeds!
    const { optimizedHtml, criticalCss, deferredCss } = CriticalCssInliner.optimizeAndInline(compiledHtmlBody, rawCss);

    const compressedCriticalCss = EdgeHtmlMinifier.minifyCss(criticalCss);
    const compressedDeferredCss = EdgeHtmlMinifier.minifyCss(deferredCss);

    // 9. Core client-side javascript interactive handler
    const clientSideScript = `
      function handlePublishedAction(el) {
        try {
          const action = JSON.parse(el.getAttribute('data-action'));
          if (!action) return;
          if (action.type === 'url' && action.url) {
            window.open(action.url, action.target || '_self');
          } else if (action.type === 'scroll' && action.anchorId) {
            const dest = document.getElementById(action.anchorId);
            if (dest) dest.scrollIntoView({ behavior: 'smooth' });
          }
        } catch(e) {
          console.error('Action error', e);
        }
      }
    `.replace(/\s+/g, ' ').trim();

    // 10. Generate SEO configuration
    const seoMeta = {
      title: schema.seo.title || schema.title || 'Welcome',
      description: schema.seo.description || 'SaaS Powered Page',
      keywords: schema.seo.keywords || 'no-code, page builder',
      ogImage: schema.seo.ogImage || '',
    };

    // 11. Assemble and compress the final HTML bundle (HTML Minification)
    // Critical CSS is inlined directly in the head. Deferred CSS is injected inside a non-blocking tag.
    const rawHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${seoMeta.title}</title>
        <meta name="description" content="${seoMeta.description}">
        <meta name="keywords" content="${seoMeta.keywords}">
        <meta property="og:title" content="${seoMeta.title}">
        <meta property="og:description" content="${seoMeta.description}">
        <meta property="og:image" content="${seoMeta.ogImage}">
        ${preloadTagsHtml}
"        <!-- Tailwind CDN removed for performance and CSP compliance -->"https://cdn.tailwindcss.com"></script>
        <style id="critical-styles">${compressedCriticalCss}</style>
        ${compressedDeferredCss ? `<style id="deferred-styles" media="print" onload="this.media='all'">${compressedDeferredCss}</style>` : ''}
      </head>
      <body class="bg-white text-gray-900">
        ${optimizedHtml}
        <script>${clientSideScript}</script>
      </body>
      </html>
    `;
    
    // Apply highly optimized, sub-1ms Edge HTML minifier
    const compiledHtml = EdgeHtmlMinifier.minifyHtml(rawHtml);

    return {
      html: compiledHtmlBody,
      css: compressedCriticalCss,
      js: clientSideScript,
      seoMetadata: seoMeta,
      compressedOutput: compiledHtml,
    };
  }
}
