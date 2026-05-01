import type { Metadata } from 'next'
import Link from 'next/link'
import { Sprout, ShoppingBag, Plus, ShieldCheck, Users, Smartphone } from 'lucide-react'
import { ROUTES, APP_NAME, APP_DESCRIPTION } from '@/lib/utils/constants'
import { getLandingCategories } from '@/lib/queries/static-pages.queries'

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_DESCRIPTION}`,
  description: 'أكبر سوق فلاحي تونسي. تواصل مباشرة مع الفلاحين والتجار، بيع واشري منتجاتك بكل سهولة وأمان.',
}

export default async function LandingPage() {
  const categories = await getLandingCategories()

  return (
    <div className="landing-page" dir="rtl">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-700 to-brand-600 px-4 py-20 text-center sm:py-32">
        {/* Abstract backgrounds */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10" aria-hidden="true">
           <span className="absolute left-10 top-10 text-[200px]">🌾</span>
           <span className="absolute bottom-10 right-10 text-[150px]">🚜</span>
        </div>

        <div className="container relative z-10 mx-auto">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              مرحباً بك في <span className="text-brand-100">{APP_NAME}</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-brand-50 sm:text-xl">
              سوقك الفلاحي الرقمي في تونس. تواصل مباشرة مع المنتج، وفر في المصاريف، ووسع تجارتك بضغطة زر.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ROUTES.REGISTER}
                className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-brand-700 shadow-xl transition-all hover:scale-105 hover:bg-brand-50"
              >
                انضم إلينا الآن
              </Link>
              <Link
                href={ROUTES.MARKETPLACE}
                className="flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <ShoppingBag className="h-5 w-5" />
                تصفح السوق
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">لماذا صوت الفلاح؟</h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-brand-500" />
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <BenefitCard
              icon={<Users className="h-8 w-8 text-brand-600" />}
              title="تواصل مباشر"
              description="لا وجود للوسطاء. تواصل مباشرة مع الفلاح أو التاجر عبر الهاتف أو واتساب."
            />
            <BenefitCard
              icon={<ShieldCheck className="h-8 w-8 text-brand-600" />}
              title="ثقة وأمان"
              description="نظام تقييم ومراجعة يضمن لك التعامل مع أفضل المنتجين في منطقتك."
            />
            <BenefitCard
              icon={<Smartphone className="h-8 w-8 text-brand-600" />}
              title="سهولة الاستخدام"
              description="تطبيق مصمم خصيصاً ليكون بسيطاً ومريحاً لكل الفئات العمرية."
            />
          </div>
        </div>
      </section>

      {/* ── Categories Section ──────────────────────────────────── */}
      <section className="bg-stone-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900">تصفح حسب الأصناف</h2>
            <Link href={ROUTES.MARKETPLACE} className="text-sm font-bold text-brand-600 hover:underline">عرض الكل</Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`${ROUTES.MARKETPLACE}?category_id=${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <span className="text-4xl transition-transform group-hover:scale-110">{cat.icon || '📦'}</span>
                <span className="text-sm font-bold text-stone-700">{cat.name_ar}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-stone-900">كيف يعمل صوت الفلاح؟</h2>
            <p className="mt-4 text-stone-500">اربع خطوات بسيطة لتبدأ تجارتك</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-4">
            <StepCard number="1" title="أنشئ حسابك" desc="سجل كفلاح، تاجر، أو مواطن في ثوانٍ." />
            <StepCard number="2" title="أضف إعلانك" desc="صور منتجك، حدد السعر والكمية وانشر." />
            <StepCard number="3" title="استقبل العروض" desc="تواصل مع المهتمين عبر هاتفك مباشرة." />
            <StepCard number="4" title="أتمم الصفقة" desc="قابل المشتري أو البائع وسلم أمانتك." />
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────── */}
      <section className="bg-brand-900 py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-3xl font-bold">جاهز لتبدأ اليوم؟</h2>
          <p className="mb-8 text-brand-200">انضم لأكبر تجمع فلاحي في تونس وزد مبيعاتك.</p>
          <Link
            href={ROUTES.REGISTER}
            className="inline-block rounded-xl bg-brand-500 px-10 py-4 text-lg font-bold transition-all hover:bg-brand-400"
          >
            سجل الآن مجاناً
          </Link>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({ icon, title, description }: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-stone-900">{title}</h3>
      <p className="text-stone-500">{description}</p>
    </div>
  )
}

function StepCard({ number, title, desc }: any) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white shadow-lg">
        {number}
      </div>
      <h3 className="mb-2 font-bold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500">{desc}</p>
    </div>
  )
}
