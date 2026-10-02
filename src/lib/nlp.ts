import type { ParsedTransaction, TransactionType } from './types';
import { todayISO } from './format';

const EXPENSE_CATEGORIES: Record<string, string[]> = {
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'snack', 'tea', 'coffee', 'restaurant', 'cafe', 'pizza', 'burger', 'zomato', 'swiggy', 'meal', 'eat', 'hungry'],
  Transport: ['petrol', 'diesel', 'fuel', 'cab', 'uber', 'ola', 'auto', 'bus', 'train', 'metro', 'rickshaw', 'bike', 'parking', 'toll'],
  Shopping: ['shopping', 'clothes', 'shirt', 'shoes', 'amazon', 'flipkart', 'myntra', 'mall', 'purchase', 'bought'],
  Bills: ['bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'recharge', 'mobile', 'broadband', 'dth'],
  Entertainment: ['movie', 'netflix', 'hotstar', 'prime', 'spotify', 'game', 'concert', 'party', 'drinks', 'pub', 'outing'],
  Health: ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical', 'health', 'gym', 'fitness', 'clinic'],
  Education: ['book', 'course', 'udemy', 'coursera', 'class', 'tuition', 'exam', 'fee', 'college', 'school'],
  Rent: ['rent', 'lease'],
  Utilities: ['utility', 'utilities', 'maintenance', 'society', 'cleaning', 'laundry'],
};

const INCOME_CATEGORIES: Record<string, string[]> = {
  Salary: ['salary', 'paycheck', 'wages', 'stipend'],
  Freelance: ['freelance', 'client', 'project', 'consulting', 'gig'],
  Interest: ['interest', 'fd interest', 'savings interest'],
  Refund: ['refund', 'returned', 'reversal', 'cashback', 'reimbursement'],
};

const INVESTMENT_KEYWORDS: Record<string, string[]> = {
  'Mutual Fund': ['mutual fund', 'mf', 'parag parikh', 'ppfas', 'flexi cap', 'index fund', 'bluechip'],
  SIP: ['sip', 'systematic investment'],
  Stock: ['stock', 'share', 'equity', 'nifty', 'sensex'],
  FD: ['fd', 'fixed deposit', 'rd', 'recurring deposit'],
  Gold: ['gold', 'sovereign gold', 'gold bond'],
  NPS: ['nps', 'pension', 'national pension'],
};

const LEND_KEYWORDS = ['lent', 'owe', 'borrowed', 'gave', 'lended'];
const RECEIVE_KEYWORDS = ['returned', 'gave back', 'paid back', 'received back', 'got back'];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  if (LEND_KEYWORDS.some(k => lower.includes(k))) return 'lend';
  if (RECEIVE_KEYWORDS.some(k => lower.includes(k))) return 'receive';
  if (Object.values(INVESTMENT_KEYWORDS).some(keywords => keywords.some(k => lower.includes(k)))) return 'investment';
  if (lower.includes('salary') || lower.includes('income') || lower.includes('got ') || lower.includes('received ') || lower.includes('earned')) return 'income';
  return 'expense';
}

function detectCategory(text: string, type: TransactionType): string {
  const lower = text.toLowerCase();
  if (type === 'expense' || type === 'income') {
    const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    for (const [cat, keywords] of Object.entries(cats)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return type === 'expense' ? 'Other' : 'Other';
  }
  if (type === 'investment') {
    for (const [cat, keywords] of Object.entries(INVESTMENT_KEYWORDS)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return 'Other';
  }
  return 'Other';
}

function detectAmount(text: string): number {
  const patterns = [
    /(?:₹|rs\.?|rupees?)\s*([\d,]+)/i,
    /([\d,]+)\s*(?:₹|rs\.?|rupees?)/i,
    /([\d,]+)\s*(?:bucks|inr)/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return parseFloat(match[1].replace(/,/g, ''));
  }
  const plainMatch = text.match(/\b(\d{2,})\b/);
  if (plainMatch) return parseFloat(plainMatch[1]);
  return 0;
}

function detectDescription(text: string): string {
  let cleaned = text
    .replace(/^(spent|paid|got|received|invested|bought|i spent|i paid|i got|i received|i invested|i bought)\s*/i, '')
    .replace(/(?:₹|rs\.?|rupees?)\s*[\d,]+/i, '')
    .replace(/[\d,]+\s*(?:₹|rs\.?|rupees?)/i, '')
    .replace(/\b(on|for|in|to|from|the|a|an)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) cleaned = 'Transaction';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function parseTransaction(text: string): ParsedTransaction {
  const type = detectType(text);
  const amount = detectAmount(text);
  const category = detectCategory(text, type);
  const description = detectDescription(text);
  return { type, amount, category, description, date: todayISO() };
}
