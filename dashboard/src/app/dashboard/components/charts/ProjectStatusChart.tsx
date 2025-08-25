import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { status: 'Planning', count: 8, color: '#f59e0b' },
  { status: 'In Progress', count: 15, color: '#3b82f6' },
  { status: 'Completed', count: 22, color: '#10b981' },
  { status: 'On Hold', count: 3, color: '#ef4444' },
]

export function ProjectStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}