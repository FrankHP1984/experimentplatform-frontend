import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import AppRouter from './router/index.jsx'

function App() {
  const { isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        color: 'var(--text)'
      }}>
        Cargando...
      </div>
    )
  }

  return <AppRouter />
}

export default App
