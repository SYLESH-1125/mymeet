"use client"

import { useCallback, useEffect, useState } from "react"
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import LazyExcalidraw from "./lazy-excalidraw"

interface WhiteboardProps {
  classId: string;
  isTeacher: boolean;
  onWhiteboardChange?: (elements: any, appState: any) => void;
}

export function Whiteboard({ classId, isTeacher }: WhiteboardProps) {
  const [whiteboardData, setWhiteboardData] = useState<any>(null);

  // Listen to whiteboard changes in real-time (for students)
  useEffect(() => {
    if (!isTeacher && classId) {
      const unsubscribe = onSnapshot(
        doc(db, 'classes', classId, 'whiteboard', 'current'),
        (docSnap) => {
          if (docSnap.exists()) {
            setWhiteboardData(docSnap.data());
          }
        }
      );
      return () => unsubscribe();
    }
  }, [classId, isTeacher]);

  // Handle whiteboard changes (for teacher)
  const handleChange = useCallback(async (elements: any, appState: any) => {
    if (isTeacher && classId) {
      try {
        // Serialize appState to remove Map objects and non-serializable data
        const serializedAppState = {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          currentItemFillStyle: appState.currentItemFillStyle,
          currentItemStrokeWidth: appState.currentItemStrokeWidth,
          currentItemRoughness: appState.currentItemRoughness,
          currentItemOpacity: appState.currentItemOpacity,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom,
          // Removed collaborators Map and other non-serializable fields
        };
        
        await setDoc(
          doc(db, 'classes', classId, 'whiteboard', 'current'),
          { elements, appState: serializedAppState, updatedAt: Date.now() },
          { merge: true }
        );
      } catch (error) {
        console.error('Error updating whiteboard:', error);
      }
    }
  }, [isTeacher, classId]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-zinc-50 to-zinc-100 relative">
      <LazyExcalidraw 
        isTeacher={isTeacher}
        onChange={handleChange}
      />
      {!isTeacher && (
        <div className="absolute top-4 right-4 bg-zinc-900/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
          View Only
        </div>
      )}
    </div>
  )
}

