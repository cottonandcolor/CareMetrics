import { create } from 'zustand'

const STORAGE_KEY = 'caremetrics_medications'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

export const useMedicationStore = create((set, get) => ({
  medications: load(),

  addMedication: (med) => {
    const newMed = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      logs: [],
      ...med,
    }
    const updated = [newMed, ...get().medications]
    save(updated)
    set({ medications: updated })
    return newMed
  },

  updateMedication: (id, updates) => {
    const updated = get().medications.map(m => m.id === id ? { ...m, ...updates } : m)
    save(updated)
    set({ medications: updated })
  },

  deleteMedication: (id) => {
    const updated = get().medications.filter(m => m.id !== id)
    save(updated)
    set({ medications: updated })
  },

  logDose: (medId, date) => {
    const dateStr = date || new Date().toISOString().split('T')[0]
    const updated = get().medications.map(m => {
      if (m.id !== medId) return m
      const logs = m.logs || []
      if (logs.includes(dateStr)) return m
      return { ...m, logs: [...logs, dateStr] }
    })
    save(updated)
    set({ medications: updated })
  },

  unlogDose: (medId, date) => {
    const dateStr = date || new Date().toISOString().split('T')[0]
    const updated = get().medications.map(m => {
      if (m.id !== medId) return m
      return { ...m, logs: (m.logs || []).filter(d => d !== dateStr) }
    })
    save(updated)
    set({ medications: updated })
  },

  getMedicationsForUser: (userId) => {
    return get().medications.filter(m => m.userId === userId)
  },

  getAdherenceRate: (userId, days = 30) => {
    const meds = get().medications.filter(m => m.userId === userId && m.active !== false)
    if (meds.length === 0) return 0
    const today = new Date()
    let total = 0, taken = 0
    for (const med of meds) {
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        if (new Date(med.createdAt).toISOString().split('T')[0] <= dateStr) {
          total++
          if ((med.logs || []).includes(dateStr)) taken++
        }
      }
    }
    return total > 0 ? Math.round((taken / total) * 100) : 0
  },
}))
