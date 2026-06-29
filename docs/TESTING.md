# Testing & QA Guide

This document outlines the testing workflow for PrepEntrance. We enforce a strict separation between production data and QA data.

## Testing Branch

The `testing` branch acts as the staging environment.
All `feature/*` branches must be merged into `testing` first. Only after QA approval on the testing environment should a PR be opened against `main`.

## Sandbox Payments

Under no circumstances should real money be used in testing.
- The Vercel Preview environment is configured with `VITE_CASHFREE_MODE=SANDBOX`.
- Use the Cashfree test card numbers provided in their developer documentation to simulate successful, failed, and pending transactions.

## Authentication Testing

The `testing` environment points to a separate Supabase project.
- Feel free to create dummy accounts, upgrade them, and modify their data.
- User deletions, password resets, and email verifications should be tested in this isolated environment.

## AI Testing

The PrepEntrance Knowledge Engine relies on OpenAI APIs.
- Monitor API usage on the OpenAI dashboard to prevent exorbitant QA costs.
- Do not run load-testing scripts against the live AI endpoints unless explicitly authorized.

## Student Dashboard QA

When testing features on the Student Dashboard, verify:
- Accurate progress tracking calculation.
- Exam mode (JEE/NEET/CUET) UI switching.
- Syllabus alignment and topic rendering.

## Regression Checklist

Before approving a merge from `testing` to `main`, verify:
- [ ] Trial gating properly blocks access to premium features when expired.
- [ ] Practice quizzes complete and score correctly.
- [ ] The Student Hub loads without layout shifts.
- [ ] "Coming Soon" features are securely locked.
- [ ] Payment checkout flows initialize correctly.
