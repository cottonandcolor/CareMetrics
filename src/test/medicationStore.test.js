import { describe, it, expect, beforeEach } from 'vitest'
import { useMedicationStore } from '../stores/medicationStore'

const USER_ID = 'user-1'

function resetStore() {
  useMedicationStore.setState({ medications: [] })
}

function addMed(overrides = {}) {
  return useMedicationStore.getState().addMedication({
    userId: USER_ID,
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Once daily',
    type: 'Medication',
    active: true,
    ...overrides,
  })
}

describe('medicationStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('addMedication', () => {
    it('adds a medication with id, createdAt, and empty logs', () => {
      const med = addMed()
      expect(med.id).toBeDefined()
      expect(med.createdAt).toBeDefined()
      expect(med.logs).toEqual([])
      expect(med.name).toBe('Metformin')
      expect(useMedicationStore.getState().medications).toHaveLength(1)
    })

    it('persists to localStorage', () => {
      addMed()
      const stored = JSON.parse(localStorage.getItem('caremetrics_medications'))
      expect(stored).toHaveLength(1)
    })
  })

  describe('updateMedication', () => {
    it('updates fields by id', () => {
      const med = addMed()
      useMedicationStore.getState().updateMedication(med.id, { dosage: '1000mg', active: false })
      const updated = useMedicationStore.getState().medications[0]
      expect(updated.dosage).toBe('1000mg')
      expect(updated.active).toBe(false)
      expect(updated.name).toBe('Metformin')
    })
  })

  describe('deleteMedication', () => {
    it('removes a medication by id', () => {
      const med = addMed()
      useMedicationStore.getState().deleteMedication(med.id)
      expect(useMedicationStore.getState().medications).toHaveLength(0)
    })
  })

  describe('logDose / unlogDose', () => {
    it('logs a dose for a specific date', () => {
      const med = addMed()
      useMedicationStore.getState().logDose(med.id, '2026-02-28')
      const updated = useMedicationStore.getState().medications[0]
      expect(updated.logs).toContain('2026-02-28')
    })

    it('does not duplicate log for same date', () => {
      const med = addMed()
      useMedicationStore.getState().logDose(med.id, '2026-02-28')
      useMedicationStore.getState().logDose(med.id, '2026-02-28')
      const updated = useMedicationStore.getState().medications[0]
      expect(updated.logs.filter(d => d === '2026-02-28')).toHaveLength(1)
    })

    it('unlogs a dose for a specific date', () => {
      const med = addMed()
      useMedicationStore.getState().logDose(med.id, '2026-02-28')
      useMedicationStore.getState().unlogDose(med.id, '2026-02-28')
      const updated = useMedicationStore.getState().medications[0]
      expect(updated.logs).not.toContain('2026-02-28')
    })

    it('uses today when no date is provided', () => {
      const med = addMed()
      const today = new Date().toISOString().split('T')[0]
      useMedicationStore.getState().logDose(med.id)
      const updated = useMedicationStore.getState().medications[0]
      expect(updated.logs).toContain(today)
    })
  })

  describe('getMedicationsForUser', () => {
    it('filters by userId', () => {
      addMed({ userId: USER_ID })
      addMed({ userId: 'other-user', name: 'Aspirin' })
      const meds = useMedicationStore.getState().getMedicationsForUser(USER_ID)
      expect(meds).toHaveLength(1)
      expect(meds[0].name).toBe('Metformin')
    })
  })

  describe('getAdherenceRate', () => {
    it('returns 0 when no active medications', () => {
      expect(useMedicationStore.getState().getAdherenceRate(USER_ID)).toBe(0)
    })

    it('calculates adherence from logs', () => {
      const today = new Date()
      const logs = []
      for (let i = 0; i < 10; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        logs.push(d.toISOString().split('T')[0])
      }
      const createdAt = new Date(today)
      createdAt.setDate(createdAt.getDate() - 29)

      addMed({ logs, createdAt: createdAt.toISOString() })
      const rate = useMedicationStore.getState().getAdherenceRate(USER_ID, 30)
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThanOrEqual(100)
    })

    it('returns 100 for perfect adherence', () => {
      const today = new Date()
      const logs = []
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        logs.push(d.toISOString().split('T')[0])
      }
      const createdAt = new Date(today)
      createdAt.setDate(createdAt.getDate() - 29)

      addMed({ logs, createdAt: createdAt.toISOString() })
      const rate = useMedicationStore.getState().getAdherenceRate(USER_ID, 30)
      expect(rate).toBe(100)
    })
  })
})
