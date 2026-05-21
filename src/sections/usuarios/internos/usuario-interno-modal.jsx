import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { getClientes } from 'src/actions/clientes';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerencial', label: 'Gerencial' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'contabil_externo', label: 'Contábil Externo' },
  { value: 'ir', label: 'Imposto de Renda' },
];

const usuarioInternoSchema = zod
  .object({
    name: zod.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: zod.string().email('Email inválido'),
    password: zod
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: 'Senha deve ter pelo menos 6 caracteres',
      }),
    confirmPassword: zod.string().optional(),
    role: zod.array(zod.string()).min(1, 'Selecione pelo menos um perfil'),
    status: zod.string().min(1, 'Status é obrigatório'),
    empresasId: zod.array(zod.string()).optional(),
    empresaAtiva: zod.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    { message: 'Senhas não coincidem', path: ['confirmPassword'] }
  )
  .refine(
    (data) => {
      // Se empresaAtiva foi informada, deve estar dentro do array empresasId
      if (data.empresaAtiva) {
        return data.empresasId?.includes(data.empresaAtiva);
      }
      return true;
    },
    { message: 'Empresa ativa deve estar entre as empresas selecionadas', path: ['empresaAtiva'] }
  );

const defaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ['operacional'],
  status: 'ativo',
  empresasId: [],
  empresaAtiva: '',
};

