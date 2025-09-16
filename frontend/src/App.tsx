import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAppStore } from '@/stores/useAppStore'
import { Transactions } from '@/pages/Transactions'
import Settings from '@/pages/Settings'
import { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <Toaster position="top-right" />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App