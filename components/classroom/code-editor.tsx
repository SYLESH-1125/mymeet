"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Copy, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LazyMonacoEditor from "./lazy-monaco"

interface CodeEditorProps {
  classId: string;
  isTeacher: boolean;
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string, language: string) => void;
}

export function CodeEditor({ 
  classId, 
  isTeacher, 
  initialCode = '', 
  initialLanguage = 'javascript',
  onCodeChange 
}: CodeEditorProps) {
  const { toast } = useToast()
  const [language, setLanguage] = useState(initialLanguage)
  const [code, setCode] = useState(initialCode || `// Welcome to EduMeet - Live Collaborative Editor

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`)

  // Memoize handlers
  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    if (onCodeChange && isTeacher) {
      onCodeChange(newCode, language);
    }
  }, [language, isTeacher, onCodeChange]);

  const handleLanguageChange = useCallback((newLang: string) => {
    setLanguage(newLang);
    if (onCodeChange && isTeacher) {
      onCodeChange(code, newLang);
    }
  }, [code, isTeacher, onCodeChange]);

  const handleRun = useCallback(() => {
    toast({
      title: "Code Executed",
      description: "Check the console for output",
    })
  }, [toast]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }, [code, toast]);

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Editor Toolbar */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange} disabled={!isTeacher}>
            <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-zinc-400">Live editing</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isTeacher && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={handleRun}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Editor - Lazy Loaded */}
      <div className="flex-1 overflow-hidden">
        <LazyMonacoEditor
          value={code}
          language={language}
          onChange={handleCodeChange}
          theme="vs-dark"
        />
      </div>

      {/* Output Console */}
      {isTeacher && (
        <div className="border-t border-zinc-800 bg-zinc-900 p-4 h-28">
          <div className="text-xs font-semibold text-zinc-400 mb-2">Console Output</div>
          <div className="font-mono text-xs text-zinc-500 space-y-1">
            <div className="text-indigo-400">{`> Running ${language}...`}</div>
            <div className="text-zinc-300">55</div>
          </div>
        </div>
      )}
    </div>
  )
}
