'use client';

import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { createAbertura, updateAbertura, getAberturasSocietario } from 'src/actions/societario';
import { formatPhone, formatCpf } from 'src/utils/format-input';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { AberturaTableRow } from './abertura-table-row';
import { AberturaTableToolbar } from '../abertura-table-toolbar';
import { AberturaTableFiltersResult } from './abertura-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nomeEmpresarial', label: 'Nome Empresarial', width: 130 },
  { id: 'email', label: 'Email', width: 100 },
  { id: 'statusAbertura', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

export const ABERTURA_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Iniciado', label: 'Iniciado' },
  { value: 'em_validacao', label: 'Validação' },
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'em_constituicao', label: 'Em Constituição' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'finalizado', label: 'Finalizado' },
];

// ----------------------------------------------------------------------

export function AberturasListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();

  const [openModal, setOpenModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = useSetState({ nome: '', status: 'all' });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const { register, handleSubmit, reset, watch, control } = useForm();

  const onSubmit = async (data) => {
    try {
      await createAbertura(data);
      toast.success('Abertura criada com sucesso!');
      fetchAberturas();
      handleCloseModal();
      reset();
    } catch (error) {
      console.log(error);

      toast.error('Erro ao criar abertura');
    }
  };

  const fetchAberturas = useCallback(async () => {
    try {
      const aberturas = await getAberturasSocietario();

      if (aberturas) {
        setTableData(aberturas.data);
      } else {
        setTableData([]); // Se não for um array, inicialize como um array vazio
        console.error("Expected 'getAberturasSocietario' to return an array.");
      }
    } catch (error) {
      toast.error('Falha ao buscar aberturas');
      setTableData([]); // Em caso de erro, inicialize como um array vazio
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAberturas();
  }, [fetchAberturas]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!filters.state.nome || filters.state.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await updateAbertura(id, { statusAbertura: 'Inativo' });
        toast.success('Abertura inativada!');
        fetchAberturas();
      } catch (error) {
        toast.error('Erro ao inativar abertura');
      } finally {
        confirm.onFalse();
      }
    },
    [fetchAberturas, confirm]
  );

  const handleActivateRow = useCallback(
    async (id) => {
      try {
        await updateAbertura(id, { statusAbertura: 'Ativo' });
        toast.success('Abertura ativada!');
        fetchAberturas();
      } catch (error) {
        toast.error('Erro ao ativar abertura');
      }
    },
    [fetchAberturas]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => updateAbertura(id, { statusAbertura: 'Inativo' }))
      );
      toast.success('Aberturas inativadas!');
      fetchAberturas();
    } catch (error) {
      toast.error('Erro ao inativar aberturas');
    } finally {
      confirm.onFalse();
    }
  }, [table.selected, fetchAberturas, confirm]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.aberturas.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  const notificarWhats = watch('notificarWhats');

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Lista de Aberturas"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Aberturas', href: paths.dashboard.aberturas.root },
            { name: 'Todas' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenModal}
            >
              Nova Abertura
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={filters.state.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {ABERTURA_STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'Iniciado' && 'info') ||
                      (tab.value === 'Em andamento' && 'warning') ||
                      (tab.value === 'Finalizado' && 'success') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((abertura) => abertura.statusAbertura === tab.value)
                          .length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <AberturaTableToolbar filters={filters} onResetPage={table.onResetPage} />

          {canReset && (
            <AberturaTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row._id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <AberturaTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onActivateRow={() => handleActivateRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onUpdate={fetchAberturas}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" component="h2">
            Criar Nova Abertura
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Nome"
              {...register('nome', { required: true })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              {...register('email', { required: true })}
              margin="normal"
            />
            <Controller
              name="telefone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefone"
                  fullWidth
                  margin="normal"
                  value={field.value || ''}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              )}
            />
            <Controller
              name="cpf"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CPF"
                  fullWidth
                  margin="normal"
                  value={field.value || ''}
                  onChange={(e) => {
                    const formatted = formatCpf(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              )}
            />

            <Controller
              name="valorMensalidade"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <NumericFormat
                  {...field}
                  customInput={TextField}
                  label="Valor Mensalidade"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  value={field.value}
                  onValueChange={(values) => field.onChange(values.floatValue)}
                  fullWidth
                  margin="normal"
                />
              )}
            />
            <FormControlLabel
              control={<Switch {...register('notificarWhats')} color="primary" />}
              label="Notificar pelo WhatsApp"
              sx={{ mt: 2 }}
            />
            <Button variant="contained" type="submit" sx={{ mt: 3 }}>
              Criar
            </Button>
          </form>
        </Box>
      </Modal>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Tem certeza que quer deletar <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Deletar
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { nome, status } = filters;

  // Verifica se inputData é um array, caso contrário, inicializa como um array vazio
  if (!Array.isArray(inputData)) {
    inputData = [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (nome) {
    inputData = inputData.filter(
      (abertura) =>
        abertura.nome.toLowerCase().includes(nome.toLowerCase()) ||
        abertura.nomeEmpresarial?.toLowerCase().includes(nome.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((abertura) => abertura.statusAbertura === status);
  }

  return inputData;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};
