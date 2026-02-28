import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useLabStore } from '../stores/labStore'
import { simulateOCRExtraction, analyzeResults } from '../utils/mockAI'
import { format } from 'date-fns'
import {
  Upload, FileText, Trash2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, ArrowDown, Loader2,
} from 'lucide-react'

function StatusBadge({ status }) {
  if (status === 'high') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger">
      <AlertTriangle className="w-3 h-3" /> HIGH
    </span>
  )
  if (status === 'low') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning">
      <ArrowDown className="w-3 h-3" /> LOW
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent">
      <CheckCircle className="w-3 h-3" /> Normal
    </span>
  )
}

function ResultRow({ result, expanded, onToggle }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-alt transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={result.status} />
          <span className="font-semibold text-text-primary truncate">{result.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-lg font-bold text-text-primary">{result.value} <span className="text-sm font-normal text-text-secondary">{result.unit}</span></span>
          {expanded ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-surface-alt">
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Reference Range</span>
              <p className="font-semibold">{result.referenceRange} {result.unit}</p>
            </div>
            <div>
              <span className="text-text-secondary">Category</span>
              <p className="font-semibold">{result.category}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white rounded-lg border border-border">
            <p className="text-sm leading-relaxed text-text-primary">{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LabScanner() {
  const { user } = useAuthStore()
  const { reports, addReport, deleteReport, getReportsForUser } = useLabStore()
  const [scanning, setScanning] = useState(false)
  const [currentResults, setCurrentResults] = useState(null)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [viewHistory, setViewHistory] = useState(false)
  const [historyDetail, setHistoryDetail] = useState(null)
  const [labName, setLabName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const fileRef = useRef(null)

  const userReports = getReportsForUser(user?.id)

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setCurrentResults(null)

    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000))

    const rawResults = simulateOCRExtraction(file.name)
    const analyzed = analyzeResults(rawResults)
    setCurrentResults({ fileName: file.name, results: analyzed })
    setScanning(false)
    setExpandedIdx(null)

    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const handleSaveReport = () => {
    if (!currentResults) return
    addReport({
      userId: user.id,
      fileName: currentResults.fileName,
      testDate,
      labName: labName || 'Unknown Lab',
      results: currentResults.results,
    })
    setCurrentResults(null)
    setLabName('')
    setViewHistory(true)
  }

  const abnormal = currentResults?.results?.filter(r => r.status !== 'normal') || []
  const normal = currentResults?.results?.filter(r => r.status === 'normal') || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Lab Report Scanner</h1>
        <p className="text-text-secondary mt-1">Upload your blood work report and get instant AI-powered explanations</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          {scanning ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-lg font-semibold text-primary">Scanning your report...</p>
              <p className="text-text-secondary">AI is extracting and analyzing your lab values</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-text-secondary mx-auto mb-3" />
              <p className="text-lg font-semibold text-text-primary">Upload Lab Report</p>
              <p className="text-text-secondary mt-1">Drag and drop or click to upload PDF or image</p>
              <p className="text-sm text-text-secondary mt-2">Supported: PDF, JPG, PNG</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            disabled={scanning}
          />
        </div>

        {currentResults && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-text-secondary mb-1">Lab Name</label>
                <input
                  type="text"
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  placeholder="e.g. Quest Diagnostics"
                  className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Test Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  className="px-4 py-2.5 border-2 border-border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-alt rounded-lg p-4">
              <div>
                <p className="font-semibold text-text-primary">{currentResults.results.length} values extracted</p>
                <p className="text-sm text-text-secondary">
                  {abnormal.length > 0
                    ? `${abnormal.length} result${abnormal.length > 1 ? 's' : ''} outside normal range`
                    : 'All results within normal range'}
                </p>
              </div>
              <button
                onClick={handleSaveReport}
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
              >
                Save Report
              </button>
            </div>

            {abnormal.length > 0 && (
              <div>
                <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Needs Attention ({abnormal.length})
                </h3>
                <div className="space-y-2">
                  {abnormal.map((r, i) => (
                    <ResultRow
                      key={r.name}
                      result={r}
                      expanded={expandedIdx === `a${i}`}
                      onToggle={() => setExpandedIdx(expandedIdx === `a${i}` ? null : `a${i}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Normal Results ({normal.length})
              </h3>
              <div className="space-y-2">
                {normal.map((r, i) => (
                  <ResultRow
                    key={r.name}
                    result={r}
                    expanded={expandedIdx === `n${i}`}
                    onToggle={() => setExpandedIdx(expandedIdx === `n${i}` ? null : `n${i}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <button
          onClick={() => { setViewHistory(!viewHistory); setHistoryDetail(null) }}
          className="flex items-center justify-between w-full"
        >
          <h2 className="text-lg font-bold text-text-primary">Report History ({userReports.length})</h2>
          {viewHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {viewHistory && (
          <div className="mt-4 space-y-3">
            {userReports.length === 0 ? (
              <p className="text-text-secondary py-4">No reports yet. Upload your first lab report above.</p>
            ) : (
              userReports.map(report => (
                <div key={report.id}>
                  <div
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-alt transition-colors cursor-pointer"
                    onClick={() => setHistoryDetail(historyDetail === report.id ? null : report.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">{report.labName || report.fileName}</p>
                        <p className="text-sm text-text-secondary">
                          {format(new Date(report.testDate || report.createdAt), 'MMMM d, yyyy')}
                          {' · '}{report.results?.length || 0} values
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteReport(report.id) }}
                        className="p-2 hover:bg-danger/10 rounded-lg text-text-secondary hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {historyDetail === report.id && (
                    <div className="mt-2 space-y-2 pl-4">
                      {(report.results || []).map((r, i) => (
                        <ResultRow
                          key={r.name}
                          result={r}
                          expanded={expandedIdx === `h${report.id}${i}`}
                          onToggle={() => setExpandedIdx(expandedIdx === `h${report.id}${i}` ? null : `h${report.id}${i}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="bg-surface-alt rounded-xl p-4 text-center">
        <p className="text-sm text-text-secondary">
          <strong>Disclaimer:</strong> CareMetrics provides informational summaries only and is not a medical diagnostic tool.
          Always consult with your healthcare provider for medical advice.
        </p>
      </div>
    </div>
  )
}
