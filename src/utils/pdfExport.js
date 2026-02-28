import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

function isInRange(dateStr, startDate, endDate) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return d >= startDate && d <= endDate
}

export function exportHealthSummary({ user, reports, medications, symptoms, insights, dateRange }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const hasRange = dateRange?.startDate && dateRange?.endDate
  const start = hasRange ? new Date(dateRange.startDate + 'T00:00:00') : null
  const end = hasRange ? new Date(dateRange.endDate + 'T23:59:59') : null

  const filteredReports = hasRange
    ? reports.filter(r => isInRange(r.testDate || r.createdAt, start, end))
    : reports
  const filteredSymptoms = hasRange
    ? symptoms.filter(s => isInRange(s.date || s.createdAt, start, end))
    : symptoms

  const rangeLabel = hasRange
    ? `${format(start, 'MMMM d, yyyy')} – ${format(end, 'MMMM d, yyyy')}`
    : 'All Time'

  doc.setFontSize(22)
  doc.setTextColor(27, 77, 122)
  doc.text('CareMetrics Health Report', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Prepared for: ${user?.name || 'Patient'}`, 14, 32)
  doc.text(`Report period: ${rangeLabel}`, 14, 38)
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 44)
  doc.text('Disclaimer: This report is for informational purposes only. Not a medical diagnosis.', 14, 50)

  doc.setDrawColor(200)
  doc.line(14, 54, pageWidth - 14, 54)

  let y = 62

  doc.setFontSize(10)
  doc.setTextColor(80)
  doc.text(
    `Summary: ${filteredReports.length} lab report(s), ${medications.length} active medication(s), ${filteredSymptoms.length} symptom log(s)`,
    14, y
  )
  y += 10

  for (const report of filteredReports) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(14)
    doc.setTextColor(27, 77, 122)
    const reportDate = format(new Date(report.testDate || report.createdAt), 'MMMM d, yyyy')
    doc.text(`Lab Results — ${reportDate}${report.labName ? ` (${report.labName})` : ''}`, 14, y)
    y += 4

    const tableData = (report.results || []).map(r => [
      r.name,
      `${r.value} ${r.unit}`,
      r.referenceRange || 'N/A',
      (r.status || 'normal').toUpperCase(),
    ])

    doc.autoTable({
      startY: y,
      head: [['Test', 'Result', 'Reference Range', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [27, 77, 122] },
      styles: { fontSize: 10 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const val = data.cell.raw
          if (val === 'HIGH') data.cell.styles.textColor = [229, 62, 62]
          else if (val === 'LOW') data.cell.styles.textColor = [221, 107, 32]
          else data.cell.styles.textColor = [56, 161, 105]
        }
      },
    })

    y = doc.lastAutoTable.finalY + 12
  }

  if (insights && insights.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(16)
    doc.setTextColor(27, 77, 122)
    doc.text('AI Health Insights', 14, y)
    y += 8

    doc.setFontSize(10)
    for (const insight of insights) {
      if (y > 270) { doc.addPage(); y = 20 }
      const icon = insight.type === 'warning' ? '(!)' : insight.type === 'positive' ? '(+)' : '(i)'
      doc.setTextColor(60)
      const lines = doc.splitTextToSize(`${icon} ${insight.message} ${insight.suggestion}`, pageWidth - 28)
      doc.text(lines, 14, y)
      y += lines.length * 5 + 3
    }
    y += 6
  }

  if (medications.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(16)
    doc.setTextColor(27, 77, 122)
    doc.text('Current Medications', 14, y)
    y += 4

    const medData = medications.map(m => [
      m.name,
      m.dosage || 'N/A',
      m.frequency || 'Daily',
      m.type || 'Medication',
    ])

    doc.autoTable({
      startY: y,
      head: [['Medication', 'Dosage', 'Frequency', 'Type']],
      body: medData,
      theme: 'striped',
      headStyles: { fillColor: [56, 161, 105] },
      styles: { fontSize: 10 },
    })

    y = doc.lastAutoTable.finalY + 12
  }

  if (filteredSymptoms.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(16)
    doc.setTextColor(27, 77, 122)
    doc.text(`Symptom Log (${filteredSymptoms.length} entries)`, 14, y)
    y += 4

    const symptomData = filteredSymptoms.map(s => [
      format(new Date(s.date || s.createdAt), 'MMM d, yyyy'),
      (s.symptoms || []).join(', ') || 'None',
      s.painLevel != null ? `${s.painLevel}/10` : 'N/A',
      s.notes || '',
    ])

    doc.autoTable({
      startY: y,
      head: [['Date', 'Symptoms', 'Pain', 'Notes']],
      body: symptomData,
      theme: 'striped',
      headStyles: { fillColor: [221, 107, 32] },
      styles: { fontSize: 9 },
      columnStyles: { 3: { cellWidth: 50 } },
    })
  }

  doc.setFontSize(8)
  doc.setTextColor(150)
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.text(
      `CareMetrics — Page ${i} of ${pages} — Generated ${format(new Date(), 'yyyy-MM-dd')}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  const rangeSlug = hasRange
    ? `${dateRange.startDate}_to_${dateRange.endDate}`
    : format(new Date(), 'yyyy-MM-dd')
  doc.save(`CareMetrics_Report_${rangeSlug}.pdf`)
}
