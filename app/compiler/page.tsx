"use client"

import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"
import {
  Play,
  Loader2,
  Sun,
  Moon,
  Download,
  RotateCcw,
  Terminal,
  ArrowLeft,
  Plus,
  X,
  Pencil,
  Check,
  FileCode2,
  Share2,
  Copy,
  CheckCheck,
  GitFork,
  Lock,
  ChevronDown,
} from "lucide-react"
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

// ── CodeMirror dark theme ────────────────────────────────────────────────────
const darkTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace",
    fontSize: "13.5px",
    backgroundColor: "#1a1b26",
  },
  ".cm-content": { padding: "8px 0", caretColor: "#c0caf5" },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#c0caf5 !important",
    borderLeftWidth: "2px !important",
  },
  ".cm-gutters": {
    backgroundColor: "#16171f !important",
    color: "#4a4f6a !important",
    border: "none !important",
    borderRight: "1px solid #1e2030 !important",
    minWidth: "44px",
    userSelect: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 10px 0 4px",
    minWidth: "36px",
    textAlign: "right",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#1e2030 !important",
    color: "#a9b1d6 !important",
  },
  ".cm-activeLine": { backgroundColor: "#1e203055 !important" },
  ".cm-line": { paddingLeft: "12px", paddingRight: "8px" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#264f78 !important",
  },
  ".cm-focused .cm-selectionBackground": {
    backgroundColor: "#264f78 !important",
  },
  ".cm-scroller": { overflow: "auto", lineHeight: "1.65" },
  ".cm-focused": { outline: "none !important" },
}, { dark: true })

// ── CodeMirror light theme — clean white ─────────────────────────────────────
const lightTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Consolas, monospace",
    fontSize: "13.5px",
    backgroundColor: "#ffffff",
  },
  ".cm-content": { padding: "8px 0", caretColor: "#1a1a2e" },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#1a1a2e !important",
    borderLeftWidth: "2px !important",
  },
  ".cm-gutters": {
    backgroundColor: "#f3f4f6 !important",
    color: "#9ca3af !important",
    border: "none !important",
    borderRight: "1px solid #e5e7eb !important",
    minWidth: "44px",
    userSelect: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 10px 0 4px",
    minWidth: "36px",
    textAlign: "right",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#e9ecf0 !important",
    color: "#374151 !important",
  },
  ".cm-activeLine": { backgroundColor: "#f0f4f8 !important" },
  ".cm-line": { paddingLeft: "12px", paddingRight: "8px" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#bfdbfe !important",
  },
  ".cm-focused .cm-selectionBackground": {
    backgroundColor: "#bfdbfe !important",
  },
  ".cm-scroller": { overflow: "auto", lineHeight: "1.65" },
  ".cm-focused": { outline: "none !important" },
}, { dark: false })


