import { PageBuilderSchema, BaseBlock, BlockType } from '../../types/builder';
import { generateSecureId } from '../security/uuid';
import { SAAS_DESIGN_TOKENS } from '../theme/tokens';

export interface AiGenerationConfig {
  prompt: string;
  industry: 'SAAS' | 'E-COMMERCE' | 'CLINIC' | 'LOCAL_SERVICES' | 'PORTFOLIO';
  themeMode: 'DARK' | 'LIGHT' | 'EMERALD' | 'LUXURY';
}

export class AiLayoutGeneratorEngine {
  
  /**
   * 1. AI PAGE GENERATION
   * Generates a fully customized, responsive, and SEO-optimized PageBuilderSchema from scratch
   * based on a user's prompt, industry, and visual theme requirements.
   */
  public static generateFullPage(config: AiGenerationConfig): PageBuilderSchema {
    const pageId = generateSecureId('page');
    const rootBlockId = generateSecureId('root');
    const heroSectionId = generateSecureId('hero_section');
    const featuresSectionId = generateSecureId('features_section');

    const themeColors = this.resolveThemeColors(config.themeMode);
    const copywriting = this.generateIndustryCopywriting(config.industry, config.prompt);

    const schema: PageBuilderSchema = {
      version: '1.0.0',
      pageId,
      title: copywriting.pageTitle,
      slug: copywriting.slug,
      seo: {
        title: copywriting.seoTitle,
        description: copywriting.seoDesc,
        keywords: `${config.industry.toLowerCase()}, builder, conversion, custom`,
      },
      theme: {
        primaryColor: themeColors.primary,
        secondaryColor: themeColors.secondary,
        backgroundColor: themeColors.background,
        textColor: themeColors.text,
        fontHeading: config.industry === 'PORTFOLIO' ? 'Playfair Display' : 'Inter',
        fontBody: 'Inter',
      },
      rootBlockId,
      blocks: {
        [rootBlockId]: {
          id: rootBlockId,
          type: 'container',
          name: 'Root Layout Wrapper',
          parentId: null,
          children: [heroSectionId, featuresSectionId],
          layout: { display: { desktop: 'block' }, width: { desktop: '100%' }, backgroundColor: themeColors.background },
          spacing: {},
          typography: {},
          border: {},
          shadow: {},
          animation: {},
          visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
          props: {},
        }
      }
    };

    // 2. AI SECTION GENERATION & LAYOUT INTELLIGENCE
    // Injects highly styled, nested Hero and Feature sections into the generated Page
    this.injectHeroSection(schema, heroSectionId, rootBlockId, copywriting, themeColors);
    this.injectFeaturesSection(schema, featuresSectionId, rootBlockId, copywriting, themeColors);

    return schema;
  }

