import { useState } from 'react';
import { Mic, ChevronDown, ChevronUp, Lightbulb, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { QuickAddModal } from '../components/QuickAddModal';
import { useProfile, useTransactions, useRecurring, useInvestments, useGoals } from '../lib/hooks';
import {
  calculateSafeToSpend,
  getIncomeForMonth,
  getExpensesForMonth,
  getInvestmentsForMonth,
  generateInsights,
} from '../lib/finance';
import { formatCurrency, getGreeting, formatMonthYear, daysBetween } from '../lib/format';
import type { ParsedTransaction } from '../lib/types';

const INSIGHT_ICONS: Record<string, typeof Lightbulb> = {
  utensils: Lightbulb,
  'trending-up': TrendingUp,
  repeat: TrendingUp,
  wallet: Wallet,
  'hand-coins': Wallet,
};

export function HomeScreen() {
  const { profile } = useProfile();
  const { transactions, add } = useTransactions();
  const { recurring } = useRecurring();
  const { investments } = useInvestments();
  const { goals } = useGoals();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const now = new Date();
  const breakdown = calculateSafeToSpend(transactions, recurring, investments, goals, profile);
  const income = getIncomeForMonth(transactions, now);
  const expenses = getExpensesForMonth(transactions, now);
  const invested = getInvestmentsForMonth(transactions, now);
  const insights = generateInsights(transactions, recurring, investments, goals, profile, breakdown.safeToSpend);

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
    <div className="space-y-6 px-5 pb-28 pt-8 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {getGreeting()}, {profile.name} 👋
        </h1>
        <p className="text-sm text-gray-400">{formatMonthYear(now)}</p>
      </div>

      {/* Safe to Spend hero */}
      <div
        className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-200/50"
      >
        <p className="text-sm font-medium text-emerald-50">Available to spend</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {formatCurrency(breakdown.safeToSpend)}
        </p>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="mt-3 flex items-center gap-1 text-xs text-emerald-50/80 hover:text-white"
        >
          {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          How we calculated this
        </button>

        {showBreakdown && (
          <div className="mt-3 space-y-1.5 rounded-2xl bg-white/10 p-4 text-sm">
            <Row label="Current balance" value={formatCurrency(breakdown.currentMoney)} />
            <Row label="Upcoming commitments" value={`-${formatCurrency(breakdown.upcomingCommitments)}`} />
            <Row label="Upcoming SIPs" value={`-${formatCurrency(breakdown.upcomingSIPs)}`} />
            <Row label="Goal allocation" value={`-${formatCurrency(breakdown.goalAllocation)}`} />
            <div className="my-1 border-t border-white/20" />
            <Row label="Safe to spend" value={formatCurrency(breakdown.safeToSpend)} bold />
          </div>
        )}
      </div>

      {/* Income / Expenses / Investments summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Income" value={formatCurrency(income)} color="text-emerald-600" />
        <SummaryCard label="Expenses" value={formatCurrency(expenses)} color="text-gray-900" />
        <SummaryCard label="Invested" value={formatCurrency(invested)} color="text-blue-600" />
      </div>

      {/* Quick add button */}
      <button
        onClick={() => setQuickAddOpen(true)}
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
        onClose={() => setQuickAddOpen(false)}
        onConfirm={handleQuickAdd}
      />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold" : "text-emerald-50/80"}>{label}</span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
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
