import React from 'react'

export interface EmailResult {
  id: string;
  date: string;
  sender: string;
  subject: string;
  attachment: string;
  status: 'ready' | 'warning' | 'error';
}

const index = () => {
  return (
    <div>index</div>
  )
}

export default index