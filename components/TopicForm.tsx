'use client'

import { useState } from 'react'
import { submitTopic, type TopicPayload } from '@/lib/submit'

const PROFILES = (process.env.NEXT_PUBLIC_PROFILES || 'Blake,Chris,Ryan')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean)

const defaultForm: TopicPayload = {
  persona_name: '',
  title: '',
  intent: 'awareness',
  audience: '',
  keywords: '',
  constraints: '',
  campaign_start_date: '',
  campaign_end_date: '',
  posts_per_week: 2,
  seed_links: '',
  include_demo: false,
  priority: 'medium',
}

interface Props {
  onSuccess: (title: string) => void
}

export default function TopicForm({ onSuccess }: Props) {
  const [form, setForm] = useState<TopicPayload>(defaultForm)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Content Engine'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || ''

  function update<K extends keyof TopicPayload>(key: K, value: TopicPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!form.persona_name) {
      setErrorMsg('Please select your profile.')
      return
    }
    if (!form.title.trim()) {
      setErrorMsg('Topic title is required.')
      return
    }

    setStatus('submitting')
    try {
      await submitTopic(form)
      onSuccess(form.title)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-5 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {logoUrl && (
            <img src={logoUrl} alt={companyName} className="h-7 w-auto object-contain" />
          )}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
              {companyName}
            </p>
            <h1 className="text-base font-semibold leading-tight">Content Engine</h1>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900">Submit a Topic</h2>
          <p className="text-slate-500 text-sm mt-1">
            Your bundle will be ready in about 2 minutes. You&apos;ll get an email when it&apos;s done.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Profile ──────────────────────────────────────── */}
          <Card title="Your Profile">
            <Field label="Select Your Profile" required>
              <select
                value={form.persona_name}
                onChange={(e) => update('persona_name', e.target.value)}
                className={selectCls}
              >
                <option value="">Choose a profile...</option>
                {PROFILES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </Card>

          {/* ── Topic ────────────────────────────────────────── */}
          <Card title="Topic">
            <Field label="Topic Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Why PLG companies outperform SLG in enterprise deals"
                className={inputCls}
              />
            </Field>

            <Field label="Intent / Goal">
              <select
                value={form.intent}
                onChange={(e) => update('intent', e.target.value)}
                className={selectCls}
              >
                <option value="awareness">Awareness — introduce a concept or trend</option>
                <option value="consideration">
                  Consideration — compare approaches, show nuance
                </option>
                <option value="decision">Decision — drive a specific action or POV</option>
              </select>
            </Field>

            <Field label="Target Audience">
              <input
                type="text"
                value={form.audience}
                onChange={(e) => update('audience', e.target.value)}
                placeholder="e.g. B2B SaaS founders, Series A–C"
                className={inputCls}
              />
            </Field>

            <Field label="Keywords">
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => update('keywords', e.target.value)}
                placeholder="e.g. PLG, enterprise, product-led growth, ARR"
                className={inputCls}
              />
            </Field>

            <Field label="Constraints" hint="Angles or framings to avoid">
              <textarea
                value={form.constraints}
                onChange={(e) => update('constraints', e.target.value)}
                placeholder="e.g. Don't mention competitor X. Avoid the 'founder-led sales' narrative."
                className={textareaCls}
                rows={3}
              />
            </Field>
          </Card>

          {/* ── Campaign ─────────────────────────────────────── */}
          <Card title="Campaign">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date">
                <input
                  type="date"
                  value={form.campaign_start_date}
                  onChange={(e) => update('campaign_start_date', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="End Date" hint="optional">
                <input
                  type="date"
                  value={form.campaign_end_date}
                  onChange={(e) => update('campaign_end_date', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label={`Posts per week — ${form.posts_per_week}`}>
              <input
                type="range"
                min={1}
                max={5}
                value={form.posts_per_week}
                onChange={(e) => update('posts_per_week', parseInt(e.target.value))}
                className="w-full accent-indigo-600 mt-1"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </Field>
          </Card>

          {/* ── Extra ────────────────────────────────────────── */}
          <Card title="Extra">
            <Field label="Seed Links" hint="one URL per line">
              <textarea
                value={form.seed_links}
                onChange={(e) => update('seed_links', e.target.value)}
                placeholder={`https://example.com/article\nhttps://example.com/report`}
                className={textareaCls}
                rows={3}
              />
            </Field>

            <Field label="Priority">
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => update('priority', p)}
                    className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors capitalize ${
                      form.priority === p
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.include_demo}
                onChange={(e) => update('include_demo', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700 select-none group-hover:text-slate-900">
                Include demo package{' '}
                <span className="text-slate-400 font-normal">
                  — generates an extra demo-format artifact
                </span>
              </span>
            </label>
          </Card>

          {/* ── Error ────────────────────────────────────────── */}
          {errorMsg && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* ── Submit ───────────────────────────────────────── */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Topic →'}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-slate-400">{companyName} Content Engine</p>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const selectCls =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const textareaCls =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none'
