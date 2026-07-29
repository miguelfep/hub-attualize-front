'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetMonitoramento } from 'src/actions/fator-r';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import {
  MESES,
  riscoColor,
  riscoLabel,
  anexoColor,
  anexoLabel,
  fatorRPercent,
  RISCO_OPTIONS,
  anosDisponiveis,
  competenciaAtual,
  distanciaDoLimiar,
} from '../utils';

const TABLE_HEAD = [
  { id: 'nome', label: 'Cliente' },
  { id: 'fatorR', label: 'Fator R', width: 140 },
  { id: 'distancia', label: 'Distância do limite', width: 170 },
  { id: 'anexo', label: 'Anexo apurado', width: 150 },
  { id: 'rbt12', label: 'RBT12', width: 150 },
  { id: 'dados', label: 'Dados', width: 130 },
];

const TABS = [{ value: 'all', label: 'Todos' }, ...RISCO_OPTIONS];

export function FatorRListView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 20 });

  const inicial = competenciaAtual();
  const [ano, setAno] = useState(inicial.ano);
  const [mes, setMes] = useState(inicial.mes);
  const [risco, setRisco] = useState('all');

  const { clientes, total, monitoramentoLoading, refetchMonitoramento } = useGetMonitoramento({
    ano,
    mes,
    risco: risco === 'all' ? undefined : risco,
    page: table.page + 1,
    limit: table.rowsPerPage,
  });

  const handleRisco = useCallback(
    (_event, novo) => {
      setRisco(novo);
      table.onResetPage();
    },
    [table]
  );

  const handleCompetencia = useCallback(
    (setter) => (event) => {
      setter(Number(event.target.value));
      table.onResetPage();
    },
    [table]
  );

  const notFound = !monitoramentoLoading && !clientes.length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Fator R"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Fator R' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:refresh-fill" />}
            onClick={() => refetchMonitoramento()}
          >
            Atualizar
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={risco}
          onChange={handleRisco}
          sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}` }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Ano</InputLabel>
            <Select value={ano} label="Ano" onChange={handleCompetencia(setAno)}>
              {anosDisponiveis().map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Mês de apuração</InputLabel>
            <Select value={mes} label="Mês de apuração" onChange={handleCompetencia(setMes)}>
              {MESES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Scrollbar>
          <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {monitoramentoLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {TABLE_HEAD.map((col) => (
                        <TableCell key={col.id}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <>
                    {clientes.map((cliente) => (
                      <ClienteRow
                        key={cliente.clienteId}
                        cliente={cliente}
                        onClick={() =>
                          router.push(paths.dashboard.fiscal.fatorR.details(cliente.clienteId))
                        }
                      />
                    ))}
                    <TableNoData notFound={notFound} />
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {notFound && (
          <EmptyContent
            filled
            title="Nenhum cliente nesta faixa"
            description="Ajuste a competência ou o filtro de risco."
            sx={{ py: 6 }}
          />
        )}

        <TablePaginationCustom
          count={total}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </DashboardContent>
  );
}

function ClienteRow({ cliente, onClick }) {
  const distancia = distanciaDoLimiar(cliente.fatorR);

  // O anexo apurado divergir do cadastro é exposição fiscal, não detalhe visual.
  const divergeCadastro =
    cliente.fatorR !== null &&
    !cliente.hibrido &&
    Array.isArray(cliente.tributacao) &&
    cliente.tributacao.length > 0 &&
    !cliente.tributacao.includes(cliente.anexoAplicavel);

  return (
    <TableRow hover onClick={onClick} sx={{ cursor: 'pointer' }}>
      <TableCell>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" noWrap>
              {cliente.razaoSocial || cliente.nome}
            </Typography>
            {cliente.hibrido && (
              <Tooltip title="Receita em mais de um anexo — estimativas de economia ficam superestimadas">
                <Label variant="soft" color="warning">
                  Híbrido
                </Label>
              </Tooltip>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {cliente.cnpj || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={riscoColor(cliente.risco)}>
          {fatorRPercent(cliente.fatorR)}
        </Label>
      </TableCell>

      <TableCell>
        {distancia === null ? (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {riscoLabel(cliente.risco)}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: distancia < 0 ? 'error.main' : 'text.secondary' }}
          >
            {distancia >= 0 ? '+' : ''}
            {distancia.toFixed(1).replace('.', ',')} p.p.
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Label variant="soft" color={anexoColor(cliente.anexoAplicavel)}>
            {anexoLabel(cliente.anexoAplicavel)}
          </Label>
          {divergeCadastro && (
            <Tooltip title={`Cadastro: ${cliente.tributacao.join(', ')}`}>
              <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'warning.main' }} />
            </Tooltip>
          )}
        </Stack>
      </TableCell>

      <TableCell>{fCurrency(cliente.rbt12)}</TableCell>

      <TableCell>
        {cliente.dadosIncompletos ? (
          <Tooltip title="Janela de 12 meses incompleta — o Fator R não é confiável">
            <Label variant="soft" color="warning">
              Incompletos
            </Label>
          </Tooltip>
        ) : (
          <Label variant="soft" color="success">
            Completos
          </Label>
        )}
      </TableCell>
    </TableRow>
  );
}
