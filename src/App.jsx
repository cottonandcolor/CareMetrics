import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import LabScanner from './pages/LabScanner'
import Medications from './pages/Medications'
import Symptoms from './pages/Symptoms'
import Trends from './pages/Trends'
import Caregiver from './pages/Caregiver'
import Export from './pages/Export'

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<LabScanner />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/caregiver" element={<Caregiver />} />
        <Route path="/export" element={<Export />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
