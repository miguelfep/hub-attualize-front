import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import pdf from 'pdf-parse';
import { parse as parseOfx } from 'ofx-parser';

import {
  buildSummary,
  fingerprintTransaction,
  normalizeAmount,
  normalizeDate,
  readBankTransactions,
  sortTransactions,
  writeBankTransactions,
} from 'src/lib/bank-statements';

export const runtime = 'nodejs';

const SUPPORTED_FORMATS = ['pdf', 'csv', 'ofx', 'foz'];

export async function GET() {
  const transactions = await readBankTransactions();
  return NextResponse.json(
    {
      transactions: sortTransactions(transactions),
      summary: buildSummary(transactions),
    },
    { status: 200 }
  );
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files').filter((file) => typeof file?.arrayBuffer === 'function');

    if (!files.length) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const existingTransactions = await readBankTransactions();
    const fingerprints = new Set(existingTransactions.map((tx) => tx.fingerprint));

    const batchId = randomUUID();
    const uploadedAt = new Date().toISOString();

    let importedTransactions = [];
    const errors = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const buffer = Buffer.from(await file.arrayBuffer());
      const extension = getExtension(file);

      if (!SUPPORTED_FORMATS.includes(extension)) {
        errors.push(`${file.name}: formato não suportado.`);
        // eslint-disable-next-line no-continue
        continue;
      }

      const fileMeta = buildFileMetadata(file, extension, batchId, uploadedAt);

      try {
        // eslint-disable-next-line no-await-in-loop
        const parsed = await parseFileByType({ buffer, extension, fileMeta });
        const uniqueTransactions = deduplicateTransactions(parsed, fingerprints);
        importedTransactions = importedTransactions.concat(uniqueTransactions);
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        errors.push(`${file.name}: ${(error && error.message) || 'Falha ao processar arquivo.'}`);
      }
    }

    if (!importedTransactions.length) {
      return NextResponse.json(
        {
          message: 'Nenhum lançamento válido foi encontrado.',
          errors,
        },
        { status: 400 }
      );
    }

    const updatedTransactions = sortTransactions(existingTransactions.concat(importedTransactions));
    await writeBankTransactions(updatedTransactions);

    return NextResponse.json(
      {
        message: 'Extratos importados com sucesso.',
        inserted: importedTransactions.length,
        transactions: importedTransactions,
        summary: buildSummary(updatedTransactions),
        errors,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao receber extratos bancários:', error);
    return NextResponse.json(
      {
        message: 'Não foi possível processar os extratos enviados.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { transactionId, updates } = body || {};

    if (!transactionId || !updates) {
      return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 });
    }

    const transactions = await readBankTransactions();
    const index = transactions.findIndex((tx) => tx.id === transactionId);

    if (index === -1) {
      return NextResponse.json({ message: 'Lançamento não encontrado.' }, { status: 404 });
    }

    const current = transactions[index];
    const sanitizedUpdates = sanitizeUpdates(updates);

    const updatedTransaction = {
      ...current,
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString(),
    };

    if (typeof sanitizedUpdates.conciliado === 'boolean') {
      updatedTransaction.conciliadoEm = sanitizedUpdates.conciliado ? new Date().toISOString() : null;
    }

    transactions[index] = updatedTransaction;
    await writeBankTransactions(transactions);

    return NextResponse.json(
      {
        transaction: updatedTransaction,
        summary: buildSummary(transactions),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    return NextResponse.json(
      {
        message: 'Não foi possível atualizar o lançamento.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function sanitizeUpdates(updates = {}) {
  const sanitized = {};

  if (typeof updates.conciliado === 'boolean') {
    sanitized.conciliado = updates.conciliado;
  }

  if (typeof updates.categoria === 'string') {
    sanitized.categoria = updates.categoria;
  }

  if (typeof updates.observacao === 'string') {
    sanitized.observacao = updates.observacao;
  }

  return sanitized;
}

function buildFileMetadata(file, format, batchId, uploadedAt) {
  return {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    format,
    uploadedAt,
    batchId,
  };
}

function getExtension(file) {
  return file.name?.split('.').pop()?.toLowerCase() ?? '';
}

async function parseFileByType({ buffer, extension, fileMeta }) {
  if (extension === 'csv') {
    return parseCsv(buffer.toString('utf-8'), fileMeta);
  }

  if (extension === 'pdf') {
    return parsePdf(buffer, fileMeta);
  }

  // Trata tanto ofx quanto o typo mencionado (foz)
  return parseOfxFile(buffer.toString('utf-8'), fileMeta);
}

function parseCsv(content, fileMeta) {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !!line);

  if (rows.length <= 1) {
    return [];
  }

  const delimiter = detectDelimiter(rows[0]);
  const headers = splitRow(rows[0], delimiter).map((header) => normalizeHeader(header));

  const transactions = [];

  rows.slice(1).forEach((row) => {
    const columns = splitRow(row, delimiter);
    if (!columns.length) {
      return;
    }

    const mapped = {};
    columns.forEach((value, index) => {
      mapped[headers[index] || `col_${index}`] = value;
    });

    const { date, description, amount } = extractCommonFields(mapped);
    if (!description || amount === null) {
      return;
    }

    const baseTransaction = buildTransaction({
      date,
      description,
      amount,
      fileMeta,
      categoria: mapped.categoria || 'Não classificado',
    });

    if (baseTransaction) {
      transactions.push(baseTransaction);
    }
  });

  return transactions;
}

function detectDelimiter(headerLine) {
  const candidates = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let bestScore = 0;

  candidates.forEach((delimiter) => {
    const score = headerLine.split(delimiter).length;
    if (score > bestScore) {
      bestDelimiter = delimiter;
      bestScore = score;
    }
  });

  return bestDelimiter;
}

function splitRow(row, delimiter) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (char === '"') {
      if (insideQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      // eslint-disable-next-line no-continue
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

function normalizeHeader(header = '') {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]/g, '_')
    .toLowerCase();
}

function extractCommonFields(mappedRow) {
  const date =
    mappedRow.data ||
    mappedRow.date ||
    mappedRow.dt ||
    mappedRow.data_lancamento ||
    mappedRow.data_movimento ||
    mappedRow.data_competencia;

  const description =
    mappedRow.descricao ||
    mappedRow.descricao_lancamento ||
    mappedRow.historico ||
    mappedRow.nome ||
    mappedRow.documento ||
    mappedRow.observacao ||
    mappedRow.description;

  let amount = null;

  if (mappedRow.valor) {
    amount = normalizeAmount(mappedRow.valor);
  } else if (mappedRow.credito || mappedRow.entrada) {
    amount = normalizeAmount(mappedRow.credito ?? mappedRow.entrada, { forceSign: 'positive' });
  } else if (mappedRow.debito || mappedRow.saida) {
    amount = normalizeAmount(mappedRow.debito ?? mappedRow.saida, { forceSign: 'negative' });
  } else if (mappedRow.valor_debito || mappedRow.valor_credito) {
    const debit = normalizeAmount(mappedRow.valor_debito ?? '0', { forceSign: 'negative' });
    const credit = normalizeAmount(mappedRow.valor_credito ?? '0', { forceSign: 'positive' });
    amount = credit + debit;
  }

  if (amount === null) {
    return { date: null, description: null, amount: null };
  }

  const tipo = mappedRow.tipo || mappedRow.tipo_lancamento;
  if (tipo) {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('deb')) {
      amount = Math.abs(amount) * -1;
    }
    if (lowerTipo.includes('cred') || lowerTipo.includes('ent')) {
      amount = Math.abs(amount);
    }
  }

  return { date, description, amount };
}

async function parsePdf(buffer, fileMeta) {
  const data = await pdf(buffer);
  const text = data.text.replace(/\r/g, '');
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);

  const regex = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d[\d.,]*)$/;

  const transactions = lines
    .map((line) => {
      const match = line.match(regex);
      if (!match) {
        return null;
      }
      const [, date, description, amountRaw] = match;
      const amount = normalizeAmount(amountRaw);
      if (!amount || !description) {
        return null;
      }
      return buildTransaction({ date, description, amount, fileMeta });
    })
    .filter(Boolean);

  if (!transactions.length) {
    return [
      buildTransaction({
        date: new Date().toISOString().slice(0, 10),
        description: `Extrato PDF ${fileMeta.name} (classificação manual necessária)`,
        amount: 0,
        fileMeta,
      }),
    ];
  }

  return transactions;
}

async function parseOfxFile(content, fileMeta) {
  const parsed = await parseOfx(content);

  const bankTransactions =
    parsed?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN ||
    parsed?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN ||
    [];

  const entries = Array.isArray(bankTransactions) ? bankTransactions : [bankTransactions];

  return entries
    .map((entry) => {
      if (!entry) {
        return null;
      }

      const date = parseOfxDate(entry.DTPOSTED || entry.DTUSER || entry.DTSTART);
      const description = entry.NAME || entry.MEMO || 'Lançamento OFX';
      let amount = Number(entry.TRNAMT ?? entry.AMT);

      if (Number.isNaN(amount)) {
        amount = normalizeAmount(entry.TRNAMT ?? entry.AMT ?? '0');
      }

      return buildTransaction({ date, description, amount, fileMeta });
    })
    .filter(Boolean);
}

function parseOfxDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month}-${day}`;
  }

  return normalizeDate(value);
}

function buildTransaction({ date, description, amount, fileMeta, categoria }) {
  if (amount === null || Number.isNaN(amount)) {
    return null;
  }

  const normalizedAmount = Number(amount);
  const normalizedDate = normalizeDate(date);

  const transaction = {
    id: randomUUID(),
    date: normalizedDate,
    description: description.trim(),
    amount: normalizedAmount,
    tipo: normalizedAmount >= 0 ? 'entrada' : 'saida',
    categoria: categoria || 'Não classificado',
    conciliado: false,
    observacao: '',
    sourceFile: fileMeta,
    importadoEm: fileMeta.uploadedAt,
    batchId: fileMeta.batchId,
    fingerprint: '',
  };

  transaction.fingerprint = fingerprintTransaction({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
  });

  return transaction;
}

function deduplicateTransactions(transactions, fingerprints) {
  return transactions.filter((tx) => {
    if (!tx?.fingerprint) {
      tx.fingerprint = fingerprintTransaction({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
      });
    }

    if (fingerprints.has(tx.fingerprint)) {
      return false;
    }

    fingerprints.add(tx.fingerprint);
    return true;
  });
}
