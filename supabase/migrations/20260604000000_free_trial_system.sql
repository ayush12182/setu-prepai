-- ============================================================
-- PrepEntrance Free Trial System
-- 3-Day trial for new B2C users. Server-side. Not spoofable.
-- ============================================================

-- 1. Add trial columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- 2. DB trigger: auto-set trial dates on new profile INSERT
CREATE OR REPLACE FUNCTION set_trial_on_profile_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Only activate trial if not already set (idempotent)
  IF NEW.trial_started_at IS NULL THEN
    NEW.trial_started_at := NOW();
    NEW.trial_ends_at    := NOW() + INTERVAL '3 days';
    NEW.subscription_status := 'trial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_trial ON profiles;
CREATE TRIGGER trigger_set_trial
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_trial_on_profile_create();

-- 3. Grandfather all EXISTING users as 'active'
--    (users created before this migration never see a paywall)
--    Only rows with no trial_started_at are existing users.
UPDATE profiles
SET
  subscription_status = 'active',
  trial_started_at    = created_at,
  trial_ends_at       = created_at + INTERVAL '3 days'
WHERE
  trial_started_at IS NULL
  AND subscription_status = 'trial';

-- 4. Index for fast lookups by user_id + trial status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON profiles (user_id, subscription_status);
