import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, MessageSquare, Loader2, Phone } from 'lucide-react'

interface AuthProps {
  onAuth: () => void
}

export default function Auth({ onAuth }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email') // New state for auth method
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('') // New state for phone number
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (authMethod === 'email') {
        // Email-based authentication
        const { error } = isSignUp
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error
        onAuth()
      } else {
        // Phone-based authentication
        if (isSignUp) {
          // Sign up with phone
          const { error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
              data: {
                phone_number: phone
              }
            }
          })
          if (error) throw error
          alert('Verification code sent to your phone!')
        } else {
          // Sign in with phone
          const { error } = await supabase.auth.signInWithPassword({
            phone,
            password
          })
          if (error) throw error
          onAuth()
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Dire-Chat</h1>
            <p className="text-gray-300">Experience seamless conversations</p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex mb-6 bg-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                authMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
                authMethod === 'phone'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMethod === 'email' ? (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
                authMethod === 'phone'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}