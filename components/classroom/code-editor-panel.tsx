'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useCodeEditor } from '@/hooks/useCodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CodeEditorProps {
  classId: string;
  isTeacher: boolean;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
];

export default function CodeEditorPanel({ classId, isTeacher }: CodeEditorProps) {
  const { codeDoc, updateCode } = useCodeEditor(classId);
  const [localContent, setLocalContent] = useState('');
  const [localLang, setLocalLang] = useState('javascript');

  useEffect(() => {
    if (codeDoc) {
      setLocalContent(codeDoc.content);
      setLocalLang(codeDoc.lang);
    }
  }, [codeDoc]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalContent(value);
      if (isTeacher) {
        // Debounce updates to Firestore
        const timeoutId = setTimeout(() => {
          updateCode(value, localLang);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLocalLang(newLang);
    if (isTeacher) {
      updateCode(localContent, newLang);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isTeacher && (
        <div className="p-2 bg-gray-100 border-b flex items-center gap-4">
          <span className="text-sm font-medium">Language:</span>
          <Select value={localLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isTeacher && (
            <span className="text-xs text-gray-500">(Read-only mode)</span>
          )}
        </div>
      )}
      {!isTeacher && (
        <div className="p-2 bg-yellow-50 border-b text-sm text-yellow-800">
          Read-only mode - Only the teacher can edit
        </div>
      )}
      <div className="flex-1">
        <Editor
          height="100%"
          language={localLang}
          value={localContent}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: !isTeacher,
            minimap: { enabled: isTeacher },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
