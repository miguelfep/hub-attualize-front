'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
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
import { useGetFilaApuracao } from 'src/actions/apuracao';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ApuracaoHabilitacaoDialog } from '../components/apuracao-habilitacao-dialog';
import { MESES, anexoLabel, anosDisponiveis, competenciaAtual } from '../../fator-r/utils';

const TABLE_HEAD = [
  { id: 'nome', label: 'Cliente' },
  { id: 'enquadramento', label: 'Enquadramento', width: 200 },
  { id: 'status', label: 'Situação', width: 150 },
  { id: 'pendencias', label: 'Pendências' },
  { id: 'total', label: 'Total apurado', width: 150 },
];

/** `nao_iniciada` é estado da fila, não do model — por isso não vem de utils. */
const STATUS_TABS = [
  { value: 'all', label: 'Todos', color: 'default' },
  { value: 'erro', label: 'Com erro', color: 'error' },
  { value: 'nao_iniciada', label: 'Não iniciadas', color: 'default' },
  { value: 'rascunho', label: 'Em rascunho', color: 'warning' },
  { value: 'revisada', label: 'Aprovadas', color: 'info' },
  { value: 'transmitida', label: 'Transmitidas', color: 'success' },
];

function statusInfo(status) {
  return STATUS_TABS.find((t) => t.value === status) ?? { label: status, color: 'default' };
}

export function ApuracaoFilaView() {
  const router = useRouter();
  const inicial = competenciaAtual();

  // A fila trabalha o mês FECHADO: por padrão o anterior ao corrente.
  const anterior = inicial.mes === 1 ? 12 : inicial.mes - 1;
  const anoAnterior = inicial.mes === 1 ? inicial.ano - 1 : inicial.ano;

  const [ano, setAno] = useState(anoAnterior);
  const [mes, setMes] = useState(anterior);
  const [status, setStatus] = useState('all');
  const [habilitando, setHabilitando] = useState(false);

  const { itens, totais, filaLoading, refetchFila } = useGetFilaApuracao({
    ano,
    mes,
    status: status === 'all' ? undefined : status,
  });

  const handleCompetencia = useCallback((setter) => (event) => setter(Number(event.target.value)), []);

  const totalGeral = Object.values(totais).reduce((s, n) => s + n, 0);
  const pendentes = totalGeral - (totais.transmitida ?? 0);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Apuração de impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              onClick={() => refetchFila()}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setHabilitando(true)}
            >
              Habilitar clientes
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!filaLoading && totalGeral === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nenhum cliente habilitado na apuração. Use “Habilitar clientes” para escolher quem entra
          nesta fila.
        </Alert>
      )}

      {!filaLoading && totalGeral > 0 && (
        <Alert severity={pendentes === 0 ? 'success' : 'info'} sx={{ mb: 3 }}>
          {pendentes === 0
            ? `Fechamento concluído: todas as ${totalGeral} apurações da competência foram transmitidas.`
            : `${pendentes} de ${totalGeral} apurações ainda pendentes nesta competência.`}
        </Alert>
      )}

      <Card>
        <Tabs
          value={status}
          onChange={(_e, novo) => setStatus(novo)}
          sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}` }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{tab.label}</span>
                  <Label variant="soft" color={tab.color}>
                    {tab.value === 'all' ? totalGeral : (totais[tab.value] ?? 0)}
                  </Label>
                </Stack>
              }
            />
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

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Competência</InputLabel>
            <Select value={mes} label="Competência" onChange={handleCompetencia(setMes)}>
              {MESES.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Scrollbar>
          <TableContainer sx={{ overflow: 'auto' }}>
            <Table size="medium" sx={{ minWidth: 900 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {filaLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {TABLE_HEAD.map((col) => (
                          <TableCell key={col.id}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : itens.map((item) => (
                      <TableRow
                        key={item.clienteId}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() =>
                          router.push(paths.dashboard.fiscal.fatorR.details(item.clienteId))
                        }
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" noWrap>
                              {item.razaoSocial || item.nome}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.cnpj || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">
                              {item.anexoAplicavel
                                ? anexoLabel(item.anexoAplicavel)
                                : item.tributacao.map(anexoLabel).join(', ') || '—'}
                            </Typography>
                            {item.dependeDoFatorR && (
                              <Tooltip title="Anexo definido pelo Fator R — depende da folha estar lançada">
                                <Label variant="soft" color="warning">
                                  Fator R
                                </Label>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Label variant="soft" color={statusInfo(item.status).color}>
                            {statusInfo(item.status).label}
                          </Label>
                        </TableCell>

                        <TableCell>
                          {item.pendencias.length ? (
                            <Tooltip title={item.pendencias.join(' ')}>
                              <Typography variant="body2" sx={{ color: 'warning.main' }} noWrap>
                                {item.pendencias.length} pendência(s)
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                              —
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.totalDevido ? fCurrency(item.totalDevido) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {!filaLoading && !itens.length && totalGeral > 0 && (
          <Box sx={{ p: 3 }}>
            <EmptyContent filled title="Nenhuma apuração nesta situação" sx={{ py: 6 }} />
          </Box>
        )}
      </Card>

      <ApuracaoHabilitacaoDialog
        open={habilitando}
        onClose={() => setHabilitando(false)}
        onSaved={refetchFila}
      />
    </DashboardContent>
  );
}
