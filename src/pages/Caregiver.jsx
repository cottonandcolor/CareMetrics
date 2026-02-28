import { useState, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { useMedicationStore } from '../stores/medicationStore'
import { useSymptomStore } from '../stores/symptomStore'
import { generateInsights } from '../utils/mockAI'
import { format } from 'date-fns'
import {
  Users, UserPlus, Shield, AlertTriangle, CheckCircle,
  Info, FlaskConical, Pill, HeartPulse, Phone,
} from 'lucide-react'

function PatientCard({ patient, labStore, medStore, symptomStore }) {
  const [expanded, setExpanded] = useState(false)
  const reports = labStore.getReportsForUser(patient.id)
  const meds = medStore.getMedicationsForUser(patient.id).filter(m => m.active !== false)
  const adherence = medStore.getAdherenceRate(patient.id)
  const symptoms = symptomStore.getEntriesForUser(patient.id)
  const todayEntry = symptomStore.getTodayEntry(patient.id)
  const insights = generateInsights(reports, symptoms)

  const latestReport = reports[0]
  const abnormalCount = latestReport?.results?.filter(r => r.status !== 'normal').length || 0
  const hasWarnings = insights.some(i => i.type === 'warning')

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left hover:bg-surface-alt/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {patient.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg text-text-primary">{patient.name}</p>
              <p className="text-sm text-text-secondary">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasWarnings && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold">
                <AlertTriangle className="w-3 h-3" /> Alerts
              </span>
            )}
            {!todayEntry && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-bold">
                No check-in today
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <FlaskConical className="w-4 h-4 text-primary" />
            <span><strong>{reports.length}</strong> reports</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Pill className="w-4 h-4 text-accent" />
            <span><strong>{meds.length}</strong> meds ({adherence}%)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HeartPulse className="w-4 h-4 text-warning" />
            <span><strong>{abnormalCount}</strong> flagged</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Today: {todayEntry ? `Pain ${todayEntry.painLevel}/10` : 'Pending'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border space-y-4">
          <div>
            <h4 className="font-bold text-text-primary mb-2">Health Insights</h4>
            <div className="space-y-2">
              {insights.map((insight, i) => {
                const colors = {
                  warning: 'text-warning bg-warning/10 border-warning/20',
                  positive: 'text-accent bg-accent/10 border-accent/20',
                  info: 'text-primary bg-primary/10 border-primary/20',
                }
                const icons = { warning: AlertTriangle, positive: CheckCircle, info: Info }
                const Icon = icons[insight.type] || Info
                return (
                  <div key={i} className={`border rounded-lg p-3 ${colors[insight.type] || colors.info}`}>
                    <div className="flex gap-2">
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">{insight.message}</p>
                        <p className="text-xs mt-0.5 opacity-80">{insight.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {latestReport && (
            <div>
              <h4 className="font-bold text-text-primary mb-2">
                Latest Report ({format(new Date(latestReport.testDate || latestReport.createdAt), 'MMM d, yyyy')})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {latestReport.results?.filter(r => r.status !== 'normal').map(r => (
                  <div key={r.name} className="flex items-center justify-between p-2 border border-border rounded-lg text-sm">
                    <span className="font-medium">{r.name}</span>
                    <span className={`font-bold ${r.status === 'high' ? 'text-danger' : 'text-warning'}`}>
                      {r.value} {r.unit} ({r.status.toUpperCase()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold text-text-primary mb-2">Current Medications</h4>
            <div className="flex flex-wrap gap-2">
              {meds.map(m => (
                <span key={m.id} className="px-3 py-1.5 bg-surface-alt rounded-full text-sm font-medium">
                  {m.name} — {m.dosage}
                </span>
              ))}
              {meds.length === 0 && <span className="text-text-secondary text-sm">No active medications</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Caregiver() {
  const { user, addCaregiver, getCaregiverPatients, getLinkedCaregivers } = useAuthStore()
  const labStore = useLabStore()
  const medStore = useMedicationStore()
  const symptomStore = useSymptomStore()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  const patients = useMemo(() => getCaregiverPatients(), [user])
  const linkedCaregivers = useMemo(() => getLinkedCaregivers(), [user])

  const handleInvite = (e) => {
    e.preventDefault()
    const result = addCaregiver(email)
    if (result.success) {
      setMessage({ type: 'success', text: `${result.caregiverName} added as a caregiver!` })
      setEmail('')
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Caregiver Dashboard</h1>
        <p className="text-text-secondary mt-1">Manage shared access and monitor loved ones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-primary" />
              Invite a Caregiver
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Share your health data with a family member or caregiver so they can monitor your well-being.
            </p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="caregiver@email.com"
                className="flex-1 px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
              >
                Invite
              </button>
            </form>
            {message && (
              <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium
                ${message.type === 'success' ? 'bg-accent/10 text-accent' : 'bg-danger-light text-danger'}`}>
                {message.text}
              </div>
            )}
          </div>

          {patients.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-3">
                Linked Patients ({patients.length})
              </h2>
              <div className="space-y-4">
                {patients.map(p => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    labStore={labStore}
                    medStore={medStore}
                    symptomStore={symptomStore}
                  />
                ))}
              </div>
            </div>
          )}

          {patients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-border">
              <Users className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <p className="text-lg font-semibold text-text-primary">No linked patients yet</p>
              <p className="text-text-secondary mt-1">
                Invite a caregiver above, or ask your caregiver to sign up and you can link accounts.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Access
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                Caregivers can only view data you share
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                All data is encrypted and private
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                You can remove access at any time
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                Caregivers receive alerts for concerning trends
              </li>
            </ul>
          </div>

          {linkedCaregivers.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-bold text-text-primary mb-3">My Caregivers</h3>
              <div className="space-y-2">
                {linkedCaregivers.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-text-secondary">{c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-danger" />
              Emergency Contacts
            </h3>
            <p className="text-sm text-text-secondary">
              Add emergency contacts in your profile settings. They will be notified if critical health alerts are detected.
            </p>
            <button className="mt-3 text-sm text-primary font-semibold hover:underline">
              Set up emergency contacts →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
