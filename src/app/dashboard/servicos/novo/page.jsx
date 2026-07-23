'use client';

import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { formatCNAE } from 'src/utils/formatter';
import { fCurrency } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import { useGetSettings } from 'src/actions/settings';
import { DashboardContent } from 'src/layouts/dashboard';
import { createServicoAdmin } from 'src/actions/servicos-admin';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const onlyDigits = (v) => (v || '').replace(/\D/g, '');

const formatBRLInput = (v) => {
  const d = onlyDigits(v);
  const n = Number(d) / 100;
  return { text: fCurrency(n), value: n };
};

// ----------------------------------------------------------------------

export default function NovoServicoAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdFromUrl = searchParams.get('clienteId');

  const [saving, setSaving] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const [cliente, setCliente] = useState(null);

  const { settings: clienteSettings, settingsLoading } = useGetSettings(clienteIdFromUrl || null);
  const isNacional = clienteSettings?.provedorNFSe === 'nacional';
  const aliquotaGeralEmpresa = clienteSettings?.eNotasConfig?.configuracaoNFSe?.aliquotaIss ?? null;

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    valor: 0,
    valorText: fCurrency(0),
    unidade: 'UN',
    categoria: '',
    cnae: '',
    codigoServicoMunicipio: '',
    itemListaServicoLC116: '',
    codigoTributacaoNacional: '',
    codigoTributacaoMunicipal: '',
    aliquotaIss: '',
    status: true,
  });

  useEffect(() => {
    const loadCliente = async () => {
      if (!clienteIdFromUrl) {
        setLoadingCliente(false);
        return;
      }
      try {
        setLoadingCliente(true);
        const clienteData = await getClienteById(clienteIdFromUrl);
        setCliente(clienteData);
      } catch {
        toast.error('Erro ao carregar dados do cliente');
      } finally {
        setLoadingCliente(false);
      }
    };
    loadCliente();
  }, [clienteIdFromUrl]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleValorChange = useCallback((e) => {
    const { text, value } = formatBRLInput(e.target.value);
    setForm((prev) => ({ ...prev, valorText: text, valor: value }));
  }, []);

  const handleCNAEChange = useCallback(
    (e) => handleChange('cnae', formatCNAE(e.target.value)),
    [handleChange]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteIdFromUrl) {
      toast.error('Cliente não informado');
      return;
    }
    if (!form.nome?.trim()) {
      toast.warning('O nome do serviço é obrigatório');
      return;
    }
    if (form.valor <= 0) {
      toast.warning('O valor deve ser maior que zero');
      return;
    }
    if (form.codigoTributacaoNacional && !/^\d{6}$/.test(form.codigoTributacaoNacional)) {
      toast.warning('Código de Tributação Nacional inválido: informe 6 dígitos (ex.: 171901)');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || '',
        valor: form.valor,
        unidade: form.unidade,
        categoria: form.categoria?.trim() || '',
        cnae: form.cnae?.trim() || '',
        codigoServicoMunicipio: isNacional ? '' : form.codigoServicoMunicipio?.trim() || '',
        itemListaServicoLC116: form.itemListaServicoLC116?.trim() || '',
        codigoTributacaoNacional: isNacional ? form.codigoTributacaoNacional?.trim() || '' : '',
        codigoTributacaoMunicipal: isNacional ? form.codigoTributacaoMunicipal?.trim() || '' : '',
        aliquotaIss: form.aliquotaIss !== '' && form.aliquotaIss != null ? Number(form.aliquotaIss) : null,
        status: form.status,
        clienteProprietarioId: clienteIdFromUrl,
      };
      await createServicoAdmin(payload);
      toast.success('Serviço criado com sucesso!');
      router.push(`${paths.dashboard.servicos}?clienteId=${clienteIdFromUrl}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Erro ao criar serviço'
      );
    } finally {
      setSaving(false);
    }
  };

  const backHref = `${paths.dashboard.servicos}?clienteId=${clienteIdFromUrl}`;

  if (loadingCliente || settingsLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography color="text.secondary">Carregando...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!clienteIdFromUrl) {
    return (
      <DashboardContent>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error">Cliente não informado</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selecione um cliente na página de serviços.
            </Typography>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => router.push(paths.dashboard.servicos)}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="solar:arrow-left-bold" />}
          onClick={() => router.push(backHref)}
        >
          Voltar
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Novo Serviço</Typography>
          <Typography variant="body2" color="text.secondary">
            {cliente?.razaoSocial || cliente?.nomeFantasia || cliente?.email || ''}
          </Typography>
        </Box>
        <Chip
          icon={<Iconify icon={isNacional ? 'solar:buildings-bold' : 'solar:cloud-bold'} />}
          label={isNacional ? 'Emissor Nacional (Sefin)' : 'eNotas'}
          color={isNacional ? 'info' : 'default'}
          variant="outlined"
        />
      </Stack>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>

          {/* ── Coluna principal ── */}
          <Grid xs={12} md={8}>
            <Stack spacing={3}>

              {/* Informações básicas */}
              <Card>
                <CardHeader title="Informações básicas" titleTypographyProps={{ variant: 'h6' }} sx={{ pb: 0 }} />
                <Divider sx={{ mt: 2 }} />
                <CardContent>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      required
                      label="Nome do serviço"
                      value={form.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      placeholder="Ex: Declaração de IRPF"
                    />

                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Descrição"
                      value={form.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      placeholder="Descreva o serviço..."
                    />

                    <Grid container spacing={2} disableEqualOverflow>
                      <Grid xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="Valor"
                          value={form.valorText}
                          onChange={handleValorChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label="Unidade"
                          value={form.unidade}
                          onChange={(e) => handleChange('unidade', e.target.value)}
                        >
                          <MenuItem value="UN">Unidade (UN)</MenuItem>
                          <MenuItem value="HR">Hora (HR)</MenuItem>
                          <MenuItem value="DI">Dia (DI)</MenuItem>
                          <MenuItem value="MÊS">Mês (MÊS)</MenuItem>
                          <MenuItem value="SESSÃO">Sessão</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} disableEqualOverflow>
                      <Grid xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Categoria"
                          value={form.categoria}
                          onChange={(e) => handleChange('categoria', e.target.value)}
                          placeholder="Ex: Contabilidade"
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CNAE"
                          value={form.cnae}
                          onChange={handleCNAEChange}
                          placeholder="Ex: 6920-6/01"
                          inputProps={{ maxLength: 12 }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>

              {/* Fiscal — eNotas */}
              {!isNacional && (
                <Card>
                  <CardHeader
                    title="Configuração Fiscal — eNotas"
                    titleTypographyProps={{ variant: 'h6' }}
                    subheader="Campos usados na emissão de NFS-e via eNotas"
                    sx={{ pb: 0 }}
                  />
                  <Divider sx={{ mt: 2 }} />
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Grid container spacing={2} disableEqualOverflow>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Alíquota ISS (%)"
                            type="number"
                            value={form.aliquotaIss}
                            onChange={(e) => handleChange('aliquotaIss', e.target.value)}
                            placeholder={
                              aliquotaGeralEmpresa != null
                                ? `${aliquotaGeralEmpresa}% (geral da empresa)`
                                : 'Usar alíquota geral'
                            }
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            helperText="Vazio = usa a alíquota geral da empresa"
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Código do Serviço no Município"
                            value={form.codigoServicoMunicipio}
                            onChange={(e) => handleChange('codigoServicoMunicipio', e.target.value)}
                            placeholder="Ex: 01010501"
                            helperText="Conforme cadastro municipal"
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Item Lista Serviço LC 116/2003"
                        value={form.itemListaServicoLC116}
                        onChange={(e) => handleChange('itemListaServicoLC116', e.target.value)}
                        placeholder="Ex: 17.19"
                        helperText="Subitem da Lei Complementar 116/2003"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Fiscal — Emissor Nacional */}
              {isNacional && (
                <Card>
                  <CardHeader
                    title="Configuração Fiscal — Emissor Nacional"
                    titleTypographyProps={{ variant: 'h6' }}
                    subheader="Campos usados na emissão de NFS-e pelo Sefin (Ambiente Nacional)"
                    sx={{ pb: 0 }}
                  />
                  <Divider sx={{ mt: 2 }} />
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Alert severity="info" sx={{ mb: 0.5 }}>
                        O <strong>Cód. Tributação Nacional (cTribNac)</strong> identifica o serviço no Sefin.
                        Preencha por serviço quando a empresa tiver mais de um CNAE ativo.
                      </Alert>

                      <Grid container spacing={2} disableEqualOverflow>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Cód. Tributação Nacional (cTribNac)"
                            value={form.codigoTributacaoNacional}
                            onChange={(e) =>
                              handleChange('codigoTributacaoNacional', onlyDigits(e.target.value).slice(0, 6))
                            }
                            placeholder="Ex: 171901"
                            helperText="6 dígitos — obrigatório para emissão pelo Sefin"
                            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Alíquota ISS (%)"
                            type="number"
                            value={form.aliquotaIss}
                            onChange={(e) => handleChange('aliquotaIss', e.target.value)}
                            placeholder={
                              aliquotaGeralEmpresa != null
                                ? `${aliquotaGeralEmpresa}% (geral da empresa)`
                                : 'Usar alíquota geral'
                            }
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            helperText="Vazio = usa a alíquota geral da empresa"
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={2} disableEqualOverflow>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Cód. Tributação Municipal (cTribMun)"
                            value={form.codigoTributacaoMunicipal}
                            onChange={(e) => handleChange('codigoTributacaoMunicipal', e.target.value)}
                            helperText="Formato definido pelo município (opcional)"
                          />
                        </Grid>
                        <Grid xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Item Lista Serviço LC 116/2003"
                            value={form.itemListaServicoLC116}
                            onChange={(e) => handleChange('itemListaServicoLC116', e.target.value)}
                            placeholder="Ex: 17.19.01"
                            helperText="Fallback para derivar o cTribNac quando não informado"
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              )}

            </Stack>
          </Grid>

          {/* ── Coluna lateral ── */}
          <Grid xs={12} md={4}>
            <Stack spacing={3}>

              {/* Status */}
              <Card>
                <CardHeader title="Status" titleTypographyProps={{ variant: 'h6' }} sx={{ pb: 0 }} />
                <Divider sx={{ mt: 2 }} />
                <CardContent>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value === 'true')}
                  >
                    <MenuItem value="true">Ativo</MenuItem>
                    <MenuItem value="false">Inativo</MenuItem>
                  </TextField>
                </CardContent>
              </Card>

              {/* Ações */}
              <Card>
                <CardContent>
                  <Stack spacing={1.5}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={saving}
                      startIcon={<Iconify icon="solar:diskette-bold" />}
                    >
                      Criar Serviço
                    </LoadingButton>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push(backHref)}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

        </Grid>
      </form>
    </DashboardContent>
  );
}
