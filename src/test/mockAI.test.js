import { describe, it, expect } from 'vitest'
import {
  simulateOCRExtraction,
  analyzeResults,
  generateInsights,
  REFERENCE_RANGES,
} from '../utils/mockAI'

describe('mockAI', () => {
  describe('REFERENCE_RANGES', () => {
    it('contains expected metrics with min, max, unit, category', () => {
      const hemo = REFERENCE_RANGES['Hemoglobin']
      expect(hemo).toBeDefined()
      expect(hemo.min).toBe(12.0)
      expect(hemo.max).toBe(17.5)
      expect(hemo.unit).toBe('g/dL')
      expect(hemo.category).toBe('Blood Count')
    })

    it('covers all major categories', () => {
      const categories = new Set(Object.values(REFERENCE_RANGES).map(r => r.category))
      expect(categories.has('Blood Count')).toBe(true)
      expect(categories.has('Lipid Panel')).toBe(true)
      expect(categories.has('Metabolic')).toBe(true)
      expect(categories.has('Kidney')).toBe(true)
      expect(categories.has('Thyroid')).toBe(true)
      expect(categories.has('Vitamins')).toBe(true)
    })
  })

  describe('simulateOCRExtraction', () => {
    it('returns an array of lab results', () => {
      const results = simulateOCRExtraction('test.pdf')
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(5)
    })

    it('each result has name, value, and unit', () => {
      const results = simulateOCRExtraction('test.pdf')
      for (const r of results) {
        expect(r.name).toBeDefined()
        expect(typeof r.value).toBe('number')
        expect(r.unit).toBeDefined()
      }
    })
  })

  describe('analyzeResults', () => {
    it('adds status, category, referenceRange, and explanation', () => {
      const raw = [
        { name: 'Hemoglobin', value: 13.5, unit: 'g/dL' },
        { name: 'Fasting Glucose', value: 110, unit: 'mg/dL' },
      ]
      const analyzed = analyzeResults(raw)

      expect(analyzed).toHaveLength(2)
      for (const r of analyzed) {
        expect(r.status).toBeDefined()
        expect(r.category).toBeDefined()
        expect(r.referenceRange).toBeDefined()
        expect(r.explanation).toBeDefined()
        expect(typeof r.explanation).toBe('string')
        expect(r.explanation.length).toBeGreaterThan(10)
      }
    })

    it('marks normal values as normal', () => {
      const analyzed = analyzeResults([
        { name: 'Hemoglobin', value: 14.0, unit: 'g/dL' },
      ])
      expect(analyzed[0].status).toBe('normal')
    })

    it('marks high values as high', () => {
      const analyzed = analyzeResults([
        { name: 'Total Cholesterol', value: 250, unit: 'mg/dL' },
      ])
      expect(analyzed[0].status).toBe('high')
    })

    it('marks low values as low', () => {
      const analyzed = analyzeResults([
        { name: 'Hemoglobin', value: 10.0, unit: 'g/dL' },
      ])
      expect(analyzed[0].status).toBe('low')
    })

    it('handles unknown metrics gracefully', () => {
      const analyzed = analyzeResults([
        { name: 'SomethingUnknown', value: 42, unit: 'units' },
      ])
      expect(analyzed[0].status).toBe('normal')
      expect(analyzed[0].category).toBe('Other')
      expect(analyzed[0].referenceRange).toBe('N/A')
    })
  })

  describe('generateInsights', () => {
    it('returns positive message when no concerning data', () => {
      const report = {
        results: [
          { name: 'Hemoglobin', value: 14.0, status: 'normal' },
        ],
      }
      const insights = generateInsights([report], [])
      expect(insights.length).toBeGreaterThan(0)
      expect(insights.some(i => i.type === 'positive')).toBe(true)
    })

    it('detects significant changes between reports', () => {
      const older = {
        results: [
          { name: 'Fasting Glucose', value: 90, status: 'normal' },
        ],
      }
      const newer = {
        results: [
          { name: 'Fasting Glucose', value: 115, status: 'high' },
        ],
      }
      const insights = generateInsights([newer, older], [])
      expect(insights.some(i => i.metric === 'Fasting Glucose')).toBe(true)
      expect(insights.some(i => i.type === 'warning')).toBe(true)
    })

    it('flags abnormal results from the latest report when multiple reports exist', () => {
      const older = {
        results: [
          { name: 'TSH', value: 2.5, status: 'normal' },
        ],
      }
      const newer = {
        results: [
          { name: 'TSH', value: 5.5, status: 'high' },
        ],
      }
      const insights = generateInsights([newer, older], [])
      expect(insights.some(i => i.metric === 'TSH' && i.type === 'warning')).toBe(true)
    })

    it('detects frequent fatigue in symptoms', () => {
      const symptoms = Array.from({ length: 7 }, (_, i) => ({
        symptoms: ['Fatigue'],
        painLevel: 3,
      }))
      const insights = generateInsights([], symptoms)
      expect(insights.some(i => i.message.toLowerCase().includes('fatigue'))).toBe(true)
    })

    it('flags high average pain level', () => {
      const symptoms = Array.from({ length: 10 }, () => ({
        symptoms: [],
        painLevel: 7,
      }))
      const insights = generateInsights([], symptoms)
      expect(insights.some(i => i.metric === 'Pain Level')).toBe(true)
    })
  })
})
