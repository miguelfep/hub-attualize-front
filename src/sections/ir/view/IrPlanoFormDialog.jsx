'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MODALIDADES = [
  { value: 'basica', label: 'Básica' },
  { value: 'intermediaria', label: 'Intermediária' },
  { value: 'completa', label: 'Completa' },
];

const LOTE_VAZIO = () => ({
  _key: Math.random().toString(36).slice(2),
  numero: 1,
  descricao: '',
  dataInicio: '',
  dataFim: '',
  valorCheio: '',
  tipoDesconto: 'percentual',
  desconto: 0,
  vagasTotal: 0,
});

const PLANO_VAZIO = {
  modalidade: '',
  titulo: '',
  descricao: '',
  ano: 'IR2026',
  year: 2026,
  ordem: 0,
};

// ─── Helper — calcula valorFinal ──────────────────────────────────────────────

function calcularValorFinal(valorCheio, tipoDesconto, desconto) {
  const v = parseFloat(valorCheio);
  const d = parseFloat(desconto);
  if (Number.isNaN(v) || v <= 0) return null;
  if (Number.isNaN(d) || d <= 0) return v;
  if (tipoDesconto === 'percentual') return Math.max(0, v - (v * d) / 100);
  return Math.max(0, v - d);
}

function fValor(n) {
  if (n == null) return '—';
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

// ─── Card de um único Lote ────────────────────────────────────────────────────

function LoteCard({ lote, index, total, onChange, onRemove, errors }) {
  const theme = useTheme();
  const valorFinal = calcularValorFinal(lote.valorCheio, lote.tipoDesconto, lote.desconto);

  const handle = (field) => (e) => onChange(index, field, e.target.value);

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        borderColor: errors?._hasError ? 'error.main' : 'divider',
        bgcolor: alpha(theme.palette.info.main, 0.02),
      }}
    >
      {/* Cabeçalho do lote */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.info.main, 0.06),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${lote.numero}º Lote`} color="info" size="small" />
          {valorFinal != null && (
            <Chip label={fValor(valorFinal)} color="success" size="small" variant="outlined" />
          )}
        </Stack>
        <Tooltip title="Remover lote">
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={total <= 1}
              onClick={() => onRemove(index)}
            >
              <Iconify icon="eva:trash-2-outline" width={18} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          {/* Descrição do lote */}
          <Grid xs={12}>
            <TextField
              label="Descrição do lote (opcional)"
              placeholder="Ex: 1º Lote — Antecipe e economize"
              value={lote.descricao}
              onChange={handle('descricao')}
              fullWidth
              size="small"
            />
          </Grid>

          {/* Período */}
          <Grid xs={12} sm={6}>
            <TextField
              label="Data de início *"
              type="date"
              value={lote.dataInicio}
              onChange={handle('dataInicio')}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors?.dataInicio}
              helperText={errors?.dataInicio}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              label="Data de término *"
              type="date"
              value={lote.dataFim}
              onChange={handle('dataFim')}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!errors?.dataFim}
              helperText={errors?.dataFim}
            />
          </Grid>

          {/* Preço cheio */}
          <Grid xs={12} sm={4}>
            <TextField
              label="Preço cheio (R$) *"
              type="number"
              value={lote.valorCheio}
              onChange={handle('valorCheio')}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              error={!!errors?.valorCheio}
              helperText={errors?.valorCheio}
            />
          </Grid>

          {/* Tipo de desconto */}
          <Grid xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de desconto *</InputLabel>
              <Select
                value={lote.tipoDesconto}
                label="Tipo de desconto *"
                onChange={handle('tipoDesconto')}
              >
                <MenuItem value="percentual">Percentual (%)</MenuItem>
                <MenuItem value="fixo">Valor fixo (R$)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Valor do desconto */}
          <Grid xs={12} sm={4}>
            <TextField
              label={lote.tipoDesconto === 'percentual' ? 'Desconto (%) *' : 'Desconto (R$) *'}
              type="number"
              value={lote.desconto}
              onChange={handle('desconto')}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: lote.tipoDesconto === 'percentual' ? 1 : 0.01 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {lote.tipoDesconto === 'percentual' ? '%' : 'R$'}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Vagas */}
          <Grid xs={12} sm={6}>
            <TextField
              label="Total de vagas"
              type="number"
              value={lote.vagasTotal}
              onChange={handle('vagasTotal')}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              helperText="0 = vagas ilimitadas"
            />
          </Grid>

          {/* Preview do valor final */}
          <Grid xs={12} sm={6}>
            <Box
              sx={{
                height: '100%',
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                borderRadius: 1,
                bgcolor: valorFinal != null
                  ? alpha(theme.palette.success.main, 0.08)
                  : alpha(theme.palette.grey[500], 0.08),
                border: '1px solid',
                borderColor: valorFinal != null ? alpha(theme.palette.success.main, 0.3) : 'divider',
              }}
            >
              <Iconify
                icon="eva:pricetags-outline"
                width={18}
                color={valorFinal != null ? 'success.main' : 'text.disabled'}
              />
              <Box>
                <Typography variant="caption" color="text.secondary">Preço final calculado</Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={valorFinal != null ? 'success.dark' : 'text.disabled'}
                >
                  {valorFinal != null ? fValor(valorFinal) : '—'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   plano?: object | null,   // null = criar, object = editar
 *   onSuccess: () => void,
 * }} props
 */
export default function IrPlanoFormDialog({ open, onClose, plano: planoInicial, onSuccess }) {
  const theme = useTheme();
  const isEditing = !!planoInicial;

  const [dados, setDados] = useState(PLANO_VAZIO);
  const [lotes, setLotes] = useState([{ ...LOTE_VAZIO(), numero: 1 }]);
  const [errors, setErrors] = useState({});
  const [loteErrors, setLoteErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Preenche o form ao editar ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    if (planoInicial) {
      setDados({
        modalidade: planoInicial.modalidade ?? '',
        titulo: planoInicial.titulo ?? '',
        descricao: planoInicial.descricao ?? '',
        ano: planoInicial.ano ?? 'IR2026',
        year: planoInicial.year ?? 2026,
        ordem: planoInicial.ordem ?? 0,
      });
      setLotes(
        (planoInicial.lotes ?? []).map((l) => ({
          _key: Math.random().toString(36).slice(2),
          numero: l.numero,
          descricao: l.descricao ?? '',
          dataInicio: l.dataInicio ? l.dataInicio.slice(0, 10) : '',
          dataFim: l.dataFim ? l.dataFim.slice(0, 10) : '',
          valorCheio: l.valorCheio ?? '',
          tipoDesconto: l.tipoDesconto ?? 'percentual',
          desconto: l.desconto ?? 0,
          vagasTotal: l.vagasTotal ?? 0,
        }))
      );
    } else {
      setDados(PLANO_VAZIO);
      setLotes([{ ...LOTE_VAZIO(), numero: 1 }]);
    }
    setErrors({});
    setLoteErrors([]);
  }, [open, planoInicial]);

  // ─── Handlers dos dados básicos ────────────────────────────────────────────

  const handleDados = useCallback((field) => (e) => {
    const v = e.target.value;
    setDados((prev) => ({
      ...prev,
      [field]: field === 'year' || field === 'ordem' ? Number(v) : v,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // ─── Handlers dos lotes ────────────────────────────────────────────────────

  const handleLoteChange = useCallback((index, field, value) => {
    setLotes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setLoteErrors((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], [field]: '' };
      return next;
    });
  }, []);

  const handleAddLote = () => {
    setLotes((prev) => [
      ...prev,
      { ...LOTE_VAZIO(), numero: prev.length + 1 },
    ]);
  };

  const handleRemoveLote = (index) => {
    setLotes((prev) => {
      const next = prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, numero: i + 1 }));
      return next;
    });
    setLoteErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Validação ─────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!dados.modalidade) e.modalidade = 'Selecione a modalidade.';
    if (!dados.titulo.trim()) e.titulo = 'Informe o título.';
    if (!dados.descricao.trim()) e.descricao = 'Informe a descrição.';
    if (!dados.ano.trim()) e.ano = 'Informe o ano (ex: IR2026).';
    if (!dados.year || dados.year < 2024) e.year = 'Informe o ano numérico.';

    const le = lotes.map((l) => {
      const le2 = {};
      if (!l.dataInicio) le2.dataInicio = 'Obrigatório.';
      if (!l.dataFim) le2.dataFim = 'Obrigatório.';
      if (l.dataInicio && l.dataFim && l.dataFim < l.dataInicio) le2.dataFim = 'Deve ser após a data de início.';
      if (!l.valorCheio || parseFloat(l.valorCheio) <= 0) le2.valorCheio = 'Informe o preço cheio.';
      if (Object.keys(le2).length > 0) le2._hasError = true;
      return le2;
    });

    setErrors(e);
    setLoteErrors(le);
    return !Object.keys(e).length && le.every((l) => !l._hasError);
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Corrija os erros antes de salvar.');
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...dados,
        lotes: lotes.map(({ _key, ...l }) => ({
          ...l,
          numero: l.numero,
          valorCheio: parseFloat(l.valorCheio),
          desconto: parseFloat(l.desconto) || 0,
          vagasTotal: parseInt(l.vagasTotal, 10) || 0,
        })),
      };

      if (isEditing) {
        await axios.put(endpoints.ir.admin.plano(planoInicial._id), body);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await axios.post(endpoints.ir.admin.planos, body);
        toast.success('Plano criado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Erro ao salvar plano. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const previewTotal = useMemo(() => {
    if (!lotes.length) return null;
    const finals = lotes.map((l) => calcularValorFinal(l.valorCheio, l.tipoDesconto, l.desconto));
    return finals.filter(Boolean);
  }, [lotes]);

  return (
    <Dialog
      open={open}
      onClose={() => { if (!loading) onClose(); }}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      {/* Cabeçalho */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {isEditing ? 'Editar plano de IR' : 'Criar novo plano de IR'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.3 }}>
            {isEditing
              ? `Editando: ${planoInicial?.titulo}`
              : 'Configure a modalidade, descrição e lotes de preço'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading} sx={{ color: 'common.white' }}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={4}>

          {/* ── Seção 1: Dados básicos ───────────────────────────────────── */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: 'primary.main', color: 'common.white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}
              >1</Box>
              <Typography variant="subtitle1" fontWeight={700}>Informações do plano</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <FormControl fullWidth size="small" error={!!errors.modalidade} disabled={isEditing}>
                  <InputLabel>Modalidade *</InputLabel>
                  <Select value={dados.modalidade} label="Modalidade *" onChange={handleDados('modalidade')}>
                    {MODALIDADES.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                  {errors.modalidade && <FormHelperText>{errors.modalidade}</FormHelperText>}
                  {isEditing && (
                    <FormHelperText>A modalidade não pode ser alterada após a criação</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid xs={12} sm={5}>
                <TextField
                  label="Título *"
                  placeholder="Ex: IR Básica"
                  value={dados.titulo}
                  onChange={handleDados('titulo')}
                  fullWidth
                  size="small"
                  error={!!errors.titulo}
                  helperText={errors.titulo}
                />
              </Grid>

              <Grid xs={12} sm={3}>
                <TextField
                  label="Ordem de exibição"
                  type="number"
                  value={dados.ordem}
                  onChange={handleDados('ordem')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                  helperText="1 = primeiro"
                />
              </Grid>

              <Grid xs={12}>
                <TextField
                  label="Descrição *"
                  placeholder="Ex: Ideal para assalariados com uma fonte de renda, sem bens ou investimentos."
                  value={dados.descricao}
                  onChange={handleDados('descricao')}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  error={!!errors.descricao}
                  helperText={errors.descricao || 'Texto exibido no card da página de vendas'}
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <TextField
                  label="Ano (string) *"
                  placeholder="IR2026"
                  value={dados.ano}
                  onChange={handleDados('ano')}
                  fullWidth
                  size="small"
                  error={!!errors.ano}
                  helperText={errors.ano || 'Ex: IR2026'}
                />
              </Grid>

              <Grid xs={12} sm={4}>
                <TextField
                  label="Ano (número) *"
                  type="number"
                  value={dados.year}
                  onChange={handleDados('year')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 2024 }}
                  error={!!errors.year}
                  helperText={errors.year || 'Ex: 2026'}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* ── Seção 2: Lotes ───────────────────────────────────────────── */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: 'primary.main', color: 'common.white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}
              >2</Box>
              <Typography variant="subtitle1" fontWeight={700}>Lotes e preços</Typography>
              <Typography variant="caption" color="text.secondary">
                — defina os preços por período. O lote ativo é detectado automaticamente pela data atual.
              </Typography>
            </Stack>

            <Stack spacing={2.5}>
              {lotes.map((lote, index) => (
                <LoteCard
                  key={lote._key}
                  lote={lote}
                  index={index}
                  total={lotes.length}
                  onChange={handleLoteChange}
                  onRemove={handleRemoveLote}
                  errors={loteErrors[index]}
                />
              ))}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={handleAddLote}
              sx={{ mt: 2, borderStyle: 'dashed' }}
            >
              Adicionar lote
            </Button>

            {/* Preview de preços */}
            {previewTotal.length > 0 && (
              <Box
                mt={2}
                p={2}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.06),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Resumo de preços calculados
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {lotes.map((l, i) => {
                    const vf = calcularValorFinal(l.valorCheio, l.tipoDesconto, l.desconto);
                    return vf != null ? (
                      <Chip
                        key={l._key}
                        label={`${i + 1}º Lote: ${fValor(vf)}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    ) : null;
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      {/* Rodapé */}
      <Box
        sx={{
          px: 3, py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {lotes.length} lote{lotes.length !== 1 ? 's' : ''} configurado{lotes.length !== 1 ? 's' : ''}
          {previewTotal.length > 0 && ` · Faixa: ${fValor(Math.min(...previewTotal))} – ${fValor(Math.max(...previewTotal))}`}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            loading={loading}
            onClick={handleSubmit}
            startIcon={<Iconify icon={isEditing ? 'eva:save-outline' : 'eva:plus-fill'} />}
          >
            {isEditing ? 'Salvar alterações' : 'Criar plano'}
          </LoadingButton>
        </Stack>
      </Box>
    </Dialog>
  );
}
