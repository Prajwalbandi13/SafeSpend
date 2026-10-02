import type { Transaction } from '../lib/types';
import { formatCurrency } from '../lib/format';

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔',
  Transport: '⛽',
  Shopping: '🛍️',
  Bills: '🧾',
  Entertainment: '🎬',
  Health: '💊',
  Education: '📚',
  Rent: '🏠',
  Utilities: '💡',
  Salary: '💼',
  Freelance: '💻',
  Interest: '🏦',
  Refund: '↩️',
  'Mutual Fund': '📊',
  SIP: '📈',
  Stock: '📉',
  FD: '🔒',
  Gold: '🥇',
  NPS: '👴',
  Other: '💰',
};

export function TransactionItem({
  txn,
  onClick,
}: {
  txn: Transaction;
  onClick: () => void;
}) {
  const isPositive = txn.type === 'income' || txn.type === 'receive';
  const sign = isPositive ? '+' : '';
  const icon = CATEGORY_ICONS[txn.category] || '💰';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 text-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{txn.description}</p>
        <p className="text-xs text-gray-400">{txn.category}</p>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-bold ${
            isPositive ? 'text-emerald-600' : 'text-gray-900'
          }`}
        >
          {sign}
          {formatCurrency(txn.amount)}
        </p>
      </div>
    </button>
  );
}
