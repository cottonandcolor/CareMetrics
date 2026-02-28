import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Activity, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(email, password)
    if (result.success) {
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
          <p className="text-white/70 text-lg">Your health, simplified.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>

          {error && (
            <div className="bg-danger-light text-danger px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-text-secondary">
            New here?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
