'use client';

import { mutate } from 'swr';
import { useTheme } from '@emotion/react';
import { use, useState, useEffect } from 'react';
import { LazyMotion, m as motion, domAnimation } from 'framer-motion';

import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { endpoints } from 'src/utils/axios';

import { buscarCep } from 'src/actions/cep';
import { portalGetCliente, portalUpdateCliente } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { PortalClientesPageSkeleton } from 'src/components/skeleton/PortalClientePageSkeleton';

import { useAuthContext } from 'src/auth/hooks';

const onlyDigits = (v) => (v || '').replace(/\D/g, '');
const formatCEP = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
};
const formatPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m, a, b, c) =>
      [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' ')
    );
  }
  return d.replace(/(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m, a, b, c) =>
    [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' ')
  );
};
const formatCPF = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const formatCNPJ = (v) => {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};
const formatCPFOrCNPJ = (v) => {
  const d = onlyDigits(v);
  return d.length > 11 ? formatCNPJ(d) : formatCPF(d);
};

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

export default function PortalClienteEditPage({ params }) {
  const theme = useTheme();
  const { id } = use(params);
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarClientes } = useSettings();

  const [fetchingCep, setFetchingCep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loadedEmpresaId, setLoadedEmpresaId] = useState(null);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await portalGetCliente(clienteProprietarioId, id);
        setFormData({
          tipoPessoa: data?.tipoPessoa || 'juridica',
          nome: data?.nome || '',
          razaoSocial: data?.razaoSocial || '',
          cpfCnpj: data?.cpfCnpj || '',
          email: data?.email || '',
          telefone: data?.telefone || '',
          whatsapp: data?.whatsapp || '',
          endereco: data?.endereco || {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
          },
          observacao: data?.observacao || '',
        });
        setLoadedEmpresaId(clienteProprietarioId);
      } catch (error) {
        if (error?.response?.status !== 404) {
          toast.error('Erro ao carregar cliente');
        }
        router.replace('../../clientes');
      } finally {
        setLoading(false);
      }
    };
    if (clienteProprietarioId && id) {
      load();
    }
  }, [clienteProprietarioId, id, router]);

  useEffect(() => {
    if (loadedEmpresaId && clienteProprietarioId && loadedEmpresaId !== clienteProprietarioId) {
      router.replace('../../clientes');
    }
  }, [clienteProprietarioId, loadedEmpresaId, router]);

  if (loadingEmpresas || !clienteProprietarioId) {
    return <PortalClientesPageSkeleton />;
  }

  if (!podeGerenciarClientes) {
    return (
      <Box>
        <Typography variant="h6">Funcionalidade não disponível</Typography>
        <Typography variant="body2" color="text.secondary">
          Peça ao administrador para ativar Cadastro de Clientes nas configurações.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning('Por favor, preencha os dados corretamente.');
      return;
    }

    try {
      setSaving(true);
      await portalUpdateCliente(clienteProprietarioId, id, {
        ...formData,
        cpfCnpj: onlyDigits(formData.cpfCnpj),
        telefone: onlyDigits(formData.telefone),
        whatsapp: onlyDigits(formData.whatsapp),
        endereco: { ...formData.endereco, cep: onlyDigits(formData.endereco.cep) },
      });
      toast.success('Cliente atualizado com sucesso');
      const baseUrlLista = endpoints.portal.clientes.list(clienteProprietarioId);
      mutate(
        (key) => typeof key === 'string' && key.startsWith(baseUrlLista),
        undefined,
        { revalidate: true }
      );
      router.push('../../clientes');
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <PortalClientesPageSkeleton />
  }

  const handleCepBlur = async () => {
    const rawCep = onlyDigits(formData.endereco.cep);
    if (rawCep.length !== 8) return;
    try {
      setFetchingCep(true);
      const data = await buscarCep(rawCep);
      setFormData((f) => ({
        ...f,
        endereco: {
          ...f.endereco,
          rua: data.rua || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
        },
      }));
    } catch (err) {
      toast.error('CEP não encontrado');
    } finally {
      setFetchingCep(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const docDigits = onlyDigits(formData.cpfCnpj);
    const complemento = formData.endereco?.complemento?.trim() || '';

    if (!formData.nome.trim()) newErrors.nome = 'Nome / Nome Fantasia é obrigatório';
    if (formData.tipoPessoa === 'juridica' && !formData.razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão Social é obrigatória para Pessoa Jurídica';
    }
    if (!docDigits) {
      newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
    } else if (formData.tipoPessoa === 'fisica' && docDigits.length !== 11) {
      newErrors.cpfCnpj = 'CPF inválido, deve conter 11 dígitos';
    } else if (formData.tipoPessoa === 'juridica' && docDigits.length !== 14) {
      newErrors.cpfCnpj = 'CNPJ inválido, deve conter 14 dígitos';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (complemento.length > 30) {
      newErrors.complemento = 'Complemento deve possuir no máximo 30 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <form onSubmit={handleSubmit}>
          <Card sx={{ borderRadius: 3 }}>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              }}
            >
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                  Editar Cliente
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Altere os dados e clique em salvar para aplicar as mudanças.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button href="../../clientes" variant="outlined" color="inherit">
                  Cancelar
                </Button>
                <LoadingButton type="submit" variant="contained" loading={saving}>
                  Salvar Alterações
                </LoadingButton>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <SectionHeader icon="solar:user-id-bold-duotone" title="Dados Básicos" />
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo de Pessoa"
                    value={formData.tipoPessoa}
                    onChange={(e) => setFormData((f) => ({ ...f, tipoPessoa: e.target.value }))}
                  >
                    <MenuItem value="fisica">Pessoa Física</MenuItem>
                    <MenuItem value="juridica">Pessoa Jurídica</MenuItem>
                  </TextField>
                </Grid>
                <Grid xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Nome / Nome Fantasia"
                    value={formData.nome}
                    onChange={(e) => setFormData((f) => ({ ...f, nome: e.target.value }))}
                    error={!!errors.nome}
                    helperText={errors.nome}
                  />
                </Grid>
                {formData.tipoPessoa === 'juridica' && (
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Razão Social"
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData((f) => ({ ...f, razaoSocial: e.target.value }))}
                      error={!!errors.razaoSocial}
                      helperText={errors.razaoSocial}
                    />
                  </Grid>
                )}
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}
                    value={formData.cpfCnpj}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, cpfCnpj: formatCPFOrCNPJ(e.target.value) }))
                    }
                    error={!!errors.cpfCnpj}
                    helperText={errors.cpfCnpj}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, telefone: formatPhone(e.target.value) }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:phone-bold-duotone" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, whatsapp: formatPhone(e.target.value) }))
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="logos:whatsapp-icon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              <SectionHeader icon="solar:map-point-bold-duotone" title="Endereço" />
              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField
                    disabled={fetchingCep}
                    fullWidth
                    label="CEP"
                    value={formData.endereco.cep}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, cep: formatCEP(e.target.value) },
                      }))
                    }
                    onBlur={handleCepBlur}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:map-arrow-square-bold-duotone" />
                        </InputAdornment>
                      ),
                      endAdornment: fetchingCep ? (
                        <InputAdornment position="end">
                          <Iconify icon="line-md:loading-loop" />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={8}>
                  <TextField
                    disabled={fetchingCep}
                    fullWidth
                    label="Rua"
                    value={formData.endereco.rua}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, rua: e.target.value },
                      }))
                    }
                  />
                </Grid>
                <Grid xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={formData.endereco.numero}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, numero: e.target.value },
                      }))
                    }
                  />
                </Grid>
                <Grid xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    value={formData.endereco.complemento}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, complemento: e.target.value },
                      }))
                    }
                    error={!!errors.complemento}
                    helperText={errors.complemento}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    disabled={fetchingCep}
                    fullWidth
                    label="Bairro"
                    value={formData.endereco.bairro}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, bairro: e.target.value },
                      }))
                    }
                  />
                </Grid>
                <Grid xs={12} sm={8}>
                  <TextField
                    disabled={fetchingCep}
                    fullWidth
                    label="Cidade"
                    value={formData.endereco.cidade}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, cidade: e.target.value },
                      }))
                    }
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    disabled={fetchingCep}
                    fullWidth
                    label="Estado"
                    value={formData.endereco.estado}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        endereco: { ...f.endereco, estado: e.target.value },
                      }))
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

              <SectionHeader icon="solar:document-text-bold-duotone" title="Observações" />
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Observação (opcional)"
                value={formData.observacao}
                onChange={(e) => setFormData((f) => ({ ...f, observacao: e.target.value }))}
              />
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </LazyMotion>
  );
}
