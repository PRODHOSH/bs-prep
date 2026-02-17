"use client"

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Play, Trash2, Copy, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'

// Configure Monaco environment to suppress warnings
if (typeof window !== 'undefined') {
  (window as any).MonacoEnvironment = {
    getWorkerUrl: function () {
      return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/'
        };
        importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/base/worker/workerMain.js');
      `)
    }
  }
}

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function PythonCompilerPage() {
  const [code, setCode] = useState(`# Python Compiler with NumPy & Pandas Support
# Try running this example!

import numpy as np
import pandas as pd

# NumPy example
arr = np.array([1, 2, 3, 4, 5])
print("NumPy Array:", arr)
print("Mean:", np.mean(arr))
print("Sum:", np.sum(arr))

# Pandas example
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Score': [85, 92, 78]
}
df = pd.DataFrame(data)
print("\\nDataFrame:")
print(df)
print("\\nAverage Score:", df['Score'].mean())`)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('⏳ Initializing Python compiler...\n\nLoading Python environment with NumPy & Pandas support.\nPlease wait 10-30 seconds for first-time setup.')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('Initializing...')
  const pyodideRef = useRef<any>(null)
  const [monacoError, setMonacoError] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Suppress Next.js dev error overlay noise from CDN scripts and Monaco
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    // Suppress window-level errors from external scripts
    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message?.toString() || ''
      if (
        message.includes('pyodide') ||
        message.includes('monaco') ||
        message.includes('cdn.jsdelivr') ||
        event.filename?.includes('pyodide') ||
        event.filename?.includes('monaco')
      ) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
      return false
    }
    
    window.addEventListener('error', handleWindowError, true)
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      const allMessages = args.join(' ')
      
      // Check if it's an Event object
      if (args[0] instanceof Event) {
        return // Suppress Event objects
      }
      
      // Filter out known harmless errors from Next.js dev tools, external CDN scripts, and Monaco
      if (
        message.includes('stackframe') ||
        message.includes('error-stack-parser') ||
        message.includes('[object Event]') ||
        message.includes('Event]') ||
        message.includes('modules that depend on it') ||
        message.includes('Monaco') ||
        message.includes('monaco') ||
        allMessages.includes('cdn.jsdelivr') ||
        allMessages.includes('pyodide.js') ||
        allMessages.includes('monaco-editor') ||
        allMessages.includes('MonacoEnvironment') ||
        typeof args[0] === 'object'
      ) {
        return // Suppress these errors
      }
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      if (message.includes('Monaco') || message.includes('monaco')) {
        return // Suppress Monaco warnings
      }
      originalConsoleWarn.apply(console, args)
    }

    // Check if Pyodide is already loaded
    if (typeof (window as any).loadPyodide !== 'undefined') {
      initializePyodide()
      return
    }

    // Load Pyodide script with better error handling
    const script = document.createElement('script')
    scriptRef.current = script
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    
    let loadAttempts = 0
    const maxAttempts = 3
    
    const attemptInit = () => {
      if (typeof (window as any).loadPyodide !== 'undefined') {
        initializePyodide()
      } else {
        loadAttempts++
        if (loadAttempts < maxAttempts) {
          setTimeout(attemptInit, 2000)
        } else {
          setOutput('❌ Failed to load Python environment. Please check your internet connection and refresh the page.')
          setLoadingStatus('Failed to load')
        }
      }
    }
    
    script.onload = () => {
      // Wait a bit for the script to fully execute
      setTimeout(attemptInit, 100)
    }
    
    script.onerror = () => {
      // Silent retry
      console.log('Retrying Pyodide load...')
      setTimeout(attemptInit, 1000)
    }
    
    document.body.appendChild(script)

    return () => {
      // Cleanup
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      window.removeEventListener('error', handleWindowError, true)
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        try {
          document.body.removeChild(scriptRef.current)
        } catch (e) {
          // Script already removed or doesn't exist
        }
      }
    }
  }, [])

  const initializePyodide = async () => {
    if (pyodideRef.current) {
      // Already initialized
      return
    }
    
    try {
      setLoadingStatus('Loading Python...')
      setOutput('⏳ Initializing Python environment...\nPlease wait, this may take 10-20 seconds on first load.')
      
      if (typeof (window as any).loadPyodide === 'undefined') {
        throw new Error('Pyodide loader not available')
      }

      // Load Pyodide with timeout
      const loadPromise = (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading Pyodide')), 60000)
      )
      
      const pyodide = await Promise.race([loadPromise, timeoutPromise])
      pyodideRef.current = pyodide
      
      // Load numpy and pandas with progress
      setLoadingStatus('Loading libraries...')
      setOutput('⏳ Python environment loaded!\n\nNow loading NumPy and Pandas...\nThis may take 15-30 seconds on first load.')
      
      try {
        const pkgPromise = pyodide.loadPackage(['numpy', 'pandas'])
        const pkgTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading packages')), 90000)
        )
        
        await Promise.race([pkgPromise, pkgTimeoutPromise])
        
        setLoadingStatus('Ready ✓')
        setPyodideReady(true)
        setOutput('✅ Python environment ready with NumPy and Pandas!\n\n📦 Available libraries:\n  • numpy (import numpy as np)\n  • pandas (import pandas as pd)\n\n💡 Try the example code or write your own!\nClick "Run Code" to execute.')
      } catch (pkgError: any) {
        console.warn('Package load failed:', pkgError.message)
        setLoadingStatus('Ready (basic Python)')
        setPyodideReady(true)
        setOutput('✅ Python environment ready!\n\n⚠️ NumPy and Pandas could not be loaded.\nBasic Python functionality is available.\n\nWrite your code and click Run.')
      }
    } catch (error: any) {
      console.error('Pyodide init failed:', error.message)
      const errorMsg = error.message || 'Unknown error'
      setOutput(`❌ Failed to initialize Python environment.\n\nError: ${errorMsg}\n\n🔄 Please try:\n  1. Check your internet connection\n  2. Refresh the page\n  3. Clear browser cache if problem persists`)
      setLoadingStatus('Failed ✗')
    }
  }

  const runCode = async () => {
    if (!pyodideRef.current || !pyodideReady) {
      setOutput('⚠️ Python environment is still loading... Please wait.')
      return
    }

    setIsRunning(true)
    setOutput('Running...\n')

    try {
      // Redirect stdin to use input
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`)

      // If there's input, mock stdin
      if (input.trim()) {
        const inputLines = input.trim().split('\n')
        const inputCode = `
import sys
from io import StringIO

class MockInput:
    def __init__(self, lines):
        self.lines = lines
        self.index = 0
    
    def __call__(self, prompt=''):
        if self.index < len(self.lines):
            value = self.lines[self.index]
            self.index += 1
            if prompt:  # Only print if there's a prompt
                print(prompt, end='')
            return value
        return ''

input = MockInput(${JSON.stringify(inputLines)})
`
        pyodideRef.current.runPython(inputCode)
      }

      // Run user code
      pyodideRef.current.runPython(code)

      // Get output
      const stdout = pyodideRef.current.runPython('sys.stdout.getvalue()')
      const stderr = pyodideRef.current.runPython('sys.stderr.getvalue()')

      let result = ''
      if (stdout) result += stdout
      if (stderr) result += '\n❌ Error:\n' + stderr

      setOutput(result || '✅ Code executed successfully (no output)')
    } catch (error: any) {
      setOutput(`❌ Error:\n${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearCode = () => {
    setCode(`# Write your Python code here
# NumPy and Pandas are available!

# Example:
# import numpy as np
# import pandas as pd

`)
    setOutput(pyodideReady ? '✅ Ready to run your code!' : loadingStatus)
    setInput('')
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'script.py'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Python Compiler
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Write and execute Python code with NumPy & Pandas support
                </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={clearCode}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={downloadCode}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={runCode}
                disabled={isRunning || !pyodideReady}
                size="sm"
                className="bg-[#51b206] hover:bg-[#51b206]/90 text-white transition-all disabled:opacity-50"
                title={!pyodideReady ? loadingStatus : 'Run your Python code'}
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : pyodideReady ? 'Run Code' : loadingStatus}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Code Editor */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Code Editor</span>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                loading={
                  <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                    <div className="text-slate-400">Loading editor...</div>
                  </div>
                }
                onMount={() => {
                  setMonacoError(false)
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>

          {/* Right Panel - Input & Output */}
          <div className="w-[400px] flex flex-col bg-white dark:bg-slate-900">
            {/* Input Section */}
            <div className="flex-1 border-b border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Input</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">One per line</span>
              </div>
              <div className="flex-1 p-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here (one value per line)"
                  className="h-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-mono text-sm resize-none focus:border-[#51b206] focus:ring-[#51b206]/50 transition-all"
                />
              </div>
            </div>

            {/* Output Section */}
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Output</span>
                <Button
                  onClick={copyOutput}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  disabled={!output}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
                <pre className="text-sm text-slate-900 dark:text-slate-300 font-mono whitespace-pre-wrap">
                  {output || `⏳ ${loadingStatus}\n\nInitializing Python compiler with NumPy & Pandas support...\nThis usually takes 10-30 seconds on first load.\n\nPlease keep this tab open while loading.`}
                </pre>
                {!pyodideReady && loadingStatus.includes('Failed') && (
                  <div className="mt-4">
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-[#51b206] hover:bg-[#51b206]/90 text-white"
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Developed by</span>
            <a
              href="https://prodhosh.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#51b206] hover:text-[#51b206]/80 transition-colors"
            >
              Prodhosh V.S
            </a>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>Powered by</span>
            <a
              href="https://pyodide.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-[#51b206] transition-colors"
            >
              Pyodide
            </a>
          </div>
        </div>
      </div>
    </>
  )
}


