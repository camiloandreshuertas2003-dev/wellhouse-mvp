'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Wait for Supabase client to parse the URL hash and store the session
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        setTimeout(() => {
          router.push('/search')
        }, 1500)
      }
    })

    // Fallback if the user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setTimeout(() => {
          router.push('/search')
        }, 1500)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="fixed inset-0 z-50 bg-ink-teal-900 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="flex gap-1 overflow-hidden mb-6">
        {'Wellhouse'.split('').map((letter, i) => (
          <span
            key={i}
            className="font-fraunces font-bold text-5xl md:text-7xl text-white inline-block"
            style={{ 
              animation: `bounce 1s infinite alternate ${i * 0.1}s`,
              color: i >= 4 ? '#EFA83C' : 'white' // 'house' in accent-mango
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <p className="font-inter text-white/70 tracking-widest uppercase text-sm font-medium">
        Preparando tu estadía{dots}
      </p>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-15px); }
        }
      `}} />
    </div>
  )
}
