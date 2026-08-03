import { createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doubtId } = body

    if (!doubtId) {
      return NextResponse.json({ error: 'Missing doubtId parameter' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured in .env.local' }, { status: 500 })
    }

    const serviceClient = createServiceRoleClient()

    // Step 1: Check if doubt exists and is open
    const { data: doubt, error: doubtErr } = await serviceClient
      .from('doubts')
      .select('id, subject, title, description, status')
      .eq('id', doubtId)
      .single()

    if (doubtErr || !doubt) {
      return NextResponse.json({ error: 'Doubt not found' }, { status: 404 })
    }

    // Step 2: Get or create the official AI Bot user ('BSPREP AI') with custom chatbot image
    const botEmail = 'ai@bsprep.in'
    const botFirstName = 'BSPREP'
    const botLastName = 'AI'
    const botAvatar = '/bsprep_chatbot.png'

    let botUserId: string | null = null

    // Check if profile already exists by email
    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('email', botEmail)
      .maybeSingle()

    if (existingProfile) {
      botUserId = existingProfile.id
      // Ensure existing bot profile always has our custom AI SVG image attached
      await serviceClient.from('profiles').update({
        profile_picture_url: botAvatar,
        avatar_url: botAvatar,
        role: 'mentor'
      }).eq('id', botUserId)
    } else {
      // Search in Auth users by email
      const { data: authList } = await serviceClient.auth.admin.listUsers()
      const foundUser = authList?.users?.find(u => u.email?.toLowerCase() === botEmail.toLowerCase())

      if (foundUser) {
        botUserId = foundUser.id
      } else {
        // Create the Auth User for the Bot
        const { data: newUser, error: createErr } = await serviceClient.auth.admin.createUser({
          email: botEmail,
          password: 'BSPrep_AI_Secure_Bot_2026!',
          email_confirm: true,
          user_metadata: {
            first_name: botFirstName,
            last_name: botLastName,
            role: 'mentor',
            full_name: `${botFirstName} ${botLastName}`,
            avatar_url: botAvatar
          }
        })

        if (createErr || !newUser.user) {
          console.error('Error creating bot auth user:', createErr)
          return NextResponse.json({ error: 'Failed to initialize AI bot user' }, { status: 500 })
        }
        botUserId = newUser.user.id
      }

      // Ensure profile exists with mentor verified badges and bot SVG avatar
      if (botUserId) {
        await serviceClient.from('profiles').upsert({
          id: botUserId,
          email: botEmail,
          first_name: botFirstName,
          last_name: botLastName,
          role: 'mentor',
          profile_picture_url: botAvatar,
          avatar_url: botAvatar
        }, { onConflict: 'id' })
      }
    }

    if (!botUserId) {
      return NextResponse.json({ error: 'Could not obtain Bot User ID' }, { status: 500 })
    }

    // Step 3: Concurrency protection & Strict Once-Per-Doubt Rule
    // Check if ANY reply from our bot already exists for this doubt
    const { data: existingBotReplies } = await serviceClient
      .from('doubt_replies')
      .select('id')
      .eq('doubt_id', doubtId)
      .eq('user_id', botUserId)
      .limit(1)

    if (existingBotReplies && existingBotReplies.length > 0) {
      return NextResponse.json({ 
        status: 'skipped', 
        message: 'bsprepio ai has already replied or is currently generating a reply for this doubt.' 
      }, { status: 200 })
    }

    // Insert a placeholder lock reply immediately BEFORE calling OpenRouter to prevent parallel race conditions (duplicate replies)!
    const { data: lockReply, error: lockErr } = await serviceClient
      .from('doubt_replies')
      .insert({
        doubt_id: doubtId,
        user_id: botUserId,
        content: '🧠 *BSPREP AI is reading your question and composing a human-friendly explanation...*',
        is_official_answer: true
      })
      .select()
      .single()

    if (lockErr || !lockReply) {
      console.error('Failed to create concurrency lock reply:', lockErr)
      return NextResponse.json({ error: 'Could not lock reply execution' }, { status: 500 })
    }

    // Step 4: Call OpenRouter API for a clean, humanized, understandable answer
    const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bsprep.in',
        'X-Title': 'BSPrep.io AI'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are 'bsprepio ai', a friendly, highly knowledgeable TA and peer mentor helping students pursuing the IIT Madras BS Degree on BSPrep.in.
Your goal is to explain concepts in an exceptionally clear, warm, conversational, and humanized tone without any "AI slop" or rigid corporate phrasing.

CRITICAL RULES:
1. Speak straightforwardly like a friendly human mentor answering a question during office hours.
2. NEVER use rigid headers like "Official Academic Mentor Response", "Here is a structured breakdown", "As an AI mentor", or repetitious disclaimers/outros. Dive straight into a natural, understandable answer.
3. Keep explanations practical, easy to grasp, and neatly formatted with clean Markdown.
4. For programming courses (Python, Java, Web Dev, C, DBMS): When correcting code or demonstrating solutions, provide clean syntax-highlighted code blocks (e.g. \`\`\`python) with helpful comments explaining WHY the bug occurred or why the logic works.
5. For mathematics & statistics: Use clean readable Markdown formatting for equations and step-by-step logical deductions.
6. If asked about the Student Ambassador program, enthusiastically share that applications are OPEN! Provide this application link: https://unstop.com/p/student-ambassador-program-bsprep-1720364?lb=usePftiW&utm_medium=Share&utm_source=competitions&utm_campaign=Sozyuihw88836`
          },
          {
            role: 'user',
            content: `Course/Subject: ${doubt.subject}\nTitle: ${doubt.title}\nStudent Doubt: ${doubt.description}\n\nPlease help resolve this doubt in a humanized, highly understandable manner.`
          }
        ],
        temperature: 0.45,
        max_tokens: 2000
      })
    })

    let aiContent = 'Sorry, I ran into a network glitch while analyzing your doubt! Please check back shortly or let a human mentor take a look.'

    if (openRouterResponse.ok) {
      const aiResult = await openRouterResponse.json()
      const content = aiResult.choices?.[0]?.message?.content?.trim()
      if (content) {
        aiContent = content
      }
    } else {
      const errText = await openRouterResponse.text()
      console.error('OpenRouter failed:', errText)
    }

    // Step 5: Update the exact lock reply with the finished humanized response
    const { data: updatedReply, error: updateErr } = await serviceClient
      .from('doubt_replies')
      .update({ content: aiContent })
      .eq('id', lockReply.id)
      .select()
      .single()

    if (updateErr) {
      console.error('Error updating AI reply row:', updateErr)
    }

    return NextResponse.json({
      status: 'success',
      botName: 'bsprepio ai',
      replyId: lockReply.id
    }, { status: 200 })

  } catch (error: any) {
    console.error('Unexpected error in ai-reply route:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}
