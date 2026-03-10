'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, Clock, Moon, AlertTriangle, PlayCircle, Trophy, Zap, Star, Battery } from 'lucide-react'
import { PomodoroTimer } from '@/components/pomodoro'
import { EnergyLogger } from '@/components/energy-logger'
import { SleepTracker } from '@/components/sleep-tracker'
import { DailyRoadmap } from '@/components/daily-roadmap'
import { DailyLeaderboard } from '@/components/leaderboard'
import { StudyBuddies } from '@/components/study-buddies'
import { Progress } from '@/components/ui/progress'

type Profile = {
  sleep_time: string
  wake_time: string
  xp: number
  level: number
}

type Task = {
  id: string
  title: string
  duration_minutes: number
  created_at: string
}

type ScheduleBlock = {
  id: string
  title: string
  type: 'task' | 'focus_buffer' | 'sleep' | 'class'
  startTime: Date
  endTime: Date
  duration: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [dbBlocks, setDbBlocks] = useState<ScheduleBlock[]>([])
  const [energyLogs, setEnergyLogs] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // We refresh current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id

      const [profileResponse, tasksResponse, blocksResponse, energyResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('schedule_blocks').select('*').eq('user_id', userId),
        supabase.from('energy_logs').select('energy_level').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ])

      if (profileResponse.error || !profileResponse.data?.sleep_time) {
        router.push('/onboarding')
        return
      }

      setProfile({
        sleep_time: profileResponse.data.sleep_time,
        wake_time: profileResponse.data.wake_time,
        xp: profileResponse.data.xp || 0,
        level: profileResponse.data.level || 1
      })
      setTasks(tasksResponse.data || [])
      setEnergyLogs((energyResponse.data || []).map((e: any) => e.energy_level))
      
      const parsedBlocks: ScheduleBlock[] = (blocksResponse.data || []).map(b => ({
        id: b.id,
        title: b.title || 'Scheduled Event',
        type: b.block_type as any,
        startTime: new Date(b.start_time),
        endTime: new Date(b.end_time),
        duration: Math.floor((new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 60000)
      }))

      setDbBlocks(parsedBlocks)
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-muted-foreground">
        Loading your day...
      </div>
    )
  }

  // Parse sleep time relative to current time
  const parseSleepTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date(currentTime)
    date.setHours(hours, minutes, 0, 0)
    
    // If sleep time is early morning (e.g. 2AM) and it's evening now (e.g. 5PM)
    // it means they sleep tomorrow
    if (date < currentTime && currentTime.getHours() - date.getHours() > 12) {
      date.setDate(date.getDate() + 1)
    }
    // If sleep time is past, and diff is small, we are late for sleep!
    return date
  }

  const sleepDate = parseSleepTime(profile.sleep_time)
  const availableMinutesBeforeSleep = Math.max(0, Math.floor((sleepDate.getTime() - currentTime.getTime()) / 60000))

  // Generate Adaptive Schedule
  const generateAdaptiveSchedule = () => {
    let schedule: ScheduleBlock[] = []
    
    // 1. Add fixed blocks (classes)
    const fixedBlocks = [...dbBlocks].filter(b => b.type === 'class')
    schedule = [...fixedBlocks]

    // 2. Add Sleep block
    schedule.push({
      id: 'sleep-anchor',
      title: 'Sleep Anchor',
      type: 'sleep',
      startTime: sleepDate,
      endTime: new Date(sleepDate.getTime() + 8 * 3600000),
      duration: 480
    })

    // 3. Sort tasks based on current energy (Simplified: High energy -> Long tasks first)
    const avgEnergy = energyLogs.length > 0 ? energyLogs.reduce((a,b) => a+b, 0) / energyLogs.length : 3
    const sortedTasks = [...tasks].sort((a, b) => {
      if (avgEnergy >= 4) return b.duration_minutes - a.duration_minutes // Peak energy: eat the frog
      return a.duration_minutes - b.duration_minutes // Low energy: quick wins
    })

    // 4. Fill gaps
    let currentTimePointer = new Date(currentTime)
    
    // Sort all fixed events to find gaps
    const sortedFixed = [...schedule].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    
    sortedTasks.forEach(task => {
      // Find the first gap after currentTimePointer that fits this task
      for (let i = 0; i <= sortedFixed.length; i++) {
        const gapStart = currentTimePointer
        const nextEvent = sortedFixed.find(e => e.startTime > gapStart)
        const gapEnd = nextEvent ? nextEvent.startTime : sleepDate
        const gapDurationMinutes = (gapEnd.getTime() - gapStart.getTime()) / 60000

        if (gapDurationMinutes >= task.duration_minutes) {
          // Add buffer if needed
          if (task.duration_minutes >= 45) {
            schedule.push({
              id: `buffer-${task.id}`,
              title: 'Focus Buffer',
              type: 'focus_buffer',
              startTime: new Date(gapStart),
              endTime: new Date(gapStart.getTime() + 15 * 60000),
              duration: 15
            })
            gapStart.setTime(gapStart.getTime() + 15 * 60000)
          }

          schedule.push({
            id: task.id,
            title: task.title,
            type: 'task',
            startTime: new Date(gapStart),
            endTime: new Date(gapStart.getTime() + task.duration_minutes * 60000),
            duration: task.duration_minutes
          })

          currentTimePointer = new Date(gapStart.getTime() + task.duration_minutes * 60000)
          break // Task placed
        } else if (nextEvent) {
          // Move pointer to end of this event to check next gap
          currentTimePointer = new Date(nextEvent.endTime)
        }
      }
    })

    return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }

  const schedule = generateAdaptiveSchedule()

  const totalRequiredMinutes = tasks.reduce((sum, t) => sum + t.duration_minutes, 0)
  const isSleepSafe = totalRequiredMinutes <= availableMinutesBeforeSleep

  // Format helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      {/* Add padding top to account for navbar */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Profile Card & XP Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-widest">10x Expansion Active</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, {profile?.name || 'Student'}! 🎓
            </h1>
            <p className="text-muted-foreground font-medium">Level {profile.level} Productive Student</p>
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-48">
                <Progress value={(profile.xp % 100)} className="h-1.5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                {100 - (profile.xp % 100)} XP to Next Level • Sync Verified ✅
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6 bg-white dark:bg-neutral-900 border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <div className="text-sm">
                <p className="font-bold leading-none">{profile.xp} XP</p>
                <p className="text-xs text-muted-foreground">Daily Points</p>
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
              <div className="text-sm">
                <p className="font-bold leading-none">3 Days</p>
                <p className="text-xs text-muted-foreground">Sleep Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* 10x Feature Grid (Header Stats + Pomodoro + Energy) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider text-xs">Sleep Anchor</CardDescription>
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100 flex items-center">
                  <Moon className="w-6 h-6 mr-2" />
                  {profile.sleep_time.slice(0, 5)} - {profile.wake_time.slice(0, 5)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-800/80 dark:text-purple-200/80 text-sm">
                  Protected rest period
                </p>
              </CardContent>
            </Card>

            <Card className={isSleepSafe ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}>
              <CardHeader className="pb-2">
                <CardDescription className={`font-semibold uppercase tracking-wider text-xs ${isSleepSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Schedule Status
                </CardDescription>
                <CardTitle className={`text-xl flex items-center ${isSleepSafe ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {isSleepSafe ? (
                    <><CheckCircle className="w-6 h-6 mr-2" /> Sleep Safe</>
                  ) : (
                    <><AlertTriangle className="w-6 h-6 mr-2" /> Sleep Risk</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-80">
                  {isSleepSafe ? 'Tasks fit perfectly.' : 'Too many tasks for today.'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold uppercase tracking-wider text-xs">Time Remaining Today</CardDescription>
                <CardTitle className="text-3xl font-light">
                  {Math.floor(availableMinutesBeforeSleep / 60)}h {availableMinutesBeforeSleep % 60}m
                </CardTitle>
              </CardHeader>
            </CardContent>
            
            <div className="md:col-span-2">
              <DailyRoadmap 
                tasks={tasks} 
                classes={dbBlocks.filter(b => b.type === 'class')} 
                energyLogs={energyLogs} 
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <PomodoroTimer />
            <EnergyLogger />
            <SleepTracker />
            <StudyBuddies />
            <DailyLeaderboard />
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Today's Schedule</h2>
            <div className="text-sm text-muted-foreground">
              Total Work: {Math.floor(totalRequiredMinutes / 60)}h {totalRequiredMinutes % 60}m
            </div>
          </div>

          {schedule.length === 1 && schedule[0].type === 'sleep' ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">Your day is empty.</p>
              <button 
                onClick={() => router.push('/tasks')} 
                className="text-primary font-medium hover:underline"
              >
                Go to Tasks to start planning
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3 space-y-8 pb-4">
              {/* Current Time Indicator */}
              {schedule.length > 0 && currentTime >= schedule[0].startTime && currentTime <= sleepDate && (
                <div 
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                  style={{
                    top: `${Math.max(0, (currentTime.getTime() - schedule[0].startTime.getTime()) / (sleepDate.getTime() - schedule[0].startTime.getTime()) * 100)}%`,
                    marginTop: '1.5rem'
                  }}
                >
                  <div className="w-full border-t-2 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                </div>
              )}

              {schedule.map((block, i) => {
                
                let icon, colorClass, borderClass
                
                if (block.type === 'task') {
                  icon = <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  colorClass = "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800/50"
                  borderClass = "ring-blue-100 dark:ring-blue-900 border-blue-200 dark:border-blue-800"
                } else if (block.type === 'focus_buffer') {
                  icon = <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  colorClass = "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800/50"
                  borderClass = "ring-yellow-100 dark:ring-yellow-900 border-yellow-200 dark:border-yellow-800"
                } else if (block.type === 'class') {
                  icon = <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  colorClass = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-800"
                  borderClass = "ring-indigo-100 dark:ring-indigo-900 border-indigo-200 dark:border-indigo-800"
                } else {
                  icon = <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  colorClass = "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800"
                  borderClass = "ring-purple-100 dark:ring-purple-900 border-purple-200 dark:border-purple-800"
                }

                // If schedule overruns sleep time, styling for sleep changes
                if (block.type === 'sleep' && !isSleepSafe) {
                  colorClass = "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800 border-dashed border-2"
                }

                return (
                  <div key={`${block.id}-${i}`} className="relative pl-8">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[17px] top-6 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border-2 flex items-center justify-center ring-4 z-10 ${borderClass}`}>
                      {icon}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="text-sm font-medium text-muted-foreground w-36 py-6 border-r border-transparent pr-4">
                        {formatTime(block.startTime)}
                        <br/>
                        <span className="text-xs text-neutral-400">
                          {block.duration} min
                        </span>
                      </div>
                      <div className={`flex-1 rounded-xl border p-5 sm:ml-6 my-2 shadow-sm transition-all hover:shadow-md ${colorClass}`}>
                        <h4 className="font-semibold text-lg">{block.title}</h4>
                        {block.type === 'focus_buffer' && (
                          <p className="text-sm opacity-80 mt-1">Put your phone away. Prepare your environment.</p>
                        )}
                        {block.type === 'sleep' && !isSleepSafe && (
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                            Warning: Tasks push past sleep anchor target of {formatTime(block.startTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
