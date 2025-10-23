"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Sparkles, User } from "lucide-react"

type LoginType = "user" | "creator" | null

export function LoginScreen() {
  const [loginType, setLoginType] = useState<LoginType>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login attempt:", { loginType, email })
    // Handle login logic here
  }

  if (!loginType) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
              Welcome to <span className="text-primary">ARTichoke</span>
            </h1>
            <p className="text-lg text-muted-foreground text-balance">Discover ideas, create inspiration</p>
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
                <h2 className="text-3xl font-bold mb-3 text-balance">I'm a User</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Browse, save, and organize inspiring ideas from creators around the world
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Create boards and collections
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Follow your favorite creators
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Get personalized recommendations
                  </li>
                </ul>
                <Button className="w-full mt-8 h-12 text-base font-semibold" size="lg">
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
                <h2 className="text-3xl font-bold mb-3 text-balance">I'm a Creator</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Share your work, grow your audience, and inspire millions of people
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Upload and showcase your work
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Access creator analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Monetize your content
                  </li>
                </ul>
                <Button
                  className="w-full mt-8 h-12 text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                >
                  Continue as Creator
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
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
          <div className="mb-8">
            {loginType === "user" ? (
              <User className="w-24 h-24 mx-auto mb-6" />
            ) : (
              <Sparkles className="w-24 h-24 mx-auto mb-6" />
            )}
          </div>
          <h2 className="text-4xl font-bold mb-4 text-balance">
            {loginType === "user" ? "Discover Your Next Idea" : "Share Your Creative Vision"}
          </h2>
          <p className="text-lg opacity-90 max-w-md text-balance">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">Welcome back</h1>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
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
                loginType === "creator" ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : ""
              }`}
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account? <button className="text-primary hover:underline font-semibold">Sign up</button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 bg-transparent">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12 bg-transparent">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
