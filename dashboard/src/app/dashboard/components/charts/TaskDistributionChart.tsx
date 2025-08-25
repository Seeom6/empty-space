import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { name: 'To Do', value: 24, color: '#f59e0b' },
  { name: 'In Progress', value: 18, color: '#3b82f6' },
  { name: 'Review', value: 12, color: '#8b5cf6' },
  { name: 'Completed', value: 35, color: '#10b981' },
]

export function TaskDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent || 5 * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}