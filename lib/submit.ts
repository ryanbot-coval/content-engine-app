export interface TopicPayload {
  persona_name: string
  title: string
  intent: string
  audience: string
  keywords: string
  constraints: string
  campaign_start_date: string
  campaign_end_date: string
  posts_per_week: number
  seed_links: string
  include_demo: boolean
  priority: string
}

export async function submitTopic(data: TopicPayload): Promise<void> {
  const url = process.env.NEXT_PUBLIC_WEBHOOK_URL
  if (!url) throw new Error('NEXT_PUBLIC_WEBHOOK_URL is not configured')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    let message = `Submission failed (${res.status})`
    try {
      const err = await res.json()
      message = err.errors?.join(', ') || err.message || message
    } catch {
      // use default message
    }
    throw new Error(message)
  }
}
