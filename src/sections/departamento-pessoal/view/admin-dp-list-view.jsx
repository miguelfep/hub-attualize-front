'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatCPF } from 'src/utils/format-number';

import { useAdminFuncionarios } from 'src/actions/departamento-pessoal';

import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChipStatusVinculo, ChipStatusCadastro, ChipStatusDemissao } from '../dp-shared';

// ----------------------------------------------------------------------

export function AdminDpListView({ clienteId, topSlot, clienteRazaoSocial }) {
  const theme = useTheme();
  const [statusCadastro, setStatusCadastro] = useState('');
  const params = statusCadastro ? { statusCadastro } : {};
  const hasCliente = Boolean(clienteId);
  const { data: funcionarios, isLoading } = useAdminFuncionarios(
    hasCliente ? clienteId : null,
    params
  );

  return (
    <Card sx={{ borderRadius: 3 }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Departamento Pessoal - Funcionários
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Visualize e gerencie os funcionários deste cliente (cadastro, vínculo e demissão).
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          sx={{ flexShrink: 0 }}
        >
          {hasCliente && clienteRazaoSocial ? (
            <Chip
              label={clienteRazaoSocial}
              variant="outlined"
              sx={{
                maxWidth: { xs: '100%', sm: 320 },
                height: 'auto',
                py: 0.5,
                '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
              }}
            />
          ) : null}
          {hasCliente ? (
            <Button
              component={RouterLink}
              href={paths.dashboard.cliente.departamentoPessoalNovo(clienteId)}
              variant="contained"
            >
              Novo funcionário
            </Button>
          ) : (
            <Button variant="contained" disabled>
              Novo funcionário
            </Button>
          )}
          <Button
            component={RouterLink}
            href={hasCliente ? paths.dashboard.cliente.edit(clienteId) : paths.dashboard.cliente.root}
            variant="outlined"
            color="inherit"
          >
            {hasCliente ? 'Voltar ao cliente' : 'Lista de clientes'}
          </Button>
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {topSlot ? <Box sx={{ mb: 3 }}>{topSlot}</Box> : null}

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Fila / status do cadastro"
            value={statusCadastro}
            onChange={(e) => setStatusCadastro(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
            disabled={!hasCliente}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendente_aprovacao">Pendentes de aprovação</MenuItem>
            <MenuItem value="aprovado">Aprovados</MenuItem>
            <MenuItem value="reprovado">Reprovados</MenuItem>
          </TextField>
        </Box>

        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Scrollbar>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Cód. folha</TableCell>
                    <TableCell>Cadastro</TableCell>
                    <TableCell>Vínculo</TableCell>
                    <TableCell>Demissão</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!hasCliente && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyContent
                          title="Selecione um cliente"
                          description="Escolha uma empresa na lista acima para carregar os funcionários."
                          filled
                          sx={{ py: 4 }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {hasCliente && isLoading && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography variant="body2">Carregando…</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {hasCliente && !isLoading && (!funcionarios || funcionarios.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyContent title="Nenhum registro" filled sx={{ py: 4 }} />
                      </TableCell>
                    </TableRow>
                  )}
                  {hasCliente &&
                    funcionarios?.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell>{formatCPF(row.cpf || '')}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {row.codigoFolha != null && row.codigoFolha !== '' ? row.codigoFolha : '—'}
                      </TableCell>
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
      </CardContent>
    </Card>
  );
}
