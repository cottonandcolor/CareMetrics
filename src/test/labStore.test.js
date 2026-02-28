import { describe, it, expect, beforeEach } from 'vitest'
import { useLabStore } from '../stores/labStore'

const USER_ID = 'user-1'

function resetStore() {
  useLabStore.setState({ reports: [] })
}

function addSampleReport(overrides = {}) {
  return useLabStore.getState().addReport({
    userId: USER_ID,
    fileName: 'test.pdf',
    testDate: '2026-01-15',
    labName: 'TestLab',
    results: [
      { name: 'Hemoglobin', value: 13.5, unit: 'g/dL', status: 'normal' },
      { name: 'Fasting Glucose', value: 110, unit: 'mg/dL', status: 'high' },
    ],
    ...overrides,
  })
}

describe('labStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('addReport', () => {
    it('adds a report and assigns id + createdAt', () => {
      const report = addSampleReport()
      expect(report.id).toBeDefined()
      expect(report.createdAt).toBeDefined()
      expect(report.userId).toBe(USER_ID)
      expect(useLabStore.getState().reports).toHaveLength(1)
    })

    it('prepends new reports (latest first)', () => {
      addSampleReport({ testDate: '2026-01-01' })
      addSampleReport({ testDate: '2026-02-01' })
      const reports = useLabStore.getState().reports
      expect(reports[0].testDate).toBe('2026-02-01')
    })

    it('persists to localStorage', () => {
      addSampleReport()
      const stored = JSON.parse(localStorage.getItem('caremetrics_labs'))
      expect(stored).toHaveLength(1)
      expect(stored[0].labName).toBe('TestLab')
    })
  })

  describe('deleteReport', () => {
    it('removes a report by id', () => {
      const report = addSampleReport()
      expect(useLabStore.getState().reports).toHaveLength(1)

      useLabStore.getState().deleteReport(report.id)
      expect(useLabStore.getState().reports).toHaveLength(0)
    })

    it('does nothing for unknown id', () => {
      addSampleReport()
      useLabStore.getState().deleteReport('nonexistent')
      expect(useLabStore.getState().reports).toHaveLength(1)
    })
  })

  describe('getReportsForUser', () => {
    it('filters by userId', () => {
      addSampleReport({ userId: USER_ID })
      addSampleReport({ userId: 'other-user' })
      const reports = useLabStore.getState().getReportsForUser(USER_ID)
      expect(reports).toHaveLength(1)
      expect(reports[0].userId).toBe(USER_ID)
    })
  })

  describe('getLatestReport', () => {
    it('returns the first report for a user', () => {
      addSampleReport({ testDate: '2026-01-01' })
      addSampleReport({ testDate: '2026-02-01' })
      const latest = useLabStore.getState().getLatestReport(USER_ID)
      expect(latest.testDate).toBe('2026-02-01')
    })

    it('returns undefined when no reports', () => {
      expect(useLabStore.getState().getLatestReport(USER_ID)).toBeUndefined()
    })
  })

  describe('getMetricHistory', () => {
    it('returns chronological history for a metric', () => {
      addSampleReport({
        testDate: '2026-01-01',
        results: [{ name: 'Hemoglobin', value: 12.0, unit: 'g/dL' }],
      })
      addSampleReport({
        testDate: '2026-02-01',
        results: [{ name: 'Hemoglobin', value: 13.5, unit: 'g/dL' }],
      })
      const history = useLabStore.getState().getMetricHistory(USER_ID, 'Hemoglobin')
      expect(history).toHaveLength(2)
      expect(history[0].value).toBe(12.0)
      expect(history[1].value).toBe(13.5)
    })

    it('returns empty array for unknown metric', () => {
      addSampleReport()
      expect(useLabStore.getState().getMetricHistory(USER_ID, 'Nonexistent')).toEqual([])
    })
  })

  describe('getAllMetricNames', () => {
    it('returns unique metric names across reports', () => {
      addSampleReport({
        results: [
          { name: 'Hemoglobin', value: 13, unit: 'g/dL' },
          { name: 'Glucose', value: 90, unit: 'mg/dL' },
        ],
      })
      addSampleReport({
        results: [
          { name: 'Hemoglobin', value: 14, unit: 'g/dL' },
          { name: 'TSH', value: 2.5, unit: 'mIU/L' },
        ],
      })
      const names = useLabStore.getState().getAllMetricNames(USER_ID)
      expect(names).toContain('Hemoglobin')
      expect(names).toContain('Glucose')
      expect(names).toContain('TSH')
      expect(names).toHaveLength(3)
    })
  })
})
