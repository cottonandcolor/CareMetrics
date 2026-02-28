import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { useMedicationStore } from '../stores/medicationStore'
import { useSymptomStore } from '../stores/symptomStore'

import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Dashboard from '../pages/Dashboard'
import Medications from '../pages/Medications'
import Symptoms from '../pages/Symptoms'
import Export from '../pages/Export'

function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

function resetAllStores() {
  useAuthStore.setState({ user: null, users: [] })
  useLabStore.setState({ reports: [] })
  useMedicationStore.setState({ medications: [] })
  useSymptomStore.setState({ entries: [] })
}

function loginTestUser() {
  const user = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@test.com',
    role: 'patient',
    caregivers: [],
    caregiverFor: [],
  }
  useAuthStore.setState({ user })
  return user
}


describe('Login page', () => {
  beforeEach(resetAllStores)

  it('renders login form with email and password fields', () => {
    renderWithRouter(<Login />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows link to signup', () => {
    renderWithRouter(<Login />)
    expect(screen.getByText('Create an account')).toBeInTheDocument()
  })

  it('shows error for invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Login />)

    await user.type(screen.getByPlaceholderText('you@email.com'), 'wrong@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/invalid/i)).toBeInTheDocument()
  })
})

describe('Signup page', () => {
  beforeEach(resetAllStores)

  it('renders signup form', () => {
    renderWithRouter(<Signup />)
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows patient and caregiver role buttons', () => {
    renderWithRouter(<Signup />)
    expect(screen.getByText('Patient')).toBeInTheDocument()
    expect(screen.getByText('Caregiver')).toBeInTheDocument()
  })

  it('has sample data checkbox for patients', () => {
    renderWithRouter(<Signup />)
    expect(screen.getByText(/sample health data/i)).toBeInTheDocument()
  })
})

describe('Dashboard page', () => {
  beforeEach(() => {
    resetAllStores()
    loginTestUser()
  })

  it('renders greeting with user name', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText(/Test/)).toBeInTheDocument()
  })

  it('shows stat cards for lab reports, medications, check-in, flagged', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Lab Reports')).toBeInTheDocument()
    expect(screen.getByText('Medications')).toBeInTheDocument()
    expect(screen.getByText("Today's Check-in")).toBeInTheDocument()
    expect(screen.getByText('Flagged Results')).toBeInTheDocument()
  })

  it('shows AI Health Insights section', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('AI Health Insights')).toBeInTheDocument()
  })

  it('shows daily check-in prompt when no symptom today', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Daily Check-in')).toBeInTheDocument()
  })

  it('shows Blood Sugar Trend section', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Blood Sugar Trend')).toBeInTheDocument()
  })
})

describe('Medications page', () => {
  beforeEach(() => {
    resetAllStores()
    loginTestUser()
  })

  it('renders medications page with stats', () => {
    renderWithRouter(<Medications />)
    expect(screen.getByText('Medications & Vitamins')).toBeInTheDocument()
    expect(screen.getByText('Active Medications')).toBeInTheDocument()
    expect(screen.getByText('30-Day Adherence')).toBeInTheDocument()
    expect(screen.getByText('Remaining Today')).toBeInTheDocument()
  })

  it('shows empty state when no medications', () => {
    renderWithRouter(<Medications />)
    expect(screen.getByText('No medications yet')).toBeInTheDocument()
  })

  it('opens add form when clicking Add New', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Medications />)
    await user.click(screen.getByText('Add New'))
    expect(screen.getByPlaceholderText('e.g. Metformin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. 500mg')).toBeInTheDocument()
  })

  it('adds a medication via the form', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Medications />)

    await user.click(screen.getByText('Add New'))
    await user.type(screen.getByPlaceholderText('e.g. Metformin'), 'Aspirin')
    await user.type(screen.getByPlaceholderText('e.g. 500mg'), '100mg')
    await user.click(screen.getByRole('button', { name: /add medication/i }))

    expect(screen.getByText('Aspirin')).toBeInTheDocument()
    expect(screen.getByText('100mg · Once daily')).toBeInTheDocument()
  })
})

describe('Symptoms page', () => {
  beforeEach(() => {
    resetAllStores()
    loginTestUser()
  })

  it('renders symptoms page', () => {
    renderWithRouter(<Symptoms />)
    expect(screen.getByText('Symptom Tracking')).toBeInTheDocument()
  })

  it('shows check-in form when no entry for today', () => {
    renderWithRouter(<Symptoms />)
    expect(screen.getByText('How are you feeling today?')).toBeInTheDocument()
  })

  it('shows symptom presets as buttons', () => {
    renderWithRouter(<Symptoms />)
    expect(screen.getByText('Fatigue')).toBeInTheDocument()
    expect(screen.getByText('Headache')).toBeInTheDocument()
    expect(screen.getByText('Dizziness')).toBeInTheDocument()
  })

  it('shows mood selector', () => {
    renderWithRouter(<Symptoms />)
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Okay')).toBeInTheDocument()
    expect(screen.getByText('Poor')).toBeInTheDocument()
  })

  it('saves a check-in', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Symptoms />)

    await user.click(screen.getByText('Fatigue'))
    await user.click(screen.getByText('Save Check-in'))

    expect(screen.getByText("Today's Check-in Complete")).toBeInTheDocument()
  })
})

describe('Export page', () => {
  beforeEach(() => {
    resetAllStores()
    loginTestUser()
  })

  it('renders export page with time frame controls', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText('Health Summary & Export')).toBeInTheDocument()
    expect(screen.getByText('Report Time Frame')).toBeInTheDocument()
  })

  it('shows preset buttons', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('Last 90 days')).toBeInTheDocument()
    expect(screen.getByText('Last 6 months')).toBeInTheDocument()
    expect(screen.getByText('Last year')).toBeInTheDocument()
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('shows date inputs for custom range', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('shows AI Health Insights section', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText('AI Health Insights')).toBeInTheDocument()
  })

  it('shows export button', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText('Export PDF Report')).toBeInTheDocument()
  })

  it('shows disclaimer', () => {
    renderWithRouter(<Export />)
    expect(screen.getByText(/informational purposes only/i)).toBeInTheDocument()
  })

  it('changes active preset on click', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Export />)

    await user.click(screen.getByText('Last 30 days'))
    const summaryText = screen.getByText(/Showing/)
    expect(summaryText).toBeInTheDocument()
  })
})
