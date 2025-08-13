'use client'

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Plus, X, Target } from 'lucide-react'
import { PerformanceGoal } from './types'
import { GOAL_CATEGORIES } from './constants'
import { generateGoalId, determineGoalStatus } from './utils'

interface GoalManagementProps {
  goals: PerformanceGoal[]
  onGoalsChange: (goals: PerformanceGoal[]) => void
  readOnly?: boolean
}

export function GoalManagement({ goals, onGoalsChange, readOnly = false }: GoalManagementProps) {
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    targetDate: '',
    progress: 0
  })

  const addGoal = () => {
    if (newGoal.title && newGoal.category && newGoal.targetDate) {
      const goal: PerformanceGoal = {
        id: generateGoalId(),
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        targetDate: newGoal.targetDate,
        status: determineGoalStatus(newGoal.progress, newGoal.targetDate),
        progress: newGoal.progress,
        notes: ''
      }
      onGoalsChange([...goals, goal])
      setNewGoal({ title: '', description: '', category: '', targetDate: '', progress: 0 })
    }
  }

  const removeGoal = (goalId: string) => {
    onGoalsChange(goals.filter(g => g.id !== goalId))
  }

  const updateGoalProgress = (goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          progress,
          status: determineGoalStatus(progress, goal.targetDate)
        }
      }
      return goal
    })
    onGoalsChange(updatedGoals)
  }

  const getGoalStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case 'In Progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>
      case 'Overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'Not Started':
        return <Badge variant="secondary">Not Started</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5" />
          <h4 className="font-medium">Goals & Objectives</h4>
        </div>
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium">{goal.title}</h5>
                  {getGoalStatusBadge(goal.status)}
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>Category: {goal.category}</span>
                  <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No goals set for this review</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <h4 className="font-medium">Goals & Objectives</h4>
      </div>

      {/* Add New Goal */}
      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
        <h5 className="font-medium mb-3">Add New Goal</h5>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Goal Title *</Label>
              <Input
                placeholder="Enter goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the goal and success criteria"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Target Date *</Label>
              <Input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Initial Progress (%)</Label>
              <div className="px-3">
                <Slider
                  value={[newGoal.progress]}
                  onValueChange={(value) => setNewGoal({ ...newGoal, progress: value[0] })}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {newGoal.progress}%
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={addGoal} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Existing Goals */}
      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium">{goal.title}</h5>
              <div className="flex items-center gap-2">
                {getGoalStatusBadge(goal.status)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeGoal(goal.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {goal.description && (
              <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="px-3">
                <Slider
                  value={[goal.progress]}
                  onValueChange={(value) => updateGoalProgress(goal.id, value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <span>Category: {goal.category}</span>
              <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No goals added yet</p>
        )}
      </div>
    </div>
  )
}