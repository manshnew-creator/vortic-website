// Types definitions for No-Code Website & Landing Page Builder

export type ResponsiveValue<T> = {
  desktop: T;
  tablet?: T;
  mobile?: T;
};

export interface SpacingSettings {
  paddingTop?: ResponsiveValue<string>;
  paddingBottom?: ResponsiveValue<string>;
  paddingLeft?: ResponsiveValue<string>;
  paddingRight?: ResponsiveValue<string>;
  marginTop?: ResponsiveValue<string>;
  marginBottom?: ResponsiveValue<string>;
  marginLeft?: ResponsiveValue<string>;
  marginRight?: ResponsiveValue<string>;
}

export interface TypographySettings {
  fontFamily?: string;
  fontSize?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<string>;
  lineHeight?: ResponsiveValue<string>;
  letterSpacing?: ResponsiveValue<string>;
  color?: string;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface BorderSettings {
  borderWidth?: ResponsiveValue<string>;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: ResponsiveValue<string>;
}

export interface ShadowSettings {
  boxShadow?: string;
  textShadow?: string;
}

export interface AnimationSettings {
  type?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce' | 'pulse';
  duration?: number; // in ms
  delay?: number; // in ms
  infinite?: boolean;
}

export interface VisibilityRules {
  showOnDesktop: boolean;
  showOnTablet: boolean;
  showOnMobile: boolean;
  rolesAllowed?: string[]; // RBAC protection for block level
  startDate?: string; // scheduled publishing
  endDate?: string;
}

export interface LinkAction {
  type: 'none' | 'url' | 'page' | 'scroll' | 'email' | 'call';
  url?: string;
  pageId?: string;
  anchorId?: string;
  target?: '_self' | '_blank';
}

// Support Flexbox, Absolute Constraints, and CSS Grid (Problem #5)
export interface LayoutSettings {
  display?: ResponsiveValue<'block' | 'flex' | 'grid' | 'none'>;
  flexDirection?: ResponsiveValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>;
  justifyContent?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>;
  alignItems?: ResponsiveValue<'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'>;
  gridTemplateColumns?: ResponsiveValue<string>;
  gap?: ResponsiveValue<string>;
  width?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  minHeight?: ResponsiveValue<string>;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  opacity?: ResponsiveValue<number>;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  zIndex?: number;
  
  // ABSOLUTE CONSTRAINTS POSITIONING (Problem #5)
  position?: ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  left?: ResponsiveValue<string>;
  top?: ResponsiveValue<string>;
  right?: ResponsiveValue<string>;
  bottom?: ResponsiveValue<string>;
}

export type BlockType =
  | 'section'
  | 'container'
  | 'grid'
  | 'text'
  | 'heading'
  | 'button'
  | 'image'
  | 'video'
  | 'navbar'
  | 'footer'
  | 'form'
  | 'input'
  | 'textarea'
  | 'submit-button'
  | 'card'
  | 'testimonial'
  | 'pricing-table'
  | 'custom-html';

export interface BaseBlock {
  id: string;
  type: BlockType;
  name: string;
  parentId?: string | null;
  children: string[]; // List of child block IDs (for tree structure optimization)
  
  // Design properties
  layout: LayoutSettings;
  spacing: SpacingSettings;
  typography: TypographySettings;
  border: BorderSettings;
  shadow: ShadowSettings;
  animation: AnimationSettings;
  visibility: VisibilityRules;

  // Custom parameters for each BlockType
  props: Record<string, any>;
}

// Strong typings for standard props
export interface HeadingProps extends BaseBlock {
  type: 'heading';
  props: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface TextProps extends BaseBlock {
  type: 'text';
  props: {
    htmlContent: string;
  };
}

export interface ButtonProps extends BaseBlock {
  type: 'button';
  props: {
    label: string;
    action: LinkAction;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  };
}

export interface ImageProps extends BaseBlock {
  type: 'image';
  props: {
    src: string;
    alt: string;
    width?: string;
    height?: string;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    action?: LinkAction;
  };
}

export interface VideoProps extends BaseBlock {
  type: 'video';
  props: {
    provider: 'youtube' | 'vimeo' | 'html5';
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
  };
}

export interface FormProps extends BaseBlock {
  type: 'form';
  props: {
    formId: string;
    actionUrl?: string;
    submitMethod: 'POST' | 'GET' | 'SUPABASE';
    successMessage: string;
    errorMessage: string;
    redirectUrl?: string;
  };
}

export interface PageBuilderSchema {
  version: string; // "1.0.0"
  pageId: string;
  title: string;
  slug: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    metaTags?: Array<{ name: string; content: string }>;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
  };
  rootBlockId: string; // Usually a root container/section holding all sections
  blocks: Record<string, BaseBlock>; // Hash map of blockId -> Block data (O(1) lookups)
}
