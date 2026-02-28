import { create } from 'zustand'

const STORAGE_KEY = 'caremetrics_symptoms'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

export const SYMPTOM_PRESETS = [
  'Fatigue', 'Headache', 'Dizziness', 'Nausea', 'Joint Pain',
  'Muscle Ache', 'Shortness of Breath', 'Chest Pain', 'Back Pain',
  'Insomnia', 'Blurred Vision', 'Swelling', 'Loss of Appetite',
  'Frequent Urination', 'Cold Hands/Feet',
]

export const useSymptomStore = create((set, get) => ({
  entries: load(),

  addEntry: (entry) => {
    const newEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry,
    }
    const updated = [newEntry, ...get().entries]
    save(updated)
    set({ entries: updated })
    return newEntry
  },

  deleteEntry: (id) => {
    const updated = get().entries.filter(e => e.id !== id)
    save(updated)
    set({ entries: updated })
  },

  getEntriesForUser: (userId) => {
    return get().entries.filter(e => e.userId === userId)
  },

  getEntriesForDateRange: (userId, startDate, endDate) => {
    return get().entries.filter(e => {
      if (e.userId !== userId) return false
      const d = new Date(e.date || e.createdAt)
      return d >= new Date(startDate) && d <= new Date(endDate)
    })
  },

  getTodayEntry: (userId) => {
    const today = new Date().toISOString().split('T')[0]
    return get().entries.find(e => e.userId === userId && e.date === today)
  },

  getMostCommonSymptoms: (userId, limit = 5) => {
    const counts = {}
    get().entries
      .filter(e => e.userId === userId)
      .forEach(e => (e.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1 }))
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }))
  },
}))
