import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'bank-statements.json');

const EMPTY_STATE = { transactions: [] };

async function ensureStorageFile() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  try {
    await fs.access(STORAGE_FILE);
  } catch (error) {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(EMPTY_STATE, null, 2));
  }
}

export async function readBankTransactions() {
  await ensureStorageFile();
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf-8');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.transactions) ? parsed.transactions : [];
  } catch (error) {
    console.error('Falha ao ler extratos salvos:', error);
    return [];
  }
}

export async function writeBankTransactions(transactions) {
  await ensureStorageFile();
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify(
      {
        transactions,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

export function normalizeDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split('/');
    return `${year}-${month}-${day}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(stringValue)) {
    const [day, month, year] = stringValue.split('-');
    return `${year}-${month}-${day}`;
  }

  const date = new Date(stringValue);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

export function normalizeAmount(value = 0, options = {}) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  let sanitized = value.replace(/\s/g, '');
  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  if (hasComma && hasDot) {
    sanitized = sanitized.replace(/\./g, '').replace(/,/g, '.');
  } else if (hasComma) {
    sanitized = sanitized.replace(/,/g, '.');
  }

  sanitized = sanitized.replace(/[^\d.-]/g, '');

  const parsed = Number.parseFloat(sanitized);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  if (options.forceSign === 'negative') {
    return Math.abs(parsed) * -1;
  }

  if (options.forceSign === 'positive') {
    return Math.abs(parsed);
  }

  return parsed;
}

export function fingerprintTransaction({ date, description, amount }) {
  return crypto
    .createHash('sha1')
    .update(`${date}|${description}|${amount}`)
    .digest('hex');
}

export function buildSummary(transactions = []) {
  const summary = {
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    conciliados: 0,
    pendentes: 0,
    porDia: [],
    pendenciasPrioritarias: [],
  };

  if (!transactions.length) {
    return summary;
  }

  const groupedByDate = new Map();

  transactions.forEach((tx) => {
    summary.saldo += tx.amount;
    if (tx.amount >= 0) {
      summary.totalEntradas += tx.amount;
    } else {
      summary.totalSaidas += Math.abs(tx.amount);
    }

    if (tx.conciliado) {
      summary.conciliados += 1;
    } else {
      summary.pendentes += 1;
    }

    const entry = groupedByDate.get(tx.date) ?? {
      date: tx.date,
      credit: 0,
      debit: 0,
      saldo: 0,
    };

    if (tx.amount >= 0) {
      entry.credit += tx.amount;
    } else {
      entry.debit += Math.abs(tx.amount);
    }
    entry.saldo += tx.amount;

    groupedByDate.set(tx.date, entry);
  });

  summary.porDia = Array.from(groupedByDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  summary.pendenciasPrioritarias = transactions
    .filter((tx) => !tx.conciliado)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return summary;
}

export function sortTransactions(transactions = []) {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
