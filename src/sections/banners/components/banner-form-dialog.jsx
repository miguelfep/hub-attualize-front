'use client';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useGetAllClientes } from 'src/actions/clientes';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils/color-picker';

import { BannerPreview } from './banner-preview';

// ----------------------------------------------------------------------

const COLORS = [
  '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2',
  '#00796b', '#c2185b', '#455a64', '#000000', '#ffffff',
];

const BANNER_ICONS = [
  'solar:bell-bold-duotone',
  'solar:play-circle-bold-duotone',
  'solar:document-text-bold-duotone',
  'solar:calendar-bold-duotone',
  'solar:gift-bold-duotone',
  'solar:rocket-bold-duotone',
  'solar:star-bold-duotone',
  'solar:info-circle-bold-duotone',
  'solar:check-circle-bold-duotone',
  'solar:danger-circle-bold-duotone',
  'solar:book-2-bold-duotone',
  'solar:user-bold-duotone',
  'solar:users-group-rounded-bold-duotone',
  'solar:wallet-money-bold-duotone',
  'solar:chart-2-bold-duotone',
  'solar:download-bold-duotone',
  'solar:upload-bold-duotone',
  'solar:letter-bold-duotone',
  'solar:chat-round-dots-bold-duotone',
  'solar:fire-bold-duotone',
  'solar:crown-bold-duotone',
  'solar:settings-bold-duotone',
  'solar:eye-bold-duotone',
  'solar:shield-check-bold-duotone'
];

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'simei', label: 'SIMEI' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
  { value: 'pf', label: 'Pessoa Física' },
];

const REGIME_LABEL = {
  simples: 'Simples',
  simei: 'SIMEI',
  presumido: 'Presumido',
  real: 'Real',
  pf: 'PF',
};

