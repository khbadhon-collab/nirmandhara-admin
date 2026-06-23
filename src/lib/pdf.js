import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function downloadPDF(elementId, filename = 'invoice.pdf') {
  const el = document.getElementById(elementId)
  if (!el) return
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let position = 0
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  } else {
    let remaining = imgHeight
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      remaining -= pageHeight
      position -= pageHeight
      if (remaining > 0) pdf.addPage()
    }
  }
  pdf.save(filename)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2 }).format(amount || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function generateInvoiceNo(prefix = 'ND') {
  const now = new Date()
  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const r = Math.floor(Math.random() * 9000 + 1000)
  return `${prefix}-${y}${m}-${r}`
}
