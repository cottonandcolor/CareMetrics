import { useMemo, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { useMedicationStore } from '../stores/medicationStore'
import { useSymptomStore } from '../stores/symptomStore'
import { generateInsights } from '../utils/mockAI'
import { exportHealthSummary } from '../utils/pdfExport'
import { format } from 'date-fns'
import {
  FileDown, FileText, Pill, HeartPulse, TrendingUp,
  AlertTriangle, CheckCircle, Info, Lightbulb,
} from 'lucide-react'

export default function Export() {
  const { user } = useAuthStore()
  const labStore = useLabStore()
  const medStore = useMedicationStore()
  const symptomStore = useSymptomStore()
  const [exported, setExported] = useState(false)

  const userId = user?.id
  const reports = useMemo(() => labStore.getReportsForUser(userId), [userId])
  const medications = useMemo(() => medStore.getMedicationsForUser(userId).filter(m => m.active !== false), [userId])
  const symptoms = useMemo(() => symptomStore.getEntriesForUser(userId), [userId])
  const insights = useMemo(() => generateInsights(reports, symptoms), [reports, symptoms])

  const handleExport = () => {
    exportHealthSummary({ user, reports, medications, symptoms, insights })
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const warningCount = insights.filter(i => i.type === 'warning').length
  const latestReport = reports[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Health Summary & Export</h1>
        <p className="text-text-secondary mt-1">Review your AI-generated health insights and export a PDF for your doctor</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              AI Health Insights
            </h2>
            <p className="text-sm text-text-secondary mt-1">Based on your lab results and symptom patterns</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{reports.length}</p>
            <p className="text-sm text-text-secondary">Lab Reports</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Pill className="w-8 h-8 text-accent" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{medications.length}</p>
            <p className="text-sm text-text-secondary">Active Medications</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <HeartPulse className="w-8 h-8 text-warning" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{symptoms.length}</p>
            <p className="text-sm text-text-secondary">Symptom Entries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-danger" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{latestReport?.results?.filter(r => r.status !== 'normal').length || 0}</p>
            <p className="text-sm text-text-secondary">Flagged Values</p>
          </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileDown className="w-6 h-6" />
              Export PDF Report
            </h2>
            <p className="text-white/80 mt-1">
              Download a comprehensive health summary to share with your doctor.
              Includes lab results, medications, symptoms, and AI insights.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={reports.length === 0}
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors shrink-0
              ${reports.length === 0
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
