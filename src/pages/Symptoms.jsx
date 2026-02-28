import { useState, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useSymptomStore, SYMPTOM_PRESETS } from '../stores/symptomStore'
import { format, subDays } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  HeartPulse, Plus, Check, Trash2, SmilePlus, Meh, Frown,
} from 'lucide-react'

const MOODS = [
  { value: 'good', label: 'Good', icon: SmilePlus, color: 'text-accent bg-accent/10 border-accent/30' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-warning bg-warning/10 border-warning/30' },
  { value: 'poor', label: 'Poor', icon: Frown, color: 'text-danger bg-danger/10 border-danger/30' },
]

export default function Symptoms() {
  const { user } = useAuthStore()
  const { entries, addEntry, deleteEntry, getEntriesForUser, getTodayEntry, getMostCommonSymptoms } = useSymptomStore()

  const userId = user?.id
  const allEntries = useMemo(() => getEntriesForUser(userId), [userId, entries])
  const todayEntry = useMemo(() => getTodayEntry(userId), [userId, entries])
  const topSymptoms = useMemo(() => getMostCommonSymptoms(userId), [userId, entries])

  const today = new Date().toISOString().split('T')[0]
  const [selected, setSelected] = useState([])
  const [painLevel, setPainLevel] = useState(3)
  const [mood, setMood] = useState('okay')
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(!todayEntry)

  const painData = useMemo(() => {
    const data = []
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const entry = allEntries.find(e => e.date === d)
      data.push({
        date: format(subDays(new Date(), i), 'MMM d'),
        pain: entry?.painLevel || 0,
      })
    }
    return data
  }, [allEntries])

  const toggleSymptom = (s) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = () => {
    addEntry({
      userId,
      date: today,
      symptoms: selected,
      painLevel,
      mood,
      notes,
    })
    setShowForm(false)
    setSelected([])
    setPainLevel(3)
    setMood('okay')
    setNotes('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Symptom Tracking</h1>
        <p className="text-text-secondary mt-1">Log how you're feeling each day</p>
      </div>

      {todayEntry && !showForm ? (
        <div className="bg-accent/5 border-2 border-accent/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Check className="w-6 h-6 text-accent" />
            <h2 className="text-lg font-bold text-accent">Today's Check-in Complete</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Symptoms</p>
              <p className="font-semibold">{todayEntry.symptoms?.join(', ') || 'None'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Pain Level</p>
              <p className="font-semibold">{todayEntry.painLevel}/10</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Mood</p>
              <p className="font-semibold capitalize">{todayEntry.mood || 'N/A'}</p>
            </div>
          </div>
          {todayEntry.notes && (
            <p className="mt-2 text-sm text-text-secondary italic">"{todayEntry.notes}"</p>
          )}
        </div>
      ) : showForm ? (
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" />
            How are you feeling today?
          </h2>

          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Select symptoms (if any)</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_PRESETS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors border
                    ${selected.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-alt text-text-secondary border-border hover:border-primary/40'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">
              Pain Level: <span className="text-text-primary text-lg">{painLevel}/10</span>
            </p>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={e => setPainLevel(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-accent via-warning to-danger accent-primary"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>No pain</span>
              <span>Severe</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-secondary mb-2">Overall Mood</p>
            <div className="flex gap-3">
              {MOODS.map(m => {
                const Icon = m.icon
                return (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors
                      ${mood === m.value ? m.color : 'border-border text-text-secondary hover:border-primary/30'}`}
                  >
                    <Icon className="w-7 h-7" />
                    <span className="text-sm font-semibold">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-secondary mb-1">Notes (optional)</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How are you feeling? Any observations..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary text-white text-lg font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            Save Check-in
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">Pain Level (14 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={painData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 13 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="pain" fill="#1B4D7A" radius={[4, 4, 0, 0]} name="Pain Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">Most Reported Symptoms</h2>
          {topSymptoms.length > 0 ? (
            <div className="space-y-3">
              {topSymptoms.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="text-sm text-text-secondary">{s.count} times</span>
                    </div>
                    <div className="h-2.5 bg-surface-alt rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((s.count / (topSymptoms[0]?.count || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary py-8 text-center">No symptoms logged yet</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-lg font-bold text-text-primary mb-4">Recent Entries</h2>
        <div className="space-y-2">
          {allEntries.slice(0, 10).map(entry => (
            <div key={entry.id} className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-surface-alt transition-colors">
              <div>
                <p className="font-semibold text-sm">
                  {format(new Date(entry.date || entry.createdAt), 'EEEE, MMM d')}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {entry.symptoms?.join(', ') || 'No symptoms'}
                  {entry.painLevel != null && ` · Pain: ${entry.painLevel}/10`}
                  {entry.mood && ` · Mood: ${entry.mood}`}
                </p>
                {entry.notes && <p className="text-xs text-text-secondary mt-1 italic">"{entry.notes}"</p>}
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="p-1.5 hover:bg-danger/10 rounded text-text-secondary hover:text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {allEntries.length === 0 && (
            <p className="text-text-secondary py-4 text-center">No entries yet. Start your daily check-in above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
