'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, BookOpen, Clock, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type StudyGroup = {
  id: string
  name: string
  description: string
  created_by: string
}

export default function StudyGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)
      fetchGroups()
    }
    init()
  }, [router])

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setGroups(data)
    }
    setLoading(false)
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !userId) return
    
    setCreating(true)
    const { data, error } = await supabase
      .from('study_groups')
      .insert([{
        name,
        description,
        created_by: userId
      }])
      .select()
      
    if (!error && data) {
      setGroups([data[0], ...groups])
      setName('')
      setDescription('')
    }
    setCreating(false)
  }

  const handleJoinGroup = async (groupId: string) => {
    if (!userId) return
    const { error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId }])
    
    if (!error) {
      alert('Joined group! You are now part of this study collective.')
      // In a real app we might fetch members here
    } else if (error.code === '23505') {
      alert('You are already a member of this group!')
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground">Focus together, succeed together.</p>
          </div>
          <Button onClick={() => setCreating(!creating)}>
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Cancel' : 'New Group'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {creating && (
            <Card className="lg:col-span-1 h-fit animate-in slide-in-from-left duration-300">
              <CardHeader>
                <CardTitle>Create Group</CardTitle>
                <CardDescription>Start a new collective focus session.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Computer Science Cohort" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      placeholder="e.g., Daily deep work for CS majors" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={creating && !name}>
                    Create & Join
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className={creating ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.length === 0 ? (
                <div className="col-span-full text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground bg-white/50 dark:bg-neutral-900/50">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">No study groups yet.</p>
                  <p className="text-sm">Be the first to start a movement on your campus.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} className="group hover:border-blue-400 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10">
                      <div className="flex justify-between items-start">
                        <div className="bg-white dark:bg-neutral-800 p-2 rounded-xl shadow-sm">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3 mr-1" />
                          6 Active
                        </div>
                      </div>
                      <CardTitle className="mt-4">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{group.description || 'Focusing on deep work and shared accountability.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center -space-x-2 mb-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold">
                            U{i}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground italic">
                          +2
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleJoinGroup(group.id)}
                        variant="outline" 
                        className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      >
                        Join Group
                      </Button>
                    </CardContent>
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
