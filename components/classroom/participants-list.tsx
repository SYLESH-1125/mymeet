"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Hand, Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ParticipantsList() {
  // Mock participants with more details
  const participants = [
    { id: 1, name: "Dr. Sarah Chen", role: "teacher", isMuted: false, isVideoOn: true, handRaised: false },
    { id: 2, name: "John Doe", role: "student", isMuted: false, isVideoOn: true, handRaised: false },
    { id: 3, name: "Jane Smith", role: "student", isMuted: true, isVideoOn: false, handRaised: true },
    { id: 4, name: "Mike Johnson", role: "student", isMuted: false, isVideoOn: true, handRaised: false },
    { id: 5, name: "Emily Brown", role: "student", isMuted: true, isVideoOn: true, handRaised: false },
    { id: 6, name: "David Lee", role: "student", isMuted: false, isVideoOn: false, handRaised: true },
    { id: 7, name: "Sarah Wilson", role: "student", isMuted: false, isVideoOn: true, handRaised: false },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Participants ({participants.length})</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group"
            >
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={`/.jpg?height=36&width=36&query=${participant.name}`} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {participant.handRaised && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <Hand className="w-3 h-3 text-accent-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{participant.name}</span>
                  {participant.role === "teacher" && (
                    <Badge variant="default" className="text-xs">
                      Host
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {participant.isMuted ? (
                  <MicOff className="w-4 h-4 text-destructive" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
                {participant.isVideoOn ? (
                  <Video className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <VideoOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
