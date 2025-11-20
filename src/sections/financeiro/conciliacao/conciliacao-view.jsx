'use client';

import { useMemo, useState, useCallback } from 'react';

import useSWR from 'swr';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { paths } from 'src/routes/paths';

import { fetcher, endpoints } from 'src/utils/axios';

import { uploadBankStatements, updateBankStatement } from 'src/actions/bank-statements';

import { BankStatementUploader } from './bank-statement-uploader';
import { BankStatementSummary } from './bank-statement-summary';
import { BankStatementTable } from './bank-statement-table';

const EMPTY_SUMMARY = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldo: 0,
  conciliados: 0,
  pendentes: 0,
  porDia: [],
  pendenciasPrioritarias: [],
};

export function ConciliacaoBancariaView() {
  const [filters, setFilters] = useState({ status: 'all', tipo: 'all', search: '' });
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { data, error, isLoading, mutate } = useSWR(endpoints.conciliacao.bankStatements, fetcher, {
    revalidateOnFocus: false,
  });

  const transactions = data?.transactions ?? [];
  const summary = data?.summary ?? EMPTY_SUMMARY;

  const filteredTransactions = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (filters.status === 'conciliado' && !transaction.conciliado) {
        return false;
      }
      if (filters.status === 'pendente' && transaction.conciliado) {
        return false;
      }
      if (filters.tipo !== 'all' && transaction.tipo !== filters.tipo) {
        return false;
      }
      if (searchTerm) {
        const haystack = `${transaction.description ?? ''} ${transaction.sourceFile?.name ?? ''}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, filters]);

  const handleUpload = useCallback(
    async (fileList) => {
      if (!fileList?.length) {
        setFeedback({ type: 'error', message: 'Selecione ao menos um arquivo para importar.' });
        return;
      }

      setUploading(true);
      setFeedback(null);

      try {
        await uploadBankStatements(fileList);
        setFeedback({ type: 'success', message: 'Importação concluída com sucesso.' });
        mutate();
      } catch (err) {
        setFeedback({ type: 'error', message: extractErrorMessage(err) });
      } finally {
        setUploading(false);
      }
    },
    [mutate]
  );

  const handleToggleConciliado = useCallback(
    async (transaction) => {
      try {
        await updateBankStatement(transaction.id, { conciliado: !transaction.conciliado });
        mutate();
      } catch (err) {
        setFeedback({ type: 'error', message: extractErrorMessage(err) });
      }
    },
    [mutate]
  );

  const handleCategoriaChange = useCallback(
    async (transaction, categoria) => {
      try {
        await updateBankStatement(transaction.id, { categoria });
        mutate();
      } catch (err) {
        setFeedback({ type: 'error', message: extractErrorMessage(err) });
      }
    },
    [mutate]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Conciliação bancária"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Financeiro', href: paths.dashboard.financeiro.root },
          { name: 'Conciliação bancária' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {error && (
          <Alert severity="error">
            Não foi possível carregar os extratos bancários. Recarregue a página ou tente novamente mais tarde.
          </Alert>
        )}

        <BankStatementUploader feedback={feedback} uploading={uploading} onUpload={handleUpload} />

        <BankStatementSummary summary={summary} loading={isLoading && !transactions.length} />

        <BankStatementTable
          transactions={filteredTransactions}
          totalCount={transactions.length}
          loading={isLoading || uploading}
          filters={filters}
          onFiltersChange={setFilters}
          onToggleConciliado={handleToggleConciliado}
          onCategoriaChange={handleCategoriaChange}
        />
      </Stack>
    </DashboardContent>
  );
}

function extractErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Erro inesperado ao processar extratos.';
}
