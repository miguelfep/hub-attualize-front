'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
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

import { useAdminFuncionarios } from 'src/actions/departamento-pessoal';

import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChipStatusVinculo, ChipStatusCadastro, ChipStatusDemissao } from '../dp-shared';

// ----------------------------------------------------------------------

export function AdminDpListView({ clienteId }) {
  const [statusCadastro, setStatusCadastro] = useState('pendente_aprovacao');
  const params = statusCadastro ? { statusCadastro } : {};
  const { data: funcionarios, isLoading } = useAdminFuncionarios(clienteId, params);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h4">Funcionários (DP)</Typography>
          <Typography variant="body2" color="text.secondary">
            Cliente: {clienteId}
          </Typography>
        </div>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component={RouterLink}
            href={paths.dashboard.cliente.departamentoPessoalNovo(clienteId)}
            variant="contained"
          >
            Novo funcionário
          </Button>
          <Button component={RouterLink} href={paths.dashboard.cliente.edit(clienteId)} variant="outlined">
            Voltar ao cliente
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <TextField
          select
          label="Fila / status do cadastro"
          value={statusCadastro}
          onChange={(e) => setStatusCadastro(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="pendente_aprovacao">Pendentes de aprovação</MenuItem>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="aprovado">Aprovados</MenuItem>
          <MenuItem value="reprovado">Reprovados</MenuItem>
        </TextField>
      </Card>

      <Card>
        <TableContainer>
          <Scrollbar>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Cadastro</TableCell>
                  <TableCell>Vínculo</TableCell>
                  <TableCell>Demissão</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2">Carregando…</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && (!funcionarios || funcionarios.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyContent title="Nenhum registro" filled sx={{ py: 4 }} />
                    </TableCell>
                  </TableRow>
                )}
                {funcionarios?.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{formatCPF(row.cpf || '')}</TableCell>
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
                      <Button
                        component={RouterLink}
                        href={paths.dashboard.departamentoPessoal.funcionario(row._id)}
                        size="small"
                        variant="contained"
                      >
                        Abrir
                      </Button>
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
