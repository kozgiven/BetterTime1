'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionEnd()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const handleSessionEnd = async () => {
    setIsActive(false)
    const nextIsBreak = !isBreak
    setIsBreak(nextIsBreak)
    setTimeLeft(nextIsBreak ? 5 * 60 : 25 * 60)
    
    if (!nextIsBreak) {
      setSessionCount(prev => prev + 1)
      // Award XP for completion
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('xp').eq('id', session.user.id).single()
        if (profile) {
          await supabase.from('profiles').update({ xp: (profile.xp || 0) + 10 }).eq('id', session.user.id)
        }
      }
    }
  }

  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(25 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={`border-2 transition-colors ${isBreak ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2">
          {isBreak ? <Coffee className="w-5 h-5 text-green-600" /> : <Brain className="w-5 h-5 text-blue-600" />}
          <span>{isBreak ? 'Short Break' : 'Focus Mode'}</span>
        </CardTitle>
        <CardDescription>
          {isBreak ? 'Rest your eyes.' : 'Deep work session.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-5xl font-mono font-bold my-4">
          {formatTime(timeLeft)}
        </div>
        <div className="flex space-x-2">
          <Button variant={isActive ? "outline" : "default"} onClick={toggleTimer} className="w-24">
            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetTimer}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Sessions Completed: {sessionCount}
        </div>
      </CardContent>
    </Card>
  )
}
