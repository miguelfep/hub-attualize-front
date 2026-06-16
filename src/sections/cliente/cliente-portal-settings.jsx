'use client';

import dayjs from 'dayjs';
import { useWatch, Controller } from 'react-hook-form';
import { useRef, useMemo, useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Table,
  Paper,
  Switch,
  Button,
  Select,
  Dialog,
  Divider,
  Tooltip,
  MenuItem,
  TableRow,
  TextField,
  TableHead,
  TableBody,
  TableCell,
  CardHeader,
  Typography,
  InputLabel,
  IconButton,
  CardContent,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  InputAdornment,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { buscarCep } from 'src/actions/cep';
import { useGetSettings, updateSettings } from 'src/actions/settings';
import {
  getNfeStatus,
  configurarNfe,
  getNfePrStatus,
  getNfcePrStatus,
  configurarNfcePr,
  configurarEnotas,
  getNacionalStatus,
  configurarNacional,
  sincronizarDfeNacional,
  sincronizarPeriodoNacional,
  reprocessarRetencoesNacional,
} from 'src/actions/notafiscal';
import {
  uploadCertificado,
  deletarCertificado,
  getCertificadoAtivo,
  downloadCertificado,
  getSenhaCertificado,
  desativarCertificado,
  getCertificadosCliente,
  formatarDataCertificado,
  getCorStatusCertificado,
  validarSenhaCertificado,
  validarArquivoCertificado,
  getIconeStatusCertificado,
} from 'src/actions/certificados';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export const ClientePortalSettings = forwardRef(({ clienteId, control }, ref) => {
  const { settings, settingsLoading, refetchSettings } = useGetSettings(clienteId);

  const [saving, setSaving] = useState(false);

  const funcionalidades = useMemo(
    () => ({
      emissaoNFSe: Boolean(settings?.funcionalidades?.emissaoNFSe),
      cadastroClientes: Boolean(settings?.funcionalidades?.cadastroClientes),
      cadastroServicos: Boolean(settings?.funcionalidades?.cadastroServicos),
      vendas: Boolean(settings?.funcionalidades?.vendas),
      cobrancaInterPortal: Boolean(settings?.funcionalidades?.cobrancaInterPortal),
      agendamentos: Boolean(settings?.funcionalidades?.agendamentos),
    }),
    [settings]
  );

  const configuracoes = useMemo(
    () => ({
      limiteClientes: settings?.configuracoes?.limiteClientes ?? '',
      limiteServicos: settings?.configuracoes?.limiteServicos ?? '',
      limiteOrcamentos: settings?.configuracoes?.limiteOrcamentos ?? '',
    }),
    [settings]
  );

  const eNotas = useMemo(
    () => ({
      empresaId: settings?.eNotasConfig?.empresaId ?? '',
      ambiente: settings?.eNotasConfig?.ambiente ?? 'homologacao',
      status: settings?.eNotasConfig?.status ?? 'inativa',
      emiteNFSeNacional: Boolean(settings?.eNotasConfig?.emiteNFSeNacional),
      emiteNotaRetroativa: Boolean(settings?.eNotasConfig?.emiteNotaRetroativa),
      configuracaoNFSe: {
        codigoMunicipio: settings?.eNotasConfig?.configuracaoNFSe?.codigoMunicipio ?? '',
        codigoServico: settings?.eNotasConfig?.configuracaoNFSe?.codigoServico ?? '',
        aliquotaIss: settings?.eNotasConfig?.configuracaoNFSe?.aliquotaIss ?? '',
        discriminacao: settings?.eNotasConfig?.configuracaoNFSe?.discriminacao ?? '',
      },
      configuracaoEmpresa: {
        logo: settings?.eNotasConfig?.configuracaoEmpresa?.logo ?? '',
        // Backends podem enviar com ou sem o 't' (cerfificadoVinculado)
        certificadoVinculado:
          (settings?.eNotasConfig?.configuracaoEmpresa?.certificadoVinculado ??
            settings?.eNotasConfig?.configuracaoEmpresa?.cerfificadoVinculado) ?? false,
        idCertificado: settings?.eNotasConfig?.configuracaoEmpresa?.idCertificado ?? '',
      },
    }),
    [settings]
  );

  const provedorNFSe = settings?.provedorNFSe ?? 'enotas';

  const nfseNacional = useMemo(
    () => ({
      // Download/importação das NFS-e do ADN — independente da emissão
      buscaHabilitada: Boolean(settings?.nfseNacionalConfig?.buscaHabilitada),
      ambiente: settings?.nfseNacionalConfig?.ambiente ?? 'homologacao',
      serieDps: settings?.nfseNacionalConfig?.serieDps ?? '1',
      proximoNumeroDps: settings?.nfseNacionalConfig?.proximoNumeroDps ?? 1,
      codigoMunicipio: settings?.nfseNacionalConfig?.codigoMunicipio ?? '',
      codigoTributacaoNacional: settings?.nfseNacionalConfig?.codigoTributacaoNacional ?? '',
      codigoTributacaoMunicipal: settings?.nfseNacionalConfig?.codigoTributacaoMunicipal ?? '',
      regimeEspecialTributacao: settings?.nfseNacionalConfig?.regimeEspecialTributacao ?? 0,
      optanteSimplesNacional: settings?.nfseNacionalConfig?.optanteSimplesNacional ?? 1,
      regimeApuracaoTributosSN: settings?.nfseNacionalConfig?.regimeApuracaoTributosSN ?? '',
      percentualTotalTributosSN: settings?.nfseNacionalConfig?.percentualTotalTributosSN ?? '',
      ultimoNSU: settings?.nfseNacionalConfig?.ultimoNSU ?? 0,
      idCertificado: settings?.nfseNacionalConfig?.idCertificado ?? '',
    }),
    [settings]
  );

  // NF-e (modelo 55) — busca/importação via SEFAZ. Escopo atual: apenas busca.
  const nfe = useMemo(
    () => ({
      buscaHabilitada: Boolean(settings?.nfeConfig?.buscaHabilitada),
      ambiente: settings?.nfeConfig?.ambiente ?? 'producao',
      manifestacaoAutomatica: settings?.nfeConfig?.manifestacaoAutomatica ?? true,
      idCertificado: settings?.nfeConfig?.idCertificado ?? '',
      // Somente leitura — controle incremental mantido pelo backend
      ultimoNSUDistribuicao: settings?.nfeConfig?.ultimoNSUDistribuicao ?? 0,
      maxNSUDistribuicao: settings?.nfeConfig?.maxNSUDistribuicao ?? 0,
      ultimaSincronizacao: settings?.nfeConfig?.ultimaSincronizacao ?? null,
      bloqueadoAte: settings?.nfeConfig?.bloqueadoAte ?? null,
    }),
    [settings]
  );

  const nfcePr = useMemo(
    () => ({
      habilitado: Boolean(settings?.nfcePrConfig?.habilitado),
      ambiente: settings?.nfcePrConfig?.ambiente ?? 'homologacao',
      cscId: settings?.nfcePrConfig?.cscId ?? '',
      cscToken: settings?.nfcePrConfig?.cscToken ?? '',
      serie: settings?.nfcePrConfig?.serie ?? '001',
      proximoNumero: settings?.nfcePrConfig?.proximoNumero ?? 1,
      codigoMunicipio: settings?.nfcePrConfig?.codigoMunicipio ?? '',
      idCertificado: settings?.nfcePrConfig?.idCertificado ?? '',
    }),
    [settings]
  );

  const [localState, setLocalState] = useState({
    funcionalidades,
    configuracoes,
    eNotas,
    provedorNFSe,
    nfseNacional,
    nfe,
    nfcePr,
  });

  // Snapshot do que está salvo no backend — usado para detectar alterações pendentes
  const savedSnapshotRef = useRef(null);

  useEffect(() => {
    if (settings) {
      const snapshot = { funcionalidades, configuracoes, eNotas, provedorNFSe, nfseNacional, nfe, nfcePr };
      savedSnapshotRef.current = JSON.stringify(snapshot);
      setLocalState(snapshot);
    }
  }, [settings, funcionalidades, configuracoes, eNotas, provedorNFSe, nfseNacional, nfe, nfcePr]);

  const handleToggle = (key) => (event) => {
    setLocalState((prev) => {
      const newState = {
        ...prev,
        funcionalidades: { ...prev.funcionalidades, [key]: event.target.checked },
      };
      
      // Se desmarcar emissaoNFSe, também desmarcar emiteNFSeNacional em eNotas
      if (key === 'emissaoNFSe' && !event.target.checked) {
        newState.eNotas = {
          ...prev.eNotas,
          emiteNFSeNacional: false,
        };
      }
      
      return newState;
    });
  };

  const handleEnotasToggle = (key) => (event) => {
    const { checked } = event.target;
    setLocalState((prev) => {
      const newState = {
        ...prev,
        eNotas: { ...prev.eNotas, [key]: checked },
      };

      // Emite NFSe Nacional define o provedor automaticamente
      if (key === 'emiteNFSeNacional') {
        newState.provedorNFSe = checked ? 'nacional' : 'enotas';
      }

      return newState;
    });
  };

  const handleConfigChange = (key) => (event) => {
    const {value} = event.target;
    setLocalState((prev) => ({
      ...prev,
      configuracoes: { ...prev.configuracoes, [key]: value === '' ? '' : Number(value) },
    }));
  };

  const handleEnotasRootChange = (key) => (event) => {
    const { value } = event.target;
    setLocalState((prev) => ({
      ...prev,
      eNotas: { ...prev.eNotas, [key]: value },
    }));
  };

  const handleEnotasNFSeChange = (key) => (event) => {
    const value = key === 'aliquotaIss' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value;
    setLocalState((prev) => ({
      ...prev,
      eNotas: {
        ...prev.eNotas,
        configuracaoNFSe: { ...prev.eNotas.configuracaoNFSe, [key]: value },
      },
    }));
  };

  const handleProvedorChange = (event) => {
    const { value } = event.target;
    setLocalState((prev) => {
      const idCertificado =
        value === 'nacional' && !prev.nfseNacional.idCertificado && certificadoAtivo
          ? certificadoAtivo._id || certificadoAtivo.id || ''
          : prev.nfseNacional.idCertificado;
      return {
        ...prev,
        provedorNFSe: value,
        nfseNacional: { ...prev.nfseNacional, idCertificado },
      };
    });
  };

  const NACIONAL_NUMERIC_FIELDS = [
    'proximoNumeroDps',
    'regimeEspecialTributacao',
    'optanteSimplesNacional',
    'regimeApuracaoTributosSN',
    'percentualTotalTributosSN',
  ];

  const handleNacionalChange = (key) => (event) => {
    const raw = event.target.value;
    const value = NACIONAL_NUMERIC_FIELDS.includes(key) && raw !== '' ? Number(raw) : raw;
    setLocalState((prev) => ({
      ...prev,
      nfseNacional: { ...prev.nfseNacional, [key]: value },
    }));
  };

  const handleNfeToggle = (key) => (event) => {
    const { checked } = event.target;
    setLocalState((prev) => ({
      ...prev,
      nfe: { ...prev.nfe, [key]: checked },
    }));
  };

  const handleNfeChange = (key) => (event) => {
    const { value } = event.target;
    setLocalState((prev) => ({
      ...prev,
      nfe: { ...prev.nfe, [key]: value },
    }));
  };

  // --------------------------------------------------------------
  // Código IBGE do município — busca pelo CEP cadastrado no cliente
  // --------------------------------------------------------------
  const enderecoCliente = useWatch({ control, name: 'endereco' });
  const cepCliente = (enderecoCliente?.[0]?.cep || '').toString().replace(/\D/g, '');

  const [buscandoIbge, setBuscandoIbge] = useState(false);

  const handleBuscarIbge = useCallback(
    async ({ silencioso = false } = {}) => {
      if (cepCliente.length !== 8) {
        if (!silencioso) {
          toast.error('Cadastre o CEP do cliente na aba "Dados da Empresa" para buscar o código IBGE');
        }
        return;
      }
      try {
        setBuscandoIbge(true);
        const data = await buscarCep(cepCliente);
        const codigoIbge = (data?.ibge || '').toString();
        if (!codigoIbge) throw new Error('CEP sem código IBGE');
        // Busca manual sobrescreve; preenchimento automático só completa campos vazios
        setLocalState((prev) => ({
          ...prev,
          nfseNacional: {
            ...prev.nfseNacional,
            codigoMunicipio: silencioso
              ? prev.nfseNacional.codigoMunicipio || codigoIbge
              : codigoIbge,
          },
          eNotas: {
            ...prev.eNotas,
            configuracaoNFSe: {
              ...prev.eNotas.configuracaoNFSe,
              codigoMunicipio: silencioso
                ? prev.eNotas.configuracaoNFSe.codigoMunicipio || codigoIbge
                : codigoIbge,
            },
          },
          nfcePr: {
            ...prev.nfcePr,
            codigoMunicipio: silencioso
              ? prev.nfcePr.codigoMunicipio || codigoIbge
              : codigoIbge,
          },
        }));
        if (!silencioso) {
          toast.success(`Código IBGE ${codigoIbge} (${data.cidade} - ${data.estado}) preenchido`);
        }
      } catch (error) {
        if (!silencioso) {
          toast.error('Não foi possível obter o código IBGE pelo CEP do cliente');
        }
      } finally {
        setBuscandoIbge(false);
      }
    },
    [cepCliente]
  );

  // Preenche automaticamente o código IBGE (uma única vez) quando ainda não há valor salvo
  const autoIbgeRef = useRef(false);
  useEffect(() => {
    if (autoIbgeRef.current || !settings || cepCliente.length !== 8) return;
    autoIbgeRef.current = true;
    if (!settings?.nfseNacionalConfig?.codigoMunicipio) {
      handleBuscarIbge({ silencioso: true });
    }
  }, [settings, cepCliente, handleBuscarIbge]);

  // Checklist de status do Emissor Nacional (GET /nota-fiscal/:clienteId/nacional/status)
  const [nacionalStatus, setNacionalStatus] = useState(null);
  const [checkingNacional, setCheckingNacional] = useState(false);

  // Campos obrigatórios do Emissor Nacional — habilitam o botão "Verificar configuração"
  const nacionalCamposObrigatoriosOk = /^\d{7}$/.test(
    (localState.nfseNacional.codigoMunicipio || '').toString().trim()
  );

  const handleVerificarNacional = async () => {
    try {
      setCheckingNacional(true);
      const res = await getNacionalStatus(clienteId, { testarConexao: true });
      setNacionalStatus(res.data);
      if (res.data?.prontoParaEmitir) {
        toast.success('Configuração do Emissor Nacional pronta para emitir!');
      } else {
        toast.warning('Há pendências na configuração do Emissor Nacional');
      }
    } catch (error) {
      toast.error(error?.message || 'Falha ao verificar configuração do Emissor Nacional');
    } finally {
      setCheckingNacional(false);
    }
  };

  // --------------------------------------------------------------
  // Download / importação de NFS-e do Emissor Nacional (ADN)
  // Reaproveita os mesmos endpoints da tela Fiscal; disponível quando o
  // cliente usa o Emissor Nacional como provedor.
  // --------------------------------------------------------------
  const [syncingNacional, setSyncingNacional] = useState(false);
  const [reprocessandoRetencoes, setReprocessandoRetencoes] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importModo, setImportModo] = useState('mes'); // 'mes' | 'intervalo'
  const [importAno, setImportAno] = useState(() => dayjs().year());
  const [importMesInicio, setImportMesInicio] = useState(() => dayjs().month() + 1);
  const [importMesFim, setImportMesFim] = useState(() => dayjs().month() + 1);
  const [importResultado, setImportResultado] = useState(null);

  const handleSincronizarDfe = async () => {
    if (!clienteId || syncingNacional) return;
    try {
      setSyncingNacional(true);
      const res = await sincronizarDfeNacional(clienteId);
      toast.success(res.data?.message || 'Sincronização concluída');
    } catch (error) {
      toast.error(error?.message || 'Erro ao sincronizar notas do Emissor Nacional');
    } finally {
      setSyncingNacional(false);
    }
  };

  const handleReprocessarRetencoes = async () => {
    if (!clienteId || reprocessandoRetencoes) return;
    try {
      setReprocessandoRetencoes(true);
      const res = await reprocessarRetencoesNacional(clienteId);
      toast.success(res.data?.message || 'Retenções reprocessadas');
    } catch (error) {
      toast.error(error?.message || 'Erro ao reprocessar retenções');
    } finally {
      setReprocessandoRetencoes(false);
    }
  };

  const handleOpenImportDialog = () => {
    setImportResultado(null);
    setImportModo('mes');
    setImportAno(dayjs().year());
    setImportMesInicio(dayjs().month() + 1);
    setImportMesFim(dayjs().month() + 1);
    setImportDialogOpen(true);
  };

  const handleImportarPeriodo = async () => {
    if (!clienteId) return;
    if (importModo === 'intervalo' && importMesFim < importMesInicio) {
      toast.error('O mês final deve ser maior ou igual ao mês inicial');
      return;
    }
    try {
      setImporting(true);
      setImportResultado(null);
      const body =
        importModo === 'mes'
          ? { competencia: `${importAno}-${String(importMesInicio).padStart(2, '0')}` }
          : { ano: Number(importAno), mesInicio: Number(importMesInicio), mesFim: Number(importMesFim) };
      const res = await sincronizarPeriodoNacional(clienteId, body);
      setImportResultado(res.data);
      toast.success(res.data?.message || 'Importação concluída');
    } catch (error) {
      toast.error(error?.message || 'Erro ao importar notas do período');
    } finally {
      setImporting(false);
    }
  };

  const handleNacionalBuscaToggle = (event) => {
    const { checked } = event.target;
    setLocalState((prev) => {
      const idCertificado =
        checked && !prev.nfseNacional.idCertificado && certificadoAtivo
          ? certificadoAtivo._id || certificadoAtivo.id || ''
          : prev.nfseNacional.idCertificado;
      return {
        ...prev,
        nfseNacional: { ...prev.nfseNacional, buscaHabilitada: checked, idCertificado },
      };
    });
  };

  const NFCE_NUMERIC_FIELDS = ['proximoNumero'];

  const handleNfcePrToggle = (key) => (event) => {
    setLocalState((prev) => ({
      ...prev,
      nfcePr: { ...prev.nfcePr, [key]: event.target.checked },
    }));
  };

  const handleNfcePrChange = (key) => (event) => {
    const raw = event.target.value;
    const value = NFCE_NUMERIC_FIELDS.includes(key) && raw !== '' ? Number(raw) : raw;
    setLocalState((prev) => ({
      ...prev,
      nfcePr: { ...prev.nfcePr, [key]: value },
    }));
  };

  // Testa a conexão com o Emissor Nacional (cert ativo + mTLS) p/ o contexto de download.
  const [nacionalDownloadStatus, setNacionalDownloadStatus] = useState(null);
  const [checkingNacionalDownload, setCheckingNacionalDownload] = useState(false);

  const handleTestarConexaoNacional = async () => {
    try {
      setCheckingNacionalDownload(true);
      const res = await getNacionalStatus(clienteId, { testarConexao: true });
      const data = res.data || {};
      setNacionalDownloadStatus(data);
      const cert = data?.certificado;
      const mtls = data?.conexao?.mtlsOk;
      if (!cert || cert.expirado) {
        toast.warning('Certificado digital A1 ausente ou expirado');
      } else if (mtls) {
        toast.success('Conexão com o Emissor Nacional OK');
      } else {
        toast.warning(data?.conexao?.erro || 'Falha na conexão com o Emissor Nacional');
      }
    } catch (error) {
      toast.error(error?.message || 'Falha ao testar conexão com o Emissor Nacional');
    } finally {
      setCheckingNacionalDownload(false);
    }
  };

  // Checklist de status da busca de NF-e na SEFAZ (GET /nota-fiscal/:clienteId/nfe/status)
  // "Verificar" só checa pré-requisitos; "Testar conexão" faz chamada real à SEFAZ
  // (sujeita a cooldown de 15 min — só ao clique explícito, nunca no load).
  const [registrandoEnotas, setRegistrandoEnotas] = useState(false);

  const handleRegistrarNoEnotas = async () => {
    try {
      setRegistrandoEnotas(true);
      const nfseCfg = localState.eNotas.configuracaoNFSe || {};
      const res = await configurarEnotas(clienteId, {
        ambiente: localState.eNotas.ambiente || 'homologacao',
        configuracaoNFSe: {
          aliquotaIss: nfseCfg.aliquotaIss !== '' && nfseCfg.aliquotaIss != null ? Number(nfseCfg.aliquotaIss) : undefined,
          codigoMunicipio: nfseCfg.codigoMunicipio || undefined,
          codigoServico: nfseCfg.codigoServico || undefined,
          discriminacao: nfseCfg.discriminacao || undefined,
        },
      });
      const empresaIdRetornado = res?.data?.data?.empresaId || res?.data?.empresaId;
      if (empresaIdRetornado) {
        setLocalState((prev) => ({
          ...prev,
          eNotas: { ...prev.eNotas, empresaId: empresaIdRetornado },
        }));
      }
      toast.success('Empresa registrada no eNotas com sucesso');
    } catch (error) {
      toast.error(error?.message || 'Falha ao registrar empresa no eNotas');
    } finally {
      setRegistrandoEnotas(false);
    }
  };

  const [nfeStatus, setNfeStatus] = useState(null);
  const [checkingNfe, setCheckingNfe] = useState(false);
  const [testandoConexaoNfe, setTestandoConexaoNfe] = useState(false);

  // NF-e PR (SEFAZ-PR — consulta direta por chave). Usa cert/ambiente do nfeConfig.
  const [nfePrStatus, setNfePrStatus] = useState(null);
  const [checkingNfePr, setCheckingNfePr] = useState(false);

  const handleStatusNfePr = async ({ testarSefaz }) => {
    try {
      setCheckingNfePr(true);
      const res = await getNfePrStatus(clienteId, { testarSefaz });
      const data = res.data || {};
      setNfePrStatus(data);
      if (data.pronto) toast.success('Serviço SEFAZ-PR para NF-e OK');
      else toast.warning('Há pendências na configuração do serviço SEFAZ-PR');
    } catch (error) {
      toast.error(error?.message || 'Falha ao consultar status do serviço SEFAZ-PR');
    } finally {
      setCheckingNfePr(false);
    }
  };

  // NFC-e PR (SEFAZ-PR — emissão direta)
  const [nfcePrStatus, setNfcePrStatus] = useState(null);
  const [checkingNfcePr, setCheckingNfcePr] = useState(false);
  const [testandoSefazNfcePr, setTestandoSefazNfcePr] = useState(false);

  const handleStatusNfcePr = async ({ testarSefaz }) => {
    const setLoading = testarSefaz ? setTestandoSefazNfcePr : setCheckingNfcePr;
    try {
      setLoading(true);
      const res = await getNfcePrStatus(clienteId, { testarSefaz });
      const data = res.data || {};
      setNfcePrStatus(data);
      if (data.pronto) toast.success('Configuração de NFC-e pronta!');
      else toast.warning('Há pendências na configuração de NFC-e');
    } catch (error) {
      toast.error(error?.message || 'Falha ao consultar status do NFC-e');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusNfe = async ({ testarConexao }) => {
    const setLoading = testarConexao ? setTestandoConexaoNfe : setCheckingNfe;
    try {
      setLoading(true);
      const res = await getNfeStatus(clienteId, { testarConexao });
      const data = res.data || {};
      setNfeStatus(data);

      if (!testarConexao) {
        if (data.pronto) toast.success('Configuração de busca de NF-e pronta!');
        else toast.warning('Há pendências na configuração de busca de NF-e na SEFAZ');
        return;
      }

      // Teste de conexão real — interpreta o cStat retornado pela SEFAZ
      const cStat = data?.conexao?.cStat;
      if (cStat === '656' || data?.bloqueadoAte) {
        const ate = data?.bloqueadoAte
          ? new Date(data.bloqueadoAte).toLocaleString('pt-BR')
          : null;
        toast.warning(
          ate
            ? `SEFAZ bloqueou as consultas deste CNPJ. Liberação após ${ate}.`
            : data?.conexao?.xMotivo || 'SEFAZ bloqueou temporariamente as consultas.',
          { duration: 8000 }
        );
      } else if (cStat === 'cached') {
        toast.info('Conexão OK (verificada recentemente)');
      } else if (data?.conexao?.mtlsOk) {
        toast.success(data?.conexao?.xMotivo || 'Conexão com a SEFAZ OK');
      } else {
        toast.warning(data?.conexao?.erro || data?.conexao?.xMotivo || 'Falha na conexão com a SEFAZ');
      }
    } catch (error) {
      toast.error(error?.message || 'Falha ao consultar o status de busca de NF-e');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const numOrUndefined = (v) => (v === '' || v === null || typeof v === 'undefined' ? undefined : Number(v));

      // --- Portal settings (funcionalidades, limites, provedor, eNotas) ---
      const nfseCfg = localState?.eNotas?.configuracaoNFSe || {};
      const empCfg = localState?.eNotas?.configuracaoEmpresa || {};
      const eNotasPayload = {
        empresaId: localState?.eNotas?.empresaId ?? '',
        ambiente: localState?.eNotas?.ambiente ?? 'homologacao',
        status: localState?.eNotas?.status ?? 'inativa',
        emiteNFSeNacional: Boolean(localState?.eNotas?.emiteNFSeNacional),
        emiteNotaRetroativa: Boolean(localState?.eNotas?.emiteNotaRetroativa),
        configuracaoNFSe: {
          codigoMunicipio: nfseCfg?.codigoMunicipio ?? '',
          codigoServico: nfseCfg?.codigoServico ?? '',
          aliquotaIss:
            nfseCfg?.aliquotaIss === '' || nfseCfg?.aliquotaIss === null || typeof nfseCfg?.aliquotaIss === 'undefined'
              ? null
              : Number(nfseCfg?.aliquotaIss),
          discriminacao: nfseCfg?.discriminacao ?? '',
        },
        configuracaoEmpresa: {
          logo: empCfg?.logo ?? '',
          certificadoVinculado: Boolean(
            (empCfg?.certificadoVinculado ?? empCfg?.cerfificadoVinculado) ?? false
          ),
          idCertificado: empCfg?.idCertificado ?? '',
        },
      };

      // --- Emissor Nacional (PUT /nota-fiscal/:id/nacional/configurar) ---
      // Salvar ANTES de updateSettings para que o codigoTributacaoNacional já esteja no banco
      // quando updateSettings ativar provedorNFSe='nacional' e o backend validar as pendências.
      const nac = localState?.nfseNacional || {};
      await configurarNacional(clienteId, {
        provedorNFSe: localState.provedorNFSe || 'enotas',
        buscaHabilitada: Boolean(nac.buscaHabilitada),
        idCertificado: nac.idCertificado || undefined,
        ambiente: nac.ambiente || 'homologacao',
        serieDps: nac.serieDps || '1',
        proximoNumeroDps: numOrUndefined(nac.proximoNumeroDps) ?? 1,
        codigoMunicipio: nac.codigoMunicipio || undefined,
        codigoTributacaoNacional: nac.codigoTributacaoNacional || undefined,
        codigoTributacaoMunicipal: nac.codigoTributacaoMunicipal || undefined,
        regimeEspecialTributacao: numOrUndefined(nac.regimeEspecialTributacao) ?? 0,
        optanteSimplesNacional: numOrUndefined(nac.optanteSimplesNacional),
        regimeApuracaoTributosSN: numOrUndefined(nac.regimeApuracaoTributosSN),
        percentualTotalTributosSN: numOrUndefined(nac.percentualTotalTributosSN),
      });

      await updateSettings(clienteId, {
        funcionalidades: { ...localState.funcionalidades },
        configuracoes: { ...localState.configuracoes },
        provedorNFSe: localState.provedorNFSe || 'enotas',
        eNotasConfig: eNotasPayload,
      });

      // --- NF-e SEFAZ (PUT /nota-fiscal/:id/nfe/configurar) ---
      const nfeCfg = localState?.nfe || {};
      await configurarNfe(clienteId, {
        buscaHabilitada: Boolean(nfeCfg.buscaHabilitada),
        ambiente: nfeCfg.ambiente || 'producao',
        manifestacaoAutomatica: Boolean(nfeCfg.manifestacaoAutomatica),
        idCertificado: nfeCfg.idCertificado || undefined,
      });

      // --- NFC-e PR (PUT /nota-fiscal/:id/nfce-pr/configurar) ---
      const nfcePrCfg = localState?.nfcePr || {};
      await configurarNfcePr(clienteId, {
        habilitado: Boolean(nfcePrCfg.habilitado),
        ambiente: nfcePrCfg.ambiente || 'homologacao',
        cscId: nfcePrCfg.cscId || undefined,
        cscToken: nfcePrCfg.cscToken || undefined,
        serie: nfcePrCfg.serie || '001',
        proximoNumero: numOrUndefined(nfcePrCfg.proximoNumero),
        codigoMunicipio: nfcePrCfg.codigoMunicipio || undefined,
        idCertificado: nfcePrCfg.idCertificado || undefined,
      });

      toast.success('Configurações atualizadas com sucesso');
      await refetchSettings();
    } catch (error) {
      // Backend retorna 400 com a lista de pendências ao tentar ativar o Emissor Nacional
      toast.error(error?.message || 'Falha ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Permite ao formulário principal salvar as configurações junto com o cliente
  useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      isDirty: () =>
        savedSnapshotRef.current !== null && JSON.stringify(localState) !== savedSnapshotRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localState, clienteId]
  );

  // --------------------------------------------------------------
  // Certificados Digitais (reutiliza ações existentes)
  // --------------------------------------------------------------
  const [certificados, setCertificados] = useState([]);
  const [certificadoAtivo, setCertificadoAtivo] = useState(null);
  const [loadingCertificados, setLoadingCertificados] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [certificatePasswordConfirm, setCertificatePasswordConfirm] = useState('');
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Exibição da senha do certificado
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordTimerId, setPasswordTimerId] = useState(null);
  const [passwordCertId, setPasswordCertId] = useState(null);
  const [certificadoToDelete, setCertificadoToDelete] = useState(null);
  const [deletingCertificado, setDeletingCertificado] = useState(false);

  const fetchCertificados = useCallback(async () => {
    if (!clienteId) return;
    try {
      setLoadingCertificados(true);
      const [certificadosResponse, ativoResponse] = await Promise.all([
        getCertificadosCliente(clienteId),
        getCertificadoAtivo(clienteId),
      ]);
      if (certificadosResponse.data.success) {
        setCertificados(certificadosResponse.data.data || []);
      } else {
        setCertificados([]);
      }
      if (ativoResponse.data.success && ativoResponse.data.data) {
        setCertificadoAtivo(ativoResponse.data.data);
      } else {
        setCertificadoAtivo(null);
      }
    } catch (error) {
      // Estado sem certificados é normal; mostrar toast apenas para erros inesperados
      if (!error?.response?.data?.message?.includes('Nenhum certificado ativo')) {
        toast.error('Erro ao carregar certificados');
      }
      setCertificados([]);
      setCertificadoAtivo(null);
    } finally {
      setLoadingCertificados(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchCertificados();
  }, [fetchCertificados]);

  // Quando os certificados carregam e Nacional está ativo (emissão ou download) sem certificado
  // definido, pre-seleciona o certificado ativo para que o usuário não precise selecionar manualmente.
  useEffect(() => {
    if (!certificadoAtivo) return;
    setLocalState((prev) => {
      const nacAtivo = prev.nfseNacional.buscaHabilitada || prev.provedorNFSe === 'nacional';
      if (nacAtivo && !prev.nfseNacional.idCertificado) {
        return {
          ...prev,
          nfseNacional: {
            ...prev.nfseNacional,
            idCertificado: certificadoAtivo._id || certificadoAtivo.id || '',
          },
        };
      }
      return prev;
    });
  }, [certificadoAtivo]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validarArquivoCertificado(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setCertificateFile(file);
    setCertificateDialogOpen(true);
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile) return;
    const pwdValidation = validarSenhaCertificado(certificatePassword);
    if (!pwdValidation.isValid) {
      toast.error(pwdValidation.error);
      return;
    }
    if (certificatePassword.trim() !== certificatePasswordConfirm.trim()) {
      toast.error('Senhas não coincidem');
      return;
    }
    try {
      setUploadingCertificate(true);
      const response = await uploadCertificado(
        certificateFile,
        certificatePassword.trim(),
        clienteId
      );
      const resData = response.data;
      if (resData.success) {
        toast.success(resData.message || 'Certificado digital enviado com sucesso!');
        setCertificateDialogOpen(false);
        setCertificateFile(null);
        setCertificatePassword('');
        setCertificatePasswordConfirm('');
        await fetchCertificados();
        if (resData.data?.enotasEnviado === false && resData.data?.enotasErro) {
          toast.warning(
            `Certificado salvo, mas não foi possível vincular ao eNotas: ${resData.data.enotasErro}`,
            { duration: 6000 }
          );
        }
      } else {
        const msg = resData.message || 'Erro ao enviar certificado';
        if (msg.toLowerCase().includes('senha') && (msg.includes('incorreta') || msg.includes('inválida'))) {
          toast.error('Senha incorreta. Verifique a senha do certificado.');
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || 'Erro ao enviar certificado digital';
      if (status === 401) toast.error('Sessão expirada. Faça login novamente.');
      else if (status === 403) toast.error('Sem permissão para enviar certificado.');
      else if (status === 404) toast.error(msg || 'Cliente não encontrado.');
      else if (msg.toLowerCase().includes('senha') && (msg.includes('incorreta') || msg.includes('inválida'))) {
        toast.error('Senha incorreta. Verifique a senha do certificado.');
      } else toast.error(msg);
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleDesativarCertificado = async (certificadoId) => {
    try {
      const response = await desativarCertificado(certificadoId);
      if (response.data.success) {
        toast.success('Certificado desativado com sucesso!');
        await fetchCertificados();
      } else {
        toast.error(response.data.message || 'Erro ao desativar certificado');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao desativar certificado';
      toast.error(errorMessage);
    }
  };

  const handleDeletarCertificado = async (certificadoId) => {
    try {
      setDeletingCertificado(true);
      const response = await deletarCertificado(certificadoId);
      if (response.data?.success !== false) {
        toast.success('Certificado excluído permanentemente.');
        setCertificadoToDelete(null);
        await fetchCertificados();
      } else {
        toast.error(response.data?.message || 'Erro ao excluir certificado');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir certificado');
    } finally {
      setDeletingCertificado(false);
    }
  };

  const handleDownloadCertificado = async (certificadoId, fileName) => {
    try {
      const response = await downloadCertificado(certificadoId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'certificado.pfx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer download do certificado');
    }
  };

  const handleVerSenhaCertificado = async (certificadoId) => {
    try {
      setPasswordCertId(certificadoId);
      setPasswordValue('');
      setPasswordVisible(false);
      setShowPasswordDialog(true);
      setPasswordLoading(true);
      const res = await getSenhaCertificado(certificadoId);
      const value = res?.data?.password || res?.data?.senha || '';
      if (!value) {
        toast.error('Senha não disponível. Tente novamente.');
        setShowPasswordDialog(false);
        return;
      }
      setPasswordValue(String(value));
      setPasswordVisible(true);
      if (passwordTimerId) clearTimeout(passwordTimerId);
      const id = setTimeout(() => {
        setPasswordVisible(false);
      }, 30000);
      setPasswordTimerId(id);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao obter senha';
      toast.error(msg);
      setShowPasswordDialog(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Removido fluxo de confirmação por senha do usuário; agora busca direto com token

  return (
    <Stack spacing={3}>

      {/* ── Funcionalidades ── */}
      <Card>
        <CardHeader
          title="Funcionalidades do Portal"
          titleTypographyProps={{ variant: 'h6' }}
          subheader="Ative as funcionalidades disponíveis neste portal"
          sx={{ pb: 0 }}
          action={saving ? <Typography variant="caption" color="text.secondary" sx={{ mr: 1, mt: 1.5, display: 'block' }}>Salvando...</Typography> : undefined}
        />
        <Divider sx={{ mt: 2 }} />
        <CardContent>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.cadastroClientes} onChange={handleToggle('cadastroClientes')} />}
            label="Cadastro de Clientes"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.cadastroServicos} onChange={handleToggle('cadastroServicos')} />}
            label="Cadastro de Serviços"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.vendas} onChange={handleToggle('vendas')} />}
            label="Vendas / Orçamentos"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.cobrancaInterPortal} onChange={handleToggle('cobrancaInterPortal')} />}
            label="Cobrança Inter no Portal"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.agendamentos} onChange={handleToggle('agendamentos')} />}
            label="Agendamentos"
          />
          <FormControlLabel
            control={<Switch checked={localState.funcionalidades.emissaoNFSe} onChange={handleToggle('emissaoNFSe')} />}
            label="Emissão de NFSe"
          />
          {localState.funcionalidades.emissaoNFSe && (
            <>
              <FormControlLabel
                control={
                  <Switch 
                    checked={localState.eNotas.emiteNFSeNacional || false} 
                    onChange={handleEnotasToggle('emiteNFSeNacional')} 
                  />
                }
                label="Emite NFSe Nacional"
                sx={{ 
                  ml: 4,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={localState.eNotas.emiteNotaRetroativa || false} 
                    onChange={handleEnotasToggle('emiteNotaRetroativa')} 
                  />
                }
                label="Emite Nota Retroativa"
                sx={{ 
                  ml: 4,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  }
                }}
              />
            </>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Limites</Typography>
          <TextField
            fullWidth
            type="number"
            label="Limite de Clientes"
            value={localState.configuracoes.limiteClientes}
            onChange={handleConfigChange('limiteClientes')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Limite de Serviços"
            value={localState.configuracoes.limiteServicos}
            onChange={handleConfigChange('limiteServicos')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Limite de Orçamentos"
            value={localState.configuracoes.limiteOrcamentos}
            onChange={handleConfigChange('limiteOrcamentos')}
          />
        </Grid>
      </Grid>

        </CardContent>
      </Card>

      {/* ── Emissão NFSe (só aparece quando habilitado nas funcionalidades) ── */}
      {localState.funcionalidades.emissaoNFSe && (
        <Card>
          <CardHeader
            title={localState.provedorNFSe === 'nacional' ? 'Emissor Nacional (NFSe)' : 'Integração eNotas (NFSe)'}
            titleTypographyProps={{ variant: 'h6' }}
            subheader={localState.provedorNFSe === 'nacional'
              ? 'Emissão síncrona via Sefin · Requer certificado A1 e código IBGE do município'
              : 'Emissão via API eNotas · Para migrar para o Emissor Nacional, altere o provedor ao lado'}
            sx={{ pb: 0 }}
            action={
              <FormControl size="small" sx={{ minWidth: 200, mt: 1.5, mr: 1 }}>
                <InputLabel id="provedor-nfse-label">Provedor NFSe</InputLabel>
                <Select
                  labelId="provedor-nfse-label"
                  label="Provedor NFSe"
                  value={localState.provedorNFSe}
                  onChange={handleProvedorChange}
                >
                  <MenuItem value="enotas">eNotas</MenuItem>
                  <MenuItem value="nacional">Emissor Nacional</MenuItem>
                </Select>
              </FormControl>
            }
          />
          <Divider sx={{ mt: 2 }} />
          <CardContent>

          {localState.provedorNFSe === 'nacional' && (
            <Grid container spacing={2}>
              <Grid xs={12}>
                <Alert severity="info">
                  Emissão síncrona direto no Emissor Nacional (Sefin). Requer código IBGE do
                  município e certificado digital A1 ativo. O código de tributação nacional é
                  opcional — usado apenas como fallback quando o serviço não tem código próprio.
                </Alert>
              </Grid>

              <Grid xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="nacional-ambiente-label">Ambiente</InputLabel>
                  <Select
                    labelId="nacional-ambiente-label"
                    label="Ambiente"
                    value={localState.nfseNacional.ambiente}
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
                  value={localState.nfseNacional.serieDps}
                  onChange={handleNacionalChange('serieDps')}
                />
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Próximo nº DPS"
                  value={localState.nfseNacional.proximoNumeroDps}
                  onChange={handleNacionalChange('proximoNumeroDps')}
                />
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Último NSU (ADN)"
                  value={localState.nfseNacional.ultimoNSU}
                  InputProps={{ readOnly: true }}
                  helperText="Controle interno — somente leitura"
                />
              </Grid>

              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código do Município (IBGE)"
                  value={localState.nfseNacional.codigoMunicipio}
                  onChange={handleNacionalChange('codigoMunicipio')}
                  helperText="7 dígitos — obrigatório. Use a lupa para buscar pelo CEP do cliente"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Buscar código IBGE pelo CEP do cliente">
                          <span>
                            <IconButton edge="end" disabled={buscandoIbge} onClick={() => handleBuscarIbge()}>
                              <Iconify icon="eva:search-fill" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cód. Tributação Nacional (cTribNac) — fallback"
                  value={localState.nfseNacional.codigoTributacaoNacional}
                  onChange={handleNacionalChange('codigoTributacaoNacional')}
                  helperText="6 dígitos — usado apenas quando o serviço não tem código próprio no cadastro"
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Cód. Tributação Municipal (cTribMun) — fallback"
                  value={localState.nfseNacional.codigoTributacaoMunicipal}
                  onChange={handleNacionalChange('codigoTributacaoMunicipal')}
                  helperText="Opcional — usado apenas quando o serviço não tem código próprio no cadastro"
                />
              </Grid>

              <Grid xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="nacional-opsn-label">Optante Simples Nacional</InputLabel>
                  <Select
                    labelId="nacional-opsn-label"
                    label="Optante Simples Nacional"
                    value={localState.nfseNacional.optanteSimplesNacional}
                    onChange={handleNacionalChange('optanteSimplesNacional')}
                  >
                    <MenuItem value={1}>Não optante</MenuItem>
                    <MenuItem value={2}>MEI</MenuItem>
                    <MenuItem value={3}>ME/EPP (Simples Nacional)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {localState.nfseNacional.optanteSimplesNacional === 3 && (
                <>
                  <Grid xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="nacional-regapsn-label">Regime Apuração SN</InputLabel>
                      <Select
                        labelId="nacional-regapsn-label"
                        label="Regime Apuração SN"
                        value={localState.nfseNacional.regimeApuracaoTributosSN}
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
                      value={localState.nfseNacional.percentualTotalTributosSN}
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
                  value={localState.nfseNacional.regimeEspecialTributacao}
                  onChange={handleNacionalChange('regimeEspecialTributacao')}
                  helperText="0 = nenhum"
                />
              </Grid>

              <Grid xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel id="nacional-cert-label">Certificado Digital (Emissor Nacional)</InputLabel>
                  <Select
                    labelId="nacional-cert-label"
                    label="Certificado Digital (Emissor Nacional)"
                    value={localState.nfseNacional.idCertificado || ''}
                    onChange={handleNacionalChange('idCertificado')}
                  >
                    <MenuItem value="">
                      <em>Usar certificado A1 ativo automaticamente</em>
                    </MenuItem>
                    {certificados.map((cert) => (
                      <MenuItem key={cert._id || cert.id} value={cert._id || cert.id}>
                        {cert.nome}{cert.status !== 'ativo' ? ` (${cert.status})` : ''} — válido até {formatarDataCertificado(cert.validTo)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Usado para mTLS e assinatura do DPS. Deixe em branco para usar o certificado ativo automaticamente.
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                {nacionalCamposObrigatoriosOk ? (
                  <LoadingButton
                    fullWidth
                    variant="outlined"
                    loading={checkingNacional}
                    startIcon={<Iconify icon="solar:shield-check-bold" />}
                    onClick={handleVerificarNacional}
                  >
                    Verificar configuração
                  </LoadingButton>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Preencha o Código do Município (IBGE) com 7 dígitos para habilitar a verificação
                    da configuração.
                  </Typography>
                )}
              </Grid>

              {nacionalStatus && (
                <Grid xs={12}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {localState.nfseNacional.buscaHabilitada && (
                        <Alert
                          severity={nacionalStatus.prontoParaBaixar ? 'success' : 'warning'}
                          sx={{ flex: 1, py: 0.5 }}
                        >
                          {nacionalStatus.prontoParaBaixar
                            ? 'Download habilitado'
                            : 'Download com pendências'}
                        </Alert>
                      )}
                      <Alert
                        severity={nacionalStatus.prontoParaEmitir ? 'success' : 'warning'}
                        sx={{ flex: 1, py: 0.5 }}
                      >
                        {nacionalStatus.prontoParaEmitir
                          ? 'Pronto para emitir pelo Emissor Nacional'
                          : 'Emissão com pendências'}
                      </Alert>
                    </Stack>

                    {(nacionalStatus.pendenciasDownload || []).length > 0 && (
                      <Alert severity="error">
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Bloqueiam download e emissão:
                          </Typography>
                          {(nacionalStatus.pendenciasDownload || []).map((p) => (
                            <Typography key={p} variant="body2">
                              • {p}
                            </Typography>
                          ))}
                        </Stack>
                      </Alert>
                    )}

                    {(nacionalStatus.pendenciasEmissao || []).length > 0 && (
                      <Alert severity="warning">
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Pendências para emissão:
                          </Typography>
                          {(nacionalStatus.pendenciasEmissao || []).map((p) => (
                            <Typography key={p} variant="body2">
                              • {p}
                            </Typography>
                          ))}
                        </Stack>
                      </Alert>
                    )}

                    {!(nacionalStatus.pendenciasDownload) &&
                      !(nacionalStatus.pendenciasEmissao) &&
                      (nacionalStatus.pendencias || []).length > 0 && (
                        <Alert severity={nacionalStatus.prontoParaEmitir ? 'success' : 'warning'}>
                          <Stack spacing={0.25}>
                            {(nacionalStatus.pendencias || []).map((p) => (
                              <Typography key={p} variant="body2">
                                • {p}
                              </Typography>
                            ))}
                          </Stack>
                        </Alert>
                      )}

                    {(nacionalStatus.certificado || nacionalStatus.conexao || typeof nacionalStatus.servicosComCodigoTributacao === 'number') && (
                      <Alert severity="info" sx={{ py: 0.5 }}>
                        <Stack spacing={0.25}>
                          {nacionalStatus.certificado && (
                            <Typography variant="body2">
                              Certificado: {nacionalStatus.certificado.nome} — válido até{' '}
                              {new Date(nacionalStatus.certificado.validTo).toLocaleDateString('pt-BR')}
                              {nacionalStatus.certificado.expirado ? ' (EXPIRADO)' : ''}
                            </Typography>
                          )}
                          {nacionalStatus.conexao && (
                            <Typography variant="body2">
                              Conexão Sefin: {nacionalStatus.conexao.mtlsOk ? 'mTLS OK' : 'falha mTLS'}
                              {typeof nacionalStatus.conexao.municipioConveniado === 'boolean'
                                ? ` · Município ${nacionalStatus.conexao.municipioConveniado ? 'conveniado' : 'NÃO conveniado'}`
                                : ''}
                              {nacionalStatus.conexao.erro ? ` · ${nacionalStatus.conexao.erro}` : ''}
                            </Typography>
                          )}
                          {typeof nacionalStatus.servicosComCodigoTributacao === 'number' && (
                            <Typography variant="body2">
                              Serviços com cód. tributação: {nacionalStatus.servicosComCodigoTributacao}
                              {nacionalStatus.servicosComCodigoTributacao === 0
                                ? ' — preencha o Cód. Tributação Nacional nos serviços (config acima é fallback)'
                                : ''}
                            </Typography>
                          )}
                        </Stack>
                      </Alert>
                    )}
                  </Stack>
                </Grid>
              )}
            </Grid>
          )}

          {localState.provedorNFSe !== 'nacional' && (
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: { xs: 2, md: 0 } }}>
                <InputLabel id="enotas-status-label">Status</InputLabel>
                <Select
                  labelId="enotas-status-label"
                  label="Status"
                  value={localState.eNotas.status}
                  onChange={handleEnotasRootChange('status')}
                >
                  <MenuItem value="ativa">Ativa</MenuItem>
                  <MenuItem value="inativa">Inativa</MenuItem>
                  <MenuItem value="suspensa">Suspensa</MenuItem>
                  <MenuItem value="bloqueada">Bloqueada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {localState.eNotas.status === 'ativa' && (
              <>
                <Grid xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="enotas-ambiente-label">Ambiente</InputLabel>
                    <Select
                      labelId="enotas-ambiente-label"
                      label="Ambiente"
                      value={localState.eNotas.ambiente}
                      onChange={handleEnotasRootChange('ambiente')}
                    >
                      <MenuItem value="homologacao">Homologação</MenuItem>
                      <MenuItem value="producao">Produção</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Empresa ID (eNotas)"
                    value={localState.eNotas.empresaId}
                    onChange={handleEnotasRootChange('empresaId')}
                    helperText={localState.eNotas.empresaId ? 'Registrada' : 'Não registrada — use o botão abaixo para registrar automaticamente'}
                  />
                </Grid>

                {localState.eNotas?.configuracaoEmpresa?.certificadoVinculado && (
                  <Grid xs={12}>
                    <Alert severity="success" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:shield-check-bold" />
                        <Typography variant="body2">
                          Certificado vinculado ao eNotas
                        </Typography>
                      </Stack>
                    </Alert>
                  </Grid>
                )}

                <Grid xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-start', pt: { md: 1 } }}>
                  <LoadingButton
                    fullWidth
                    variant={localState.eNotas.empresaId ? 'outlined' : 'contained'}
                    color="primary"
                    loading={registrandoEnotas}
                    startIcon={<Iconify icon="solar:buildings-bold" />}
                    onClick={handleRegistrarNoEnotas}
                    disabled={!localState.eNotas.configuracaoNFSe?.codigoMunicipio || !localState.eNotas.configuracaoNFSe?.codigoServico}
                  >
                    {localState.eNotas.empresaId ? 'Atualizar no eNotas' : 'Registrar no eNotas'}
                  </LoadingButton>
                </Grid>
                {(!localState.eNotas.configuracaoNFSe?.codigoMunicipio || !localState.eNotas.configuracaoNFSe?.codigoServico) && (
                  <Grid xs={12} md={8}>
                    <Typography variant="caption" color="text.secondary">
                      Preencha o Código do Município e o Código do Serviço abaixo para habilitar o registro.
                    </Typography>
                  </Grid>
                )}

                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Código do Município"
                    value={localState.eNotas.configuracaoNFSe.codigoMunicipio}
                    onChange={handleEnotasNFSeChange('codigoMunicipio')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Buscar código IBGE pelo CEP do cliente">
                            <span>
                              <IconButton edge="end" disabled={buscandoIbge} onClick={() => handleBuscarIbge()}>
                                <Iconify icon="eva:search-fill" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Código do Serviço"
                    value={localState.eNotas.configuracaoNFSe.codigoServico}
                    onChange={handleEnotasNFSeChange('codigoServico')}
                  />
                </Grid>
                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Alíquota ISS (%)"
                    value={localState.eNotas.configuracaoNFSe.aliquotaIss}
                    onChange={handleEnotasNFSeChange('aliquotaIss')}
                  />
                </Grid>
                <Grid xs={12} md={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Discriminação"
                    value={localState.eNotas.configuracaoNFSe.discriminacao}
                    onChange={handleEnotasNFSeChange('discriminacao')}
                  />
                </Grid>
              </>
            )}
          </Grid>
          )}
          </CardContent>
        </Card>
      )}

      {/* ── Download e Busca de Documentos — sempre visível ── */}
      <Card>
        <CardHeader
          title="Download e Busca de Documentos Fiscais"
          titleTypographyProps={{ variant: 'h6' }}
          subheader="Sempre disponível — independente da configuração de emissão de NFSe"
          sx={{ pb: 0 }}
        />
        <Divider sx={{ mt: 2 }} />
        <CardContent>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>NFS-e (Emissor Nacional / ADN)</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Importa as NFS-e do CNPJ do cliente direto do ADN. Não depende da emissão — basta um certificado digital A1 ativo.
          </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={localState.nfseNacional.buscaHabilitada}
                onChange={handleNacionalBuscaToggle}
              />
            }
            label="Baixar NFS-e do Emissor Nacional"
          />
        </Grid>
      </Grid>

      {localState.nfseNacional.buscaHabilitada && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel id="nacional-download-cert-label">Certificado Digital (Download ADN)</InputLabel>
              <Select
                labelId="nacional-download-cert-label"
                label="Certificado Digital (Download ADN)"
                value={localState.nfseNacional.idCertificado || ''}
                onChange={handleNacionalChange('idCertificado')}
              >
                <MenuItem value="">
                  <em>Usar certificado A1 ativo automaticamente</em>
                </MenuItem>
                {certificados.map((cert) => (
                  <MenuItem key={cert._id || cert.id} value={cert._id || cert.id}>
                    {cert.nome}{cert.status !== 'ativo' ? ` (${cert.status})` : ''} — válido até {formatarDataCertificado(cert.validTo)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Usado para mTLS e download do ADN. Distribuição incremental por NSU.
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="nacional-download-ambiente-label">Ambiente</InputLabel>
              <Select
                labelId="nacional-download-ambiente-label"
                label="Ambiente"
                value={localState.nfseNacional.ambiente}
                onChange={handleNacionalChange('ambiente')}
              >
                <MenuItem value="producao">Produção</MenuItem>
                <MenuItem value="homologacao">Homologação</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Último NSU (ADN)"
              value={localState.nfseNacional.ultimoNSU}
              InputProps={{ readOnly: true }}
              helperText="Controle interno — somente leitura"
            />
          </Grid>
          <Grid xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <LoadingButton
              fullWidth
              variant="outlined"
              loading={checkingNacionalDownload}
              startIcon={<Iconify icon="solar:shield-check-bold" />}
              onClick={handleTestarConexaoNacional}
            >
              Testar conexão
            </LoadingButton>
          </Grid>

          <Grid xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <LoadingButton
                variant="contained"
                color="info"
                loading={syncingNacional}
                startIcon={<Iconify icon="solar:cloud-download-bold" />}
                onClick={handleSincronizarDfe}
              >
                Sincronizar novas
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                loading={reprocessandoRetencoes}
                startIcon={<Iconify icon="solar:shield-check-bold" />}
                onClick={handleReprocessarRetencoes}
              >
                Reprocessar retenções
              </LoadingButton>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:download-square-bold" />}
                onClick={handleOpenImportDialog}
              >
                Importar período
              </Button>
            </Stack>
          </Grid>

          {nacionalDownloadStatus && (
            <Grid xs={12}>
              <Stack spacing={1}>
                <Alert severity={nacionalDownloadStatus.prontoParaBaixar ? 'success' : 'warning'} sx={{ py: 0.5 }}>
                  {nacionalDownloadStatus.prontoParaBaixar
                    ? 'Download habilitado — conexão e certificado OK'
                    : 'Download com pendências'}
                </Alert>

                {(nacionalDownloadStatus.pendenciasDownload || []).length > 0 && (
                  <Alert severity="error">
                    <Stack spacing={0.25}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        Bloqueiam download:
                      </Typography>
                      {(nacionalDownloadStatus.pendenciasDownload || []).map((p) => (
                        <Typography key={p} variant="body2">
                          • {p}
                        </Typography>
                      ))}
                    </Stack>
                  </Alert>
                )}

                <Alert
                  severity={
                    nacionalDownloadStatus?.certificado &&
                    !nacionalDownloadStatus.certificado.expirado &&
                    nacionalDownloadStatus?.conexao?.mtlsOk
                      ? 'success'
                      : 'warning'
                  }
                  sx={{ py: 0.5 }}
                >
                  <Stack spacing={0.25}>
                    {nacionalDownloadStatus.certificado ? (
                      <Typography variant="body2">
                        Certificado: {nacionalDownloadStatus.certificado.nome} — válido até{' '}
                        {new Date(nacionalDownloadStatus.certificado.validTo).toLocaleDateString('pt-BR')}
                        {nacionalDownloadStatus.certificado.expirado ? ' (EXPIRADO)' : ''}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        Nenhum certificado digital A1 ativo encontrado.
                      </Typography>
                    )}
                    {nacionalDownloadStatus.conexao && (
                      <Typography variant="body2">
                        Conexão Sefin:{' '}
                        {nacionalDownloadStatus.conexao.mtlsOk ? 'mTLS OK' : 'falha mTLS'}
                        {nacionalDownloadStatus.conexao.erro
                          ? ` · ${nacionalDownloadStatus.conexao.erro}`
                          : ''}
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              </Stack>
            </Grid>
          )}
        </Grid>
      )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>Integração Sieg</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Importa automaticamente as notas fiscais (NF-e, NFS-e, CT-e, etc.) disponibilizadas pela
            Sieg para o CNPJ do cliente.
          </Typography>
      <Controller
        name="importarNotasSieg"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={!!field.value} />}
            label="Importar Notas Fiscais da Sieg automaticamente"
          />
        )}
      />

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>Busca de NF-e na SEFAZ (Produto, modelo 55)</Typography>
              <Typography variant="body2" color="text.secondary">
                Importa automaticamente as NF-e do CNPJ do cliente direto da SEFAZ (Ambiente Nacional).
                Requer CNPJ cadastrado e certificado digital A1 ativo.
              </Typography>
            </Box>
          </Stack>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={localState.nfe.buscaHabilitada}
                onChange={handleNfeToggle('buscaHabilitada')}
              />
            }
            label="Buscar NF-e na SEFAZ"
          />
          {localState.nfe.buscaHabilitada && (
            <Tooltip title="Necessária para a SEFAZ liberar o XML completo das notas recebidas (ciência da operação)">
              <FormControlLabel
                control={
                  <Switch
                    checked={localState.nfe.manifestacaoAutomatica}
                    onChange={handleNfeToggle('manifestacaoAutomatica')}
                  />
                }
                label="Manifestação automática (ciência da operação)"
                sx={{
                  ml: 4,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  },
                }}
              />
            </Tooltip>
          )}
        </Grid>
      </Grid>

      {localState.nfe.buscaHabilitada && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid xs={12}>
            <Alert severity="info">
              A SEFAZ distribui as notas de forma incremental por NSU e mantém apenas os últimos 90
              dias. A emissão de NF-e ainda não está disponível (apenas busca/importação).
            </Alert>
          </Grid>

          <Grid xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="nfe-ambiente-label">Ambiente</InputLabel>
              <Select
                labelId="nfe-ambiente-label"
                label="Ambiente"
                value={localState.nfe.ambiente}
                onChange={handleNfeChange('ambiente')}
              >
                <MenuItem value="producao">Produção</MenuItem>
                <MenuItem value="homologacao">Homologação</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel id="nfe-cert-label">Certificado Digital (NF-e)</InputLabel>
              <Select
                labelId="nfe-cert-label"
                label="Certificado Digital (NF-e)"
                value={localState.nfe.idCertificado || ''}
                onChange={handleNfeChange('idCertificado')}
              >
                <MenuItem value="">
                  <em>Usar certificado A1 ativo automaticamente</em>
                </MenuItem>
                {certificados.map((cert) => (
                  <MenuItem key={cert._id || cert.id} value={cert._id || cert.id}>
                    {cert.nome}{cert.status !== 'ativo' ? ` (${cert.status})` : ''} — válido até {formatarDataCertificado(cert.validTo)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Usado para mTLS com a SEFAZ. Deixe em branco para usar o certificado ativo automaticamente.
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="Último NSU"
              value={localState.nfe.ultimoNSUDistribuicao}
              InputProps={{ readOnly: true }}
              helperText="Controle interno — somente leitura"
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              label="NSU máximo na SEFAZ"
              value={localState.nfe.maxNSUDistribuicao}
              InputProps={{ readOnly: true }}
              helperText="Somente leitura"
            />
          </Grid>
          <Grid xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <LoadingButton
                fullWidth
                variant="outlined"
                loading={checkingNfe}
                startIcon={<Iconify icon="solar:shield-check-bold" />}
                onClick={() => handleStatusNfe({ testarConexao: false })}
              >
                Verificar
              </LoadingButton>
              <Tooltip title="Faz uma consulta real à SEFAZ para validar o certificado/mTLS (limitado a 1 a cada 15 min)">
                <span style={{ width: '100%' }}>
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    color="info"
                    loading={testandoConexaoNfe}
                    startIcon={<Iconify icon="solar:wi-fi-router-bold" />}
                    onClick={() => handleStatusNfe({ testarConexao: true })}
                  >
                    Testar conexão
                  </LoadingButton>
                </span>
              </Tooltip>
            </Stack>
          </Grid>

          {localState.nfe.bloqueadoAte &&
            new Date(localState.nfe.bloqueadoAte).getTime() > Date.now() && (
              <Grid xs={12}>
                <Alert severity="warning">
                  A SEFAZ limitou temporariamente as consultas deste CNPJ (consumo indevido). Tente
                  novamente após {new Date(localState.nfe.bloqueadoAte).toLocaleString('pt-BR')}.
                </Alert>
              </Grid>
            )}

          {nfeStatus && (
            <Grid xs={12}>
              <Alert severity={nfeStatus.pronto ? 'success' : 'warning'}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">
                    {nfeStatus.pronto
                      ? 'Pronto para buscar NF-e na SEFAZ'
                      : 'Configuração com pendências'}
                  </Typography>
                  {(nfeStatus.pendencias || []).map((p) => (
                    <Typography key={p} variant="body2">
                      • {p}
                    </Typography>
                  ))}
                  {nfeStatus.certificado && (
                    <Typography variant="body2">
                      Certificado: {nfeStatus.certificado.nome} — válido até{' '}
                      {new Date(nfeStatus.certificado.validTo).toLocaleDateString('pt-BR')}
                      {nfeStatus.certificado.expirado ? ' (EXPIRADO)' : ''}
                    </Typography>
                  )}
                  {nfeStatus.conexao && (
                    <Typography variant="body2">
                      Conexão SEFAZ: {nfeStatus.conexao.mtlsOk ? 'mTLS OK' : 'falha mTLS'}
                      {nfeStatus.conexao.xMotivo ? ` · ${nfeStatus.conexao.xMotivo}` : ''}
                      {nfeStatus.conexao.erro ? ` · ${nfeStatus.conexao.erro}` : ''}
                    </Typography>
                  )}
                  {typeof nfeStatus.maxNSU === 'number' &&
                    typeof nfeStatus.ultimoNSU === 'number' &&
                    nfeStatus.maxNSU > nfeStatus.ultimoNSU && (
                      <Typography variant="body2">
                        Há documentos novos aguardando sincronização (NSU {nfeStatus.ultimoNSU} →{' '}
                        {nfeStatus.maxNSU}).
                      </Typography>
                    )}
                </Stack>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

          <Divider sx={{ my: 3 }} />

          {/* NF-e PR — consulta direta por chave via SEFAZ-PR. Usa cert/ambiente de nfeConfig. */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>NF-e por chave (SEFAZ-PR)</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulta/importação de NF-e (modelo 55) diretamente no SEFAZ-PR por chave de acesso.
                Complementar ao Ambiente Nacional — não precisa de NSU. Usa o certificado e ambiente
                configurados na seção NF-e acima.
              </Typography>
            </Box>
        <Stack direction="row" spacing={1}>
          <LoadingButton
            variant="outlined"
            loading={checkingNfePr}
            startIcon={<Iconify icon="solar:shield-check-bold" />}
            onClick={() => handleStatusNfePr({ testarSefaz: false })}
          >
            Verificar
          </LoadingButton>
          <Tooltip title="Consulta o NFeStatusServico4 real no SEFAZ-PR">
            <span>
              <LoadingButton
                variant="contained"
                color="info"
                loading={checkingNfePr}
                startIcon={<Iconify icon="solar:wi-fi-router-bold" />}
                onClick={() => handleStatusNfePr({ testarSefaz: true })}
              >
                Testar SEFAZ
              </LoadingButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {nfePrStatus && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={12}>
            <Alert severity={nfePrStatus.pronto ? 'success' : 'warning'}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">
                  {nfePrStatus.pronto ? 'SEFAZ-PR pronto para NF-e por chave' : 'Configuração com pendências'}
                </Typography>
                {(nfePrStatus.pendencias || []).map((p) => (
                  <Typography key={p} variant="body2">• {p}</Typography>
                ))}
                {nfePrStatus.certificado && (
                  <Typography variant="body2">
                    Certificado: {nfePrStatus.certificado.nome ?? nfePrStatus.certificado.id} —{' '}
                    {nfePrStatus.certificado.expirado ? 'EXPIRADO' : `status: ${nfePrStatus.certificado.status}`}
                  </Typography>
                )}
                {nfePrStatus.sefaz && (
                  <Typography variant="body2">
                    SEFAZ-PR ({nfePrStatus.sefaz.cStat}): {nfePrStatus.sefaz.xMotivo}
                  </Typography>
                )}
              </Stack>
            </Alert>
          </Grid>
        </Grid>
      )}

        </CardContent>
      </Card>

      {/* NFC-e (modelo 65) — desabilitado por enquanto */}
      {false && (
      <Card>
        <CardHeader title="NFC-e (modelo 65) — SEFAZ-PR" titleTypographyProps={{ variant: 'h6' }} sx={{ pb: 0 }} />
        <Divider sx={{ mt: 2 }} />
        <CardContent>
      {/* NFC-e PR — emissão direta no SEFAZ-PR */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6">NFC-e (modelo 65) — SEFAZ-PR</Typography>
          <Typography variant="body2" color="text.secondary">
            Emissão de Nota Fiscal de Consumidor Eletrônica diretamente no SEFAZ-PR.
            Requer CSC fornecido pela SEFAZ-PR por empresa.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={localState.nfcePr.habilitado}
                onChange={handleNfcePrToggle('habilitado')}
              />
            }
            label="Habilitar emissão de NFC-e"
          />
        </Grid>
      </Grid>

      {localState.nfcePr.habilitado && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid xs={12}>
            <Alert severity="info">
              Os campos CSC (cscId e cscToken) são fornecidos pela SEFAZ-PR por empresa.
              O código IBGE do município e um certificado digital A1 ativo são obrigatórios.
            </Alert>
          </Grid>

          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="nfce-ambiente-label">Ambiente</InputLabel>
              <Select
                labelId="nfce-ambiente-label"
                label="Ambiente"
                value={localState.nfcePr.ambiente}
                onChange={handleNfcePrChange('ambiente')}
              >
                <MenuItem value="homologacao">Homologação</MenuItem>
                <MenuItem value="producao">Produção</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              label="Série NFC-e"
              value={localState.nfcePr.serie}
              onChange={handleNfcePrChange('serie')}
              helperText="Padrão: 001"
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Próximo número"
              value={localState.nfcePr.proximoNumero}
              onChange={handleNfcePrChange('proximoNumero')}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              label="Código do Município (IBGE)"
              value={localState.nfcePr.codigoMunicipio}
              onChange={handleNfcePrChange('codigoMunicipio')}
              helperText="7 dígitos — obrigatório"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Buscar código IBGE pelo CEP do cliente">
                      <span>
                        <IconButton edge="end" disabled={buscandoIbge} onClick={() => handleBuscarIbge()}>
                          <Iconify icon="eva:search-fill" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              label="CSC ID"
              value={localState.nfcePr.cscId}
              onChange={handleNfcePrChange('cscId')}
              helperText="ID do CSC (até 6 dígitos) — ex: 000001"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="CSC Token"
              value={localState.nfcePr.cscToken}
              onChange={handleNfcePrChange('cscToken')}
              helperText="Token CSC fornecido pela SEFAZ-PR — obrigatório para QR Code"
            />
          </Grid>

          <Grid xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Alert severity="info" sx={{ width: '100%' }}>
              Usa o certificado A1 ativo do cliente automaticamente.
            </Alert>
          </Grid>

          <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
              <LoadingButton
                fullWidth
                variant="outlined"
                loading={checkingNfcePr}
                startIcon={<Iconify icon="solar:shield-check-bold" />}
                onClick={() => handleStatusNfcePr({ testarSefaz: false })}
              >
                Verificar
              </LoadingButton>
              <Tooltip title="Consulta o NFeStatusServico4 real no SEFAZ-PR">
                <span style={{ width: '100%' }}>
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    color="info"
                    loading={testandoSefazNfcePr}
                    startIcon={<Iconify icon="solar:wi-fi-router-bold" />}
                    onClick={() => handleStatusNfcePr({ testarSefaz: true })}
                  >
                    Testar SEFAZ
                  </LoadingButton>
                </span>
              </Tooltip>
            </Stack>
          </Grid>

          {nfcePrStatus && (
            <Grid xs={12}>
              <Alert severity={nfcePrStatus.pronto ? 'success' : 'warning'}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">
                    {nfcePrStatus.pronto ? 'Pronto para emitir NFC-e' : 'Configuração com pendências'}
                  </Typography>
                  {(nfcePrStatus.pendencias || []).map((p) => (
                    <Typography key={p} variant="body2">• {p}</Typography>
                  ))}
                  {!nfcePrStatus.cscConfigurado && (
                    <Typography variant="body2">• CSC (cscId + cscToken) não configurado</Typography>
                  )}
                  {nfcePrStatus.certificado && (
                    <Typography variant="body2">
                      Certificado:{' '}
                      {nfcePrStatus.certificado.expirado
                        ? 'EXPIRADO'
                        : `status: ${nfcePrStatus.certificado.status}`}
                    </Typography>
                  )}
                  {nfcePrStatus.sefaz && (
                    <Typography variant="body2">
                      SEFAZ-PR ({nfcePrStatus.sefaz.cStat}): {nfcePrStatus.sefaz.xMotivo}
                    </Typography>
                  )}
                </Stack>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

        </CardContent>
      </Card>
      )} {/* fim NFC-e desabilitado */}

      {/* ── Certificados Digitais ── */}
      <Card>
        <CardHeader
          title="Certificados Digitais"
          titleTypographyProps={{ variant: 'h6' }}
          subheader="Gerencie os certificados A1 usados para emissão e download de documentos fiscais"
          sx={{ pb: 0 }}
        />
        <Divider sx={{ mt: 2 }} />
        <CardContent>
      <Stack spacing={2}>
        <Box>
          <input
            type="file"
            accept=".p12,.pfx,.cer,.crt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="certificate-upload-admin"
          />
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-outline" />}
            onClick={() => document.getElementById('certificate-upload-admin')?.click()}
          >
            Novo Certificado
          </Button>
        </Box>

        {loadingCertificados ? (
          <Typography variant="body2" color="text.secondary">Carregando certificados...</Typography>
        ) : certificados.length === 0 ? (
          <Alert severity="info">
            Nenhum certificado digital configurado para este cliente.
          </Alert>
        ) : (
          <>
            {certificadoAtivo && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Certificado Ativo:</strong> {certificadoAtivo.fileName}
                </Typography>
                <Typography variant="caption">
                  Válido até: {formatarDataCertificado(certificadoAtivo.validTo)}
                </Typography>
              </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Número de Série</TableCell>
                    <TableCell>Válido Até</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Upload</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificados.map((certificado) => (
                    <TableRow key={certificado._id || certificado.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {certificado.nome}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {certificado.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatarDataCertificado(certificado.validTo)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={certificado.status}
                            color={getCorStatusCertificado(certificado.status)}
                            size="small"
                            icon={<Iconify icon={getIconeStatusCertificado(certificado.status)} />}
                          />
                          {localState?.eNotas?.configuracaoEmpresa?.idCertificado &&
                            (certificado._id === localState.eNotas.configuracaoEmpresa.idCertificado ||
                              certificado.id === localState.eNotas.configuracaoEmpresa.idCertificado) && (
                              <Chip
                                size="small"
                                color="success"
                                label="Vinculado ao eNotas"
                              />
                            )}
                          {localState?.nfseNacional?.idCertificado &&
                            (certificado._id === localState.nfseNacional.idCertificado ||
                              certificado.id === localState.nfseNacional.idCertificado) && (
                              <Chip
                                size="small"
                                color="info"
                                label="Emissor Nacional"
                              />
                            )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatarDataCertificado(certificado.uploadedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Baixar certificado">
                            <IconButton size="small" onClick={() => handleDownloadCertificado(certificado.id, certificado.nome)} sx={{ color: 'primary.main' }}>
                              <Iconify icon="solar:download-bold" />
                            </IconButton>
                          </Tooltip>
                          {certificado.status === 'ativo' && (
                            <Tooltip title="Desativar certificado">
                              <IconButton size="small" onClick={() => handleDesativarCertificado(certificado.id)} sx={{ color: 'error.main' }}>
                                <Iconify icon="eva:minus-circle-outline" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Ver senha">
                            <IconButton size="small" onClick={() => handleVerSenhaCertificado(certificado.id)} sx={{ color: 'text.secondary' }}>
                              <Iconify icon="solar:eye-bold" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir permanentemente">
                            <IconButton
                              size="small"
                              onClick={() => setCertificadoToDelete(certificado)}
                              sx={{ color: 'error.main' }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Stack>

      <Dialog open={certificateDialogOpen} onClose={() => setCertificateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:shield-check-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Configurar Certificado Digital</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Arquivo selecionado:</strong> {certificateFile?.name}
              </Typography>
            </Alert>
            <TextField
              type="password"
              label="Senha do Certificado"
              value={certificatePassword}
              onChange={(e) => setCertificatePassword(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="Confirmar Senha"
              value={certificatePasswordConfirm}
              onChange={(e) => setCertificatePasswordConfirm(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setCertificateDialogOpen(false);
              setCertificateFile(null);
              setCertificatePassword('');
              setCertificatePasswordConfirm('');
            }}
          >
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            loading={uploadingCertificate}
            startIcon={<Iconify icon="eva:cloud-upload-outline" />}
            onClick={handleCertificateUpload}
          >
            {uploadingCertificate ? 'Enviando...' : 'Enviar Certificado'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!certificadoToDelete}
        onClose={() => setCertificadoToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Excluir certificado?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            O certificado &quot;{certificadoToDelete?.nome}&quot; será excluído permanentemente. Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setCertificadoToDelete(null)}>
            Cancelar
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            loading={deletingCertificado}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => certificadoToDelete && handleDeletarCertificado(certificadoToDelete.id)}
          >
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:lock-password-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Senha do Certificado</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {passwordLoading && (
              <Typography variant="body2" color="text.secondary">Buscando senha...</Typography>
            )}
            {!!passwordValue && (
              <TextField
                type={passwordVisible ? 'text' : 'password'}
                label="Senha do certificado"
                value={passwordValue}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
            <Stack direction="row" spacing={1}>
              {!!passwordValue && (
                <>
                  <Button size="small" variant="outlined" onClick={() => setPasswordVisible((v) => !v)} startIcon={<Iconify icon={passwordVisible ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />}>
                    {passwordVisible ? 'Ocultar' : 'Mostrar'}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => { navigator.clipboard.writeText(passwordValue || ''); toast.success('Senha copiada'); }} startIcon={<Iconify icon="solar:copy-bold" />}>
                    Copiar
                  </Button>
                </>
              )}
            </Stack>
            <Alert severity="warning">
              Exiba a senha apenas quando necessário. Ela pode ficar visível temporariamente nesta sessão.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowPasswordDialog(false); if (passwordTimerId) clearTimeout(passwordTimerId); }}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Importação por Período — Emissor Nacional (ADN) */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:download-square-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Importar NFS-e — Emissor Nacional</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              A primeira importação pode demorar alguns minutos: o ADN é varrido por NSU desde o
              início e as notas são filtradas pelo período informado.
            </Alert>

            <FormControl fullWidth>
              <InputLabel id="import-modo-label">Modo</InputLabel>
              <Select
                labelId="import-modo-label"
                label="Modo"
                value={importModo}
                onChange={(e) => setImportModo(e.target.value)}
                disabled={importing}
              >
                <MenuItem value="mes">Um mês</MenuItem>
                <MenuItem value="intervalo">Intervalo de meses (mesmo ano)</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Ano"
                value={importAno}
                onChange={(e) => setImportAno(Number(e.target.value))}
                disabled={importing}
              />
              <FormControl fullWidth>
                <InputLabel id="import-mes-inicio-label">
                  {importModo === 'mes' ? 'Mês' : 'De'}
                </InputLabel>
                <Select
                  labelId="import-mes-inicio-label"
                  label={importModo === 'mes' ? 'Mês' : 'De'}
                  value={importMesInicio}
                  onChange={(e) => setImportMesInicio(Number(e.target.value))}
                  disabled={importing}
                >
                  {MESES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {importModo === 'intervalo' && (
                <FormControl fullWidth>
                  <InputLabel id="import-mes-fim-label">Até</InputLabel>
                  <Select
                    labelId="import-mes-fim-label"
                    label="Até"
                    value={importMesFim}
                    onChange={(e) => setImportMesFim(Number(e.target.value))}
                    disabled={importing}
                  >
                    {MESES.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>

            {importing && (
              <Alert severity="info">
                Importando notas do Emissor Nacional... pode levar alguns minutos.
              </Alert>
            )}

            {importResultado && (
              <Alert severity="success">
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{importResultado.message}</Typography>
                  <Typography variant="body2">
                    Importadas: {importResultado.notasImportadas ?? 0} · Atualizadas:{' '}
                    {importResultado.notasAtualizadas ?? 0} · Fora do período:{' '}
                    {importResultado.notasIgnoradasForaPeriodo ?? 0} · Eventos:{' '}
                    {importResultado.eventosProcessados ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Documentos processados: {importResultado.documentosProcessados ?? 0} · Último
                    NSU: {importResultado.ultimoNSU ?? '-'}
                  </Typography>
                </Stack>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setImportDialogOpen(false)} disabled={importing}>
            Fechar
          </Button>
          <LoadingButton
            variant="contained"
            loading={importing}
            startIcon={<Iconify icon="solar:download-square-bold" />}
            onClick={handleImportarPeriodo}
          >
            Importar
          </LoadingButton>
        </DialogActions>
      </Dialog>

        </CardContent>
      </Card>

      {settingsLoading && (
        <Typography variant="body2" color="text.secondary">
          Carregando configurações...
        </Typography>
      )}
    </Stack>
  );
});

ClientePortalSettings.displayName = 'ClientePortalSettings';

export default ClientePortalSettings;
