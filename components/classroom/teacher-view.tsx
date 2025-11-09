"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Whiteboard } from "@/components/classroom/whiteboard"
import { TeacherSidebar } from "@/components/classroom/teacher-sidebar"
import WebRTCVideo from "@/components/classroom/webrtc-video"
import { useAuth } from "@/hooks/useAuth"
import { useClassPresence } from "@/hooks/useClassPresence"
import { Mic, MicOff, Video, VideoOff, Monitor, Pencil, PhoneOff, Users, Play, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function TeacherView({ classId }: { classId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [mode, setMode] = useState<"video" | "whiteboard">("video")
  const { studentCount } = useClassPresence(classId, true)

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with mode switcher */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "video" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode('video')}
              className={mode === "video" ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "hover:bg-zinc-800"}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant={mode === "whiteboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode('whiteboard')}
              className={mode === "whiteboard" ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "hover:bg-zinc-800"}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Whiteboard
            </Button>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-2 px-4 py-2 text-sm">
            <Users className="w-4 h-4" />
            {studentCount} Students Online
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
        </div>
      </div>
      
      {/* Right Sidebar */}
      <TeacherSidebar classId={classId} />
    </div>
  )
}
