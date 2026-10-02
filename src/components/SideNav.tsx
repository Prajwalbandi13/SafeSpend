import { Home, ArrowLeftRight, Wallet, TrendingUp, MoreHorizontal } from 'lucide-react';
import type { TabId } from './BottomNav';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export function SideNav({ active, onChange }: Props) {
  return (
    <nav className="hidden md:flex md:fixed md:left-0 md:top-0 md:bottom-0 md:w-60 md:flex-col md:border-r md:border-gray-100 md:bg-white md:py-8 md:px-4">
      <div className="mb-8 px-4">
        <h1 className="text-lg font-bold text-gray-900">SafeSpend</h1>
        <p className="text-xs text-gray-400">Know what you can spend</p>
      </div>
      <div className="flex flex-col gap-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
