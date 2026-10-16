"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

type State = "idle" | "loading" | "done" | "error"

function UnsubscribeCard() {
  const params = useSearchParams()
  const email = params.get("e") ?? ""
  const token = params.get("t") ?? ""
  const [state, setState] = useState<State>("idle")
  const [message, setMessage] = useState("")

  async function confirm() {
    setState("loading")
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e: email, t: token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong.")
      setState("done")
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.")
      setState("error")
    }
  }

  const invalid = !email || !token

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-zinc-900">
        {state === "done" ? "You're unsubscribed" : "Unsubscribe from BSPrep emails"}
      </h1>
      {invalid ? (
        <p className="mt-3 text-sm text-zinc-600">This unsubscribe link is incomplete. Please use the link from your email.</p>
      ) : state === "done" ? (
        <p className="mt-3 text-sm text-zinc-600">
          <span className="font-medium text-zinc-900">{email}</span> won&apos;t receive any more emails from us.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-zinc-600">
            Stop emails to <span className="font-medium text-zinc-900">{email}</span>?
          </p>
          {state === "error" && <p className="mt-3 text-sm text-red-600">{message}</p>}
          <button
            onClick={confirm}
            disabled={state === "loading"}
            className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {state === "loading" ? "Unsubscribing…" : "Confirm unsubscribe"}
          </button>
        </>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Suspense>
        <UnsubscribeCard />
      </Suspense>
    </main>
  )
}
