import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StaticPageRenderer } from '../../../../components/renderer/BlockRenderer';
import { PageBuilderSchema } from '../../../../types/builder';
import prisma from '../../../../lib/db/prisma';

// تفعيل ميزة الـ ISR: إعادة بناء الصفحة استاتيكياً في الخلفية كل ساعة (3600 ثانية)
// أو استخدام On-Demand Revalidation عند الضغط على Publish في لوحة التحكم
export const revalidate = 3600; 

interface SitePageProps {
  params: Promise<{
    site: string; // يمثل الـ Subdomain أو الـ Custom Domain المقروء من Middleware
    slug: string; // يمثل اسم الصفحة مثل (home, contact, features)
  }>;
}

/**
 * دالة مساعدة لجلب الصفحة والموقع من قاعدة البيانات بكفاءة عالية جداً
 */
async function getPageData(site: string, slug: string) {
  // التحقق من النطاق إذا كان Custom Domain أو Subdomain
  const website = await prisma.website.findFirst({
    where: {
      OR: [
        { subdomain: site },
        { customDomain: site }
      ]
    },
    include: {
      pages: {
        where: {
          slug: slug || 'home', // الافتراضي هو الصفحة الرئيسية home
          publishStatus: 'PUBLISHED' // جلب النسخ المنشورة فقط للجمهور
        }
      }
    }
  });

  if (!website || !website.pages || website.pages.length === 0) {
    return null;
  }

  const page = website.pages[0];
  return {
    website,
    page,
  };
}

/**
 * 1. توليد محددات الـ SEO الديناميكية تلقائياً لمحركات البحث (Next.js 15 Dynamic Metadata Generator)
 */
export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { site, slug } = await params;
  const data = await getPageData(site, slug);

  if (!data) {
    return {
      title: 'Page Not Found - SaaS Builder',
    };
  }

  const { page, website } = data;
  const title = page.seoTitle || website.seoTitle || page.title || 'Welcome';
  const description = page.seoDescription || website.seoDescription || '';
  const keywords = page.seoKeywords || website.seoKeywords || '';
  const ogImage = page.ogImage || website.ogImage || '';

  return {
    title: `${title} | ${website.name}`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImage ? [ogImage] : [],
    },
    icons: {
      icon: website.favicon || '/favicon.ico',
    }
  };
}

/**
 * 2. الصفحة الرسومية الأساسية لمواقع الزوار المنشورة (High-Performance ISR Page Renderer)
 */
export default async function SitePage({ params }: SitePageProps) {
  const { site, slug } = await params;
  const data = await getPageData(site, slug);

  // إذا لم نجد الصفحة أو الموقع مسجلاً، نعرض صفحة 404 فوراً
  if (!data) {
    notFound();
  }

  const { page, website } = data;

  // فك ترميز محتوى الصفحة المنشور (Published JSON Schema)
  const schema = page.publishedContent as unknown as PageBuilderSchema;

  if (!schema) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <h1 className="text-xl font-bold text-gray-800">Under Construction 🛠️</h1>
        <p className="text-xs text-gray-400 mt-2">This website was published but contains no content yet.</p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white">
      {/* 
        تصيير الصفحة الاستاتيكية بالكامل باستخدام المصير فائق السرعة والأداء.
        يقوم هذا المكون ببناء شجرة الصفحة بكفاءة تامة دون استهلاك أي معالج للعملاء.
      */}
      <StaticPageRenderer schema={schema} />

      {/* حقن كود تحليلات وتتبع الزوار خفيف الوزن وتمرير معرف الموقع الفرعي تلقائياً */}
      <script
        async
        defer
        src="/_static/analytics/script.js"
        data-website-id={website.id}
      />
    </main>
  );
}
