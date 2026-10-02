import { useState, useRef, useEffect } from 'react';
import { Send, Shield, User, MessageCircle, Trash2, RotateCcw } from 'lucide-react';
import { useProfile, useTransactions, useRecurring, useInvestments, useGoals, useDebts } from '../lib/hooks';
import { answerQuery } from '../lib/askMoney';
import { resetAllData } from '../lib/storage';
import type { Profile, SalaryFrequency } from '../lib/types';

export function MoreScreen() {
  const { profile, update } = useProfile();
  const { transactions } = useTransactions();
  const { recurring } = useRecurring();
  const { investments } = useInvestments();
  const { goals } = useGoals();
  const { debts } = useDebts();
  const [section, setSection] = useState<'menu' | 'ask' | 'privacy' | 'profile'>('menu');
  const [resetConfirm, setResetConfirm] = useState(false);

  if (section === 'ask') {
    return <AskMoney onBack={() => setSection('menu')} transactions={transactions} recurring={recurring} investments={investments} goals={goals} debts={debts} profile={profile} />;
  }

  if (section === 'privacy') {
    return <Privacy onBack={() => setSection('menu')} onReset={() => { resetAllData(); window.location.reload(); }} resetConfirm={resetConfirm} setResetConfirm={setResetConfirm} />;
  }

  if (section === 'profile') {
    return <ProfileSettings profile={profile} onUpdate={update} onBack={() => setSection('menu')} />;
  }

  return (
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">More</h1>

      <div className="space-y-2">
        <MenuButton icon={MessageCircle} label="Ask Your Money" desc="Ask questions about your finances" onClick={() => setSection('ask')} />
        <MenuButton icon={User} label="Profile & Settings" desc="Name, income, salary details" onClick={() => setSection('profile')} />
        <MenuButton icon={Shield} label="Privacy" desc="Your data stays on your device" onClick={() => setSection('privacy')} />
      </div>

      <div className="mt-8 rounded-xl bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-400">SafeSpend · Know what you can spend</p>
        <p className="mt-1 text-xs text-gray-300">v1.0.0</p>
      </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left hover:border-gray-200">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
        <Icon size={20} className="text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </button>
  );
}

function AskMoney({ onBack, transactions, recurring, investments, goals, debts, profile }: any) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Ask me anything about your money. Try "How much did I spend on food this month?"' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    const answer = answerQuery(userMsg, transactions, recurring, investments, goals, debts, profile);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: answer }]);
    }, 300);
  };

  const suggestions = [
    'How much did I spend on food this month?',
    'How much have I invested this year?',
    'What are my biggest expenses?',
    'Can I afford ₹5,000?',
    'How much do people owe me?',
    'When is my next SIP?',
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <button onClick={onBack} className="text-sm text-gray-500">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Ask Your Money</h1>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 px-5 pb-2">
          {suggestions.map(s => (
            <button key={s} onClick={() => { setInput(s); }} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your money..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
        />
        <button onClick={send} className="rounded-xl bg-emerald-500 px-4 text-white hover:bg-emerald-600">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function Privacy({ onBack, onReset, resetConfirm, setResetConfirm }: any) {
  return (
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Privacy</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Shield size={20} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Your data is private</h2>
          </div>
          <p className="text-sm text-gray-500">
            All your financial data is stored locally on your device. We don't connect to your bank accounts, 
            and nothing is sent to any server.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-gray-900">What we never collect</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• Bank passwords or credentials</li>
            <li>• UPI IDs or payment app access</li>
            <li>• SMS or call logs</li>
            <li>• Contacts</li>
            <li>• Government IDs</li>
            <li>• Brokerage credentials</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <h2 className="mb-2 text-sm font-bold text-red-900">Danger zone</h2>
          <p className="mb-3 text-sm text-red-700">
            This will permanently delete all your data and reset the app to demo mode.
          </p>
          {!resetConfirm ? (
            <button onClick={() => setResetConfirm(true)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">
              <RotateCcw size={16} /> Reset all data
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={onReset} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                <Trash2 size={16} /> Yes, delete everything
              </button>
              <button onClick={() => setResetConfirm(false)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ profile, onUpdate, onBack }: { profile: Profile; onUpdate: (p: Partial<Profile>) => void; onBack: () => void }) {
  const [name, setName] = useState(profile.name);
  const [income, setIncome] = useState(String(profile.monthly_income));
  const [salaryDay, setSalaryDay] = useState(profile.salary_day);
  const [salaryFreq, setSalaryFreq] = useState<SalaryFrequency>(profile.salary_frequency);

  const save = () => {
    onUpdate({
      name: name || 'Friend',
      monthly_income: parseFloat(income) || 0,
      salary_day: salaryDay,
      salary_frequency: salaryFreq,
    });
    onBack();
  };

  return (
    <div className="px-5 pb-28 pt-8 md:pb-8">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-500">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-gray-400">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Monthly income</label>
          <div className="flex items-center rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-emerald-400">
            <span className="text-gray-400">₹</span>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="ml-2 w-full text-sm outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Salary frequency</label>
          <select value={salaryFreq} onChange={e => setSalaryFreq(e.target.value as SalaryFrequency)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
            <option value="monthly">Monthly</option>
            <option value="twice_monthly">Twice a month</option>
            <option value="weekly">Weekly</option>
            <option value="irregular">Irregular</option>
            <option value="student">Student / no fixed income</option>
          </select>
        </div>
        {salaryFreq === 'monthly' && (
          <div>
            <label className="mb-1 block text-xs text-gray-400">Salary day</label>
            <select value={salaryDay} onChange={e => setSalaryDay(parseInt(e.target.value))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}th of every month</option>
              ))}
            </select>
          </div>
        )}
        <button onClick={save} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
          Save Changes
        </button>
      </div>
    </div>
  );
}
