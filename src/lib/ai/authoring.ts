import { PageBuilderSchema, BlockType, BaseBlock } from '../../types/builder';
import { generateSecureId } from '../security/uuid';
import { TEMPLATES_REGISTRY } from '../theme/templates';

export interface AuthoringSuggestion {
  type: 'SEO_OPTIMIZATION' | 'LAYOUT_STRUCTURE' | 'A11Y_CONTRAST' | 'UX_IMPROVEMENT';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  blockId?: string;
  title: string;
  message: string;
  suggestedActionPatch?: Record<string, any>; // Automated corrective payload
}

export interface SmartLayoutPreset {
  category: string;
  recommendedBlockTypes: BlockType[];
  suggestedSectionStructure: string[];
}

export interface AIWorkflowResult {
  success: boolean;
  selectedTemplateId: string;
  autocorrectedPrompt: string;
  schema: PageBuilderSchema;
  warning?: string;
}

export class AIAuthoringEngine {
  
  // Standard target keyword dictionary for spellchecking and autocorrection
  private static AUTOCORRECT_DICTIONARY: Record<string, string> = {
    'dental': 'dental', 'clinic': 'clinic', 'medical': 'medical', 'doctor': 'doctor',
    'estate': 'estate', 'villa': 'villa', 'apartment': 'apartment', 'luxury': 'luxury',
    'premium': 'premium', 'saas': 'saas', 'product': 'product', 'software': 'software',
    'startup': 'startup', 'organic': 'organic', 'green': 'green', 'eco': 'eco',
    'sale': 'sale', 'discount': 'discount', 'urgent': 'urgent', 'cairo': 'cairo',
    'dubai': 'dubai', 'london': 'london'
  };

  /**
   * Evaluates a Page Builder Schema and generates smart layout suggestions, accessibility warnings, and adaptive SEO patches
   */
  public static analyzePage(schema: PageBuilderSchema): AuthoringSuggestion[] {
    const suggestions: AuthoringSuggestion[] = [];

    // 1. Accessibility Checks: WCAG AA Color Contrast & Typography Hierarchy
    this.auditAccessibilityAndHierarchy(schema, suggestions);

    // 2. Adaptive SEO Checks
    this.auditAdaptiveSEO(schema, suggestions);

    // 3. Smart Layout & Spacing Shift checks
    this.auditLayoutEngine(schema, suggestions);

    return suggestions;
  }

