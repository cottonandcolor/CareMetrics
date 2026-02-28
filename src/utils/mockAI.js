const REFERENCE_RANGES = {
  'Hemoglobin': { min: 12.0, max: 17.5, unit: 'g/dL', category: 'Blood Count' },
  'White Blood Cells': { min: 4.0, max: 11.0, unit: 'K/uL', category: 'Blood Count' },
  'Red Blood Cells': { min: 4.0, max: 5.8, unit: 'M/uL', category: 'Blood Count' },
  'Platelets': { min: 150, max: 400, unit: 'K/uL', category: 'Blood Count' },
  'Hematocrit': { min: 36, max: 52, unit: '%', category: 'Blood Count' },
  'Total Cholesterol': { min: 0, max: 200, unit: 'mg/dL', category: 'Lipid Panel' },
  'LDL Cholesterol': { min: 0, max: 100, unit: 'mg/dL', category: 'Lipid Panel' },
  'HDL Cholesterol': { min: 40, max: 90, unit: 'mg/dL', category: 'Lipid Panel' },
  'Triglycerides': { min: 0, max: 150, unit: 'mg/dL', category: 'Lipid Panel' },
  'Fasting Glucose': { min: 70, max: 100, unit: 'mg/dL', category: 'Metabolic' },
  'HbA1c': { min: 4.0, max: 5.7, unit: '%', category: 'Metabolic' },
  'Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', category: 'Kidney' },
  'BUN': { min: 7, max: 20, unit: 'mg/dL', category: 'Kidney' },
  'eGFR': { min: 60, max: 120, unit: 'mL/min', category: 'Kidney' },
  'ALT': { min: 7, max: 56, unit: 'U/L', category: 'Liver' },
  'AST': { min: 10, max: 40, unit: 'U/L', category: 'Liver' },
  'TSH': { min: 0.4, max: 4.0, unit: 'mIU/L', category: 'Thyroid' },
  'Vitamin D': { min: 30, max: 100, unit: 'ng/mL', category: 'Vitamins' },
  'Vitamin B12': { min: 200, max: 900, unit: 'pg/mL', category: 'Vitamins' },
  'Iron': { min: 60, max: 170, unit: 'mcg/dL', category: 'Minerals' },
  'Calcium': { min: 8.5, max: 10.5, unit: 'mg/dL', category: 'Minerals' },
  'Sodium': { min: 136, max: 145, unit: 'mEq/L', category: 'Electrolytes' },
  'Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', category: 'Electrolytes' },
  'CRP': { min: 0, max: 3.0, unit: 'mg/L', category: 'Inflammation' },
  'ESR': { min: 0, max: 20, unit: 'mm/hr', category: 'Inflammation' },
}

function getStatus(name, value) {
  const ref = REFERENCE_RANGES[name]
  if (!ref) return 'normal'
  if (value < ref.min) return 'low'
  if (value > ref.max) return 'high'
  return 'normal'
}

