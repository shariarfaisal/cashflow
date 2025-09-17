import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Settings, Receipt } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { Link, useLocation } from 'react-router-dom'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { theme, toggleTheme } = useAppStore()
  const location = useLocation()

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="border-b h-16">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold">CashFlow</h1>
              <nav className="flex gap-4">
                <Link to="/">
                  <Button
                    variant={location.pathname === '/' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Transactions
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant={location.pathname === '/settings' ? 'default' : 'ghost'}
                    size="sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </nav>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="h-[calc(100vh-64px)] overflow-y-auto">
        {children}
      </main>
    </div>
  )
}