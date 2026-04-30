import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getMyProfile,
  getNotificationSettings,
} from '@/lib/queries/profile.queries'
import NotificationSettingsForm from '@/components/settings/NotificationSettingsForm'
import ShowPhoneToggle from '@/components/settings/ShowPhoneToggle'
import { ChevronLeft, User, Bell, Lock, Shield } from 'lucide-react'

export const metadata = {
  title: 'الإعدادات — صوت الفلاح',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profile, notifSettings] = await Promise.all([
    getMyProfile(user.id),
    getNotificationSettings(user.id),
  ])

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f9f6f0]" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">الإعدادات</h1>
          <p className="text-stone-500 text-sm mt-1">
            إدارة حسابك وتفضيلاتك
          </p>
        </div>

        {/* Profile Quick Link */}
        <section className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
              الملف الشخصي
            </h2>
          </div>
          <Link
            href="/settings/profile"
            className="flex items-center justify-between p-5 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  تعديل الملف الشخصي
                </p>
                <p className="text-xs text-stone-500">
                  الاسم، الصورة، الأنشطة، الولايات المتابَعة
                </p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-stone-400" />
          </Link>
        </section>

        {/* Privacy: Show Phone */}
        <section className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
              الخصوصية
            </h2>
          </div>
          <div className="p-5">
            <ShowPhoneToggle initialValue={profile.show_phone ?? true} />
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-white rounded-2xl border border-stone-200 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-stone-500" />
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
                الإشعارات
              </h2>
            </div>
          </div>
          <div className="p-5">
            {notifSettings ? (
              <NotificationSettingsForm settings={notifSettings} />
            ) : (
              <p className="text-stone-400 text-sm">
                إعدادات الإشعارات غير متوفرة
              </p>
            )}
          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
              الحساب
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    البريد الإلكتروني
                  </p>
                  <p className="text-xs text-stone-400">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    كلمة المرور
                  </p>
                  <p className="text-xs text-stone-400">تغيير كلمة المرور</p>
                </div>
              </div>
              <Link
                href="/forgot-password"
                className="text-xs text-green-600 hover:underline font-semibold"
              >
                تغيير
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
