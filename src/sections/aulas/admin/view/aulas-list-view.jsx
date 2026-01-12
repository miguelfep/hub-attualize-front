'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'src/routes/hooks';

import {
  Box,
  Card,
  Table,
  Button,
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

import { deletarAula } from 'src/actions/onboarding';

import { AulaTableRow, AulaTableToolbar } from '../aula-table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'titulo', label: 'Título', width: 250 },
  { id: 'tipo', label: 'Tipo', width: 120 },
  { id: 'obrigatoria', label: 'Obrigatória', width: 100 },
  { id: 'ativo', label: 'Status', width: 100 },
  { id: 'tags', label: 'Tags', width: 150 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function AulasListView({ aulas: initialAulas, error }) {
  const table = useTable();
  const router = useRouter();
  const [tableData, setTableData] = useState(initialAulas || []);
  const confirmDialog = useBoolean();

  const [aulaToDelete, setAulaToDelete] = useState(null);

  const handleNewRow = useCallback(() => {
    router.push(paths.aulas.new);
  }, [router]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.aulas.edit(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback((id) => {
    setAulaToDelete(id);
    confirmDialog.onTrue();
  }, [confirmDialog]);

  const handleConfirmDelete = useCallback(async () => {
    if (!aulaToDelete) return;

    try {
      const response = await deletarAula(aulaToDelete);
      if (response.data?.success) {
        toast.success('Aula deletada com sucesso!');
        setTableData((prev) => prev.filter((aula) => aula._id !== aulaToDelete));
      } else {
        // Verifica se há erro sobre aula em uso
        if (response.data?.data?.onboardings) {
          const onboardings = response.data.data.onboardings;
          toast.error(
            `Não é possível deletar a aula. Ela está sendo usada em ${onboardings.length} onboarding(s).`
          );
        } else {
          toast.error(response.data?.message || 'Erro ao deletar aula');
        }
      }
    } catch (error) {
      console.error('Erro ao deletar aula:', error);
      if (error.response?.data?.data?.onboardings) {
        const onboardings = error.response.data.data.onboardings;
        toast.error(
          `Não é possível deletar a aula. Ela está sendo usada em ${onboardings.length} onboarding(s).`
        );
      } else {
        toast.error('Erro ao deletar aula. Tente novamente.');
      }
    } finally {
      confirmDialog.onFalse();
      setAulaToDelete(null);
    }
  }, [aulaToDelete, confirmDialog]);

  if (error) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Aulas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Aulas', href: paths.aulas.root },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card sx={{ p: 3 }}>
          <Box sx={{ color: 'error.main' }}>
            Erro ao carregar aulas. Tente novamente mais tarde.
          </Box>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Aulas"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Aulas', href: paths.aulas.root },
        ]}
        action={
          <Button
            onClick={handleNewRow}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nova Aula
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <AulaTableToolbar />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <AulaTableRow
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
                    <AulaTableRow
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

        <TablePagination
          page={table.page}
          count={tableData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Deletar Aula"
        content="Tem certeza que deseja deletar esta aula? Esta ação não pode ser desfeita."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Deletar
          </Button>
        }
      />
    </DashboardContent>
  );
}

