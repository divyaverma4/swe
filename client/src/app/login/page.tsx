"use client"

import React from "react";
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'

export default function AuthPage() {
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string>('')

  const handleSignup = async () => {
    setStatus('Signing up...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setStatus(`❌ ${error.message}`)
      console.error(error)
    } else {
      setStatus('✅ Sign-up successful! Check your email.')
      console.log(data)
    }
  }

  const handleLogin = async () => {
    setStatus('Logging in...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setStatus(`❌ ${error.message}`)
      console.error(error)
    } else {
      setStatus(`✅ Logged in as ${data.user?.email}`)
      console.log(data)
    
      await handleCheckBackend(data.session)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setStatus('Logged out.')
  }

  const handleCheckBackend = async (session: Session | null = null) => {
    setStatus('Checking backend status...')

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
      setStatus('❌ You must be logged in to check the backend.')
      return
    }

    const token = sessionToUse.access_token
    try {
      const response = await fetch('http://localhost:5001/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Error from backend')
      }

      // Update status to show the backend result
      setStatus(`✅ Backend OK: ${data.message} (User: ${data.user_email})`)
      console.log(data)

    } catch (error: any) {
      // Prepend to the existing status instead of replacing it
      setStatus(prevStatus => `${prevStatus}\n... ❌ Backend error: ${error.message}`)
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-3">
      <h2 className="text-xl font-semibold">Supabase Auth</h2>

      <input
        type="email"
        placeholder="Email"
        className="border rounded p-2 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border rounded p-2 w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex space-x-2">
        <button
          onClick={handleSignup}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Log Out
        </button>
      </div>
      <p className="text-sm mt-2 whitespace-pre-wrap">{status}</p>
    </div>
  )
}