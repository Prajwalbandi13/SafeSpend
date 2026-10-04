import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionEditModal } from '../components/TransactionEditModal';
import { QuickAddModal } from '../components/QuickAddModal';
import { useTransactions } from '../lib/hooks';
import { formatCurrency, formatDate } from '../lib/format';
import type { Transaction, TransactionType, ParsedTransaction } from '../lib/types';

const TYPE_FILTERS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'investment', label: 'Investments' },
  { value: 'lend', label: 'Lent' },
  { value: 'receive', label: 'Received' },
];

export function TransactionsScreen() {
  const { transactions, update, remove, add } = useTransactions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthOptions = useMemo(() => {
    const currentMonth = new Date();
    const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    return [...new Set([currentMonthKey, ...transactions.map(t => t.date.slice(0, 7))])]
      .filter(key => /^\d{4}-\d{2}$/.test(key))
      .sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.date.slice(0, 7) !== selectedMonthKey) return false;
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, search, selectedMonthKey]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups);
  }, [filtered]);

  const dailyExpenseTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.date.slice(0, 7) === selectedMonthKey) {
        totals[transaction.date] = (totals[transaction.date] ?? 0) + transaction.amount;
      }
    });
    return totals;
  }, [transactions, selectedMonthKey]);

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
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
        <label htmlFor="transaction-month" className="text-xs font-medium text-gray-500">Month</label>
        <select
          id="transaction-month"
          value={monthOptions.includes(selectedMonthKey) ? selectedMonthKey : monthOptions[0]}
          onChange={event => setSelectedMonthKey(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-400"
        >
          {monthOptions.map(monthKey => (
            <option key={monthKey} value={monthKey}>
              {new Date(`${monthKey}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500"
      >
        <SlidersHorizontal size={16} /> Filter
      </button>

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === f.value
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, txns]) => (
            <div key={date}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {formatDate(date)}
                </p>
                {(dailyExpenseTotals[date] ?? 0) > 0 && (
                  <p className="text-xs font-semibold text-red-600">
                    Expenses {formatCurrency(dailyExpenseTotals[date])}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                {txns.map(t => (
                  <TransactionItem
                    key={t.id}
                    txn={t}
                    onClick={() => setEditing(t)}
                    onDelete={() => {
                      if (window.confirm(`Delete “${t.description}”? This cannot be undone.`)) {
                        remove(t.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TransactionEditModal
        open={!!editing}
        onClose={() => setEditing(null)}
        transaction={editing}
        onSave={update}
        onDelete={remove}
      />

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onConfirm={handleQuickAdd}
      />
    </div>
  );
}
