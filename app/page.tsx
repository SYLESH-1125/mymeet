import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Video, Code, PenTool, Users, MessageCircle, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">EduMeet</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Interactive Online <span className="text-indigo-600">Classroom</span> Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Video conferencing, whiteboard, and code editor in one place. Scale to 1000+ students in lecture mode with Firebase and Jitsi.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14">
                Start Teaching Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                Join a Class
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to teach online</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Video className="w-7 h-7" />}
            title="Live Video Classes"
            description="Powered by Jitsi Meet. Scale to 1000+ students in lecture mode with teacher spotlight."
          />
          <FeatureCard
            icon={<PenTool className="w-7 h-7" />}
            title="Interactive Whiteboard"
            description="Draw, annotate, and explain concepts with Excalidraw. Students can watch in real-time."
          />
          <FeatureCard
            icon={<Code className="w-7 h-7" />}
            title="Live Code Editor"
            description="Monaco Editor with syntax highlighting. Teacher codes live, students follow along."
          />
          <FeatureCard
            icon={<MessageCircle className="w-7 h-7" />}
            title="Chat & Doubts"
            description="Students can ask questions anytime. Teachers manage and answer doubts efficiently."
          />
          <FeatureCard
            icon={<Users className="w-7 h-7" />}
            title="Student Management"
            description="See live attendee count, manage participants, and track engagement in real-time."
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7" />}
            title="Instant Sync"
            description="Firebase realtime database keeps everyone in sync. Switch modes instantly across all devices."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-indigo-600">1000+</div>
              <div className="text-gray-600">Students per class</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-indigo-600">3</div>
              <div className="text-gray-600">Teaching modes</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-indigo-600">Free</div>
              <div className="text-gray-600">No limits, no credit card</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to start teaching?</h2>
          <p className="text-xl mb-8 opacity-90">Create your first class in less than 30 seconds</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">EduMeet</span>
            </div>
            <p className="text-sm text-gray-600">© 2025 EduMeet. Built for educators with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 hover:border-indigo-300 hover:shadow-lg transition-all">
      <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">{icon}</div>
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
