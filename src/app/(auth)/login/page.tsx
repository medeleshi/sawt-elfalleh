import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'سجّل دخولك إلى صوت الفلاح — السوق الفلاحي التونسي',
}

/**
 * Server Component: exports metadata, renders client LoginForm.
 */
export default function LoginPage() {
  return <LoginForm />
}
