import { Navigate, Route, Routes } from 'react-router-dom'
import { EmailStepPage } from './pages/auth/EmailStepPage'
import { useAuth } from './contexts/AuthContext'
import { HomePage } from './pages/home/HomePage'
import { CalendarPage } from './pages/calendar/CalendarPage'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <EmailStepPage />}
      />
      <Route
        path="/home"
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/calendar"
        element={<Navigate to="/calendar/this-week/class/all" replace />}
      />
      <Route
        path="/calendar/:weekKey"
        element={<Navigate to="/calendar/this-week/class/all" replace />}
      />
      <Route
        path="/calendar/:weekKey/class/:classKey"
        element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
