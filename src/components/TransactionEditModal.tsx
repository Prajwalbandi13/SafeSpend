import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Trash2 } from 'lucide-react';
import type { Transaction, TransactionType } from '../lib/types';
import { todayISO } from '../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (id: string, patch: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Expense',
  income: 'Income',
  investment: 'Investment',
  lend: 'Money Lent',
  receive: 'Money Received',
};

const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Rent', 'Utilities', 'Other'];
const INCOME_CATS = ['Salary', 'Freelance', 'Interest', 'Refund', 'Other'];
const INVEST_CATS = ['Mutual Fund', 'SIP', 'Stock', 'FD', 'Gold', 'NPS', 'Other'];

export function TransactionEditModal({ open, onClose, transaction, onSave, onDelete }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = () => {
    onSave(transaction.id, { type, amount, category, description, date });
    onClose();
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    onClose();
  };

  const cats = type === 'expense' ? EXPENSE_CATS : type === 'income' ? INCOME_CATS : type === 'investment' ? INVEST_CATS : ['Other'];

  return (
    <Modal open={open} onClose={onClose} title="Edit Transaction">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Type</label>
          <select
            value={type}
            onChange={e => {
              const newType = e.target.value as TransactionType;
              setType(newType);
              const newCats = newType === 'expense' ? EXPENSE_CATS : newType === 'income' ? INCOME_CATS : newType === 'investment' ? INVEST_CATS : ['Other'];
              if (!newCats.includes(category)) setCategory(newCats[0]);
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          >
            {(Object.keys(TYPE_LABELS) as TransactionType[]).map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          >
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
