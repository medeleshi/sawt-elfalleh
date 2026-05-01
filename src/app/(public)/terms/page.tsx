import type { Metadata } from 'next'
import { getStaticPage } from '@/lib/queries/static-pages.queries'
import PublicPageShell from '@/components/public/PublicPageShell'

export const metadata: Metadata = { title: 'شروط الاستخدام — صوت الفلاح' }

const FALLBACK_CONTENT = `
  <div class="space-y-6 text-stone-700">
    <p>باستخدامك لمنصة <strong>صوت الفلاح</strong>، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">1. شروط التسجيل</h3>
    <p>يجب أن تكون المعلومات المقدمة عند التسجيل دقيقة وصحيحة. أنت مسؤول عن الحفاظ على سرية معلومات حسابك.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">2. المحتوى المنشور</h3>
    <p>يمنع نشر أي محتوى مضلل، غير قانوني، أو ينتهك حقوق الآخرين. للمنصة الحق في حذف أي إعلان يخالف هذه الشروط.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">3. إخلاء المسؤولية</h3>
    <p>المنصة هي وسيط يربط بين المستخدمين. نحن غير مسؤولين عن جودة المنتجات أو التعاملات المالية التي تتم خارج المنصة.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">4. التعديلات</h3>
    <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر المنصة.</p>
  </div>
`

export default async function TermsPage() {
  const dbPage = await getStaticPage('terms')
  return (
    <PublicPageShell 
      title={dbPage?.title || 'شروط الاستخدام'} 
      subtitle="القواعد التي تحكم استخدامك لمنصة صوت الفلاح"
    >
      <div className="prose-ar" dangerouslySetInnerHTML={{ __html: dbPage?.content || FALLBACK_CONTENT }} />
    </PublicPageShell>
  )
}
