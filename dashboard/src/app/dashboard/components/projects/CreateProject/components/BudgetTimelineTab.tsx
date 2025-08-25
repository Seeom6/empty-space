import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

import { ProjectFormData } from '../types'

interface BudgetTimelineTabProps {
  formData: ProjectFormData
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>
  isStartDateOpen: boolean
  setIsStartDateOpen: (open: boolean) => void
  isEndDateOpen: boolean
  setIsEndDateOpen: (open: boolean) => void
  isDeadlineOpen: boolean
  setIsDeadlineOpen: (open: boolean) => void
  mode: 'create' | 'edit'
}

export function BudgetTimelineTab({
  formData,
  setFormData,
  isStartDateOpen,
  setIsStartDateOpen,
  isEndDateOpen,
  setIsEndDateOpen,
  isDeadlineOpen,
  setIsDeadlineOpen,
  mode
}: BudgetTimelineTabProps) {
  return (
    <>
      {/* Dates Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.startDate.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, startDate: date }))
                    setIsStartDateOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.endDate.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, endDate: date }))
                    setIsEndDateOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Deadline</Label>
          <Popover open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {formData.deadline.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.deadline}
                onSelect={(date) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, deadline: date }))
                    setIsDeadlineOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Budget Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {mode === 'edit' && (
          <div className="space-y-2">
            <Label htmlFor="actualSpent">Actual Spent</Label>
            <Input
              id="actualSpent"
              type="number"
              min="0"
              value={formData.actualSpent}
              onChange={(e) => setFormData(prev => ({ ...prev, actualSpent: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>
        )}
      </div>
    </>
  )
}
