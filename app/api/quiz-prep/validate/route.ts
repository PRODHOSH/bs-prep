import { NextResponse } from "next/server"
import { validateQuestionToken } from "@/lib/quiz-drive-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionToken, selectedOptionId, attemptId, timeTakenSeconds } =
      body as {
        questionToken: string
        selectedOptionId: string
        attemptId?: string
        timeTakenSeconds?: number
      }

    if (!questionToken || !selectedOptionId) {
      return NextResponse.json(
        { error: "questionToken and selectedOptionId are required" },
        { status: 400 }
      )
    }

    const result = validateQuestionToken(questionToken, selectedOptionId)

    if (!result.isValid) {
      return NextResponse.json(
        { error: "Invalid or tampered question token" },
        { status: 400 }
      )
    }

    const xpGained = result.isCorrect ? 20 : 0

    // Persist to Supabase if the user is authenticated
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("question_submissions").insert({
          user_id: user.id,
          attempt_id: attemptId ?? null,
          question_folder_id: "token-verified",
          selected_option_id: selectedOptionId,
          is_correct: result.isCorrect,
          time_taken_seconds: timeTakenSeconds ?? 0,
          xp_gained: xpGained,
        })
      }
    } catch {
      // Non-critical - do not fail the request if DB write fails
    }

    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      xpGained,
      message: result.isCorrect
        ? "Correct answer."
        : "Incorrect answer.",
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
