import Link from 'next/link'
import { LogOut, Sun, Moon, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'

export function Navbar() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-lg font-bold text-primary flex items-center space-x-2">
              <Sun className="h-5 w-5" />
              <span>BetterTime</span>
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/tasks" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Tasks
              </Link>
              <Link href="/integrations" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Integrations
              </Link>
              <Link href="/study_groups" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Study Groups
              </Link>
              <Link href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-destructive flex items-center transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
