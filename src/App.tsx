import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { LabSupplyFinder } from './components/LabSupplyFinder'
import { Register } from './components/Auth/Register'
import { Login } from './components/Auth/Login'
import { ForgotPassword } from './components/Auth/ForgotPassword'
import './App.css'

type AuthScreen = 'login' | 'register' | 'forgot-password'

function App() {
  const { isAuthenticated } = useAuth()
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return <Register onSwitchToLogin={() => setAuthScreen('login')} />
    }
    if (authScreen === 'forgot-password') {
      return <ForgotPassword onSwitchToLogin={() => setAuthScreen('login')} />
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthScreen('register')}
        onSwitchToForgotPassword={() => setAuthScreen('forgot-password')}
      />
    )
  }

  return <LabSupplyFinder />
}

export default App
