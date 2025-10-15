'use client';

import { useEffect, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Typography, Button, TextField, MenuItem, Stack, Card, CardContent, InputAdornment } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';
import { useRouter } from 'src/routes/hooks';

import { useSettings } from 'src/hooks/useSettings';
import { portalGetCliente, portalUpdateCliente } from 'src/actions/portal';
import { buscarCep } from 'src/actions/cep';

const onlyDigits = (v) => (v || '').replace(/\D/g, '');
const formatCEP = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
};
const formatPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m, a, b, c) => [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' '));
  }
  return d.replace(/(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m, a, b, c) => [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' '));
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

export default function PortalClienteEditPage({ params }) {
  const { id } = params;
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarClientes } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loadedEmpresaId, setLoadedEmpresaId] = useState(null);
  const router = useRouter();

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
          endereco: data?.endereco || { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
          observacao: data?.observacao || '',
        });
        setLoadedEmpresaId(clienteProprietarioId);
      } catch (error) {
        toast.error('Erro ao carregar cliente');
        router.replace('../../clientes');
      } finally {
        setLoading(false);
      }
    };
    if (clienteProprietarioId) {
      load();
    }
  }, [clienteProprietarioId, id]);

  // Se a empresa ativa mudar após o carregamento do cliente, redireciona para a lista
  useEffect(() => {
    if (loadedEmpresaId && clienteProprietarioId && loadedEmpresaId !== clienteProprietarioId) {
      router.replace('../../clientes');
    }
  }, [clienteProprietarioId, loadedEmpresaId, router]);

  if (loadingEmpresas || !clienteProprietarioId) {
    return <Typography>Carregando...</Typography>;
  }

  if (!podeGerenciarClientes) {
    return (
      <Box>
        <Typography variant="h6">Funcionalidade não disponível</Typography>
        <Typography variant="body2" color="text.secondary">
          Peça ao administrador para ativar "Cadastro de Clientes" nas configurações.
        </Typography>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      window.location.href = '../../clientes';
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <Typography>Carregando...</Typography>;
  }

  const handleCepBlur = async () => {
    const rawCep = onlyDigits(formData.endereco.cep);
    if (rawCep.length !== 8) return;
    try {
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
    }
  };

  return (
    <SimplePaper>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Editar Cliente</Typography>
          <Stack direction="row" spacing={1}>
            <Button href="../../clientes" variant="text">Cancelar</Button>
            <LoadingButton type="submit" variant="contained" loading={saving}>Salvar</LoadingButton>
          </Stack>
        </Stack>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Dados Básicos</Typography>
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
                <TextField fullWidth label="Nome" value={formData.nome} onChange={(e) => setFormData((f) => ({ ...f, nome: e.target.value }))} />
              </Grid>
              {formData.tipoPessoa === 'juridica' && (
                <Grid xs={12}>
                  <TextField fullWidth label="Razão Social" value={formData.razaoSocial} onChange={(e) => setFormData((f) => ({ ...f, razaoSocial: e.target.value }))} />
                </Grid>
              )}
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={formData.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData((f) => ({ ...f, cpfCnpj: formatCPFOrCNPJ(e.target.value) }))}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData((f) => ({ ...f, telefone: formatPhone(e.target.value) }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">📞</InputAdornment> }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((f) => ({ ...f, whatsapp: formatPhone(e.target.value) }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">💬</InputAdornment> }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Endereço</Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="CEP"
                  value={formData.endereco.cep}
                  onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, cep: formatCEP(e.target.value) } }))}
                  onBlur={handleCepBlur}
                  InputProps={{ startAdornment: <InputAdornment position="start">🏷️</InputAdornment> }}
                />
              </Grid>
              <Grid xs={12} sm={8}>
                <TextField fullWidth label="Rua" value={formData.endereco.rua} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, rua: e.target.value } }))} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Número" value={formData.endereco.numero} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, numero: e.target.value } }))} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Complemento" value={formData.endereco.complemento} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, complemento: e.target.value } }))} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Bairro" value={formData.endereco.bairro} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, bairro: e.target.value } }))} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Cidade" value={formData.endereco.cidade} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, cidade: e.target.value } }))} />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth label="Estado" value={formData.endereco.estado} onChange={(e) => setFormData((f) => ({ ...f, endereco: { ...f.endereco, estado: e.target.value } }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Observações</Typography>
            <TextField fullWidth multiline minRows={3} label="Observação" value={formData.observacao} onChange={(e) => setFormData((f) => ({ ...f, observacao: e.target.value }))} />
          </CardContent>
        </Card>
      </form>
    </SimplePaper>
  );
}


