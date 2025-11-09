"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/classroom/code-editor"
import { Whiteboard } from "@/components/classroom/whiteboard"
import { TeacherSidebar } from "@/components/classroom/teacher-sidebar"
import JitsiFrame from "@/components/classroom/jitsi-frame"
import { useAuth } from "@/hooks/useAuth"
import { Mic, MicOff, Video, VideoOff, Monitor, Pencil, Code2, PhoneOff, Users, Play, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function TeacherView({ classId }: { classId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [mode, setMode] = useState<"video" | "code" | "whiteboard" | "presentation">("video")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isClassActive, setIsClassActive] = useState(false)
  const [studentCount] = useState(0) // Will be updated via Firestore

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Teaching Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Student Count and Class Status */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 gap-2 px-3 py-1.5">
              <Users className="w-4 h-4" />
              {studentCount} Students
            </Badge>
            {isClassActive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-zinc-400">Class in Session</span>
              </div>
            )}
          </div>
          {!isClassActive ? (
            <Button className="bg-green-600 hover:bg-green-500 gap-2" onClick={() => setIsClassActive(true)}>
              <Play className="w-4 h-4" />
              Start Class
            </Button>
          ) : (
            <Button variant="destructive" className="gap-2" onClick={() => setIsClassActive(false)}>
              <Square className="w-4 h-4" />
              Stop Class
            </Button>
          )}
        </div>

        {/* Teaching Content */}
        <div className="flex-1 bg-zinc-900 overflow-hidden">
          {mode === "video" && (
            <div className="h-full relative">
              {isClassActive && user ? (
                <JitsiFrame
                  roomName={`edumeet-${classId}`}
                  userDisplayName={user.displayName || 'Teacher'}
                  userEmail={user.email || ''}
                  isTeacher={true}
                  onReady={() => console.log('Jitsi ready')}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <p className="text-white text-xl font-medium">Class not started yet</p>
                    <p className="text-zinc-400 text-sm">Click "Start Class" to begin the video session</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {mode === "code" && <CodeEditor />}
          {mode === "whiteboard" && <Whiteboard />}
          {mode === "presentation" && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="w-full h-full bg-zinc-800 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Monitor className="w-16 h-16 text-zinc-600 mx-auto" />
                  <p className="text-zinc-400">Screen sharing will appear here</p>
                  <Button variant="outline" size="sm" className="bg-zinc-700 hover:bg-zinc-600">
                    Share Screen
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <Button
                variant={mode === "video" ? "default" : "ghost"}
                size="sm"
                className={mode === "video" ? "bg-indigo-600 hover:bg-indigo-500" : "hover:bg-zinc-800 text-zinc-400"}
                onClick={() => setMode("video")}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button
                variant={mode === "code" ? "default" : "ghost"}
                size="sm"
                className={mode === "code" ? "bg-indigo-600 hover:bg-indigo-500" : "hover:bg-zinc-800 text-zinc-400"}
                onClick={() => setMode("code")}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code Editor
              </Button>
              <Button
                variant={mode === "whiteboard" ? "default" : "ghost"}
                size="sm"
                className={
                  mode === "whiteboard" ? "bg-indigo-600 hover:bg-indigo-500" : "hover:bg-zinc-800 text-zinc-400"
                }
                onClick={() => setMode("whiteboard")}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Whiteboard
              </Button>
              <Button
                variant={mode === "presentation" ? "default" : "ghost"}
                size="sm"
                className={
                  mode === "presentation" ? "bg-indigo-600 hover:bg-indigo-500" : "hover:bg-zinc-800 text-zinc-400"
                }
                onClick={() => setMode("presentation")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Present
              </Button>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className={isMuted ? "" : "bg-zinc-800 hover:bg-zinc-700"}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className={isVideoOff ? "" : "bg-zinc-800 hover:bg-zinc-700"}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => router.push("/dashboard")}>
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Tabbed Interface */}
      <TeacherSidebar classId={classId} />
    </div>
  )
}
