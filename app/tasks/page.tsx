'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Clock, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Task = {
  id: string
  title: string
  duration_minutes: number
  parent_task_id?: string
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('60')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)
      fetchTasks(session.user.id)
    }
    init()
  }, [router])

  const fetchTasks = async (uid: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true })
      
    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !duration || !userId) return
    
    setAdding(true)
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: userId,
        title,
        duration_minutes: parseInt(duration, 10)
      }])
      .select()
      
    if (!error && data) {
      setTasks([...tasks, ...data])
      setTitle('')
      setDuration('60')
    }
    setAdding(false)
  }

  const handleBreakDown = async (task: Task) => {
    if (!userId) return
    setLoading(true)
    
    const subTaskDuration = Math.ceil(task.duration_minutes / 3)
    const subTasks = [
      { user_id: userId, title: `${task.title} (Part 1: Setup)`, duration_minutes: subTaskDuration, parent_task_id: task.id },
      { user_id: userId, title: `${task.title} (Part 2: Execution)`, duration_minutes: subTaskDuration, parent_task_id: task.id },
      { user_id: userId, title: `${task.title} (Part 3: Review)`, duration_minutes: subTaskDuration, parent_task_id: task.id }
    ]

    const { data, error } = await supabase
      .from('tasks')
      .insert(subTasks)
      .select()

    if (!error && data) {
      // For simplicity in this version, we delete the original task if it's broken down
      await supabase.from('tasks').delete().eq('id', task.id)
      setTasks([...tasks.filter(t => t.id !== task.id), ...data])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Award 20 XP for completing a task
      const { data: profile } = await supabase.from('profiles').select('xp').eq('id', session.user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ xp: (profile.xp || 0) + 20 }).eq('id', session.user.id)
      }
    }
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  if (loading && tasks.length === 0) return null

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add Task</CardTitle>
                <CardDescription>Plan what you need to do today.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Name</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Study for Exam" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (min)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      min="5"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={adding}>
                    <Plus className="h-4 w-4 mr-2" />
                    {adding ? 'Adding...' : 'Add Task'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                  <p>No tasks added for today.</p>
                  <p className="text-sm">Add some tasks on the left to start planning.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <div className="flex justify-between items-center p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{task.title}</h4>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.duration_minutes} minutes
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!task.parent_task_id && task.duration_minutes > 15 && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleBreakDown(task)}
                            className="text-xs h-8"
                          >
                            Break it down
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(task.id)} 
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
