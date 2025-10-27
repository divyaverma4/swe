"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Session } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Sparkles, User } from "lucide-react"

type LoginType = "user" | "creator" | null

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loginType, setLoginType] = useState<LoginType>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string>("")

  // -------- AUTH HANDLERS --------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("🔐 Logging in...")

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus(`❌ ${error.message}`)
      console.error(error)
    } else {
      setStatus(`✅ Logged in as ${data.user?.email}`)
      console.log("Login success:", data)
      await handleCheckBackend(data.session)

      // Redirect after login
      router.push("/home")
    }
  }

  const handleSignup = async () => {
    setStatus("✉️ Signing up...")
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setStatus(`❌ ${error.message}`)
    } else {
      setStatus("✅ Sign-up successful! Check your email to confirm your account.")
      console.log(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setStatus("🚪 Logged out.")
  }

  const handleCheckBackend = async (session: Session | null = null) => {
    setStatus("Checking backend status...")

    let sessionToUse = session
    if (!sessionToUse) {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setStatus(`❌ Error getting session: ${sessionError.message}`)
        return
      }
      sessionToUse = currentSession
    }

    if (!sessionToUse) {
      setStatus("❌ You must be logged in to check the backend.")
      return
    }

    const token = sessionToUse.access_token
    try {
      const response = await fetch("http://localhost:3001/status", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error from backend")

      setStatus(`✅ Backend OK: ${data.message} (User: ${data.user_email})`)
    } catch (error: any) {
      setStatus(prev => `${prev}\n... ❌ Backend error: ${error.message}`)
      console.error(error)
    }
  }

  // -------- UI --------
  if (!loginType) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
              Welcome to <span className="text-primary">ARTichoke</span>
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Discover ideas, create inspiration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* User Login Card */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-primary/50"
              onClick={() => setLoginType("user")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 md:p-10">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-3">I'm a User</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Browse, save, and organize inspiring ideas from creators around the world
                </p>
                <Button className="w-full mt-8 h-12 text-base font-semibold">
                  Continue as User
                </Button>
              </div>
            </Card>

            {/* Creator Login Card */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-secondary/50"
              onClick={() => setLoginType("creator")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 md:p-10">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-3">I'm a Creator</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Share your work, grow your audience, and inspire millions of people
                </p>
                <Button className="w-full mt-8 h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Continue as Creator
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // -------- LOGIN FORM --------
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
          loginType === "user" ? "bg-primary" : "bg-secondary"
        }`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          {loginType === "user" ? (
            <User className="w-24 h-24 mx-auto mb-6" />
          ) : (
            <Sparkles className="w-24 h-24 mx-auto mb-6" />
          )}
          <h2 className="text-4xl font-bold mb-4">
            {loginType === "user" ? "Discover Your Next Idea" : "Share Your Creative Vision"}
          </h2>
          <p className="text-lg opacity-90 max-w-md">
            {loginType === "user"
              ? "Join millions of users finding inspiration for every project and interest"
              : "Reach a global audience and turn your passion into opportunity"}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => setLoginType(null)}
            className="mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to selection
          </button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your {loginType} account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-base font-semibold ${
                loginType === "creator"
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  : ""
              }`}
            >
              Sign in
            </Button>

            <Button
              type="button"
              onClick={handleSignup}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              Sign up
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground whitespace-pre-wrap">
            {status}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
