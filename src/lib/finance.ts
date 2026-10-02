import type { Transaction, RecurringPayment, Investment, Goal, SafeToSpendBreakdown, Insight, Profile } from './types';
import { formatCurrency, daysBetween } from './format';

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function transactionIsInMonth(transaction: Transaction, date: Date): boolean {
  return transaction.date.slice(0, 7) === monthKey(date);
}

export function getIncomeForMonth(transactions: Transaction[], refDate: Date): number {
  return transactions
    .filter(t => t.type === 'income')
    .filter(t => transactionIsInMonth(t, refDate))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getExpensesForMonth(transactions: Transaction[], refDate: Date): number {
  return transactions
    .filter(t => t.type === 'expense')
    .filter(t => transactionIsInMonth(t, refDate))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getInvestmentsForMonth(transactions: Transaction[], refDate: Date): number {
  return transactions
    .filter(t => t.type === 'investment')
    .filter(t => transactionIsInMonth(t, refDate))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCurrentBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, t) => {
    if (t.type === 'income' || t.type === 'receive') return balance + t.amount;
    return balance - t.amount;
  }, 0);
}

export function getUpcomingRecurring(recurring: RecurringPayment[], nextSalaryDate: Date): number {
  const now = new Date();
  return recurring
    .filter(r => {
      const d = new Date(r.next_date);
      return d >= now && d <= nextSalaryDate;
    })
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getUpcomingSIPs(investments: Investment[], nextSalaryDate: Date): number {
  const now = new Date();
  return investments
    .filter(i => i.sip_amount && i.next_sip_date)
    .filter(i => {
      const d = new Date(i.next_sip_date!);
      return d >= now && d <= nextSalaryDate;
    })
    .reduce((sum, i) => sum + (i.sip_amount || 0), 0);
}

export function getGoalMonthlyContribution(goals: Goal[]): number {
  return goals.reduce((sum, g) => {
    if (!g.target_date) return sum;
    const remaining = g.target_amount - g.current_amount;
    if (remaining <= 0) return sum;
    const monthsLeft = Math.max(1, daysBetween(new Date(), g.target_date) / 30);
    return sum + remaining / monthsLeft;
  }, 0);
}

export function getNextSalaryDate(profile: Profile): Date {
  const now = new Date();
  const day = profile.salary_day;
  let next = new Date(now.getFullYear(), now.getMonth(), day);
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, day);
  }
  return next;
}

export function calculateSafeToSpend(
  transactions: Transaction[],
  recurring: RecurringPayment[],
  investments: Investment[],
  goals: Goal[],
  profile: Profile
): SafeToSpendBreakdown {
  const currentMoney = getCurrentBalance(transactions);
  const nextSalaryDate = getNextSalaryDate(profile);
  const upcomingCommitments = getUpcomingRecurring(recurring, nextSalaryDate);
  const upcomingSIPs = getUpcomingSIPs(investments, nextSalaryDate);
  const goalAllocation = getGoalMonthlyContribution(goals);
  const safeToSpend = currentMoney - upcomingCommitments - upcomingSIPs - goalAllocation;
  return { currentMoney, upcomingCommitments, upcomingSIPs, goalAllocation, safeToSpend };
}

export function generateInsights(
  transactions: Transaction[],
  recurring: RecurringPayment[],
  investments: Investment[],
  goals: Goal[],
  profile: Profile,
  safeToSpend: number
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Food spending comparison
  const foodThisMonth = transactions
    .filter(t => t.type === 'expense' && t.category === 'Food')
    .filter(t => transactionIsInMonth(t, now))
    .reduce((s, t) => s + t.amount, 0);
  const foodLastMonth = transactions
    .filter(t => t.type === 'expense' && t.category === 'Food')
    .filter(t => transactionIsInMonth(t, lastMonthDate))
    .reduce((s, t) => s + t.amount, 0);
  if (foodLastMonth > 0) {
    const pct = Math.round(((foodThisMonth - foodLastMonth) / foodLastMonth) * 100);
    if (pct > 5) insights.push({ icon: 'utensils', text: `Food spending increased ${pct}% compared with last month.` });
  }

  // Investment percentage
  const income = getIncomeForMonth(transactions, now);
  const invested = getInvestmentsForMonth(transactions, now);
  if (income > 0 && invested > 0) {
    const pct = Math.round((invested / income) * 100);
    insights.push({ icon: 'trending-up', text: `You invested ${pct}% of your income this month.` });
  }

  // Recurring commitments
  const monthlyRecurring = recurring
    .filter(r => r.frequency === 'monthly')
    .reduce((s, r) => s + r.amount, 0);
  if (monthlyRecurring > 0) {
    insights.push({ icon: 'repeat', text: `Your recurring commitments are ${formatCurrency(monthlyRecurring)}/month.` });
  }

  // Safe to spend
  if (safeToSpend > 0) {
    insights.push({ icon: 'wallet', text: `You have ${formatCurrency(safeToSpend)} available to spend before your next salary.` });
  }

  // Debts owed
  const owed = transactions
    .filter(t => t.type === 'lend')
    .reduce((s, t) => s + t.amount, 0);
  const returned = transactions
    .filter(t => t.type === 'receive')
    .reduce((s, t) => s + t.amount, 0);
  const netOwed = owed - returned;
  if (netOwed > 0) {
    insights.push({ icon: 'hand-coins', text: `People owe you ${formatCurrency(netOwed)}.` });
  }

  return insights.slice(0, 5);
}
