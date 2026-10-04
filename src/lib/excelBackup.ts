import * as XLSX from '@e965/xlsx';
import * as storage from './storage';
import type { Debt, Goal, Investment, Profile, RecurringPayment, Transaction } from './types';

const SHEETS = {
    info: 'Backup Info',
    profile: 'Profile',
    transactions: 'Transactions',
    recurring: 'Recurring',
    investments: 'Investments',
    goals: 'Goals',
    debts: 'Debts',
} as const;

export interface AppBackup {
    profile: Profile;
    transactions: Transaction[];
    recurring: RecurringPayment[];
    investments: Investment[];
    goals: Goal[];
    debts: Debt[];
}

export function createExcelBackup(): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const sheets: [string, object[]][] = [
        [SHEETS.info, [{ app: 'SafeSpend', formatVersion: 1, exportedAt: new Date().toISOString() }]],
        [SHEETS.profile, [storage.getProfile()]],
        [SHEETS.transactions, storage.getTransactions()],
        [SHEETS.recurring, storage.getRecurring()],
        [SHEETS.investments, storage.getInvestments()],
        [SHEETS.goals, storage.getGoals()],
        [SHEETS.debts, storage.getDebts()],
    ];

    for (const [name, rows] of sheets) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), name);
    }
    return workbook;
}

export function downloadExcelBackup(fileName: string): void {
    XLSX.writeFile(createExcelBackup(), fileName);
}

export function encodeExcelBackup(): string {
    return XLSX.write(createExcelBackup(), { bookType: 'xlsx', type: 'base64' });
}

export function parseExcelBackup(data: ArrayBuffer): AppBackup {
    const workbook = XLSX.read(data, { type: 'array' });
    const requiredSheets = Object.values(SHEETS);
    const missingSheets = requiredSheets.filter(name => !workbook.Sheets[name]);
    if (missingSheets.length > 0) {
        throw new Error('This file is not a complete SafeSpend backup. Export a new backup from the app and try again.');
    }

    const info = readRows(workbook, SHEETS.info)[0];
    if (info?.app !== 'SafeSpend' || Number(info.formatVersion) !== 1) {
        throw new Error('This Excel file is not a supported SafeSpend backup.');
    }

    const profile = readRows(workbook, SHEETS.profile)[0];
    if (
        !profile ||
        typeof profile.id !== 'string' ||
        typeof profile.name !== 'string' ||
        typeof profile.currency !== 'string' ||
        typeof profile.salary_frequency !== 'string' ||
        typeof profile.salary_day !== 'number' ||
        typeof profile.monthly_income !== 'number' ||
        typeof profile.onboarding_complete !== 'boolean' ||
        typeof profile.created_at !== 'string'
    ) {
        throw new Error('The backup does not contain a valid profile.');
    }

    return {
        profile: profile as unknown as Profile,
        transactions: validateRows<Transaction>(workbook, SHEETS.transactions, ['id', 'type', 'category', 'description', 'date', 'created_at'], ['amount']),
        recurring: validateRows<RecurringPayment>(workbook, SHEETS.recurring, ['id', 'name', 'frequency', 'next_date', 'category', 'created_at'], ['amount']),
        investments: validateRows<Investment>(workbook, SHEETS.investments, ['id', 'name', 'type', 'created_at'], ['amount_invested', 'current_value']),
        goals: validateRows<Goal>(workbook, SHEETS.goals, ['id', 'name', 'created_at'], ['target_amount', 'current_amount']),
        debts: validateRows<Debt>(workbook, SHEETS.debts, ['id', 'person', 'direction', 'status', 'created_at'], ['amount']),
    };
}

export function restoreExcelBackup(backup: AppBackup): void {
    storage.saveProfile(backup.profile);
    storage.saveTransactions(backup.transactions);
    storage.saveRecurring(backup.recurring);
    storage.saveInvestments(backup.investments);
    storage.saveGoals(backup.goals);
    storage.saveDebts(backup.debts);
    localStorage.setItem('pf_initialized', 'true');
}

function readRows(workbook: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
}

function validateRows<T>(
    workbook: XLSX.WorkBook,
    sheetName: string,
    stringFields: string[],
    numberFields: string[]
): T[] {
    const rows = readRows(workbook, sheetName);
    const valid = rows.every(row =>
        stringFields.every(field => typeof row[field] === 'string') &&
        numberFields.every(field => typeof row[field] === 'number' && Number.isFinite(row[field]))
    );
    if (!valid) {
        throw new Error(`The ${sheetName} sheet has invalid or missing data.`);
    }
    return rows as unknown as T[];
}
