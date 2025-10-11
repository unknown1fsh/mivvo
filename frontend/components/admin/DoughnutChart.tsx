/**
 * Doughnut Chart Component
 * 
 * Chart.js ile halka grafik.
 */

'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DoughnutChartProps {
  labels: string[]
  data: number[]
  title?: string
  colors?: string[]
}

const defaultColors = [
  'rgb(59, 130, 246)', // blue
  'rgb(16, 185, 129)', // green
  'rgb(139, 92, 246)', // purple
  'rgb(251, 191, 36)', // yellow
  'rgb(239, 68, 68)', // red
  'rgb(99, 102, 241)', // indigo
]

export function DoughnutChart({
  labels,
  data,
  title,
  colors = defaultColors,
}: DoughnutChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title || '',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('rgb', 'rgba').replace(')', ', 0.8)')),
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Doughnut options={options} data={chartData} />
    </div>
  )
}

