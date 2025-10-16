'use client';

import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, Stack, Button, MenuItem, TextField, Typography, CardContent } from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import { portalCreateServico } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function NovoServicoPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, empresaAtivaData, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos, podeEmitirNFSe } = useSettings();
  const router = useRouter();

  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    nome: '',
    descricao: '',
    valor: 0,
    valorText: fCurrency(0),
    unidade: 'UN',
    categoria: '',
    codigoServico: '',
    aliquotaISS: '',
    cnae: '',
  });
  const onlyDigits = (v) => (v || '').replace(/\D/g, '');
  const formatBRLInput = (v) => { const d = onlyDigits(v); const n = Number(d) / 100; return { text: fCurrency(n), value: n }; };
  const [cnaesEmpresa, setCnaesEmpresa] = React.useState([]);
  const [loadingCnaes, setLoadingCnaes] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    const loadCnaes = async () => {
      if (!clienteProprietarioId) return;
      try {
        setLoadingCnaes(true);
        const cli = await getClienteById(clienteProprietarioId);
        const prim = Array.isArray(cli?.atividade_principal)
          ? cli.atividade_principal
          : cli?.atividade_principal
            ? [cli.atividade_principal]
            : [];
        const sec = Array.isArray(cli?.atividades_secundarias) ? cli.atividades_secundarias : [];
        const list = [...prim, ...sec].filter(Boolean);
        const cnaes = list
          .map((a) => ({ code: a.code || a.codigo || a.cnae || '', text: a.text || a.descricao || '' }))
          .filter((x) => x.code);
        if (!ignore) setCnaesEmpresa(cnaes);
      } catch (e) {
        if (!ignore) setCnaesEmpresa([]);
      } finally {
        if (!ignore) setLoadingCnaes(false);
      }
    };
    loadCnaes();
    return () => { ignore = true; };
  }, [clienteProprietarioId]);

  if (loadingEmpresas || !clienteProprietarioId) return <Typography>Carregando...</Typography>;
  if (!podeGerenciarServicos) return <Typography>Funcionalidade não disponível</Typography>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Informe o nome do serviço'); return false; }
    if (!form.valor || Number(form.valor) <= 0) { toast.error('Informe um valor válido'); return false; }
    try {
      setSaving(true);
      const payload = {
        clienteProprietarioId,
        nome: form.nome,
        descricao: form.descricao,
        valor: Number(form.valor),
        unidade: form.unidade,
        categoria: form.categoria,
        // NFSe (condicional)
        ...(podeEmitirNFSe ? {
          codigoServico: form.codigoServico || undefined,
          aliquotaISS: form.aliquotaISS ? Number(form.aliquotaISS) : undefined,
          cnae: form.cnae || undefined,
        } : {}),
      };
      await portalCreateServico(payload);
      toast.success('Serviço criado');
      router.replace(paths.cliente.servicos);
      return true;
    } catch (err) {
      toast.error('Erro ao criar serviço');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <SimplePaper>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Novo Serviço</Typography>
          <Stack direction="row" spacing={1}>
            <Button href={paths.cliente.servicos} variant="text">Cancelar</Button>
            <LoadingButton type="submit" variant="contained" loading={saving}>Salvar</LoadingButton>
          </Stack>
        </Stack>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Dados</Typography>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField fullWidth label="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
              </Grid>
              <Grid xs={12}>
                <TextField fullWidth multiline minRows={2} label="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Valor" value={form.valorText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setForm((f) => ({ ...f, valor: value, valorText: text })); }} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Unidade" value={form.unidade} onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Categoria" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {podeEmitirNFSe && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>NFSe</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField fullWidth label="Código Serviço (LC 116)" value={form.codigoServico} onChange={(e) => setForm((f) => ({ ...f, codigoServico: e.target.value }))} placeholder="ex: 01.07" />
                </Grid>
                <Grid xs={12} sm={3}>
                  <TextField fullWidth type="number" label="Alíquota ISS (%)" value={form.aliquotaISS} onChange={(e) => setForm((f) => ({ ...f, aliquotaISS: e.target.value }))} />
                </Grid>
                <Grid xs={12} sm={3}>
                  <TextField fullWidth select label="CNAE da Empresa" value={form.cnae} onChange={(e) => setForm((f) => ({ ...f, cnae: e.target.value }))} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }} disabled={loadingCnaes} helperText={loadingCnaes ? 'Carregando CNAEs...' : ''}>
                    <MenuItem value="">Selecione</MenuItem>
                    {cnaesEmpresa.map((c) => (
                      <MenuItem key={c.code} value={c.code}>{c.code} - {c.text}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </form>
    </SimplePaper>
  );
}


