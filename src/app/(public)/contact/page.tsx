import type { Metadata } from 'next'
import PublicPageShell from '@/components/public/PublicPageShell'
import ContactForm from '@/components/public/ContactForm'
import { Phone, Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'اتصل بنا — صوت الفلاح' }

export default function ContactPage() {
  return (
    <PublicPageShell 
      title="اتصل بنا" 
      subtitle="نحن هنا للإجابة على استفساراتكم ومساعدتكم في أي وقت"
    >
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="rounded-2xl bg-brand-50 p-6">
            <h3 className="mb-4 text-xl font-bold text-brand-800">معلومات التواصل</h3>
            <div className="space-y-6">
              <a 
                href="https://wa.me/21600000000" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-stone-700 hover:text-brand-600 transition-colors group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-sm group-hover:scale-110 transition-transform">
                  <MessageCircle size={24}/>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">واتساب</p>
                  <p className="font-bold" dir="ltr">+216 00 000 000</p>
                </div>
              </a>

              <div className="flex items-center gap-4 text-stone-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-200 text-brand-700">
                  <Phone size={24}/>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">الهاتف</p>
                  <p className="font-bold" dir="ltr">+216 11 111 111</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-stone-700">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-200 text-brand-700">
                  <Mail size={24}/>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">البريد الإلكتروني</p>
                  <p className="font-bold">contact@sawt-elfalleh.tn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-6">
            <h3 className="mb-2 font-bold text-stone-900">ساعات العمل</h3>
            <p className="text-stone-500 leading-relaxed">
              فريق الدعم الفني متواجد لمساعدتكم من الإثنين إلى الجمعة.
              <br />
              التوقيت: من 9:00 صباحاً إلى 5:00 مساءً.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-stone-900 mb-2">أرسل لنا رسالة</h3>
            <p className="text-stone-500">لديك اقتراح أو مشكلة فنية؟ املأ النموذج وسنرد عليك في أقرب وقت.</p>
          </div>
          <ContactForm />
        </div>
      </div>
    </PublicPageShell>
  )
}
