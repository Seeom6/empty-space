'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, FileText, Save, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { ReportBuilderProps } from './types'
import { ReportCard } from './components'
import { useReportBuilder } from './hooks'
import { canPerformAction, formatDateRange } from './utils'

export function ReportBuilder({ userRole }: ReportBuilderProps) {
  const [activeTab, setActiveTab] = useState('builder')

  const {
    reportName,
    reportDescription,
    selectedModule,
    selectedFields,
    dateRange,
    savedReports,
    availableModules,
    isLoading,
    error,
    actions
  } = useReportBuilder(userRole)

  // Get available fields for selected module
  const availableFields = availableModules
    .find(module => module.id === selectedModule)?.fields || []

  const canCreateReports = canPerformAction(userRole, 'canCreateReports')
  const canManageReports = canPerformAction(userRole, 'canManageReports')

  if (!canCreateReports) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to create reports.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Report Builder</h2>
        <p className="text-muted-foreground">
          Create custom reports and manage saved templates
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    placeholder="Enter report name"
                    value={reportName}
                    onChange={(e) => actions.setReportName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportDescription">Description</Label>
                  <Textarea
                    id="reportDescription"
                    placeholder="Enter report description"
                    value={reportDescription}
                    onChange={(e) => actions.setReportDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select value={selectedModule} onValueChange={actions.setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModules.map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRange(dateRange.from, dateRange.to)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range: DateRange | undefined) => actions.setDateRange(range ? { from: range.from, to: range.to } : { from: undefined, to: undefined })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Field Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Field Selection</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select the fields to include in your report
                </p>
              </CardHeader>
              <CardContent>
                {selectedModule ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {availableFields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => actions.toggleField(field.id)}
                        />
                        <Label htmlFor={field.id} className="text-sm">
                          {field.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {field.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Select a module to see available fields
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedFields.length} fields selected
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={actions.saveReport}
                    disabled={isLoading || !reportName || !selectedModule || selectedFields.length === 0}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Template
                  </Button>
                  <Button
                    onClick={actions.generateReport}
                    disabled={isLoading || !reportName || !selectedModule || selectedFields.length === 0}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Saved Reports</h3>
              <p className="text-sm text-muted-foreground">
                Manage your saved report templates
              </p>
            </div>
            <Badge variant="outline">
              {savedReports.length} reports
            </Badge>
          </div>

          {savedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onRun={actions.runReport}
                  onDelete={canManageReports ? actions.deleteReport : undefined}
                  canDelete={canManageReports}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No saved reports</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first report template to get started.
                </p>
                <Button onClick={() => setActiveTab('builder')}>
                  Create Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}