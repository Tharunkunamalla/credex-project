# StackSpend — AI Spend Audit

StackSpend is a free, high-converting spend audit tool built for startup founders and engineering managers to analyze their team's AI subscriptions. It scans their software stack, identifies overspending, suggests optimal downgrades/replacements, and calculates potential monthly and annual savings, acting as a lead-generation tool for Credex's discounted AI credits.

---

## Quick Start

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Tharunkunamalla/credex-project.git
cd credex-project
npm install --legacy-peer-deps
```

### Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

Run the test suite with Vitest:

```bash
npx vitest run
```

---

## Decisions & Technical Trade-offs

1. **Deterministic Business Rules vs. LLM for Auditing**
   - *Trade-off*: We used hardcoded, pattern-based logic for calculations rather than prompting an LLM.
   - *Rationale*: A finance officer or engineering manager requires absolute mathematical precision. Using an LLM for calculations introduces non-deterministic outputs, hallucinated savings, and higher latency, whereas hardcoded business rules are fast, defensible, and 100% accurate.

2. **Zustand for Client-Side State and Persistence**
   - *Trade-off*: Decoupling form state from page routing via a centralized Zustand store with `localStorage` sync.
   - *Rationale*: If a user accidentally reloads or drops off during the audit inputs, their progress is preserved. This increases completion rates, makes the step-by-step form navigation clean, and avoids global prop-drilling or Next.js router state limits.

3. **No Auth Lead Generation Flow**
   - *Trade-off*: Let users perform the complete audit without signing up or entering an email first.
   - *Rationale*: Email gates before showing value reduce conversion rates. By showing the visual audit and total savings first, we build trust. We then capture the email when they want to save/export the report or schedule a Credex saving consultation.

4. **Next.js API Routes over a Separate Backend Service**
   - *Trade-off*: Processing calculations and LLM summaries inside Next.js API Routes (Serverless) rather than maintaining a separate Express or Go service.
   - *Rationale*: For a lead-gen product, minimize operational complexity. Serverless API routes scale automatically, handle credentials securely without leaking them to the frontend, and keep the deployment unified on Vercel under a single repository.

5. **Claude API (`claude-3-5-sonnet`) with Templated Fallback**
   - *Trade-off*: Using Claude to write a human-like, conversational summary of the audit, with a local deterministic template engine fallback.
   - *Rationale*: Claude generates highly contextualized feedback, but third-party APIs can hit rate limits or downtime. A local template ensures that even if Anthropic is down, the user still receives an audit report immediately.

---

## Deployed URL
*Deployment Link will be placed here once deployed to Vercel.*

---

## Screenshots / Demo
*Screenshots/recording link will be updated here during the final polish.*
