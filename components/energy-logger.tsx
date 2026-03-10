'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function EnergyLogger() {
  const [logged, setLogged] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogEnergy = async (level: number) => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { error } = await supabase.from('energy_logs').insert({
        user_id: session.user.id,
        energy_level: level
      })
      if (!error) {
        setLogged(true)
        setTimeout(() => setLogged(false), 3000)
      }
    }
    setLoading(false)
  }

  const levels = [
    { value: 1, icon: <BatteryLow className="w-5 h-5 text-red-500" />, label: 'Drained' },
    { value: 2, icon: <BatteryLow className="w-5 h-5 text-orange-500" />, label: 'Low' },
    { value: 3, icon: <BatteryMedium className="w-5 h-5 text-yellow-500" />, label: 'Steady' },
    { value: 4, icon: <BatteryFull className="w-5 h-5 text-green-500" />, label: 'High' },
    { value: 5, icon: <BatteryFull className="w-5 h-5 text-blue-500" />, label: 'Peak' },
  ]

  return (
    <Card className="border-2 border-orange-100 dark:border-orange-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
          <Battery className="w-4 h-4 mr-2 text-orange-500" />
          Energy Check-in
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logged ? (
          <div className="flex flex-col items-center justify-center py-4 text-green-600 animate-in fade-in zoom-in duration-300">
            <Check className="w-8 h-8 mb-2" />
            <p className="text-xs font-medium">Energy logged! We'll use this to optimize your gaps.</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {levels.map((level) => (
              <button
                key={level.value}
                onClick={() => handleLogEnergy(level.value)}
                disabled={loading}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {level.icon}
                <span className="text-[10px] font-medium text-muted-foreground">{level.label}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
