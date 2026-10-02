/*
# Personal Finance App — Core Schema

## Overview
Creates the full data model for a single-tenant personal finance app (no auth/sign-in).
All tables use `TO anon, authenticated` policies so the anon-key frontend can read/write its own data.

## New Tables
1. `profiles` — user profile (name, currency, salary_frequency, salary_day, onboarding_complete)
2. `transactions` — all money events (expense, income, investment, lend, receive)
3. `recurring_payments` — repeating commitments (rent, SIP, subscriptions, etc.)
4. `investments` — manual investment tracking (mutual funds, SIPs, stocks, FD, gold, etc.)
5. `goals` — savings goals with target/current amounts and target dates
6. `debts` — money lent to or borrowed from people

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because this is a single-tenant app with no sign-in — the data is intentionally shared.
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'User',
  currency text NOT NULL DEFAULT 'INR',
  salary_frequency text NOT NULL DEFAULT 'monthly'
    CHECK (salary_frequency IN ('monthly','twice_monthly','weekly','irregular','student')),
  salary_day integer NOT NULL DEFAULT 1,
  monthly_income numeric NOT NULL DEFAULT 0,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL
    CHECK (type IN ('expense','income','investment','lend','receive')),
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Other',
  description text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  recurring boolean NOT NULL DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

-- Recurring Payments
CREATE TABLE IF NOT EXISTS recurring_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'monthly'
    CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  next_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'Other',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recurring" ON recurring_payments;
CREATE POLICY "anon_select_recurring" ON recurring_payments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recurring" ON recurring_payments;
CREATE POLICY "anon_insert_recurring" ON recurring_payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recurring" ON recurring_payments;
CREATE POLICY "anon_update_recurring" ON recurring_payments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recurring" ON recurring_payments;
CREATE POLICY "anon_delete_recurring" ON recurring_payments FOR DELETE
  TO anon, authenticated USING (true);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'mutual_fund'
    CHECK (type IN ('mutual_fund','sip','stock','fd','gold','nps','other')),
  amount_invested numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  sip_amount numeric DEFAULT 0,
  sip_frequency text DEFAULT 'monthly'
    CHECK (sip_frequency IS NULL OR sip_frequency IN ('weekly','monthly','quarterly','yearly')),
  next_sip_date date,
  started_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_investments" ON investments;
CREATE POLICY "anon_select_investments" ON investments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_investments" ON investments;
CREATE POLICY "anon_insert_investments" ON investments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_investments" ON investments;
CREATE POLICY "anon_update_investments" ON investments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_investments" ON investments;
CREATE POLICY "anon_delete_investments" ON investments FOR DELETE
  TO anon, authenticated USING (true);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE
  TO anon, authenticated USING (true);

-- Debts (money lent/borrowed)
CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  direction text NOT NULL DEFAULT 'lend'
    CHECK (direction IN ('lend','borrow')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','settled')),
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_debts" ON debts;
CREATE POLICY "anon_select_debts" ON debts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_debts" ON debts;
CREATE POLICY "anon_insert_debts" ON debts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_debts" ON debts;
CREATE POLICY "anon_update_debts" ON debts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_debts" ON debts;
CREATE POLICY "anon_delete_debts" ON debts FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_recurring_next_date ON recurring_payments(next_date);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