function getExplanation(name, value, status) {
  const explanations = {
    'Hemoglobin': {
      low: 'Your hemoglobin is below normal, which may indicate anemia. This can cause tiredness and weakness. Please discuss with your doctor.',
      high: 'Your hemoglobin is elevated. This could be due to dehydration or other conditions. Your doctor can help determine the cause.',
      normal: 'Your hemoglobin level is healthy, meaning your blood is carrying oxygen well.',
    },
    'Total Cholesterol': {
      low: 'Your cholesterol is very low. While often good, extremely low cholesterol should be discussed with your doctor.',
      high: 'Your cholesterol is elevated. Consider heart-healthy dietary changes and discuss treatment options with your doctor.',
      normal: 'Your cholesterol is in a healthy range. Keep up the good work with diet and exercise!',
    },
    'LDL Cholesterol': {
      high: 'Your LDL ("bad") cholesterol is elevated. This increases heart disease risk. Diet changes and possibly medication may help.',
      normal: 'Your LDL cholesterol is in a good range. This is positive for your heart health.',
    },
    'HDL Cholesterol': {
      low: 'Your HDL ("good") cholesterol is low. Exercise and healthy fats can help raise it.',
      normal: 'Your HDL cholesterol is healthy. This helps protect against heart disease.',
      high: 'Your HDL cholesterol is high — this is generally very good for heart health.',
    },
    'Fasting Glucose': {
      high: 'Your blood sugar is elevated. This may indicate pre-diabetes or diabetes. Follow up with your doctor is important.',
      low: 'Your blood sugar is low. This can cause dizziness and weakness. Make sure you\'re eating regular meals.',
      normal: 'Your blood sugar is in a healthy range. Keep maintaining good eating habits.',
    },
    'HbA1c': {
      high: 'Your HbA1c is elevated, suggesting your average blood sugar over the past 2-3 months has been high. Discuss management strategies with your doctor.',
      normal: 'Your HbA1c is in the normal range, indicating good blood sugar control over the past few months.',
    },
    'Creatinine': {
      high: 'Your creatinine is elevated, which may indicate your kidneys aren\'t filtering as well as they should. Follow up with your doctor.',
      normal: 'Your creatinine is normal, suggesting your kidneys are functioning well.',
    },
    'TSH': {
      high: 'Your TSH is elevated, which may suggest an underactive thyroid (hypothyroidism). This can cause fatigue and weight gain.',
      low: 'Your TSH is low, which may suggest an overactive thyroid (hyperthyroidism). This can cause weight loss and anxiety.',
      normal: 'Your thyroid function appears normal based on your TSH level.',
    },
    'Vitamin D': {
      low: 'Your Vitamin D is low. This is common and can affect bone health and immune function. Supplements may help.',
      normal: 'Your Vitamin D level is healthy. Keep getting adequate sunlight and dietary sources.',
      high: 'Your Vitamin D is quite high. While rare, very high levels can cause issues. Discuss with your doctor.',
    },
    'Vitamin B12': {
      low: 'Your Vitamin B12 is low. This can cause fatigue, weakness, and nerve problems. B12 supplements or injections may help.',
      normal: 'Your Vitamin B12 level is healthy.',
    },
  }

  const specific = explanations[name]?.[status]
  if (specific) return specific

  if (status === 'high') return `Your ${name} is above the normal range. Please discuss this result with your doctor.`
  if (status === 'low') return `Your ${name} is below the normal range. Please discuss this result with your doctor.`
  return `Your ${name} is within the normal range. This is a good sign.`
}

export function simulateOCRExtraction(fileName) {
  const sampleSets = [
    [
      { name: 'Hemoglobin', value: 13.2, unit: 'g/dL' },
      { name: 'White Blood Cells', value: 7.5, unit: 'K/uL' },
      { name: 'Red Blood Cells', value: 4.8, unit: 'M/uL' },
      { name: 'Platelets', value: 245, unit: 'K/uL' },
      { name: 'Hematocrit', value: 41, unit: '%' },
      { name: 'Total Cholesterol', value: 218, unit: 'mg/dL' },
      { name: 'LDL Cholesterol', value: 132, unit: 'mg/dL' },
      { name: 'HDL Cholesterol', value: 52, unit: 'mg/dL' },
      { name: 'Triglycerides', value: 165, unit: 'mg/dL' },
      { name: 'Fasting Glucose', value: 105, unit: 'mg/dL' },
      { name: 'HbA1c', value: 5.9, unit: '%' },
      { name: 'Creatinine', value: 0.9, unit: 'mg/dL' },
      { name: 'BUN', value: 15, unit: 'mg/dL' },
      { name: 'eGFR', value: 85, unit: 'mL/min' },
      { name: 'ALT', value: 28, unit: 'U/L' },
      { name: 'AST', value: 22, unit: 'U/L' },
      { name: 'TSH', value: 2.5, unit: 'mIU/L' },
      { name: 'Vitamin D', value: 24, unit: 'ng/mL' },
      { name: 'Vitamin B12', value: 380, unit: 'pg/mL' },
      { name: 'Calcium', value: 9.4, unit: 'mg/dL' },
      { name: 'Sodium', value: 140, unit: 'mEq/L' },
      { name: 'Potassium', value: 4.2, unit: 'mEq/L' },
    ],
    [
      { name: 'Hemoglobin', value: 11.5, unit: 'g/dL' },
      { name: 'White Blood Cells', value: 6.8, unit: 'K/uL' },
      { name: 'Platelets', value: 198, unit: 'K/uL' },
      { name: 'Total Cholesterol', value: 195, unit: 'mg/dL' },
      { name: 'LDL Cholesterol', value: 110, unit: 'mg/dL' },
      { name: 'HDL Cholesterol', value: 55, unit: 'mg/dL' },
      { name: 'Triglycerides', value: 140, unit: 'mg/dL' },
      { name: 'Fasting Glucose', value: 92, unit: 'mg/dL' },
      { name: 'HbA1c', value: 5.4, unit: '%' },
      { name: 'Creatinine', value: 1.3, unit: 'mg/dL' },
      { name: 'eGFR', value: 58, unit: 'mL/min' },
      { name: 'TSH', value: 4.8, unit: 'mIU/L' },
      { name: 'Vitamin D', value: 18, unit: 'ng/mL' },
      { name: 'Iron', value: 45, unit: 'mcg/dL' },
      { name: 'CRP', value: 4.2, unit: 'mg/L' },
    ],
    [
      { name: 'Hemoglobin', value: 14.8, unit: 'g/dL' },
      { name: 'White Blood Cells', value: 5.2, unit: 'K/uL' },
      { name: 'Platelets', value: 310, unit: 'K/uL' },
      { name: 'Total Cholesterol', value: 180, unit: 'mg/dL' },
      { name: 'LDL Cholesterol', value: 88, unit: 'mg/dL' },
      { name: 'HDL Cholesterol', value: 62, unit: 'mg/dL' },
      { name: 'Fasting Glucose', value: 88, unit: 'mg/dL' },
      { name: 'HbA1c', value: 5.2, unit: '%' },
      { name: 'Creatinine', value: 0.8, unit: 'mg/dL' },
      { name: 'eGFR', value: 95, unit: 'mL/min' },
      { name: 'TSH', value: 1.8, unit: 'mIU/L' },
      { name: 'Vitamin D', value: 42, unit: 'ng/mL' },
      { name: 'Vitamin B12', value: 520, unit: 'pg/mL' },
      { name: 'Calcium', value: 9.8, unit: 'mg/dL' },
    ],
  ]

  const setIndex = Math.floor(Math.random() * sampleSets.length)
  return sampleSets[setIndex]
}

