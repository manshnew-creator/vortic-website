import { ASTNode } from './compiler';

export interface CSSRuleMap {
  [className: string]: Record<string, string>;
}

export class CSSExtractor {
  private static ruleCounter = 0;
  private static extractedRules: CSSRuleMap = {};

  /**
   * Resets the compilation rules counter for a fresh page build
   */
  public static reset() {
    this.ruleCounter = 0;
    this.extractedRules = {};
  }

  /**
   * Traverses an ASTNode recursively, extracts style properties into a unified class map,
   * replaces inline styles with atomic utility classes, and returns the modified ASTNode
   */
  public static extractAndCompile(node: ASTNode): ASTNode {
    const styleProperties = node.styles;
    
    if (styleProperties && Object.keys(styleProperties).length > 0) {
      // Create a unique, minified atomic CSS class identifier
      this.ruleCounter++;
      const compiledClassName = `c-${this.ruleCounter}`;
      
      // Store rule declarations
      this.extractedRules[compiledClassName] = { ...styleProperties };

      // Apply the generated class to the ASTNode
      node.classList.push(compiledClassName);

      // Clean inline style properties from AST node to reduce HTML payload footprint
      node.styles = {};
    }

    // Traverse recursively
    if (node.children && node.children.length > 0) {
      node.children = node.children.map((child) => this.extractAndCompile(child));
    }

    return node;
  }

  /**
   * Compiles the extracted style rules into a minified, standalone static stylesheet string
   */
  public static generateMinifiedStylesheet(): string {
    const rulesList: string[] = [];

    Object.entries(this.extractedRules).forEach(([className, declarations]) => {
      const styleStrings = Object.entries(declarations)
        .map(([prop, val]) => `${prop}:${val}`)
        .join(';');
      rulesList.push(`.${className}{${styleStrings}}`);
    });

    return rulesList.join('');
  }
}