const normalizarTexto = (s) =>
  (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const BannerSchema = zod.object({
  titulo: zod.string().min(1, { message: 'Título é obrigatório' }),
  descricao: zod.string().optional().default(''),
  corFundo: zod.string().default('#1976d2'),
  corTexto: zod.string().default('#ffffff'),
  corBotaoTexto: zod.string().default('#1976d2'),
  corBotaoFundo: zod.string().default('#ffffff'),
  textoBotao: zod.string().optional().default(''),
  linkBotao: zod.string().optional().default(''),
  iconeBotao: zod.string().default('solar:bell-bold-duotone'),
  dataInicio: zod.any().optional().nullable(),
  dataFim: zod.any().optional().nullable(),
  filtroRegime: zod.array(zod.string()).default([]),
  clientesAlvo: zod.array(zod.string()).default([]),
  ativo: zod.boolean().default(true),
  ordem: zod.number().default(0),
});

const DEFAULT_VALUES = {
  titulo: '',
  descricao: '',
  corFundo: '#1976d2',
  corTexto: '#ffffff',
  corBotaoTexto: '#1976d2',
  corBotaoFundo: '#ffffff',
  textoBotao: '',
  linkBotao: '',
  iconeBotao: 'solar:bell-bold-duotone',
  dataInicio: null,
  dataFim: null,
  filtroRegime: [],
  clientesAlvo: [],
  ativo: true,
  ordem: 0,
};

// ----------------------------------------------------------------------

function ColorField({ name, label, control }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {label}
          </Typography>
          <ColorPicker
            colors={COLORS}
            selected={field.value}
            onSelectColor={field.onChange}
          />
          <TextField
            size="small"
            value={(field.value || '').replace('#', '').toUpperCase()}
            onChange={(e) => {
              const hex = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 6);
              field.onChange(hex ? `#${hex}` : '');
            }}
            placeholder="000000"
            inputProps={{ maxLength: 6 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">#</InputAdornment>,
            }}
            sx={{ mt: 1, width: 110 }}
          />
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function BannerFormDialog({ open, onClose, onSave, loading, banner, editing }) {
  const { data: clientesRaw } = useGetAllClientes();
  const clientes = useMemo(
    () => (Array.isArray(clientesRaw) ? clientesRaw : clientesRaw?.data ?? []),
    [clientesRaw]
  );

  const [buscaCliente, setBuscaCliente] = useState('');

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(BannerSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset, control, handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
  const values = useWatch({ control });

  const watchedClientes = watch('clientesAlvo') || [];

  useEffect(() => {
    if (open) {
      setBuscaCliente('');
      if (banner) {
        reset({
          ...DEFAULT_VALUES,
          ...banner,
          filtroRegime: banner.filtroRegime || [],
          clientesAlvo: (banner.clientesAlvo || []).map((c) =>
            typeof c === 'string' ? c : c?._id
          ),
          dataInicio: banner.dataInicio || null,
          dataFim: banner.dataFim || null,
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, banner, reset]);

  // Quick-add helpers (espelhar usuario-interno-modal)
  const adicionarClientes = (lista) => {
    const ids = lista.map((c) => c._id).filter(Boolean);
    if (!ids.length) return;
    const atuais = watch('clientesAlvo') || [];
    setValue('clientesAlvo', Array.from(new Set([...atuais, ...ids])), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const limparClientes = () =>
    setValue('clientesAlvo', [], { shouldValidate: true, shouldDirty: true });

  const regimesPresentes = useMemo(
    () => [...new Set(clientes.map((e) => e.regimeTributario).filter(Boolean))],
    [clientes]
  );

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientes;
    const q = normalizarTexto(buscaCliente);
    return clientes.filter((e) =>
      normalizarTexto(`${e.razaoSocial || ''} ${e.nome || ''} ${e.cnpj || ''} ${e.codigo || ''}`).includes(q)
    );
  }, [buscaCliente, clientes]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      ...data,
      dataInicio: data.dataInicio ? new Date(data.dataInicio).toISOString() : null,
      dataFim: data.dataFim ? new Date(data.dataFim).toISOString() : null,
    };
    onSave?.(payload);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editing ? 'Editar banner' : 'Novo banner'}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {/* ── Preview ── */}
            <Card
              variant="outlined"
              sx={{ position: 'sticky', top: 8, zIndex: 10, bgcolor: 'background.paper' }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Preview
                </Typography>
                <BannerPreview banner={values} />
              </CardContent>
            </Card>

            {/* ── Conteúdo ── */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Conteúdo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <Field.Text name="titulo" label="Título" required fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Field.Text name="descricao" label="Descrição" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text name="textoBotao" label="Texto do botão" fullWidth helperText="Deixe vazio para ocultar" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text name="linkBotao" label="Link do botão" fullWidth placeholder="/portal-cliente/..." />
                  </Grid>
                </Grid>

                {/* Ícone do botão — grid clicável */}
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Ícone do botão
                  </Typography>
                  <Controller
                    name="iconeBotao"
                    control={control}
                    render={({ field }) => (
                      <Scrollbar sx={{ maxHeight: 200, mx: -1 }}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: 1,
                            py: 1,
                            px: 1,
                          }}
                        >
                          {BANNER_ICONS.map((iconName) => (
                            <Paper
                              key={iconName}
                              variant="outlined"
                              onClick={() => field.onChange(iconName)}
                              sx={{
                                p: 1.25,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 2,
                                transition: (theme) => theme.transitions.create(['border-color', 'bgcolor']),
                                ...(field.value === iconName && {
                                  borderColor: 'primary.main',
                                  bgcolor: (theme) => alpha(theme.palette.primary.lighter, 0.2),
                                }),
                              }}
                            >
                              <Iconify icon={iconName} width={26} />
                            </Paper>
                          ))}
                        </Box>
                      </Scrollbar>
                    )}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* ── Cores ── */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Cores
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <ColorField name="corFundo" label="Cor de fundo" control={control} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ColorField name="corTexto" label="Cor do texto" control={control} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ColorField name="corBotaoFundo" label="Cor de fundo do botão" control={control} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ColorField name="corBotaoTexto" label="Cor do texto do botão" control={control} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── Agendamento ── */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Agendamento
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="dataInicio"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Data de início"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => field.onChange(newValue ? dayjs(newValue).format() : null)}
                          slotProps={{
                            textField: { fullWidth: true, helperText: 'Opcional — vazio = sempre visível' },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="dataFim"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Data de fim"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => field.onChange(newValue ? dayjs(newValue).format() : null)}
                          slotProps={{
                            textField: { fullWidth: true, helperText: 'Opcional — vazio = sem expiração' },
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* ── Direcionamento ── */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Direcionamento
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                  Deixe ambos vazios para exibir para todos. Preencha regime e/ou clientes para direcionar.
                </Typography>

                {/* Por regime */}
                <Controller
                  name="filtroRegime"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Por regime tributário (dinâmico — novos clientes com o regime também verão)
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {REGIME_OPTIONS.map((opt) => {
                          const selected = (field.value || []).includes(opt.value);
                          return (
                            <Chip
                              key={opt.value}
                              label={opt.label}
                              color={selected ? 'primary' : 'default'}
                              variant={selected ? 'filled' : 'outlined'}
                              onClick={() => {
                                const atual = field.value || [];
                                field.onChange(
                                  selected
                                    ? atual.filter((r) => r !== opt.value)
                                    : [...atual, opt.value]
                                );
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                />

                {/* Por clientes específicos */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Clientes específicos
                  </Typography>

                  {/* Busca */}
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Buscar empresa por nome, CNPJ ou código..."
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    sx={{ mb: 1.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Quick-add chips */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Adicionar:
                    </Typography>
                    <Button size="small" variant="outlined" onClick={() => adicionarClientes(clientes)}>
                      Todos ({clientes.length})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => adicionarClientes(clientes.filter((e) => e.status === true))}
                    >
                      Ativos
                    </Button>
                    {regimesPresentes.map((r) => (
                      <Chip
                        key={r}
                        size="small"
                        variant="outlined"
                        icon={<Iconify icon="mingcute:add-line" width={14} />}
                        label={REGIME_LABEL[r] || r}
                        onClick={() => adicionarClientes(clientes.filter((e) => e.regimeTributario === r))}
                      />
                    ))}
                    {watchedClientes.length > 0 && (
                      <Button size="small" color="inherit" onClick={limparClientes}>
                        Limpar
                      </Button>
                    )}
                  </Stack>

                  {/* Select multiple */}
                  <Controller
                    name="clientesAlvo"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Clientes selecionados</InputLabel>
                        <Select
                          {...field}
                          multiple
                          label="Clientes selecionados"
                          MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                          renderValue={(selected) => {
                            if (!selected?.length) return '';
                            if (selected.length === 1) {
                              const c = clientes.find((e) => e._id === selected[0]);
                              return c ? c.razaoSocial || c.nome : selected[0];
                            }
                            return `${selected.length} clientes selecionados`;
                          }}
                        >
                          {clientesFiltrados.length === 0 ? (
                            <MenuItem disabled>
                              <Typography variant="body2">Nenhum cliente encontrado.</Typography>
                            </MenuItem>
                          ) : (
                            clientesFiltrados.map((empresa) => (
                              <MenuItem key={empresa._id} value={empresa._id}>
                                <Stack spacing={0.25} sx={{ width: '100%' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {empresa.razaoSocial || empresa.nome}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : ''}
                                    {empresa.regimeTributario ? ` • ${REGIME_LABEL[empresa.regimeTributario] || empresa.regimeTributario}` : ''}
                                  </Typography>
                                </Stack>
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    )}
                  />

                  {/* Chip preview */}
                  {watchedClientes.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                      {watchedClientes.map((id) => {
                        const empresa = clientes.find((e) => e._id === id);
                        return empresa ? (
                          <Chip
                            key={id}
                            label={empresa.razaoSocial || empresa.nome}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onDelete={() => {
                              setValue(
                                'clientesAlvo',
                                watchedClientes.filter((c) => c !== id),
                                { shouldValidate: true, shouldDirty: true }
                              );
                            }}
                          />
                        ) : null;
                      })}
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* ── Configurações ── */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Configurações
                </Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Field.Switch name="ativo" label="Ativo" />
                  <Field.Text name="ordem" type="number" label="Ordem" sx={{ width: 120 }} />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={loading || isSubmitting}
          onClick={onSubmit}
        >
          Salvar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
