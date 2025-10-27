'use client';

import { useMemo, useEffect, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { listarCertificados, getCorStatusCertificado, getIconeStatusCertificado } from 'src/actions/certificados';
import { useAuthContext } from 'src/auth/hooks';

import { Iconify } from 'src/components/iconify';

export default function CertificadosPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState('');
  const [vencidos, setVencidos] = useState(false);
  const [expiraEmDias, setExpiraEmDias] = useState('');
  const [cliente, setCliente] = useState('');
  const [sortBy, setSortBy] = useState('validTo');
  const [sortOrder, setSortOrder] = useState('desc');

  const canView = useMemo(() => Boolean(user), [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (status) params.status = status;
      if (vencidos) params.vencidos = true;
      if (expiraEmDias) params.expiraEmDias = Number(expiraEmDias);
      if (cliente) params.cliente = cliente;

      const { data } = await listarCertificados(params);
      // Assumindo formato: { items, total, page, limit }
      setRows(data?.data || []);
      setTotal(data?.total || 0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, vencidos, expiraEmDias, cliente, sortBy, sortOrder, canView]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
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
              Certificados
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Controle centralizado de certificados digitais: busque, filtre e acompanhe vencimentos.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
              <MenuItem value="expirado">Expirado</MenuItem>
              <MenuItem value="erro">Erro</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Expira em (dias)"
              value={expiraEmDias}
              onChange={(e) => { setExpiraEmDias(e.target.value); setPage(1); }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar cliente (nome/razão/CNPJ)"
              value={cliente}
              onChange={(e) => { setCliente(e.target.value); setPage(1); }}
            />
          </Grid>
          <Grid xs={12} md={2}>
            <FormControlLabel
              control={<Switch checked={vencidos} onChange={(e) => { setVencidos(e.target.checked); setPage(1); }} />}
              label="Vencidos"
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField select fullWidth label="Ordenar por" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="validTo">Validade</MenuItem>
              <MenuItem value="uploadedAt">Upload</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField select fullWidth label="Ordem" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => { setStatus(''); setVencidos(false); setExpiraEmDias(''); setCliente(''); setSortBy('validTo'); setSortOrder('desc'); setPage(1); }}>Limpar filtros</Button>
              <Button variant="contained" onClick={() => { setPage(1); fetchData(); }} startIcon={<Iconify icon="eva:refresh-fill" />}>Atualizar</Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: 8 }}>CNPJ</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Validade</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Situação</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Enviado em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const statusColor = getCorStatusCertificado(row.status);
                const statusIcon = getIconeStatusCertificado(row.status);
                const validade = row.validTo ? new Date(row.validTo).toLocaleDateString('pt-BR') : '-';
                const uploadedAt = row.uploadedAt ? new Date(row.uploadedAt).toLocaleString('pt-BR') : '-';
                const situacao = row.isExpired
                  ? 'Vencido'
                  : (typeof row.daysToExpire === 'number' ? `Em ${row.daysToExpire} dias` : '-');
                return (
                  <tr key={row._id}>
                    <td style={{ padding: 8 }}>{row?.cliente?.razaoSocial || row?.cliente?.nome || '-'}</td>
                    <td style={{ padding: 8 }}>{row?.cliente?.cnpj || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <Chip color={statusColor} variant="soft" size="small" icon={<Iconify icon={statusIcon} />} label={row.status} />
                    </td>
                    <td style={{ padding: 8 }}>{validade}</td>
                    <td style={{ padding: 8 }}>{situacao}</td>
                    <td style={{ padding: 8 }}>{uploadedAt}</td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16 }}>
                    <Typography variant="body2">Nenhum certificado encontrado.</Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2">Página {page} de {totalPages} — {total} resultados</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
            <TextField select size="small" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </TextField>
            <Button size="small" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}


