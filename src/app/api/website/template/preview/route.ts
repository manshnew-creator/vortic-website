import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY } from '../../../../../lib/theme/templates';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const clampText = (value: string, max = 54) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

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
  const template = TEMPLATES_REGISTRY[templateId];
  if (!template) return null;

  const theme = template.schema.theme;
  const primary = theme.primaryColor || '#6366f1';
  const secondary = theme.secondaryColor || '#ec4899';
  const background = theme.backgroundColor || '#020617';
  const text = luminance(background) > 0.52 ? '#0f172a' : '#ffffff';
  const muted = luminance(background) > 0.52 ? '#475569' : '#cbd5e1';
  const category = template.category.replace(/_/g, ' ');
  const title = clampText(template.name, 46);
  const desc = clampText(template.description, 92);
  const id = template.templateId.replace(/[^a-zA-Z0-9_-]/g, '');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title-${id} desc-${id}">
  <title id="title-${id}">${escapeXml(template.name)} template preview</title>
  <desc id="desc-${id}">${escapeXml(template.description)}</desc>
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${background}"/>
      <stop offset="0.52" stop-color="#020617"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="orb-a-${id}" cx="25%" cy="20%" r="60%">
      <stop offset="0" stop-color="${primary}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb-b-${id}" cx="82%" cy="18%" r="55%">
      <stop offset="0" stop-color="${secondary}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.055"/>
    </linearGradient>
    <filter id="blur-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
    <filter id="shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="1200" height="675" rx="48" fill="url(#bg-${id})"/>
  <rect width="1200" height="675" rx="48" fill="url(#orb-a-${id})"/>
  <rect width="1200" height="675" rx="48" fill="url(#orb-b-${id})"/>
  <circle cx="1050" cy="540" r="260" fill="${secondary}" opacity="0.13" filter="url(#blur-${id})"/>
  <circle cx="120" cy="600" r="250" fill="${primary}" opacity="0.16" filter="url(#blur-${id})"/>

  <g opacity="0.22">
    <path d="M0 130 C180 50 315 230 500 130 S830 20 1200 150" fill="none" stroke="#ffffff" stroke-width="2"/>
    <path d="M0 505 C220 420 410 620 620 500 S930 380 1200 500" fill="none" stroke="#ffffff" stroke-width="2"/>
    <path d="M80 0 L1180 675" stroke="#ffffff" stroke-width="1" opacity="0.25"/>
    <path d="M330 0 L1200 520" stroke="#ffffff" stroke-width="1" opacity="0.18"/>
  </g>

  <g filter="url(#shadow-${id})">
    <rect x="82" y="78" width="1036" height="519" rx="42" fill="url(#card-${id})" stroke="#ffffff" stroke-opacity="0.18"/>
    <rect x="112" y="108" width="976" height="459" rx="32" fill="#020617" fill-opacity="0.32" stroke="#ffffff" stroke-opacity="0.10"/>
  </g>

  <g transform="translate(150 146)">
    <rect x="0" y="0" width="220" height="42" rx="21" fill="${primary}" fill-opacity="0.20" stroke="${primary}" stroke-opacity="0.38"/>
    <text x="22" y="27" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial" font-size="15" font-weight="900" letter-spacing="2.2" fill="${text}">${escapeXml(category.toUpperCase())}</text>

    <text x="0" y="124" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial" font-size="62" font-weight="950" letter-spacing="-3.2" fill="${text}">${escapeXml(title)}</text>
    <text x="0" y="176" font-family="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial" font-size="22" font-weight="600" fill="${muted}">${escapeXml(desc)}</text>

    <g transform="translate(0 245)">
      <rect x="0" y="0" width="194" height="56" rx="18" fill="${primary}"/>
      <text x="28" y="35" font-family="Inter, ui-sans-serif, system-ui" font-size="16" font-weight="900" fill="#ffffff">Use template</text>
      <rect x="214" y="0" width="176" height="56" rx="18" fill="#ffffff" fill-opacity="0.09" stroke="#ffffff" stroke-opacity="0.18"/>
      <text x="242" y="35" font-family="Inter, ui-sans-serif, system-ui" font-size="16" font-weight="900" fill="${text}">Preview</text>
    </g>
  </g>

  <g transform="translate(760 170)">
    <rect x="0" y="0" width="270" height="320" rx="34" fill="#ffffff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.18"/>
    <rect x="26" y="28" width="218" height="40" rx="14" fill="${primary}" fill-opacity="0.9"/>
    <rect x="26" y="92" width="160" height="18" rx="9" fill="#ffffff" fill-opacity="0.7"/>
    <rect x="26" y="125" width="212" height="12" rx="6" fill="#ffffff" fill-opacity="0.25"/>
    <rect x="26" y="150" width="184" height="12" rx="6" fill="#ffffff" fill-opacity="0.20"/>
    <rect x="26" y="196" width="92" height="72" rx="20" fill="${secondary}" fill-opacity="0.55"/>
    <rect x="136" y="196" width="92" height="72" rx="20" fill="${primary}" fill-opacity="0.45"/>
  </g>

  <g transform="translate(150 540)">
    <text x="0" y="0" font-family="Inter, ui-sans-serif, system-ui" font-size="13" font-weight="900" letter-spacing="2" fill="${muted}">VORTIC.WEBSITE / VEXT™ TEMPLATE SYSTEM</text>
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
    },
  });
}
