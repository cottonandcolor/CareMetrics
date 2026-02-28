import { describe, it, expect, beforeEach } from 'vitest'
import { useSymptomStore, SYMPTOM_PRESETS } from '../stores/symptomStore'

const USER_ID = 'user-1'

function resetStore() {
  useSymptomStore.setState({ entries: [] })
}

function addEntry(overrides = {}) {
  return useSymptomStore.getState().addEntry({
    userId: USER_ID,
    date: '2026-02-28',
    symptoms: ['Fatigue', 'Headache'],
    painLevel: 4,
    mood: 'okay',
    notes: '',
    ...overrides,
  })
}

describe('symptomStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('SYMPTOM_PRESETS', () => {
    it('contains common symptoms', () => {
      expect(SYMPTOM_PRESETS).toContain('Fatigue')
      expect(SYMPTOM_PRESETS).toContain('Headache')
      expect(SYMPTOM_PRESETS).toContain('Dizziness')
      expect(SYMPTOM_PRESETS.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('addEntry', () => {
    it('creates an entry with id and createdAt', () => {
      const entry = addEntry()
      expect(entry.id).toBeDefined()
      expect(entry.createdAt).toBeDefined()
      expect(entry.symptoms).toEqual(['Fatigue', 'Headache'])
      expect(useSymptomStore.getState().entries).toHaveLength(1)
    })

    it('persists to localStorage', () => {
      addEntry()
      const stored = JSON.parse(localStorage.getItem('caremetrics_symptoms'))
      expect(stored).toHaveLength(1)
    })

    it('prepends new entries (latest first)', () => {
      addEntry({ date: '2026-02-27' })
      addEntry({ date: '2026-02-28' })
      const entries = useSymptomStore.getState().entries
      expect(entries[0].date).toBe('2026-02-28')
    })
  })

  describe('deleteEntry', () => {
    it('removes an entry by id', () => {
      const entry = addEntry()
      useSymptomStore.getState().deleteEntry(entry.id)
      expect(useSymptomStore.getState().entries).toHaveLength(0)
    })
  })

  describe('getEntriesForUser', () => {
    it('filters by userId', () => {
      addEntry({ userId: USER_ID })
      addEntry({ userId: 'other-user' })
      const entries = useSymptomStore.getState().getEntriesForUser(USER_ID)
      expect(entries).toHaveLength(1)
    })
  })

  describe('getTodayEntry', () => {
    it('returns entry for today', () => {
      const today = new Date().toISOString().split('T')[0]
      addEntry({ date: today })
      const entry = useSymptomStore.getState().getTodayEntry(USER_ID)
      expect(entry).not.toBeNull()
      expect(entry.date).toBe(today)
    })

    it('returns undefined if no entry for today', () => {
      addEntry({ date: '2025-01-01' })
      expect(useSymptomStore.getState().getTodayEntry(USER_ID)).toBeUndefined()
    })
  })

  describe('getEntriesForDateRange', () => {
    it('returns entries within the date range', () => {
      addEntry({ date: '2026-01-15' })
      addEntry({ date: '2026-02-15' })
      addEntry({ date: '2026-03-15' })

      const results = useSymptomStore.getState().getEntriesForDateRange(
        USER_ID, '2026-01-01', '2026-02-28'
      )
      expect(results).toHaveLength(2)
    })
  })

  describe('getMostCommonSymptoms', () => {
    it('returns symptoms sorted by frequency', () => {
      addEntry({ date: '2026-02-01', symptoms: ['Fatigue', 'Headache'] })
      addEntry({ date: '2026-02-02', symptoms: ['Fatigue'] })
      addEntry({ date: '2026-02-03', symptoms: ['Fatigue', 'Dizziness'] })
      addEntry({ date: '2026-02-04', symptoms: ['Headache'] })

      const top = useSymptomStore.getState().getMostCommonSymptoms(USER_ID)
      expect(top[0].name).toBe('Fatigue')
      expect(top[0].count).toBe(3)
      expect(top[1].name).toBe('Headache')
      expect(top[1].count).toBe(2)
    })

    it('respects limit parameter', () => {
      addEntry({ symptoms: ['A', 'B', 'C', 'D', 'E', 'F'] })
      const top3 = useSymptomStore.getState().getMostCommonSymptoms(USER_ID, 3)
      expect(top3).toHaveLength(3)
    })

    it('returns empty array when no entries', () => {
      expect(useSymptomStore.getState().getMostCommonSymptoms(USER_ID)).toEqual([])
    })
  })
})
