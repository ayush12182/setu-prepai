# Deployment Guide

This document outlines the deployment processes and procedures for PrepEntrance.

## Vercel Setup

PrepEntrance relies on Vercel for fast, global, edge network deployment.
Vercel is linked to the GitHub repository to automatically manage deployments for `main` and `testing`.

- **Production Deployments**: Triggered automatically on push or merge into the `main` branch.
- **Preview Deployments**: Triggered automatically on push into the `testing` branch or any open pull requests.

## Environment Variables

When deploying to Vercel, ensure the following environment variables are securely stored in the Vercel project settings:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_CASHFREE_APP_ID
VITE_CASHFREE_SECRET_KEY
VITE_OPENAI_API_KEY
VITE_ENV
```

**CRITICAL**: Production and Preview environments in Vercel **must** use different variables. Configure your `testing` branch to use sandbox keys.

## Supabase Production

The Supabase database manages Authentication, Profiles, and Analytics.
- Always run structural migrations via the Supabase CLI (`supabase db push`) rather than manual SQL editor changes to maintain consistency.
- Enable Point-in-Time Recovery (PITR) on the production database.

## Domains and SSL

Vercel automatically provisions an SSL certificate for all custom domains.
Ensure your DNS records (A and CNAME) are correctly pointing to Vercel's edge network:
- **A Record**: `@` -> `76.76.21.21`
- **CNAME**: `www` -> `cname.vercel-dns.com`

## Rollback Procedure

If a critical issue is discovered in production:
1. Open the Vercel Dashboard for the PrepEntrance project.
2. Go to **Deployments**.
3. Select the previous stable deployment from the list.
4. Click **Promote to Production** (or "Instant Rollback").
5. The rollback happens instantly with zero downtime.
6. Create a `hotfix/` branch locally, fix the bug, and open a PR against `main`.
