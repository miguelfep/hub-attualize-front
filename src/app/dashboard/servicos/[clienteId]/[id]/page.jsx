'use client';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { formatCNAE } from 'src/utils/formatter';
import { fCurrency } from 'src/utils/format-number';

import { useGetSettings } from 'src/actions/settings';
import { DashboardContent } from 'src/layouts/dashboard';
import { getClienteById, useGetAllClientes } from 'src/actions/clientes';
import { createServicoAdmin, updateServicoAdmin, getServicoAdminById } from 'src/actions/servicos-admin';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const onlyDigits = (v) => (v || '').replace(/\D/g, '');

const formatBRLInput = (v) => {
  const d = onlyDigits(v);
  const n = Number(d) / 100;
  return { text: fCurrency(n), value: n };
};

// ----------------------------------------------------------------------

export default function EditarServicoAdminPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { clienteId, id: servicoId } = params;
  const theme = useTheme();

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [cliente, setCliente] = useState(null);

  const { settings: clienteSettings, settingsLoading } = useGetSettings(clienteId || null);
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

  // Duplicação
  const [duplicarModalOpen, setDuplicarModalOpen] = useState(false);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState([]);
  const [duplicando, setDuplicando] = useState(false);

  const { data: todasEmpresas, isLoading: loadingEmpresas } = useGetAllClientes({
    status: true,
    tipoContato: 'cliente',
  });
  const empresasDisponiveis = todasEmpresas?.filter((e) => e._id !== clienteId) || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [servicoData, clienteData] = await Promise.all([
          getServicoAdminById(clienteId, servicoId),
          getClienteById(clienteId),
        ]);
        setCliente(clienteData);
        if (servicoData) {
          setForm({
            nome: servicoData.nome || '',
            descricao: servicoData.descricao || '',
            valor: servicoData.valor || 0,
            valorText: fCurrency(servicoData.valor || 0),
            unidade: servicoData.unidade || 'UN',
            categoria: servicoData.categoria || '',
            cnae: servicoData.cnae || '',
            codigoServicoMunicipio: servicoData.codigoServicoMunicipio || '',
            itemListaServicoLC116: servicoData.itemListaServicoLC116 || '',
            codigoTributacaoNacional: servicoData.codigoTributacaoNacional || '',
            codigoTributacaoMunicipal: servicoData.codigoTributacaoMunicipal || '',
            aliquotaIss: servicoData.aliquotaIss != null ? String(servicoData.aliquotaIss) : '',
            status: servicoData.status === true || servicoData.status === 'true' || servicoData.status === 1,
          });
        }
      } catch {
        toast.error('Erro ao carregar serviço');
      } finally {
        setLoadingData(false);
      }
    };
    if (clienteId && servicoId) loadData();
  }, [clienteId, servicoId]);

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

  const returnHref = `${paths.dashboard.servicos}?clienteId=${searchParams.get('returnClienteId') || clienteId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome?.trim()) { toast.warning('O nome do serviço é obrigatório'); return; }
    if (form.valor <= 0) { toast.warning('O valor deve ser maior que zero'); return; }
    if (form.codigoTributacaoNacional && !/^\d{6}$/.test(form.codigoTributacaoNacional)) {
      toast.warning('Código de Tributação Nacional inválido: informe 6 dígitos');
      return;
    }
    try {
      setSaving(true);
      await updateServicoAdmin(servicoId, {
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
        clienteProprietarioId: clienteId,
      });
      toast.success('Serviço atualizado com sucesso!');
      router.push(returnHref);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Erro ao atualizar serviço');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicarServico = async () => {
    if (empresasSelecionadas.length === 0) { toast.warning('Selecione pelo menos uma empresa'); return; }
    try {
      setDuplicando(true);
      const base = {
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || '',
        valor: form.valor,
        unidade: form.unidade,
        categoria: form.categoria?.trim() || '',
        cnae: form.cnae?.trim() || '',
        codigoServicoMunicipio: form.codigoServicoMunicipio?.trim() || '',
        itemListaServicoLC116: form.itemListaServicoLC116?.trim() || '',
        codigoTributacaoNacional: form.codigoTributacaoNacional?.trim() || '',
        codigoTributacaoMunicipal: form.codigoTributacaoMunicipal?.trim() || '',
        aliquotaIss: form.aliquotaIss !== '' && form.aliquotaIss != null ? Number(form.aliquotaIss) : null,
        status: form.status,
      };
      await Promise.all(
        empresasSelecionadas.map((empresaId) =>
          createServicoAdmin({ ...base, clienteProprietarioId: empresaId })
        )
      );
      toast.success(`Serviço duplicado para ${empresasSelecionadas.length} empresa(s)!`);
      setDuplicarModalOpen(false);
      setEmpresasSelecionadas([]);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Erro ao duplicar serviço');
    } finally {
      setDuplicando(false);
    }
  };

  if (loadingData || settingsLoading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
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
          onClick={() => router.push(returnHref)}
        >
          Voltar
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Editar Serviço</Typography>
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
                      Salvar Alterações
                    </LoadingButton>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push(returnHref)}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Duplicar */}
              <Card
                sx={{
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <CardHeader
                  title="Duplicar Serviço"
                  titleTypographyProps={{ variant: 'h6' }}
                  subheader="Copiar para outras empresas"
                  sx={{ pb: 0 }}
                />
                <Divider sx={{ mt: 2 }} />
                <CardContent>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<Iconify icon="solar:copy-bold" />}
                    onClick={() => { setDuplicarModalOpen(true); setEmpresasSelecionadas([]); }}
                  >
                    Duplicar para outras empresas
                  </Button>
                </CardContent>
              </Card>

            </Stack>
          </Grid>

        </Grid>
      </form>

      {/* Modal Duplicar */}
      <Dialog open={duplicarModalOpen} onClose={() => setDuplicarModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:copy-bold-duotone" width={28} color="primary.main" />
            <Box>
              <Typography variant="h6">Duplicar Serviço</Typography>
              <Typography variant="caption" color="text.secondary">
                Selecione as empresas para criar uma cópia deste serviço
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              O serviço <strong>&quot;{form.nome}&quot;</strong> será duplicado com todas as informações para as empresas selecionadas.
            </Alert>

            {loadingEmpresas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : empresasDisponiveis.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Nenhuma outra empresa disponível.
              </Typography>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="empresas-select-label">Selecione as empresas</InputLabel>
                <Select
                  labelId="empresas-select-label"
                  multiple
                  label="Selecione as empresas"
                  value={empresasSelecionadas}
                  onChange={(e) => setEmpresasSelecionadas(e.target.value)}
                  renderValue={(selected) => {
                    if (selected.length === 0) return 'Nenhuma';
                    if (selected.length === 1) {
                      const emp = empresasDisponiveis.find((e) => e._id === selected[0]);
                      return emp?.razaoSocial || emp?.nomeFantasia || emp?.email || selected[0];
                    }
                    return `${selected.length} empresa(s) selecionada(s)`;
                  }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                >
                  {empresasDisponiveis.map((empresa) => (
                    <MenuItem key={empresa._id} value={empresa._id}>
                      <Checkbox checked={empresasSelecionadas.includes(empresa._id)} sx={{ mr: 1 }} />
                      <ListItemText
                        primary={empresa.razaoSocial || empresa.nomeFantasia || empresa.email || 'Sem nome'}
                        secondary={empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : null}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {empresasSelecionadas.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {empresasSelecionadas.map((empId) => {
                  const emp = empresasDisponiveis.find((e) => e._id === empId);
                  if (!emp) return null;
                  return (
                    <Chip
                      key={empId}
                      size="small"
                      label={emp.razaoSocial || emp.nomeFantasia || emp.email}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDuplicarModalOpen(false)} color="inherit">Cancelar</Button>
          <LoadingButton
            variant="contained"
            onClick={handleDuplicarServico}
            loading={duplicando}
            disabled={empresasSelecionadas.length === 0}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            Duplicar{empresasSelecionadas.length > 0 ? ` (${empresasSelecionadas.length})` : ''}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
