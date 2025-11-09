"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VideoGrid() {
  // Mock participants
  const participants = [
    { id: 1, name: "Dr. Sarah Chen", role: "teacher", isSpeaking: true, isMuted: false },
    { id: 2, name: "John Doe", role: "student", isSpeaking: false, isMuted: false },
    { id: 3, name: "Jane Smith", role: "student", isSpeaking: false, isMuted: true },
    { id: 4, name: "Mike Johnson", role: "student", isSpeaking: false, isMuted: false },
    { id: 5, name: "Emily Brown", role: "student", isSpeaking: false, isMuted: true },
    { id: 6, name: "David Lee", role: "student", isSpeaking: false, isMuted: false },
  ]

  return (
    <div className="h-full bg-background p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`relative bg-secondary rounded-lg overflow-hidden group ${
              participant.isSpeaking ? "ring-2 ring-accent" : ""
            }`}
          >
            {/* Video placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="w-20 h-20">
                <AvatarImage src={`/.jpg?height=80&width=80&query=${participant.name}`} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {participant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2">
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <Pin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Name and status bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-white text-sm font-medium truncate">{participant.name}</span>
                {participant.role === "teacher" && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Host</span>
                )}
              </div>
              <div className="flex-shrink-0">
                {participant.isMuted ? (
                  <MicOff className="w-4 h-4 text-destructive" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
