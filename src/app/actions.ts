'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/?error=Authentication failed. Please check your details and try again.')
  }

  return redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}

export async function createEmployee(formData: FormData) {
  const adminClient = await createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Use the Admin Client to create a user
  // This bypasses email confirmation and creates the user immediately
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Mark as confirmed so they can log in immediately
  })

  if (error) {
    console.error('Error creating employee:', error.message)
    return { error: error.message }
  }

  // Refresh the page to show potential changes (like a list of users we'll add later)
  revalidatePath('/admin')
  return { success: true, user: data.user }
}
