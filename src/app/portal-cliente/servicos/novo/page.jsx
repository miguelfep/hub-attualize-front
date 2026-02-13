'use client';

import React from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { formatCNAE } from 'src/utils/formatter';
import { fCurrency } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import { portalCreateServico } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

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

export default function NovoServicoPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, empresaAtivaData, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos, podeEmitirNFSe, settings } = useSettings();
  const router = useRouter();

  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    nome: '',
    descricao: '',
    valor: 0,
    valorText: fCurrency(0),
    unidade: 'UN',
    categoria: '',
    cnae: '',
    codigoServicoMunicipio: '',
    itemListaServicoLC116: '',
  });
  const onlyDigits = (v) => (v || '').replace(/\D/g, '');
  const formatBRLInput = (v) => {
    const d = onlyDigits(v);
    const n = Number(d) / 100;
    return { text: fCurrency(n), value: n };
  };
  const [cnaesEmpresa, setCnaesEmpresa] = React.useState([]);
  const [loadingCnaes, setLoadingCnaes] = React.useState(false);
  const [empresaUf, setEmpresaUf] = React.useState('');
  const [empresaCidade, setEmpresaCidade] = React.useState('');
  const normalizeCNAE = (v) => String(v || '').replace(/\D/g, '');

  const emiteNFSeNacional = settings?.eNotasConfig?.emiteNFSeNacional;

  React.useEffect(() => {
    let ignore = false;
    const loadCnaes = async () => {
      if (!clienteProprietarioId) return;
      try {
        setLoadingCnaes(true);
        const cli = await getClienteById(clienteProprietarioId);
        const prim = Array.isArray(cli?.atividade_principal)
          ? cli.atividade_principal
          : cli?.atividade_principal
            ? [cli.atividade_principal]
            : [];
        const sec = Array.isArray(cli?.atividades_secundarias) ? cli.atividades_secundarias : [];
        const list = [...prim, ...sec].filter(Boolean);
        const cnaes = list
          .map((a) => ({
            code: a.code || a.codigo || a.cnae || '',
            text: a.text || a.descricao || '',
          }))
          .filter((x) => x.code);
        if (!ignore) setCnaesEmpresa(cnaes);
        const uf = cli?.endereco?.[0]?.estado || cli?.endereco?.[0]?.uf || '';
        const cid = cli?.endereco?.[0]?.cidade || '';
        if (!ignore) {
          setEmpresaUf(String(uf || '').toUpperCase());
          setEmpresaCidade(cid || '');
        }
      } catch (e) {
        if (!ignore) setCnaesEmpresa([]);
      } finally {
        if (!ignore) setLoadingCnaes(false);
      }
    };
    loadCnaes();
    return () => {
      ignore = true;
    };
  }, [clienteProprietarioId]);

  if (loadingEmpresas || !clienteProprietarioId) return <Typography>Carregando...</Typography>;
  if (!podeGerenciarServicos) return <Typography>Funcionalidade não disponível</Typography>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) {
      toast.error('Informe o nome do serviço');
      return false;
    }
    if (!form.valor || Number(form.valor) <= 0) {
      toast.error('Informe um valor válido');
      return false;
    }
    if (podeEmitirNFSe && !form.cnae) {
      toast.error('Informe o CNAE');
      return false;
    }
    try {
      setSaving(true);
      const sanitizeCnae = (str) => {
        if (!str) return undefined;
        const onlyCode = String(str).split(' - ')[0].split(' ')[0];
        return onlyCode.replace(/\D/g, '');
      };
      const payload = {
        clienteProprietarioId,
        nome: form.nome,
        descricao: form.descricao,
        valor: Number(form.valor),
        unidade: form.unidade,
        categoria: form.categoria,
        // NFSe (condicional) - enviar CNAE + campos de serviço
        ...(podeEmitirNFSe
          ? {
              cnae: sanitizeCnae(form.cnae),
              codigoServicoMunicipio: form.codigoServicoMunicipio || '',
              itemListaServicoLC116: form.itemListaServicoLC116 || '',
            }
          : {}),
      };
      await portalCreateServico(payload);
      toast.success('Serviço criado');
      router.replace(paths.cliente.servicos);
      return true;
    } catch (err) {
      toast.error('Erro ao criar serviço');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
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
                  Novo Serviço
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Preencha os dados para cadastrar um novo serviço.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button href={paths.cliente.servicos} variant="outlined" color="inherit">
                  Cancelar
                </Button>
                <LoadingButton type="submit" variant="contained" loading={saving}>
                  Salvar Serviço
                </LoadingButton>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <SectionHeader icon="solar:document-add-bold-duotone" title="Dados do Serviço" />
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Serviço"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Descrição (Opcional)"
                    value={form.descricao}
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Valor"
                    value={form.valorText}
                    onChange={(e) => {
                      const { value, text } = formatBRLInput(e.target.value);
                      setForm((f) => ({ ...f, valor: value, valorText: text }));
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:money-bag-bold-duotone" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Unidade"
                    value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Categoria (Opcional)"
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  />
                </Grid>
              </Grid>

              {podeEmitirNFSe && (
                <>
                  <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                  <SectionHeader
                    icon="solar:file-text-bold-duotone"
                    title="Informações Fiscais (NFSe)"
                  />
                  <Grid container spacing={2}>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        select
                        required
                        label="CNAE da Empresa"
                        value={form.cnae}
                        onChange={(e) => setForm((f) => ({ ...f, cnae: e.target.value }))}
                        SelectProps={{ displayEmpty: true }}
                        InputLabelProps={{ shrink: true }}
                        disabled={loadingCnaes}
                        helperText={loadingCnaes ? 'Carregando CNAEs...' : 'Selecione o CNAE relacionado ao serviço'}
                      >
                        <MenuItem value="">Selecione</MenuItem>
                        {cnaesEmpresa.map((c) => {
                          const val = normalizeCNAE(c.code);
                          return (
                            <MenuItem key={`${c.code}-${val}`} value={val}>
                              {formatCNAE(val)} - {c.text}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </Grid>
                    
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Código do Serviço no Município"
                        value={form.codigoServicoMunicipio}
                        onChange={(e) => setForm((f) => ({ ...f, codigoServicoMunicipio: e.target.value }))}
                        placeholder="Ex: 01010501"
                        helperText="Código do serviço conforme cadastro municipal"
                      />
                    </Grid>
                    
                    <Grid xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Item Lista Serviço LC 116/2003"
                        value={form.itemListaServicoLC116}
                        onChange={(e) => setForm((f) => ({ ...f, itemListaServicoLC116: e.target.value }))}
                        placeholder="Ex: 01.01"
                        helperText="Item da Lei Complementar 116/2003"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </form>
      </m.div>
    </LazyMotion>
  );
}
