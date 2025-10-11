/**
 * Bar Chart Component
 * 
 * Chart.js ile sütun grafiği.
 */

'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartProps {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor: string
    borderColor?: string
  }>
  title?: string
}

export function BarChart({ labels, datasets, title }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || '',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      borderWidth: 2,
      borderRadius: 4,
    })),
  }

  return (
    <div className="w-full h-full">
      <Bar options={options} data={data} />
    </div>
  )
}

