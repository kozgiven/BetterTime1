'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3, TrendingUp, Moon, Zap, Trophy, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) return null

  const productivityData = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 70 },
    { day: 'Sat', value: 45 },
    { day: 'Sun', value: 50 },
  ]

  const sleepConsistency = [
    { day: 'M', value: 95, color: 'bg-purple-500' },
    { day: 'T', value: 90, color: 'bg-purple-500' },
    { day: 'W', value: 85, color: 'bg-purple-500' },
    { day: 'T', value: 60, color: 'bg-red-500' },
    { day: 'F', value: 80, color: 'bg-purple-500' },
    { day: 'S', value: 75, color: 'bg-purple-500' },
    { day: 'S', value: 90, color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground">Insights into your university journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Total XP Earned</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-blue-600" />
                {profile?.xp || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-600 font-bold uppercase tracking-wider text-[10px]">Avg Sleep Consistency</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <Moon className="w-6 h-6 mr-2 text-purple-600" />
                84%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-orange-600 font-bold uppercase tracking-wider text-[10px]">Productivity Peak</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <Zap className="w-6 h-6 mr-2 text-orange-600" />
                Wednesdays
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Productivity Trends
              </CardTitle>
              <CardDescription>Daily task completion rate over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 space-x-2 pt-4">
                {productivityData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${d.value}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Sleep Consistency
              </CardTitle>
              <CardDescription>How close you stick to your Sleep Anchor.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 space-x-2 pt-4">
                {sleepConsistency.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full ${d.color} rounded-t-lg transition-all opacity-80 hover:opacity-100`}
                      style={{ height: `${d.value}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Energy Peaks vs. Sessions
              </CardTitle>
              <CardDescription>Correlation between your logged energy and focused Pomodoro sessions.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium">Focus Sessions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs font-medium">Energy Level</span>
                    </div>
                  </div>
                  <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-xl relative overflow-hidden border">
                    <div className="absolute inset-0 flex items-center p-4">
                      {/* Mocked Waveform/Chart */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <path d="M0,50 Q50,20 100,50 T200,50 T300,80 T400,50" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500" />
                        <path d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,20" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 opacity-50" />
                      </svg>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
