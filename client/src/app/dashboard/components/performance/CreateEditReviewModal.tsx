'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X } from 'lucide-react'
import { PerformanceReview, PerformanceGoal } from './types'
import { REVIEW_PERIODS, ACHIEVEMENT_TEMPLATES, IMPROVEMENT_AREA_TEMPLATES } from './constants'
import { generateReviewId, getDefaultNextReviewDate } from './utils'
import { GoalManagement } from './GoalManagement'
import { RatingComponent } from './RatingComponent'

interface CreateEditReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (review: Partial<PerformanceReview>) => void
  review?: PerformanceReview
  employees: Array<{ id: string; name: string; department: string }>
  evaluators: Array<{ id: string; name: string }>
}

interface ReviewForm {
  employeeId: string
  employeeName: string
  department: string
  evaluatorId: string
  evaluatorName: string
  reviewPeriod: string
  reviewDate: string
  overallRating: number
  goals: PerformanceGoal[]
  achievements: string[]
  feedback: string
  improvementAreas: string[]
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  nextReviewDate: string
}

export function CreateEditReviewModal({ 
  isOpen, 
  onClose, 
  onSave, 
  review, 
  employees,
  evaluators 
}: CreateEditReviewModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState<ReviewForm>({
    employeeId: '',
    employeeName: '',
    department: '',
    evaluatorId: '',
    evaluatorName: '',
    reviewPeriod: 'Q4 2024',
    reviewDate: new Date().toISOString().split('T')[0],
    overallRating: 3,
    goals: [],
    achievements: [''],
    feedback: '',
    improvementAreas: [''],
    status: 'Draft',
    nextReviewDate: getDefaultNextReviewDate()
  })

  const isEditing = !!review

  useEffect(() => {
    if (review) {
      setForm({
        employeeId: review.employeeId,
        employeeName: review.employeeName,
        department: review.department,
        evaluatorId: review.evaluatorId,
        evaluatorName: review.evaluatorName,
        reviewPeriod: review.reviewPeriod,
        reviewDate: review.reviewDate,
        overallRating: review.overallRating,
        goals: [...review.goals],
        achievements: review.achievements.length > 0 ? [...review.achievements] : [''],
        feedback: review.feedback,
        improvementAreas: review.improvementAreas.length > 0 ? [...review.improvementAreas] : [''],
        status: review.status,
        nextReviewDate: review.nextReviewDate || getDefaultNextReviewDate()
      })
    } else {
      setForm({
        employeeId: '',
        employeeName: '',
        department: '',
        evaluatorId: '',
        evaluatorName: '',
        reviewPeriod: 'Q4 2024',
        reviewDate: new Date().toISOString().split('T')[0],
        overallRating: 3,
        goals: [],
        achievements: [''],
        feedback: '',
        improvementAreas: [''],
        status: 'Draft',
        nextReviewDate: getDefaultNextReviewDate()
      })
    }
  }, [review])

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId)
    if (selectedEmployee) {
      setForm({
        ...form,
        employeeId,
        employeeName: selectedEmployee.name,
        department: selectedEmployee.department
      })
    }
  }

  const handleEvaluatorSelect = (evaluatorId: string) => {
    const selectedEvaluator = evaluators.find(evaluator => evaluator.id === evaluatorId)
    if (selectedEvaluator) {
      setForm({
        ...form,
        evaluatorId,
        evaluatorName: selectedEvaluator.name
      })
    }
  }

  const handleArrayFieldChange = (
    field: 'achievements' | 'improvementAreas',
    index: number,
    value: string
  ) => {
    const updatedArray = [...form[field]]
    updatedArray[index] = value
    setForm({ ...form, [field]: updatedArray })
  }

  const addArrayField = (field: 'achievements' | 'improvementAreas') => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  const removeArrayField = (field: 'achievements' | 'improvementAreas', index: number) => {
    if (form[field].length > 1) {
      const updatedArray = form[field].filter((_, i) => i !== index)
      setForm({ ...form, [field]: updatedArray })
    }
  }

  const addTemplateItem = (field: 'achievements' | 'improvementAreas') => {
    const templates = field === 'achievements' ? ACHIEVEMENT_TEMPLATES : IMPROVEMENT_AREA_TEMPLATES
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
    
    // Find first empty field or add new one
    const emptyIndex = form[field].findIndex(item => !item.trim())
    if (emptyIndex >= 0) {
      handleArrayFieldChange(field, emptyIndex, randomTemplate)
    } else {
      setForm({ ...form, [field]: [...form[field], randomTemplate] })
    }
  }

  const handleSubmit = () => {
    const reviewData: Partial<PerformanceReview> = {
      ...review,
      employeeId: form.employeeId,
      employeeName: form.employeeName,
      department: form.department,
      evaluatorId: form.evaluatorId,
      evaluatorName: form.evaluatorName,
      reviewPeriod: form.reviewPeriod,
      reviewDate: form.reviewDate,
      overallRating: form.overallRating,
      goals: form.goals,
      achievements: form.achievements.filter(a => a.trim()),
      feedback: form.feedback,
      improvementAreas: form.improvementAreas.filter(a => a.trim()),
      status: form.status,
      nextReviewDate: form.nextReviewDate || undefined
    }

    if (!isEditing) {
      reviewData.id = generateReviewId(form.employeeId, form.reviewPeriod)
    }

    onSave(reviewData)
    onClose()
  }

  const isFormValid = () => {
    return form.employeeId && form.evaluatorId && form.reviewPeriod && form.reviewDate && form.feedback.trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Performance Review' : 'Create Performance Review'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the performance review details.' : 'Create a comprehensive performance review for the employee.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee *</Label>
                    <Select 
                      value={form.employeeId} 
                      onValueChange={handleEmployeeSelect}
                      disabled={isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="evaluator">Evaluator *</Label>
                    <Select value={form.evaluatorId} onValueChange={handleEvaluatorSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select evaluator" />
                      </SelectTrigger>
                      <SelectContent>
                        {evaluators.map(evaluator => (
                          <SelectItem key={evaluator.id} value={evaluator.id}>
                            {evaluator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewPeriod">Review Period *</Label>
                    <Select value={form.reviewPeriod} onValueChange={(value) => setForm({ ...form, reviewPeriod: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REVIEW_PERIODS.map((period: string) => (
                          <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewDate">Review Date *</Label>
                    <Input
                      id="reviewDate"
                      type="date"
                      value={form.reviewDate}
                      onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextReviewDate">Next Review Date</Label>
                    <Input
                      id="nextReviewDate"
                      type="date"
                      value={form.nextReviewDate}
                      onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Review Status</Label>
                  <Select value={form.status} onValueChange={(value: any) => setForm({ ...form, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rating" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingComponent
                  rating={form.overallRating}
                  onRatingChange={(rating) => setForm({ ...form, overallRating: rating })}
                  size="lg"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4 mt-6">
            <GoalManagement
              goals={form.goals}
              onGoalsChange={(goals) => setForm({ ...form, goals })}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-6">
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Achievements</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTemplateItem('achievements')}
                    >
                      Add Example
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder="Describe a key achievement..."
                        value={achievement}
                        onChange={(e) => handleArrayFieldChange('achievements', index, e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayField('achievements')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {form.achievements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayField('achievements', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Feedback *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Provide comprehensive feedback on the employee's performance..."
                    value={form.feedback}
                    onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Improvement Areas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Areas for Improvement</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTemplateItem('improvementAreas')}
                    >
                      Add Example
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.improvementAreas.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder="Describe an area for improvement..."
                        value={area}
                        onChange={(e) => handleArrayFieldChange('improvementAreas', index, e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayField('improvementAreas')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {form.improvementAreas.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayField('improvementAreas', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            {isEditing ? 'Update Review' : 'Create Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}