export function UsuarioInternoModal({ open, onClose, onSave, usuario }) {
  const [loading, setLoading] = useState(false);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(usuarioInternoSchema),
    defaultValues,
  });

  const isEdit = !!usuario;
  const watchedEmpresasId = watch('empresasId');

  const fetchEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const clientes = await getClientes();
      if (clientes?.length > 0) {
        setEmpresasDisponiveis(clientes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmpresas();

      if (usuario) {
        const empresasIdArray = Array.isArray(usuario.empresasId)
          ? usuario.empresasId
            .map((empresa) =>
              typeof empresa === 'string' ? empresa : empresa?._id || empresa?.id
            )
            .filter(Boolean)
          : [];

        const empresaAtivaId =
          typeof usuario.empresaAtiva === 'string'
            ? usuario.empresaAtiva
            : usuario.empresaAtiva?._id || '';

        reset({
          name: usuario.name || '',
          email: usuario.email || '',
          password: '',
          confirmPassword: '',
          role: Array.isArray(usuario.role) ? usuario.role : [usuario.role].filter(Boolean),
          status: usuario.status === true ? 'ativo' : 'inativo',
          empresasId: empresasIdArray,
          empresaAtiva: empresaAtivaId,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, usuario, reset]);

  // Garantir que empresaAtiva sempre exista na lista; se a lista mudar e a ativa sumir, recalcular
  useEffect(() => {
    const empresaAtiva = watch('empresaAtiva');
    if (!watchedEmpresasId || watchedEmpresasId.length === 0) {
      if (empresaAtiva) setValue('empresaAtiva', '');
      return;
    }
    if (empresaAtiva && !watchedEmpresasId.includes(empresaAtiva)) {
      setValue('empresaAtiva', watchedEmpresasId[0] || '');
    }
    if (!empresaAtiva && watchedEmpresasId.length > 0) {
      setValue('empresaAtiva', watchedEmpresasId[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEmpresasId]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (!isEdit && !data.password) {
        setError('password', {
          type: 'manual',
          message: 'Senha é obrigatória para novos usuários',
        });
        return;
      }

      const dataToSave = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status === 'ativo',
        empresasId: data.empresasId || [],
        empresaAtiva: data.empresaAtiva || undefined,
      };

      if (data.password) {
        dataToSave.password = data.password;
      }

      if (isEdit && usuario?._id) {
        dataToSave.userId = usuario._id;
      }

      await onSave(dataToSave);
    } catch (error) {
      console.error('Erro ao salvar usuário interno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify
            icon={isEdit ? 'eva:edit-fill' : 'eva:person-add-fill'}
            width={24}
            sx={{ color: 'primary.main' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isEdit ? 'Editar Usuário Interno' : 'Novo Usuário Interno'}
          </Typography>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Informações Básicas
              </Typography>

              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      fullWidth
                    />
                  )}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={isEdit ? 'Nova Senha (opcional)' : 'Senha'}
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        fullWidth
                        placeholder={isEdit ? 'Deixe em branco para manter' : ''}
                      />
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirmar Senha"
                        type="password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        fullWidth
                        placeholder={isEdit ? 'Confirme a nova senha' : ''}
                      />
                    )}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label="Perfis"
                          name={field.name}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          value={Array.isArray(field.value) ? field.value[0] ?? '' : field.value ?? ''}
                          onChange={(e) => field.onChange([e.target.value])}
                          error={!!errors.role}
                          helperText={errors.role?.message}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Stack>

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.status}>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          <MenuItem value="ativo">Ativo</MenuItem>
                          <MenuItem value="inativo">Inativo</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Empresas Vinculadas (opcional)
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Vincular empresas a este usuário permitirá futuramente que ele alterne e acesse o
                portal do cliente diretamente pelo portal interno. A empresa ativa será a empresa
                selecionada por padrão.
              </Alert>

              <Stack spacing={2}>
                <Controller
                  name="empresasId"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Empresas</InputLabel>
                      <Select
                        {...field}
                        multiple
                        label="Empresas"
                        disabled={loadingEmpresas}
                        MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                        renderValue={(selected) => {
                          if (!selected?.length) return '';
                          if (selected.length === 1) {
                            const empresa = empresasDisponiveis.find((e) => e._id === selected[0]);
                            return empresa ? empresa.razaoSocial || empresa.nome : selected[0];
                          }
                          return `${selected.length} empresas selecionadas`;
                        }}
                      >
                        {loadingEmpresas ? (
                          <MenuItem disabled>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CircularProgress size={16} />
                              <Typography variant="body2">Carregando empresas...</Typography>
                            </Stack>
                          </MenuItem>
                        ) : (
                          empresasDisponiveis.map((empresa) => (
                            <MenuItem key={empresa._id} value={empresa._id}>
                              <Stack spacing={0.5} sx={{ width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {empresa.razaoSocial || empresa.nome}
                                </Typography>
                                {empresa.cnpj && (
                                  <Typography variant="caption" color="text.secondary">
                                    CNPJ: {empresa.cnpj}
                                  </Typography>
                                )}
                              </Stack>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                {watchedEmpresasId?.length > 0 && (
                  <>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Empresas selecionadas:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {watchedEmpresasId.map((empresaId) => {
                          const empresa = empresasDisponiveis.find((e) => e._id === empresaId);
                          return empresa ? (
                            <Chip
                              key={empresaId}
                              label={empresa.razaoSocial || empresa.nome}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : null;
                        })}
                      </Stack>
                    </Stack>

                    <Controller
                      name="empresaAtiva"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth error={!!error}>
                          <InputLabel>Empresa Ativa</InputLabel>
                          <Select {...field} label="Empresa Ativa">
                            {watchedEmpresasId.map((empresaId) => {
                              const empresa = empresasDisponiveis.find((e) => e._id === empresaId);
                              return (
                                <MenuItem key={empresaId} value={empresaId}>
                                  {empresa ? empresa.razaoSocial || empresa.nome : empresaId}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          {error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                              {error.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </>
                )}
              </Stack>
            </Box>

            {!isEdit && (
              <Alert severity="warning" sx={{ my: 4 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> A senha definida aqui será usada pelo usuário para
                  acessar o sistema interno.
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
            startIcon={
              loading ? (
                <Iconify icon="eos-icons:loading" />
              ) : (
                <Iconify icon={isEdit ? 'eva:save-fill' : 'eva:person-add-fill'} />
              )
            }
          >
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Usuário Interno'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
