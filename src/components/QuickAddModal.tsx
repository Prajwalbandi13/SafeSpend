import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Check, Pencil, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { parseTransaction } from '../lib/nlp';
import { formatCurrency, todayISO } from '../lib/format';
import type { ParsedTransaction, TransactionType } from '../lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (t: ParsedTransaction) => void;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Expense',
  income: 'Income',
  investment: 'Investment',
  lend: 'Money Lent',
  receive: 'Money Received',
};

const TYPE_COLORS: Record<TransactionType, string> = {
  expense: 'text-red-600 bg-red-50',
  income: 'text-emerald-600 bg-emerald-50',
  investment: 'text-blue-600 bg-blue-50',
  lend: 'text-amber-600 bg-amber-50',
  receive: 'text-emerald-600 bg-emerald-50',
};

export function QuickAddModal({ open, onClose, onConfirm }: Props) {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [listening, setListening] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!open) {
      setInput('');
      setParsed(null);
      setConfirmed(false);
      setEditing(false);
      setListening(false);
    }
  }, [open]);

  const handleParse = (text: string) => {
    if (!text.trim()) {
      setParsed(null);
      return;
    }
    setParsed(parseTransaction(text));
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput('Voice input is not supported in this browser. Please type instead.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleParse(transcript);
    };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    onConfirm(parsed);
    setConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title="Tell me what happened">
      {!confirmed ? (
        <div className="space-y-4">
          {/* Voice button */}
          <div className="flex flex-col items-center py-4">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                listening
                  ? 'bg-red-500 text-white animate-pulse scale-110'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-105'
              }`}
            >
              <Mic size={32} />
            </button>
            <p className="mt-3 text-sm text-gray-500">
              {listening ? 'Listening...' : 'Tap to speak'}
            </p>
          </div>

          {/* Text input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder="What happened with your money?"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              onClick={() => input && handleParse(input)}
              className="rounded-xl bg-gray-900 px-4 text-white hover:bg-gray-800"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Parsed preview */}
          {parsed && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[parsed.type]}`}
                >
                  {TYPE_LABELS[parsed.type]}
                </span>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>

              {editing ? (
                <EditablePreview
                  parsed={parsed}
                  onChange={setParsed}
                />
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(parsed.amount)}
                  </p>
                  <p className="text-sm text-gray-600">{parsed.description}</p>
                  <p className="text-xs text-gray-400">
                    {parsed.category} · {new Date(parsed.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={parsed.amount <= 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-40"
              >
                <Check size={18} /> Confirm
              </button>
            </div>
          )}

          {/* Examples */}
          {!parsed && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-400">Try saying:</p>
              {[
                'Spent ₹350 on lunch',
                'Got salary ₹48,000',
                'Paid ₹12,000 rent',
                'Invested ₹3,000 in PPFAS',
              ].map(ex => (
                <button
                  key={ex}
                  onClick={() => {
                    setInput(ex);
                    handleParse(ex);
                  }}
                  className="block w-full rounded-lg bg-gray-50 px-3 py-2 text-left text-xs text-gray-500 hover:bg-gray-100"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check size={32} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-sm text-gray-500">Added successfully</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(parsed!.amount)} {parsed!.description}
          </p>
        </div>
      )}
    </Modal>
  );
}

function EditablePreview({
  parsed,
  onChange,
}: {
  parsed: ParsedTransaction;
  onChange: (p: ParsedTransaction) => void;
}) {
  const types: TransactionType[] = ['expense', 'income', 'investment', 'lend', 'receive'];
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-gray-400">Type</label>
        <select
          value={parsed.type}
          onChange={e => onChange({ ...parsed, type: e.target.value as TransactionType })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        >
          {types.map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Amount</label>
        <input
          type="number"
          value={parsed.amount}
          onChange={e => onChange({ ...parsed, amount: parseFloat(e.target.value) || 0 })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Category</label>
        <input
          type="text"
          value={parsed.category}
          onChange={e => onChange({ ...parsed, category: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Description</label>
        <input
          type="text"
          value={parsed.description}
          onChange={e => onChange({ ...parsed, description: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-400">Date</label>
        <input
          type="date"
          value={parsed.date}
          onChange={e => onChange({ ...parsed, date: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>
    </div>
  );
}
