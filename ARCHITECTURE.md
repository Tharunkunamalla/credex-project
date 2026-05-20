# Architecture & System Design — StackSpend

## System Diagram

```mermaid
graph TD
    User([Cold Visitor]) -->|1. Fills form| WebUI[Next.js App / React Form]
    WebUI -->|2. Persists Progress| LocalStore[(Zustand / LocalStorage)]
    WebUI -->|3. POST inputs| AuditAPI[Next.js API Route: /api/audit]
    
    subgraph Backend Services (Serverless)
        AuditAPI -->|4. Checks rules| Engine[Audit Engine: rules.ts]
        Engine -->|5. Reads rates| Pricing[pricing.json]
        AuditAPI -->|6. Generates summary| ClaudeAPI[Anthropic API: Claude 3.5 Sonnet]
        AuditAPI -->|7. Saves Audit| Supabase[(Supabase DB)]
    end
    
    AuditAPI -->|8. Returns Share Token| WebUI
    WebUI -->|9. Redirects| ResultsPage[Audit Results: /audit/id]
    
    ResultsPage -->|10. Capture Lead| LeadAPI[Next.js API Route: /api/lead]
    LeadAPI -->|11. Saves Lead| Supabase
    LeadAPI -->|12. Triggers email| Resend[Resend Transactional Email]
    Resend -->|13. Sends Report| User
```

---

## Data Flow: Input to Audit Result

1. **User Interaction**:
   - The user selects the tools they subscribe to, inputs details (seats, plan type, current monthly spend), team size, and company use case.
2. **Local Persistence**:
   - Zustand syncs form changes to browser `localStorage` on every keystroke, preventing loss of progress.
3. **Audit Execution**:
   - On submission, client sends a JSON payload to `/api/audit`.
   - The API triggers `calculations.ts` which loops through each user-configured tool.
   - For each tool, `rules.ts` checks constraints against the catalog in `pricing.json` (e.g. seat limits, tool overlaps, downgrade availability).
   - If user inputs API spend, the engine calculates the direct saving potential of Credex credit discount (typically 10-25%).
4. **AI Summary Generation**:
   - The server calls Anthropic's Claude API with the audit findings, requesting a concise, 100-word recommendation. If this call fails or times out, a local templated summary is used as a fallback.
5. **Database Storage**:
   - The audit inputs, outputs, and summary are stored in Supabase under a unique ID. A public `share_token` (UUID) is generated.
6. **Result Display**:
   - The user is redirected to `/audit/[id]` which fetches the clean, anonymized report directly from Supabase, ready to be screenshotted or shared.

---

## Tech Stack Rationale

- **Next.js 15 + TypeScript**: Next.js combines fast Server-Side Rendering (SSR) for initial landing pages and SEO-friendly metadata with fast serverless functions for background audit handling. TypeScript ensures reliability in database schemas and form shapes.
- **Tailwind CSS + shadcn/ui**: Tailwind provides maximum layout control and micro-animations, while shadcn/ui handles form fields, overlays, and dialogs.
- **Zustand**: Lightweight, framework-agnostic client store that maps easily to `localStorage` without React context rerender penalties.
- **Supabase**: Serverless PostgreSQL with built-in connection pooling, auto-indexing, and instant deployment.
- **Resend**: Highly reliable transactional email API with simple SDK integration and developer-friendly logs.

---

## Scaling to 10k Audits/Day

If StackSpend expands to handle 10,000+ audits per day, the following changes would be implemented:

1. **Caching Claude Summaries & Calculations**
   - *Issue*: Calling the Anthropic API for every audit is expensive, slow, and prone to rate limits.
   - *Fix*: Cache common stack permutations or use background queue jobs. For identical tool stacks and team configurations, retrieve cached audit insights rather than querying Anthropic again.

2. **Supabase Connection Pooling & Caching**
   - *Issue*: 10k audits/day translates to heavy read/write traffic on the database.
   - *Fix*: Utilize Supabase PgBouncer / Supabase pooling for serverless execution. Implement a Redis layer (e.g. Upstash) to cache reads on the `/audit/[id]` path, reducing database loads since audit data is static once created.

3. **Rate Limiting & Queueing**
   - *Issue*: Sudden spikes in Hacker News or Twitter traffic can overload the Resend or Claude API limits.
   - *Fix*: Move the PDF generation, Resend email dispatching, and Claude API calls to an asynchronous background job queue (e.g. BullMQ, Ingest, or Upstash QStash). The API route immediately returns the audit calculation to the user, while the heavier notifications and summary updates process in the background.

4. **Edge API Routes**
   - *Issue*: Serverless functions have cold starts and region latency.
   - *Fix*: Deploy the audit engine logic and `/api/audit` endpoint on Next.js Edge Runtime, bringing calculation latency down to single-digit milliseconds worldwide.
