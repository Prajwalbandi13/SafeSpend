import { useState, useEffect, useCallback } from 'react';
import * as storage from './storage';
import type {
  Profile,
  Transaction,
  RecurringPayment,
  Investment,
  Goal,
  Debt,
} from './types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => storage.getProfile());

  const update = useCallback((patch: Partial<Profile>) => {
    const updated = storage.updateProfile(patch);
    setProfile(updated);
  }, []);

  const refresh = useCallback(() => setProfile(storage.getProfile()), []);

  return { profile, update, refresh };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    storage.getTransactions()
  );

  const refresh = useCallback(
    () => setTransactions(storage.getTransactions()),
    []
  );

  const add = useCallback(
    (t: Omit<Transaction, 'id' | 'created_at'>) => {
      storage.addTransaction(t);
      refresh();
    },
    [refresh]
  );

  const update = useCallback(
    (id: string, patch: Partial<Transaction>) => {
      storage.updateTransaction(id, patch);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteTransaction(id);
      refresh();
    },
    [refresh]
  );

  return { transactions, add, update, remove, refresh };
}

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringPayment[]>(() =>
    storage.getRecurring()
  );

  const refresh = useCallback(
    () => setRecurring(storage.getRecurring()),
    []
  );

  const add = useCallback(
    (r: Omit<RecurringPayment, 'id' | 'created_at'>) => {
      storage.addRecurring(r);
      refresh();
    },
    [refresh]
  );

  const update = useCallback(
    (id: string, patch: Partial<RecurringPayment>) => {
      storage.updateRecurring(id, patch);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteRecurring(id);
      refresh();
    },
    [refresh]
  );

  return { recurring, add, update, remove, refresh };
}

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>(() =>
    storage.getInvestments()
  );

  const refresh = useCallback(
    () => setInvestments(storage.getInvestments()),
    []
  );

  const add = useCallback(
    (i: Omit<Investment, 'id' | 'created_at'>) => {
      storage.addInvestment(i);
      refresh();
    },
    [refresh]
  );

  const update = useCallback(
    (id: string, patch: Partial<Investment>) => {
      storage.updateInvestment(id, patch);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteInvestment(id);
      refresh();
    },
    [refresh]
  );

  return { investments, add, update, remove, refresh };
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals());

  const refresh = useCallback(() => setGoals(storage.getGoals()), []);

  const add = useCallback(
    (g: Omit<Goal, 'id' | 'created_at'>) => {
      storage.addGoal(g);
      refresh();
    },
    [refresh]
  );

  const update = useCallback(
    (id: string, patch: Partial<Goal>) => {
      storage.updateGoal(id, patch);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteGoal(id);
      refresh();
    },
    [refresh]
  );

  return { goals, add, update, remove, refresh };
}

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>(() => storage.getDebts());

  const refresh = useCallback(() => setDebts(storage.getDebts()), []);

  const add = useCallback(
    (d: Omit<Debt, 'id' | 'created_at'>) => {
      storage.addDebt(d);
      refresh();
    },
    [refresh]
  );

  const update = useCallback(
    (id: string, patch: Partial<Debt>) => {
      storage.updateDebt(id, patch);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      storage.deleteDebt(id);
      refresh();
    },
    [refresh]
  );

  return { debts, add, update, remove, refresh };
}

export function useAllData() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    storage.initIfNeeded();
    setReady(true);
  }, []);

  return ready;
}
