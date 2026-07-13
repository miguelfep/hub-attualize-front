'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getMigracoes,
  getCorStatusMigracao,
  getLabelStatusMigracao,
  MIGRACAO_STATUS_OPTIONS,
} from 'src/actions/migracao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MigracaoNovaDialog } from '../migracao-nova-dialog';
import { MigracaoDetalhesDialog } from '../migracao-detalhes-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'empresaNome', label: 'Empresa' },
  { id: 'contador', label: 'Contador anterior' },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'documentos', label: 'Docs', width: 80, align: 'center' },
  { id: 'createdAt', label: 'Criada em', width: 120 },
  { id: 'acoes', label: '', width: 120, align: 'right' },
];

export function MigracaoListView() {
  const [migracoes, setMigracoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');

  const [novaAberta, setNovaAberta] = useState(false);
  const [selecionada, setSelecionada] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await getMigracoes({
        ...(filtroStatus && { status: filtroStatus }),
        ...(busca.trim() && { busca: busca.trim() }),
      });
      setMigracoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      toast.error(error?.message || 'Não foi possível carregar as migrações');
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus, busca]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleAtualizada = (migracaoAtualizada) => {
    if (!migracaoAtualizada?._id) {
      carregar();
      return;
    }
    setMigracoes((prev) =>
      prev.map((item) => (item._id === migracaoAtualizada._id ? migracaoAtualizada : item))
    );
    setSelecionada((prev) =>
      prev && prev._id === migracaoAtualizada._id ? migracaoAtualizada : prev
    );
  };

  const semDados = !carregando && migracoes.length === 0;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Migração de contabilidade"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Societário', href: paths.dashboard.aberturas.root },
          { name: 'Migração' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setNovaAberta(true)}
          >
            Nova migração
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por empresa, CNPJ ou contador..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={filtroStatus}
            onChange={(event) => setFiltroStatus(event.target.value)}
            sx={{ minWidth: { sm: 200 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {MIGRACAO_STATUS_OPTIONS.map((opcao) => (
              <MenuItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Scrollbar>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {migracoes.map((migracao) => (
                <TableRow key={migracao._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{migracao.empresaNome}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {migracao.cnpj || 'CNPJ não informado'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{migracao.contadorAnterior?.nome}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {migracao.contadorAnterior?.email ||
                        migracao.contadorAnterior?.telefone ||
                        'sem contato'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="soft"
                      color={getCorStatusMigracao(migracao.status)}
                      label={getLabelStatusMigracao(migracao.status)}
                    />
                  </TableCell>
                  <TableCell align="center">{migracao.documentos?.length || 0}</TableCell>
                  <TableCell>{fDate(migracao.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSelecionada(migracao)}>
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              <TableNoData notFound={semDados} />
            </TableBody>
          </Table>
        </Scrollbar>

        {carregando && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Carregando migrações...
            </Typography>
          </Box>
        )}
      </Card>

      <MigracaoNovaDialog
        open={novaAberta}
        onClose={() => setNovaAberta(false)}
        onCreated={(migracao) => {
          setMigracoes((prev) => [migracao, ...prev]);
          setSelecionada(migracao);
        }}
      />

      <MigracaoDetalhesDialog
        open={!!selecionada}
        migracao={selecionada}
        onClose={() => setSelecionada(null)}
        onChanged={handleAtualizada}
      />
    </DashboardContent>
  );
}
