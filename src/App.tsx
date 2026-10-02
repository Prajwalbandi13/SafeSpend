import { useState, useEffect } from 'react';
import { BottomNav, type TabId } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import { Onboarding } from './screens/Onboarding';
import { HomeScreen } from './screens/Home';
import { TransactionsScreen } from './screens/Transactions';
import { BudgetScreen } from './screens/Budget';
import { InvestmentsScreen } from './screens/Investments';
import { MoreScreen } from './screens/More';
import { useAllData, useProfile } from './lib/hooks';

export default function App() {
  const ready = useAllData();
  const { profile, update, refresh } = useProfile();
  const [tab, setTab] = useState<TabId>('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('safespend_theme') === 'dark');

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('safespend_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
      </div>
    );
  }

  if (!profile.onboarding_complete) {
    return (
      <div className="mx-auto max-w-md">
        <Onboarding onComplete={update} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors">
      <SideNav active={tab} onChange={setTab} />
      <main className="mx-auto max-w-md md:ml-60 md:max-w-2xl">
        {tab === 'home' && <HomeScreen />}
        {tab === 'transactions' && <TransactionsScreen />}
        {tab === 'budget' && <BudgetScreen />}
        {tab === 'investments' && <InvestmentsScreen />}
        {tab === 'more' && <MoreScreen darkMode={darkMode} onToggleDarkMode={() => setDarkMode(mode => !mode)} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
