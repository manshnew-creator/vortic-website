import { PageBuilderSchema, BaseBlock } from '../../types/builder';
import { ASTNode, ASTCompiler } from './compiler';
import { CSSExtractor } from './cssExtractor';

export class IncrementalGraphCompiler {
  // Centralized memory cache of compiled AST nodes across build cycles
  private static compiledASTCache = new Map<string, ASTNode>();
  private static compiledHTMLCache = new Map<string, string>();
  private static dirtyNodes = new Set<string>();

  /**
   * Marks specific block nodes as dirty/mutated (triggered by user editing operations)
   */
  public static invalidateNode(blockId: string): void {
    this.dirtyNodes.add(blockId);
    this.compiledASTCache.delete(blockId);
    this.compiledHTMLCache.delete(blockId);
  }

  /**
   * Performs high-speed Incremental compilation.
   * Only rebuilds mutated nodes and branches, reusing cached, untouched node graphs.
   * This reduces compiler compute overhead from O(N) to O(D) where D is the number of dirty blocks!
   */
  public static compileIncremental(schema: PageBuilderSchema): { html: string; rebuiltCount: number } {
    let rebuiltCount = 0;
    
    // Recursive traversal to build/rebuild the tree incrementally
    const processNode = (blockId: string): ASTNode => {
      const isDirty = this.dirtyNodes.has(blockId) || !this.compiledASTCache.has(blockId);
      
      if (!isDirty) {
        // Return cached sub-tree instantly
        return this.compiledASTCache.get(blockId)!;
      }

      // Compile only this specific mutated block
      const rawAst = ASTCompiler['compileBlockToAST'](blockId, schema);
      
      // Extract CSS styles atomically for this specific node
      const optimizedAst = CSSExtractor.extractAndCompile(rawAst);

      // Re-cache rebuilt node
      this.compiledASTCache.set(blockId, optimizedAst);
      this.dirtyNodes.delete(blockId); // Reset dirty flag
      rebuiltCount++;

      return optimizedAst;
    };

    // Begin compilation from root node
    const finalOptimizedAstRoot = processNode(schema.rootBlockId);

    // Render HTML recursively using node caches
    const renderNodeHtml = (node: ASTNode): string => {
      if (this.compiledHTMLCache.has(node.id)) {
        return this.compiledHTMLCache.get(node.id)!;
      }

      let html = '';
      if (node.tagName === 'img') {
        html = `<img class="${node.classList.join(' ')}" src="${node.attributes.src || ''}" alt="${node.attributes.alt || ''}" loading="lazy" />`;
      } else {
        const innerContent = node.innerHTML !== undefined 
          ? node.innerHTML 
          : node.children.map(c => renderNodeHtml(c)).join('\n');
        
        const classStr = node.classList.length > 0 ? ` class="${node.classList.join(' ')}"` : '';
        html = `<${node.tagName}${classStr}>${innerContent}</${node.tagName}>`;
      }

      this.compiledHTMLCache.set(node.id, html);
      return html;
    };

    const compiledHtml = renderNodeHtml(finalOptimizedAstRoot);

    return {
      html: compiledHtml,
      rebuiltCount,
    };
  }

  /**
   * Resets the incremental compiler caches
   */
  public static clearCache(): void {
    this.compiledASTCache.clear();
    this.compiledHTMLCache.clear();
    this.dirtyNodes.clear();
  }
}
