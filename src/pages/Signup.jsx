import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { seedSampleData } from '../data/sampleData'
import { Activity, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loadSample, setLoadSample] = useState(true)
  const { signup } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    const result = signup(name, email, password, role)
    if (result.success) {
      if (loadSample && role === 'patient') {
        const user = JSON.parse(localStorage.getItem('caremetrics_user'))
        seedSampleData(user.id)
      }
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-accent-light" />
            <h1 className="text-3xl font-bold text-white">CareMetrics</h1>
          </div>
          <p className="text-white/70 text-lg">Start tracking your health journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-text-primary">Create Account</h2>

          {error && (
            <div className="bg-danger-light text-danger px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-lg focus:border-primary focus:outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-border rounded-xl text-lg focus:border-primary focus:outline-none transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-border rounded-xl text-lg focus:border-primary focus:outline-none transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-primary"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold border-2 transition-colors
                  ${role === 'patient' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary hover:border-primary/30'}`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`flex-1 py-3 rounded-xl text-base font-semibold border-2 transition-colors
                  ${role === 'caregiver' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-secondary hover:border-primary/30'}`}
              >
                Caregiver
              </button>
            </div>
          </div>

          {role === 'patient' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={loadSample}
                onChange={e => setLoadSample(e.target.checked)}
                className="w-5 h-5 rounded accent-primary"
              />
              <span className="text-sm text-text-secondary">Load sample health data (recommended for demo)</span>
            </label>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            Create Account
          </button>

          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
