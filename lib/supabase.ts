import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` }
  })
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserRole = async () => {
  const user = await getCurrentUser()
  return user?.user_metadata?.role || null
}

export const signOut = async () => {
  await supabase.auth.signOut()
  window.location.href = '/'
}
