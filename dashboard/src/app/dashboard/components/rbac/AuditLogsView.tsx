'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, History, Download, Filter, User, Shield, Settings } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { mockAuditLogs } from './mockData'
import { AuditLog } from './types'

interface AuditLogsViewProps {
  userRole: string
}

export function AuditLogsView({ userRole }: AuditLogsViewProps) {
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterTargetType, setFilterTargetType] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesTarget = filterTargetType === 'all' || log.targetType === filterTargetType
    return matchesSearch && matchesAction && matchesTarget
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_ROLE':
        return <Shield className="h-4 w-4 text-green-500" />
      case 'UPDATE_ROLE':
        return <Settings className="h-4 w-4 text-blue-500" />
      case 'DELETE_ROLE':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'ASSIGN_ROLE':
        return <User className="h-4 w-4 text-green-500" />
      case 'REVOKE_ROLE':
        return <User className="h-4 w-4 text-red-500" />
      case 'UPDATE_PERMISSIONS':
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return <History className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE_ROLE':
      case 'ASSIGN_ROLE':
        return 'default'
      case 'UPDATE_ROLE':
      case 'UPDATE_PERMISSIONS':
        return 'secondary'
      case 'DELETE_ROLE':
      case 'REVOKE_ROLE':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatActionName = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const exportLogs = () => {
    // Mock export functionality
    alert('Audit logs exported successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Audit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.targetType === 'ROLE').length}
            </div>
            <p className="text-xs text-muted-foreground">Role modifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              User Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.targetType === 'USER').length}
            </div>
            <p className="text-xs text-muted-foreground">User assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <Button onClick={exportLogs} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE_ROLE">Create Role</SelectItem>
                <SelectItem value="UPDATE_ROLE">Update Role</SelectItem>
                <SelectItem value="DELETE_ROLE">Delete Role</SelectItem>
                <SelectItem value="ASSIGN_ROLE">Assign Role</SelectItem>
                <SelectItem value="REVOKE_ROLE">Revoke Role</SelectItem>
                <SelectItem value="UPDATE_PERMISSIONS">Update Permissions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTargetType} onValueChange={setFilterTargetType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ROLE">Role</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="PERMISSION">Permission</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Audit Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {formatActionName(log.action)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.targetName}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.targetType.toLowerCase()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{log.performedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.performedAt), 'MMM dd, yyyy')}
                        <div className="text-muted-foreground">
                          {format(new Date(log.performedAt), 'HH:mm:ss')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{log.details}</p>
                        {log.oldValue && log.newValue && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>From: {log.oldValue}</div>
                            <div>To: {log.newValue}</div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}