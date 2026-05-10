import { EmailStepPage } from './pages/auth/EmailStepPage'
import { useAuth } from './contexts/AuthContext'
import { HomePage } from './pages/home/HomePage'

function App() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <HomePage /> : <EmailStepPage />
}

export default App
