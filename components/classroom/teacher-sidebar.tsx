'use client';

import { useState } from 'react';
import { useDoubtsLive } from '@/hooks/useDoubtsLive';
import { useClassPresence } from '@/hooks/useClassPresence';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, Users2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TeacherSidebar({ classId }: { classId: string }) {
  const { doubts, resolveDoubt } = useDoubtsLive(classId);
  const { attendees } = useClassPresence(classId, true);
  const pendingDoubts = doubts.filter(d => !d.resolved);
  const [showAttendees, setShowAttendees] = useState(false);

  return (
    <div className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full">
      {/* Attendees Section - Collapsible */}
      <div className="border-b border-zinc-800">
        <button
          onClick={() => setShowAttendees(!showAttendees)}
          className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-400" />
            Attendees
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {attendees.length}
            </Badge>
          </h2>
          <svg
            className={`w-5 h-5 transition-transform text-zinc-400 ${showAttendees ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAttendees && (
          <div className="px-4 pb-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {attendees.map((attendee) => (
                  <div 
                    key={`${attendee.uid}-${attendee.role}`} 
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <Avatar className="w-9 h-9 ring-2 ring-emerald-500/30">
                      <AvatarImage src={attendee.photoURL} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-semibold text-sm">
                        {attendee.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-zinc-100">{attendee.displayName}</p>
                      <Badge 
                        className={`text-xs px-2 py-0.5 mt-1 ${
                          attendee.role === 'teacher' 
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {attendee.role}
                      </Badge>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Doubts Section */}
      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Questions
          </h2>
          {pendingDoubts.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
              {pendingDoubts.length} New
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 pr-2">
          {doubts.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No questions yet</p>
              <p className="text-xs text-zinc-600 mt-1">Students can raise doubts anytime</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className={`p-4 rounded-lg border transition-all ${
                    doubt.resolved
                      ? 'bg-zinc-800/30 border-zinc-700/50 opacity-60'
                      : 'bg-gradient-to-br from-blue-900/20 to-zinc-800/50 border-blue-500/30 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {doubt.studentName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-zinc-100">{doubt.studentName}</span>
                        {doubt.resolved && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 inline ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-3">{doubt.question}</p>
                  {!doubt.resolved && (
                    <Button
                      size="sm"
                      onClick={() => resolveDoubt(doubt.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                  {doubt.resolved && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
