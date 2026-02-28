import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockDoc

vi.mock('jspdf', () => {
  function MockJsPDF() {
    mockDoc = {
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getNumberOfPages: () => 1,
      },
      setFontSize: vi.fn(),
      setTextColor: vi.fn(),
      setDrawColor: vi.fn(),
      text: vi.fn(),
      line: vi.fn(),
      addPage: vi.fn(),
      setPage: vi.fn(),
      splitTextToSize: vi.fn((text) => [text]),
      save: vi.fn(),
      autoTable: vi.fn(),
      lastAutoTable: { finalY: 100 },
    }
    return mockDoc
  }
  return { default: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({ default: vi.fn() }))

import { exportHealthSummary } from '../utils/pdfExport'

describe('pdfExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDoc = null
  })

  const baseArgs = {
    user: { name: 'Alice', email: 'alice@test.com' },
    reports: [{
      testDate: '2026-01-15',
      labName: 'TestLab',
      results: [
        { name: 'Hemoglobin', value: 13.5, unit: 'g/dL', referenceRange: '12.0–17.5', status: 'normal' },
        { name: 'Glucose', value: 110, unit: 'mg/dL', referenceRange: '70–100', status: 'high' },
      ],
    }],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Once daily', type: 'Medication' },
    ],
    symptoms: [{
      date: '2026-01-20',
      symptoms: ['Fatigue'],
      painLevel: 3,
      notes: 'Tired today',
      createdAt: '2026-01-20T10:00:00Z',
    }],
    insights: [
      { type: 'warning', message: 'Glucose is high', suggestion: 'Talk to your doctor' },
    ],
  }

  it('creates a PDF and calls save', () => {
    exportHealthSummary(baseArgs)
    expect(mockDoc.save).toHaveBeenCalledTimes(1)
    expect(mockDoc.save.mock.calls[0][0]).toContain('CareMetrics_Report_')
  })

  it('includes user name in the document', () => {
    exportHealthSummary(baseArgs)
    const textCalls = mockDoc.text.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Alice'))).toBe(true)
  })

  it('generates lab results table via autoTable', () => {
    exportHealthSummary(baseArgs)
    expect(mockDoc.autoTable).toHaveBeenCalled()
  })

  describe('date range filtering', () => {
    it('includes date range label in PDF when provided', () => {
      exportHealthSummary({
        ...baseArgs,
        dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
      })
      const textCalls = mockDoc.text.mock.calls.map(c => c[0])
      expect(textCalls.some(t => typeof t === 'string' && t.includes('January'))).toBe(true)
    })

    it('shows "All Time" when no date range provided', () => {
      exportHealthSummary(baseArgs)
      const textCalls = mockDoc.text.mock.calls.map(c => c[0])
      expect(textCalls.some(t => typeof t === 'string' && t.includes('All Time'))).toBe(true)
    })

    it('filters reports by date range', () => {
      const args = {
        ...baseArgs,
        reports: [
          { testDate: '2026-01-15', labName: 'A', results: [{ name: 'X', value: 1, unit: 'u', status: 'normal' }] },
          { testDate: '2026-03-15', labName: 'B', results: [{ name: 'Y', value: 2, unit: 'u', status: 'normal' }] },
        ],
        dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
      }
      exportHealthSummary(args)
      const labHeaderCalls = mockDoc.text.mock.calls
        .filter(c => typeof c[0] === 'string' && c[0].includes('Lab Results'))
      expect(labHeaderCalls).toHaveLength(1)
    })

    it('filters symptoms by date range', () => {
      const args = {
        ...baseArgs,
        symptoms: [
          { date: '2026-01-10', symptoms: ['Fatigue'], painLevel: 3, createdAt: '2026-01-10T10:00:00Z' },
          { date: '2026-03-10', symptoms: ['Headache'], painLevel: 5, createdAt: '2026-03-10T10:00:00Z' },
        ],
        dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
      }
      exportHealthSummary(args)
      const symptomHeaderCalls = mockDoc.text.mock.calls
        .filter(c => typeof c[0] === 'string' && c[0].includes('Symptom Log'))
      expect(symptomHeaderCalls.some(c => c[0].includes('1 entries'))).toBe(true)
    })

    it('names file with date range slug', () => {
      exportHealthSummary({
        ...baseArgs,
        dateRange: { startDate: '2026-01-01', endDate: '2026-01-31' },
      })
      expect(mockDoc.save.mock.calls[0][0]).toContain('2026-01-01_to_2026-01-31')
    })
  })
})
