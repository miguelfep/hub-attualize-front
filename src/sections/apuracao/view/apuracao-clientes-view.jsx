'use client';

import { useMemo, useState } from 'react';
import NextLink from 'next/link';

import {
  Alert,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useGetAllClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard/main';
import { Iconify } from 'src/components/iconify';

function formatCnpj(value) {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '').padStart(14, '0');
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
}

function getRegimeLabel(regime) {
  if (!regime) return '—';
  const map = {
    simples: 'Simples Nacional',
    presumido: 'Lucro Presumido',
    real: 'Lucro Real',
    pf: 'Pessoa Física',
  };
  return map[regime] || regime;
}

export function ApuracaoClientesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFatorR, setFiltroFatorR] = useState('todos');

  const { data, isLoading } = useGetAllClientes({
    apurarHub: true,
    status: true,
    tipoContato: 'cliente',
  });

  const clientes = useMemo(() => (Array.isArray(data) ? data : data?.data || []), [data]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return clientes
      .filter((cliente) => {
        // Suportar tanto settings.apuracao.apurarHub quanto apurarHub direto (compatibilidade)
        return cliente.settings?.apuracao?.apurarHub || cliente.apurarHub;
      })
      .filter((cliente) => {
        if (!term) return true;
        return (
          cliente.nome?.toLowerCase().includes(term) ||
          cliente.nomeFantasia?.toLowerCase().includes(term) ||
          cliente.cnpj?.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
        );
      })
      .filter((cliente) => {
        if (filtroFatorR === 'todos') return true;
        // Suportar tanto settings.apuracao.habilitarFatorR quanto habilitarFatorR direto (compatibilidade)
        const habilitado = Boolean(cliente.settings?.apuracao?.habilitarFatorR || cliente.habilitarFatorR);
        return filtroFatorR === 'sim' ? habilitado : !habilitado;
      })
      .sort((a, b) => a.nome?.localeCompare(b.nome || '') || 0);
  }, [clientes, filtroFatorR, searchTerm]);

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h4">Clientes com Apuração Hub</Typography>
            <Typography variant="body2" color="text.secondary">
              Consulte quais clientes estão habilitados para a apuração de impostos e acesse rapidamente o painel
              individual.
            </Typography>
          </Stack>
        </Stack>

        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                placeholder="Buscar por nome ou CNPJ"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-bold" width={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Simulador Fator R"
                value={filtroFatorR}
                onChange={(event) => setFiltroFatorR(event.target.value)}
                sx={{ width: { xs: '100%', md: 220 } }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="sim">Habilitado</MenuItem>
                <MenuItem value="nao">Desabilitado</MenuItem>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="svg-spinners:90-ring" width={20} />
                <Typography variant="body2">Carregando clientes...</Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              {filtered.length === 0 ? (
                <Alert severity="info">
                  Nenhum cliente habilitado para apuração encontrado com os filtros selecionados.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell>CNPJ</TableCell>
                        <TableCell>Regime</TableCell>
                        <TableCell>Fator R</TableCell>
                        <TableCell>Gera DAS</TableCell>
                        <TableCell>Última atualização</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((cliente) => (
                        <TableRow key={cliente._id} hover>
                          <TableCell>
                            <Stack>
                              <Typography variant="subtitle2">{cliente.nome || cliente.nomeFantasia}</Typography>
                              {cliente.nomeFantasia && cliente.nome && (
                                <Typography variant="caption" color="text.secondary">
                                  {cliente.nomeFantasia}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{formatCnpj(cliente.cnpj)}</TableCell>
                          <TableCell>{getRegimeLabel(cliente.regimeTributario)}</TableCell>
                          <TableCell>
                            <Chip
                              label={(cliente.settings?.apuracao?.habilitarFatorR || cliente.habilitarFatorR) ? 'Habilitado' : 'Desabilitado'}
                              color={(cliente.settings?.apuracao?.habilitarFatorR || cliente.habilitarFatorR) ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(cliente.settings?.apuracao?.gerarDasAutomatico || cliente.gerarDasAutomatico) ? 'Automático' : 'Manual'}
                              color={(cliente.settings?.apuracao?.gerarDasAutomatico || cliente.gerarDasAutomatico) ? 'info' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {cliente.updatedAt
                                ? new Date(cliente.updatedAt).toLocaleDateString('pt-BR')
                                : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="Abrir Apuração">
                                <IconButton
                                  color="primary"
                                  component={NextLink}
                                  href={paths.dashboard.cliente.apuracao(cliente._id)}
                                >
                                  <Iconify icon="solar:chart-2-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar Cliente">
                                <IconButton
                                  color="default"
                                  component={NextLink}
                                  href={paths.dashboard.cliente.edit(cliente._id)}
                                >
                                  <Iconify icon="solar:pen-bold" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </DashboardContent>
  );
}

export default ApuracaoClientesView;


