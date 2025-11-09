"use client"

import { useCallback } from "react"
import LazyExcalidraw from "./lazy-excalidraw"

interface WhiteboardProps {
  classId: string;
  isTeacher: boolean;
  onWhiteboardChange?: (elements: any, appState: any) => void;
}

export function Whiteboard({ classId, isTeacher, onWhiteboardChange }: WhiteboardProps) {
  // Memoize the change handler
  const handleChange = useCallback((elements: any, appState: any) => {
    if (onWhiteboardChange && isTeacher) {
      onWhiteboardChange(elements, appState);
    }
  }, [isTeacher, onWhiteboardChange]);

  return (
    <div className="h-full w-full bg-white">
      <LazyExcalidraw 
        isTeacher={isTeacher}
        onChange={handleChange}
      />
    </div>
  )
}
