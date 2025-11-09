"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TeacherView } from "@/components/classroom/teacher-view"
import { StudentView } from "@/components/classroom/student-view"
import { Code2, Copy, Check } from "lucide-react"
import { getClassInfo } from "@/lib/classApi"

export default function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [copied, setCopied] = useState(false)
  const [userRole, setUserRole] = useState<"teacher" | "student">("student")
  const [classCode, setClassCode] = useState<string>('')

  useEffect(() => {
    const role = localStorage.getItem("userRole") as "teacher" | "student"
    if (role) setUserRole(role)
    
    // Fetch the actual class code from Firestore
    const fetchClassCode = async () => {
      try {
        const classInfo = await getClassInfo(id)
        if (classInfo) {
          setClassCode(classInfo.code)
        }
      } catch (error) {
        console.error('Error fetching class code:', error)
      }
    }
    
    fetchClassCode()
  }, [id])

  const copyClassCode = () => {
    navigator.clipboard.writeText(classCode || id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors">
              <Code2 className="w-5 h-5 text-white" />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-400">
                Class Code: <span className="font-mono font-semibold text-white ml-1">{classCode || 'Loading...'}</span>
              </p>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800" onClick={copyClassCode}>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {userRole === "teacher" ? <TeacherView classId={id} /> : <StudentView classId={id} />}
    </div>
  )
}
