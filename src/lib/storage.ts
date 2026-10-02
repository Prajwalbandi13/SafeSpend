import type {
  Profile,
  Transaction,
  RecurringPayment,
  Investment,
  Goal,
  Debt,
} from './types';
import { seedDemoData } from './seedData';

const KEYS = {
  profile: 'pf_profile',
  transactions: 'pf_transactions',
  recurring: 'pf_recurring',
  investments: 'pf_investments',
  goals: 'pf_goals',
  debts: 'pf_debts',
  initialized: 'pf_initialized',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isInitialized(): boolean {
  return localStorage.getItem(KEYS.initialized) === 'true';
}

export function initIfNeeded(): void {
  if (!isInitialized()) {
    const demo = seedDemoData();
    write(KEYS.profile, demo.profile);
    write(KEYS.transactions, demo.transactions);
    write(KEYS.recurring, demo.recurring);
    write(KEYS.investments, demo.investments);
    write(KEYS.goals, demo.goals);
    write(KEYS.debts, demo.debts);
    localStorage.setItem(KEYS.initialized, 'true');
  }
}

export function resetAllData(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

// Profile
export function getProfile(): Profile {
  return read<Profile | null>(KEYS.profile, null) ?? defaultProfile();
}

export function saveProfile(profile: Profile): void {
  write(KEYS.profile, profile);
}

export function updateProfile(patch: Partial<Profile>): Profile {
  const current = getProfile();
  const updated = { ...current, ...patch };
  saveProfile(updated);
  return updated;
}

// Transactions
export function getTransactions(): Transaction[] {
  return read<Transaction[]>(KEYS.transactions, []);
}

export function saveTransactions(txns: Transaction[]): void {
  write(KEYS.transactions, txns);
}

export function addTransaction(
  t: Omit<Transaction, 'id' | 'created_at'>
): Transaction {
  const txns = getTransactions();
  const newTxn: Transaction = {
    ...t,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  saveTransactions([newTxn, ...txns]);
  return newTxn;
}

export function updateTransaction(id: string, patch: Partial<Transaction>): void {
  const txns = getTransactions();
  saveTransactions(txns.map(t => (t.id === id ? { ...t, ...patch } : t)));
}

export function deleteTransaction(id: string): void {
  const txns = getTransactions();
  saveTransactions(txns.filter(t => t.id !== id));
}

// Recurring
export function getRecurring(): RecurringPayment[] {
  return read<RecurringPayment[]>(KEYS.recurring, []);
}

export function saveRecurring(items: RecurringPayment[]): void {
  write(KEYS.recurring, items);
}

export function addRecurring(r: Omit<RecurringPayment, 'id' | 'created_at'>): void {
  const items = getRecurring();
  saveRecurring([
    { ...r, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ...items,
  ]);
}

export function updateRecurring(id: string, patch: Partial<RecurringPayment>): void {
  const items = getRecurring();
  saveRecurring(items.map(r => (r.id === id ? { ...r, ...patch } : r)));
}

export function deleteRecurring(id: string): void {
  const items = getRecurring();
  saveRecurring(items.filter(r => r.id !== id));
}

// Investments
export function getInvestments(): Investment[] {
  return read<Investment[]>(KEYS.investments, []);
}

export function saveInvestments(items: Investment[]): void {
  write(KEYS.investments, items);
}

export function addInvestment(i: Omit<Investment, 'id' | 'created_at'>): void {
  const items = getInvestments();
  saveInvestments([
    { ...i, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ...items,
  ]);
}

export function updateInvestment(id: string, patch: Partial<Investment>): void {
  const items = getInvestments();
  saveInvestments(items.map(i => (i.id === id ? { ...i, ...patch } : i)));
}

export function deleteInvestment(id: string): void {
  const items = getInvestments();
  saveInvestments(items.filter(i => i.id !== id));
}

// Goals
export function getGoals(): Goal[] {
  return read<Goal[]>(KEYS.goals, []);
}

export function saveGoals(items: Goal[]): void {
  write(KEYS.goals, items);
}

export function addGoal(g: Omit<Goal, 'id' | 'created_at'>): void {
  const items = getGoals();
  saveGoals([
    { ...g, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ...items,
  ]);
}

export function updateGoal(id: string, patch: Partial<Goal>): void {
  const items = getGoals();
  saveGoals(items.map(g => (g.id === id ? { ...g, ...patch } : g)));
}

export function deleteGoal(id: string): void {
  const items = getGoals();
  saveGoals(items.filter(g => g.id !== id));
}

// Debts
export function getDebts(): Debt[] {
  return read<Debt[]>(KEYS.debts, []);
}

export function saveDebts(items: Debt[]): void {
  write(KEYS.debts, items);
}

export function addDebt(d: Omit<Debt, 'id' | 'created_at'>): void {
  const items = getDebts();
  saveDebts([
    { ...d, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ...items,
  ]);
}

export function updateDebt(id: string, patch: Partial<Debt>): void {
  const items = getDebts();
  saveDebts(items.map(d => (d.id === id ? { ...d, ...patch } : d)));
}

export function deleteDebt(id: string): void {
  const items = getDebts();
  saveDebts(items.filter(d => d.id !== id));
}

function defaultProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: 'User',
    currency: 'INR',
    salary_frequency: 'monthly',
    salary_day: 1,
    monthly_income: 0,
    onboarding_complete: false,
    created_at: new Date().toISOString(),
  };
}
