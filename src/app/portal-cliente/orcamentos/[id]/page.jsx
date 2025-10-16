'use client';

import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, Chip, Stack, Button, MenuItem, TextField, Typography, CardContent } from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import { portalGetOrcamento, portalUpdateOrcamento, portalDownloadOrcamentoPDF, portalUpdateOrcamentoStatus } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';

export default function OrcamentoDetalhesPage({ params }) {
  const { id } = params;
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos, podeEmitirNFSe } = useSettings();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [orcamento, setOrcamento] = React.useState(null);
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;

    const loadWithRetry = async (attempt = 0) => {
      if (!clienteProprietarioId || cancelled) return;
      try {
        const data = await portalGetOrcamento(clienteProprietarioId, id);
        if (cancelled) return;
        setOrcamento(data);
        setStatus(data?.status || 'pendente');
        setLoading(false);
      } catch (e) {
        if (e?.response?.status === 404 && attempt < 2) {
          setTimeout(() => {
            if (!cancelled) loadWithRetry(attempt + 1);
          }, 600);
        } else if (!cancelled) {
          toast.error('Erro ao carregar orçamento');
          setLoading(false);
        }
      }
    };

    if (clienteProprietarioId) {
      setLoading(true);
      loadWithRetry();
    }

    return () => { cancelled = true; };
  }, [clienteProprietarioId, id]);

  if (loadingEmpresas || !clienteProprietarioId || loading) return <Typography>Carregando...</Typography>;
  if (!orcamento) return <Typography>Orçamento não encontrado</Typography>;
  if (!podeCriarOrcamentos) return <Typography>Funcionalidade não disponível</Typography>;

  const canEdit = !['aprovado', 'convertido', 'recusado', 'expirado'].includes(orcamento.status);

  const subtotal = (orcamento.itens || []).reduce((acc, it) => acc + (Number(it.quantidade) * Number(it.valorUnitario) - Number(it.desconto || 0)), 0);
  const total = subtotal - Number(orcamento.descontoGeral || 0);

  const handleSalvar = async () => {
    try {
      setSaving(true);
      await portalUpdateOrcamento(id, {
        observacoes: orcamento.observacoes,
        condicoesPagamento: orcamento.condicoesPagamento,
      });
      toast.success('Orçamento atualizado');
    } catch (e) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async () => {
    try {
      setSaving(true);
      await portalUpdateOrcamentoStatus(id, { status });
      setOrcamento((o) => ({ ...o, status }));
      toast.success('Status atualizado');
    } catch (e) {
      toast.error('Erro ao atualizar status');
    } finally {
      setSaving(false);
    }
  };

  const handleEmitirNFSe = async () => {
    if (!podeEmitirNFSe) return;
    toast.info('Emissão de NFSe – futuro');
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await portalDownloadOrcamentoPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${orcamento.numero || 'orcamento'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <SimplePaper>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Orçamento {orcamento.numero}</Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleDownloadPDF} variant="outlined" startIcon={<Iconify icon="solar:document-text-bold" />}>PDF</Button>
          {podeEmitirNFSe && (
            <Button onClick={handleEmitirNFSe} variant="contained" startIcon={<Iconify icon="solar:bill-check-bold" />}>Emitir NFSe</Button>
          )}
        </Stack>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <Typography variant="subtitle2">Cliente</Typography>
              <Typography variant="body2">{orcamento?.clienteDoClienteId?.nome}</Typography>
            </Grid>
            <Grid xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={orcamento.status} />
                <TextField size="small" select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!canEdit}>
                  <MenuItem value="pendente">pendente</MenuItem>
                  <MenuItem value="aprovado">aprovado</MenuItem>
                  <MenuItem value="recusado">recusado</MenuItem>
                  <MenuItem value="expirado">expirado</MenuItem>
                  <MenuItem value="convertido">convertido</MenuItem>
                </TextField>
                <LoadingButton loading={saving} onClick={handleStatus} disabled={!canEdit} variant="contained">Atualizar</LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Itens</Typography>
          <Stack spacing={1}>
            {(orcamento.itens || []).map((it, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography variant="body2">{it.descricao || it?.servicoId?.nome}</Typography>
                <Typography variant="body2">{it.quantidade} x {fCurrency(it.valorUnitario)} {it.desconto ? `(desc ${fCurrency(it.desconto)})` : ''}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Observações" multiline minRows={3} value={orcamento.observacoes || ''} onChange={(e) => setOrcamento((o) => ({ ...o, observacoes: e.target.value }))} disabled={!canEdit} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Condições de Pagamento" multiline minRows={3} value={orcamento.condicoesPagamento || ''} onChange={(e) => setOrcamento((o) => ({ ...o, condicoesPagamento: e.target.value }))} disabled={!canEdit} />
            </Grid>
            <Grid xs={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={3}>
                <Typography>Subtotal: {fCurrency(subtotal)}</Typography>
                <Typography>Total: {fCurrency(total)}</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <LoadingButton loading={saving} onClick={handleSalvar} disabled={!canEdit} variant="contained">Salvar</LoadingButton>
          </Stack>
        </CardContent>
      </Card>
    </SimplePaper>
  );
}



