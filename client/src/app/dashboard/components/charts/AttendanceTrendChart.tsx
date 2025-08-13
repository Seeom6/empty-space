import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { date: 'Mon', present: 85, late: 8, absent: 7 },
  { date: 'Tue', present: 88, late: 6, absent: 6 },
  { date: 'Wed', present: 82, late: 10, absent: 8 },
  { date: 'Thu', present: 90, late: 5, absent: 5 },
  { date: 'Fri', present: 87, late: 7, absent: 6 },
  { date: 'Sat', present: 45, late: 2, absent: 3 },
  { date: 'Sun', present: 42, late: 1, absent: 2 },
]

export function AttendanceTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
            <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}