import { PageBuilderSchema, BaseBlock, ResponsiveValue } from '../../types/builder';

export interface ASTNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  classList: string[];
  styles: Record<string, string>;
  children: ASTNode[];
  innerHTML?: string;
}

export class ASTCompiler {
  private static themeVariables: Record<string, string> = {};

  /**
   * Compiles the JSON Page Builder Schema into an Abstract Syntax Tree (AST)
   */
  public static buildAST(schema: PageBuilderSchema): ASTNode {
    this.themeVariables = {
      '--primary-color': schema.theme.primaryColor,
      '--secondary-color': schema.theme.secondaryColor,
      '--bg-color': schema.theme.backgroundColor,
      '--text-color': schema.theme.textColor,
      '--font-heading': schema.theme.fontHeading,
      '--font-body': schema.theme.fontBody,
    };

    return this.compileBlockToAST(schema.rootBlockId, schema);
  }

  private static compileBlockToAST(blockId: string, schema: PageBuilderSchema): ASTNode {
    const block = schema.blocks[blockId];
    if (!block) {
      return { id: blockId, tagName: 'div', attributes: {}, classList: [], styles: {}, children: [] };
    }

    const node: ASTNode = {
      id: block.id,
      tagName: this.resolveTagName(block.type, block.props),
      attributes: { id: block.id },
      classList: [`block-${block.type}`],
      styles: {},
      children: [],
    };

    // Compile Layout & Sizing
    this.compileStyles(node, block);

    // Compile Attributes and Actions
    this.compileAttributesAndActions(node, block);

    // Compile children recursively
    if (block.children && block.children.length > 0) {
      node.children = block.children.map((childId) => this.compileBlockToAST(childId, schema));
    } else if (block.type === 'text' && block.props.htmlContent) {
      node.innerHTML = block.props.htmlContent;
    } else if (block.type === 'heading' && block.props.text) {
      node.innerHTML = block.props.text;
    }

    return node;
  }

  private static resolveTagName(type: string, props: any): string {
    switch (type) {
      case 'section': return 'section';
      case 'container': return 'div';
      case 'grid': return 'div';
      case 'heading': return `h${props.level || 2}`;
      case 'button': return 'button';
      case 'image': return 'img';
      case 'video': return 'div';
      case 'form': return 'form';
      default: return 'div';
    }
  }

  private static compileStyles(node: ASTNode, block: BaseBlock) {
    const styleMap = node.styles;

    // Spacing
    if (block.spacing) {
      const { paddingTop, paddingBottom, paddingLeft, paddingRight, marginTop, marginBottom } = block.spacing;
      if (paddingTop?.desktop) styleMap['padding-top'] = paddingTop.desktop;
      if (paddingBottom?.desktop) styleMap['padding-bottom'] = paddingBottom.desktop;
      if (paddingLeft?.desktop) styleMap['padding-left'] = paddingLeft.desktop;
      if (paddingRight?.desktop) styleMap['padding-right'] = paddingRight.desktop;
      if (marginTop?.desktop) styleMap['margin-top'] = marginTop.desktop;
      if (marginBottom?.desktop) styleMap['margin-bottom'] = marginBottom.desktop;
    }

    // Typography
    if (block.typography) {
      const { fontSize, fontWeight, color, textAlign, fontFamily } = block.typography;
      if (fontFamily) styleMap['font-family'] = `var(--font-body, ${fontFamily})`;
      if (color) styleMap['color'] = color;
      if (fontSize?.desktop) styleMap['font-size'] = fontSize.desktop;
      if (fontWeight?.desktop) styleMap['font-weight'] = fontWeight.desktop;
      if (textAlign?.desktop) styleMap['text-align'] = textAlign.desktop;
    }

    // Layout
    if (block.layout) {
      const { display, width, minHeight, backgroundColor, gap, gridTemplateColumns } = block.layout;
      if (display?.desktop) styleMap['display'] = display.desktop;
      if (width?.desktop) styleMap['width'] = width.desktop;
      if (minHeight?.desktop) styleMap['min-height'] = minHeight.desktop;
      if (backgroundColor) styleMap['background-color'] = backgroundColor;
      if (gap?.desktop) styleMap['gap'] = gap.desktop;
      if (gridTemplateColumns?.desktop) styleMap['grid-template-columns'] = gridTemplateColumns.desktop;
    }

    // Border
    if (block.border) {
      const { borderStyle, borderColor, borderWidth, borderRadius } = block.border;
      if (borderStyle) styleMap['border-style'] = borderStyle;
      if (borderColor) styleMap['border-color'] = borderColor;
      if (borderWidth?.desktop) styleMap['border-width'] = borderWidth.desktop;
      if (borderRadius?.desktop) styleMap['border-radius'] = borderRadius.desktop;
    }
  }

