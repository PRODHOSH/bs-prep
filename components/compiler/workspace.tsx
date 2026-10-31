"use client"

import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Eraser,
  FileCode2,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Sun,
  Terminal,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { manrope } from "@/lib/dashboard-font"
import { codeFont } from "@/lib/compiler-font"
import { CompilerSkeleton } from "@/components/dashboard/skeleton"
import "./compiler.css"

// ── Types ───────────────────────────────────────────────────────────────────
type PyodideRuntime = {
  runPythonAsync: (code: string) => Promise<unknown>
  globals: { set: (k: string, v: unknown) => void; delete: (k: string) => void }
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideRuntime>
    __pyodideScriptPromise?: Promise<void>
  }
}

interface CodeFile {
  id: string
  name: string
  code: string
}

// ── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_CODE = `# cook your dish here

def main():
    print("Hello, World!")

main()`

const DEFAULT_JAVA_CODE = `// cook your dish here

class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`

const DEFAULT_C_CODE = `// cook your dish here

#include <stdio.h>

int main(void) {
  printf("Hello, World!\\n");
  return 0;
}`

const DEFAULT_CPP_CODE = `// cook your dish here

#include <bits/stdc++.h>
using namespace std;

int main() {
  cout << "Hello, World!" << "\\n";
  return 0;
}`

const DEFAULT_CODE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  python: DEFAULT_CODE,
  java: DEFAULT_JAVA_CODE,
  c: DEFAULT_C_CODE,
  cpp: DEFAULT_CPP_CODE,
}

const FILES_KEY   = "cc:python:files"
const ACTIVE_KEY  = "cc:python:active"
const STDIN_KEY   = "cc:python:stdin"
const THEME_KEY   = "cc:compiler:dark"
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/"
const TIMEOUT_MS  = 12_000

// ── Helpers ─────────────────────────────────────────────────────────────────
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("Execution timed out (12 s).")), ms)
    p.then((v) => { clearTimeout(t); res(v) })
     .catch((e) => { clearTimeout(t); rej(e) })
  })
}

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === "string") return e
  try { return JSON.stringify(e) } catch { return "Unknown error" }
}

function uid() {
  return Math.random().toString(36).slice(2)
}

type SupportedLanguage = "python" | "java" | "c" | "cpp"

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "python", label: "Python 3" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
]

function getLanguageFromFileName(fileName: string): SupportedLanguage | null {
  const dot = fileName.lastIndexOf(".")
  const ext = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : ""

  if (ext === "py") return "python"
  if (ext === "java") return "java"
  if (ext === "c") return "c"
  if (ext === "cpp" || ext === "cc" || ext === "cxx") return "cpp"

  return null
}

function getLanguageLabel(fileName: string): string {
  const language = getLanguageFromFileName(fileName)

  if (language === "python") return "Python 3"
  if (language === "java") return "Java"
  if (language === "c") return "C"
  if (language === "cpp") return "C++"

  return "Python 3"
}

function getFileExtensionForLanguage(language: SupportedLanguage): string {
  if (language === "python") return "py"
  if (language === "java") return "java"
  if (language === "c") return "c"
  return "cpp"
}

function getFileNameForLanguage(fileName: string, language: SupportedLanguage): string {
  const trimmed = fileName.trim()
  const dot = trimmed.lastIndexOf(".")
  let base = dot > 0 ? trimmed.slice(0, dot) : trimmed

  if (!base) {
    base = language === "java" ? "Main" : "main"
  }

  if (language === "java") {
    base = "Main"
  }

  return `${base}.${getFileExtensionForLanguage(language)}`
}

function isStarterTemplate(code: string): boolean {
  const value = code.trim()
  return Object.values(DEFAULT_CODE_BY_LANGUAGE).some((tpl) => tpl.trim() === value)
}

/** Encode files array → safe base64 URL param */
function encodeShare(files: CodeFile[]): string {
  const json = JSON.stringify(files.map(f => ({ name: f.name, code: f.code })))
  return btoa(unescape(encodeURIComponent(json)))
}

/** Decode share param → CodeFile array (or null) */
function decodeShare(param: string): CodeFile[] | null {
  try {
    const json = decodeURIComponent(escape(atob(param)))
    const arr  = JSON.parse(json) as Array<{ name: string; code: string }>
    if (!Array.isArray(arr) || arr.length === 0) return null
    return arr.map(f => ({ id: uid(), name: f.name ?? "main.py", code: f.code ?? "" }))
  } catch {
    return null
  }
}

async function loadPyodideScript(): Promise<void> {
  if (typeof window === "undefined") throw new Error("Browser only.")
  if (window.loadPyodide) return
  if (!window.__pyodideScriptPromise) {
    window.__pyodideScriptPromise = new Promise<void>((res, rej) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide="1"]')
      if (existing) {
        if (existing.dataset.loaded) { res(); return }
        existing.addEventListener("load", () => { existing.dataset.loaded = "1"; res() }, { once: true })
        existing.addEventListener("error", () => rej(new Error("CDN load failed")), { once: true })
        return
      }
      const s = document.createElement("script")
      s.src   = `${PYODIDE_CDN}pyodide.js`
      s.async = true
      s.dataset.pyodide = "1"
      s.addEventListener("load",  () => { s.dataset.loaded = "1"; res() }, { once: true })
      s.addEventListener("error", () => rej(new Error("Unable to load Pyodide from CDN.")), { once: true })
      document.head.appendChild(s)
    })
  }
  await window.__pyodideScriptPromise
  if (!window.loadPyodide) throw new Error("Pyodide loader unavailable after script load.")
}

// ── CodeMirror theme ─────────────────────────────────────────────────────────
// Colours come from the workspace's CSS variables, so one theme serves the dashboard (follows the shell)
// and the public page (own light / dark tokens).
const cwTheme = (dark: boolean) =>
  EditorView.theme(
    {
      "&": {
        height: "100%",
        backgroundColor: "var(--cw-card)",
        color: "var(--cw-fg)",
        fontSize: "13.5px",
        fontFamily: "var(--font-code), ui-monospace, Menlo, Consolas, monospace",
      },
      ".cm-content": { padding: "10px 0", caretColor: "var(--cw-primary)" },
      ".cm-gutters": {
        backgroundColor: "var(--cw-muted) !important",
        color: "var(--cw-sub) !important",
        border: "none !important",
        borderRight: "1px solid var(--cw-border) !important",
        minWidth: "44px",
        userSelect: "none",
      },
      ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 6px", textAlign: "right" },
      ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--cw-primary) 7%, transparent) !important" },
      ".cm-activeLineGutter": {
        backgroundColor: "color-mix(in srgb, var(--cw-primary) 10%, transparent) !important",
        color: "var(--cw-fg) !important",
      },
      ".cm-line": { padding: "0 12px" },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--cw-primary) !important", borderLeftWidth: "2px !important" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
        backgroundColor: "color-mix(in srgb, var(--cw-primary) 28%, transparent) !important",
      },
      ".cm-scroller": { overflow: "auto", lineHeight: "1.65" },
      "&.cm-focused": { outline: "none !important" },
    },
    { dark },
  )
const cwLight = cwTheme(false)
const cwDark = cwTheme(true)

type Status = "idle" | "loading-rt" | "running" | "done" | "error"

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

// ── Component ────────────────────────────────────────────────────────────────
export function CompilerWorkspace({ variant }: { variant: "public" | "dashboard" }) {
  const embedded = variant === "dashboard"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const pyRef = useRef<PyodideRuntime | null>(null)
  const languageMenuRef = useRef<HTMLDivElement | null>(null)
  const startedAt = useRef(0)

  // A shared link seeds the editor. Those sessions aren't saved unless the visitor keeps a copy,
  // so opening someone's link never overwrites their own work.
  const shareParam = embedded ? null : searchParams.get("s")
  const sharedFiles = useMemo(() => (shareParam ? decodeShare(shareParam) : null), [shareParam])
  const [adopted, setAdopted] = useState(false)
  const persist = !sharedFiles || adopted

  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focus, setFocus] = useState(false)
  const [stacked, setStacked] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [isMac, setIsMac] = useState(false)

  // ── Files ────────────────────────────────────────────────────────────────
  const initialFiles: CodeFile[] = sharedFiles ?? [{ id: uid(), name: "main.py", code: DEFAULT_CODE }]
  const [files, setFiles] = useState<CodeFile[]>(initialFiles)
  const [activeId, setActiveId] = useState<string>(initialFiles[0].id)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const activeFile = files.find((f) => f.id === activeId) ?? files[0]
  const activeLanguage = getLanguageFromFileName(activeFile.name) ?? "python"

  const [stdin, setStdin] = useState("")
  const [stdout, setStdout] = useState("")
  const [stderr, setStderr] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [rtReady, setRtReady] = useState(false)
  const [runMs, setRunMs] = useState<number | null>(null)

  const [toast, setToast] = useState("")
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsMac(/mac|iphone|ipad/i.test(navigator.platform))
  }, [])

  // Saved work, theme and input from last time.
  useEffect(() => {
    if (!mounted) return
    if (!embedded && localStorage.getItem(THEME_KEY) === "true") setIsDark(true)
    if (sharedFiles) return
    const saved = localStorage.getItem(FILES_KEY)
    const active = localStorage.getItem(ACTIVE_KEY)
    const sin = localStorage.getItem(STDIN_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CodeFile[]
        if (Array.isArray(parsed) && parsed.length) {
          setFiles(parsed)
          setActiveId(active ?? parsed[0].id)
        }
      } catch {}
    }
    if (sin) setStdin(sin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  useEffect(() => { if (mounted && !embedded) localStorage.setItem(THEME_KEY, String(isDark)) }, [isDark, mounted, embedded])
  useEffect(() => { if (mounted && persist) localStorage.setItem(FILES_KEY, JSON.stringify(files)) }, [files, mounted, persist])
  useEffect(() => { if (mounted && persist) localStorage.setItem(ACTIVE_KEY, activeId) }, [activeId, mounted, persist])
  useEffect(() => { if (mounted && persist) localStorage.setItem(STDIN_KEY, stdin) }, [stdin, mounted, persist])

  // In the dashboard the editor follows the shell's light / dark theme (or the preview window's, on the landing page).
  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!embedded || !mounted) return
    const body = document.body
    const shell = rootRef.current?.closest(".lms") ?? null
    const sync = () => setIsDark(body.classList.contains("lms-dark") || Boolean(shell?.classList.contains("lms-dark")))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(body, { attributes: true, attributeFilter: ["class"] })
    if (shell) mo.observe(shell, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [embedded, mounted])

  // Public page: only used to pick between "Sign in" and "Open dashboard".
  useEffect(() => {
    if (embedded) return
    let alive = true
    supabase.auth.getSession().then(({ data: { session } }) => alive && setSignedIn(!!session))
    return () => { alive = false }
  }, [supabase, embedded])

  // Stack editor above output on narrow screens.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)")
    const sync = () => setStacked(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!isLanguageMenuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) setIsLanguageMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setIsLanguageMenuOpen(false)
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isLanguageMenuOpen])

  // Focus mode: Esc leaves it, and the page behind stops scrolling.
  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isLanguageMenuOpen && setFocus(false)
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [focus, isLanguageMenuOpen])

  const flash = useCallback((text: string) => {
    setToast(text)
    setTimeout(() => setToast(""), 2200)
  }, [])

  // ── File management ──────────────────────────────────────────────────────
  const addFile = useCallback(() => {
    const newId = uid()
    const ext = getFileExtensionForLanguage(activeLanguage)
    setFiles((prev) => [...prev, { id: newId, name: `file${prev.length + 1}.${ext}`, code: DEFAULT_CODE_BY_LANGUAGE[activeLanguage] }])
    setActiveId(newId)
  }, [activeLanguage])

  const removeFile = useCallback((id: string) => {
    if (files.length === 1) return
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      if (activeId === id) setActiveId(next[0].id)
      return next
    })
  }, [files.length, activeId])

  const startRename = useCallback((file: CodeFile) => {
    setEditingId(file.id)
    setEditingName(file.name)
  }, [])

  const commitRename = useCallback(() => {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (trimmed) setFiles((prev) => prev.map((f) => (f.id === editingId ? { ...f, name: trimmed } : f)))
    setEditingId(null)
  }, [editingId, editingName])

  const updateCode = useCallback((val: string) => {
    setFiles((prev) => prev.map((f) => (f.id === activeId ? { ...f, code: val } : f)))
  }, [activeId])

  const changeLanguage = useCallback((language: SupportedLanguage) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeId
          ? {
              ...f,
              name: getFileNameForLanguage(f.name, language),
              code: f.code.trim().length === 0 || isStarterTemplate(f.code) ? DEFAULT_CODE_BY_LANGUAGE[language] : f.code,
            }
          : f,
      ),
    )
  }, [activeId])

  const activeLanguageOption = LANGUAGE_OPTIONS.find((opt) => opt.value === activeLanguage) ?? LANGUAGE_OPTIONS[0]

  // ── Share ────────────────────────────────────────────────────────────────
  const shareLink = useCallback(() => {
    const url = `${window.location.origin}/compiler?s=${encodeShare(files)}`
    navigator.clipboard.writeText(url).then(() => flash("Share link copied"))
  }, [files, flash])

  const keepCopy = useCallback(() => {
    setAdopted(true)
    router.replace(pathname)
    flash("Saved to this browser")
  }, [router, pathname, flash])

  // ── Runtime ──────────────────────────────────────────────────────────────
  const loadRuntime = useCallback(async (): Promise<PyodideRuntime> => {
    if (pyRef.current) return pyRef.current
    setStatus("loading-rt")
    try {
      await loadPyodideScript()
      const rt = await window.loadPyodide!({ indexURL: PYODIDE_CDN })
      pyRef.current = rt
      setRtReady(true)
      return rt
    } catch (e) {
      setStatus("error"); setStderr(toMessage(e)); throw e
    }
  }, [])

  const runCode = useCallback(async () => {
    if (status === "running" || status === "loading-rt") return
    const code = activeFile.code
    if (!code.trim()) { setStderr("No code to run."); return }

    const language = getLanguageFromFileName(activeFile.name)
    if (!language) {
      setStdout("")
      setStatus("error")
      setStderr("Unsupported file extension. Use .py, .java, .c, or .cpp")
      return
    }

    setStdout(""); setStderr(""); setStatus("running")

    if (language !== "python") {
      try {
        const response = await fetch("/api/compiler/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            code,
            stdin,
            filename: activeFile.name,
          }),
        })

        const result = await response.json().catch(() => null) as
          | { stdout?: string; stderr?: string; error?: string }
          | null

        if (!response.ok) {
          throw new Error(result?.error || `Execution failed (${response.status})`)
        }

        const nextStdout = result?.stdout ?? ""
        const nextStderr = result?.stderr ?? ""
        setStdout(nextStdout)
        setStderr(nextStderr)
        setStatus(nextStderr ? "error" : "done")
      } catch (e) {
        setStderr(toMessage(e))
        setStatus("error")
      } finally {
        setStatus((s) => (s === "running" ? "done" : s))
      }
      return
    }

    const harness = `
