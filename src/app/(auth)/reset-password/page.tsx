import type { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'تعيين كلمة مرور جديدة',
  description: 'عيّن كلمة مرور جديدة لحسابك في صوت الفلاح',
}

/**
 * Server Component: exports metadata, renders client ResetPasswordForm.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
