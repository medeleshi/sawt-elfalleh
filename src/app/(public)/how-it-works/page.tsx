import type { Metadata } from 'next'
import { getStaticPage } from '@/lib/queries/static-pages.queries'
import PublicPageShell from '@/components/public/PublicPageShell'

export const metadata: Metadata = { title: 'كيف يعمل؟ — صوت الفلاح' }

const FALLBACK_CONTENT = `
  <div class="space-y-12">
    <div class="grid gap-8 sm:grid-cols-2 items-start">
      <div class="bg-brand-50 p-6 rounded-2xl">
        <h3 class="text-xl font-bold text-brand-800 mb-4">للـفلاح والتاجر</h3>
        <ol class="space-y-4 list-decimal list-inside text-stone-700">
          <li><strong>سجل حسابك:</strong> اختر فئة "فلاح" أو "تاجر" عند التسجيل.</li>
          <li><strong>انشر منتجاتك:</strong> أضف صوراً واضحة، حدد الصنف، والولاية، والسعر.</li>
          <li><strong>استقبل الطلبات:</strong> سيتواصل معك المشترون مباشرة عبر هاتفك.</li>
          <li><strong>بع واربح:</strong> نسق موعد التسليم وأتمم البيع دون عمولات.</li>
        </ol>
      </div>
      
      <div class="bg-stone-50 p-6 rounded-2xl">
        <h3 class="text-xl font-bold text-stone-900 mb-4">للمواطن (المشتري)</h3>
        <ol class="space-y-4 list-decimal list-inside text-stone-700">
          <li><strong>ابحث عن حاجتك:</strong> تصفح الأصناف أو ابحث عن منتج معين.</li>
          <li><strong>قارن الأسعار:</strong> شاهد العروض المتوفرة في ولايتك أو كامل تونس.</li>
          <li><strong>تواصل مع البائع:</strong> اضغط على زر الاتصال للتحدث مباشرة مع صاحب المنتج.</li>
          <li><strong>اشترِ طازجاً:</strong> اتفق على مكان التسليم واستلم منتجاتك بأفضل الأسعار.</li>
        </ol>
      </div>
    </div>

    <div class="border-t border-stone-100 pt-10">
      <h3 class="text-2xl font-bold text-stone-900 mb-6 text-center">نصائح لتعامل آمن</h3>
      <div class="grid gap-6 sm:grid-cols-3">
        <div class="p-4 border border-stone-200 rounded-xl text-center">
          <p class="font-bold mb-2">المعاينة أولاً</p>
          <p class="text-sm text-stone-500">لا تدفع ثمن المنتج إلا بعد معاينته والتأكد من جودته.</p>
        </div>
        <div class="p-4 border border-stone-200 rounded-xl text-center">
          <p class="font-bold mb-2">الأماكن العامة</p>
          <p class="text-sm text-stone-500">اتفق على مقابلة البائع أو المشتري في أماكن عامة ومعروفة.</p>
        </div>
        <div class="p-4 border border-stone-200 rounded-xl text-center">
          <p class="font-bold mb-2">بلاغ عن مشكلة</p>
          <p class="text-sm text-stone-500">استخدم خاصية "تبليغ" إذا واجهت سلوكاً غير لائق أو إعلاناً مضللاً.</p>
        </div>
      </div>
    </div>
  </div>
`

export default async function HowItWorksPage() {
  const dbPage = await getStaticPage('how-it-works')
  return (
    <PublicPageShell 
      title={dbPage?.title || 'كيف يعمل صوت الفلاح؟'} 
      subtitle="خطوات بسيطة تبدأ بها تجربتك في أكبر سوق فلاحي رقمي"
    >
      <div className="prose-ar" dangerouslySetInnerHTML={{ __html: dbPage?.content || FALLBACK_CONTENT }} />
    </PublicPageShell>
  )
}