// ── Component ────────────────────────────────────────────────────────────────
export default function CompilerPage() {
  const supabase    = useMemo(() => createClient(), [])
  const router      = useRouter()
  const searchParams = useSearchParams()
  const pyRef       = useRef<PyodideRuntime | null>(null)
  const signInRef   = useRef(false)
  const languageMenuRef = useRef<HTMLDivElement | null>(null)

  // ── Detect share param FIRST (before any state init) ────────────────────
  const shareParam   = searchParams.get("s")
  const sharedFiles  = useMemo(() => shareParam ? decodeShare(shareParam) : null, [shareParam])
  const isReadOnly   = sharedFiles !== null

  // Default: LIGHT
  const [isDark,  setIsDark]  = useState(false)
  const [mounted, setMounted] = useState(false)

  const [authChecked, setAuthChecked] = useState(false)
  const [authed,      setAuthed]      = useState(false)

  // ── Multi-file state ─────────────────────────────────────────────────────
  const initialFiles: CodeFile[] = sharedFiles ?? [
    { id: uid(), name: "main.py", code: DEFAULT_CODE },
  ]
  const [files,    setFiles]    = useState<CodeFile[]>(initialFiles)
  const [activeId, setActiveId] = useState<string>(initialFiles[0].id)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const activeFile = files.find(f => f.id === activeId) ?? files[0]
  const activeLanguage = getLanguageFromFileName(activeFile.name) ?? "python"

  const [stdin, setStdin] = useState("")

  type Status = "idle" | "loading-rt" | "running" | "done" | "error"
  const [stdout,  setStdout]  = useState("")
  const [stderr,  setStderr]  = useState("")
  const [status,  setStatus]  = useState<Status>("idle")
  const [rtReady, setRtReady] = useState(false)

  // Share UI state
  const [shareToast, setShareToast] = useState(false)       // copied toast
  const [showShareBar, setShowShareBar] = useState(false)   // link input bar
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Load persisted prefs — skip if viewing a share link
  useEffect(() => {
    if (!mounted || isReadOnly) return
    const dark   = localStorage.getItem(THEME_KEY)
    const saved  = localStorage.getItem(FILES_KEY)
    const active = localStorage.getItem(ACTIVE_KEY)
    const sin    = localStorage.getItem(STDIN_KEY)
    if (dark === "true")  setIsDark(true)
    if (dark === "false") setIsDark(false)
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
  }, [mounted, isReadOnly])

  useEffect(() => { if (mounted && !isReadOnly) localStorage.setItem(THEME_KEY, String(isDark)) }, [isDark, mounted, isReadOnly])
  useEffect(() => { if (mounted && !isReadOnly) localStorage.setItem(FILES_KEY, JSON.stringify(files)) }, [files, mounted, isReadOnly])
  useEffect(() => { if (mounted && !isReadOnly) localStorage.setItem(ACTIVE_KEY, activeId) }, [activeId, mounted, isReadOnly])
  useEffect(() => { if (mounted && !isReadOnly) localStorage.setItem(STDIN_KEY, stdin) }, [stdin, mounted, isReadOnly])

  useEffect(() => {
    if (!isLanguageMenuOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!languageMenuRef.current) return
      if (!languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isLanguageMenuOpen])

  useEffect(() => {
    // Skip auth check entirely for share/read-only links
    if (isReadOnly) { setAuthChecked(true); setAuthed(true); return }
    let alive = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return
      setAuthed(!!session)
      setAuthChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthed(!!session)
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [supabase, isReadOnly])

  useEffect(() => {
    // Only redirect unauthenticated users in the full IDE (not share links)
    if (isReadOnly) return
    if (!authChecked || authed || signInRef.current) return
    signInRef.current = true
    setTimeout(() => router.replace("/"), 2500)
  }, [authChecked, authed, isReadOnly, router])

  // ── File management (disabled in read-only) ──────────────────────────────
  const addFile = useCallback(() => {
    if (isReadOnly) return
    const newId = uid()
    const ext = getFileExtensionForLanguage(activeLanguage)
    const starter = DEFAULT_CODE_BY_LANGUAGE[activeLanguage]
    setFiles(prev => [...prev, { id: newId, name: `file${prev.length + 1}.${ext}`, code: starter }])
    setActiveId(newId)
  }, [isReadOnly, activeLanguage])

  const removeFile = useCallback((id: string) => {
    if (isReadOnly || files.length === 1) return
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id)
      if (activeId === id) setActiveId(next[0].id)
      return next
    })
  }, [isReadOnly, files.length, activeId])

  const startRename = useCallback((file: CodeFile) => {
    if (isReadOnly) return
    setEditingId(file.id)
    setEditingName(file.name)
  }, [isReadOnly])

  const commitRename = useCallback(() => {
    if (!editingId) return
    const trimmed = editingName.trim()
    if (trimmed) {
      setFiles(prev => prev.map(f =>
        f.id === editingId ? { ...f, name: trimmed } : f
      ))
    }
    setEditingId(null)
  }, [editingId, editingName])

  const updateCode = useCallback((val: string) => {
    if (isReadOnly) return
    setFiles(prev => prev.map(f => f.id === activeId ? { ...f, code: val } : f))
  }, [activeId, isReadOnly])

  const changeLanguage = useCallback((language: SupportedLanguage) => {
    if (isReadOnly) return
    setFiles(prev => prev.map(f => (
      f.id === activeId
        ? {
            ...f,
            name: getFileNameForLanguage(f.name, language),
            code: (f.code.trim().length === 0 || isStarterTemplate(f.code))
              ? DEFAULT_CODE_BY_LANGUAGE[language]
              : f.code,
          }
        : f
    )))
  }, [activeId, isReadOnly])

  const activeLanguageOption = LANGUAGE_OPTIONS.find((opt) => opt.value === activeLanguage) ?? LANGUAGE_OPTIONS[0]

  // ── Share link ───────────────────────────────────────────────────────────
  const shareLink = useCallback(() => {
    const encoded = encodeShare(files)
    const url = `${window.location.origin}/compiler?s=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true)
      setShowShareBar(false)
      setTimeout(() => setShareToast(false), 2500)
    })
  }, [files])

  /** Fork: copy shared code into local session and remove ?s= param */
  const forkCode = useCallback(() => {
    if (!sharedFiles) return
    const forked = sharedFiles.map(f => ({ ...f, id: uid() }))
    setFiles(forked)
    setActiveId(forked[0].id)
    router.replace("/compiler")
  }, [sharedFiles, router])

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

  const downloadCode = useCallback(() => {
    const blob = new Blob([activeFile.code], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = activeFile.name; a.click()
    URL.revokeObjectURL(url)
  }, [activeFile])

  const resetCode = useCallback(() => {
    if (isReadOnly) return
    setFiles(prev => prev.map(f => {
      if (f.id !== activeId) return f
      const language = getLanguageFromFileName(f.name) ?? "python"
      return { ...f, code: DEFAULT_CODE_BY_LANGUAGE[language] }
    }))
    setStdout(""); setStderr(""); setStatus("idle")
  }, [activeId, isReadOnly])

  const statusLabel: Record<Status, string> = {
    idle:         activeLanguage === "python" ? (rtReady ? "Ready" : "Idle") : "Ready",
    "loading-rt": "Running...",
    running:      "Running...",
    done:         "Done",
    error:        "Error",
  }
  const statusColor: Record<Status, string> = {
    idle:         isDark ? "#565f89" : "#6b7280",
    "loading-rt": "#e3b341",
    running:      "#3b82f6",
    done:         "#22c55e",
    error:        "#ef4444",
  }

  const extensions = useMemo(() => {
    if (activeLanguage === "python") return [python()]
    if (activeLanguage === "java") return [java()]
    if (activeLanguage === "c" || activeLanguage === "cpp") return [cpp()]
    return []
  }, [activeLanguage])

  // ── Loading / auth screens (full IDE only — share links skip this) ─────────
  if (!mounted) {
    return (
      <div className="cc-auth-screen">
        <Loader2 className="cc-spin" style={{ width: 22, height: 22 }} />
      </div>
    )
  }

  // ── PUBLIC READ-ONLY SHARE VIEW ─────────────────────────────────────────
  // No auth required. Minimal chrome: topbar + editor + IO only.
  if (isReadOnly && sharedFiles) {
    const sharedFile = sharedFiles[0]
    return (
      <div
        className={`${isDark ? "cc-dark" : "cc-light"}`}
        style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
          background: "var(--cc-bg)", color: "var(--cc-text)",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
      >
        {/* Topbar */}
        <div className="cc-topbar">
          <div className="cc-topbar-left">
            <div className="cc-lang-pill">
              <FileCode2 size={13} />
              {getLanguageLabel(sharedFile.name)}
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--cc-sub)" }}>
              <Lock size={10} /> Read-only
            </span>
          </div>
          <div className="cc-topbar-right">
            <span className="cc-badge" style={{ color: statusColor[status] }}>
              <span className="cc-badge-dot" style={{ background: statusColor[status] }} />
              {statusLabel[status]}
            </span>
            <button
              className="cc-icon-btn"
              title={isDark ? "Light mode" : "Dark mode"}
              onClick={() => setIsDark((d) => !d)}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              id="run-code-btn"
              className="cc-run-btn"
              onClick={runCode}
              disabled={status === "running" || status === "loading-rt"}
            >
              {(status === "running" || status === "loading-rt")
                ? <Loader2 size={13} className="cc-spin" />
                : <Play size={13} fill="currentColor" />}
              {status === "loading-rt" ? "Running..." : status === "running" ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        {/* File tab (read-only, no rename/close) */}
        <div className="cc-tabs-bar">
          <div className="cc-tabs-list">
            <div className="cc-tab cc-tab-active" style={{ cursor: "default" }}>
              <span className="cc-tab-name">{sharedFile.name}</span>
            </div>
          </div>
        </div>

        {/* Editor + IO */}
        <div className="cc-workspace">
          <PanelGroup direction="horizontal" className="cc-panel-group">
            <Panel defaultSize={58} minSize={25}>
              <div className="cc-editor-shell">
                <CodeMirror
                  value={sharedFile.code}
                  height="100%"
                  theme={isDark ? [oneDark, darkTheme] : lightTheme}
                  extensions={extensions}
                  readOnly
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    bracketMatching: true,
                    closeBrackets: false,
                    autocompletion: false,
                    highlightActiveLine: true,
                    highlightSelectionMatches: false,
                    tabSize: 4,
                  }}
                  style={{ height: "100%" }}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="cc-resize-handle">
              <div className="cc-grip"><span /><span /><span /><span /><span /><span /></div>
            </PanelResizeHandle>
            <Panel defaultSize={42} minSize={20}>
              <div className="cc-io-panel">
                <div className="cc-input-section">
                  <textarea
                    className="cc-stdin"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Enter Input here"
                    spellCheck={false}
                  />
                </div>
                <div className="cc-hint">
                  If your code takes input,{" "}
                  <span className="cc-hint-link">add it</span>{" "}
                  in the above box before running.
                </div>
                <div className="cc-output-section">
                  <div className="cc-output-label">Output</div>
                  <div className="cc-output-content">
                    {status === "running" || status === "loading-rt" ? (
                      <div className="cc-io-running">
                        <Loader2 size={15} className="cc-spin" />
                        <span>Running...</span>
                      </div>
                    ) : stdout || stderr ? (
                      <>
                        {stdout && <pre className="cc-pre cc-stdout">{stdout}</pre>}
                        {stderr && <pre className="cc-pre cc-stderr">{stderr}</pre>}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    )
  }

  // ── Auth gate for full IDE ────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="cc-layout-root cc-light">
        <div className="cc-auth-screen">
          <Loader2 className="cc-spin" style={{ width: 22, height: 22 }} />
          <span style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Checking access…</span>
        </div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="cc-layout-root cc-light">
        <div className="cc-auth-screen">
          <div className="cc-auth-card">
            <div className="cc-auth-icon"><Terminal size={30} /></div>
            <h1 className="cc-auth-title">Sign in required</h1>
            <p className="cc-auth-desc">
              You need to be signed in to use the Python Compiler.
              Redirecting you to the home page…
            </p>
            <div className="cc-auth-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Full authenticated IDE (uses cc-layout-root = position:fixed full viewport)
  return (
    <div className="cc-layout-root">
      <div className={`cc-page ${isDark ? "cc-dark" : "cc-light"}`}>

      {/* ── Read-only banner ── */}
      {isReadOnly && (
        <div className="cc-readonly-banner">
          <Lock size={13} />
          <span>Read-only — viewing shared code</span>
          <button className="cc-fork-btn" onClick={forkCode}>
            <GitFork size={12} />
            Fork &amp; Edit
          </button>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="cc-topbar">
        <div className="cc-topbar-left">
          <button className="cc-back-btn" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div className="cc-lang-dropdown" ref={languageMenuRef}>
            <button
              type="button"
              className={`cc-lang-trigger ${isLanguageMenuOpen ? "cc-lang-trigger-open" : ""}`}
              onClick={() => setIsLanguageMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isLanguageMenuOpen}
            >
              <FileCode2 size={13} />
              <span className="cc-lang-trigger-label">{activeLanguageOption.label}</span>
              <ChevronDown size={12} className={`cc-lang-chevron ${isLanguageMenuOpen ? "cc-lang-chevron-open" : ""}`} />
            </button>

            {isLanguageMenuOpen && (
              <div className="cc-lang-menu" role="listbox" aria-label="Select language">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`cc-lang-option ${opt.value === activeLanguage ? "cc-lang-option-active" : ""}`}
                    onClick={() => {
                      changeLanguage(opt.value)
                      setIsLanguageMenuOpen(false)
                    }}
                    role="option"
                    aria-selected={opt.value === activeLanguage}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cc-topbar-right">
          <span className="cc-badge" style={{ color: statusColor[status] }}>
            <span className="cc-badge-dot" style={{ background: statusColor[status] }} />
            {statusLabel[status]}
          </span>

          {/* Share button */}
          <button
            className={`cc-icon-btn ${shareToast ? "cc-icon-btn--success" : ""}`}
            title="Copy share link"
            onClick={shareLink}
          >
            {shareToast ? <CheckCheck size={15} /> : <Share2 size={15} />}
          </button>

          <button className="cc-icon-btn" title="Download active file" onClick={downloadCode}>
            <Download size={15} />
          </button>
          {!isReadOnly && (
            <button className="cc-icon-btn" title="Reset to default" onClick={resetCode}>
              <RotateCcw size={15} />
            </button>
          )}
          <button
            className="cc-icon-btn"
            title={isDark ? "Light mode" : "Dark mode"}
            onClick={() => setIsDark((d) => !d)}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            id="run-code-btn"
            className="cc-run-btn"
            onClick={runCode}
            disabled={status === "running" || status === "loading-rt"}
          >
            {(status === "running" || status === "loading-rt")
              ? <Loader2 size={13} className="cc-spin" />
              : <Play    size={13} fill="currentColor" />}
            {status === "loading-rt" ? "Running..."
              : status === "running"  ? "Running..."
              : "Run"}
          </button>
        </div>
      </div>

      {/* ── Copied toast ── */}
      {shareToast && (
        <div className="cc-share-toast">
          <Copy size={13} />
          Share link copied to clipboard!
        </div>
      )}

      {/* ── File tabs ── */}
      <div className="cc-tabs-bar">
        <div className="cc-tabs-list">
          {files.map(file => (
            <div
              key={file.id}
              className={`cc-tab ${activeId === file.id ? "cc-tab-active" : ""}`}
              onClick={() => setActiveId(file.id)}
            >
              {editingId === file.id ? (
                <input
                  className="cc-tab-input"
                  value={editingName}
                  autoFocus
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === "Enter") commitRename()
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="cc-tab-name">{file.name}</span>
              )}

              {!isReadOnly && activeId === file.id && (
                <>
                  {editingId === file.id ? (
                    <button
                      className="cc-tab-action"
                      onClick={e => { e.stopPropagation(); commitRename() }}
                      title="Confirm rename"
                    >
                      <Check size={11} />
                    </button>
                  ) : (
                    <button
                      className="cc-tab-action"
                      onClick={e => { e.stopPropagation(); startRename(file) }}
                      title="Rename file"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                  {files.length > 1 && (
                    <button
                      className="cc-tab-action cc-tab-close"
                      onClick={e => { e.stopPropagation(); removeFile(file.id) }}
                      title="Close file"
                    >
                      <X size={11} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* + New file — inline after last tab, like VS Code */}
          {!isReadOnly && (
            <button className="cc-tab-add" onClick={addFile} title="New file">
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Editor + IO split ── */}
      <div className="cc-workspace">
        <PanelGroup direction="horizontal" className="cc-panel-group">

          {/* Left: CodeMirror */}
          <Panel defaultSize={58} minSize={25}>
            <div className="cc-editor-shell">
              <CodeMirror
                key={activeId}
                value={activeFile.code}
                height="100%"
                theme={isDark ? [oneDark, darkTheme] : lightTheme}
                extensions={extensions}
                onChange={(val) => updateCode(val)}
                readOnly={isReadOnly}
                basicSetup={{
                  lineNumbers:             true,
                  foldGutter:              false,
                  dropCursor:              !isReadOnly,
                  allowMultipleSelections: false,
                  indentOnInput:           !isReadOnly,
                  bracketMatching:         true,
                  closeBrackets:           !isReadOnly,
                  autocompletion:          !isReadOnly,
                  highlightActiveLine:     true,
                  highlightSelectionMatches: true,
                  tabSize:                 4,
                }}
                style={{ height: "100%" }}
              />
            </div>
          </Panel>

          {/* Drag handle */}
          <PanelResizeHandle className="cc-resize-handle">
            <div className="cc-grip">
              <span /><span /><span /><span /><span /><span />
            </div>
          </PanelResizeHandle>

          {/* Right: Input + Output */}
          <Panel defaultSize={42} minSize={20}>
            <div className="cc-io-panel">

              <div className="cc-input-section">
                <textarea
                  className="cc-stdin"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter Input here"
                  spellCheck={false}
                />
              </div>

              <div className="cc-hint">
                If your code takes input,{" "}
                <span className="cc-hint-link">add it</span>{" "}
                in the above box before running.
              </div>

              <div className="cc-output-section">
                <div className="cc-output-label">Output</div>
                <div className="cc-output-content">
                  {status === "running" || status === "loading-rt" ? (
                    <div className="cc-io-running">
                      <Loader2 size={15} className="cc-spin" />
                      <span>Running...</span>
                    </div>
                  ) : stdout || stderr ? (
                    <>
                      {stdout && <pre className="cc-pre cc-stdout">{stdout}</pre>}
                      {stderr && <pre className="cc-pre cc-stderr">{stderr}</pre>}
                    </>
                  ) : null}
                </div>
              </div>

            </div>
          </Panel>
        </PanelGroup>
      </div>
      </div>
    </div>
  )
}
