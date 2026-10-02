import type {
  Profile,
  Transaction,
  RecurringPayment,
  Investment,
  Goal,
  Debt,
} from './types';

interface DemoData {
  profile: Profile;
  transactions: Transaction[];
  recurring: RecurringPayment[];
  investments: Investment[];
  goals: Goal[];
  debts: Debt[];
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function futureDate(days: number): string {
  return dateOffset(days);
}

export function seedDemoData(): DemoData {
  const now = new Date();
  const thisMonth = (day: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    return d.toISOString().split('T')[0];
  };
  const lastMonth = (day: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, day);
    return d.toISOString().split('T')[0];
  };

  const profile: Profile = {
    id: crypto.randomUUID(),
    name: 'Prajwal',
    currency: 'INR',
    salary_frequency: 'monthly',
    salary_day: 5,
    monthly_income: 48000,
    onboarding_complete: true,
    created_at: new Date().toISOString(),
  };

  const transactions: Transaction[] = [
    // This month
    { id: crypto.randomUUID(), type: 'income', amount: 48000, category: 'Salary', description: 'Salary', date: thisMonth(5), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 12000, category: 'Rent', description: 'Rent', date: thisMonth(5), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 350, category: 'Food', description: 'Lunch', date: dateOffset(-1), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 500, category: 'Transport', description: 'Petrol', date: dateOffset(-1), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 280, category: 'Food', description: 'Breakfast', date: dateOffset(-2), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 1200, category: 'Bills', description: 'Electricity bill', date: dateOffset(-3), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 649, category: 'Entertainment', description: 'Netflix', date: dateOffset(-4), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 1500, category: 'Shopping', description: 'T-shirt', date: dateOffset(-5), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 450, category: 'Transport', description: 'Uber', date: dateOffset(-6), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 320, category: 'Food', description: 'Dinner', date: dateOffset(-7), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'investment', amount: 3000, category: 'SIP', description: 'PPFAS Flexi Cap', date: thisMonth(5), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'lend', amount: 800, category: 'Other', description: 'Rahul borrowed', date: dateOffset(-8), recurring: false, notes: null, created_at: new Date().toISOString() },
    // Last month
    { id: crypto.randomUUID(), type: 'expense', amount: 3800, category: 'Food', description: 'Food (last month)', date: lastMonth(15), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 2500, category: 'Transport', description: 'Transport (last month)', date: lastMonth(15), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'expense', amount: 5000, category: 'Shopping', description: 'Shopping (last month)', date: lastMonth(10), recurring: false, notes: null, created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), type: 'income', amount: 48000, category: 'Salary', description: 'Salary', date: lastMonth(5), recurring: false, notes: null, created_at: new Date().toISOString() },
  ];

  const recurring: RecurringPayment[] = [
    { id: crypto.randomUUID(), name: 'Rent', amount: 12000, frequency: 'monthly', next_date: futureDate(5), category: 'Rent', created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'PPFAS SIP', amount: 3000, frequency: 'monthly', next_date: futureDate(5), category: 'Investment', created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Electricity', amount: 1200, frequency: 'monthly', next_date: futureDate(12), category: 'Bills', created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Netflix', amount: 649, frequency: 'monthly', next_date: futureDate(18), category: 'Entertainment', created_at: new Date().toISOString() },
  ];

  const investments: Investment[] = [
    { id: crypto.randomUUID(), name: 'PPFAS Flexi Cap', type: 'sip', amount_invested: 60000, current_value: 67200, sip_amount: 3000, sip_frequency: 'monthly', next_sip_date: futureDate(5), started_date: dateOffset(-60), created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Parag Parikh Flexi Cap', type: 'mutual_fund', amount_invested: 45000, current_value: 51250, sip_amount: null, sip_frequency: null, next_sip_date: null, started_date: dateOffset(-90), created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'SBI FD', type: 'fd', amount_invested: 20000, current_value: 20500, sip_amount: null, sip_frequency: null, next_sip_date: null, started_date: dateOffset(-120), created_at: new Date().toISOString() },
  ];

  const goals: Goal[] = [
    { id: crypto.randomUUID(), name: 'Japan Trip', target_amount: 200000, current_amount: 65000, target_date: futureDate(330), created_at: new Date().toISOString() },
    { id: crypto.randomUUID(), name: 'Emergency Fund', target_amount: 100000, current_amount: 40000, target_date: futureDate(180), created_at: new Date().toISOString() },
  ];

  const debts: Debt[] = [
    { id: crypto.randomUUID(), person: 'Rahul', amount: 800, direction: 'lend', status: 'active', notes: 'Borrowed for lunch', created_at: new Date().toISOString() },
  ];

  return { profile, transactions, recurring, investments, goals, debts };
}
