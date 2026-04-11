'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatCPF } from 'src/utils/format-number';

import { usePortalFuncionarios } from 'src/actions/departamento-pessoal';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChipStatusVinculo, ChipStatusCadastro, ChipStatusDemissao, useDpPortalContext } from '../dp-shared';

// ----------------------------------------------------------------------

function errMessage(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro ao carregar dados';
}

export function PortalDpListView() {
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();

  const [statusCadastro, setStatusCadastro] = useState('');
  const params = statusCadastro ? { statusCadastro } : {};
  const { data: funcionarios, isLoading, error } = usePortalFuncionarios(clienteProprietarioId, params);

  const show403 = error && (error?.status === 403 || String(errMessage(error)).includes('403'));

  if (loadingEmpresas || !clienteProprietarioId) {
    return (
      <Typography sx={{ p: 2 }} variant="body2" color="text.secondary">
        Carregando…
      </Typography>
    );
  }

  if (!enabled) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        O módulo Departamento Pessoal não está habilitado para esta empresa. Entre em contato com a Attualize
        para ativar o cadastro de funcionários.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1">
            Funcionários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastro enviado para aprovação do escritório. Acompanhe o status abaixo.
          </Typography>
        </div>
        <Button
          component={RouterLink}
          href={paths.cliente.departamentoPessoal.novo}
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
        >
          Novo funcionário
        </Button>
      </Stack>

      {show403 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errMessage(error)}
        </Alert>
      )}

      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2 }}>
          <TextField
            select
            label="Status do cadastro"
            value={statusCadastro}
            onChange={(e) => setStatusCadastro(e.target.value)}
            sx={{ minWidth: 220 }}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendente_aprovacao">Pendente de aprovação</MenuItem>
            <MenuItem value="aprovado">Aprovado</MenuItem>
            <MenuItem value="reprovado">Reprovado</MenuItem>
          </TextField>
        </Stack>

        <TableContainer sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Cadastro</TableCell>
                  <TableCell>Vínculo</TableCell>
                  <TableCell>Demissão</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2">Carregando…</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && funcionarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyContent
                        filled
                        title="Nenhum funcionário"
                        description="Cadastre o primeiro colaborador."
                        sx={{ py: 6 }}
                      />
                    </TableCell>
                  </TableRow>
                )}
                {funcionarios.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{formatCPF(row.cpf || '')}</TableCell>
                    <TableCell>{row.cargo || '—'}</TableCell>
                    <TableCell>
                      <ChipStatusCadastro status={row.statusCadastro} />
                    </TableCell>
                    <TableCell>
                      <ChipStatusVinculo status={row.statusVinculo} />
                    </TableCell>
                    <TableCell>
                      <ChipStatusDemissao status={row.demissao?.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        <Button
                          component={RouterLink}
                          href={paths.cliente.departamentoPessoal.details(row._id)}
                          size="small"
                          variant="outlined"
                        >
                          Abrir
                        </Button>
                        {row.statusCadastro === 'aprovado' && row.statusVinculo === 'ativo' && (
                          <Button
                            component={RouterLink}
                            href={paths.cliente.departamentoPessoal.apontamentosLancar({ funcionario: row._id })}
                            size="small"
                            variant="contained"
                          >
                            Apontamentos
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
    </Box>
  );
}
