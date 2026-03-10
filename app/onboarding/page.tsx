'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [sleepTime, setSleepTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else setUserId(session.user.id)
    }
    getUser()
  }, [router])

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name || 'Student',
          sleep_time: sleepTime,
          wake_time: wakeTime
        })
        
      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.message || 'Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Profile</CardTitle>
          <CardDescription>
            BetterTime schedules your day around your sleep to protect your rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">What's your name?</Label>
            <Input
              id="name"
              placeholder="e.g., Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleepTime">When do you plan to sleep?</Label>
            <Input
              id="sleepTime"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">e.g., 11:00 PM</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wakeTime">When do you wake up?</Label>
            <Input
              id="wakeTime"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Set Anchor & Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
