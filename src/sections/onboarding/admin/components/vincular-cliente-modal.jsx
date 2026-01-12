'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Checkbox,
  Chip,
  Box,
  OutlinedInput,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';

import { adicionarOnboardingsUsuario } from 'src/actions/onboarding';
import { getUsersCliente } from 'src/actions/users';

// ----------------------------------------------------------------------

const vincularSchema = zod.object({
  userId: zod.string().min(1, 'Usuário é obrigatório'),
  empresaId: zod.string().min(1, 'Empresa é obrigatória'),
  onboardingIds: zod.array(zod.string()).min(1, 'Selecione pelo menos um onboarding'),
});

// ----------------------------------------------------------------------

export function VincularClienteModal({ open, onClose, onboardings, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [onboardingsSelecionados, setOnboardingsSelecionados] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(vincularSchema),
    defaultValues: {
      userId: '',
      empresaId: '',
      onboardingIds: [],
    },
  });

  const userId = watch('userId');
  const empresaId = watch('empresaId');

  const carregarUsuarios = useCallback(async (searchTerm = '') => {
    setLoadingUsuarios(true);
    try {
      const response = await getUsersCliente();
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setUsuarios(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setUsuarios(response.data);
      } else {
        setUsuarios([]);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      toast.error('Erro ao carregar usuários');
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  // Carrega empresas do usuário selecionado (já vêm no objeto do usuário)
  const carregarEmpresas = useCallback((usuario) => {
    if (!usuario) {
      setEmpresas([]);
      setEmpresaSelecionada(null);
      setValue('empresaId', '');
      return;
    }

    // As empresas já vêm no campo empresasId do usuário
    const empresasData = usuario.empresasId || [];
    
    if (empresasData.length === 0) {
      toast.warning('Usuário não possui empresas associadas. Adicione empresas ao usuário antes de vincular onboardings.');
      setEmpresas([]);
      setEmpresaSelecionada(null);
      setValue('empresaId', '');
      return;
    }

    setEmpresas(empresasData);
    
    // Se houver apenas uma empresa, seleciona automaticamente
    if (empresasData.length === 1) {
      setEmpresaSelecionada(empresasData[0]);
      setValue('empresaId', empresasData[0]._id || empresasData[0].id);
    } else {
      // Se houver múltiplas empresas, não seleciona automaticamente
      setEmpresaSelecionada(null);
      setValue('empresaId', '');
    }
  }, [setValue]);

  // Quando o usuário selecionado muda, carrega suas empresas
  useEffect(() => {
    if (usuarioSelecionado) {
      carregarEmpresas(usuarioSelecionado);
    } else {
      setEmpresas([]);
      setEmpresaSelecionada(null);
      setValue('empresaId', '');
    }
  }, [usuarioSelecionado, carregarEmpresas, setValue]);

  const handleOpen = () => {
    if (usuarios.length === 0) {
      carregarUsuarios();
    }
  };

  const handleCloseModal = () => {
    reset();
    setUsuarioSelecionado(null);
    setEmpresaSelecionada(null);
    setOnboardingsSelecionados([]);
    setEmpresas([]);
    onClose();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await adicionarOnboardingsUsuario(data.userId, data.empresaId, data.onboardingIds);

      if (response.data?.success) {
        toast.success('Onboardings adicionados ao usuário com sucesso!');
        handleCloseModal();
        onSuccess?.();
      } else {
        throw new Error(response.data?.message || 'Erro ao adicionar onboardings');
      }
    } catch (error) {
      console.error('Erro ao adicionar onboardings:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar onboardings ao usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Adicionar Onboardings ao Usuário</Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => `${option.name || option.email || ''} ${option.email ? `(${option.email})` : ''}`}
              loading={loadingUsuarios}
              onOpen={handleOpen}
              value={usuarioSelecionado}
              onChange={(event, newValue) => {
                setUsuarioSelecionado(newValue);
                setValue('userId', newValue?._id || newValue?.id || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuário"
                  error={!!errors.userId}
                  helperText={errors.userId?.message}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsuarios ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <FormControl fullWidth error={!!errors.empresaId} disabled={!usuarioSelecionado}>
              <InputLabel id="empresa-label">Empresa</InputLabel>
              <Select
                labelId="empresa-label"
                id="empresa"
                label="Empresa"
                value={empresaSelecionada?._id || ''}
                onChange={(e) => {
                  const empresa = empresas.find((emp) => emp._id === e.target.value);
                  setEmpresaSelecionada(empresa || null);
                  setValue('empresaId', e.target.value);
                }}
                input={<OutlinedInput label="Empresa" />}
              >
                {empresas.map((empresa) => (
                  <MenuItem key={empresa._id} value={empresa._id}>
                    {empresa.razaoSocial || empresa.nome || empresa._id}
                  </MenuItem>
                ))}
              </Select>
              {errors.empresaId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.empresaId.message}
                </Typography>
              )}
              {!usuarioSelecionado && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                  Selecione um usuário primeiro
                </Typography>
              )}
              {usuarioSelecionado && empresas.length === 0 && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, ml: 1.75 }}>
                  Usuário não possui empresas associadas
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.onboardingIds} disabled={!empresaId}>
              <InputLabel id="onboardings-label">Onboardings</InputLabel>
              <Select
                labelId="onboardings-label"
                id="onboardings"
                multiple
                label="Onboardings"
                value={onboardingsSelecionados}
                onChange={(e) => {
                  const valores = e.target.value;
                  setOnboardingsSelecionados(valores);
                  setValue('onboardingIds', valores);
                }}
                input={<OutlinedInput label="Onboardings" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const onboarding = onboardings.find((o) => o._id === id);
                      return onboarding ? (
                        <Chip key={id} label={onboarding.nome} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {onboardings.map((onboarding) => (
                  <MenuItem key={onboarding._id} value={onboarding._id}>
                    <Checkbox checked={onboardingsSelecionados.indexOf(onboarding._id) > -1} />
                    <Box>
                      <Typography variant="body2">{onboarding.nome}</Typography>
                      {onboarding.tipoEmpresa && onboarding.tipoEmpresa.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {onboarding.tipoEmpresa.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.onboardingIds && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.onboardingIds.message}
                </Typography>
              )}
            </FormControl>

            <Alert severity="info">
              Os onboardings serão adicionados ao usuário para a empresa selecionada. Cada empresa pode ter seus próprios onboardings.
              <br />
              <strong>Importante:</strong> A ordem dos onboardings selecionados define a sequência em que devem ser concluídos.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="eva:link-fill" />}
          >
            Adicionar Onboardings
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

