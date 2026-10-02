import type { Transaction, RecurringPayment, Investment, Goal, Debt, Profile } from './types';
import { formatCurrency } from './format';
import {
  getExpensesForMonth,
  getInvestmentsForMonth,
  getIncomeForMonth,
  getCurrentBalance,
  calculateSafeToSpend,
  getNextSalaryDate,
} from './finance';

export function answerQuery(
  query: string,
  transactions: Transaction[],
  recurring: RecurringPayment[],
  investments: Investment[],
  goals: Goal[],
  debts: Debt[],
  profile: Profile
): string {
  const q = query.toLowerCase();
  const now = new Date();

  if (q.includes('food') && (q.includes('spend') || q.includes('spent') || q.includes('much'))) {
    const foodThis = transactions
      .filter(t => t.type === 'expense' && t.category === 'Food')
      .filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, t) => s + t.amount, 0);
    return `You spent ${formatCurrency(foodThis)} on food this month.`;
  }

  if (q.includes('invest') && q.includes('year')) {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const invested = transactions
      .filter(t => t.type === 'investment')
      .filter(t => new Date(t.date) >= yearStart)
      .reduce((s, t) => s + t.amount, 0);
    return `You invested ${formatCurrency(invested)} this year.`;
  }

  if (q.includes('biggest') && q.includes('expense')) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'No expenses recorded yet.';
    return `Your biggest expense is ${sorted[0][0]} at ${formatCurrency(sorted[0][1])}.`;
  }

  if (q.includes('owe') || q.includes('lent') || q.includes('borrow')) {
    const activeDebts = debts.filter(d => d.status === 'active');
    const lent = activeDebts.filter(d => d.direction === 'lend').reduce((s, d) => s + d.amount, 0);
    const borrowed = activeDebts.filter(d => d.direction === 'borrow').reduce((s, d) => s + d.amount, 0);
    if (lent > 0) return `People owe you ${formatCurrency(lent)}.`;
    if (borrowed > 0) return `You owe ${formatCurrency(borrowed)} to others.`;
    return 'No outstanding debts.';
  }

  if (q.includes('sip') && (q.includes('next') || q.includes('when'))) {
    const sips = investments.filter(i => i.next_sip_date).sort((a, b) => new Date(a.next_sip_date!).getTime() - new Date(b.next_sip_date!).getTime());
    if (sips.length === 0) return 'No upcoming SIPs.';
    return `Your next SIP is ${sips[0].name} on ${new Date(sips[0].next_sip_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`;
  }

  if (q.includes('afford')) {
    const breakdown = calculateSafeToSpend(transactions, recurring, investments, goals, profile);
    const match = q.match(/₹?\s*([\d,]+)/);
    const amount = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
    if (amount > 0) {
      if (breakdown.safeToSpend >= amount) return `Yes, you can afford ${formatCurrency(amount)}. You have ${formatCurrency(breakdown.safeToSpend)} safe to spend.`;
      return `Not right now. You have ${formatCurrency(breakdown.safeToSpend)} safe to spend, which is ${formatCurrency(amount - breakdown.safeToSpend)} short.`;
    }
    return `You have ${formatCurrency(breakdown.safeToSpend)} safe to spend.`;
  }

  if (q.includes('commit') || q.includes('before') && q.includes('salary')) {
    const nextSalary = getNextSalaryDate(profile);
    const breakdown = calculateSafeToSpend(transactions, recurring, investments, goals, profile);
    return `You have ${formatCurrency(breakdown.upcomingCommitments + breakdown.upcomingSIPs)} committed before your next salary on ${nextSalary.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.`;
  }

  if (q.includes('balance') || q.includes('money') && q.includes('have')) {
    const balance = getCurrentBalance(transactions);
    return `Your current balance is ${formatCurrency(balance)}.`;
  }

  if (q.includes('income') || q.includes('earn')) {
    const income = getIncomeForMonth(transactions, now);
    return `You earned ${formatCurrency(income)} this month.`;
  }

  if (q.includes('save') || q.includes('safe')) {
    const breakdown = calculateSafeToSpend(transactions, recurring, investments, goals, profile);
    return `You have ${formatCurrency(breakdown.safeToSpend)} safe to spend.`;
  }

  if (q.includes('expense') || q.includes('spent') && q.includes('month')) {
    const expenses = getExpensesForMonth(transactions, now);
    return `You spent ${formatCurrency(expenses)} this month.`;
  }

  if (q.includes('invest') && q.includes('month')) {
    const invested = getInvestmentsForMonth(transactions, now);
    return `You invested ${formatCurrency(invested)} this month.`;
  }

  if (q.includes('goal')) {
    if (goals.length === 0) return 'You have no goals yet.';
    const lines = goals.map(g => `${g.name}: ${formatCurrency(g.current_amount)} / ${formatCurrency(g.target_amount)}`);
    return `Your goals:\n${lines.join('\n')}`;
  }

  return 'I can answer questions about your spending, investments, debts, goals, and what you can afford. Try asking "How much did I spend on food this month?"';
}
