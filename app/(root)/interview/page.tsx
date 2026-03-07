import Agent from '@/components/Agent'
import React from 'react'

const page = () => {
  return (
    <div>
        <h3>Interview Generation</h3>

        <Agent userName="You" userId="user1" type="generate" />
    </div>
  )
}

export default page