export function analyzeResults(results) {
  return results.map(r => {
    const ref = REFERENCE_RANGES[r.name]
    const status = getStatus(r.name, r.value)
    return {
      ...r,
      status,
      category: ref?.category || 'Other',
      referenceRange: ref ? `${ref.min}–${ref.max}` : 'N/A',
      explanation: getExplanation(r.name, r.value, status),
    }
  })
}

export function generateInsights(reports, symptoms) {
  const insights = []

  if (reports.length >= 2) {
    const latest = reports[0]
    const previous = reports[1]

    const latestMap = Object.fromEntries((latest.results || []).map(r => [r.name, r]))
    const prevMap = Object.fromEntries((previous.results || []).map(r => [r.name, r]))

    for (const [name, curr] of Object.entries(latestMap)) {
      const prev = prevMap[name]
      if (!prev) continue
      const change = ((curr.value - prev.value) / prev.value) * 100

      if (Math.abs(change) > 10) {
        const direction = change > 0 ? 'increased' : 'decreased'
        const ref = REFERENCE_RANGES[name]
        const isWorrying = ref && (
          (change > 0 && curr.value > ref.max) ||
          (change < 0 && curr.value < ref.min)
        )

        insights.push({
          type: isWorrying ? 'warning' : 'info',
          metric: name,
          message: `${name} has ${direction} by ${Math.abs(change).toFixed(1)}% since your last test.`,
          suggestion: isWorrying
            ? `Consider discussing your ${name} levels with your doctor at your next visit.`
            : `Your ${name} change is within a reasonable range, but keep monitoring.`,
        })
      }
    }

    for (const r of latest.results || []) {
      if (r.status === 'high' || r.status === 'low') {
        const existing = insights.find(i => i.metric === r.name)
        if (!existing) {
          insights.push({
            type: 'warning',
            metric: r.name,
            message: `${r.name} is ${r.status === 'high' ? 'above' : 'below'} the normal range.`,
            suggestion: `Ask your doctor about your ${r.name} at your next appointment.`,
          })
        }
      }
    }
  }

  if (symptoms && symptoms.length > 0) {
    const recentSymptoms = symptoms.slice(0, 14)
    const fatigueCount = recentSymptoms.filter(s => (s.symptoms || []).includes('Fatigue')).length
    if (fatigueCount >= 5) {
      insights.push({
        type: 'info',
        metric: 'Symptoms',
        message: 'You\'ve reported fatigue frequently in the past two weeks.',
        suggestion: 'Frequent fatigue could be related to vitamin levels (D, B12, Iron) or thyroid function. Consider mentioning this to your doctor.',
      })
    }

    const avgPain = recentSymptoms.reduce((sum, s) => sum + (s.painLevel || 0), 0) / (recentSymptoms.length || 1)
    if (avgPain > 5) {
      insights.push({
        type: 'warning',
        metric: 'Pain Level',
        message: `Your average pain level over recent entries is ${avgPain.toFixed(1)} out of 10.`,
        suggestion: 'High pain levels should be discussed with your healthcare provider.',
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'positive',
      metric: 'Overall',
      message: 'Your recent results look stable.',
      suggestion: 'Keep up your healthy habits and continue regular check-ups.',
    })
  }

  return insights
}

export { REFERENCE_RANGES }
