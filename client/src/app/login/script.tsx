import { useState } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://psfumeaxgcsemrlzbuwq.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZnVtZWF4Z2NzZW1ybHpidXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTI4NjcsImV4cCI6MjA3NjE4ODg2N30.MJQ7ctg8kJEKVEW9DKxcQTTt0ZpaQa_n4qcdO2z78Us'

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function Auth() {
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
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setStatus('Logged out.')
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

      <p className="text-sm mt-2">{status}</p>
    </div>
  )
}
