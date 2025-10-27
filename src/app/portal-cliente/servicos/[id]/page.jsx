'use client';

import { toast } from 'sonner';
import { mutate as mutateGlobal } from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { endpoints } from 'src/utils/axios';
import { formatCNAE } from 'src/utils/formatter';
import { fCurrency } from 'src/utils/format-number';

import { getClienteById } from 'src/actions/clientes';
import { portalGetServico, portalUpdateServico } from 'src/actions/portal';

import { Iconify } from 'src/components/iconify';
import { EditarServicoPageSkeleton } from 'src/components/skeleton/EditarServicoPageSkeleton';

import { useAuthContext } from 'src/auth/hooks';


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
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------

export default function EditarServicoPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos, podeEmitirNFSe } = useSettings();

  const router = useRouter();
  const params = useParams();
  const { id: servicoId } = params;
  const theme = useTheme();

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    valor: 0,
    valorText: fCurrency(0),
    unidade: 'UN',
    categoria: '',
    codigoServico: '',
    cnae: '',
  });

  const [cnaesEmpresa, setCnaesEmpresa] = useState([]);
  const [loadingCnaes, setLoadingCnaes] = useState(false);
  const [codigoOptions, setCodigoOptions] = useState([]);
  const [loadingServicosENotas, setLoadingServicosENotas] = useState(false);
  const [empresaUf, setEmpresaUf] = useState('');
  const [empresaCidade, setEmpresaCidade] = useState('');
  const [selectedServicoENotas, setSelectedServicoENotas] = useState(null);
  const normalizeCNAE = (v) => String(v || '').replace(/\D/g, '');

  useEffect(() => {

    const loadServicoData = async () => {
      try {
        setLoadingData(true);
        const servicoData = await portalGetServico(clienteProprietarioId, servicoId);

        const { value, text } = formatBRLInput(String(servicoData.valor * 100));

        setForm({
          nome: servicoData.nome || '',
          descricao: servicoData.descricao || '',
          valor: value,
          valorText: text,
          unidade: servicoData.unidade || 'UN',
          categoria: servicoData.categoria || '',
          codigoServico: servicoData.codigoServico || '',
          cnae: normalizeCNAE(servicoData.cnae || ''),
        });
      } catch (error) {
        toast.error('Erro ao carregar dados do serviço.');
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    if (servicoId && clienteProprietarioId) {
      loadServicoData();
    }
  }, [servicoId, clienteProprietarioId]);

  useEffect(() => {
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
        // UF e Cidade para consulta na eNotas
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

  const consultarServicosENotas = useCallback(async (uf, cidade, descricao, limit = 4) => {
    if (!uf || !cidade || !descricao) return [];
    const apiKey = process.env.NEXT_PUBLIC_ENOTAS_API_KEY;
    if (!apiKey) return [];
    try {
      setLoadingServicosENotas(true);
      const pageSize = Math.max(limit, 4);
      const filter = `contains(descricao, '${descricao}')`;
      const url = `https://api.enotasgw.com.br/v1/estados/${encodeURIComponent(uf)}/cidades/${encodeURIComponent(cidade)}/servicos?pageNumber=0&pageSize=${pageSize}&filter=${encodeURIComponent(filter)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Basic ${apiKey}` },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      return data.slice(0, limit).map((s) => ({ code: String(s.codigo), descricao: s.descricao, raw: s }));
    } catch (e) {
      return [];
    } finally {
      setLoadingServicosENotas(false);
    }
  }, []);

const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Informe o nome do serviço'); return; }
    if (!form.valor || Number(form.valor) <= 0) { toast.error('Informe um valor válido'); return; }
    if (podeEmitirNFSe && !form.codigoServico) { toast.error('Selecione o Código de Serviço'); return; }

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
        ...(podeEmitirNFSe ? (
          selectedServicoENotas
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
                cnae: sanitizeCnae(form.cnae),
              }
        ) : {}),
      };
      await portalUpdateServico(servicoId, payload);
      toast.success('Serviço atualizado com sucesso!');
      const baseKey = endpoints.portal.servicos.list(clienteProprietarioId);
      mutateGlobal((key) => typeof key === 'string' && key.startsWith(baseKey), undefined, { revalidate: true });

router.replace(paths.cliente.servicos);
      router.replace(paths.cliente.servicos);
    } catch (err) {
      toast.error('Erro ao atualizar serviço');
    } finally {
      setSaving(false);
    }
  }, [form, podeEmitirNFSe, router, servicoId, clienteProprietarioId, selectedServicoENotas]);

  if (loadingEmpresas || loadingData) return <EditarServicoPageSkeleton />;
  if (!podeGerenciarServicos) return <Typography>Funcionalidade não disponível</Typography>;

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
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              }}
            >
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                  Editar Serviço
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Altere os dados e salve para aplicar as mudanças.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button href={paths.cliente.servicos} variant="outlined" color="inherit">
                  Cancelar
                </Button>
                <LoadingButton type="submit" variant="contained" loading={saving}>
                  Salvar Alterações
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
                  <CustomDivider />
                  <SectionHeader
                    icon="solar:file-text-bold-duotone"
                    title="Informações Fiscais (NFSe)"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="CNAE da Empresa"
                        value={form.cnae}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setForm((f) => ({ ...f, cnae: val }));
                          setSelectedServicoENotas(null);
                          setCodigoOptions([]);
                          const selected = cnaesEmpresa.find((c) => normalizeCNAE(c.code) === val);
                          const opts = await consultarServicosENotas(empresaUf, empresaCidade, selected?.text || '', 4);
                          setCodigoOptions(opts);
                          // Não auto-selecionar; usuário deve escolher o código
                          setForm((f) => ({ ...f, codigoServico: '' }));
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
