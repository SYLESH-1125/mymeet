'use client';

import { useState } from 'react';
import { useDoubts } from '@/hooks/useDoubts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, HelpCircle, Send } from 'lucide-react';

interface StudentControlsProps {
  classId: string;
  studentCount: number;
}

export default function StudentControls({ classId, studentCount }: StudentControlsProps) {
  const { submitDoubt } = useDoubts(classId);
  const { user, profile } = useAuth();
  const [doubtText, setDoubtText] = useState('');
  const [showDoubtForm, setShowDoubtForm] = useState(false);

  const handleSubmitDoubt = async () => {
    if (!doubtText.trim() || !user || !profile) return;
    await submitDoubt(user.uid, profile.displayName, doubtText);
    setDoubtText('');
    setShowDoubtForm(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Student count badge */}
      <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-600" />
        <Badge variant="secondary">{studentCount} students</Badge>
      </div>

      {/* Doubt form */}
      {showDoubtForm && (
        <div className="bg-white rounded-lg shadow-xl p-4 w-80">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Ask a Doubt
          </h3>
          <Textarea
            placeholder="Type your question here..."
            value={doubtText}
            onChange={(e) => setDoubtText(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDoubtForm(false);
                setDoubtText('');
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitDoubt} disabled={!doubtText.trim()}>
              <Send className="w-3 h-3 mr-1" />
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Ask Doubt button */}
      {!showDoubtForm && (
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setShowDoubtForm(true)}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ask Doubt
        </Button>
      )}
    </div>
  );
}
