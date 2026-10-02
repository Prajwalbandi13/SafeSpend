import { useState } from 'react';
import { Plus, Trash2, Repeat, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useProfile, useRecurring, useTransactions, useInvestments, useGoals } from '../lib/hooks';
import { calculateSafeToSpend, getNextSalaryDate } from '../lib/finance';
import { formatCurrency, formatDate, daysBetween, todayISO } from '../lib/format';
import type { RecurringFrequency } from '../lib/types';

export function BudgetScreen() {
  const { profile } = useProfile();
  const { recurring, add, remove } = useRecurring();
  const { transactions } = useTransactions();
  const { investments } = useInvestments();
  const { goals } = useGoals();
  const [addOpen, setAddOpen] = useState(false);

  const breakdown = calculateSafeToSpend(transactions, recurring, investments, goals, profile);
  const nextSalary = getNextSalaryDate(profile);
  const daysToSalary = daysBetween(new Date(), nextSalary);

  return (
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Budget</h1>

      {/* Next salary card */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={16} /> Next salary
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(profile.monthly_income)}</p>
        <p className="text-sm text-emerald-600">in {daysToSalary} days</p>
        <p className="mt-1 text-xs text-gray-400">
          {nextSalary.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Upcoming commitments */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-gray-900">Upcoming commitments</h2>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          {recurring.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No recurring payments yet</p>
          ) : (
            <>
              {recurring
                .slice()
                .sort((a, b) => new Date(a.next_date).getTime() - new Date(b.next_date).getTime())
                .map(r => (
                  <div key={r.id} className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50">
                        <Repeat size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(r.next_date)} · {r.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(r.amount)}</span>
                      <button
                        onClick={() => remove(r.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(recurring.reduce((s, r) => s + r.amount, 0))}
                </span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600"
        >
          <Plus size={16} /> Add recurring payment
        </button>
      </div>

      {/* Safe to spend */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
        <p className="text-sm font-medium text-emerald-50">Safe to spend</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(breakdown.safeToSpend)}</p>
        <p className="mt-2 text-xs text-emerald-50/80">
          This is your estimated flexible money after accounting for upcoming commitments.
        </p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-white p-4">
        <BreakRow label="Current money" value={formatCurrency(breakdown.currentMoney)} />
        <BreakRow label="Upcoming commitments" value={`-${formatCurrency(breakdown.upcomingCommitments)}`} />
        <BreakRow label="Upcoming SIPs" value={`-${formatCurrency(breakdown.upcomingSIPs)}`} />
        <BreakRow label="Goal allocation" value={`-${formatCurrency(breakdown.goalAllocation)}`} />
        <div className="my-1 border-t border-gray-100" />
        <BreakRow label="Safe to spend" value={formatCurrency(breakdown.safeToSpend)} bold />
      </div>

      <AddRecurringModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={add}
      />
    </div>
  );
}

function BreakRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-500"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{value}</span>
    </div>
  );
}

const FREQS: RecurringFrequency[] = ['weekly', 'monthly', 'quarterly', 'yearly'];
const CATS = ['Rent', 'Bills', 'Entertainment', 'Investment', 'Insurance', 'Loan EMI', 'Subscription', 'Other'];

function AddRecurringModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (r: { name: string; amount: number; frequency: RecurringFrequency; next_date: string; category: string }) => void;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [freq, setFreq] = useState<RecurringFrequency>('monthly');
  const [nextDate, setNextDate] = useState(todayISO());
  const [category, setCategory] = useState('Rent');

  const handleAdd = () => {
    if (!name || !amount) return;
    onAdd({ name, amount: parseFloat(amount), frequency: freq, next_date: nextDate, category });
    setName(''); setAmount('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Recurring Payment">
      <div className="space-y-4">
        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rent" className={inputCls} />
        </Field>
        <Field label="Amount">
          <div className="flex items-center rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-emerald-400">
            <span className="text-gray-400">₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="12,000" className="ml-2 w-full text-sm outline-none" />
          </div>
        </Field>
        <Field label="Frequency">
          <select value={freq} onChange={e => setFreq(e.target.value as RecurringFrequency)} className={inputCls}>
            {FREQS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
        </Field>
        <Field label="Category">
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Next payment date">
          <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className={inputCls} />
        </Field>
        <button onClick={handleAdd} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
          Add Recurring Payment
        </button>
      </div>
    </Modal>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      {children}
    </div>
  );
}
