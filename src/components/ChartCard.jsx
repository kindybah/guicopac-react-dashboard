import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function ChartCard({ title, subtitle, config, actions }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new Chart(canvasRef.current, config)
    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [config])

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-extrabold">{title}</div>
          {subtitle ? <div className="text-sm text-slate-500 mt-1">{subtitle}</div> : null}
        </div>
        {actions ? <div className="no-print">{actions}</div> : null}
      </div>
      <div className="mt-3">
        <canvas ref={canvasRef} height="110" />
      </div>
    </div>
  )
}
