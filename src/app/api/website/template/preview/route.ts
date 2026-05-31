import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY } from '../../../../../lib/theme/templates';
import { BaseBlock, PageBuilderSchema } from '../../../../../types/builder';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const clampText = (value: string, max = 58) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

function getTemplate(templateId: string) {
  return TEMPLATES_REGISTRY[templateId] || Object.values(TEMPLATES_REGISTRY).find((template) => template.templateId === templateId);
}

function firstBlock(schema: PageBuilderSchema, predicate: (block: BaseBlock) => boolean) {
  return Object.values(schema.blocks).find(predicate);
}

function textFromBlock(block?: BaseBlock) {
  if (!block) return '';
  if (typeof block.props.text === 'string') return block.props.text;
  if (typeof block.props.htmlContent === 'string') return stripHtml(block.props.htmlContent);
  if (typeof block.props.label === 'string') return block.props.label;
  return block.name || '';
}

function collectCardTitles(schema: PageBuilderSchema) {
  const headings = Object.values(schema.blocks)
    .filter((block) => block.type === 'heading' && block.props?.level !== 1)
    .map((block) => textFromBlock(block))
    .filter(Boolean)
    .slice(0, 3);

  if (headings.length >= 3) return headings;
  return [...headings, 'Proof-driven layout', 'Conversion sections', 'Lead capture'].slice(0, 3);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized.padEnd(6, '0').slice(0, 6);

  return {
    r: parseInt(safe.slice(0, 2), 16) || 99,
    g: parseInt(safe.slice(2, 4), 16) || 102,
    b: parseInt(safe.slice(4, 6), 16) || 241,
  };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function createSvg(templateId: string) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const schema = template.schema;
  const theme = schema.theme;
  const primary = theme.primaryColor || '#6366f1';
  const secondary = theme.secondaryColor || '#ec4899';
  const background = theme.backgroundColor || '#020617';
  const isLight = luminance(background) > 0.56;
  const pageBg = isLight ? '#f8fafc' : background;
  const cardBg = isLight ? '#ffffff' : '#0f172a';
  const text = isLight ? '#0f172a' : '#ffffff';
  const muted = isLight ? '#475569' : '#cbd5e1';
  const border = isLight ? '#e2e8f0' : '#1e293b';
  const category = template.category.replace(/_/g, ' ');
  const heroHeading = clampText(textFromBlock(firstBlock(schema, (block) => block.type === 'heading' && (block.props?.level === 1 || block.id.toLowerCase().includes('hero')))) || template.name, 48);
  const heroText = clampText(textFromBlock(firstBlock(schema, (block) => block.type === 'text' && Boolean(block.parentId?.toLowerCase().includes('hero')))) || template.description, 96);
  const cta = clampText(textFromBlock(firstBlock(schema, (block) => block.type === 'button' || block.type === 'submit-button')) || 'Use template', 24);
  const cards = collectCardTitles(schema).map((item) => clampText(item, 26));
  const safeId = template.templateId.replace(/[^a-zA-Z0-9_-]/g, '');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title-${safeId} desc-${safeId}">
  <title id="title-${safeId}">${escapeXml(template.name)} real template preview</title>
  <desc id="desc-${safeId}">${escapeXml(template.description)}</desc>
  <defs>
    <linearGradient id="shell-${safeId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617"/>
      <stop offset="0.55" stop-color="#0f1029"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="accent-${safeId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
    <radialGradient id="glowA-${safeId}" cx="18%" cy="10%" r="64%">
      <stop offset="0" stop-color="${primary}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB-${safeId}" cx="88%" cy="20%" r="58%">
      <stop offset="0" stop-color="${secondary}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow-${safeId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="30" stdDeviation="26" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
    <clipPath id="clip-${safeId}">
      <rect x="82" y="70" width="1036" height="535" rx="44"/>
    </clipPath>
  </defs>

  <rect width="1200" height="675" rx="48" fill="url(#shell-${safeId})"/>
  <rect width="1200" height="675" rx="48" fill="url(#glowA-${safeId})"/>
  <rect width="1200" height="675" rx="48" fill="url(#glowB-${safeId})"/>

  <g filter="url(#shadow-${safeId})">
    <rect x="82" y="70" width="1036" height="535" rx="44" fill="#0b1020" stroke="#ffffff" stroke-opacity="0.16"/>
  </g>

  <g clip-path="url(#clip-${safeId})">
    <rect x="82" y="70" width="1036" height="535" rx="44" fill="${pageBg}"/>
    <circle cx="970" cy="130" r="240" fill="${primary}" opacity="0.12"/>
    <circle cx="180" cy="560" r="260" fill="${secondary}" opacity="0.10"/>

    <g transform="translate(122 104)">
      <rect x="0" y="0" width="956" height="58" rx="22" fill="${cardBg}" opacity="0.94" stroke="${border}"/>
      <circle cx="32" cy="29" r="13" fill="url(#accent-${safeId})"/>
      <text x="58" y="36" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="18" font-weight="950" fill="${text}">${escapeXml(template.name)}</text>
      <rect x="760" y="15" width="154" height="30" rx="15" fill="${primary}" opacity="0.16"/>
      <text x="788" y="35" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="12" font-weight="900" letter-spacing="1.4" fill="${primary}">${escapeXml(category.toUpperCase())}</text>
    </g>

    <g transform="translate(150 215)">
      <rect x="0" y="0" width="205" height="36" rx="18" fill="${primary}" fill-opacity="0.14" stroke="${primary}" stroke-opacity="0.28"/>
      <text x="20" y="24" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="13" font-weight="950" letter-spacing="2" fill="${primary}">${escapeXml(category.toUpperCase())}</text>
      <text x="0" y="104" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="48" font-weight="950" letter-spacing="-2.4" fill="${text}">${escapeXml(heroHeading)}</text>
      <text x="0" y="150" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="18" font-weight="600" fill="${muted}">${escapeXml(heroText)}</text>
      <rect x="0" y="190" width="178" height="50" rx="18" fill="url(#accent-${safeId})"/>
      <text x="28" y="222" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="15" font-weight="950" fill="#ffffff">${escapeXml(cta)}</text>
    </g>

    <g transform="translate(770 215)">
      <rect x="0" y="0" width="268" height="300" rx="34" fill="${cardBg}" opacity="0.96" stroke="${border}"/>
      <rect x="28" y="28" width="212" height="36" rx="13" fill="url(#accent-${safeId})" opacity="0.92"/>
      <rect x="28" y="88" width="160" height="16" rx="8" fill="${text}" opacity="0.82"/>
      <rect x="28" y="118" width="210" height="10" rx="5" fill="${muted}" opacity="0.35"/>
      <rect x="28" y="140" width="180" height="10" rx="5" fill="${muted}" opacity="0.28"/>
      <rect x="28" y="184" width="92" height="70" rx="18" fill="${primary}" opacity="0.22"/>
      <rect x="142" y="184" width="92" height="70" rx="18" fill="${secondary}" opacity="0.22"/>
    </g>

    <g transform="translate(150 530)">
      ${cards.map((card, index) => `
      <g transform="translate(${index * 215} 0)">
        <rect x="0" y="0" width="188" height="72" rx="22" fill="${cardBg}" opacity="0.94" stroke="${border}"/>
        <circle cx="28" cy="36" r="10" fill="${index === 0 ? primary : index === 1 ? secondary : '#22d3ee'}"/>
        <text x="48" y="32" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="13" font-weight="900" fill="${text}">${escapeXml(card)}</text>
        <rect x="48" y="44" width="95" height="7" rx="3.5" fill="${muted}" opacity="0.30"/>
      </g>`).join('')}
    </g>
  </g>

  <g transform="translate(82 632)">
    <text x="0" y="0" font-family="Inter, ui-sans-serif, system-ui, Arial" font-size="13" font-weight="950" letter-spacing="2.4" fill="#cbd5e1" opacity="0.72">VORTIC.WEBSITE / REAL SCHEMA PREVIEW</text>
  </g>
</svg>`.trim();
}

export async function GET(req: NextRequest) {
  const templateId = req.nextUrl.searchParams.get('templateId') || 'saas_lander';
  const svg = createSvg(templateId);

  if (!svg) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
      'Content-Disposition': 'inline',
    },
  });
}
