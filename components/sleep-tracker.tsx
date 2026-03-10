'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Moon, Sun, Check, Zap, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function SleepTracker() {
  const [loading, setLoading] = useState(false)
  const [lastEvent, setLastEvent] = useState<{ type: string; time: string } | null>(null)
  const [consistencyScore, setConsistencyScore] = useState(85) // Mock score for now

  useEffect(() => {
    fetchLastSleepLog()
  }, [])

  const fetchLastSleepLog = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('actual_time', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        setLastEvent({
          type: data.event_type,
          time: new Date(data.actual_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
    }
  }

  const logEvent = async (type: 'sleep' | 'wake') => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { error } = await supabase.from('sleep_logs').insert({
        user_id: session.user.id,
        event_type: type,
        actual_time: new Date().toISOString()
      })
      if (!error) {
        fetchLastSleepLog()
        // Award XP for logging health data
        const { data: profile } = await supabase.from('profiles').select('xp').eq('id', session.user.id).single()
        if (profile) {
          await supabase.from('profiles').update({ xp: (profile.xp || 0) + 15 }).eq('id', session.user.id)
        }
      }
    }
    setLoading(false)
  }

  return (
    <Card className="border-2 border-purple-100 dark:border-purple-900/30 overflow-hidden">
      <CardHeader className="pb-2 bg-purple-50/50 dark:bg-purple-900/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-500" />
            Sleep Consistency
          </CardTitle>
          <div className="flex items-center space-x-1 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
            <span>{consistencyScore}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50"
            onClick={() => logEvent('sleep')}
            disabled={loading || lastEvent?.type === 'sleep'}
          >
            <Moon className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-bold">I'M SLEEPING</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-16 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50"
            onClick={() => logEvent('wake')}
            disabled={loading || lastEvent?.type === 'wake'}
          >
            <Sun className="w-4 h-4 text-orange-600" />
            <span className="text-[10px] font-bold">I'M AWAKE</span>
          </Button>
        </div>

        {lastEvent && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-neutral-50 p-2 rounded-lg">
            <span className="flex items-center italic">
              <Info className="w-3 h-3 mr-1" />
              Last {lastEvent.type} logged at {lastEvent.time}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-400 tracking-widest">
            <span>Consistency Trend</span>
            <span className="text-green-500">+2% vs last week</span>
          </div>
          <div className="flex space-x-1 h-8 items-end">
            {[65, 70, 85, 90, 80, 85, 95].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm transition-all hover:bg-purple-400 hover:h-full"
                style={{ height: `${val}%` }}
              ></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
