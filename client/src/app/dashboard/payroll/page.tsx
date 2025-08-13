"use client"

import React, { useState } from "react"

import { PayrollManagement } from "../components/payroll/PayrollManagement"


const page = () => {

    const userRole = "Admin"

  return (
    <div>
      <PayrollManagement userRole={userRole} />
    </div>
  )
}   

export default page