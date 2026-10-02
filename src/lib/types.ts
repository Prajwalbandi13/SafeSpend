export type TransactionType = 'expense' | 'income' | 'investment' | 'lend' | 'receive';
export type SalaryFrequency = 'monthly' | 'twice_monthly' | 'weekly' | 'irregular' | 'student';
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type InvestmentType = 'mutual_fund' | 'sip' | 'stock' | 'fd' | 'gold' | 'nps' | 'other';
export type DebtDirection = 'lend' | 'borrow';
export type DebtStatus = 'active' | 'settled';

export interface Profile {
  id: string;
  name: string;
  currency: string;
  salary_frequency: SalaryFrequency;
  salary_day: number;
  monthly_income: number;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring: boolean;
  notes: string | null;
  created_at: string;
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  next_date: string;
  category: string;
  created_at: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  amount_invested: number;
  current_value: number;
  sip_amount: number | null;
  sip_frequency: RecurringFrequency | null;
  next_sip_date: string | null;
  started_date: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  direction: DebtDirection;
  status: DebtStatus;
  notes: string | null;
  created_at: string;
}

export interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface SafeToSpendBreakdown {
  currentMoney: number;
  upcomingCommitments: number;
  upcomingSIPs: number;
  goalAllocation: number;
  safeToSpend: number;
}

export interface Insight {
  icon: string;
  text: string;
}
