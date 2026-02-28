import { useMemo, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { useMedicationStore } from '../stores/medicationStore'
import { useSymptomStore } from '../stores/symptomStore'
import { generateInsights } from '../utils/mockAI'
import { exportHealthSummary } from '../utils/pdfExport'
import { format, subDays, subMonths, subYears } from 'date-fns'
import {
  FileDown, FileText, Pill, HeartPulse, TrendingUp,
  AlertTriangle, CheckCircle, Info, Lightbulb,
  Calendar, Clock,
} from 'lucide-react'

const PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 182 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
]

function inRange(dateStr, startDate, endDate) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d >= new Date(startDate + 'T00:00:00') && d <= new Date(endDate + 'T23:59:59')
}

export default function Export() {
  const { user } = useAuthStore()
  const labStore = useLabStore()
  const medStore = useMedicationStore()
  const symptomStore = useSymptomStore()
  const [exported, setExported] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today)
  const [activePreset, setActivePreset] = useState('Last 6 months')

  const applyPreset = (preset) => {
    setActivePreset(preset.label)
    setEndDate(today)
    if (preset.days === null) {
      setStartDate('2000-01-01')
    } else {
      setStartDate(subDays(new Date(), preset.days).toISOString().split('T')[0])
    }
  }

  const handleCustomDate = (field, value) => {
    setActivePreset(null)
    if (field === 'start') setStartDate(value)
    else setEndDate(value)
  }

  const userId = user?.id
  const allReports = useMemo(() => labStore.getReportsForUser(userId), [userId])
  const allMedications = useMemo(() => medStore.getMedicationsForUser(userId).filter(m => m.active !== false), [userId])
  const allSymptoms = useMemo(() => symptomStore.getEntriesForUser(userId), [userId])

  const filteredReports = useMemo(() =>
    allReports.filter(r => inRange(r.testDate || r.createdAt, startDate, endDate)),
    [allReports, startDate, endDate]
  )
  const filteredSymptoms = useMemo(() =>
    allSymptoms.filter(s => inRange(s.date || s.createdAt, startDate, endDate)),
    [allSymptoms, startDate, endDate]
  )
  const insights = useMemo(() => generateInsights(filteredReports, filteredSymptoms), [filteredReports, filteredSymptoms])

  const handleExport = () => {
    exportHealthSummary({
      user,
      reports: filteredReports,
      medications: allMedications,
      symptoms: filteredSymptoms,
      insights,
      dateRange: { startDate, endDate },
    })
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const warningCount = insights.filter(i => i.type === 'warning').length
  const latestReport = filteredReports[0]
  const abnormalCount = latestReport?.results?.filter(r => r.status !== 'normal').length || 0

  const rangeLabel = activePreset === 'All time'
    ? 'All Time'
    : `${format(new Date(startDate), 'MMM d, yyyy')} – ${format(new Date(endDate), 'MMM d, yyyy')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Health Summary & Export</h1>
        <p className="text-text-secondary mt-1">Select a time frame, review AI insights, and export a PDF for your doctor</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          Report Time Frame
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border
                ${activePreset === p.label
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-alt text-text-secondary border-border hover:border-primary/40'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-text-secondary mb-1">From</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={e => handleCustomDate('start', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-text-secondary mb-1">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={e => handleCustomDate('end', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary bg-surface-alt rounded-lg px-4 py-2.5">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Showing <strong className="text-text-primary">{rangeLabel}</strong>
            {' — '}
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''},
            {' '}{filteredSymptoms.length} symptom log{filteredSymptoms.length !== 1 ? 's' : ''},
            {' '}{allMedications.length} active medication{allMedications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{filteredReports.length}</p>
            <p className="text-sm text-text-secondary">Lab Reports</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Pill className="w-8 h-8 text-accent" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{allMedications.length}</p>
            <p className="text-sm text-text-secondary">Active Medications</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <HeartPulse className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{filteredSymptoms.length}</p>
            <p className="text-sm text-text-secondary">Symptom Entries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-danger" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{abnormalCount}</p>
            <p className="text-sm text-text-secondary">Flagged Values</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              AI Health Insights
            </h2>
            <p className="text-sm text-text-secondary mt-1">Based on lab results and symptoms in the selected period</p>
          </div>
          {warningCount > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-bold">
              <AlertTriangle className="w-4 h-4" /> {warningCount} alert{warningCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {insights.map((insight, i) => {
            const colors = {
              warning: 'border-warning/20 bg-warning/5',
              positive: 'border-accent/20 bg-accent/5',
              info: 'border-primary/20 bg-primary/5',
            }
            const icons = { warning: AlertTriangle, positive: CheckCircle, info: Info }
            const textColors = { warning: 'text-warning', positive: 'text-accent', info: 'text-primary' }
            const Icon = icons[insight.type] || Info
            return (
              <div key={i} className={`border rounded-xl p-4 ${colors[insight.type] || colors.info}`}>
                <div className="flex gap-3">
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${textColors[insight.type]}`} />
                  <div>
                    <p className="font-semibold text-text-primary">{insight.message}</p>
                    <p className="text-sm text-text-secondary mt-1">{insight.suggestion}</p>
                    {insight.metric && insight.metric !== 'Overall' && insight.metric !== 'Symptoms' && insight.metric !== 'Pain Level' && (
                      <p className="text-xs text-text-secondary mt-2 font-medium">
                        Related metric: {insight.metric}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {latestReport && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            Latest Lab Summary — {format(new Date(latestReport.testDate || latestReport.createdAt), 'MMMM d, yyyy')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestReport.results?.map(r => (
              <div
                key={r.name}
                className={`p-3 rounded-lg border ${
                  r.status === 'high' ? 'border-danger/30 bg-danger/5'
                    : r.status === 'low' ? 'border-warning/30 bg-warning/5'
                    : 'border-border bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{r.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${r.status === 'high' ? 'bg-danger/10 text-danger'
                      : r.status === 'low' ? 'bg-warning/10 text-warning'
                      : 'bg-accent/10 text-accent'}`}>
                    {r.status === 'normal' ? 'OK' : r.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-bold text-text-primary mt-1">{r.value} <span className="text-sm font-normal text-text-secondary">{r.unit}</span></p>
                <p className="text-xs text-text-secondary">Range: {r.referenceRange} {r.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileDown className="w-6 h-6" />
              Export PDF Report
            </h2>
            <p className="text-white/80 mt-1">
              Download a health report for <strong>{rangeLabel}</strong>.
              Includes {filteredReports.length} lab report{filteredReports.length !== 1 ? 's' : ''},
              {' '}{allMedications.length} medication{allMedications.length !== 1 ? 's' : ''},
              {' '}{filteredSymptoms.length} symptom log{filteredSymptoms.length !== 1 ? 's' : ''},
              and AI insights.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filteredReports.length === 0 && filteredSymptoms.length === 0}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors shrink-0
              ${filteredReports.length === 0 && filteredSymptoms.length === 0
                ? 'bg-white/20 cursor-not-allowed'
                : exported
                  ? 'bg-accent text-white'
                  : 'bg-white text-primary hover:bg-white/90'
              }`}
          >
            {exported ? 'Downloaded!' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="bg-surface-alt rounded-xl p-4 text-center">
        <p className="text-sm text-text-secondary">
          <strong>Disclaimer:</strong> This report is generated for informational purposes only and does not constitute medical advice.
          Always consult your healthcare provider for diagnosis and treatment decisions.
        </p>
      </div>
    </div>
  )
}
