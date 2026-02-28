import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

export function exportHealthSummary({ user, reports, medications, symptoms, insights }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(22)
  doc.setTextColor(27, 77, 122)
  doc.text('CareMetrics Health Summary', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Prepared for: ${user?.name || 'Patient'}`, 14, 32)
  doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 38)
  doc.text('Disclaimer: This report is for informational purposes only. Not a medical diagnosis.', 14, 44)

  doc.setDrawColor(200)
  doc.line(14, 48, pageWidth - 14, 48)

  let y = 56

  if (reports.length > 0) {
    const latest = reports[0]
    doc.setFontSize(16)
    doc.setTextColor(27, 77, 122)
    doc.text('Latest Lab Results', 14, y)
    y += 4

    const tableData = (latest.results || []).map(r => [
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
      const icon = insight.type === 'warning' ? '⚠' : insight.type === 'positive' ? '✓' : 'ℹ'
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

  if (symptoms.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(16)
    doc.setTextColor(27, 77, 122)
    doc.text('Recent Symptom Log', 14, y)
    y += 4

    const symptomData = symptoms.slice(0, 15).map(s => [
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

  doc.save(`CareMetrics_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}
