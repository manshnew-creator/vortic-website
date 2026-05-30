/**
 * Asset Optimization Engine & Responsive Image Pipeline
 * Handles AVIF/WebP responsive URL transformations, SrcSet generation, and lazy-load placeholder configurations
 */
export interface OptimizedImageConfig {
  src: string;
  alt: string;
  widths?: number[];
  sizes?: string;
}

export class AssetOptimizer {
  // Configured default CDN transforms supported by Supabase / Cloudflare Images
  private static defaultWidths = [480, 768, 1024, 1280, 1920];

  /**
   * Generates a fully-responsive srcset attribute for an image, using WebP format transformation parameters
   */
  public static generateResponsiveSrcset(src: string, widths: number[] = this.defaultWidths): string {
    // If external source and doesn't support query parameters, return fallback
    if (!src.includes('supabase.co') && !src.includes('images.unsplash.com')) {
      return `${src} 1024w`;
    }

    return widths
      .map((width) => {
        const transformedUrl = this.getTransformedImageUrl(src, { width, format: 'webp', quality: 80 });
        return `${transformedUrl} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Transforms an input image URL to WebP/AVIF format with specific compression, width, and height rules
   */
  public static getTransformedImageUrl(
    src: string,
    options: { width?: number; height?: number; format?: 'webp' | 'avif'; quality?: number }
  ): string {
    const { width, height, format = 'webp', quality = 80 } = options;

    // Case 1: Unsplash image transformations
    if (src.includes('images.unsplash.com')) {
      const url = new URL(src);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('fm', format);
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }

    // Case 2: Supabase Storage image transformations (Built-in edge resizing)
    if (src.includes('supabase.co')) {
      const isPublicUrl = src.includes('/storage/v1/object/public/');
      if (isPublicUrl) {
        // Transform public URLs using Supabase's image resizing API
        // E.g., render URL format: [project_id].supabase.co/storage/v1/render/image/public/[bucket_name]/[path]
        const renderUrl = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
        const url = new URL(renderUrl);
        if (width) url.searchParams.set('width', width.toString());
        if (height) url.searchParams.set('height', height.toString());
        url.searchParams.set('quality', quality.toString());
        // Auto convert format to webp or avif
        url.searchParams.set('format', format);
        return url.toString();
      }
    }

    return src;
  }

  /**
   * Compiles a responsive `<picture>` tag markup with multiple source formats (AVIF, WebP, fallback PNG)
   */
  public static compileResponsivePictureTag(config: OptimizedImageConfig): string {
    const { src, alt, sizes = '(max-width: 768px) 100vw, 50vw' } = config;

    const avifSrcset = this.generateResponsiveSrcset(src);
    const webpSrcset = this.generateResponsiveSrcset(src);

    return `
      <picture class="optimized-picture">
        <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
        <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
        <img src="${this.getTransformedImageUrl(src, { width: 1024 })}" alt="${alt}" loading="lazy" class="w-full h-full object-cover" />
      </picture>
    `.replace(/\s+/g, ' ').trim();
  }
}