  /**
   * Levenshtein Distance Algorithmic spelling corrector
   */
  public static calculateLevenshteinDistance(s: string, t: string): number {
    const m = s.length;
    const n = t.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s[i - 1] === t[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,    // Deletion
            dp[i][j - 1] + 1,    // Insertion
            dp[i - 1][j - 1] + 1 // Substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Parses and autocorrects spelling mistakes
   */
  public static autocorrectPrompt(prompt: string): string {
    const words = prompt.toLowerCase().split(/\s+/);
    const correctedWords = words.map((word) => {
      const cleaned = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      if (cleaned.length < 3) return word;

      if (this.AUTOCORRECT_DICTIONARY[cleaned]) {
        return word;
      }

      for (const dictWord of Object.keys(this.AUTOCORRECT_DICTIONARY)) {
        const distance = this.calculateLevenshteinDistance(cleaned, dictWord);
        if (distance <= 2) {
          return word.replace(cleaned, dictWord);
        }
      }

      return word;
    });

    return correctedWords.join(' ');
  }

  /**
   * 🌟 DYNAMIC AUTONOMOUS AI WORKFLOW ORCHESTRATOR (العقل المدبر للـ AI-assisted Workflows)
   * Executes the entire lifecycle when a user requests: "Build a page for a dental clinic":
   * 
   * 1. [Select Template]: Semantic classification maps user intent to the correct registry template.
   * 2. [Generate Copywriting]: Dynamically replaces raw block headings with industry-tailored copy.
   * 3. [Optimize SEO]: Auto-generates localized metadata title and descriptions.
   * 4. [Adjust Colors]: Matches color schemas with emotional color psychology.
   * 5. [Inject CTAs]: Injects tailored call-to-actions.
   */
  public static orchestrateAiWorkflow(prompt: string): AIWorkflowResult {
    const sanitizedPrompt = prompt.trim();
    if (!sanitizedPrompt || sanitizedPrompt.length < 5) {
      return {
        success: false,
        selectedTemplateId: 'saas_lander',
        autocorrectedPrompt: prompt,
        schema: TEMPLATES_REGISTRY.saas_lander.schema,
        warning: '⚠️ Please provide a descriptive prompt of at least 5 characters.',
      };
    }

    // A. Autocorrect user spelling mistakes
    const correctedPrompt = this.autocorrectPrompt(sanitizedPrompt);
    const lowerPrompt = correctedPrompt.toLowerCase();

    // B. SEMANTIC INTENT CLASSIFICATION (Template Selection)
    let selectedTemplateId = 'saas_lander'; // Fallback default
    if (lowerPrompt.includes('dental') || lowerPrompt.includes('clinic') || lowerPrompt.includes('medical') || lowerPrompt.includes('doctor')) {
      selectedTemplateId = 'medical_clinic';
    } else if (lowerPrompt.includes('product') || lowerPrompt.includes('buy') || lowerPrompt.includes('dropship') || lowerPrompt.includes('store') || lowerPrompt.includes('blender')) {
      selectedTemplateId = 'dropshipping_lander';
    } else if (lowerPrompt.includes('estate') || lowerPrompt.includes('villa') || lowerPrompt.includes('apartment') || lowerPrompt.includes('house')) {
      selectedTemplateId = 'real_estate';
    } else if (lowerPrompt.includes('agency') || lowerPrompt.includes('consult') || lowerPrompt.includes('traffic')) {
      selectedTemplateId = 'agency_consulting';
    } else if (lowerPrompt.includes('course') || lowerPrompt.includes('academy') || lowerPrompt.includes('book')) {
      selectedTemplateId = 'online_course';
    }

    const template = TEMPLATES_REGISTRY[selectedTemplateId];
    const nextSchema = JSON.parse(JSON.stringify(template.schema)) as PageBuilderSchema;

    // C. COLOR PSYCHOLOGY & STYLING CUSTOMIZATION
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('night')) {
      nextSchema.theme.backgroundColor = '#090d16';
      nextSchema.theme.textColor = '#f1f5f9';
      nextSchema.theme.primaryColor = '#ec4899'; // Bright pink
    } else if (lowerPrompt.includes('green') || lowerPrompt.includes('organic') || lowerPrompt.includes('eco') || lowerPrompt.includes('natural')) {
      nextSchema.theme.primaryColor = '#059669'; // Emerald
      nextSchema.theme.backgroundColor = '#f0fdf4';
      nextSchema.theme.textColor = '#064e3b';
    } else if (lowerPrompt.includes('premium') || lowerPrompt.includes('luxury') || lowerPrompt.includes('gold')) {
      nextSchema.theme.primaryColor = '#d97706'; // Amber gold
      nextSchema.theme.backgroundColor = '#ffffff';
      nextSchema.theme.textColor = '#0f172a';
    }

    // D. ADAPTIVE SEO & LOCALIZED COPYWRITING (Dynamic Section Adjustments)
    let locationKeyword = 'Global';
    if (lowerPrompt.includes('dubai') || lowerPrompt.includes('uae')) locationKeyword = 'Dubai, UAE';
    else if (lowerPrompt.includes('cairo') || lowerPrompt.includes('egypt')) locationKeyword = 'Cairo, Egypt';
    else if (lowerPrompt.includes('london') || lowerPrompt.includes('uk')) locationKeyword = 'London, UK';

    // Industry-specific copywriting generators (Framer-tier layout and copywriting reasoning)
    Object.entries(nextSchema.blocks).forEach(([id, block]) => {
      // Customize Hero H1 Title tags
      if (block.type === 'heading' && block.props.level === 1) {
        if (selectedTemplateId === 'medical_clinic') {
          block.props.text = `Premium Dental Clinic & Care Centre ${locationKeyword !== 'Global' ? `- Live in ${locationKeyword}` : ''}`;
        } else if (selectedTemplateId === 'dropshipping_lander') {
          block.props.text = `The Ultimate Portable Blender Elite ${locationKeyword !== 'Global' ? `now in ${locationKeyword}` : ''}`;
        } else if (selectedTemplateId === 'real_estate') {
          block.props.text = `Azure Coast Luxury Dream Villas ${locationKeyword !== 'Global' ? `at ${locationKeyword}` : ''}`;
        }
      }

      // Customize CTA Button Labels
      if (block.type === 'button') {
        if (selectedTemplateId === 'medical_clinic') {
          block.props.label = '📅 Book Consultation Appointment';
        } else if (selectedTemplateId === 'dropshipping_lander') {
          block.props.label = '🎯 Order Now & Save 50%';
        } else if (selectedTemplateId === 'real_estate') {
          block.props.label = '🗝️ Schedule Private walkthrough';
        }
      }
    });

    // E. INJECT CONVERSION TRIGGER BARS (Honeypots & countdowns)
    if (lowerPrompt.includes('sale') || lowerPrompt.includes('discount') || lowerPrompt.includes('urgent')) {
      const urgencyBarId = generateSecureId('urgency_bar');
      const rootBlock = nextSchema.blocks[nextSchema.rootBlockId];

      if (rootBlock) {
        const urgencyBlock: BaseBlock = {
          id: urgencyBarId,
          type: 'text',
          name: 'Urgency Sticky Countdown Bar',
          parentId: nextSchema.rootBlockId,
          children: [],
          layout: { backgroundColor: '#dc2626' },
          spacing: { paddingTop: { desktop: '0.75rem' }, paddingBottom: { desktop: '0.75rem' } },
          typography: { color: '#ffffff', fontSize: { desktop: '0.875rem' }, fontWeight: { desktop: '700' }, textAlign: { desktop: 'center' } },
          border: {},
          shadow: {},
          animation: { type: 'pulse', duration: 1500, infinite: true },
          visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
          props: { htmlContent: '<span>⚠️ <strong>LIMITED OFFER:</strong> 50% discount ends in <strong>04:59 minutes</strong>! Use code: <strong>SAVE50</strong></span>' }
        };

        nextSchema.blocks[urgencyBarId] = urgencyBlock;
        rootBlock.children.unshift(urgencyBarId); // Prepend to top
      }
    }

    // F. SEO TAG GENERATION
    nextSchema.seo.title = `Adapted ${nextSchema.title} | ${locationKeyword}`;
    nextSchema.seo.description = `Get instant access to ${nextSchema.title} customized for users in ${locationKeyword}. Sub-10ms compiled Edge-native delivery.`;

    return {
      success: true,
      selectedTemplateId,
      autocorrectedPrompt: correctedPrompt,
      schema: nextSchema,
    };
  }

  /**
   * RESTORED EXTENSIVE SMART LAYOUT RECOMMENDATIONS
   */
  public static getSmartLayoutPreset(category: 'SAAS_LANDING' | 'LEAD_GENERATION' | 'PORTFOLIO'): SmartLayoutPreset {
    switch (category) {
      case 'SAAS_LANDING':
        return {
          category,
          recommendedBlockTypes: ['navbar', 'section', 'container', 'grid', 'button', 'pricing-table', 'footer'],
          suggestedSectionStructure: [
            'Global Navigation Bar (Sticky with dynamic CTA)',
            'Hero Section with strong H1, centered subtext, and buy button',
            '3-Column Grid representing structural product features',
            'Sleek Pricing Matrix table with checkout CTAs',
            'Social Proof & Testimonials slider',
            'Slick multi-column Footer links'
          ]
        };
      case 'LEAD_GENERATION':
        return {
          category,
          recommendedBlockTypes: ['section', 'container', 'form', 'input', 'submit-button', 'testimonial'],
          suggestedSectionStructure: [
            'Urgency countdown bar on absolute top',
            'Clean attention-grabbing Headline H1',
            '2-Column split layout (Left: Trust badges and text, Right: Lead capturing Form)',
            'Secure dynamic submit button with pulse animation',
            'FAQ accordion section to answer common concerns'
          ]
        };
      case 'PORTFOLIO':
      default:
        return {
          category,
          recommendedBlockTypes: ['section', 'container', 'grid', 'image', 'text', 'heading'],
          suggestedSectionStructure: [
            'Minimalist header intro with avatar',
            'Sleek Masonry CSS Grid displaying visual case study assets',
            'Project hover badges with relative absolute positioning constraints',
            'Simple footer contact link with hover underline'
          ]
        };
    }
  }

  /**
   * WCAG AA COLOR CONTRAST CALCULATION
   */
  public static calculateContrastRatio(hex1: string, hex2: string): number {
    const l1 = this.getRelativeLuminance(hex1);
    const l2 = this.getRelativeLuminance(hex2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private static getRelativeLuminance(hex: string): number {
    const cleanedHex = hex.replace('#', '');
    if (cleanedHex.length !== 6 && cleanedHex.length !== 3) return 1;

    let r = 0, g = 0, b = 0;
    if (cleanedHex.length === 6) {
      r = parseInt(cleanedHex.substring(0, 2), 16);
      g = parseInt(cleanedHex.substring(2, 4), 16);
      b = parseInt(cleanedHex.substring(4, 6), 16);
    } else {
      r = parseInt(cleanedHex[0] + cleanedHex[0], 16);
      g = parseInt(cleanedHex[1] + cleanedHex[1], 16);
      b = parseInt(cleanedHex[2] + cleanedHex[2], 16);
    }

    const linearize = (channel: number) => {
      const s = channel / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };

    const rL = linearize(r);
    const gL = linearize(g);
    const bL = linearize(b);

    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  }

  /**
   * Accessibility Audits
   */
  private static auditAccessibilityAndHierarchy(schema: PageBuilderSchema, suggestions: AuthoringSuggestion[]) {
    let h1Count = 0;

    Object.entries(schema.blocks).forEach(([id, block]) => {
      if (block.type === 'heading' && block.props.level === 1) {
        h1Count++;
        if (h1Count > 1) {
          suggestions.push({
            type: 'SEO_OPTIMIZATION',
            severity: 'WARNING',
            blockId: id,
            title: 'Multiple H1 Tags Detected',
            message: 'Your page contains multiple H1 headings. For optimal SEO indexing, restrict your page to exactly one H1 containing the primary target keyword.',
            suggestedActionPatch: { level: 2 }
          });
        }
      }

      if (block.typography?.color && block.layout?.backgroundColor) {
        const textHex = block.typography.color;
        const bgHex = block.layout.backgroundColor;
        
        if (textHex.startsWith('#') && bgHex.startsWith('#')) {
          const contrast = this.calculateContrastRatio(textHex, bgHex);
          
          if (contrast < 4.5) {
            suggestions.push({
              type: 'A11Y_CONTRAST',
              severity: contrast < 3.0 ? 'CRITICAL' : 'WARNING',
              blockId: id,
              title: 'Low Text Contrast Ratio Detected',
              message: `The color contrast ratio between text (${textHex}) and background (${bgHex}) is ${contrast.toFixed(2)}:1, which falls below the WCAG AA minimum standard of 4.5:1. This makes text unreadable on smaller screens.`,
              suggestedActionPatch: { color: '#111827' }
            });
          }
        }
      }
    });
  }

  /**
   * Adaptive SEO audits
   */
  private static auditAdaptiveSEO(schema: PageBuilderSchema, suggestions: AuthoringSuggestion[]) {
    const seo = schema.seo;
    
    if (!seo.description || seo.description.length < 50) {
      suggestions.push({
        type: 'SEO_OPTIMIZATION',
        severity: 'WARNING',
        title: 'Weak Meta Description',
        message: 'Your meta description is either empty or under 50 characters. Google will likely truncate this or write a random snippet. Aim for between 120 and 160 characters.',
        suggestedActionPatch: {
          description: `Discover ${schema.title}. Built with high-performance design frameworks, our page guarantees sub-100ms load times and seamless responsiveness.`
        }
      });
    }

    if (!seo.title || seo.title.length < 10) {
      suggestions.push({
        type: 'SEO_OPTIMIZATION',
        severity: 'INFO',
        title: 'Optimize Page Title Meta Tag',
        message: 'Your page SEO title is very short. Append your brand name or primary target service keyword to increase click-through rate in organic search engine layouts.',
        suggestedActionPatch: {
          title: `${schema.title} | Premium High Performance SaaS Page`
        }
      });
    }
  }

  /**
   * Audit Layout shift risk
   */
  private static auditLayoutEngine(schema: PageBuilderSchema, suggestions: AuthoringSuggestion[]) {
    Object.entries(schema.blocks).forEach(([id, block]) => {
      if (block.type === 'grid' && block.children.length > 12) {
        suggestions.push({
          type: 'UX_IMPROVEMENT',
          severity: 'INFO',
          blockId: id,
          title: 'Excessive Grid Children Count',
          message: 'This grid block contains more than 12 children. To avoid rendering lag and Cumulative Layout Shift (CLS) on older screens, split items across multiple paginated blocks.',
        });
      }
    });
  }
}
