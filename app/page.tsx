'use client'

import { useState } from 'react'
import TopicForm from '@/components/TopicForm'
import ConfirmationView from '@/components/ConfirmationView'

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedTitle, setSubmittedTitle] = useState('')

  return submitted ? (
    <ConfirmationView
      topicTitle={submittedTitle}
      onReset={() => {
        setSubmitted(false)
        setSubmittedTitle('')
      }}
    />
  ) : (
    <TopicForm
      onSuccess={(title) => {
        setSubmittedTitle(title)
        setSubmitted(true)
      }}
    />
  )
}
