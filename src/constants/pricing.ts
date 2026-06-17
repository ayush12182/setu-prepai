/**
 * Single source of truth for all pricing values.
 * Every pricing reference in the codebase must import from here.
 */

export const PRICING = {
  /** Monthly subscription price in INR */
  PRO_MONTHLY: 249,

  /** Free trial duration in days */
  TRIAL_DAYS: 3,

  /** Currency symbol */
  CURRENCY: '₹',

  /** Currency code */
  CURRENCY_CODE: 'INR',

  /** Formatted monthly price string */
  PRO_MONTHLY_DISPLAY: '₹249/month',

  /** Formatted price for button labels */
  PRO_CTA_LABEL: 'Upgrade to Pro — ₹249/month',
} as const;
