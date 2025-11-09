'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

interface WhiteboardProps {
  classId: string;
  isTeacher: boolean;
}

export default function Whiteboard({ classId, isTeacher }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        viewModeEnabled={!isTeacher}
        zenModeEnabled={false}
        gridModeEnabled={true}
        theme="light"
      />
      {isTeacher && excalidrawAPI && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => {
              if (excalidrawAPI) {
                excalidrawAPI.resetScene();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Board
          </button>
          <button
            onClick={async () => {
              if (excalidrawAPI) {
                const elements = excalidrawAPI.getSceneElements();
                const appState = excalidrawAPI.getAppState();
                const blob = await excalidrawAPI.exportToBlob({
                  elements,
                  appState,
                  files: excalidrawAPI.getFiles(),
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `whiteboard-${classId}.png`;
                link.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export PNG
          </button>
        </div>
      )}
    </div>
  );
}
