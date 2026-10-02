import { useState } from 'react';
import { Plus, Trash2, Target, TrendingUp, Pencil } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useInvestments, useGoals } from '../lib/hooks';
import { formatCurrency, formatDate, daysBetween, todayISO } from '../lib/format';
import type { InvestmentType, Investment, Goal } from '../lib/types';

const INV_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'sip', label: 'SIP' },
  { value: 'stock', label: 'Stock' },
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'gold', label: 'Gold' },
  { value: 'nps', label: 'NPS' },
  { value: 'other', label: 'Other' },
];

export function InvestmentsScreen() {
  const { investments, add: addInv, remove: removeInv, update: updateInv } = useInvestments();
  const { goals, add: addGoal, remove: removeGoal, update: updateGoal } = useGoals();
  const [invModal, setInvModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const totalInvested = investments.reduce((s, i) => s + i.amount_invested, 0);
  const totalValue = investments.reduce((s, i) => s + i.current_value, 0);
  const gain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  return (
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Investments</h1>

      {/* Portfolio summary */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm text-gray-400">Total invested</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
          <div>
            <p className="text-xs text-gray-400">Current value</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Gain</p>
            <p className={`text-lg font-semibold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
            </p>
            <p className={`text-xs ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {gain >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Investments list */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Holdings</h2>
          <button onClick={() => setInvModal(true)} className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {investments.map(inv => (
            <button
              key={inv.id}
              onClick={() => setEditingInv(inv)}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left hover:border-gray-200"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{inv.name}</p>
                <p className="text-xs text-gray-400">
                  {INV_TYPES.find(t => t.value === inv.type)?.label}
                  {inv.sip_amount ? ` · SIP ${formatCurrency(inv.sip_amount)}` : ''}
                </p>
                {inv.next_sip_date && (
                  <p className="mt-1 text-xs text-blue-500">Next SIP: {formatDate(inv.next_sip_date)}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.current_value)}</p>
                <p className={`text-xs ${(inv.current_value - inv.amount_invested) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {inv.current_value - inv.amount_invested >= 0 ? '+' : ''}
                  {formatCurrency(inv.current_value - inv.amount_invested)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Target size={16} /> Goals
          </h2>
          <button onClick={() => setGoalModal(true)} className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <Plus size={16} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {goals.map(g => {
            const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0;
            const remaining = g.target_amount - g.current_amount;
            const monthsLeft = g.target_date ? Math.max(1, daysBetween(new Date(), g.target_date) / 30) : 0;
            const monthlyNeeded = g.target_date && remaining > 0 ? remaining / monthsLeft : 0;
            return (
              <button
                key={g.id}
                onClick={() => setEditingGoal(g)}
                className="block w-full rounded-2xl border border-gray-100 bg-white p-4 text-left"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-400">{pct.toFixed(0)}%</p>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(g.current_amount)}</span>
                  <span>{formatCurrency(g.target_amount)}</span>
                </div>
                {g.target_date && (
                  <p className="mt-2 text-xs text-gray-400">
                    Target: {formatDate(g.target_date)} · Need {formatCurrency(monthlyNeeded)}/month
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <InvestmentModal
        open={invModal || !!editingInv}
        onClose={() => { setInvModal(false); setEditingInv(null); }}
        investment={editingInv}
        onAdd={addInv}
        onUpdate={updateInv}
        onDelete={removeInv}
      />
      <GoalModal
        open={goalModal || !!editingGoal}
        onClose={() => { setGoalModal(false); setEditingGoal(null); }}
        goal={editingGoal}
        onAdd={addGoal}
        onUpdate={updateGoal}
        onDelete={removeGoal}
      />
    </div>
  );
}

function InvestmentModal({
  open, onClose, investment, onAdd, onUpdate, onDelete,
}: {
  open: boolean;
  onClose: () => void;
  investment: Investment | null;
  onAdd: (i: any) => void;
  onUpdate: (id: string, patch: Partial<Investment>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('mutual_fund');
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');
  const [sipAmount, setSipAmount] = useState('');
  const [sipFreq, setSipFreq] = useState('monthly');
  const [nextSip, setNextSip] = useState('');
  const [started, setStarted] = useState('');

  // Sync when editing
  useState(() => {
    if (investment) {
      setName(investment.name);
      setType(investment.type);
      setInvested(String(investment.amount_invested));
      setCurrent(String(investment.current_value));
      setSipAmount(investment.sip_amount ? String(investment.sip_amount) : '');
      setSipFreq(investment.sip_frequency || 'monthly');
      setNextSip(investment.next_sip_date || '');
      setStarted(investment.started_date || '');
    }
  });

  const handleSave = () => {
    if (!name || !invested) return;
    const data = {
      name,
      type,
      amount_invested: parseFloat(invested),
      current_value: parseFloat(current) || parseFloat(invested),
      sip_amount: sipAmount ? parseFloat(sipAmount) : null,
      sip_frequency: sipAmount ? sipFreq as any : null,
      next_sip_date: sipAmount ? nextSip || null : null,
      started_date: started || null,
    };
    if (investment) {
      onUpdate(investment.id, data);
    } else {
      onAdd(data);
    }
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName(''); setType('mutual_fund'); setInvested(''); setCurrent('');
    setSipAmount(''); setSipFreq('monthly'); setNextSip(''); setStarted('');
  };

  return (
    <Modal open={open} onClose={() => { onClose(); resetForm(); }} title={investment ? 'Edit Investment' : 'Add Investment'}>
      <div className="space-y-4">
        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="PPFAS Flexi Cap" className={inputCls} />
        </Field>
        <Field label="Type">
          <select value={type} onChange={e => setType(e.target.value as InvestmentType)} className={inputCls}>
            {INV_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount Invested">
            <input type="number" value={invested} onChange={e => setInvested(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Current Value">
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">SIP Details (optional)</p>
          <div className="space-y-3">
            <input type="number" value={sipAmount} onChange={e => setSipAmount(e.target.value)} placeholder="SIP amount" className={inputCls} />
            <select value={sipFreq} onChange={e => setSipFreq(e.target.value)} className={inputCls}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <input type="date" value={nextSip} onChange={e => setNextSip(e.target.value)} className={inputCls} />
          </div>
        </div>
        <Field label="Started date">
          <input type="date" value={started} onChange={e => setStarted(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex gap-3">
          {investment && (
            <button onClick={() => { onDelete(investment.id); onClose(); resetForm(); }} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={handleSave} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
            {investment ? 'Save' : 'Add Investment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function GoalModal({
  open, onClose, goal, onAdd, onUpdate, onDelete,
}: {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
  onAdd: (g: any) => void;
  onUpdate: (id: string, patch: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [date, setDate] = useState('');

  useState(() => {
    if (goal) {
      setName(goal.name);
      setTarget(String(goal.target_amount));
      setCurrent(String(goal.current_amount));
      setDate(goal.target_date || '');
    }
  });

  const handleSave = () => {
    if (!name || !target) return;
    const data = {
      name,
      target_amount: parseFloat(target),
      current_amount: parseFloat(current) || 0,
      target_date: date || null,
    };
    if (goal) {
      onUpdate(goal.id, data);
    } else {
      onAdd(data);
    }
    onClose();
    setName(''); setTarget(''); setCurrent(''); setDate('');
  };

  return (
    <Modal open={open} onClose={onClose} title={goal ? 'Edit Goal' : 'Add Goal'}>
      <div className="space-y-4">
        <Field label="Goal name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Japan Trip" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target amount">
            <input type="number" value={target} onChange={e => setTarget(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Current amount">
            <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Target date">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex gap-3">
          {goal && (
            <button onClick={() => { onDelete(goal.id); onClose(); }} className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={handleSave} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
            {goal ? 'Save' : 'Add Goal'}
          </button>
        </div>
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
