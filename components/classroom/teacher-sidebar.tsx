'use client';

import { useState } from 'react';
import { useRoomPresence } from '@/hooks/useRoomPresence';
import { useChat } from '@/hooks/useChat';
import { useDoubts } from '@/hooks/useDoubts';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageCircle, HelpCircle, Send, Check } from 'lucide-react';
import { format } from 'date-fns';

interface TeacherSidebarProps {
  classId: string;
}

export function TeacherSidebar({ classId }: TeacherSidebarProps) {
  const { attendees, studentCount } = useRoomPresence(classId);
  const { messages, sendMessage } = useChat(classId);
  const { doubts, markAnswered } = useDoubts(classId);
  const { user, profile } = useAuth();

  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !profile) return;
    await sendMessage(user.uid, profile.displayName, profile.photoURL, chatInput);
    setChatInput('');
  };

  const handleMarkAnswered = async (doubtId: string) => {
    await markAnswered(doubtId);
  };

  const newDoubtsCount = doubts.filter((d) => d.status === 'new').length;

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <Tabs defaultValue="students" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="students" className="relative">
            <Users className="w-4 h-4 mr-1" />
            Students
            <Badge variant="secondary" className="ml-1 text-xs">
              {studentCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="doubts" className="relative">
            <HelpCircle className="w-4 h-4 mr-1" />
            Doubts
            {newDoubtsCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {newDoubtsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div key={attendee.uid} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={attendee.photoURL} />
                    <AvatarFallback>{attendee.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attendee.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{attendee.role}</p>
                  </div>
                  {attendee.presence && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2">
                  <Avatar className="w-6 h-6 mt-1">
                    <AvatarImage src={msg.photoURL} />
                    <AvatarFallback>{msg.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{msg.displayName}</span>
                      <span className="text-xs text-gray-500">
                        {msg.ts && format(msg.ts.toDate(), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Input
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="doubts" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className={`p-3 rounded border ${
                    doubt.status === 'new' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium">{doubt.displayName}</p>
                      <p className="text-xs text-gray-500">
                        {doubt.ts && format(doubt.ts.toDate(), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    {doubt.status === 'new' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAnswered(doubt.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Mark Answered
                      </Button>
                    ) : (
                      <Badge variant="secondary">Answered</Badge>
                    )}
                  </div>
                  <p className="text-sm">{doubt.text}</p>
                </div>
              ))}
              {doubts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No doubts yet</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
