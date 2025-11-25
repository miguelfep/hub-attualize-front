'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ClientesExtratosStatus({ data, loading, error }) {
  const mesAno = useMemo(() => {
    const now = new Date();
    return `${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`;
  }, []);

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Status de Envio de Extratos - {mesAno}</Typography>
          <Skeleton variant="rectangular" height={200} />
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error">Erro ao carregar status de extratos dos clientes.</Alert>
      </Card>
    );
  }

  if (!data?.clientes?.length) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Status de Envio de Extratos - {mesAno}</Typography>
          <Alert severity="info">Nenhum cliente encontrado.</Alert>
        </Stack>
      </Card>
    );
  }

  const clientesEnviaram = data.clientes.filter((c) => c.enviado).length;
  const clientesPendentes = data.clientes.filter((c) => !c.enviado).length;

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6">Status de Envio de Extratos - {mesAno}</Typography>
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Iconify icon="solar:check-circle-bold-duotone" width={18} />}
              label={`${clientesEnviaram} enviaram`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<Iconify icon="solar:clock-circle-bold-duotone" width={18} />}
              label={`${clientesPendentes} pendentes`}
              color="warning"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Arquivos</TableCell>
                <TableCell align="right">Enviado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.clientes.map((cliente) => (
                <TableRow key={cliente.clienteId} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{cliente.nomeCliente}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {cliente.enviado ? (
                      <Chip
                        icon={<Iconify icon="solar:check-circle-bold-duotone" width={16} />}
                        label="Enviado"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
                        label="Pendente"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Iconify icon="solar:file-text-bold-duotone" width={18} />
                      <Typography variant="body2">{cliente.quantidadeArquivos}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {cliente.enviadoEm ? (
                      <Typography variant="body2" color="text.secondary">
                        {new Date(cliente.enviadoEm).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {data.clientes.some((c) => c.arquivos?.length > 0) && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Arquivos enviados:
            </Typography>
            <Stack spacing={0.5}>
              {data.clientes
                .filter((c) => c.enviado && c.arquivos?.length > 0)
                .map((cliente) => (
                  <Box key={cliente.clienteId} sx={{ pl: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {cliente.nomeCliente}:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {cliente.arquivos.join(', ')}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
}

