import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import App from '../App'


function resetStores() {
  useAuthStore.setState({ user: null, users: [] })
}

describe('App routing', () => {
  beforeEach(resetStores)

  it('redirects unauthenticated users to login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('redirects unauthenticated users from /medications to login', () => {
    render(
      <MemoryRouter initialEntries={['/medications']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('shows dashboard for authenticated users', () => {
    useAuthStore.setState({
      user: {
        id: 'u1', name: 'Alice', email: 'alice@test.com',
        role: 'patient', caregivers: [], caregiverFor: [],
      },
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getAllByText(/Alice/).length).toBeGreaterThan(0)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('redirects authenticated users away from login to dashboard', () => {
    useAuthStore.setState({
      user: {
        id: 'u1', name: 'Alice', email: 'alice@test.com',
        role: 'patient', caregivers: [], caregiverFor: [],
      },
    })
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('redirects unknown routes to home', () => {
    useAuthStore.setState({
      user: {
        id: 'u1', name: 'Alice', email: 'alice@test.com',
        role: 'patient', caregivers: [], caregiverFor: [],
      },
    })
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
