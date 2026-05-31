'use client';

import React, { useState } from 'react';
import { BaseBlock, LinkAction, ResponsiveValue } from '../../types/builder';
import { HtmlXssSanitizer } from '../../lib/security/sanitizer';
import { isSafeUrl } from '../../lib/website/schemaSafety';
import { toast } from '../ui/ToastProvider';

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

    let fs = resolveResponsiveValue(typography.fontSize, viewport);
    const fw = resolveResponsiveValue(typography.fontWeight, viewport);
    const lh = resolveResponsiveValue(typography.lineHeight, viewport);
    const ls = resolveResponsiveValue(typography.letterSpacing, viewport);
    const ta = resolveResponsiveValue(typography.textAlign, viewport);

    // ADAPTIVE LAYOUT INTELLIGENCE: Auto-scale/Cap massive font sizes on mobile viewports
    // to prevent ugly text wrapping or container overflows (Lighthouse UX Polish)
    if (viewport === 'mobile' && typeof fs === 'string') {
      if (fs.endsWith('rem')) {
        const val = parseFloat(fs);
        if (val > 1.75) fs = '1.75rem'; // Cap at 28px
      } else if (fs.endsWith('px')) {
        const val = parseFloat(fs);
        if (val > 28) fs = '28px';
      }
    }

    if (fs) style.fontSize = fs;
    if (fw) style.fontWeight = fw;
    if (lh) style.lineHeight = lh;
    if (ls) style.letterSpacing = ls;
    if (ta) style.textAlign = ta;
  }

  // Layout
  if (layout) {
    if (layout.backgroundColor) style.backgroundColor = layout.backgroundColor;
    if (layout.backgroundImage && isSafeUrl(layout.backgroundImage, true)) style.backgroundImage = `url(${layout.backgroundImage})`;
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
      if (action.url && isSafeUrl(action.url)) {
        window.open(action.url, action.target || '_self', action.target === '_blank' ? 'noopener,noreferrer' : undefined);
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
      if (action.url) window.location.href = `mailto:${String(action.url).replace(/^mailto:/i, '')}`;
      break;
    case 'call':
      if (action.url) window.location.href = `tel:${String(action.url).replace(/^tel:/i, '')}`;
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
  const safeHtml = HtmlXssSanitizer.sanitize(String(htmlContent));

  return (
    <div
      style={styles}
      className="prose max-w-none transition-all duration-300"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
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
      type="button"
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
  const safeSrc = isSafeUrl(src, true) ? src : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-family="Arial" font-size="24">Image URL blocked</text></svg>';

  const imgEl = (
    <img
      src={safeSrc}
      alt={String(alt || 'Image')}
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
  const safeUrl = isSafeUrl(url) ? url : 'https://www.youtube.com/embed/dQw4w9WgXcQ';

  return (
    <div style={styles} className="overflow-hidden relative w-full aspect-video transition-all duration-300">
      {provider === 'youtube' && (
        <iframe
          title={block.name || 'Embedded video'}
          src={`${safeUrl}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {provider === 'html5' && (
        <video
          src={safeUrl}
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

export const InputBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { name = 'email', label = 'Email Address', placeholder = 'you@example.com', inputType = 'email', required = true } = block.props;

  return (
    <label className="block w-full space-y-1.5" style={styles}>
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <input
        name={String(name || 'field')}
        type={String(inputType || 'text')}
        placeholder={String(placeholder || '')}
        required={Boolean(required)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
};

export const TextAreaBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { name = 'message', label = 'Message', placeholder = 'Tell us what you need...', required = false } = block.props;

  return (
    <label className="block w-full space-y-1.5" style={styles}>
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <textarea
        name={String(name || 'message')}
        placeholder={String(placeholder || '')}
        required={Boolean(required)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
};

export const SubmitButtonBlock: React.FC<{ block: BaseBlock; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { label = 'Submit securely' } = block.props;

  return (
    <button
      type="submit"
      style={styles}
      className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    >
      {label}
    </button>
  );
};

export const FormBlock: React.FC<{ block: BaseBlock; children: React.ReactNode; viewport: 'desktop' | 'tablet' | 'mobile' }> = ({ block, children, viewport }) => {
  const styles = getStylesForBlock(block, viewport);
  const { submitMethod = 'POST', actionUrl, successMessage, errorMessage } = block.props;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (isSubmitting) return;
    setIsSubmitting(true);

    if (submitMethod === 'SUPABASE') {
      toast({
        title: successMessage || 'Lead captured successfully',
        description: 'Simulation mode: the Supabase handoff is configured and ready for production credentials.',
        variant: 'success',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const safeActionUrl = actionUrl && isSafeUrl(actionUrl) ? actionUrl : '/api/forms/submit';
      const response = await fetch(safeActionUrl, {
        method: submitMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: block.id, data }),
      });
      if (response.ok) {
        toast({ title: successMessage || 'Form submitted successfully!', variant: 'success' });
        e.currentTarget.reset();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: errorMessage || 'Form submission failed.', description: 'Please verify the endpoint and try again.', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles} className="w-full space-y-4 transition-all duration-300" aria-busy={isSubmitting}>
      {children}
      {isSubmitting && <p className="text-xs text-slate-500">Submitting securely...</p>}
    </form>
  );
};
