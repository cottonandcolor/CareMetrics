import { useState, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { REFERENCE_RANGES } from '../utils/mockAI'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'

const CATEGORIES = ['All', 'Blood Count', 'Lipid Panel', 'Metabolic', 'Kidney', 'Liver', 'Thyroid', 'Vitamins', 'Minerals', 'Electrolytes', 'Inflammation']

function TrendIcon({ current, previous }) {
  if (!previous) return <Minus className="w-4 h-4 text-text-secondary" />
  if (current > previous) return <TrendingUp className="w-4 h-4 text-danger" />
  if (current < previous) return <TrendingDown className="w-4 h-4 text-accent" />
  return <Minus className="w-4 h-4 text-text-secondary" />
}

export default function Trends() {
  const { user } = useAuthStore()
  const { getReportsForUser, getAllMetricNames, getMetricHistory } = useLabStore()

  const userId = user?.id
  const reports = useMemo(() => getReportsForUser(userId), [userId])
  const metricNames = useMemo(() => getAllMetricNames(userId), [userId])
  const [selectedMetric, setSelectedMetric] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filteredMetrics = useMemo(() => {
    if (categoryFilter === 'All') return metricNames
    return metricNames.filter(name => REFERENCE_RANGES[name]?.category === categoryFilter)
  }, [metricNames, categoryFilter])

  const chartData = useMemo(() => {
    if (!selectedMetric) return []
    return getMetricHistory(userId, selectedMetric)
  }, [userId, selectedMetric])

  const ref = selectedMetric ? REFERENCE_RANGES[selectedMetric] : null

  const metricSummaries = useMemo(() => {
    return filteredMetrics.map(name => {
      const history = getMetricHistory(userId, name)
      const latest = history[history.length - 1]
      const previous = history.length > 1 ? history[history.length - 2] : null
      const r = REFERENCE_RANGES[name]
      let status = 'normal'
      if (r && latest) {
        if (latest.value > r.max) status = 'high'
        else if (latest.value < r.min) status = 'low'
      }
      return {
        name,
        latest: latest?.value,
        previous: previous?.value,
        unit: latest?.unit || r?.unit || '',
        status,
        category: r?.category || 'Other',
        dataPoints: history.length,
      }
    })
  }, [filteredMetrics, userId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Health Trends</h1>
        <p className="text-text-secondary mt-1">Track how your lab values change over time</p>
      </div>

      {reports.length < 2 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
          <p className="text-primary font-semibold">Upload at least 2 lab reports to see meaningful trends.</p>
          <p className="text-text-secondary text-sm mt-1">You currently have {reports.length} report{reports.length !== 1 ? 's' : ''}.</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-text-secondary" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${categoryFilter === cat
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-text-secondary hover:bg-primary/10'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedMetric && chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{selectedMetric}</h2>
              <p className="text-sm text-text-secondary">{ref?.category || 'Other'} · {ref?.unit || chartData[0]?.unit}</p>
            </div>
            <button
              onClick={() => setSelectedMetric(null)}
              className="text-sm text-primary hover:underline"
            >
              Close chart
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData.map(d => ({ ...d, date: format(new Date(d.date), 'MMM yy') }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              {ref && (
                <>
                  <ReferenceLine y={ref.max} stroke="#E53E3E" strokeDasharray="5 5" label={{ value: `High (${ref.max})`, fontSize: 11, fill: '#E53E3E' }} />
                  <ReferenceLine y={ref.min} stroke="#DD6B20" strokeDasharray="5 5" label={{ value: `Low (${ref.min})`, fontSize: 11, fill: '#DD6B20' }} />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1B4D7A"
                strokeWidth={2.5}
                dot={{ fill: '#1B4D7A', r: 6 }}
                name={selectedMetric}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-surface-alt text-sm font-semibold text-text-secondary">
          <span className="col-span-2">Metric</span>
          <span>Latest</span>
          <span>Trend</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border">
          {metricSummaries.map(m => (
            <button
              key={m.name}
              onClick={() => setSelectedMetric(m.name)}
              className={`w-full grid grid-cols-5 gap-4 p-4 text-left hover:bg-surface-alt transition-colors
                ${selectedMetric === m.name ? 'bg-primary/5' : ''}`}
            >
              <div className="col-span-2">
                <p className="font-semibold text-text-primary">{m.name}</p>
                <p className="text-xs text-text-secondary">{m.category} · {m.dataPoints} readings</p>
              </div>
              <div>
                <span className="font-bold text-text-primary">{m.latest}</span>
                <span className="text-sm text-text-secondary ml-1">{m.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon current={m.latest} previous={m.previous} />
                {m.previous && (
                  <span className="text-xs text-text-secondary">
                    from {m.previous}
                  </span>
                )}
              </div>
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold
                  ${m.status === 'high' ? 'bg-danger/10 text-danger'
                    : m.status === 'low' ? 'bg-warning/10 text-warning'
                    : 'bg-accent/10 text-accent'}`}>
                  {m.status === 'normal' ? 'Normal' : m.status.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
          {metricSummaries.length === 0 && (
            <div className="p-8 text-center text-text-secondary">
              No metrics found. Upload lab reports to see your health trends.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
