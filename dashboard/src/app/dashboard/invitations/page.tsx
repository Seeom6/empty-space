"use client"

import React from 'react'
import { InviteManagement } from '../components/invitations/InviteManagement'

const page = () => {

    const userRole = "Admin"


  return (
    <div>
      <InviteManagement userRole={userRole} />
    </div>
  )
}

export default page
