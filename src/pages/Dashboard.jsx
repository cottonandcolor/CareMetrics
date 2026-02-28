import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { useMedicationStore } from '../stores/medicationStore'
import { useSymptomStore } from '../stores/symptomStore'
import { generateInsights } from '../utils/mockAI'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  FlaskConical, Pill, HeartPulse, TrendingUp,
  AlertTriangle, CheckCircle, Info, ArrowRight,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  return (
    <Link to={to} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-sm text-text-secondary mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        View details <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

function InsightCard({ insight }) {
  const icons = {
    warning: AlertTriangle,
    positive: CheckCircle,
    info: Info,
  }
  const colors = {
    warning: 'text-warning bg-warning/10 border-warning/20',
    positive: 'text-accent bg-accent/10 border-accent/20',
    info: 'text-primary bg-primary/10 border-primary/20',
  }
  const Icon = icons[insight.type] || Info
  const color = colors[insight.type] || colors.info

  return (
    <div className={`border rounded-xl p-4 ${color}`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">{insight.message}</p>
          <p className="text-sm mt-1 opacity-80">{insight.suggestion}</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { getReportsForUser } = useLabStore()
  const { getMedicationsForUser, getAdherenceRate } = useMedicationStore()
  const { getEntriesForUser, getTodayEntry } = useSymptomStore()

  const userId = user?.id
  const reports = useMemo(() => getReportsForUser(userId), [userId])
  const medications = useMemo(() => getMedicationsForUser(userId), [userId])
  const symptoms = useMemo(() => getEntriesForUser(userId), [userId])
  const adherence = useMemo(() => getAdherenceRate(userId), [userId])
  const todaySymptom = useMemo(() => getTodayEntry(userId), [userId])
  const insights = useMemo(() => generateInsights(reports, symptoms), [reports, symptoms])

  const activeMeds = medications.filter(m => m.active !== false)

  const glucoseData = useMemo(() => {
    return reports.flatMap(r =>
      (r.results || [])
        .filter(m => m.name === 'Fasting Glucose')
        .map(m => ({
          date: format(new Date(r.testDate || r.createdAt), 'MMM yy'),
          value: m.value,
        }))
    ).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [reports])

  const abnormalCount = reports[0]?.results?.filter(r => r.status !== 'normal').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-text-secondary mt-1">Here's your health overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FlaskConical}
          label="Lab Reports"
          value={reports.length}
          sub={reports[0] ? `Last: ${format(new Date(reports[0].testDate || reports[0].createdAt), 'MMM d')}` : 'No reports yet'}
          color="text-primary"
          to="/scan"
        />
        <StatCard
          icon={Pill}
          label="Medications"
          value={activeMeds.length}
          sub={`${adherence}% adherence (30d)`}
          color="text-accent"
          to="/medications"
        />
        <StatCard
          icon={HeartPulse}
          label="Today's Check-in"
          value={todaySymptom ? 'Done' : 'Pending'}
          sub={todaySymptom ? `Pain: ${todaySymptom.painLevel}/10` : 'Tap to log symptoms'}
          color={todaySymptom ? 'text-accent' : 'text-warning'}
          to="/symptoms"
        />
        <StatCard
          icon={TrendingUp}
          label="Flagged Results"
          value={abnormalCount}
          sub={abnormalCount > 0 ? 'Needs attention' : 'All within range'}
          color={abnormalCount > 0 ? 'text-warning' : 'text-accent'}
          to="/trends"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">AI Health Insights</h2>
          <div className="space-y-3">
            {insights.slice(0, 4).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Blood Sugar Trend</h2>
            <Link to="/trends" className="text-sm text-primary hover:underline flex items-center gap-1">
              All trends <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {glucoseData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1B4D7A"
                  strokeWidth={2.5}
                  dot={{ fill: '#1B4D7A', r: 5 }}
                  name="Fasting Glucose (mg/dL)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-secondary">
              <p>Upload at least 2 lab reports to see trends</p>
            </div>
          )}
        </div>
      </div>

      {!todaySymptom && (
        <Link
          to="/symptoms"
          className="block bg-gradient-to-r from-primary to-primary-light text-white rounded-xl p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">Daily Check-in</p>
              <p className="text-white/80 mt-1">How are you feeling today? Log your symptoms in under a minute.</p>
            </div>
            <ArrowRight className="w-6 h-6" />
          </div>
        </Link>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
