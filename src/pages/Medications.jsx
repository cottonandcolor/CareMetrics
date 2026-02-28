import { useState, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useMedicationStore } from '../stores/medicationStore'
import { format, subDays } from 'date-fns'
import {
  Plus, Pill, Trash2, Check, X, ChevronDown, ChevronUp,
  Droplets, Leaf,
} from 'lucide-react'

const TYPE_ICONS = {
  Medication: Pill,
  Vitamin: Droplets,
  Supplement: Leaf,
}

const TYPE_COLORS = {
  Medication: 'text-primary bg-primary/10',
  Vitamin: 'text-warning bg-warning/10',
  Supplement: 'text-accent bg-accent/10',
}

function MedicationCard({ med, onLog, onUnlog, onDelete, today }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = TYPE_ICONS[med.type] || Pill
  const color = TYPE_COLORS[med.type] || TYPE_COLORS.Medication
  const takenToday = (med.logs || []).includes(today)

  const last7 = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      days.push({ date: d, taken: (med.logs || []).includes(d), label: format(subDays(new Date(), i), 'EEE') })
    }
    return days
  }, [med.logs])

  return (
    <div className={`bg-white rounded-xl border border-border overflow-hidden ${med.active === false ? 'opacity-60' : ''}`}>
      <div className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary text-lg">{med.name}</p>
          <p className="text-sm text-text-secondary">{med.dosage} · {med.frequency}</p>
        </div>
        <div className="flex items-center gap-2">
          {med.active !== false && (
            <button
              onClick={() => takenToday ? onUnlog(med.id, today) : onLog(med.id, today)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2
                ${takenToday
                  ? 'bg-accent/10 text-accent border-2 border-accent/30'
                  : 'bg-primary text-white hover:bg-primary-light'
                }`}
            >
              {takenToday ? <><Check className="w-4 h-4" /> Taken</> : 'Log Dose'}
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-surface-alt rounded-lg"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-3">
            <p className="text-sm font-semibold text-text-secondary mb-2">Last 7 Days</p>
            <div className="flex gap-2">
              {last7.map(d => (
                <div key={d.date} className="flex-1 text-center">
                  <p className="text-xs text-text-secondary mb-1">{d.label}</p>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold
                    ${d.taken ? 'bg-accent text-white' : 'bg-surface-alt text-text-secondary border border-border'}`}>
                    {d.taken ? <Check className="w-4 h-4" /> : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {med.type} · Added {format(new Date(med.createdAt), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => onDelete(med.id)}
              className="flex items-center gap-1 text-sm text-danger hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Medications() {
  const { user } = useAuthStore()
  const { getMedicationsForUser, addMedication, deleteMedication, logDose, unlogDose, getAdherenceRate } = useMedicationStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'Once daily', type: 'Medication' })

  const userId = user?.id
  const medications = useMemo(() => getMedicationsForUser(userId), [userId, useMedicationStore(s => s.medications)])
  const adherence = useMemo(() => getAdherenceRate(userId), [userId, useMedicationStore(s => s.medications)])
  const today = new Date().toISOString().split('T')[0]

  const activeMeds = medications.filter(m => m.active !== false)
  const inactiveMeds = medications.filter(m => m.active === false)

  const handleAdd = (e) => {
    e.preventDefault()
    addMedication({ ...form, userId, active: true })
    setForm({ name: '', dosage: '', frequency: 'Once daily', type: 'Medication' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Medications & Vitamins</h1>
          <p className="text-text-secondary mt-1">Track your daily medications and supplements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-primary">{activeMeds.length}</p>
          <p className="text-sm text-text-secondary mt-1">Active Medications</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-accent">{adherence}%</p>
          <p className="text-sm text-text-secondary mt-1">30-Day Adherence</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-3xl font-bold text-warning">
            {activeMeds.filter(m => !(m.logs || []).includes(today)).length}
          </p>
          <p className="text-sm text-text-secondary mt-1">Remaining Today</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-lg">Add Medication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Metformin"
                className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Dosage</label>
              <input
                type="text"
                value={form.dosage}
                onChange={e => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 500mg"
                className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-white"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-white"
              >
                <option>Medication</option>
                <option>Vitamin</option>
                <option>Supplement</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors"
          >
            Add Medication
          </button>
        </form>
      )}

      <div className="space-y-3">
        {activeMeds.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <Pill className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-lg font-semibold text-text-primary">No medications yet</p>
            <p className="text-text-secondary mt-1">Add your first medication to start tracking</p>
          </div>
        )}
        {activeMeds.map(med => (
          <MedicationCard
            key={med.id}
            med={med}
            onLog={logDose}
            onUnlog={unlogDose}
            onDelete={deleteMedication}
            today={today}
          />
        ))}
      </div>

      {inactiveMeds.length > 0 && (
        <div>
          <h3 className="font-bold text-text-secondary mb-2">Inactive ({inactiveMeds.length})</h3>
          <div className="space-y-2">
            {inactiveMeds.map(med => (
              <MedicationCard
                key={med.id}
                med={med}
                onLog={logDose}
                onUnlog={unlogDose}
                onDelete={deleteMedication}
                today={today}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
