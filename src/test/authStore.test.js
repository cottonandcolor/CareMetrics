import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../stores/authStore'

function resetStore() {
  useAuthStore.setState({ user: null, users: [] })
}

describe('authStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('signup', () => {
    it('creates a new user and logs them in', () => {
      const result = useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123', 'patient')
      expect(result.success).toBe(true)

      const { user, users } = useAuthStore.getState()
      expect(user).not.toBeNull()
      expect(user.name).toBe('Alice')
      expect(user.email).toBe('alice@test.com')
      expect(user.role).toBe('patient')
      expect(user.password).toBeUndefined()
      expect(users).toHaveLength(1)
    })

    it('rejects duplicate email', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const result = useAuthStore.getState().signup('Bob', 'alice@test.com', 'pass456')
      expect(result.success).toBe(false)
      expect(result.error).toContain('already registered')
    })

    it('defaults role to patient', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const { users } = useAuthStore.getState()
      expect(users[0].role).toBe('patient')
    })

    it('persists user to localStorage', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const stored = JSON.parse(localStorage.getItem('caremetrics_user'))
      expect(stored.name).toBe('Alice')
      expect(stored.email).toBe('alice@test.com')
    })

    it('stores user with id, createdAt, and empty caregiver arrays', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const { users } = useAuthStore.getState()
      expect(users[0].id).toBeDefined()
      expect(users[0].createdAt).toBeDefined()
      expect(users[0].caregivers).toEqual([])
      expect(users[0].caregiverFor).toEqual([])
    })
  })

  describe('login', () => {
    beforeEach(() => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      useAuthStore.getState().logout()
    })

    it('logs in with correct credentials', () => {
      const result = useAuthStore.getState().login('alice@test.com', 'pass123')
      expect(result.success).toBe(true)
      expect(useAuthStore.getState().user.name).toBe('Alice')
    })

    it('rejects wrong password', () => {
      const result = useAuthStore.getState().login('alice@test.com', 'wrong')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('rejects unknown email', () => {
      const result = useAuthStore.getState().login('nobody@test.com', 'pass123')
      expect(result.success).toBe(false)
    })

    it('does not expose password in user state', () => {
      useAuthStore.getState().login('alice@test.com', 'pass123')
      expect(useAuthStore.getState().user.password).toBeUndefined()
    })
  })

  describe('logout', () => {
    it('clears user state and localStorage', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      expect(useAuthStore.getState().user).not.toBeNull()

      useAuthStore.getState().logout()
      expect(useAuthStore.getState().user).toBeNull()
      expect(localStorage.getItem('caremetrics_user')).toBeNull()
    })
  })

  describe('addCaregiver', () => {
    it('links a caregiver to the current user', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const aliceId = useAuthStore.getState().user.id
      useAuthStore.getState().signup('Bob', 'bob@test.com', 'pass456', 'caregiver')

      useAuthStore.getState().login('alice@test.com', 'pass123')
      const result = useAuthStore.getState().addCaregiver('bob@test.com')
      expect(result.success).toBe(true)
      expect(result.caregiverName).toBe('Bob')

      const { user } = useAuthStore.getState()
      const bobUser = useAuthStore.getState().users.find(u => u.email === 'bob@test.com')
      expect(user.caregivers).toContain(bobUser.id)
      expect(bobUser.caregiverFor).toContain(aliceId)
    })

    it('rejects adding a non-existent user', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const result = useAuthStore.getState().addCaregiver('nobody@test.com')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('rejects adding yourself', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      const result = useAuthStore.getState().addCaregiver('alice@test.com')
      expect(result.success).toBe(false)
      expect(result.error).toContain('yourself')
    })
  })

  describe('getCaregiverPatients', () => {
    it('returns linked patients for a caregiver', () => {
      useAuthStore.getState().signup('Alice', 'alice@test.com', 'pass123')
      useAuthStore.getState().signup('Bob', 'bob@test.com', 'pass456', 'caregiver')

      useAuthStore.getState().login('alice@test.com', 'pass123')
      useAuthStore.getState().addCaregiver('bob@test.com')

      useAuthStore.getState().login('bob@test.com', 'pass456')
      const patients = useAuthStore.getState().getCaregiverPatients()
      expect(patients.some(p => p.name === 'Alice')).toBe(true)
    })
  })
})
