"use client"

import React from 'react'
import { AttendanceManagement } from '../components/attendance/AttendanceManagement'

const page = () => {
  return (
    <div>
      <AttendanceManagement userRole="Admin" />
    </div>
  )
}

export default page
