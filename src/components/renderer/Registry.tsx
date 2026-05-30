import React from 'react';
import { BaseBlock, LinkAction, ResponsiveValue } from '../../types/builder';

// Helper to convert responsive settings into CSS custom variables or inline styles
export const resolveResponsiveValue = <T,>(val: ResponsiveValue<T> | undefined, activeViewport: 'desktop' | 'tablet' | 'mobile'): T | undefined => {
  if (!val) return undefined;
  if (activeViewport === 'mobile' && val.mobile !== undefined) return val.mobile;
  if (activeViewport === 'tablet' && val.tablet !== undefined) return val.tablet;
  return val.desktop;
};

export const getStylesForBlock = (block: BaseBlock, viewport: 'desktop' | 'tablet' | 'mobile'): React.CSSProperties => {
  const { layout, spacing, typography, border, shadow } = block;

  const style: React.CSSProperties = {};

  // Spacing
  if (spacing) {
    const pt = resolveResponsiveValue(spacing.paddingTop, viewport);
    const pb = resolveResponsiveValue(spacing.paddingBottom, viewport);
    const pl = resolveResponsiveValue(spacing.paddingLeft, viewport);
    const pr = resolveResponsiveValue(spacing.paddingRight, viewport);
    const mt = resolveResponsiveValue(spacing.marginTop, viewport);
    const mb = resolveResponsiveValue(spacing.marginBottom, viewport);
    const ml = resolveResponsiveValue(spacing.marginLeft, viewport);
    const mr = resolveResponsiveValue(spacing.marginRight, viewport);

    if (pt) style.paddingTop = pt;
    if (pb) style.paddingBottom = pb;
    if (pl) style.paddingLeft = pl;
    if (pr) style.paddingRight = pr;
    if (mt) style.marginTop = mt;
    if (mb) style.marginBottom = mb;
    if (ml) style.marginLeft = ml;
    if (mr) style.marginRight = mr;
  }

  // Typography
  if (typography) {
    if (typography.fontFamily) style.fontFamily = typography.fontFamily;
    if (typography.color) style.color = typography.color;
    if (typography.textTransform) style.textTransform = typography.textTransform;
    if (typography.textDecoration) style.textDecoration = typography.textDecoration;

    const fs = resolveResponsiveValue(typography.fontSize, viewport);
    const fw = resolveResponsiveValue(typography.fontWeight, viewport);
    const lh = resolveResponsiveValue(typography.lineHeight, viewport);
    const ls = resolveResponsiveValue(typography.letterSpacing, viewport);
    const ta = resolveResponsiveValue(typography.textAlign, viewport);

    if (fs) style.fontSize = fs;
    if (fw) style.fontWeight = fw;
    if (lh) style.lineHeight = lh;
    if (ls) style.letterSpacing = ls;
    if (ta) style.textAlign = ta;
  }

  // Layout
  if (layout) {
    if (layout.backgroundColor) style.backgroundColor = layout.backgroundColor;
    if (layout.backgroundImage) style.backgroundImage = `url(${layout.backgroundImage})`;
    if (layout.backgroundSize) style.backgroundSize = layout.backgroundSize;
    if (layout.backgroundPosition) style.backgroundPosition = layout.backgroundPosition;
    if (layout.zIndex) style.zIndex = layout.zIndex;
    if (layout.overflow) style.overflow = layout.overflow;

    const display = resolveResponsiveValue(layout.display, viewport);
    const fdir = resolveResponsiveValue(layout.flexDirection, viewport);
    const jc = resolveResponsiveValue(layout.justifyContent, viewport);
    const ai = resolveResponsiveValue(layout.alignItems, viewport);
    const gtc = resolveResponsiveValue(layout.gridTemplateColumns, viewport);
    const gap = resolveResponsiveValue(layout.gap, viewport);
    const w = resolveResponsiveValue(layout.width, viewport);
    const h = resolveResponsiveValue(layout.height, viewport);
    const maxW = resolveResponsiveValue(layout.maxWidth, viewport);
    const minH = resolveResponsiveValue(layout.minHeight, viewport);
    const opacity = resolveResponsiveValue(layout.opacity, viewport);

    // Dynamic Absolute Constraints styles compilation
    const position = resolveResponsiveValue(layout.position, viewport);
    const left = resolveResponsiveValue(layout.left, viewport);
    const top = resolveResponsiveValue(layout.top, viewport);
    const right = resolveResponsiveValue(layout.right, viewport);
    const bottom = resolveResponsiveValue(layout.bottom, viewport);

    if (display) style.display = display;
    if (fdir) style.flexDirection = fdir;
    if (jc) style.justifyContent = jc;
    if (ai) style.alignItems = ai;
    if (gtc) style.gridTemplateColumns = gtc;
    if (gap) style.gap = gap;
    if (w) style.width = w;
    if (h) style.height = h;
    if (maxW) style.maxWidth = maxW;
    if (minH) style.minHeight = minH;
    if (opacity !== undefined) style.opacity = opacity;

    if (position) style.position = position;
    if (left) style.left = left;
    if (top) style.top = top;
    if (right) style.right = right;
    if (bottom) style.bottom = bottom;
  }

  // Border
  if (border) {
    if (border.borderStyle) style.borderStyle = border.borderStyle;
    if (border.borderColor) style.borderColor = border.borderColor;
    const bw = resolveResponsiveValue(border.borderWidth, viewport);
    const br = resolveResponsiveValue(border.borderRadius, viewport);

    if (bw) style.borderWidth = bw;
    if (br) style.borderRadius = br;
  }

  // Shadow
  if (shadow) {
    if (shadow.boxShadow) style.boxShadow = shadow.boxShadow;
    if (shadow.textShadow) style.textShadow = shadow.textShadow;
  }

  return style;
};

