'use client';

import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Card,
  Alert,
  Stack,
  Button,
  Select,
  Divider,
  MenuItem,
  TextField,
  CardHeader,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { formatarDataCertificado } from 'src/actions/certificados';
import {
  configurarAttualize,
  uploadCertificadoAttualize,
  buscarConfiguracaoAttualize,
  listarCertificadosAttualize,
} from 'src/actions/settings';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const NACIONAL_DEFAULTS = {
  ambiente: 'homologacao',
  serieDps: '1',
  proximoNumeroDps: 1,
  ultimoNSU: 0,
  codigoMunicipio: '',
  codigoTributacaoNacional: '',
  codigoTributacaoMunicipal: '',
  regimeEspecialTributacao: 0,
  optanteSimplesNacional: 3,
  regimeApuracaoTributosSN: 1,
  percentualTotalTributosSN: '',
  idCertificado: '',
};

function montarEstadoNacional(config) {
  const nac = config?.nfseNacionalConfig || {};
  return {
    ...NACIONAL_DEFAULTS,
    ...Object.fromEntries(
      Object.entries(nac).filter(([, valor]) => valor !== null && valor !== undefined)
    ),
    idCertificado: nac.idCertificado ? String(nac.idCertificado) : '',
  };
}

export function AttualizeConfigView() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [provedorNFSe, setProvedorNFSe] = useState('enotas');
  const [nacional, setNacional] = useState(NACIONAL_DEFAULTS);
  const [certArquivo, setCertArquivo] = useState(null);
  const [certSenha, setCertSenha] = useState('');
  const [enviandoCert, setEnviandoCert] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [configRes, certsRes] = await Promise.all([
        // 404 = configuração ainda não cadastrada: não é erro, mostra o alerta
        buscarConfiguracaoAttualize().catch((err) => {
          if (err?.status === 404) return { data: { data: null } };
          throw err;
        }),
        listarCertificadosAttualize(),
      ]);
      const dados = configRes.data?.data || null;
      setConfig(dados);
      setProvedorNFSe(dados?.provedorNFSe || 'enotas');
      setNacional(montarEstadoNacional(dados));
      setCertificados(certsRes.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao carregar a configuração da Attualize');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleNacionalChange = (campo) => (event) => {
    setNacional((atual) => ({ ...atual, [campo]: event.target.value }));
  };

  const handleEnviarCertificado = async () => {
    if (!certArquivo) {
      toast.error('Selecione o arquivo do certificado (.pfx ou .p12).');
      return;
    }
    if (!certSenha.trim()) {
      toast.error('Informe a senha do certificado.');
      return;
    }
    setEnviandoCert(true);
    try {
      const res = await uploadCertificadoAttualize(certArquivo, certSenha);
      toast.success(res.data?.message || 'Certificado enviado com sucesso');
      setCertArquivo(null);
      setCertSenha('');
      await carregar();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao enviar o certificado');
    } finally {
      setEnviandoCert(false);
    }
  };

  const handleSalvar = async () => {
    if (provedorNFSe === 'nacional') {
      if (!nacional.idCertificado) {
        toast.error('Selecione o certificado digital — obrigatório para o Emissor Nacional.');
        return;
      }
      if (!nacional.codigoMunicipio && !config?.endereco?.codigoIbgeCidade) {
        toast.error('Informe o código IBGE do município emissor.');
        return;
      }
    }

    setSalvando(true);
    try {
      const payload = {
        provedorNFSe,
        nfseNacionalConfig: {
          ambiente: nacional.ambiente,
          serieDps: nacional.serieDps || '1',
          proximoNumeroDps: Number(nacional.proximoNumeroDps) || 1,
          codigoMunicipio: nacional.codigoMunicipio || undefined,
          codigoTributacaoNacional: nacional.codigoTributacaoNacional || undefined,
          codigoTributacaoMunicipal: nacional.codigoTributacaoMunicipal || undefined,
          regimeEspecialTributacao: Number(nacional.regimeEspecialTributacao) || 0,
          optanteSimplesNacional: Number(nacional.optanteSimplesNacional) || undefined,
          regimeApuracaoTributosSN:
            Number(nacional.optanteSimplesNacional) === 3
              ? Number(nacional.regimeApuracaoTributosSN) || 1
              : undefined,
          percentualTotalTributosSN:
            nacional.percentualTotalTributosSN === '' || nacional.percentualTotalTributosSN === null
              ? undefined
              : Number(nacional.percentualTotalTributosSN),
          idCertificado: nacional.idCertificado || undefined,
        },
      };
      await configurarAttualize(payload);
      toast.success('Configuração de emissão da Attualize salva com sucesso');
      await carregar();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || error?.message || 'Erro ao salvar configuração'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Emissão Attualize"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Configurações' },
          { name: 'Emissão Attualize' },
        ]}
        sx={{ mb: 3 }}
      />

      {carregando ? (
        <Stack alignItems="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack spacing={3}>
          {!config && (
            <Alert severity="warning">
              Configuração base da Attualize não encontrada no banco. Cadastre os dados da empresa
              (CNPJ, razão social, endereço) antes de configurar a emissão.
            </Alert>
          )}

          {config && (
            <Card>
              <CardHeader
                title="Empresa"
                subheader="Dados usados como prestador nas notas emitidas pela Attualize"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Razão social
                    </Typography>
                    <Typography variant="body2">{config.razaoSocial || '—'}</Typography>
                  </Grid>
                  <Grid xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      CNPJ
                    </Typography>
                    <Typography variant="body2">{config.cnpj || '—'}</Typography>
                  </Grid>
                  <Grid xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Inscrição municipal
                    </Typography>
                    <Typography variant="body2">{config.inscricaoMunicipal || '—'}</Typography>
                  </Grid>
                  <Grid xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Município
                    </Typography>
                    <Typography variant="body2">
                      {config.endereco?.cidade
                        ? `${config.endereco.cidade}/${config.endereco.uf}`
                        : '—'}
                      {config.endereco?.codigoIbgeCidade
                        ? ` (IBGE ${config.endereco.codigoIbgeCidade})`
                        : ''}
                    </Typography>
                  </Grid>
                  <Grid xs={6} md={2}>
                    <Typography variant="caption" color="text.secondary">
                      Alíquota ISS
                    </Typography>
                    <Typography variant="body2">
                      {config.aliquotaIss != null ? `${config.aliquotaIss}%` : '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Provedor de emissão"
              subheader="Vale para as notas da Attualize: cobranças de contratos e vendas (invoices)"
            />
            <Divider sx={{ mt: 2 }} />
            <CardContent>
              <Stack spacing={2}>
                <FormControl size="small" sx={{ maxWidth: 320 }}>
                  <InputLabel id="attualize-provedor-label">Provedor NFSe</InputLabel>
                  <Select
                    labelId="attualize-provedor-label"
                    label="Provedor NFSe"
                    value={provedorNFSe}
                    onChange={(event) => setProvedorNFSe(event.target.value)}
                  >
                    <MenuItem value="enotas">eNotas</MenuItem>
                    <MenuItem value="nacional">Emissor Nacional</MenuItem>
                  </Select>
                  <FormHelperText>
                    {provedorNFSe === 'enotas'
                      ? `Emissão via eNotas${config?.idEnotas ? ` (empresa ${config.idEnotas})` : ''} — PDF chega por webhook.`
                      : 'Emissão síncrona no Sefin Nacional — o PDF (DANFSe) é baixado em background após a emissão.'}
                  </FormHelperText>
                </FormControl>

                {provedorNFSe === 'nacional' && (
                  <Alert severity={nacional.ambiente === 'producao' ? 'warning' : 'info'}>
                    {nacional.ambiente === 'producao'
                      ? 'Ambiente de PRODUÇÃO: as próximas emissões de contratos e vendas da Attualize sairão pelo Emissor Nacional com validade fiscal.'
                      : 'Ambiente de homologação: use para validar a emissão antes de virar produção. As notas emitidas em homologação não têm validade fiscal.'}
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Emissor Nacional"
              subheader="Configuração usada quando o provedor é 'Emissor Nacional'"
            />
            <Divider sx={{ mt: 2 }} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="attualize-ambiente-label">Ambiente</InputLabel>
                    <Select
                      labelId="attualize-ambiente-label"
                      label="Ambiente"
                      value={nacional.ambiente}
                      onChange={handleNacionalChange('ambiente')}
                    >
                      <MenuItem value="homologacao">Homologação</MenuItem>
                      <MenuItem value="producao">Produção</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Série DPS"
                    value={nacional.serieDps}
                    onChange={handleNacionalChange('serieDps')}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Próximo nº DPS"
                    value={nacional.proximoNumeroDps}
                    onChange={handleNacionalChange('proximoNumeroDps')}
                    helperText="Numeração automática — ajuste só se houver DPS já emitidas fora do sistema"
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Último NSU (ADN)"
                    value={nacional.ultimoNSU}
                    InputProps={{ readOnly: true }}
                    helperText="Controle interno — somente leitura"
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Código do Município (IBGE)"
                    value={nacional.codigoMunicipio}
                    onChange={handleNacionalChange('codigoMunicipio')}
                    helperText={
                      config?.endereco?.codigoIbgeCidade
                        ? `7 dígitos. Vazio = usa o do endereço da empresa (${config.endereco.codigoIbgeCidade})`
                        : '7 dígitos — obrigatório (endereço da empresa sem código IBGE)'
                    }
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cód. Tributação Nacional (cTribNac) — fallback"
                    value={nacional.codigoTributacaoNacional}
                    onChange={handleNacionalChange('codigoTributacaoNacional')}
                    helperText="6 dígitos — usado quando o serviço não tem código próprio"
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cód. Tributação Municipal (cTribMun) — fallback"
                    value={nacional.codigoTributacaoMunicipal}
                    onChange={handleNacionalChange('codigoTributacaoMunicipal')}
                    helperText="Opcional — usado quando o serviço não tem código próprio"
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="attualize-opsn-label">Optante Simples Nacional</InputLabel>
                    <Select
                      labelId="attualize-opsn-label"
                      label="Optante Simples Nacional"
                      value={nacional.optanteSimplesNacional}
                      onChange={handleNacionalChange('optanteSimplesNacional')}
                    >
                      <MenuItem value={1}>Não optante</MenuItem>
                      <MenuItem value={2}>MEI</MenuItem>
                      <MenuItem value={3}>ME/EPP (Simples Nacional)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {Number(nacional.optanteSimplesNacional) === 3 && (
                  <>
                    <Grid xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id="attualize-regapsn-label">Regime Apuração SN</InputLabel>
                        <Select
                          labelId="attualize-regapsn-label"
                          label="Regime Apuração SN"
                          value={nacional.regimeApuracaoTributosSN}
                          onChange={handleNacionalChange('regimeApuracaoTributosSN')}
                        >
                          <MenuItem value={1}>1 — Regime de apuração padrão SN</MenuItem>
                          <MenuItem value={2}>2 — SN com sublimite excedido (ISSQN fora)</MenuItem>
                          <MenuItem value={3}>3 — SN com retenção/substituição</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Alíquota efetiva SN (%)"
                        value={nacional.percentualTotalTributosSN}
                        onChange={handleNacionalChange('percentualTotalTributosSN')}
                      />
                    </Grid>
                  </>
                )}
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Regime Especial de Tributação"
                    value={nacional.regimeEspecialTributacao}
                    onChange={handleNacionalChange('regimeEspecialTributacao')}
                    helperText="0 = nenhum"
                  />
                </Grid>

                <Grid xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="attualize-cert-label">Certificado Digital (A1)</InputLabel>
                    <Select
                      labelId="attualize-cert-label"
                      label="Certificado Digital (A1)"
                      value={nacional.idCertificado}
                      onChange={handleNacionalChange('idCertificado')}
                    >
                      <MenuItem value="">
                        <em>— selecione —</em>
                      </MenuItem>
                      {certificados.map((cert) => (
                        <MenuItem key={cert._id || cert.id} value={cert._id || cert.id}>
                          {cert.nome}
                          {cert.status !== 'ativo' ? ` (${cert.status})` : ''} — válido até{' '}
                          {formatarDataCertificado(cert.validTo)}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {certificados.length === 0
                        ? 'Nenhum certificado da Attualize encontrado — envie o arquivo A1 abaixo.'
                        : 'Obrigatório para o Emissor Nacional — usado no mTLS e na assinatura da DPS. Somente certificados da Attualize são listados.'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Enviar novo certificado (A1)
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ md: 'center' }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                      sx={{ flexShrink: 0 }}
                    >
                      {certArquivo ? certArquivo.name : 'Selecionar arquivo (.pfx/.p12)'}
                      <input
                        hidden
                        type="file"
                        accept=".pfx,.p12,application/x-pkcs12"
                        onChange={(event) => setCertArquivo(event.target.files?.[0] || null)}
                      />
                    </Button>
                    <TextField
                      label="Senha do certificado"
                      type="password"
                      size="small"
                      value={certSenha}
                      onChange={(event) => setCertSenha(event.target.value)}
                      sx={{ minWidth: 220 }}
                    />
                    <LoadingButton
                      variant="contained"
                      loading={enviandoCert}
                      disabled={!config}
                      onClick={handleEnviarCertificado}
                    >
                      Enviar certificado
                    </LoadingButton>
                  </Stack>
                  <FormHelperText sx={{ mt: 1 }}>
                    O certificado é vinculado ao cadastro da Attualize (CNPJ da empresa). Se ainda
                    não houver certificado configurado no Emissor Nacional, o novo é selecionado
                    automaticamente.
                  </FormHelperText>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="flex-end">
            <LoadingButton
              variant="contained"
              loading={salvando}
              disabled={!config}
              onClick={handleSalvar}
            >
              Salvar configuração
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </DashboardContent>
  );
}
