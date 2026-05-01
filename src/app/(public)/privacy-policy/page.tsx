import type { Metadata } from 'next'
import { getStaticPage } from '@/lib/queries/static-pages.queries'
import PublicPageShell from '@/components/public/PublicPageShell'

export const metadata: Metadata = { title: 'سياسة الخصوصية — صوت الفلاح' }

const FALLBACK_CONTENT = `
  <div class="space-y-6 text-stone-700">
    <p>تلتزم منصة <strong>صوت الفلاح</strong> بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">1. المعلومات التي نجمعها</h3>
    <p>نجمع المعلومات التي تقدمها لنا عند التسجيل، مثل الاسم، رقم الهاتف، والبريد الإلكتروني، بالإضافة إلى المعلومات المتعلقة بالإعلانات التي تنشرها.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">2. كيف نستخدم معلوماتك</h3>
    <p>نستخدم معلوماتك لتشغيل المنصة، وتسهيل التواصل بين البائعين والمشترين، وتحسين خدماتنا، وإرسال إشعارات متعلقة بحسابك.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">3. حماية البيانات</h3>
    <p>نحن نطبق إجراءات أمنية تقنية وإدارية لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح عنها.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">4. مشاركة المعلومات</h3>
    <p>لا نقوم ببيع بياناتك الشخصية لأطراف ثالثة. يتم عرض رقم هاتفك فقط للمستخدمين الآخرين إذا قمت بتفعيل ذلك في إعداداتك لتسهيل عملية التواصل الفلاحي.</p>
  </div>
`

export default async function PrivacyPage() {
  const dbPage = await getStaticPage('privacy-policy')
  return (
    <PublicPageShell 
      title={dbPage?.title || 'سياسة الخصوصية'} 
      subtitle="نحن نهتم بخصوصيتك ونعمل على حماية بياناتك"
    >
      <div className="prose-ar" dangerouslySetInnerHTML={{ __html: dbPage?.content || FALLBACK_CONTENT }} />
    </PublicPageShell>
  )
}
