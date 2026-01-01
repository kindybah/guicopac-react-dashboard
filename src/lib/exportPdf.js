import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportNodeToPdf(node, filename = 'Guicopac-Scorecard.pdf') {
  if (!node) return
  const canvas = await html2canvas(node, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  let y = 0

  // multi-page if needed
  while (y < imgH) {
    pdf.addImage(img, 'PNG', 0, -y, imgW, imgH)
    y += pageH
    if (y < imgH) pdf.addPage()
  }

  pdf.save(filename)
}
