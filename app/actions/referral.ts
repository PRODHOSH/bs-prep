"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function processReferral(userId: string, refCode: string) {
  if (!userId || !refCode) return

  try {
    const supabase = createAdminClient()

    // 1. Lookup ambassador by referral code
    const { data: ambassador, error: ambassadorError } = await supabase
      .from('ambassadors')
      .select('id')
      .eq('referral_code', refCode)
      .single()

    if (ambassadorError || !ambassador) {
      // Ignore if invalid code, as per requirements
      return
    }

    // 2. Fetch user to get their email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    let maskedEmail = null
    if (!userError && userData?.user?.email) {
      const emailParts = userData.user.email.split('@')
      if (emailParts.length === 2) {
        maskedEmail = `${emailParts[0].charAt(0)}**@${emailParts[1]}`
      }
    }

    // 3. Insert into referrals
    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        ambassador_id: ambassador.id,
        referred_user_id: userId,
        referred_user_email: maskedEmail
      })

    if (insertError) {
      console.error('Failed to insert referral:', insertError)
    }
  } catch (error) {
    console.error('Error processing referral:', error)
  }
}
