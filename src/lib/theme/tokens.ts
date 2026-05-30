/**
 * No-Code Design Token System (Theme Engine)
 * Implements standard design token scales for Spacing, Typography scales, and Color Palettes
 * (Similar to Tailwind CSS configuration tokens)
 */

export interface ColorToken {
  name: string;
  value: string; // hex, rgb, or css variable
}

export interface DesignTokens {
  spacingScale: Record<string, string>; // e.g., '1': '0.25rem', '2': '0.5rem', ...
  typographySizes: Record<string, { fontSize: string; lineHeight: string }>; // e.g., 'sm', 'base', 'lg', 'xl', ...
  fontFamilies: Record<string, string>;
  borderRadiusScale: Record<string, string>;
  defaultThemes: Record<string, Record<string, string>>;
}

export const SAAS_DESIGN_TOKENS: DesignTokens = {
  // Spacing Scale: Matches Tailwind spacing exactly (Rem-based)
  spacingScale: {
    '0': '0px',
    '1': '0.25rem',  // 4px
    '2': '0.5rem',   // 8px
    '3': '0.75rem',  // 12px
    '4': '1rem',     // 16px
    '6': '1.5rem',   // 24px
    '8': '2rem',     // 32px
    '12': '3rem',    // 48px
    '16': '4rem',    // 64px
    '20': '5rem',    // 80px
    '24': '6rem',    // 96px
  },

  // Typography Scale: Uses a perfect Major Third (1.250) typographic ratio scale
  typographySizes: {
    'xs': { fontSize: '0.75rem', lineHeight: '1rem' },
    'sm': { fontSize: '0.875rem', lineHeight: '1.25rem' },
    'base': { fontSize: '1rem', lineHeight: '1.5rem' },
    'lg': { fontSize: '1.25rem', lineHeight: '1.75rem' },
    'xl': { fontSize: '1.563rem', lineHeight: '2rem' },
    '2xl': { fontSize: '1.953rem', lineHeight: '2.25rem' },
    '3xl': { fontSize: '2.441rem', lineHeight: '2.5rem' },
    '4xl': { fontSize: '3.052rem', lineHeight: '3rem' },
    '5xl': { fontSize: '3.815rem', lineHeight: '3.5rem' },
  },

  fontFamilies: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Playfair Display, Georgia, serif',
    mono: 'Fira Code, JetBrains Mono, monospace',
  },

  borderRadiusScale: {
    none: '0px',
    sm: '0.125rem',  // 2px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },

  // Global presets available to users
  defaultThemes: {
    light: {
      '--primary': '#2563eb', // Blue 600
      '--secondary': '#4b5563', // Gray 600
      '--background': '#ffffff',
      '--text': '#111827',
      '--border': '#e5e7eb',
    },
    dark: {
      '--primary': '#3b82f6', // Blue 500
      '--secondary': '#9ca3af', // Gray 400
      '--background': '#0f172a', // Slate 900
      '--text': '#f9fafb',
      '--border': '#1e293b',
    },
    emerald: {
      '--primary': '#059669', // Emerald 600
      '--secondary': '#4b5563',
      '--background': '#f0fdf4', // Emerald 50
      '--text': '#064e3b',
      '--border': '#d1fae5',
    }
  }
};

export class ThemeEngine {
  /**
   * Generates variables for CSS custom properties (variables) to inject globally in page header
   */
  public static compileThemeVariables(themeName: keyof typeof SAAS_DESIGN_TOKENS.defaultThemes): string {
    const theme = SAAS_DESIGN_TOKENS.defaultThemes[themeName] || SAAS_DESIGN_TOKENS.defaultThemes.light;
    
    const cssRules = Object.entries(theme)
      .map(([variable, value]) => `${variable}: ${value};`)
      .join('\n');

    return `
      :root {
        ${cssRules}
        --font-sans: ${SAAS_DESIGN_TOKENS.fontFamilies.sans};
        --font-serif: ${SAAS_DESIGN_TOKENS.fontFamilies.serif};
        --font-mono: ${SAAS_DESIGN_TOKENS.fontFamilies.mono};
      }
    `;
  }
}
