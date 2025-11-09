'use client';

import { lazy, Suspense, memo } from 'react';

// Lazy load Monaco editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface LazyMonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  theme?: string;
}

const LoadingSkeleton = memo(() => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
      <div className="text-white text-sm">Loading code editor...</div>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized editor component
const MemoizedMonaco = memo(({ value, language, onChange, theme }: LazyMonacoEditorProps) => (
  <MonacoEditor
    height="100%"
    language={language}
    value={value}
    onChange={onChange}
    theme={theme || 'vs-dark'}
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      // Performance optimizations
      renderValidationDecorations: 'off',
      renderWhitespace: 'none',
      renderLineHighlight: 'line',
      occurrencesHighlight: 'off',
      selectionHighlight: false,
      foldingStrategy: 'auto',
      showFoldingControls: 'mouseover',
    }}
  />
));

MemoizedMonaco.displayName = 'MemoizedMonaco';

export default function LazyMonacoEditor(props: LazyMonacoEditorProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MemoizedMonaco {...props} />
    </Suspense>
  );
}
