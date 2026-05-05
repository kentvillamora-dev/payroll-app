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
    console.error('SUPABASE LOGIN ERROR:', error.message)
    return redirect(`/?error=Authentication failed: ${error.message}`)
  }

  return redirect('/admin')
}

// 2. Auth: Sign Out
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'local' })
  return redirect('/')
}

// 3. Admin: Invite Employee (Manual Email via Gmail)
export async function inviteEmployee(formData: FormData) {
  const adminClient = await createAdminClient()
  const supabase = await createClient()

  // 1. Identify the Inviter (The spreadsheet "User" running the action)
  const { data: { user: inviter } } = await supabase.auth.getUser()
  if (!inviter) return { error: 'Not authenticated' }

  // 2. Check Roles: Is this a Platform Admin?
  const { data: platformAdmin } = await adminClient
    .from('platform_admins')
    .select('id')
    .eq('id', inviter.id)
    .single()

  // 3. Extract Form Data
  const email = formData.get('email') as string // Personal email for notification
  const employeeId = formData.get('employee_id') as string
  const firstName = formData.get('first_name') as string
  const middleName = formData.get('middle_name') as string || null
  const lastName = formData.get('last_name') as string
  const suffix = formData.get('suffix') as string || null
  const roleId = formData.get('role_id') as string
  
  // Decide which company this user belongs to
  // If Platform Admin, use the form's selection. If Company Admin, use their own company.
  let targetCompanyId = formData.get('company_id') as string
  if (!platformAdmin) {
    const { data: userData } = await adminClient
      .from('users')
      .select('company_id')
      .eq('id', inviter.id)
      .single()
    
    if (!userData) return { error: 'Inviter has no company assigned' }
    targetCompanyId = userData.company_id
  }

  // 4. Fetch the Company Domain for Work Email generation
  const { data: company } = await adminClient
    .from('companies')
    .select('email_domain')
    .eq('id', targetCompanyId)
    .single()
  
  if (!company) return { error: 'Company not found' }

  // 5. AUTO-GENERATE WORK EMAIL (Rule: initial + initial + id @ domain)
  const workEmail = `${firstName[0]}${lastName[0]}${employeeId}@${company.email_domain}`.toLowerCase()

  // 6. Validation: Exactly 6 digits
  if (!/^\d{6}$/.test(employeeId)) {
    return { error: 'Employee ID must be exactly 6 digits.' }
  }

  // 7. Check for Duplicate Work Email or ID
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id')
    .eq('company_id', targetCompanyId)
    .eq('employee_id', employeeId)
    .single()

  if (existingUser) {
    return { error: `Employee ID ${employeeId} already exists in this company.` }
  }

  // 8. Provision Auth for the WORK EMAIL (This will be their username)
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email: workEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    }
  })

  if (inviteError) {
    console.error('Supabase Invite Error:', inviteError.message)
    return { error: `Auth provision failed: ${inviteError.message}` }
  }

  const { user } = inviteData
  const inviteLink = inviteData.properties.action_link

  // 9. Create the profile record
  const { error: dbError } = await adminClient
    .from('users')
    .insert({
      id: user.id,
      company_id: targetCompanyId,
      employee_id: employeeId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix: suffix,
      email: workEmail, // The Login Identity
      work_email: workEmail,
      is_active: true,
      created_by: inviter.id,
      modified_by: inviter.id
    })

  if (dbError) {
    console.error('Database Error:', dbError.message)
    return { error: `Profile creation failed: ${dbError.message}` }
  }

  // 10. Assign the Selected Role (The 'Role Assignment' bridge)
  const { error: roleError } = await adminClient
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: roleId,
      created_by: inviter.id,
      modified_by: inviter.id
    })

  if (roleError) {
    console.error('Role Assignment Error:', roleError.message)
    // We don't stop here, but we should log it.
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
