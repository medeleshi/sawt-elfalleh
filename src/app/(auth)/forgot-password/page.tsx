import type { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'استعادة كلمة المرور',
  description: 'استعد الوصول إلى حسابك في صوت الفلاح',
}

/**
 * Server Component: exports metadata, renders client ForgotPasswordForm.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
