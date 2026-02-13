'use client';

import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { formatCNAE } from 'src/utils/formatter';
import { fCurrency } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import { createServicoAdmin } from 'src/actions/servicos-admin';

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

export default function NovoServicoAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteIdFromUrl = searchParams.get('clienteId');

  const [saving, setSaving] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(true);
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

  // Carregar dados do cliente
  useEffect(() => {
    const loadCliente = async () => {
      if (!clienteIdFromUrl) {
        setLoadingCliente(false);
        return;
      }
      
      try {
        setLoadingCliente(true);
        const clienteData = await getClienteById(clienteIdFromUrl);
        setCliente(clienteData);
      } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
      } finally {
        setLoadingCliente(false);
      }
    };

    loadCliente();
  }, [clienteIdFromUrl]);

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
    
    if (!clienteIdFromUrl) {
      toast.error('Cliente não informado');
      return;
    }
    
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
        clienteProprietarioId: clienteIdFromUrl,
      };

      await createServicoAdmin(payload);
      
      toast.success('Serviço criado com sucesso!');
      router.push(`${paths.dashboard.servicos}?clienteId=${clienteIdFromUrl}`);
    } catch (error) {
      console.error('Erro ao criar:', error);
      
      // Extrair mensagem de erro da resposta da API
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Erro ao criar serviço';
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loadingCliente) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Carregando...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!clienteIdFromUrl) {
    return (
      <DashboardContent>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error">
              Cliente não informado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Por favor, selecione um cliente na página de gerenciamento de serviços.
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => router.push(paths.dashboard.servicos)}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={() => router.push(`${paths.dashboard.servicos}?clienteId=${clienteIdFromUrl}`)}
          >
            Voltar
          </Button>
        </Stack>
        
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Novo Serviço
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cliente: {cliente?.razaoSocial || cliente?.nomeFantasia || cliente?.email || 'Carregando...'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
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

          <Grid xs={12} md={4}>
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
                      Criar Serviço
                    </LoadingButton>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push(`${paths.dashboard.servicos}?clienteId=${clienteIdFromUrl}`)}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </DashboardContent>
  );
}

