"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Code } from "lucide-react"

export function ChatPanel() {
  const [message, setMessage] = useState("")

  // Mock messages
  const messages = [
    {
      id: 1,
      sender: "Dr. Sarah Chen",
      role: "teacher",
      message: "Welcome everyone! Today we'll cover React Hooks.",
      time: "10:00 AM",
      isCode: false,
    },
    {
      id: 2,
      sender: "John Doe",
      role: "student",
      message: "Excited to learn!",
      time: "10:01 AM",
      isCode: false,
    },
    {
      id: 3,
      sender: "Jane Smith",
      role: "student",
      message: "Could you explain useState again?",
      time: "10:15 AM",
      isCode: false,
    },
    {
      id: 4,
      sender: "Dr. Sarah Chen",
      role: "teacher",
      message: "const [count, setCount] = useState(0)",
      time: "10:16 AM",
      isCode: true,
    },
  ]

  const handleSend = () => {
    if (message.trim()) {
      // Handle message send
      setMessage("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={`/.jpg?height=32&width=32&query=${msg.sender}`} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {msg.sender
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{msg.sender}</span>
                  {msg.role === "teacher" && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Teacher</span>
                  )}
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                {msg.isCode ? (
                  <div className="bg-secondary border border-border rounded p-2 font-mono text-xs text-foreground">
                    {msg.message}
                  </div>
                ) : (
                  <p className="text-sm text-foreground break-words">{msg.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
          <Code className="w-4 h-4" />
          Share Code Snippet
        </Button>
      </div>
    </div>
  )
}
