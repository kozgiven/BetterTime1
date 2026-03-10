'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Trophy, Medal, Star, User } from 'lucide-react'

export function DailyLeaderboard() {
  const players = [
    { name: 'Alex M.', xp: 2450, level: 12, rank: 1 },
    { name: 'Sarah J.', xp: 2100, level: 10, rank: 2 },
    { name: 'You', xp: 450, level: 3, rank: 3, isUser: true },
    { name: 'Chris K.', xp: 320, level: 2, rank: 4 },
  ]

  return (
    <Card className="border-2 border-blue-100 dark:border-blue-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
          Campus Leaderboard
        </CardTitle>
        <CardDescription className="text-xs">Top performers today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((p) => (
          <div 
            key={p.name} 
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${p.isUser ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.rank === 1 ? 'bg-yellow-100 text-yellow-600' : p.rank === 2 ? 'bg-neutral-200 text-neutral-600' : 'bg-neutral-100 text-neutral-500'}`}>
                {p.rank}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${p.isUser ? 'text-blue-700' : ''}`}>{p.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Level {p.level}</span>
              </div>
            </div>
            <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              {p.xp} XP
            </div>
          </div>
        ))}
        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
          View All Players
        </button>
      </CardContent>
    </Card>
  )
}
