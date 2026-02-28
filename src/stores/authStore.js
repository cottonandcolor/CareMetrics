import { create } from 'zustand'

const loadUser = () => {
  try {
    const data = localStorage.getItem('caremetrics_user')
    return data ? JSON.parse(data) : null
  } catch { return null }
}

const loadUsers = () => {
  try {
    const data = localStorage.getItem('caremetrics_users')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

export const useAuthStore = create((set, get) => ({
  user: loadUser(),
  users: loadUsers(),

  signup: (name, email, password, role = 'patient') => {
    const { users } = get()
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' }
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
      caregiverFor: [],
      caregivers: [],
    }
    const updated = [...users, newUser]
    localStorage.setItem('caremetrics_users', JSON.stringify(updated))
    const { password: _, ...safeUser } = newUser
    localStorage.setItem('caremetrics_user', JSON.stringify(safeUser))
    set({ users: updated, user: safeUser })
    return { success: true }
  },

  login: (email, password) => {
    const { users } = get()
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, error: 'Invalid email or password' }
    const { password: _, ...safeUser } = found
    localStorage.setItem('caremetrics_user', JSON.stringify(safeUser))
    set({ user: safeUser })
    return { success: true }
  },

  logout: () => {
    localStorage.removeItem('caremetrics_user')
    set({ user: null })
  },

  addCaregiver: (caregiverEmail) => {
    const { user, users } = get()
    const caregiver = users.find(u => u.email === caregiverEmail)
    if (!caregiver) return { success: false, error: 'User not found. They need to sign up first.' }
    if (caregiver.id === user.id) return { success: false, error: 'Cannot add yourself.' }

    const updatedUsers = users.map(u => {
      if (u.id === user.id) return { ...u, caregivers: [...new Set([...u.caregivers, caregiver.id])] }
      if (u.id === caregiver.id) return { ...u, caregiverFor: [...new Set([...u.caregiverFor, user.id])] }
      return u
    })
    localStorage.setItem('caremetrics_users', JSON.stringify(updatedUsers))

    const updatedUser = { ...user, caregivers: [...new Set([...user.caregivers, caregiver.id])] }
    localStorage.setItem('caremetrics_user', JSON.stringify(updatedUser))
    set({ users: updatedUsers, user: updatedUser })
    return { success: true, caregiverName: caregiver.name }
  },

  getCaregiverPatients: () => {
    const { user, users } = get()
    if (!user) return []
    return users.filter(u => u.caregiverFor?.includes(user.id)).map(({ password, ...u }) => u)
      .concat(users.filter(u => u.caregivers?.includes(user.id)).map(({ password, ...u }) => u))
  },

  getLinkedCaregivers: () => {
    const { user, users } = get()
    if (!user) return []
    return users.filter(u => user.caregivers?.includes(u.id)).map(({ password, ...rest }) => rest)
  },
}))
