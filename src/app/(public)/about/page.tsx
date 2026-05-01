import type { Metadata } from 'next'
import { getStaticPage } from '@/lib/queries/static-pages.queries'
import PublicPageShell from '@/components/public/PublicPageShell'

export const metadata: Metadata = { title: 'من نحن — صوت الفلاح' }

const FALLBACK_CONTENT = `
  <div class="space-y-6 text-stone-700 leading-relaxed">
    <p><strong>صوت الفلاح</strong> هو منصة رقمية تونسية رائدة تهدف إلى رقمنة القطاع الفلاحي في تونس. نحن نؤمن بأن التكنولوجيا هي المفتاح لتمكين الفلاح الصغير والمتوسط وتسهيل وصوله إلى الأسواق.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">رؤيتنا</h3>
    <p>خلق بيئة فلاحية شفافة، عادلة، ومربحة لجميع الأطراف من خلال ربط المنتج بالمستهلك والتاجر مباشرة، وتقليل الهدر وتكاليف الوساطة.</p>
    
    <h3 class="text-xl font-bold text-stone-900 mt-8">قيمنا</h3>
    <ul class="list-disc list-inside space-y-2 pr-4">
      <li><strong>الشفافية:</strong> معلومات واضحة وأسعار حقيقية مباشرة من المنتج.</li>
      <li><strong>التضامن:</strong> دعم الفلاح التونسي وتعزيز السيادة الغذائية للبلاد.</li>
      <li><strong>الابتكار:</strong> توفير أدوات تكنولوجية بسيطة وفعالة في متناول الجميع.</li>
      <li><strong>الجودة:</strong> تشجيع المنتجات المحلية عالية الجودة وذات المصدر المعروف.</li>
    </ul>

    <h3 class="text-xl font-bold text-stone-900 mt-8">مهمتنا</h3>
    <p>تزويد الفلاحين بالأدوات التي يحتاجونها لإدارة تجارتهم بنجاح، وتوفير تجربة تسوق فريدة للمستهلك التونسي تضمن له نضارة المنتج وسعره العادل.</p>
  </div>
`

export default async function AboutPage() {
  const dbPage = await getStaticPage('about')
  return (
    <PublicPageShell 
      title={dbPage?.title || 'من نحن'} 
      subtitle="حكاية صوت الفلاح ورؤيتنا للمستقبل الفلاحي في تونس"
    >
      <div className="prose-ar" dangerouslySetInnerHTML={{ __html: dbPage?.content || FALLBACK_CONTENT }} />
    </PublicPageShell>
  )
}
