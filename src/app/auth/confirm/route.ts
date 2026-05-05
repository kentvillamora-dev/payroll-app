import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth/reset-password'

  if (token_hash && type) {
    const supabase = await createClient()

    // FORCE LOGOUT: Ensure no existing session interferes with the new invite
    // scope: 'local' ensures we only sign out of the current browser
    await supabase.auth.signOut({ scope: 'local' })

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // If verification is successful, redirect to the reset-password page
      // The session is now established in the cookies
      return redirect(next)
    }
  }

  // If there's an error or no token, send them back to the home page with an error
  return redirect('/?error=Could not verify link. It may have expired.')
}
