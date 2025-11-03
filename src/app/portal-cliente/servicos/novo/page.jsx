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
  CircularProgress,
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
    codigoServico: '',
    cnae: '',
  });
  const onlyDigits = (v) => (v || '').replace(/\D/g, '');
  const formatBRLInput = (v) => {
    const d = onlyDigits(v);
    const n = Number(d) / 100;
    return { text: fCurrency(n), value: n };
  };
  const [cnaesEmpresa, setCnaesEmpresa] = React.useState([]);
  const [loadingCnaes, setLoadingCnaes] = React.useState(false);
  const [codigoOptions, setCodigoOptions] = React.useState([]);
  const [loadingServicosENotas, setLoadingServicosENotas] = React.useState(false);
  const [empresaUf, setEmpresaUf] = React.useState('');
  const [empresaCidade, setEmpresaCidade] = React.useState('');
  const [selectedServicoENotas, setSelectedServicoENotas] = React.useState(null);
  const [buscaLivreServico, setBuscaLivreServico] = React.useState('');
  const normalizeCNAE = (v) => String(v || '').replace(/\D/g, '');

  const emiteNFSeNacional = settings?.eNotasConfig?.emiteNFSeNacional;

  // Função para consultar serviços na eNotas
  const consultarServicosENotas = React.useCallback(async (uf, cidade, descricao, limit = 4) => {
    if (!descricao) return [];
    const apiKey = process.env.NEXT_PUBLIC_ENOTAS_API_KEY;
    if (!apiKey) return [];
    
    try {
      setLoadingServicosENotas(true);
      const pageSize = Math.max(limit, 4);
      const filter = `contains(descricao, '${descricao}')`;
      
      // Construir URL baseado no tipo de emissão
      let url;
      if (emiteNFSeNacional) {
        // Rota nacional - usa codigoIBGECidade = -1
        url = `https://api.enotasgw.com.br/v1/estados/cidades/-1/servicos?pageNumber=0&pageSize=${pageSize}&filter=${encodeURIComponent(filter)}`;
      } else {
        // Rota municipal - usa UF e cidade específica
        if (!uf || !cidade) return [];
        url = `https://api.enotasgw.com.br/v1/estados/${encodeURIComponent(uf)}/cidades/${encodeURIComponent(cidade)}/servicos?pageNumber=0&pageSize=${pageSize}&filter=${encodeURIComponent(filter)}`;
      }
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${apiKey}`,
        },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      return data.slice(0, limit).map((s) => ({
        code: String(s.codigo),
        descricao: s.descricao,
        raw: s,
      }));
    } catch (e) {
      return [];
    } finally {
      setLoadingServicosENotas(false);
    }
  }, [emiteNFSeNacional]);

  // Busca livre com debounce (para NFSe Nacional)
  React.useEffect(() => {
    if (!emiteNFSeNacional || !buscaLivreServico || buscaLivreServico.length < 3) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      const opts = await consultarServicosENotas('', '', buscaLivreServico, 10);
      setCodigoOptions(opts);
      setForm((f) => ({ ...f, codigoServico: '' }));
    }, 800);

    return () => clearTimeout(timer);
  }, [buscaLivreServico, emiteNFSeNacional, consultarServicosENotas]);

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
    if (podeEmitirNFSe && !form.codigoServico) {
      toast.error('Selecione o Código de Serviço');
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
        // NFSe (condicional) - sempre enviar CNAE + SMU ou CNAE + codigoServico
        ...(podeEmitirNFSe
          ? {
              cnae: sanitizeCnae(form.cnae),
              ...(selectedServicoENotas
                ? {
                    smu: {
                      codigo: selectedServicoENotas?.codigo,
                      descricao: selectedServicoENotas?.descricao,
                      codigoIBGECidade: selectedServicoENotas?.codigoIBGECidade,
                      aliquotaSugerida: selectedServicoENotas?.aliquotaSugerida,
                      construcaoCivil: selectedServicoENotas?.construcaoCivil,
                      percentualAproximadoFederalIBPT: selectedServicoENotas?.percentualAproximadoFederalIBPT,
                      percentualAproximadoEstadualIBPT: selectedServicoENotas?.percentualAproximadoEstadualIBPT,
                      percentualAproximadoMunicipalIBPT: selectedServicoENotas?.percentualAproximadoMunicipalIBPT,
                      chaveTabelaIBPT: selectedServicoENotas?.chaveTabelaIBPT,
                    },
                  }
                : {
                    codigoServico: form.codigoServico || undefined,
                  }),
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Serviço"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Descrição (Opcional)"
                    value={form.descricao}
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Unidade"
                    value={form.unidade}
                    onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12}>
                      {emiteNFSeNacional ? (
                        // Campo livre para NFSe Nacional
                        <TextField
                          fullWidth
                          label="Descreva o serviço que você faz"
                          value={buscaLivreServico}
                          onChange={(e) => setBuscaLivreServico(e.target.value)}
                          placeholder="Ex: treinamento, consultoria, desenvolvimento..."
                          helperText={
                            buscaLivreServico.length < 3 
                              ? 'Digite pelo menos 3 caracteres para buscar'
                              : loadingServicosENotas 
                              ? 'Buscando códigos de serviço...'
                              : `${codigoOptions.length} código(s) encontrado(s)`
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" />
                              </InputAdornment>
                            ),
                            endAdornment: loadingServicosENotas && (
                              <InputAdornment position="end">
                                <CircularProgress size={20} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      ) : (
                        // Select de CNAE para NFSe Municipal
                        <TextField
                          fullWidth
                          select
                          label="CNAE da Empresa"
                          value={form.cnae}
                          onChange={(e) => {
                            const val = e.target.value;
                            const selected = cnaesEmpresa.find((c) => normalizeCNAE(c.code) === val);
                            setForm((f) => ({ ...f, cnae: val }));
                            setSelectedServicoENotas(null);
                            setCodigoOptions([]);
                            (async () => {
                              const opts = await consultarServicosENotas(empresaUf, empresaCidade, selected?.text || '', 4);
                              setCodigoOptions(opts);
                              setForm((f) => ({ ...f, codigoServico: '' }));
                            })();
                          }}
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                          disabled={loadingCnaes}
                          helperText={loadingCnaes ? 'Carregando CNAEs...' : ''}
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
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      {codigoOptions.length > 0 ? (
                        <TextField
                          fullWidth
                          select
                          label="Código de Serviço"
                          required
                          value={form.codigoServico}
                          onChange={(e) => {
                            const val = e.target.value;
                            const sel = codigoOptions.find((o) => o.code === val) || null;
                            setSelectedServicoENotas(sel?.raw || null);
                            setForm((f) => ({ ...f, codigoServico: val }));
                          }}
                          SelectProps={{ displayEmpty: true }}
                          InputLabelProps={{ shrink: true }}
                          placeholder="Selecione o CNAE para sugerir opções"
                          helperText={loadingServicosENotas ? 'Consultando serviços na eNotas...' : 'Selecione a opção mais aderente'}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          {codigoOptions.map((opt) => (
                            <MenuItem key={opt.code} value={opt.code}>
                              {opt.descricao} — {opt.code}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          fullWidth
                          label="Código de Serviço"
                          required
                          value={form.codigoServico}
                          onChange={(e) => {
                            setSelectedServicoENotas(null);
                            setForm((f) => ({ ...f, codigoServico: e.target.value }));
                          }}
                          placeholder="Informe o código (LC 116) caso a eNotas não retorne opções"
                          helperText={loadingServicosENotas ? 'Consultando serviços na eNotas...' : 'Nenhuma opção retornada. Informe manualmente.'}
                        />
                      )}
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
