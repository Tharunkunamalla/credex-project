# Reflection — StackSpend

## What worked

- A deterministic rules engine made the audit output predictable and easy to explain.
- Keeping the landing page, audit API, and results page in one Next.js app kept deployment simple.
- Supabase plus a local fallback made development smoother while still supporting production storage.

## What was hard

- Matching the pricing rules to real-world SaaS plans took more care than the UI work.
- Serverless deployment constraints required extra attention around Node runtime and filesystem usage.
- The most useful product decisions were often about narrowing scope rather than adding features.

## What I would do differently

- Validate the highest-value audit scenarios with more real users earlier.
- Add stronger automated checks around pricing data updates.
- Make the form onboarding shorter and more guided.
