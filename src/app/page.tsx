// src/app/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  
  // إذا كان المستخدم مسجل دخوله، وجهه إلى الداشبورد
  if (token) {
    redirect('/dashboard')
  }
  
  // وإلا وجهه إلى صفحة تسجيل الدخول
  redirect('/login')
}