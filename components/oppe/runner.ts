"use client"

// Runs Python in the browser with Pyodide, the same runtime the compiler page uses.

const CDN = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/"

type Runtime = { runPythonAsync: (code: string) => Promise<unknown>; globals: { set: (k: string, v: unknown) => void } }
type PyWindow = { loadPyodide?: (o: { indexURL: string }) => Promise<Runtime>; __pyodideScriptPromise?: Promise<void> }
const win = () => window as unknown as PyWindow

let runtime: Promise<Runtime> | null = null

function loadScript() {
  if (win().loadPyodide) return Promise.resolve()
  if (!win().__pyodideScriptPromise) {
    win().__pyodideScriptPromise = new Promise<void>((res, rej) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide="1"]')
      if (existing) {
        if (existing.dataset.loaded) return res()
        existing.addEventListener("load", () => res(), { once: true })
        existing.addEventListener("error", () => rej(new Error("Could not load the Python runtime")), { once: true })
        return
      }
      const s = document.createElement("script")
      s.src = `${CDN}pyodide.js`
      s.async = true
      s.dataset.pyodide = "1"
      s.addEventListener("load", () => ((s.dataset.loaded = "1"), res()), { once: true })
      s.addEventListener("error", () => rej(new Error("Could not load the Python runtime")), { once: true })
      document.head.appendChild(s)
    })
  }
  return win().__pyodideScriptPromise!
}

function getRuntime() {
  if (!runtime) {
    runtime = loadScript()
      .then(() => win().loadPyodide!({ indexURL: CDN }))
      .catch((e) => {
        runtime = null
        throw e
      })
  }
  return runtime
}

export interface TestResult {
  input: string
  expected: string
  got: string
  ok: boolean
  /** False when the source data has no expected output, so there is nothing to compare against. */
  checked: boolean
}
export interface RunResult {
  stdout: string
  error: string | null
  tests: TestResult[]
}

const HARNESS = `
import io, sys, json, traceback
def __oppe(code, setup, fn, tests):
    ns = {}
    out = io.StringIO()
    old = sys.stdout
    sys.stdout = out
    try:
        exec(setup + "\\n" + code, ns)
    except BaseException:
        sys.stdout = old
        return json.dumps({"stdout": out.getvalue(), "error": traceback.format_exc(limit=0), "tests": []})
    results = []
    for inp, exp in tests:
        try:
            got = repr(eval(fn + "(" + inp + ")", ns)) if fn else ""
        except BaseException as e:
            got = "Error: " + type(e).__name__ + ": " + str(e)
        results.append({"input": inp, "expected": exp, "got": got})
    sys.stdout = old
    return json.dumps({"stdout": out.getvalue(), "error": None, "tests": results})
`

const squash = (s: string) => s.replace(/\s+/g, "").replace(/'/g, '"').replace(/^"|"$/g, "")

export async function runPython(code: string, setup: string, functionName: string, tests: { input: string; output: string }[]): Promise<RunResult> {
  const rt = await getRuntime()
  await rt.runPythonAsync(HARNESS)
  rt.globals.set("__code", code)
  rt.globals.set("__setup", setup)
  rt.globals.set("__fn", functionName)
  rt.globals.set("__tests", JSON.stringify(tests.map((t) => [t.input, t.output])))
  const raw = (await Promise.race([
    rt.runPythonAsync("__oppe(__code, __setup, __fn, json.loads(__tests))"),
    new Promise((_, rej) => setTimeout(() => rej(new Error("Timed out after 12 seconds")), 12_000)),
  ])) as string
  const parsed = JSON.parse(raw) as { stdout: string; error: string | null; tests: { input: string; expected: string; got: string }[] }
  return {
    stdout: parsed.stdout,
    error: parsed.error,
    tests: parsed.tests.map((t) => {
      const checked = functionName !== "" && t.expected.trim() !== ""
      return { ...t, checked, ok: checked && squash(t.got) === squash(t.expected) }
    }),
  }
}
