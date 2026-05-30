-- ==========================================
-- SUPABASE AUTH SYNCHRONIZATION TRIGGER
-- ==========================================

-- دالة تلقائية تُستدعى فوراً عند تسجيل مستخدم جديد في Supabase Auth
-- تقوم بنسخ وحفظ بيانات المستخدم تلقائياً في جدول UserProfile الخاص بنا
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."UserProfile" (id, email, plan, "subscriptionStatus", "createdAt", "updatedAt")
  VALUES (
    new.id,
    new.email,
    'FREE', -- الخطة الافتراضية للمسجلين الجدد
    'ACTIVE',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الدالة بجدول المستخدمين في Supabase Auth ليتم تشغيلها تلقائياً
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==========================================

ALTER TABLE public."UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Website" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Page" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Asset" ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- SECURITY POLICIES (سياسات حماية وعزل البيانات)
-- ==========================================

-- 1. حماية جدول المستخدمين (UserProfile)
-- يسمح للمستخدم بقراءة وتحديث حسابه الشخصي فقط، ويمنع الآخرين تماماً
CREATE POLICY "Users can only view their own profile" 
  ON public."UserProfile" FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can only update their own profile" 
  ON public."UserProfile" FOR UPDATE 
  USING (auth.uid() = id);


-- 2. حماية جدول المواقع (Website)
-- يسمح للمستخدم بإجراء كافة العمليات (إنشاء، تعديل، حذف) على المواقع التي يملكها فقط
CREATE POLICY "Users can manage their own websites" 
  ON public."Website" FOR ALL 
  USING (auth.uid() = "userId");

-- يسمح للجمهور غير المسجل (Public Guests) بقراءة بيانات الموقع لعرضه على الويب
CREATE POLICY "Anyone can view published website settings" 
  ON public."Website" FOR SELECT 
  USING ("publishStatus" = 'PUBLISHED');


-- 3. حماية جدول الصفحات (Page)
-- يسمح للمصمم بالتحكم الكامل بصفحات موقعه الشخصي فقط
CREATE POLICY "Users can manage pages of their own websites" 
  ON public."Page" FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public."Website"
      WHERE public."Website".id = public."Page"."websiteId" 
      AND public."Website"."userId" = auth.uid()
    )
  );

-- يسمح للزوار والجمهور بقراءة الصفحات المنشورة فقط لتصفح الموقع بسرعة
CREATE POLICY "Anyone can view published pages" 
  ON public."Page" FOR SELECT 
  USING ("publishStatus" = 'PUBLISHED');


-- 4. حماية ملفات الميديا والأصول المرفوعة (Asset)
-- يضمن ألا يرى أو يحمل أي مستخدم ملفات وصور مستخدم آخر
CREATE POLICY "Users can manage their own uploaded assets" 
  ON public."Asset" FOR ALL 
  USING (auth.uid() = "userId");
