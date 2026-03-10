'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Sparkles, Target, Lightbulb, Coffee, Zap } from 'lucide-react'

type Task = {
  title: string
  duration_minutes: number
}

type ClassBlock = {
  title: string
  startTime: Date
}

interface DailyRoadmapProps {
  tasks: Task[]
  classes: ClassBlock[]
  energyLogs: number[]
}

export function DailyRoadmap({ tasks, classes, energyLogs }: DailyRoadmapProps) {
  // Logic-based "AI" Summary Generation
  const totalTaskTime = tasks.reduce((sum, t) => sum + t.duration_minutes, 0)
  const avgEnergy = energyLogs.length > 0 
    ? energyLogs.reduce((sum, e) => sum + e, 0) / energyLogs.length 
    : 3

  const getStrategy = () => {
    if (classes.length > 3) return "Heavy lecture day. Focus on quick wins between classes and prioritize high-impact study sessions in the evening."
    if (totalTaskTime > 300) return "Massive task load detected. Use your Pomodoro timer strictly and don't forget to take 5-minute movement breaks!"
    if (avgEnergy < 2.5) return "Energy levels are dipping. Consider pushing heavy research to tomorrow and focusing on administrative or lighter tasks today."
    return "Balanced day ahead. You have good gaps for deep work—try to knock out your hardest task before your first class!"
  }

  const getFocus = () => {
    if (tasks.length > 0) return tasks[0].title
    if (classes.length > 0) return `Prep for ${classes[0].title}`
    return "Plan your week"
  }

  return (
    <Card className="border-2 border-yellow-100 dark:border-yellow-900/30 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/5 dark:to-orange-900/5 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center text-orange-600 dark:text-orange-400">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Daily Roadmap
        </CardTitle>
        <CardDescription className="text-xs font-medium">Your personalized strategy for success.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 dark:bg-neutral-900/80 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start space-x-3">
            <div className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-lg">
              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400 tracking-tight">Today's Strategy</p>
              <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{getStrategy()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-tight mb-1">Primary Focus</p>
            <div className="flex items-center text-sm font-semibold truncate">
              <Target className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
              {getFocus()}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-tight mb-1">Energy Forecast</p>
            <div className="flex items-center text-sm font-semibold">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
              {avgEnergy > 3.5 ? 'Peak Day' : avgEnergy > 2.5 ? 'Steady' : 'Low Battery'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
