'use client';

import { lazy, Suspense, memo, useCallback, useRef } from 'react';

// Lazy load Excalidraw
const Excalidraw = lazy(() => 
  import('@excalidraw/excalidraw').then(module => ({ 
    default: module.Excalidraw 
  }))
);

interface LazyExcalidrawProps {
  isTeacher: boolean;
  onChange?: (elements: any, appState: any) => void;
}

const LoadingSkeleton = memo(() => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
      <div className="text-zinc-700 text-sm font-medium">Loading whiteboard...</div>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// RAF-based batching for whiteboard updates
function useRAFBatch(callback: (elements: any, appState: any) => void, delay: number = 16) {
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<{ elements: any; appState: any } | null>(null);

  return useCallback((elements: any, appState: any) => {
    dataRef.current = { elements, appState };

    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(() => {
        if (dataRef.current) {
          callback(dataRef.current.elements, dataRef.current.appState);
        }
        rafRef.current = null;
        dataRef.current = null;
      });
    }
  }, [callback]);
}

// Memoized Excalidraw component
const MemoizedExcalidraw = memo(({ isTeacher, onChange }: LazyExcalidrawProps) => {
  // Batch updates using RAF
  const batchedOnChange = useRAFBatch((elements, appState) => {
    if (onChange) {
      onChange(elements, appState);
    }
  });

  return (
    <Excalidraw
      onChange={batchedOnChange}
      viewModeEnabled={!isTeacher}
      zenModeEnabled={false}
      gridModeEnabled={true}
      theme="light"
      initialData={{
        appState: {
          zoom: { value: 1 }, // Start at 100% zoom
          scrollX: 0,
          scrollY: 0,
        },
        scrollToContent: false,
      }}
    />
  );
});

MemoizedExcalidraw.displayName = 'MemoizedExcalidraw';

export default function LazyExcalidraw(props: LazyExcalidrawProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MemoizedExcalidraw {...props} />
    </Suspense>
  );
}
