"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/classroom/code-editor"
import { Whiteboard } from "@/components/classroom/whiteboard"
import { TeacherSidebar } from "@/components/classroom/teacher-sidebar"
import WebRTCVideo from "@/components/classroom/webrtc-video"
import { useAuth } from "@/hooks/useAuth"
import { Mic, MicOff, Video, VideoOff, Monitor, Pencil, Code2, PhoneOff, Users, Play, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function TeacherView({ classId }: { classId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [mode, setMode] = useState<"video" | "code" | "whiteboard">("video")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isClassActive, setIsClassActive] = useState(false)
  const [studentCount] = useState(0) // Will be updated via Firestore

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Top bar with mode switcher */}
      <div className="flex-1 flex flex-col">
        <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'video' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('video')}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant={mode === 'whiteboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('whiteboard')}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Whiteboard
            </Button>
            <Button
              variant={mode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('code')}
            >
              <Code2 className="w-4 h-4 mr-2" />
              Code
            </Button>
          </div>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 gap-2 px-3 py-1.5">
            <Users className="w-4 h-4" />
            {studentCount} Students
          </Badge>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {mode === 'video' && (
            <WebRTCVideo
              roomId={classId}
              userName={user?.displayName || 'Teacher'}
              isTeacher={true}
            />
          )}
          {mode === 'whiteboard' && (
            <Whiteboard classId={classId} isTeacher={true} />
          )}
          {mode === 'code' && (
            <CodeEditor classId={classId} isTeacher={true} />
          )}
        </div>
      </div>      {/* Right Sidebar - Tabbed Interface */}
      <TeacherSidebar classId={classId} />
    </div>
  )
}
