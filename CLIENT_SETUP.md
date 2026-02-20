# Content Engine — Client Configuration Guide

Use this document when deploying the Content Engine for a new client. There are two sides to configure: the **mini app** (this repo) and the **n8n backend** (separate setup).

---

## Prerequisites

Before starting, the client needs:

- An **n8n Cloud account** (or self-hosted n8n instance)
- A **Google Workspace account** with access to Sheets, Docs, and Gmail
- A **Perplexity API account** (for research — [perplexity.ai](https://perplexity.ai))
- A **Vercel account** (free tier is fine)

---

## Part 1 — n8n Backend Setup

### 1. Import the Workflows

Import both workflows into the client's n8n instance:

| Workflow | File | Webhook Path |
|----------|------|--------------|
| Topic Intake v2 | `workflow-intake.json` | `/webhook/content/new-v2` |
| Generate Bundle | `workflow-bundle.json` | `/webhook/content/generate` |

### 2. Create Credentials

Create each of the following in the n8n UI (**Settings → Credentials → New**):

| Credential Name | Type | Notes |
|-----------------|------|-------|
| `[Client] Google Sheets` | `Google Sheets OAuth2 API` | Used by both workflows |
| `[Client] Google Docs` | `Google Docs OAuth2 API` | Separate from Sheets — must be its own credential |
| `[Client] Gmail` | `Gmail OAuth2` | Used for bundle delivery emails |
| `[Client] Google Calendar` | `Google Calendar OAuth2 API` | Assign to "Create Calendar Events" node |
| `[Client] Google Tasks` | `Google Tasks OAuth2 API` | Assign to "Create Google Tasks" node |
| `[Client] OpenAI` | `OpenAI API` | Source Pack + Drafts + Critique AI calls |
| `[Client] Perplexity` | `Perplexity API` | Research node |

> **Note**: Google Docs and Google Sheets are different credential types even though both use OAuth. Create them separately.

### 3. Set Up Google Sheet

Create a new Google Sheet for the client. Add these tabs:

- `config` — key/value/notes (see values below)
- `topics` — column headers listed in the data model
- `personas` — voice profiles (one row per team member who will use the system)
- `artifacts` — stores generated drafts
- `source_packs` — stores research output

**Copy the Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

This is the **only hard-coded value** in the workflows — update it in the `Read Config` and `Read Topics` nodes in both workflows.

### 4. Populate the Config Tab

The `config` tab drives all dynamic behavior. Columns: `key`, `value`, `notes`.

| key | value | notes |
|-----|-------|-------|
| `doc_folder_id` | Google Drive folder ID | Right-click folder in Drive → Get link → extract ID |
| `webhook_generate_url` | `https://[instance].app.n8n.cloud/webhook/content/generate` | Internal trigger URL — must match actual n8n instance |
| `notification_email` | `team@client.com` | Email address(es) for bundle delivery notifications |
| `company_name` | `Acme Corp` | Used in email branding and AI prompts |
| `openai_model` | `gpt-4o-mini` | Or `gpt-4o` for higher quality |
| `perplexity_model` | `sonar` | Or `sonar-pro` for deeper research |
| `default_posts_per_week` | `2` | Fallback cadence if not set per-submission |
| `google_calendar_id` | `primary` | Or a specific calendar ID from Google Calendar settings |
| `google_tasks_list_id` | `@default` | Or a specific task list ID |

### 5. Populate the Personas Tab

One row per team member who will use the system. Column headers:

`persona_name` | `lens` | `tone` | `style` | `target_audience` | `example_posts` | `posting_days` | `post_count`

- `persona_name` — must exactly match what you put in `NEXT_PUBLIC_PROFILES` (case-sensitive)
- `posting_days` — comma-separated: `Mon,Wed,Fri`
- `post_count` — how many draft variations to generate per submission (e.g. `3`)
- `example_posts` — paste 2–3 real LinkedIn posts to calibrate voice (most important field)

### 6. Create the Google Doc Template

Create a blank Google Doc in the configured Drive folder. Add these placeholder markers exactly as shown (double brackets, all caps):

```
[[SOURCE_PACK]]
[[DRAFTS]]
[[CONTENT_CALENDAR]]
```

Copy the Doc ID from its URL and paste it into the `Create Google Doc` node in Workflow 1 as the template reference. *(Or leave the workflow to create fresh docs — depends on your setup.)*

### 7. Activate Both Workflows

**Important**: Use the n8n UI toggle to activate — do not use the API. Only the UI toggle registers the webhook URLs.

---

## Part 2 — Mini App Setup (This Repo)

### 1. Fork or Clone

```bash
git clone https://github.com/ryanbot-coval/content-engine-app.git
cd content-engine-app
npm install
```

### 2. Deploy to Vercel

1. Push to a new GitHub repo under the client's account (or use the fork)
2. Go to [vercel.com/new](https://vercel.com/new) → Import Git Repository
3. Select the repo → Vercel auto-detects Next.js, no build config needed

### 3. Set Environment Variables

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_WEBHOOK_URL` | `https://[instance].app.n8n.cloud/webhook/content/new-v2` | ✅ |
| `NEXT_PUBLIC_COMPANY_NAME` | `Acme Corp` | ✅ |
| `NEXT_PUBLIC_PROFILES` | `Alice,Bob,Carol` | ✅ |
| `NEXT_PUBLIC_LOGO_URL` | URL to client logo (PNG/SVG) | Optional |
| `NEXT_PUBLIC_CONFIRMATION_MESSAGE` | Custom confirmation text | Optional |

> `NEXT_PUBLIC_PROFILES` is a comma-separated list. Each name must **exactly match** the `persona_name` column in the client's personas tab (case-sensitive).

### 4. Deploy

Click **Deploy**. Vercel builds and assigns a URL (e.g. `content-engine-app.vercel.app`).

Trigger a redeploy any time you update env vars.

---

## Part 3 — Test Checklist

Run through this after setup before handing off to the client:

- [ ] Open the app URL — form loads, company name appears in header
- [ ] Profile dropdown shows correct names
- [ ] Submit a test topic — confirmation screen appears within 2–3 seconds
- [ ] n8n Topic Intake execution fires (check n8n executions log)
- [ ] Google Sheet `topics` tab gets a new row
- [ ] Google Doc created in the configured Drive folder
- [ ] ~2 minutes later: `Generate Bundle` execution fires
- [ ] Google Sheet `artifacts` tab populated with N draft rows
- [ ] Google Doc updated with drafts + content calendar sections
- [ ] Bundle email arrives in the configured `notification_email` inbox
- [ ] Google Calendar events created on scheduled post dates
- [ ] Google Tasks created with correct due dates

---

## Quick Reference — What Each Variable Controls

```
NEXT_PUBLIC_WEBHOOK_URL        → Which n8n instance receives form submissions
NEXT_PUBLIC_COMPANY_NAME       → Header + footer branding
NEXT_PUBLIC_PROFILES           → Profile dropdown options
NEXT_PUBLIC_LOGO_URL           → Logo image in header (leave blank for text-only)
NEXT_PUBLIC_CONFIRMATION_MESSAGE → Text shown after submit
```

---

## Troubleshooting

**Form submits but nothing fires in n8n**
→ Check that Workflow 1 is active via the UI toggle (not just API). Webhook URLs only register on UI activation.

**"Submission failed (404)"**
→ `NEXT_PUBLIC_WEBHOOK_URL` is wrong or the workflow is inactive.

**Persona not found / wrong drafts**
→ `NEXT_PUBLIC_PROFILES` value doesn't exactly match the `persona_name` in the personas tab. Check casing.

**No email received**
→ Gmail credential may need re-authorization in n8n. Open the credential and re-authenticate.

**Calendar/Tasks not created**
→ These nodes have `onError: continueRegularOutput` — the rest of the workflow succeeds even if they fail. Check that the `googleCalendarOAuth2Api` and `googleTasksOAuth2Api` credentials are created and assigned to their nodes.

**Google Doc not updating**
→ Google Docs credential (`googleDocsOAuth2Api`) must be a separate credential from Google Sheets — they are different OAuth apps in n8n.
