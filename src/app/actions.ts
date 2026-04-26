'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import nodemailer from 'nodemailer'

// 1. Auth: Sign In
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

// 2. Auth: Sign Out
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/')
}

// 3. Admin: Invite Employee (Manual Email via Gmail)
export async function inviteEmployee(formData: FormData) {
  const adminClient = await createAdminClient()

  // Extract Form Data
  const email = formData.get('email') as string
  const employeeId = formData.get('employee_id') as string
  const firstName = formData.get('first_name') as string
  const middleName = formData.get('middle_name') as string || null
  const lastName = formData.get('last_name') as string
  const suffix = formData.get('suffix') as string || null

  // 1. Validation: Exactly 6 digits
  if (!/^\d{6}$/.test(employeeId)) {
    return { error: 'Employee ID must be exactly 6 digits (numbers only).' }
  }

  // 2. Check for Duplicate Employee ID BEFORE creating auth user
  const { data: existingEmp } = await adminClient
    .from('employees')
    .select('employee_id')
    .eq('employee_id', employeeId)
    .single()

  if (existingEmp) {
    return { error: `Employee ID ${employeeId} is already assigned to another staff member.` }
  }

  // 3. Generate Secure Invite Link from Supabase
  // Note: We use 'invite' type. This link will let the user set their password.
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email: email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    }
  })

  if (inviteError) {
    console.error('Supabase Invite Error:', inviteError.message)
    return { error: `Failed to generate invite link: ${inviteError.message}` }
  }

  const { user } = inviteData
  const inviteLink = inviteData.properties.action_link

  // 2. Create the record in our custom 'employees' table
  const { error: dbError } = await adminClient
    .from('employees')
    .insert({
      id: user.id,
      employee_id: employeeId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix: suffix,
      personal_email: email,
      role: 'employee',
      status: 'active'
    })

  if (dbError) {
    // If DB fails, we should technically delete the auth user to keep it clean, 
    // but for now we'll just report the error.
    console.error('Database Error:', dbError.message)
    return { error: `User created but profile failed: ${dbError.message}` }
  }

  // 3. Send the Email via Gmail (Manual Option B)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"Ourus.app HR" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to Ourus.app - Set up your account`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0284c7;">Welcome to the team, ${firstName}!</h2>
          <p>You have been added to the <strong>Ourus.app</strong> payroll system. Your Employee ID is <strong>${employeeId}</strong>.</p>
          <p>To access your dashboard and manage your payroll, please click the button below to set up your password:</p>
          <div style="margin: 32px 0;">
            <a href="${inviteLink}" style="background-color: #0284c7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Set Up Your Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If you were not expecting this email, please ignore it.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
  } catch (emailError: any) {
    console.error('Email Delivery Error:', emailError)
    return { error: `Employee added but email failed to send: ${emailError.message}. You can manually give them this link: ${inviteLink}` }
  }

  revalidatePath('/admin')
  return { success: true }
}

// 4. Auth: Update Password (for new employees)
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  // After setting the password, send them to the home page or a dashboard
  // For now, we'll send them to a simple "Success" or back home to log in
  return { success: true }
}
