import { BaseBlock, BlockType, LinkAction, PageBuilderSchema } from '../../types/builder';
import { HtmlXssSanitizer } from '../security/sanitizer';

const MAX_BLOCKS_PER_PAGE = 500;
const ALLOWED_BLOCK_TYPES = new Set<BlockType>([
  'section',
  'container',
  'grid',
  'text',
  'heading',
  'button',
  'image',
  'video',
  'navbar',
  'footer',
  'form',
  'input',
  'textarea',
  'submit-button',
  'card',
  'testimonial',
  'pricing-table',
  'custom-html',
]);

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const DATA_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function isSafeUrl(url: unknown, allowDataImage = false): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (allowDataImage && DATA_IMAGE_REGEX.test(trimmed)) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;

  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeLinkAction(action: unknown): LinkAction | undefined {
  if (!action || typeof action !== 'object') return undefined;
  const next = { ...(action as LinkAction) };

  if (!['none', 'url', 'page', 'scroll', 'email', 'call'].includes(next.type)) {
    next.type = 'none';
  }

  if (next.url && !isSafeUrl(next.url)) {
    delete next.url;
  }

  if (next.target && !['_self', '_blank'].includes(next.target)) {
    next.target = '_self';
  }

  if (next.anchorId) {
    next.anchorId = String(next.anchorId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
  }

  return next;
}

function sanitizeBlock(block: BaseBlock): BaseBlock {
  const next = clone(block);

  if (!ALLOWED_BLOCK_TYPES.has(next.type)) {
    next.type = 'container';
  }

  next.id = String(next.id || '').slice(0, 120);
  next.name = HtmlXssSanitizer.encodeHtml(String(next.name || next.type)).slice(0, 120);
  next.children = Array.isArray(next.children) ? next.children.map(String).slice(0, MAX_BLOCKS_PER_PAGE) : [];
  next.props = next.props && typeof next.props === 'object' ? next.props : {};

  if (typeof next.props.htmlContent === 'string') {
    next.props.htmlContent = HtmlXssSanitizer.sanitize(next.props.htmlContent);
  }

  if (typeof next.props.customHtml === 'string') {
    next.props.customHtml = HtmlXssSanitizer.sanitize(next.props.customHtml);
  }

  if (typeof next.props.src === 'string' && !isSafeUrl(next.props.src, true)) {
    next.props.src = '';
  }

  if (typeof next.props.url === 'string' && !isSafeUrl(next.props.url)) {
    next.props.url = '';
  }

  if (next.props.action) {
    next.props.action = sanitizeLinkAction(next.props.action);
  }

  if (next.layout?.backgroundImage && !isSafeUrl(next.layout.backgroundImage, true)) {
    next.layout.backgroundImage = '';
  }

  return next;
}

export function sanitizePageSchema(schema: PageBuilderSchema): PageBuilderSchema {
  if (!schema || typeof schema !== 'object' || !schema.blocks || typeof schema.blocks !== 'object') {
    throw new Error('Invalid page schema payload.');
  }

  const blockEntries = Object.entries(schema.blocks).slice(0, MAX_BLOCKS_PER_PAGE);
  const blocks: Record<string, BaseBlock> = {};
  const knownIds = new Set(blockEntries.map(([id]) => id));

  for (const [id, block] of blockEntries) {
    const sanitized = sanitizeBlock({ ...block, id });
    sanitized.children = sanitized.children.filter((childId) => knownIds.has(childId));
    if (sanitized.parentId && !knownIds.has(sanitized.parentId)) sanitized.parentId = null;
    blocks[id] = sanitized;
  }

  const rootBlockId = knownIds.has(schema.rootBlockId) ? schema.rootBlockId : blockEntries[0]?.[0];
  if (!rootBlockId) throw new Error('Page schema must contain at least one block.');

  return {
    ...clone(schema),
    pageId: String(schema.pageId || '').slice(0, 120),
    title: HtmlXssSanitizer.encodeHtml(String(schema.title || 'Untitled Page')).slice(0, 160),
    slug: String(schema.slug || 'home').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'home',
    seo: {
      title: schema.seo?.title ? HtmlXssSanitizer.encodeHtml(schema.seo.title).slice(0, 70) : undefined,
      description: schema.seo?.description ? HtmlXssSanitizer.encodeHtml(schema.seo.description).slice(0, 170) : undefined,
      keywords: schema.seo?.keywords ? HtmlXssSanitizer.encodeHtml(schema.seo.keywords).slice(0, 220) : undefined,
      ogImage: schema.seo?.ogImage && isSafeUrl(schema.seo.ogImage, true) ? schema.seo.ogImage : undefined,
      metaTags: Array.isArray(schema.seo?.metaTags)
        ? schema.seo.metaTags.slice(0, 20).map((tag) => ({
            name: HtmlXssSanitizer.encodeHtml(String(tag.name || '')).slice(0, 60),
            content: HtmlXssSanitizer.encodeHtml(String(tag.content || '')).slice(0, 200),
          }))
        : undefined,
    },
    rootBlockId,
    blocks,
  };
}
