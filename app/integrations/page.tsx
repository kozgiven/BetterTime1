'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Upload, Check, AlertCircle } from 'lucide-react'
import { parseICS } from '@/lib/ics-parser'

export default function IntegrationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        const events = parseICS(text)

        if (events.length === 0) {
          setError('No valid events found in the file.')
          setLoading(false)
          return
        }

        // Filter events (e.g. only for today)
        const today = new Date()
        const todayEvents = events.filter(e => 
          e.start.getFullYear() === today.getFullYear() &&
          e.start.getMonth() === today.getMonth() &&
          e.start.getDate() === today.getDate()
        )

        if (todayEvents.length === 0) {
          setError('No events found for today. Make sure your calendar has classes today!')
          setLoading(false)
          return
        }

        // Insert into schedule_blocks
        const blocks = todayEvents.map(e => ({
          user_id: session.user.id,
          block_type: 'class',
          title: e.title,
          start_time: e.start.toISOString(),
          end_time: e.end.toISOString()
        }))

        const { error: insertError } = await supabase
          .from('schedule_blocks')
          .insert(blocks)

        if (insertError) throw insertError

        setSuccess(true)
        setLoading(false)
      }
      reader.readAsText(file)
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading. Ensure your file is a valid .ics from your university.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">Connect your academic tools to automate your schedule.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Academic Calendar (.ics)</CardTitle>
              <CardDescription>
                Upload your timetable from Canvas, Blackboard, or Outlook to automatically block out class times.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".ics"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-12" disabled={loading}>
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Timetable</span>
                    </>
                  )}
                </Button>
              </div>

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-sm">
                  <Check className="w-4 h-4" />
                  <span>Timetable synced successfully! Go to Dashboard to see your classes.</span>
                </div>
              )}

              {error && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="opacity-50 grayscale cursor-not-allowed">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-neutral-200 flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-neutral-400 rounded-sm"></div>
              </div>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>
                Direct one-click sync with Google Calendar API. (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="secondary" className="w-full">Connect</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