// Handle interactive dynamic click actions
export const handleAction = (action: LinkAction | undefined, e: React.MouseEvent) => {
  if (!action || action.type === 'none') return;
  
  e.preventDefault();
  
  switch (action.type) {
    case 'url':
      if (action.url) {
        window.open(action.url, action.target || '_self');
      }
      break;
    case 'page':
      if (action.pageId) {
        // Multi-page redirection inside builder/renderer router
        window.location.href = `/page/${action.pageId}`;
      }
      break;
    case 'scroll':
      if (action.anchorId) {
        const element = document.getElementById(action.anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      break;
    case 'email':
      window.location.href = `mailto:${action.url}`;
      break;
    case 'call':
      window.location.href = `tel:${action.url}`;
      break;
  }
};

// --- BLOCK COMPONENTS REGISTRY ---

export const SectionBlock: React.FC<{ block: BaseBlock; children: React.ReactNode; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, children, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  return (
    <section id={block.id} style={styles} className="relative w-full transition-all duration-300">
      {children}
    </section>
  );
};

export const ContainerBlock: React.FC<{ block: BaseBlock; children: React.ReactNode; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, children, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  return (
    <div id={block.id} style={styles} className="mx-auto w-full max-w-7xl transition-all duration-300">
      {children}
    </div>
  );
};

export const GridBlock: React.FC<{ block: BaseBlock; children: React.ReactNode; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, children, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  return (
    <div id={block.id} style={{ display: 'grid', ...styles }} className="w-full transition-all duration-300">
      {children}
    </div>
  );
};

export const HeadingBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { text = 'Heading Text', level = 2 } = block.props;
  const Tag = `h${level}` as any;

  return (
    <Tag style={styles} className="font-bold tracking-tight transition-all duration-300">
      {text}
    </Tag>
  );
};

export const TextBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { htmlContent = '<p>Lorem ipsum dolor sit amet...</p>' } = block.props;

  return (
    <div
      style={styles}
      className="prose max-w-none transition-all duration-300"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export const ButtonBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { label = 'Click Me', action, variant = 'primary' } = block.props;

  let btnClass = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-6 py-3 rounded-md";
  if (variant === 'primary') btnClass += " bg-blue-600 text-white hover:bg-blue-700";
  else if (variant === 'secondary') btnClass += " bg-gray-100 text-gray-900 hover:bg-gray-200";
  else if (variant === 'outline') btnClass += " border border-gray-300 bg-transparent hover:bg-gray-50";
  else if (variant === 'ghost') btnClass += " hover:bg-gray-100";
  else if (variant === 'link') btnClass += " text-blue-600 underline hover:text-blue-700";

  return (
    <button
      style={styles}
      onClick={(e) => handleAction(action, e)}
      className={`${btnClass} transition-all duration-300`}
    >
      {label}
    </button>
  );
};

export const ImageBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800', alt = 'Unsplash Graphic', action } = block.props;

  const imgEl = (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: block.props.objectFit || 'cover',
      }}
      className="transition-all duration-300"
    />
  );

  return (
    <div
      style={styles}
      onClick={(e) => action && handleAction(action, e)}
      className={`overflow-hidden transition-all duration-300 ${action ? 'cursor-pointer' : ''}`}
    >
      {imgEl}
    </div>
  );
};

export const VideoBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { provider = 'youtube', url = 'https://www.youtube.com/embed/dQw4w9WgXcQ', autoplay, loop, muted, controls = true } = block.props;

  return (
    <div style={styles} className="overflow-hidden relative w-full aspect-video transition-all duration-300">
      {provider === 'youtube' && (
        <iframe
          src={`${url}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {provider === 'html5' && (
        <video
          src={url}
          autoPlay={autoplay}
          loop={loop}
          muted={muted}
          controls={controls}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export const FormBlock: React.FC<{ block: BaseBlock; children: React.ReactNode; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, children, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { submitMethod = 'POST', actionUrl, successMessage, errorMessage } = block.props;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (submitMethod === 'SUPABASE') {
      alert(`[Simulation] Submitted to Supabase Table: ${JSON.stringify(data)}`);
    } else {
      try {
        const response = await fetch(actionUrl || '/api/forms/submit', {
          method: submitMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId: block.id, data }),
        });
        if (response.ok) {
          alert(successMessage || 'Form submitted successfully!');
        } else {
          throw new Error();
        }
      } catch {
        alert(errorMessage || 'Form submission failed.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles} className="w-full space-y-4 transition-all duration-300">
      {children}
    </form>
  );
};
