"use client"
import React from "react"
import { TechnologiesManagement } from "../components/technologies/TechnologiesManagement"

const page = ( ) =>{
  const userRole = "Admin"

  return (
    <div>
      <TechnologiesManagement userRole={userRole} />
    </div>
  )
}

export default page