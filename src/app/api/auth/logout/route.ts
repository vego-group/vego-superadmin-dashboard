import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ROOT_API_BASE } from '../../_lib/proxy-handler'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  // Revoke the Sanctum token upstream so it cannot be reused after cookie clear.
  if (token) {
    try {
      await fetch(`${ROOT_API_BASE}/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Cookie clear still proceeds — local session must end even if upstream is down.
    }
  }

  cookieStore.delete('auth-token')
  cookieStore.delete('user-role')
  return NextResponse.json({ success: true })
}
