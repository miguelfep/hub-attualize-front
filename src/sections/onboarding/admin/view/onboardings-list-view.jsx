'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'src/routes/hooks';

import {
  Box,
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { TableNoData } from 'src/components/table';

import { toast } from 'sonner';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTable } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

import { deletarOnboarding } from 'src/actions/onboarding';

import { OnboardingTableRow, OnboardingTableToolbar } from '../onboarding-table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'tipoEmpresa', label: 'Tipo de Empresa', width: 150 },
  { id: 'aulas', label: 'Aulas', width: 100 },
  { id: 'ativo', label: 'Status', width: 100 },
  { id: 'ordem', label: 'Ordem', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function OnboardingsListView({ onboardings: initialOnboardings, error }) {
  const table = useTable();
  const router = useRouter();
  const [tableData, setTableData] = useState(initialOnboardings || []);
  const [onboardingToDelete, setOnboardingToDelete] = useState(null);
  const confirmDialog = useBoolean();

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.onboarding.edit(id));
    },
    [router]
  );

  const handleNewRow = useCallback(() => {
    router.push(paths.onboarding.new);
  }, [router]);

  const handleDeleteRow = useCallback((id) => {
    setOnboardingToDelete(id);
    confirmDialog.onTrue();
  }, [confirmDialog]);

  const handleConfirmDelete = useCallback(async () => {
    if (!onboardingToDelete) return;

    try {
      await deletarOnboarding(onboardingToDelete);
      toast.success('Onboarding deletado com sucesso!');
      setTableData((prev) => prev.filter((item) => item._id !== onboardingToDelete));
      setOnboardingToDelete(null);
      confirmDialog.onFalse();
    } catch (error) {
      console.error('Erro ao deletar onboarding:', error);
      toast.error('Erro ao deletar onboarding. Tente novamente.');
    }
  }, [onboardingToDelete, confirmDialog]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Onboardings"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Onboardings', href: paths.onboarding.root },
        ]}
        action={
          <Button
            onClick={handleNewRow}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Novo Onboarding
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <OnboardingTableToolbar />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <OnboardingTableRow
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSelectRow={(checked) => {
                  if (checked === 'selectAll') {
                    table.onSelectAllRows(true, tableData.map((row) => row._id));
                  } else if (checked === 'deselectAll') {
                    table.onSelectAllRows(false, []);
                  }
                }}
              />
              <TableBody>
                {tableData.length === 0 ? (
                  <TableNoData notFound={tableData.length === 0} />
                ) : (
                  tableData.map((row) => (
                    <OnboardingTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <Box sx={{ position: 'relative' }}>
          <TablePagination
            component="div"
            count={tableData.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Box>
      </Card>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Deletar Onboarding"
        content="Tem certeza que deseja deletar este onboarding? Esta ação não pode ser desfeita."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Deletar
          </Button>
        }
      />
    </DashboardContent>
  );
}

