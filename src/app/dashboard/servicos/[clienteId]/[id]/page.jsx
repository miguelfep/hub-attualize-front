'use client';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
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

import { DashboardContent } from 'src/layouts/dashboard';
import { getClienteById, useGetAllClientes } from 'src/actions/clientes';
import { createServicoAdmin, updateServicoAdmin, getServicoAdminById } from 'src/actions/servicos-admin';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CustomDivider = () => <Divider sx={{ my: 4, borderStyle: 'dashed' }} />;

const SectionHeader = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
      }}
    >
      <Iconify icon={icon} width={24} color="primary.main" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  </Stack>
);

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
    status: true,
  });

  // Estados para duplicação
  const [duplicarModalOpen, setDuplicarModalOpen] = useState(false);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState([]);
  const [duplicando, setDuplicando] = useState(false);

  const { data: todasEmpresas, isLoading: loadingEmpresas } = useGetAllClientes({
    status: true,
    tipoContato: 'cliente',
  });

  const empresasDisponiveis = todasEmpresas?.filter((empresa) => empresa._id !== clienteId) || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Carregar serviço
        const servicoData = await getServicoAdminById(clienteId, servicoId);
        
        // Carregar cliente
        const clienteData = await getClienteById(clienteId);
        setCliente(clienteData);

        // Preencher formulário
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
            status: servicoData.status === true || servicoData.status === 'true' || servicoData.status === 1,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar serviço');
      } finally {
        setLoadingData(false);
      }
    };

    if (clienteId && servicoId) {
      loadData();
    }
  }, [clienteId, servicoId]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleValorChange = useCallback((e) => {
    const { text, value } = formatBRLInput(e.target.value);
    setForm((prev) => ({ ...prev, valorText: text, valor: value }));
  }, []);

  const handleCNAEChange = useCallback((e) => {
    const formatted = formatCNAE(e.target.value);
    handleChange('cnae', formatted);
  }, [handleChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome?.trim()) {
      toast.warning('O nome do serviço é obrigatório');
      return;
    }

    if (form.valor <= 0) {
      toast.warning('O valor deve ser maior que zero');
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
        codigoServicoMunicipio: form.codigoServicoMunicipio?.trim() || '',
        itemListaServicoLC116: form.itemListaServicoLC116?.trim() || '',
        status: form.status,
        clienteProprietarioId: clienteId,
      };

      await updateServicoAdmin(servicoId, payload);

      toast.success('Serviço atualizado com sucesso!');

      // Voltar para a página de serviços com o cliente selecionado
      const returnClienteId = searchParams.get('returnClienteId') || clienteId;
      router.push(`${paths.dashboard.servicos}?clienteId=${returnClienteId}`);
    } catch (error) {
      console.error('Erro ao salvar:', error);

      // Extrair mensagem de erro da resposta da API
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao atualizar serviço';

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAbrirModalDuplicar = () => {
    setDuplicarModalOpen(true);
    setEmpresasSelecionadas([]);
  };

  const handleFecharModalDuplicar = () => {
    setDuplicarModalOpen(false);
    setEmpresasSelecionadas([]);
  };

  const handleDuplicarServico = async () => {
    if (empresasSelecionadas.length === 0) {
      toast.warning('Selecione pelo menos uma empresa');
      return;
    }

    try {
      setDuplicando(true);

      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || '',
        valor: form.valor,
        unidade: form.unidade,
        categoria: form.categoria?.trim() || '',
        cnae: form.cnae?.trim() || '',
        codigoServicoMunicipio: form.codigoServicoMunicipio?.trim() || '',
        itemListaServicoLC116: form.itemListaServicoLC116?.trim() || '',
        status: form.status,
      };

      // Criar serviço para cada empresa selecionada
      const promises = empresasSelecionadas.map((empresaId) =>
        createServicoAdmin({
          ...payload,
          clienteProprietarioId: empresaId,
        })
      );

      await Promise.all(promises);

      toast.success(`Serviço duplicado com sucesso para ${empresasSelecionadas.length} empresa(s)!`);
      handleFecharModalDuplicar();
    } catch (error) {
      console.error('Erro ao duplicar serviço:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao duplicar serviço';
      toast.error(errorMessage);
    } finally {
      setDuplicando(false);
    }
  };

  if (loadingData) {
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
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={() => router.push(paths.dashboard.servicos)}
          >
            Voltar
          </Button>
        </Stack>

        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Editar Serviço
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cliente: {cliente?.razaoSocial || cliente?.nomeFantasia || cliente?.email || 'Carregando...'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader
                  icon="solar:clipboard-list-bold-duotone"
                  title="Informações do Serviço"
                />

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    required
                    label="Nome do Serviço"
                    value={form.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    placeholder="Ex: Consulta psicológica"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Descrição"
                    value={form.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    placeholder="Descreva o serviço..."
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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

                    <Grid item xs={12} sm={6}>
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
                </Stack>

                <CustomDivider />

                <SectionHeader
                  icon="solar:tag-bold-duotone"
                  title="Categorização e Informações Fiscais"
                />

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Categoria"
                    value={form.categoria}
                    onChange={(e) => handleChange('categoria', e.target.value)}
                    placeholder="Ex: Consultoria, Serviços"
                  />

                  <TextField
                    fullWidth
                    label="CNAE"
                    value={form.cnae}
                    onChange={handleCNAEChange}
                    placeholder="Ex: 8690-9/01"
                    inputProps={{ maxLength: 12 }}
                  />

                  <TextField
                    fullWidth
                    label="Código do Serviço no Município"
                    value={form.codigoServicoMunicipio}
                    onChange={(e) => handleChange('codigoServicoMunicipio', e.target.value)}
                    placeholder="Ex: 01010501"
                    helperText="Código do serviço conforme cadastro municipal"
                  />

                  <TextField
                    fullWidth
                    label="Item Lista Serviço LC 116/2003"
                    value={form.itemListaServicoLC116}
                    onChange={(e) => handleChange('itemListaServicoLC116', e.target.value)}
                    placeholder="Ex: 01.01"
                    helperText="Item da Lei Complementar 116/2003"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader
                    icon="solar:settings-bold-duotone"
                    title="Status"
                  />

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

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
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
                      onClick={() => router.push(paths.dashboard.servicos)}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.04)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        }}
                      >
                        <Iconify icon="solar:copy-bold-duotone" width={24} color="primary.main" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Duplicar Serviço
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Copiar para outras empresas
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Selecione uma ou mais empresas para criar uma cópia deste serviço
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Iconify icon="solar:copy-bold" />}
                      onClick={handleAbrirModalDuplicar}
                      sx={{
                        mt: 1,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.24)}`,
                        '&:hover': {
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.32)}`,
                        },
                      }}
                    >
                      Duplicar Serviço
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </form>

      <Dialog
        open={duplicarModalOpen}
        onClose={handleFecharModalDuplicar}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <Iconify icon="solar:copy-bold-duotone" width={24} color="primary.main" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Duplicar Serviço
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecione as empresas para criar uma cópia deste serviço
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: 'info.main', mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  O serviço <strong>&quot;{form.nome}&quot;</strong> será duplicado com todas as informações para as empresas selecionadas.
                </Typography>
              </Stack>
            </Box>

            {loadingEmpresas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <Stack spacing={2} alignItems="center">
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    Carregando empresas...
                  </Typography>
                </Stack>
              </Box>
            ) : empresasDisponiveis.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Iconify icon="solar:buildings-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma empresa disponível
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Não há outras empresas cadastradas no sistema
                </Typography>
              </Box>
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
                    if (selected.length === 0) {
                      return (
                        <Typography variant="body2" color="text.disabled">
                          Selecione uma ou mais empresas
                        </Typography>
                      );
                    }
                    if (selected.length === 1) {
                      const empresa = empresasDisponiveis.find((e) => e._id === selected[0]);
                      return empresa?.razaoSocial || empresa?.nomeFantasia || empresa?.email || selected[0];
                    }
                    return (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          {selected.length} empresa{selected.length > 1 ? 's' : ''} selecionada{selected.length > 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 400,
                        '& .MuiMenuItem-root': {
                          py: 1.5,
                        },
                      },
                    },
                  }}
                >
                  {empresasDisponiveis.map((empresa) => (
                    <MenuItem key={empresa._id} value={empresa._id}>
                      <Checkbox
                        checked={empresasSelecionadas.indexOf(empresa._id) > -1}
                        sx={{ mr: 1.5 }}
                      />
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {empresa.razaoSocial || empresa.nomeFantasia || empresa.email || 'Sem nome'}
                          </Typography>
                        }
                        secondary={
                          empresa.cnpj ? (
                            <Typography variant="caption" color="text.secondary">
                              CNPJ: {empresa.cnpj}
                            </Typography>
                          ) : null
                        }
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {empresasSelecionadas.length > 0 && !loadingEmpresas && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                    Empresas selecionadas ({empresasSelecionadas.length}):
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {empresasSelecionadas.map((empresaId) => {
                      const empresa = empresasDisponiveis.find((e) => e._id === empresaId);
                      if (!empresa) return null;
                      const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || empresa.email || 'Sem nome';
                      return (
                        <Chip
                          key={empresaId}
                          label={nomeEmpresa}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.darker',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 1.5,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 2 }}>
          <Button onClick={handleFecharModalDuplicar} color="inherit" size="large">
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleDuplicarServico}
            loading={duplicando}
            disabled={empresasSelecionadas.length === 0 || loadingEmpresas}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            size="large"
            sx={{
              minWidth: 140,
            }}
          >
            {duplicando ? 'Duplicando...' : `Duplicar${empresasSelecionadas.length > 0 ? ` (${empresasSelecionadas.length})` : ''}`}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

