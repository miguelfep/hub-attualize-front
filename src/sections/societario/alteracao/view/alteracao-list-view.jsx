'use client'

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Box, Tab, Card, Tabs, Table, Button, Dialog, Tooltip, TableBody, IconButton } from "@mui/material";

import { paths } from "src/routes/paths";

import { useBoolean } from "src/hooks/use-boolean";
import { useSetState } from "src/hooks/use-set-state";

import { varAlpha } from "src/theme/styles";
import { getClientes } from "src/actions/clientes";
import { DashboardContent } from "src/layouts/dashboard";
import { createAlteracao, updateAlteracao, getAlteracoesSocietario } from "src/actions/societario";

import { Label } from "src/components/label";
import { toast } from 'src/components/snackbar';
import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";
import { ConfirmDialog } from "src/components/custom-dialog";
import { CustomBreadcrumbs } from "src/components/custom-breadcrumbs";
import { ClienteListDialog } from "src/components/alteracao/ClienteListDialog";
import { useTable, emptyRows, rowInPage, TableNoData, getComparator, TableEmptyRows, TableHeadCustom, TableSelectedAction, TablePaginationCustom } from "src/components/table";

import { ClienteTableFiltersResult } from "src/sections/cliente/cliente-table-filters-result";

import { AlteracaoTableRow } from "../alteracao-table-row";
import { AlteracaoTableToolbar } from "../alteracao-table-toolbar";


const TABLE_HEAD = [
  { id: 'codigo', label: 'Código', width: 20 },
  { id: 'dadosPessoais', label: 'Dados Pessoais', width: 50 },
  { id: 'nomeEmpresarial', label: 'Razão Social', width: 130 },
  { id: 'status', label: 'Status', width: 80 },
  { id: '', width: 8 },
];

export const ALTERACAO_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'iniciado', label: 'Iniciado' },
  { value: 'em_validacao', label: 'Validação' },
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'em_alteracao', label: 'Em Alteração' },
  { value: 'finalizado', label: 'Finalizado' },
];

export default function AlteracaoListView() {

  const table = useTable({ defaultDense: true, defaultRowsPerPage: 50 });

  const router = useRouter();

  const confirm = useBoolean();
  const to = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = useSetState({ nome: '', status: 'all' });

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedClient(null);
  }

  const [selectedClient, setSelectedClient] = useState(null);

  const [clientes, setClientes] = useState([]);

  useEffect(() => {

    // Função para mostrar os clientes no modal de nova alteração
    const fetchClientes = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (error) {
        toast.error('Erro ao buscar clientes');
      }
    };
    fetchClientes();
  }, []);

  // Atualiza a tabela de alterações conforme o banco
  const fetchAlteracoes = useCallback(async () => {
    try {
      const alteracoes = await getAlteracoesSocietario();
      setTableData([...alteracoes.data]);
    } catch (error) {
      toast.error('Falha em carregar as alterações');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);


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
        await updateAlteracao(id, { status: false });
        toast.success('Alteração inativada!');
        await fetchAlteracoes();
      } catch (error) {
        const msg = error?.response?.data?.message || 'Erro ao inativar alteração';
        toast.error(msg);
      } finally {
        confirm.onFalse();
      }
    },
    [fetchAlteracoes, confirm]
  );


  useEffect(() => {
    fetchAlteracoes();
  }, [fetchAlteracoes]);

  const handleActivateRow = useCallback(
    async (id) => {
      try {
        await updateAlteracao(id, { status: true });
        toast.success('Cliente ativado!');
        fetchAlteracoes();
      } catch (error) {
        toast.error('Erro ao ativar alteração');
      }
    },
    [fetchAlteracoes]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((_id) => updateAlteracao(_id, { status: false }))
      );
      toast.success('Alterações inativadas!');
      fetchAlteracoes();
    } catch (error) {
      toast.error('Erro ao inativar alterações');
    } finally {
      confirm.onFalse();
    }
  }, [table.selected, fetchAlteracoes, confirm]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.alteracao.edit(id));
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
  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Lista de Alterações"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Alterações', href: paths.dashboard.alteracao.root },
            { name: 'Todos' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenModal}
            >
              Nova Alteração
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
            {ALTERACAO_STATUS_OPTIONS.map((tab) => (
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
                      (tab.value === true && 'success') ||
                      (tab.value === false && 'warning') ||
                      (tab.value === 'lead' && 'info') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData.length
                      : tableData.filter((alteracao) => alteracao.statusAlteracao === tab.value)
                        .length}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <AlteracaoTableToolbar filters={filters} onResetPage={table.onResetPage} tableData={dataFiltered} />
          {canReset && (
            <ClienteTableFiltersResult
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
                      <AlteracaoTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onActivateRow={() => handleActivateRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onUpdate={fetchAlteracoes}
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
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="xs">
        <Box sx={{ p: 3 }}>
          <ClienteListDialog
            list={clientes}
            onClose={handleCloseModal}
            selected={(cliente) => clientes.find((c) => c._id === cliente._id)}
            onSelect={(cliente) => setSelectedClient(cliente)}
            selectedClient={selectedClient}
            action={
              <Button
                size="medium"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ alignSelf: 'flex-end' }}
                onClick={async () => {
                  if (!selectedClient) {
                    toast.error('Selecione um Cliente');
                  } else {
                    try {
                      await createAlteracao(selectedClient, { statusAlteracao: 'iniciado' });
                      setSelectedClient(null);
                      handleCloseModal();
                      toast.success('Formulário enviado com sucesso!');
                      await fetchAlteracoes();
                    } catch (error) {
                      toast.error('Erro ao enviar o formulário');
                    }
                  }
                }}
              >
                Enviar Formulário
              </Button>
            }
          />
        </Box>
      </Dialog>
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
      (alteracao) =>
        alteracao.nome?.toLowerCase().includes(nome.toLowerCase()) ||
        alteracao.codigo?.toString().includes(nome.toLowerCase()) ||
        alteracao.email?.includes(nome.toLowerCase()) ||
        alteracao.razaoSocial?.toLowerCase().includes(nome.toLowerCase())
    );
  }


  if (status !== 'all') {
    inputData = inputData.filter((alteracao) => alteracao.statusAlteracao === status);
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