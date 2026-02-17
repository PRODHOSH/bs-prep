"use client"

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Play, Trash2, Copy, Download } from 'lucide-react'
import { Navbar } from '@/components/navbar'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function PythonCompilerPage() {
  const [code, setCode] = useState(`# Write your Python code here
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef<any>(null)

  useEffect(() => {
    // Suppress Next.js dev error overlay noise from CDN scripts
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      const allMessages = args.join(' ')
      
      // Filter out known harmless errors from Next.js dev tools and external CDN scripts
      if (
        message.includes('stackframe') ||
        message.includes('error-stack-parser') ||
        message.includes('[object Event]') ||
        message.includes('modules that depend on it') ||
        allMessages.includes('cdn.jsdelivr') ||
        allMessages.includes('pyodide.js') ||
        allMessages.includes('monaco-editor')
      ) {
        return // Suppress these errors
      }
      originalConsoleError.apply(console, args)
    }

    // Load Pyodide script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js'
    script.async = true
    script.onload = () => {
      initializePyodide()
    }
    script.onerror = () => {
      setOutput('❌ Failed to load Pyodide script. Please check your internet connection.')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup
      console.error = originalConsoleError
      document.body.removeChild(script)
    }
  }, [])

  const initializePyodide = async () => {
    try {
      setOutput('⏳ Initializing Python environment...')
      
      // Wait a bit for loadPyodide to be available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (typeof (window as any).loadPyodide === 'undefined') {
        setOutput('❌ Pyodide loader not available. Please refresh the page.')
        return
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
      })
      
      pyodideRef.current = pyodide
      setPyodideReady(true)
      setOutput('✅ Python environment ready! Write your code and click Run.')
    } catch (error: any) {
      console.error('Failed to initialize Pyodide:', error)
      setOutput(`❌ Failed to initialize Python environment: ${error.message}`)
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
    setCode('# Write your Python code here\n')
    setOutput('')
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
                  Write and execute Python code instantly in your browser
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
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : pyodideReady ? 'Run Code' : 'Loading...'}
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
                  {output || (pyodideReady ? 'Click "Run Code" to see output' : 'Loading Python environment...')}
                </pre>
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


