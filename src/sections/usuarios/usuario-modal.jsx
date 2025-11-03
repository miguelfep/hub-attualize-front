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

const usuarioSchema = zod.object({
  name: zod.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: zod.string().email('Email inválido'),
  password: zod.string().optional().refine((val) => {
    // Se senha foi informada, deve ter pelo menos 6 caracteres
    if (val && val.length > 0 && val.length < 6) {
      return false;
    }
    return true;
  }, {
    message: 'Senha deve ter pelo menos 6 caracteres'
  }),
  confirmPassword: zod.string().optional(),
  empresasId: zod.array(zod.string()).min(1, 'Selecione pelo menos uma empresa'),
  role: zod.string().min(1, 'Perfil é obrigatório'),
  status: zod.string().min(1, 'Status é obrigatório'),
}).refine((data) => {
  // Se senha foi informada, confirmação deve ser igual
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const defaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  empresasId: [],
  role: 'cliente',
  status: 'ativo',
};

export function UsuarioModal({ open, onClose, onSave, usuario }) {
  const [loading, setLoading] = useState(false);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues,
  });

  const isEdit = !!usuario;
  const watchedRole = watch('role');

  // Carregar empresas disponíveis
  const fetchEmpresas = async () => {
    try {
      setLoadingEmpresas(true);
      const clientes = await getClientes();
      if (clientes.length > 0) {
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
        // Garantir que empresasId seja sempre um array de strings
        const empresasIdArray = Array.isArray(usuario.empresasId) 
          ? usuario.empresasId.map(empresa => typeof empresa === 'string' ? empresa : empresa._id || empresa.id)
          : [];
          
        reset({
          name: usuario.name || '',
          email: usuario.email || '',
          password: '', // Não preencher senha na edição
          confirmPassword: '',
          role: 'cliente', // Sempre cliente
          status: usuario.status === true ? 'ativo' : usuario.status === false ? 'inativo' : 'ativo',
          empresasId: empresasIdArray,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, usuario, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Validação customizada: senha obrigatória na criação
      if (!isEdit && !data.password) {
        setError('password', { 
          type: 'manual', 
          message: 'Senha é obrigatória para novos usuários' 
        });
        return;
      }
      
      // Remover campos vazios de senha na edição
      if (isEdit && !data.password) {
        delete data.password;
        delete data.confirmPassword;
      }

      
      // Converter status para boolean
      const dataToSave = {
        ...data,
        status: data.status === 'ativo',
        role: 'cliente', // Sempre cliente
        empresasId: data.empresasId, // Usar empresasId para o backend
      };
      if(isEdit && usuario._id){
        dataToSave.userId = usuario._id;
      }

      
      await onSave(dataToSave);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify 
            icon={isEdit ? 'eva:edit-fill' : 'eva:person-add-fill'} 
            width={24} 
            sx={{ color: 'primary.main' }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isEdit ? 'Editar Usuário Cliente' : 'Novo Usuário Cliente'}
          </Typography>
        </Stack>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            {/* Informações Básicas */}
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

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={isEdit ? "Nova Senha (opcional)" : "Senha"}
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        fullWidth
                        placeholder={isEdit ? "Deixe em branco para manter a senha atual" : ""}
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
                        placeholder={isEdit ? "Confirme a nova senha" : ""}
                      />
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.role}>
                        <InputLabel>Perfil</InputLabel>
                        <Select {...field} label="Perfil">
                          <MenuItem value="cliente">Cliente</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

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

            {/* Empresas de Acesso */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Empresas de Acesso
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Selecione quais empresas este usuário pode acessar no portal.
              </Alert>

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
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
                      renderValue={(selected) => {
                        if (selected.length === 0) return '';
                        if (selected.length === 1) {
                          const empresa = empresasDisponiveis.find(e => e._id === selected[0]);
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

              {watch('empresasId')?.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Empresas selecionadas:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {watch('empresasId').map((empresaId) => {
                      const empresa = empresasDisponiveis.find(e => e._id === empresaId);
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
              )}
            </Box>

            {!isEdit && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Importante:</strong> Após criar o usuário, um email será enviado 
                  com as instruções para definir a senha de acesso.
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
                <Iconify icon={isEdit ? 'eva:save-fill' : 'eva:person-add-fill' } />
              )
            }
          >
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Usuário Cliente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
