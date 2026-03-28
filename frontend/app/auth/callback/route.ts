import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.redirect(url.origin + '/login')

    let role = user.user_metadata?.role
    let ngoType = user.user_metadata?.ngo_type
    const roleFromUrl = url.searchParams.get('role')
    const ngoTypeFromUrl = url.searchParams.get('ngo_type')

    // If no role in metadata, but role in URL, sync them
    if (!role && roleFromUrl) {
      await supabase.auth.updateUser({ 
        data: { role: roleFromUrl, ngo_type: ngoTypeFromUrl } 
      })
      role = roleFromUrl
      ngoType = ngoTypeFromUrl
    }

    const email = user.email || ''
    
    // Government check
    if (role === 'govt') {
      if (!email.endsWith('@tn.gov.in')) {
        await supabase.auth.signOut()
        return NextResponse.redirect(url.origin + '/login?error=invalid_govt_email')
      }
      
      // Check if govt official exists in our table
      const { data: official } = await supabase
        .from('govt_officials')
        .select('id')
        .eq('email', email)
        .single()
      
      if (!official) {
        // Auto-create govt official record
        await supabase.from('govt_officials').insert({
          name: user.user_metadata.full_name || email.split('@')[0],
          email: email,
          department: 'Social Welfare Department',
          state: 'Tamil Nadu'
        })
      }
      return NextResponse.redirect(url.origin + '/govt-dashboard')
    }
    
    // NGO routing
    if (role === 'ngo') {
      if (ngoType === 'new') {
        return NextResponse.redirect(url.origin + '/ngo-register')
      }
      const { data: account } = await supabase
        .from('ngo_accounts')
        .select('verified, status')
        .eq('user_id', user.id)
        .single()
      
      if (account?.verified) return NextResponse.redirect(url.origin + '/ngo-dashboard')
      if (account) return NextResponse.redirect(url.origin + '/ngo-pending')
      return NextResponse.redirect(url.origin + '/ngo-register')
    }
    
    // Donor
    return NextResponse.redirect(url.origin + '/dashboard')
  }
  return NextResponse.redirect(url.origin + '/')
}