import builtins, contextlib, io, json, traceback
_out = io.StringIO(); _err = io.StringIO()
_lines = __stdin_text.splitlines(); _idx = 0

def _input(prompt=""):
    global _idx
    if _idx >= len(_lines): raise EOFError("No more input.")
    v = _lines[_idx]; _idx += 1; return v

builtins.input = _input
try:
    with contextlib.redirect_stdout(_out), contextlib.redirect_stderr(_err):
        exec(__user_code, {})
except Exception:
    _err.write(traceback.format_exc())
finally:
    builtins.input = input

json.dumps({"stdout": _out.getvalue(), "stderr": _err.getvalue()})
`
    let rt: PyodideRuntime | null = null
    try {
      rt = await loadRuntime()
      rt.globals.set("__user_code",  code)
      rt.globals.set("__stdin_text", stdin)
      const raw    = await withTimeout(rt.runPythonAsync(harness), TIMEOUT_MS)
      const parsed = JSON.parse(String(raw)) as { stdout: string; stderr: string }
      setStdout(parsed.stdout)
      setStderr(parsed.stderr)
      setStatus(parsed.stderr ? "error" : "done")
    } catch (e) {
      setStderr(toMessage(e)); setStatus("error")
    } finally {
      if (rt) {
        try { rt.globals.delete("__user_code"); rt.globals.delete("__stdin_text") } catch {}
      }
      setStatus((s) => (s === "running" ? "done" : s))
    }
  }, [activeFile.code, activeFile.name, stdin, status, loadRuntime])

  // Time each run.
  useEffect(() => {
    if (status === "running" || status === "loading-rt") {
      if (!startedAt.current) startedAt.current = performance.now()
    } else if (status === "done" || status === "error") {
      if (startedAt.current) setRunMs(Math.round(performance.now() - startedAt.current))
      startedAt.current = 0
    }
  }, [status])

  // Ctrl / Cmd + Enter runs the code, even while typing in the editor.
  const runRef = useRef(runCode)
  runRef.current = runCode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        e.stopPropagation()
        runRef.current()
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  const downloadCode = useCallback(() => {
    const blob = new Blob([activeFile.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = activeFile.name
    a.click()
    URL.revokeObjectURL(url)
  }, [activeFile])

  const resetCode = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeId ? { ...f, code: DEFAULT_CODE_BY_LANGUAGE[getLanguageFromFileName(f.name) ?? "python"] } : f)),
    )
    setStdout("")
    setStderr("")
    setStatus("idle")
    setRunMs(null)
  }, [activeId])

  const clearOutput = useCallback(() => {
    setStdout("")
    setStderr("")
    setStatus("idle")
    setRunMs(null)
  }, [])

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText([stdout, stderr].filter(Boolean).join("\n")).then(() => flash("Output copied"))
  }, [stdout, stderr, flash])

  const toggleTheme = useCallback(() => {
    // In the dashboard the shell owns the theme, so this asks the shell to switch it.
    if (embedded) window.dispatchEvent(new Event("dashboard-theme-toggle"))
    else setIsDark((d) => !d)
  }, [embedded])

  const extensions = useMemo(() => {
    if (activeLanguage === "python") return [python()]
    if (activeLanguage === "java") return [java()]
    return [cpp()]
  }, [activeLanguage])

  const busy = status === "running" || status === "loading-rt"
  const hasOutput = Boolean(stdout || stderr)
  const chip =
    status === "loading-rt" ? { tone: "run", text: "Starting Python…" }
    : status === "running" ? { tone: "run", text: "Running…" }
    : status === "done" ? { tone: "ok", text: runMs !== null ? `Finished · ${formatMs(runMs)}` : "Finished" }
    : status === "error" ? { tone: "err", text: runMs !== null ? `Error · ${formatMs(runMs)}` : "Error" }
    : { tone: undefined, text: "Ready" }

  if (!mounted) {
    return embedded ? <CompilerSkeleton /> : <div className={`cw cw-public ${manrope.variable}`} />
  }

  return (
    <div
      ref={rootRef}
      className={[
        "cw",
        embedded ? "cw-embedded" : "cw-public",
        !embedded && isDark ? "cw-dark" : "",
        focus ? "cw-focus" : "",
        manrope.variable,
        codeFont.variable,
      ].join(" ")}
    >
      {/* ── Top bar ── */}
      <header className="cw-top">
        <div className="cw-top-left">
          {!embedded && (
            <Link href="/" className="cw-brand" aria-label="BSPrep home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={isDark ? "/admin-logo-dark.png" : "/bsprep-mark.png"} alt="" />
              <span>BSPREP</span>
            </Link>
          )}

          <div className="cw-lang" ref={languageMenuRef}>
            <button
              type="button"
              className="cw-lang-trigger"
              onClick={() => setIsLanguageMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isLanguageMenuOpen}
              title="Change language"
            >
              <FileCode2 size={15} />
              <span>{activeLanguageOption.label}</span>
              <ChevronDown size={14} />
            </button>
            {isLanguageMenuOpen && (
              <div className="cw-lang-menu" role="listbox" aria-label="Select language">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="cw-lang-option"
                    role="option"
                    aria-selected={opt.value === activeLanguage}
                    onClick={() => {
                      changeLanguage(opt.value)
                      setIsLanguageMenuOpen(false)
                    }}
                  >
                    {opt.label}
                    {opt.value === activeLanguage && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cw-top-right">
          <div className="cw-top-left">
            <button type="button" className="cw-icon" title="Copy share link" aria-label="Copy share link" onClick={shareLink}>
              <Share2 size={16} />
            </button>
            <button type="button" className="cw-icon" title="Download file" aria-label="Download file" onClick={downloadCode}>
              <Download size={16} />
            </button>
            <button type="button" className="cw-icon" title="Reset to starter code" aria-label="Reset to starter code" onClick={resetCode}>
              <RotateCcw size={16} />
            </button>
            <button type="button" className="cw-icon" title={isDark ? "Light theme" : "Dark theme"} aria-label="Toggle theme" onClick={toggleTheme}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {embedded && (
              <button
                type="button"
                className="cw-icon"
                title={focus ? "Exit focus mode (Esc)" : "Focus mode"}
                aria-label={focus ? "Exit focus mode" : "Focus mode"}
                onClick={() => setFocus((f) => !f)}
              >
                {focus ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
          </div>

          <div className="cw-top-left">
            {!embedded && signedIn !== null && (
              <Link href={signedIn ? "/dashboard/compiler" : "/?login=true"} className="cw-btn cw-hide-sm">
                {signedIn ? "Open dashboard" : "Sign in"}
              </Link>
            )}
            <button
              id="run-code-btn"
              type="button"
              className="cw-run"
              onClick={runCode}
              disabled={busy}
              title={`Run (${isMac ? "⌘" : "Ctrl"} + Enter)`}
            >
              {busy ? <Loader2 size={15} className="cw-spin" /> : <Play size={15} fill="currentColor" />}
              {busy ? "Running…" : "Run"}
              {!busy && <kbd>{isMac ? "⌘↵" : "Ctrl ↵"}</kbd>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Shared-link notice ── */}
      {sharedFiles && !adopted && (
        <div className="cw-notice">
          <Share2 size={14} />
          <span>Opened from a shared link. Edit and run freely; changes aren&apos;t saved.</span>
          <button type="button" onClick={keepCopy}>Keep a copy</button>
        </div>
      )}

      {/* ── File tabs ── */}
      <div className="cw-tabs" role="tablist" aria-label="Files">
        {files.map((file) => (
          <div
            key={file.id}
            role="tab"
            aria-selected={activeId === file.id}
            data-active={activeId === file.id}
            className="cw-tab"
            onClick={() => setActiveId(file.id)}
          >
            {editingId === file.id ? (
              <input
                className="cw-tab-input"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename()
                  if (e.key === "Escape") setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{file.name}</span>
            )}
            {activeId === file.id && (
              <>
                <button
                  type="button"
                  className="cw-tab-act"
                  title={editingId === file.id ? "Confirm rename" : "Rename file"}
                  aria-label={editingId === file.id ? "Confirm rename" : "Rename file"}
                  onClick={(e) => {
                    e.stopPropagation()
                    editingId === file.id ? commitRename() : startRename(file)
                  }}
                >
                  {editingId === file.id ? <Check size={12} /> : <Pencil size={12} />}
                </button>
                {files.length > 1 && (
                  <button
                    type="button"
                    className="cw-tab-act"
                    title="Close file"
                    aria-label="Close file"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
        <button type="button" className="cw-tab-add" onClick={addFile} title="New file" aria-label="New file">
          <Plus size={15} />
        </button>
      </div>

      {/* ── Editor + input / output ── */}
      <div className="cw-main">
        <PanelGroup key={stacked ? "v" : "h"} direction={stacked ? "vertical" : "horizontal"} className="cw-panels">
          <Panel defaultSize={stacked ? 55 : 58} minSize={20}>
            <div className="cw-editor">
              <CodeMirror
                key={activeId}
                value={activeFile.code}
                height="100%"
                theme={isDark ? [oneDark, cwDark] : cwLight}
                extensions={extensions}
                onChange={(val) => updateCode(val)}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  dropCursor: true,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  tabSize: 4,
                }}
                style={{ height: "100%" }}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="cw-handle" />

          <Panel defaultSize={stacked ? 45 : 42} minSize={20}>
            <div className="cw-io">
              <div className="cw-sec-head">
                <span>Input</span>
                <small>For input(), scanf or cin</small>
              </div>
              <textarea
                className="cw-stdin"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Type any input your program reads, one line per value"
                spellCheck={false}
                aria-label="Program input"
              />

              <div className="cw-sec-head">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Output
                  <span className="cw-chip" data-tone={chip.tone}>
                    <i /> {chip.text}
                  </span>
                </span>
                <span className="cw-sec-tools">
                  <button type="button" className="cw-tool" onClick={copyOutput} disabled={!hasOutput} title="Copy output">
                    <Copy size={13} /> Copy
                  </button>
                  <button type="button" className="cw-tool" onClick={clearOutput} disabled={!hasOutput && status === "idle"} title="Clear output">
                    <Eraser size={13} /> Clear
                  </button>
                </span>
              </div>

              <div className="cw-out" aria-live="polite">
                {busy ? (
                  <div className="cw-busy">
                    <Loader2 size={16} className="cw-spin" />
                    {status === "loading-rt" ? "Starting Python. The first run takes a few seconds." : "Running your code…"}
                  </div>
                ) : hasOutput ? (
                  <>
                    {stdout && <pre className="cw-pre">{stdout}</pre>}
                    {stderr && <pre className="cw-pre cw-stderr">{stderr}</pre>}
                  </>
                ) : status === "done" ? (
                  <div className="cw-empty">
                    <strong>Finished with no output</strong>
                    Your program ran without printing anything.
                  </div>
                ) : (
                  <div className="cw-empty">
                    <Terminal size={22} />
                    <strong>Run your code to see the output here</strong>
                    Press {isMac ? "⌘ + Enter" : "Ctrl + Enter"} or use the Run button.
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {toast && (
        <div className="cw-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
