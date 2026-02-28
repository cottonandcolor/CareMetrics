import { create } from 'zustand'

const STORAGE_KEY = 'caremetrics_labs'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

export const useLabStore = create((set, get) => ({
  reports: load(),

  addReport: (report) => {
    const newReport = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...report,
    }
    const updated = [newReport, ...get().reports]
    save(updated)
    set({ reports: updated })
    return newReport
  },

  deleteReport: (id) => {
    const updated = get().reports.filter(r => r.id !== id)
    save(updated)
    set({ reports: updated })
  },

  getReportsForUser: (userId) => {
    return get().reports.filter(r => r.userId === userId)
  },

  getLatestReport: (userId) => {
    return get().reports.find(r => r.userId === userId)
  },

  getMetricHistory: (userId, metricName) => {
    return get().reports
      .filter(r => r.userId === userId)
      .flatMap(r => (r.results || [])
        .filter(m => m.name === metricName)
        .map(m => ({ date: r.testDate || r.createdAt, value: m.value, unit: m.unit }))
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  },

  getAllMetricNames: (userId) => {
    const names = new Set()
    get().reports
      .filter(r => r.userId === userId)
      .forEach(r => (r.results || []).forEach(m => names.add(m.name)))
    return [...names]
  },
}))
