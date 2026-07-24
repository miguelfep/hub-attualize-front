'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';

import { Iconify } from 'src/components/iconify';

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

export function SelecionarClientesDialog({ open, onClose, clientes, selected: selectedClientes, onConfirm }) {
  const [buscaCliente, setBuscaCliente] = useState('');
  const [filtroRegime, setFiltroRegime] = useState([]);
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setBuscaCliente('');
      setFiltroRegime([]);
      setTempSelected(selectedClientes.map((c) => c._id));
    }
  }, [open, selectedClientes]);

  const regimesPresentes = useMemo(
    () => [...new Set(clientes.map((e) => e.regimeTributario).filter(Boolean))],
    [clientes]
  );

  const clientesFiltrados = useMemo(() => {
    let filtered = clientes;

    if (buscaCliente) {
      const q = normalizarTexto(buscaCliente);
      filtered = filtered.filter((e) =>
        normalizarTexto(
          `${e.razaoSocial || ''} ${e.nome || ''} ${e.cnpj || ''} ${e.codigo || ''}`
        ).includes(q)
      );
    }

    if (filtroRegime.length > 0) {
      filtered = filtered.filter((e) => filtroRegime.includes(e.regimeTributario));
    }

    return filtered;
  }, [buscaCliente, clientes, filtroRegime]);

  const todosFiltradosSelecionados =
    clientesFiltrados.length > 0 && clientesFiltrados.every((c) => tempSelected.includes(c._id));

  const toggleCliente = useCallback((id) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleTodosFiltrados = useCallback(() => {
    if (todosFiltradosSelecionados) {
      setTempSelected((prev) =>
        prev.filter((id) => !clientesFiltrados.some((c) => c._id === id))
      );
    } else {
      const ids = clientesFiltrados.map((c) => c._id).filter(Boolean);
      setTempSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  }, [clientesFiltrados, todosFiltradosSelecionados]);

  const adicionarClientes = useCallback((lista) => {
    const ids = lista.map((c) => c._id).filter(Boolean);
    setTempSelected((prev) => Array.from(new Set([...prev, ...ids])));
  }, []);

  const limparClientes = useCallback(() => {
    setTempSelected([]);
  }, []);

  const handleConfirm = useCallback(() => {
    const chosen = clientes.filter((c) => tempSelected.includes(c._id));
    onConfirm?.(chosen);
    onClose?.();
  }, [clientes, tempSelected, onConfirm, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack spacing={0.5}>
          <Typography variant="h6">Selecionar Clientes</Typography>
          <Typography variant="caption" color="text.secondary">
            Selecione os clientes para emissão em lote de DARF Previdenciário
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: 480 }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar empresa por nome, CNPJ ou código..."
          value={buscaCliente}
          onChange={(e) => setBuscaCliente(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Filtrar por regime tributário
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {REGIME_OPTIONS.map((opt) => {
              const selected = filtroRegime.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => {
                    setFiltroRegime((prev) =>
                      selected ? prev.filter((r) => r !== opt.value) : [...prev, opt.value]
                    );
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
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
              onClick={() =>
                adicionarClientes(clientes.filter((e) => e.regimeTributario === r))
              }
            />
          ))}
          {tempSelected.length > 0 && (
            <Button size="small" color="inherit" onClick={limparClientes}>
              Limpar
            </Button>
          )}
        </Stack>

        <Box
          sx={{
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
            }}
          >
            <Checkbox
              size="small"
              indeterminate={
                clientesFiltrados.length > 0 &&
                clientesFiltrados.some((c) => tempSelected.includes(c._id)) &&
                !todosFiltradosSelecionados
              }
              checked={todosFiltradosSelecionados}
              onChange={toggleTodosFiltrados}
            />
            <Typography variant="caption" fontWeight={600} sx={{ flex: 1 }}>
              {clientesFiltrados.length} cliente
              {clientesFiltrados.length !== 1 ? 's' : ''} encontrado
              {clientesFiltrados.length !== 1 ? 's' : ''}
              {filtroRegime.length > 0 ? ' (filtrado por regime)' : ''}
            </Typography>
            <Typography variant="caption" color="primary" fontWeight={600}>
              {tempSelected.length} selecionado{tempSelected.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
            {clientesFiltrados.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Iconify
                  icon="solar:users-group-rounded-bold"
                  width={40}
                  sx={{ color: 'text.disabled', mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Nenhum cliente encontrado.
                </Typography>
              </Box>
            ) : (
              clientesFiltrados.map((empresa) => {
                const isSelected = tempSelected.includes(empresa._id);
                return (
                  <ListItemButton
                    key={empresa._id}
                    dense
                    selected={isSelected}
                    onClick={() => toggleCliente(empresa._id)}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-of-type': { borderBottom: 0 },
                      '&.Mui-selected': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Checkbox checked={isSelected} size="small" sx={{ mr: 1 }} />
                    <ListItemText
                      primary={empresa.razaoSocial || empresa.nome || 'Sem nome'}
                      secondary={
                        <>
                          {empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : ''}
                          {empresa.regimeTributario
                            ? ` • ${REGIME_LABEL[empresa.regimeTributario] || empresa.regimeTributario}`
                            : ''}
                          {empresa.status === false ? ' • Inativo' : ''}
                        </>
                      }
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                );
              })
            )}
          </List>
        </Box>

        {tempSelected.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {tempSelected.length} cliente{tempSelected.length !== 1 ? 's' : ''} selecionado
              {tempSelected.length !== 1 ? 's' : ''}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ maxHeight: 100, overflowY: 'auto' }}
            >
              {tempSelected.map((id) => {
                const empresa = clientes.find((e) => e._id === id);
                return empresa ? (
                  <Chip
                    key={id}
                    label={empresa.razaoSocial || empresa.nome}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onDelete={() => toggleCliente(id)}
                  />
                ) : null;
              })}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {tempSelected.length > 0
            ? `${tempSelected.length} cliente${tempSelected.length !== 1 ? 's' : ''} selecionado${tempSelected.length !== 1 ? 's' : ''}`
            : 'Nenhum cliente selecionado'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            disabled={tempSelected.length === 0}
          >
            Confirmar ({tempSelected.length})
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
