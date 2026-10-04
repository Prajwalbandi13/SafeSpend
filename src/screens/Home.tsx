import { useState } from 'react';
import { Mic, Eye, EyeOff, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import { QuickAddModal } from '../components/QuickAddModal';
import { useProfile, useTransactions, useRecurring, useInvestments, useGoals } from '../lib/hooks';
import {
  calculateSafeToSpend,
  getIncomeForMonth,
  getExpensesForMonth,
  getInvestmentsForMonth,
  generateInsights,
} from '../lib/finance';
import { formatCurrency, getGreeting, formatMonthYear } from '../lib/format';
import type { ParsedTransaction } from '../lib/types';

const INSIGHT_ICONS: Record<string, typeof Lightbulb> = {
  utensils: Lightbulb,
  'trending-up': TrendingUp,
  repeat: TrendingUp,
};

export function HomeScreen() {
  const { profile } = useProfile();
  const { transactions, add } = useTransactions();
  const { recurring } = useRecurring();
  const { investments } = useInvestments();
  const { goals } = useGoals();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'expense' | 'income' | undefined>();
  const [amountsVisible, setAmountsVisible] = useState(false);
  const [expensesVisible, setExpensesVisible] = useState(false);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTransactions = transactions.filter(t => t.date.slice(0, 7) === monthKey);
  const breakdown = calculateSafeToSpend(monthTransactions, recurring, investments, goals, profile);
  const income = getIncomeForMonth(transactions, now);
  const expenses = getExpensesForMonth(transactions, now);
  const invested = getInvestmentsForMonth(transactions, now);
  const insights = generateInsights(transactions, recurring, investments);

  const handleQuickAdd = (parsed: ParsedTransaction) => {
    add({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      date: parsed.date,
      recurring: false,
      notes: null,
    });
  };

  return (
    <div className="space-y-6 px-5 pb-28 pt-14 md:pb-8 md:pt-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {getGreeting()}, {profile.name} 👋
          </h1>
          <p className="text-sm text-gray-400">{formatMonthYear(now)}</p>
        </div>
      </div>

      {/* Monthly expenses hero */}
      <div
        className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-200/50"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-emerald-50">Expenses this month</p>
          <button
            type="button"
            aria-label={expensesVisible ? 'Hide expenses' : 'Show expenses'}
            title={expensesVisible ? 'Hide expenses' : 'Show expenses'}
            onClick={() => setExpensesVisible(visible => !visible)}
            className="rounded-lg p-2 text-emerald-50 hover:bg-white/10 hover:text-white"
          >
            {expensesVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {expensesVisible ? formatCurrency(expenses) : '••••••'}
        </p>
      </div>

      {/* Protected financial summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Monthly summary</h2>
        <button
          type="button"
          aria-label={amountsVisible ? 'Hide income, available to spend, and invested amounts' : 'Show income, available to spend, and invested amounts'}
          title={amountsVisible ? 'Hide these amounts' : 'Show these amounts'}
          onClick={() => setAmountsVisible(visible => !visible)}
          className="rounded-xl bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-100"
        >
          {amountsVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Income" value={amountsVisible ? formatCurrency(income) : '••••••'} color="text-emerald-600" />
        <SummaryCard label="Available to spend" value={amountsVisible ? formatCurrency(breakdown.safeToSpend) : '••••••'} color="text-gray-900" />
        <SummaryCard label="Invested" value={amountsVisible ? formatCurrency(invested) : '••••••'} color="text-blue-600" />
      </div>

      {/* Quick add button */}
      <button
        onClick={() => {
          setQuickAddType(undefined);
          setQuickAddOpen(true);
        }}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 text-white shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
          <Mic size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">Tell me what happened</p>
          <p className="text-xs text-gray-400">Tap to speak or type</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setQuickAddType('expense');
            setQuickAddOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white py-3 text-sm font-semibold text-red-600 shadow-sm active:scale-[0.98]"
        >
          <TrendingDown size={18} /> Add expense
        </button>
        <button
          onClick={() => {
            setQuickAddType('income');
            setQuickAddOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-white py-3 text-sm font-semibold text-emerald-600 shadow-sm active:scale-[0.98]"
        >
          <TrendingUp size={18} /> Add income
        </button>
      </div>

      {/* Privacy note */}
      <div className="rounded-xl bg-gray-50 p-3 text-center">
        <p className="text-xs text-gray-400">
          Your financial data is private. We don't connect to your bank accounts.
        </p>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900">Insights</h2>
          {insights.map((ins, i) => {
            const Icon = INSIGHT_ICONS[ins.icon] || Lightbulb;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-50 p-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-900">{ins.text}</p>
              </div>
            );
          })}
        </div>
      )}

      <QuickAddModal
        open={quickAddOpen}
        initialType={quickAddType}
        onClose={() => {
          setQuickAddOpen(false);
          setQuickAddType(undefined);
        }}
        onConfirm={handleQuickAdd}
      />
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
