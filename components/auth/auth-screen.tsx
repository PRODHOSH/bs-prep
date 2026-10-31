"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { processReferral } from "@/app/actions/referral"
import { safeNext } from "@/lib/auth-next"

export type AuthMode = "login" | "register" | "forgot"

const PATH: Record<AuthMode, string> = { login: "/auth/login", register: "/auth/register", forgot: "/auth/forgot" }
const COPY: Record<AuthMode, { title: string; hint: string; art: string; artTitle: string; artText: string }> = {
  login: { title: "Welcome back", hint: "Sign in to pick up where you left off.", art: "/illustrations/auth.svg", artTitle: "Good to see you again", artText: "Your courses, notes and practice tests are right where you left them." },
  register: { title: "Create your account", hint: "Free to join. It takes a minute.", art: "/illustrations/community.svg", artTitle: "Study with people like you", artText: "Join Tamil-speaking IITM BS students who help each other through the degree." },
  forgot: { title: "Reset your password", hint: "Enter your email and we will send a reset link.", art: "/illustrations/auth.svg", artTitle: "It happens to everyone", artText: "We will email you a link to choose a new password." },
}

const input = "h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm font-medium text-black outline-none transition-colors placeholder:text-black/40 focus:border-[#0a192f]"
const primary = "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0a192f] text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#112a52] disabled:opacity-60"
const label = "mb-1.5 block px-2 text-xs font-bold text-black/60"

function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } })
    setTimeout(() => setBusy(false), 8000)
  }
  return (
    <button type="button" onClick={go} disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white text-sm font-bold text-black transition-colors hover:bg-black/5 disabled:opacity-60">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      Continue with Google
    </button>
  )
}

function PasswordField({ id, value, onChange, placeholder = "Password", autoComplete }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} required className={`${input} pr-12`} suppressHydrationWarning />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function Error({ message }: { message: string | null }) {
  if (!message) return null
  return <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{message}</p>
}

function LoginForm({ next, go }: { next: string; go: (m: AuthMode) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return setError("Enter a valid email address.")
    setBusy(true)
    setError(null)
    const { error } = await createClient().auth.signInWithPassword({ email: trimmed, password })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    window.location.href = next
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className={input} suppressHydrationWarning />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={label}>Password</label>
          <button type="button" onClick={() => go("forgot")} className="mb-1.5 px-2 text-xs font-bold text-black/60 hover:text-black">Forgot password?</button>
        </div>
        <PasswordField id="password" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>
      <Error message={error} />
      <button type="submit" disabled={busy} className={primary}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}</button>
      <div className="flex items-center gap-3 text-xs font-bold text-black/40"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></div>
      <GoogleButton next={next} />
      <p className="pt-2 text-center text-sm font-medium text-black/60">
        New here? <button type="button" onClick={() => go("register")} className="font-bold text-black hover:underline">Create an account</button>
      </p>
    </form>
  )
}

