import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { Profile, SalaryFrequency } from '../lib/types';

interface Props {
  onComplete: (profile: Partial<Profile>) => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [salaryFreq, setSalaryFreq] = useState<SalaryFrequency>('monthly');
  const [salaryDay, setSalaryDay] = useState(5);
  const [invests, setInvests] = useState<boolean | null>(null);

  const steps = ['name', 'income', 'salary', 'commitments', 'invest'];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const skip = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    onComplete({
      name: name || 'Friend',
      monthly_income: parseFloat(income) || 0,
      salary_frequency: salaryFreq,
      salary_day: salaryDay,
      onboarding_complete: true,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-12">
      {/* Progress dots */}
      <div className="mb-10 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-emerald-500' : 'bg-gray-100'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to SafeSpend</h1>
              <p className="mt-2 text-sm text-gray-500">
                Know what you can spend. Track your money without the spreadsheet.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">What's your monthly income?</h1>
              <p className="mt-2 text-sm text-gray-500">
                This helps us calculate what you can safely spend.
              </p>
            </div>
            <div>
              <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                <span className="text-lg text-gray-400">₹</span>
                <input
                  type="number"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  placeholder="48,000"
                  autoFocus
                  className="ml-2 w-full text-lg font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">When do you get paid?</h1>
              <p className="mt-2 text-sm text-gray-500">
                We'll budget around your payday, not the calendar month.
              </p>
            </div>
            <div className="space-y-2">
              {([
                ['monthly', 'Monthly'],
                ['twice_monthly', 'Twice a month'],
                ['weekly', 'Weekly'],
                ['irregular', 'Irregular'],
                ['student', 'Student / no fixed income'],
              ] as [SalaryFrequency, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSalaryFreq(val)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    salaryFreq === val
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {salaryFreq === 'monthly' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Salary day
                </label>
                <select
                  value={salaryDay}
                  onChange={e => setSalaryDay(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}th of every month</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Regular commitments?</h1>
              <p className="mt-2 text-sm text-gray-500">
                Like rent, SIPs, or subscriptions. You can add these later too.
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                You can add recurring payments anytime from the Budget tab.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Do you currently invest?</h1>
              <p className="mt-2 text-sm text-gray-500">
                SIPs, mutual funds, stocks — we'll help you track them.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setInvests(true); next(); }}
                className="flex-1 rounded-xl border border-gray-200 py-4 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
              >
                Yes
              </button>
              <button
                onClick={() => { setInvests(false); next(); }}
                className="flex-1 rounded-xl border border-gray-200 py-4 text-sm font-semibold text-gray-700 hover:border-emerald-400 hover:bg-emerald-50"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      {step !== 4 && (
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={skip}
            className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600"
          >
            <ChevronRight size={16} /> Skip
          </button>
          <button
            onClick={next}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 active:scale-95"
          >
            {step === 0 ? 'Get Started' : 'Continue'} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