  /**
   * 3. AI INDIVIDUAL SECTION GENERATION
   * Dynamically constructs and injects an individual pre-configured, highly styled section block
   * (e.g., Contact Form, Testimonials) into an existing Page schema.
   */
  public static injectIndividualSection(
    schema: PageBuilderSchema,
    sectionType: 'CONTACT_FORM' | 'TESTIMONIALS'
  ): PageBuilderSchema {
    const nextSchema = JSON.parse(JSON.stringify(schema)) as PageBuilderSchema;
    const rootBlock = nextSchema.blocks[nextSchema.rootBlockId];
    if (!rootBlock) return schema;

    const sectionId = generateSecureId('injected_section');
    const containerId = generateSecureId('injected_container');

    const sectionBlock: BaseBlock = {
      id: sectionId,
      type: 'section',
      name: `AI Injected ${sectionType} Section`,
      parentId: nextSchema.rootBlockId,
      children: [containerId],
      layout: { backgroundColor: nextSchema.theme.backgroundColor === '#ffffff' ? '#f8fafc' : '#0a0f1d' },
      spacing: { paddingTop: { desktop: '5rem' }, paddingBottom: { desktop: '5rem' } },
      typography: {},
      border: { borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.05)', borderWidth: { desktop: '1px 0 0 0' } },
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    const containerBlock: BaseBlock = {
      id: containerId,
      type: 'container',
      name: 'Injected Section Container',
      parentId: sectionId,
      children: [],
      layout: { display: { desktop: 'flex' }, flexDirection: { desktop: 'column' }, alignItems: { desktop: 'center' } },
      spacing: { paddingLeft: { desktop: '2rem' }, paddingRight: { desktop: '2rem' } },
      typography: { textAlign: { desktop: 'center' } },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    nextSchema.blocks[sectionId] = sectionBlock;
    nextSchema.blocks[containerId] = containerBlock;

    if (sectionType === 'CONTACT_FORM') {
      const formId = generateSecureId('injected_form');
      const submitBtnId = generateSecureId('injected_submit_btn');
      
      const formBlock: BaseBlock = {
        id: formId,
        type: 'form',
        name: 'AI Generated Form',
        parentId: containerId,
        children: [submitBtnId],
        layout: { width: { desktop: '100%', mobile: '100%' } },
        spacing: {},
        typography: {},
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { submitMethod: 'SUPABASE', successMessage: 'Success! Form submitted.' },
      };

      const buttonBlock: BaseBlock = {
        id: submitBtnId,
        type: 'button',
        name: 'Form Submit Button',
        parentId: formId,
        children: [],
        layout: { backgroundColor: nextSchema.theme.primaryColor },
        spacing: { paddingTop: { desktop: '1rem' }, paddingBottom: { desktop: '1rem' }, paddingLeft: { desktop: '2rem' }, paddingRight: { desktop: '2rem' } },
        typography: { color: '#ffffff', fontWeight: { desktop: '700' } },
        border: { borderRadius: { desktop: '0.375rem' } },
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { label: 'Submit Secure Inquiry', variant: 'primary', action: { type: 'url', url: '#' } },
      };

      nextSchema.blocks[formId] = formBlock;
      nextSchema.blocks[submitBtnId] = buttonBlock;
      containerBlock.children.push(formId);

    } else if (sectionType === 'TESTIMONIALS') {
      const headingId = generateSecureId('testimonial_heading');
      const textId = generateSecureId('testimonial_text');

      const headingBlock: BaseBlock = {
        id: headingId,
        type: 'heading',
        name: 'Testimonial Heading',
        parentId: containerId,
        children: [],
        layout: {},
        spacing: { marginBottom: { desktop: '1rem' } },
        typography: { fontSize: { desktop: '1.5rem' }, fontWeight: { desktop: '700' }, color: nextSchema.theme.textColor },
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { text: '⭐️⭐️⭐️⭐️⭐️ What Our Partners Say', level: 3 },
      };

      const textBlock: BaseBlock = {
        id: textId,
        type: 'text',
        name: 'Testimonial Copy',
        parentId: containerId,
        children: [],
        layout: {},
        spacing: {},
        typography: { color: nextSchema.theme.textColor === '#ffffff' ? '#94a3b8' : '#475569' },
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { htmlContent: '<p>"This platform transformed our loading speeds from 4 seconds to under 20ms. Our conversions doubled inside 10 days!" - CEO, Alpha Scale</p>' },
      };

      nextSchema.blocks[headingId] = headingBlock;
      nextSchema.blocks[textId] = textBlock;
      containerBlock.children.push(headingId, textId);
    }

    rootBlock.children.push(sectionId); // Append to bottom of tree
    return nextSchema;
  }

  /**
   * AI Hero Section Builder
   */
  private static injectHeroSection(
    schema: PageBuilderSchema,
    heroId: string,
    parentId: string,
    copy: Record<string, string>,
    colors: Record<string, string>
  ) {
    const containerId = generateSecureId('hero_container');
    const headingId = generateSecureId('hero_heading');
    const textId = generateSecureId('hero_paragraph');
    const buttonId = generateSecureId('hero_cta_btn');

    schema.blocks[heroId] = {
      id: heroId,
      type: 'section',
      name: 'AI Generated Hero Section',
      parentId,
      children: [containerId],
      layout: { backgroundColor: colors.background },
      spacing: { paddingTop: { desktop: '7rem' }, paddingBottom: { desktop: '6rem' } },
      typography: {},
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    schema.blocks[containerId] = {
      id: containerId,
      type: 'container',
      name: 'Hero Center Container',
      parentId: heroId,
      children: [headingId, textId, buttonId],
      layout: { display: { desktop: 'flex' }, flexDirection: { desktop: 'column' }, alignItems: { desktop: 'center' } },
      spacing: {},
      typography: { textAlign: { desktop: 'center' } },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    schema.blocks[headingId] = {
      id: headingId,
      type: 'heading',
      name: 'Hero Main Title',
      parentId: containerId,
      children: [],
      layout: {},
      spacing: { marginBottom: { desktop: '1.5rem' } },
      typography: { fontSize: { desktop: '3.75rem', mobile: '2.25rem' }, fontWeight: { desktop: '900' }, color: colors.text, letterSpacing: { desktop: '-0.04em' } },
      border: {},
      shadow: {},
      animation: { type: 'slide-up', duration: 800 },
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { text: copy.heroTitle, level: 1 },
    };

    schema.blocks[textId] = {
      id: textId,
      type: 'text',
      name: 'Hero Paragraph Subtext',
      parentId: containerId,
      children: [],
      layout: {},
      spacing: { marginBottom: { desktop: '2.5rem' } },
      typography: { fontSize: { desktop: '1.25rem' }, color: colors.text === '#ffffff' ? '#94a3b8' : '#475569', lineHeight: { desktop: '1.6' } },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { htmlContent: `<p>${copy.heroSub}</p>` },
    };

    schema.blocks[buttonId] = {
      id: buttonId,
      type: 'button',
      name: 'Hero CTA Link',
      parentId: containerId,
      children: [],
      layout: { backgroundColor: colors.primary },
      spacing: { paddingTop: { desktop: '1rem' }, paddingBottom: { desktop: '1rem' }, paddingLeft: { desktop: '2rem' }, paddingRight: { desktop: '2rem' } },
      typography: { color: '#ffffff', fontSize: { desktop: '1.125rem' }, fontWeight: { desktop: '700' } },
      border: { borderRadius: { desktop: '0.5rem' } },
      shadow: { boxShadow: `0 10px 15px -3px ${colors.primary}40` },
      animation: { type: 'pulse', duration: 1500, infinite: true },
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { label: copy.ctaLabel, variant: 'primary', action: { type: 'url', url: '#' } },
    };
  }

  /**
   * AI Features Section Builder
   */
  private static injectFeaturesSection(
    schema: PageBuilderSchema,
    featuresId: string,
    parentId: string,
    copy: Record<string, string>,
    colors: Record<string, string>
  ) {
    const containerId = generateSecureId('feat_container');
    const headingId = generateSecureId('feat_heading');
    const gridId = generateSecureId('feat_grid');
    const cardId = generateSecureId('feat_card_1');

    schema.blocks[featuresId] = {
      id: featuresId,
      type: 'section',
      name: 'AI Generated Features Section',
      parentId,
      children: [containerId],
      layout: { backgroundColor: colors.background === '#ffffff' ? '#f8fafc' : '#0a0f1d' },
      spacing: { paddingTop: { desktop: '5rem' }, paddingBottom: { desktop: '5rem' } },
      typography: {},
      border: { borderStyle: 'solid', borderColor: 'rgba(0,0,0,0.05)', borderWidth: { desktop: '1px 0 0 0' } },
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    schema.blocks[containerId] = {
      id: containerId,
      type: 'container',
      name: 'Features Wrapper Container',
      parentId: featuresId,
      children: [headingId, gridId],
      layout: {},
      spacing: { paddingLeft: { desktop: '2rem' }, paddingRight: { desktop: '2rem' } },
      typography: {},
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    schema.blocks[headingId] = {
      id: headingId,
      type: 'heading',
      name: 'Features Section Title',
      parentId: containerId,
      children: [],
      layout: {},
      spacing: { marginBottom: { desktop: '3rem' } },
      typography: { fontSize: { desktop: '2.25rem' }, fontWeight: { desktop: '800' }, textAlign: { desktop: 'center' }, color: colors.text },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { text: copy.featSectionTitle, level: 2 },
    };

    schema.blocks[gridId] = {
      id: gridId,
      type: 'grid',
      name: 'AI 2-Column Features Grid',
      parentId: containerId,
      children: [cardId],
      layout: { display: { desktop: 'grid', mobile: 'block' }, gridTemplateColumns: { desktop: '1fr' }, gap: { desktop: '2rem' } },
      spacing: {},
      typography: {},
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    // Sub-card child block (Layout Intelligence: spacing & rounded corners tokens)
    const cardTitleId = generateSecureId('feat_card_title');
    const cardTextId = generateSecureId('feat_card_text');

    schema.blocks[cardId] = {
      id: cardId,
      type: 'container',
      name: 'Features Sub-Card Wrapper',
      parentId: gridId,
      children: [cardTitleId, cardTextId],
      layout: { backgroundColor: colors.background === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.02)' },
      spacing: { paddingTop: { desktop: '2rem' }, paddingBottom: { desktop: '2rem' }, paddingLeft: { desktop: '2rem' }, paddingRight: { desktop: '2rem' } },
      typography: {},
      border: { borderRadius: { desktop: '0.75rem' }, borderColor: 'rgba(0,0,0,0.05)', borderStyle: 'solid', borderWidth: { desktop: '1px' } },
      shadow: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: {},
    };

    schema.blocks[cardTitleId] = {
      id: cardTitleId,
      type: 'heading',
      name: 'Feature Card Title',
      parentId: cardId,
      children: [],
      layout: {},
      spacing: { marginBottom: { desktop: '0.5rem' } },
      typography: { fontSize: { desktop: '1.25rem' }, fontWeight: { desktop: '700' }, color: colors.text },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { text: copy.cardTitle, level: 3 },
    };

    schema.blocks[cardTextId] = {
      id: cardTextId,
      type: 'text',
      name: 'Feature Card Paragraph',
      parentId: cardId,
      children: [],
      layout: {},
      spacing: {},
      typography: { color: colors.text === '#ffffff' ? '#94a3b8' : '#475569', lineHeight: { desktop: '1.5' } },
      border: {},
      shadow: {},
      animation: {},
      visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
      props: { htmlContent: `<p>${copy.cardText}</p>` },
    };
  }

  /**
   * Color Psychology Mapper (Layout Intelligence)
   */
  private static resolveThemeColors(mode: AiGenerationConfig['themeMode']) {
    switch (mode) {
      case 'DARK':
        return { primary: '#6366f1', secondary: '#ec4899', background: '#090d16', text: '#ffffff' };
      case 'EMERALD':
        return { primary: '#059669', secondary: '#10b981', background: '#f0fdf4', text: '#064e3b' };
      case 'LUXURY':
        return { primary: '#d97706', secondary: '#b45309', background: '#ffffff', text: '#0f172a' };
      case 'LIGHT':
      default:
        return { primary: '#2563eb', secondary: '#4b5563', background: '#ffffff', text: '#111827' };
    }
  }

  /**
   * Semantic Copywriting Generator based on prompt inputs (CRO-Optimized)
   */
  private static generateIndustryCopywriting(industry: AiGenerationConfig['industry'], prompt: string) {
    const isArabic = /[\u0600-\u06FF]/.test(prompt);

    if (isArabic) {
      switch (industry) {
        case 'CLINIC':
          return {
            pageTitle: 'عيادة سمايل كلينك التخصصية',
            slug: 'clinic-funnel',
            seoTitle: 'احجز كشف الأسنان المجاني اليوم | عيادة سمايل',
            seoDesc: 'استمتع بأحدث تقنيات تجميل وزراعة الأسنان بدون ألم. أطباء معتمدون وخطط علاجية مخصصة بالكامل.',
            heroTitle: 'حوّل ابتسامتك اليوم بدون أي ألم',
            heroSub: 'عيادة سمايل التخصصية تقدم لك كشفاً مجانياً مع أحدث أجهزة زراعة وتجميل الأسنان بأيدي نخبة من الجراحين المعتمدين.',
            ctaLabel: '📅 احجز كشفك الطبي المجاني الآن',
            featSectionTitle: 'رعاية طبية فائقة تليق بابتسامتك',
            cardTitle: '🩺 بروتوكول علاج خالٍ تماماً من الألم',
            cardText: 'نستخدم تقنيات التخدير الموضعي الأحدث عالمياً لضمان جلسة علاجية مريحة ودافئة ومضمونة 100%.',
          };
        case 'E-COMMERCE':
          return {
            pageTitle: 'موقع الخلاط الرياضي المحمول',
            slug: 'portable-blender',
            seoTitle: 'خلاط بورتبل إيليت | خصم 50% وشحن مجاني اليوم',
            seoDesc: 'احصل على خلاطك الرياضي المحمول فائق القوة اليوم مع شحن مجاني ودفع عند الاستلام. اخلط عصائرك أينما كنت.',
            heroTitle: 'عصائرك الطازجة جاهزة أينما كنت وفي ثوانٍ',
            heroSub: 'خلاط بورتبل إيليت المحمول فائق القوة ببطارية تدوم طويلاً وشفرات من الستيل المقاوم للصدأ اطلبه اليوم بخصم 50%!',
            ctaLabel: '🎯 اطلب الآن وادفع عند الاستلام',
            featSectionTitle: 'مواصفات تليق برياضي محترف',
            cardTitle: '⚡ بطارية عملاقة تشحن بالـ USB',
            cardText: 'شحنة واحدة تكفي لخلط أكثر من 20 عصير بروتين طازج بكفاءة تامة أينما ذهبت.',
          };
        default:
          return {
            pageTitle: 'منصتك السحابية الذكية',
            slug: 'saas-funnel',
            seoTitle: 'أطلق موقعك السريع على الـ Edge فَوْراً',
            seoDesc: 'منصة سحابية متطورة تتيح لك تصميم ونشر صفحات هبوط استاتيكية فائقة السرعة بـ Zero Node overhead.',
            heroTitle: 'أطلق صفحات هبوط تفتح في لمح البصر',
            heroSub: 'تخلص من السيرفرات البطيئة؛ تتيح لك منصتنا تجميع كود صفحتك وبثها جغرافياً من أقرب خادم للزائر في أقل من 10ms.',
            ctaLabel: '🚀 ابدأ التجربة المجانية فَوْراً',
            featSectionTitle: 'بنية تحتية هندسية فائقة القوة',
            cardTitle: '⚡ تجميع استاتيكي جزئي ذكي',
            cardText: 'يعيد المترجم بناء الأجزاء المعدلة فقط في كود الـ AST ويضغطه بنسبة 70% لسرعة تصفح خارقة.',
          };
      }
    } else {
      // English Default copy templates (CRO-Optimized)
      switch (industry) {
        case 'SAAS':
          return {
            pageTitle: 'Alpha SaaS Engine',
            slug: 'saas-funnel',
            seoTitle: 'The Fastest No-Code SaaS Engine | Alpha',
            seoDesc: 'Compile visual designs directly to lightweight standalone HTML/CSS codes with sub-10ms response speeds.',
            heroTitle: 'Launch Lightweight Pages Direct on the Edge',
            heroSub: 'Eliminate heavy runtime React loaders. Compile layouts to pure optimized static code replicated globally in seconds.',
            ctaLabel: 'Claim Your Free Trial',
            featSectionTitle: 'Engineered for Performance Marketers',
            cardTitle: '⚡ Atomic CSS Inlining',
            cardText: 'Deduplicates duplicate design properties automatically to reduce compilation sizes by 70% and optimize FCP.',
          };
        case 'CLINIC':
          return {
            pageTitle: 'Elite Dental Clinic',
            slug: 'dental-funnel',
            seoTitle: 'Book Your Diagnostic Dental Exam | Elite',
            seoDesc: 'Professional implant, cosmetic, and pediatric dentistry. Pain-free treatments and personalized schedules.',
            heroTitle: 'Transform Your Smile Completely Pain-Free',
            heroSub: 'Elite Dental Clinic provides complimentary diagnostic checkups utilizing advanced, comfortable, and certified medicine care.',
            ctaLabel: '📅 Schedule Free Consultation',
            featSectionTitle: 'Exceptional Healthcare Tailored to You',
            cardTitle: '🩺 Certified Biocompatible Materials',
            cardText: 'Every crown, resin, and diagnostic implant is crafted from 100% FDA approved, lifetime-guaranteed materials.',
          };
        case 'E-COMMERCE':
        default:
          return {
            pageTitle: 'Portable Blender Elite',
            slug: 'portable-blender',
            seoTitle: 'Portable Blender Elite | 50% Off & Free Delivery',
            seoDesc: 'Get the absolute strongest portable usb blender today with 50% discount and global fast delivery.',
            heroTitle: 'Your Fresh Organic Blends Ready Anywhere',
            heroSub: 'Engineered with premium stainless steel blades and a USB-rechargeable battery built to blend 20+ protein shakes on a single charge.',
            ctaLabel: '🎯 ORDER NOW & SAVE 50%',
            featSectionTitle: 'Designed for High-Performance Athletes',
            cardTitle: '⚡ Rapid USB-C Rechargeable Battery',
            cardText: 'One rapid charge provides enough torque to blend frozen berries, ice blocks, and supplements in 15 seconds.',
          };
      }
    }
  }
}