function RegisterForm({ next, go }: { next: string; go: (m: AuthMode) => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [referral, setReferral] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const c = document.cookie.split(";").find((x) => x.trim().startsWith("bsprep_ref="))
    if (c) setReferral(c.split("=")[1])
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (name.trim().length < 2) return setError("Enter your full name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return setError("Enter a valid email address.")
    if (password.length < 8) return setError("Use at least 8 characters for the password.")
    if (password !== repeat) return setError("The two passwords do not match.")
    if (!agreed) return setError("Please accept the Terms & Conditions.")
    setBusy(true)
    setError(null)
    try {
      const { data, error } = await createClient().auth.signUp({
        email: trimmed,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { first_name: name.trim(), last_name: "", role: "student" } },
      })
      if (error) throw error
      if (data.user && referral) await processReferral(data.user.id, referral)
      setSent(true)
    } catch (err) {
      setError(err instanceof globalThis.Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-7 w-7" /></span>
        <h2 className="text-2xl font-black tracking-tight text-black">Check your email</h2>
        <p className="text-sm font-medium text-black/60">We sent a confirmation link to <span className="font-bold text-black">{email}</span>. Open it to finish creating your account.</p>
        <button type="button" onClick={() => go("login")} className={primary}>Back to log in</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div>
        <label htmlFor="name" className={label}>Full name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required className={input} suppressHydrationWarning />
      </div>
      <div>
        <label htmlFor="remail" className={label}>Email</label>
        <input id="remail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className={input} suppressHydrationWarning />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="rpass" className={label}>Password</label>
          <PasswordField id="rpass" value={password} onChange={setPassword} placeholder="8+ characters" autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="rrepeat" className={label}>Repeat password</label>
          <PasswordField id="rrepeat" value={repeat} onChange={setRepeat} placeholder="Same again" autoComplete="new-password" />
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 px-2 pt-1 text-sm font-medium text-black/70">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0a192f]" />
        <span>I agree to the <Link href="/terms" className="font-bold text-black underline underline-offset-2">Terms & Conditions</Link>.</span>
      </label>
      <Error message={error} />
      <button type="submit" disabled={busy} className={primary}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}</button>
      <div className="flex items-center gap-3 text-xs font-bold text-black/40"><span className="h-px flex-1 bg-black/10" />or<span className="h-px flex-1 bg-black/10" /></div>
      <GoogleButton next={next} />
      <p className="pt-1 text-center text-sm font-medium text-black/60">
        Already have an account? <button type="button" onClick={() => go("login")} className="font-bold text-black hover:underline">Log in</button>
      </p>
    </form>
  )
}

function ForgotForm({ go }: { go: (m: AuthMode) => void }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/update-password` })
    if (error) setError(error.message)
    else setSent(true)
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-7 w-7" /></span>
        <h2 className="text-2xl font-black tracking-tight text-black">Reset link sent</h2>
        <p className="text-sm font-medium text-black/60">If <span className="font-bold text-black">{email}</span> has an account, a link is on its way. Check spam if you do not see it.</p>
        <button type="button" onClick={() => go("login")} className={primary}>Back to log in</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="femail" className={label}>Email</label>
        <input id="femail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className={input} suppressHydrationWarning />
      </div>
      <Error message={error} />
      <button type="submit" disabled={busy} className={primary}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}</button>
      <button type="button" onClick={() => go("login")} className="mx-auto flex items-center gap-1.5 text-sm font-bold text-black/60 hover:text-black">
        <ArrowLeft className="h-4 w-4" /> Back to log in
      </button>
    </form>
  )
}

/**
 * Log in, register and forgot password on one screen. The picture and the form trade sides
 * when the mode changes; the address changes with it, so every state still has its own link.
 */
export function AuthScreen({ initial, next }: { initial: AuthMode; next?: string }) {
  const [mode, setMode] = useState<AuthMode>(initial)
  const target = safeNext(next)
  const imageRight = mode !== "login"
  const copy = COPY[mode]

  useEffect(() => {
    const onPop = () => {
      const m = (Object.keys(PATH) as AuthMode[]).find((k) => window.location.pathname.startsWith(PATH[k]))
      if (m) setMode(m)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  function go(m: AuthMode) {
    if (m === mode) return
    setMode(m)
    const qs = next ? `?next=${encodeURIComponent(next)}` : ""
    window.history.pushState(null, "", PATH[m] + qs)
  }

  const slide = "lg:transition-[left] lg:duration-700 lg:ease-[cubic-bezier(0.7,0,0.2,1)]"

  return (
    <div className="fixed inset-0 overflow-y-auto bg-white lg:overflow-hidden">
      <section className={`flex min-h-full flex-col px-5 py-5 sm:px-10 sm:py-6 lg:absolute lg:inset-y-0 lg:min-h-0 lg:w-1/2 ${slide} ${imageRight ? "lg:left-0" : "lg:left-1/2"}`}>
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-black">
            <img src="/new-logo-favicon.png" alt="" className="h-8 w-8" /> BSPREP
          </Link>
          <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 px-4 text-sm font-bold text-black transition-colors hover:border-black/40">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <div key={mode} className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-3xl font-black tracking-tight text-black sm:text-[2rem]">{copy.title}</h1>
            <p className="mb-7 mt-1.5 text-sm font-medium text-black/60">{copy.hint}</p>
            {mode === "login" && <LoginForm next={target} go={go} />}
            {mode === "register" && <RegisterForm next={target} go={go} />}
            {mode === "forgot" && <ForgotForm go={go} />}
          </div>
        </main>

        <footer className="text-center text-xs font-medium text-black/40">Free notes, practice tests and mentors for IITM BS students.</footer>
      </section>

      <aside
        aria-hidden
        className={`absolute hidden overflow-hidden bg-[#FDFBF7] lg:inset-y-0 lg:block lg:w-1/2 ${slide} ${imageRight ? "lg:left-1/2" : "lg:left-0"}`}
      >
        <p className="absolute left-10 top-7 text-xs font-bold tracking-[0.2em] text-black/40">IITM BS · TAMIL COMMUNITY</p>
        <div key={mode} className="absolute inset-0 flex animate-in fade-in flex-col items-center justify-center px-12 duration-700">
          <img src={copy.art} alt="" className="max-h-[48vh] w-auto max-w-full" />
          <h2 className="mt-10 max-w-md text-center text-3xl font-black leading-tight tracking-tight text-black">{copy.artTitle}</h2>
          <p className="mt-3 max-w-sm text-center text-sm font-medium text-black/60">{copy.artText}</p>
        </div>
      </aside>
    </div>
  )
}
