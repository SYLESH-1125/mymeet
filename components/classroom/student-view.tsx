"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import WebRTCVideo from "@/components/classroom/webrtc-video"
import TeacherStreamViewer from "@/components/classroom/teacher-stream-viewer"
import { useAuth } from "@/hooks/useAuth"
import { useClassPresence } from "@/hooks/useClassPresence"
import { useTeacherStream } from "@/hooks/useTeacherStream"
import { useDoubtsLive } from "@/hooks/useDoubtsLive"
import { Mic, MicOff, Hand, PhoneOff, Send, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Whiteboard } from "@/components/classroom/whiteboard"

export function StudentView({ classId }: { classId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isMuted, setIsMuted] = useState(true)
  const [handRaised, setHandRaised] = useState(false)
  const [doubt, setDoubt] = useState("")
  const [showDoubtBox, setShowDoubtBox] = useState(false)
  const [teacherMode] = useState<"video" | "whiteboard">("video") // Synced from teacher via Firestore
  const { studentCount } = useClassPresence(classId, false)
  const { teacherStream } = useTeacherStream(classId)
  const { submitDoubt } = useDoubtsLive(classId)
  const [isClassActive] = useState(true)

  const handleSubmitDoubt = async () => {
    if (doubt.trim()) {
      try {
        await submitDoubt(doubt)
        setDoubt("")
        setShowDoubtBox(false)
        alert("Doubt submitted to teacher!")
      } catch (error) {
        alert("Failed to submit doubt")
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Bar with Student Count */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-2 px-4 py-2">
          <Users className="w-4 h-4" />
          {studentCount} Students Attending
        </Badge>
        {isClassActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm text-emerald-400 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-zinc-900 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl h-full flex flex-col gap-6">
          {/* Teacher's Content Area */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
            {teacherMode === "video" && (
              <TeacherStreamViewer
                roomId={classId}
                teacherName="Teacher"
              />
            )}
            {teacherMode === "whiteboard" && <Whiteboard classId={classId} isTeacher={false} />}
          </div>

          {/* Ask Doubt Section */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50">
            {!showDoubtBox ? (
              <Button
                variant="outline"
                className="w-full bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 h-11"
                onClick={() => setShowDoubtBox(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Ask a Question or Submit Doubt
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Type your question or doubt here..."
                  value={doubt}
                  onChange={(e) => setDoubt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitDoubt()}
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSubmitDoubt} className="bg-indigo-600 hover:bg-indigo-500">
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDoubtBox(false)}
                    className="hover:bg-zinc-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className={isMuted ? "" : "bg-zinc-800 hover:bg-zinc-700"}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            variant={handRaised ? "default" : "secondary"}
            className={handRaised ? "bg-indigo-600 hover:bg-indigo-500 gap-2" : "bg-zinc-800 hover:bg-zinc-700 gap-2"}
            onClick={() => setHandRaised(!handRaised)}
          >
            <Hand className="w-5 h-5" />
            {handRaised ? "Lower Hand" : "Raise Hand"}
          </Button>
          <Button variant="destructive" size="icon" onClick={() => router.push("/dashboard")}>
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
