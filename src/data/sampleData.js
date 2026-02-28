import { analyzeResults } from '../utils/mockAI'

export function seedSampleData(userId) {
  const now = new Date()

  const report1Date = new Date(now)
  report1Date.setMonth(report1Date.getMonth() - 6)
  const report2Date = new Date(now)
  report2Date.setMonth(report2Date.getMonth() - 3)
  const report3Date = new Date(now)
  report3Date.setMonth(report3Date.getMonth() - 1)

  const rawResults1 = [
    { name: 'Hemoglobin', value: 12.8, unit: 'g/dL' },
    { name: 'White Blood Cells', value: 6.5, unit: 'K/uL' },
    { name: 'Platelets', value: 220, unit: 'K/uL' },
    { name: 'Total Cholesterol', value: 230, unit: 'mg/dL' },
    { name: 'LDL Cholesterol', value: 145, unit: 'mg/dL' },
    { name: 'HDL Cholesterol', value: 48, unit: 'mg/dL' },
    { name: 'Triglycerides', value: 180, unit: 'mg/dL' },
    { name: 'Fasting Glucose', value: 108, unit: 'mg/dL' },
    { name: 'HbA1c', value: 6.1, unit: '%' },
    { name: 'Creatinine', value: 1.0, unit: 'mg/dL' },
    { name: 'eGFR', value: 78, unit: 'mL/min' },
    { name: 'TSH', value: 3.2, unit: 'mIU/L' },
    { name: 'Vitamin D', value: 22, unit: 'ng/mL' },
    { name: 'Vitamin B12', value: 310, unit: 'pg/mL' },
  ]

  const rawResults2 = [
    { name: 'Hemoglobin', value: 13.1, unit: 'g/dL' },
    { name: 'White Blood Cells', value: 7.0, unit: 'K/uL' },
    { name: 'Platelets', value: 235, unit: 'K/uL' },
    { name: 'Total Cholesterol', value: 215, unit: 'mg/dL' },
    { name: 'LDL Cholesterol', value: 128, unit: 'mg/dL' },
    { name: 'HDL Cholesterol', value: 52, unit: 'mg/dL' },
    { name: 'Triglycerides', value: 160, unit: 'mg/dL' },
    { name: 'Fasting Glucose', value: 102, unit: 'mg/dL' },
    { name: 'HbA1c', value: 5.8, unit: '%' },
    { name: 'Creatinine', value: 0.95, unit: 'mg/dL' },
    { name: 'eGFR', value: 82, unit: 'mL/min' },
    { name: 'TSH', value: 2.8, unit: 'mIU/L' },
    { name: 'Vitamin D', value: 28, unit: 'ng/mL' },
    { name: 'Vitamin B12', value: 350, unit: 'pg/mL' },
  ]

  const rawResults3 = [
    { name: 'Hemoglobin', value: 13.5, unit: 'g/dL' },
    { name: 'White Blood Cells', value: 6.8, unit: 'K/uL' },
    { name: 'Platelets', value: 248, unit: 'K/uL' },
    { name: 'Total Cholesterol', value: 205, unit: 'mg/dL' },
    { name: 'LDL Cholesterol', value: 118, unit: 'mg/dL' },
    { name: 'HDL Cholesterol', value: 55, unit: 'mg/dL' },
    { name: 'Triglycerides', value: 148, unit: 'mg/dL' },
    { name: 'Fasting Glucose', value: 96, unit: 'mg/dL' },
    { name: 'HbA1c', value: 5.6, unit: '%' },
    { name: 'Creatinine', value: 0.9, unit: 'mg/dL' },
    { name: 'eGFR', value: 88, unit: 'mL/min' },
    { name: 'TSH', value: 2.4, unit: 'mIU/L' },
    { name: 'Vitamin D', value: 35, unit: 'ng/mL' },
    { name: 'Vitamin B12', value: 420, unit: 'pg/mL' },
  ]

  const reports = [
    {
      id: crypto.randomUUID(),
      userId,
      fileName: 'bloodwork_jan.pdf',
      testDate: report1Date.toISOString().split('T')[0],
      labName: 'Quest Diagnostics',
      results: analyzeResults(rawResults1),
      createdAt: report1Date.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId,
      fileName: 'bloodwork_apr.pdf',
      testDate: report2Date.toISOString().split('T')[0],
      labName: 'Quest Diagnostics',
      results: analyzeResults(rawResults2),
      createdAt: report2Date.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId,
      fileName: 'bloodwork_jul.pdf',
      testDate: report3Date.toISOString().split('T')[0],
      labName: 'LabCorp',
      results: analyzeResults(rawResults3),
      createdAt: report3Date.toISOString(),
    },
  ]

  const medications = [
    { id: crypto.randomUUID(), userId, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', type: 'Medication', active: true, createdAt: report1Date.toISOString(), logs: generateLogs(90) },
    { id: crypto.randomUUID(), userId, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', type: 'Medication', active: true, createdAt: report1Date.toISOString(), logs: generateLogs(90) },
    { id: crypto.randomUUID(), userId, name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', type: 'Vitamin', active: true, createdAt: report2Date.toISOString(), logs: generateLogs(60) },
    { id: crypto.randomUUID(), userId, name: 'Fish Oil', dosage: '1000mg', frequency: 'Once daily', type: 'Supplement', active: true, createdAt: report2Date.toISOString(), logs: generateLogs(45) },
    { id: crypto.randomUUID(), userId, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', type: 'Medication', active: false, createdAt: report1Date.toISOString(), logs: [] },
  ]

  const symptoms = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    if (Math.random() > 0.4) {
      const possibleSymptoms = ['Fatigue', 'Joint Pain', 'Headache', 'Dizziness', 'Back Pain', 'Insomnia']
      const picked = possibleSymptoms.filter(() => Math.random() > 0.65)
      symptoms.push({
        id: crypto.randomUUID(),
        userId,
        date: d.toISOString().split('T')[0],
        symptoms: picked.length > 0 ? picked : ['Fatigue'],
        painLevel: Math.floor(Math.random() * 6) + 1,
        mood: ['good', 'okay', 'poor'][Math.floor(Math.random() * 3)],
        notes: i % 7 === 0 ? 'Felt tired after lunch' : '',
        createdAt: d.toISOString(),
      })
    }
  }

  localStorage.setItem('caremetrics_labs', JSON.stringify(reports.reverse()))
  localStorage.setItem('caremetrics_medications', JSON.stringify(medications))
  localStorage.setItem('caremetrics_symptoms', JSON.stringify(symptoms))
  localStorage.setItem('caremetrics_seeded', 'true')
}

function generateLogs(days) {
  const logs = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    if (Math.random() > 0.15) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      logs.push(d.toISOString().split('T')[0])
    }
  }
  return logs
}