  private static compileAttributesAndActions(node: ASTNode, block: BaseBlock) {
    if (block.type === 'button') {
      node.attributes['type'] = 'button';
      if (block.props.action) {
        node.attributes['data-action'] = JSON.stringify(block.props.action);
        node.attributes['onclick'] = 'handlePublishedAction(this)';
      }
    } else if (block.type === 'image') {
      node.attributes['src'] = block.props.src || '';
      node.attributes['alt'] = block.props.alt || '';
      node.attributes['loading'] = 'lazy'; // Native lazy loading
    } else if (block.type === 'form') {
      node.attributes['method'] = block.props.submitMethod === 'POST' ? 'POST' : 'GET';
      node.attributes['data-submit-method'] = block.props.submitMethod || 'SUPABASE';
      node.attributes['data-success'] = block.props.successMessage || 'Form submitted!';
    }
  }

  /**
   * Translates the AST structure recursively into hyper-optimized, clean HTML string
   */
  public static renderASTToHTML(node: ASTNode): string {
    const classStr = node.classList.length > 0 ? ` class="${node.classList.join(' ')}"` : '';
    
    // Inline default desktop styles
    const stylesStr = Object.entries(node.styles)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
    const styleAttr = stylesStr ? ` style="${stylesStr}"` : '';

    const attrStr = Object.entries(node.attributes)
      .filter(([k]) => k !== 'class' && k !== 'style')
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const finalAttrs = `${classStr}${styleAttr}${attrStr ? ' ' + attrStr : ''}`;

    if (node.tagName === 'img') {
      return `<img${finalAttrs} />`;
    }

    const innerContent = node.innerHTML !== undefined ? node.innerHTML : node.children.map(c => this.renderASTToHTML(c)).join('\n');
    return `<${node.tagName}${finalAttrs}>${innerContent}</${node.tagName}>`;
  }

  /**
   * Generates highly-responsive scoped CSS Media Queries from responsive values in AST
   */
  public static compileResponsiveStylesheets(schema: PageBuilderSchema): string {
    let tabletRules: string[] = [];
    let mobileRules: string[] = [];

    Object.entries(schema.blocks).forEach(([id, block]) => {
      // Tablet checks
      const tabStyles: string[] = [];
      if (block.spacing?.paddingTop?.tablet) tabStyles.push(`padding-top: ${block.spacing.paddingTop.tablet};`);
      if (block.spacing?.paddingBottom?.tablet) tabStyles.push(`padding-bottom: ${block.spacing.paddingBottom.tablet};`);
      if (block.layout?.width?.tablet) tabStyles.push(`width: ${block.layout.width.tablet};`);
      if (block.typography?.fontSize?.tablet) tabStyles.push(`font-size: ${block.typography.fontSize.tablet};`);

      if (tabStyles.length > 0) {
        tabletRules.push(`#${id} { ${tabStyles.join(' ')} }`);
      }

      // Mobile checks
      const mobStyles: string[] = [];
      if (block.spacing?.paddingTop?.mobile) mobStyles.push(`padding-top: ${block.spacing.paddingTop.mobile};`);
      if (block.spacing?.paddingBottom?.mobile) mobStyles.push(`padding-bottom: ${block.spacing.paddingBottom.mobile};`);
      if (block.layout?.width?.mobile) mobStyles.push(`width: ${block.layout.width.mobile};`);
      if (block.typography?.fontSize?.mobile) mobStyles.push(`font-size: ${block.typography.fontSize.mobile};`);

      if (mobStyles.length > 0) {
        mobileRules.push(`#${id} { ${mobStyles.join(' ')} }`);
      }
    });

    const themeVariablesCss = `:root {
      ${Object.entries(this.themeVariables).map(([k, v]) => `${k}: ${v};`).join('\n')}
    }`;

    const mediaQueries = `
      ${themeVariablesCss}
      
      @media (max-width: 1024px) {
        ${tabletRules.join('\n')}
      }
      @media (max-width: 768px) {
        ${mobileRules.join('\n')}
      }
    `;

    return mediaQueries;
  }
}
