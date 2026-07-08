'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('9999999999')
  const [otp, setOtp] = useState('1234') // Default bypass OTP
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, otp: otp })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed')
      }
      
      // Store token (in localstorage for MVP)
      localStorage.setItem('vista_token', data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Fallback enabled.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen font-body flex items-center justify-center p-6">
      <div className="bg-[#102034] p-8 rounded-xl border border-[#404848] max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-[#9dd0cd] mb-2">VISTA</h1>
          <p className="text-[#c0c8c7] text-sm">Authorized Network Access</p>
        </div>
        
        {error && (
          <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#c0c8c7] uppercase tracking-widest mb-1">Phone Number</label>
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#0b1c30] border border-[#404848] rounded-lg p-3 text-white focus:border-[#9dd0cd] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#c0c8c7] uppercase tracking-widest mb-1">OTP (Test Bypass: 1234)</label>
            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#0b1c30] border border-[#404848] rounded-lg p-3 text-white focus:border-[#9dd0cd] outline-none"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#9dd0cd] text-[#003735] py-3 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
