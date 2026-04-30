import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'إنشاء حساب',
  description: 'أنشئ حسابك في صوت الفلاح وانضم إلى السوق الفلاحي التونسي',
}

/**
 * Server Component: exports metadata, renders client RegisterForm.
 */
export default function RegisterPage() {
  return <RegisterForm />
}
