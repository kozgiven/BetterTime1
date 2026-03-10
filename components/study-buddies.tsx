'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Users, Activity, Circle } from 'lucide-react'

export function StudyBuddies() {
  const buddies = [
    { name: 'Sarah J.', status: 'Focusing', task: 'CS201 Review', avatar: 'SJ' },
    { name: 'Alex M.', status: 'Break', task: '', avatar: 'AM' },
    { name: 'Chris K.', status: 'Focusing', task: 'Calculus III', avatar: 'CK' },
  ]

  return (
    <Card className="border-2 border-green-100 dark:border-green-900/30 overflow-hidden">
      <CardHeader className="pb-2 bg-green-50/50 dark:bg-green-900/5">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center text-green-700 dark:text-green-400">
          <Users className="w-4 h-4 mr-2" />
          Study Buddies
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {buddies.map((buddy) => (
          <div key={buddy.name} className="flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold border border-neutral-200">
                  {buddy.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${buddy.status === 'Focusing' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">{buddy.name}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                  {buddy.status === 'Focusing' ? `📖 ${buddy.task}` : '☕ Taking a break'}
                </span>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 dark:bg-neutral-800 p-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Nudge
            </button>
          </div>
        ))}
        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors border-t border-neutral-100 dark:border-neutral-800 mt-2">
          Invite Friends
        </button>
      </CardContent>
    </Card>
  )
}
