import { PageBuilderSchema } from '../../types/builder';
import { generateSecureId } from '../security/uuid';

export interface AssetDependency {
  id: string;
  type: 'image' | 'font' | 'global-block' | 'script-embed';
  url: string;
  mimeType?: string;
  preload: boolean;
}

export interface ResolvedAssetGraph {
  dependencies: Record<string, AssetDependency>;
  referencedGlobalBlockIds: string[];
  requiredGoogleFonts: string[];
}

export class AssetGraphResolver {
  private static requiredGoogleFonts = new Set<string>();

  /**
   * Scans the entire Page Builder JSON Schema, identifies, maps, and prunes unused assets.
   * Generates a structural dependency graph used by the compiler to perform Dead Code Elimination (DCE)
   * and inject high-performance preloads (<link rel="preload">) into the HTML head.
   */
  public static resolve(schema: PageBuilderSchema): ResolvedAssetGraph {
    const dependencies: Record<string, AssetDependency> = {};
    const referencedGlobalBlockIds: string[] = [];
    const requiredGoogleFonts = new Set<string>();

    // 1. Inspect and extract global fonts configured in the theme
    if (schema.theme.fontHeading) requiredGoogleFonts.add(schema.theme.fontHeading);
    if (schema.theme.fontBody) requiredGoogleFonts.add(schema.theme.fontBody);

    // 2. Walk the block tree recursively to analyze block-level dependencies
    Object.entries(schema.blocks).forEach(([id, block]) => {
      
      // A. Extract Custom Fonts declared inside block level typographies
      if (block.typography?.fontFamily) {
        requiredGoogleFonts.add(block.typography.fontFamily);
      }

      // B. Extract Image dependencies & configure preloading for above-the-fold assets
      if (block.type === 'image' && block.props.src) {
        const isHeroAsset = block.parentId === 'hero_container' || id === 'hero_image';
        
        // Use cryptographically secure ID generation
        const secureAssetId = generateSecureId('img');
        
        dependencies[block.props.src] = {
          id: secureAssetId,
          type: 'image',
          url: block.props.src,
          preload: isHeroAsset, // Flag for instant preloading
        };
      }

      // C. Trace dynamic reference to Global reusable blocks (Symbols / Global Components)
      if (block.type === 'custom-html' && block.props.globalBlockId) {
        referencedGlobalBlockIds.push(block.props.globalBlockId);
        dependencies[block.props.globalBlockId] = {
          id: block.props.globalBlockId,
          type: 'global-block',
          url: `/api/global-blocks/${block.props.globalBlockId}`,
          preload: true,
        };
      }

      // D. Trace custom script embeds requiring secure sandbox execution
      if (block.type === 'custom-html' && block.props.htmlContent) {
        const containsScripts = /<script\b[^>]*>([\s\S]*?)<\/script>/gi.test(block.props.htmlContent);
        if (containsScripts) {
          dependencies[block.id] = {
            id: block.id,
            type: 'script-embed',
            url: 'sandbox-runtime-isolated',
            preload: false,
          };
        }
      }
    });

    return {
      dependencies,
      referencedGlobalBlockIds,
      requiredGoogleFonts: Array.from(requiredGoogleFonts),
    };
  }

  /**
   * Compiles highly-optimized <link rel="preload"> or preconnect tags from the generated Asset Graph
   */
  public static compilePreloadTags(graph: ResolvedAssetGraph): string {
    const tags: string[] = [];

    // Preload critical above-the-fold images
    Object.values(graph.dependencies)
      .filter((dep) => dep.type === 'image' && dep.preload)
      .forEach((dep) => {
        tags.push(`<link rel="preload" href="${dep.url}" as="image">`);
      });

    // Preconnect to Google Fonts API if fonts are declared
    if (graph.requiredGoogleFonts.length > 0) {
      tags.push('<link rel="preconnect" href="https://fonts.googleapis.com">');
      tags.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
      
      const fontQueryString = graph.requiredGoogleFonts
        .map((f) => `family=${f.replace(/\s+/g, '+')}:wght@400;600;700;800`)
        .join('&');
      tags.push(`<link href="https://fonts.googleapis.com/css2?${fontQueryString}&display=swap" rel="stylesheet">`);
    }

    return tags.join('\n');
  }
}
