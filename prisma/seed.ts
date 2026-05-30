import { PrismaClient, Plan, SubscriptionStatus, PublishStatus, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding process...');

  // 1. تنظيف قاعدة البيانات أولاً لمنع التعارضات أثناء التطوير (Clean Up)
  await prisma.pageVersion.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.domainConfig.deleteMany({});
  await prisma.website.deleteMany({});
  await prisma.userProfile.deleteMany({});

  console.log('🧹 Old tables cleaned successfully.');

  // 2. إنشاء مستخدم تجريبي افتراضي بخطة اشتراك مدفوعة نشطة
  const defaultUser = await prisma.userProfile.create({
    data: {
      id: 'user_admin_1',
      email: 'admin@saaslander.com',
      plan: Plan.PRO,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionId: 'sub_test_premium_123',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // بعد 30 يوماً
      usageWebsiteCount: 1,
      usageStorageBytes: 104857600, // 100MB
    },
  });

  console.log('👤 Default User Admin created:', defaultUser.email);

  // 3. إنشاء موقع تجريبي افتراضي لربط الصفحات والتحليلات به
  const defaultWebsite = await prisma.website.create({
    data: {
      id: 'website_demo_1',
      name: 'My Launch Website',
      subdomain: 'demo', // سيعمل عبر demo.saaslander.com
      customDomain: 'demo.mydomain.com',
      themeConfig: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#111827',
      },
      publishStatus: PublishStatus.DRAFT,
      favicon: 'https://arena.ai/favicon.ico',
      seoTitle: 'Build landing pages in seconds',
      seoDescription: 'High performance No-code landing page builder powered by Next.js & Supabase.',
      userId: defaultUser.id,
    },
  });

  console.log('🌐 Default Website created with subdomain:', defaultWebsite.subdomain);

  // 4. تجهيز الـ Initial Page Builder JSON Schema ليكون متوافقاً 100% مع الـ Frontend Visual Editor
  const initialSchemaContent = {
    version: '1.0.0',
    pageId: 'landing_page_demo_1', // مطابق تماماً لمعرف الصفحة في المحرر الرسومي!
    title: 'My Launch Landing Page',
    slug: 'home',
    seo: {
      title: 'High Converting Landing Page Builder',
      description: 'Build robust high performance SaaS pages with no-code.',
      keywords: 'builder, design, react, next.js, landing page',
    },
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontHeading: 'Inter',
      fontBody: 'Inter',
    },
    rootBlockId: 'root_block',
    blocks: {
      root_block: {
        id: 'root_block',
        type: 'container',
        name: 'Root Layout Wrapper',
        parentId: null,
        children: ['hero_section'],
        layout: { display: { desktop: 'block' }, width: { desktop: '100%' } },
        spacing: { paddingTop: { desktop: '0px' }, paddingBottom: { desktop: '0px' } },
        typography: {},
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: {},
      },
      hero_section: {
        id: 'hero_section',
        type: 'section',
        name: 'Hero Section',
        parentId: 'root_block',
        children: ['hero_container'],
        layout: { backgroundColor: '#f9fafb', display: { desktop: 'block' } },
        spacing: { paddingTop: { desktop: '6rem' }, paddingBottom: { desktop: '6rem' } },
        typography: {},
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: {},
      },
      hero_container: {
        id: 'hero_container',
        type: 'container',
        name: 'Hero Container Box',
        parentId: 'hero_section',
        children: ['hero_heading', 'hero_cta_button'],
        layout: { display: { desktop: 'flex' }, flexDirection: { desktop: 'column' }, alignItems: { desktop: 'center' } },
        spacing: {},
        typography: { textAlign: { desktop: 'center' } },
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: {},
      },
      hero_heading: {
        id: 'hero_heading',
        type: 'heading',
        name: 'Hero Main Title',
        parentId: 'hero_container',
        children: [],
        layout: {},
        spacing: { marginBottom: { desktop: '1.5rem' } },
        typography: { fontSize: { desktop: '3rem' }, color: '#111827', fontWeight: { desktop: '800' } },
        border: {},
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { text: 'Engineered for Performance', level: 1 },
      },
      hero_cta_button: {
        id: 'hero_cta_button',
        type: 'button',
        name: 'Hero CTA Button',
        parentId: 'hero_container',
        children: [],
        layout: {},
        spacing: {},
        typography: {},
        border: { borderRadius: { desktop: '0.375rem' } },
        shadow: {},
        animation: {},
        visibility: { showOnDesktop: true, showOnTablet: true, showOnMobile: true },
        props: { label: 'Explore Platform', variant: 'primary', action: { type: 'url', url: 'https://arena.ai' } },
      }
    }
  };

  // 5. إنشاء الصفحة وربطها بالموقع كمسودة ونسخة منشورة مسبقاً للتجربة الفورية
  const defaultPage = await prisma.page.create({
    data: {
      id: 'landing_page_demo_1', // هذا المعرف يحميك من الـ DB Constraint Crash في المحرر!
      websiteId: defaultWebsite.id,
      title: 'My Launch Landing Page',
      slug: 'home',
      content: initialSchemaContent, // نسخة المسودة
      publishedContent: initialSchemaContent, // نسخة البث العام المباشر
      publishStatus: PublishStatus.PUBLISHED,
      seoTitle: 'High Converting Landing Page Builder',
      seoDescription: 'Build robust high performance SaaS pages with no-code.',
    },
  });

  console.log('📄 Default Page created and pre-published with ID:', defaultPage.id);

  // 6. إنشاء سجل نطاق مخصص للتحقق والـ SSL التجريبي
  await prisma.domainConfig.create({
    data: {
      websiteId: defaultWebsite.id,
      domainName: 'demo.mydomain.com',
      verificationToken: 'v=txt_token_verification_xyz123',
      verificationStatus: VerificationStatus.VERIFIED,
      sslStatus: VerificationStatus.VERIFIED,
      sslConfiguredAt: new Date(),
    },
  });

  console.log('🛡️ Custom Domain config injected and verified.');
  console.log('🎉 Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
