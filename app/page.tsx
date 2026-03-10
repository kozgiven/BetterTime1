'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        
      if (!profile || !profile.sleep_time || !profile.wake_time) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    }
    
    checkSession()
  }, [router])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {loading && <p className="text-sm text-neutral-500">Loading BetterTime...</p>}
    </div>
  )
}
