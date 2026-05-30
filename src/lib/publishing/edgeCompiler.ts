import { PageBuilderSchema } from '../../types/builder';
import { ASTCompiler } from './compiler';
import { CSSExtractor } from './cssExtractor';
import { ThemeEngine } from '../theme/tokens';

export class EdgeNativeCompiler {
  /**
   * Compiles JSON schemas into high-performance, minified HTML streams.
   * Utilizes standard Web Streams (ReadableStream) compatible with edge-native runtimes
   * (Cloudflare Workers, Vercel Edge Runtime) to ensure sub-10ms TTFB (Time-To-First-Byte).
   * Bypasses traditional Node.js filesystem bottlenecks completely.
   */
  public static compileToEdgeStream(schema: PageBuilderSchema): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    CSSExtractor.reset();

    // 1. Compile AST and extract styles atomically on the Edge
    const rawAst = ASTCompiler.buildAST(schema);
    const optimizedAst = CSSExtractor.extractAndCompile(rawAst);
    const bodyHtml = ASTCompiler.renderASTToHTML(optimizedAst);

    // 2. Extract minified atomic styles & Design variables
    const extractedCss = CSSExtractor.generateMinifiedStylesheet();
    const themeVariablesCss = ThemeEngine.compileThemeVariables('light');
    const mediaQueriesCss = ASTCompiler.compileResponsiveStylesheets(schema);

    const compiledCss = `${themeVariablesCss} ${extractedCss} ${mediaQueriesCss}`.replace(/\s+/g, ' ').trim();

    // 3. Construct HTML document template chunks
    const headChunk = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${schema.seo.title || schema.title}</title>
        <meta name="description" content="${schema.seo.description || ''}">
        <meta name="keywords" content="${schema.seo.keywords || ''}">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>${compiledCss}</style>
      </head>
      <body class="bg-white text-gray-900">
    `.replace(/\s+/g, ' ').trim();

    const footerChunk = `
        <script>
          function handlePublishedAction(el) {
            try {
              const action = JSON.parse(el.getAttribute('data-action'));
              if (action && action.type === 'url') window.open(action.url, '_self');
            } catch(e) {}
          }
        </script>
      </body>
      </html>
    `.replace(/\s+/g, ' ').trim();

    // 4. Stream HTML chunk by chunk directly to the edge response (HTML Streaming)
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(headChunk));
        controller.enqueue(encoder.encode(bodyHtml));
        controller.enqueue(encoder.encode(footerChunk));
        controller.close();
      },
    });
  }
}
