'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
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
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import { useGetSettings, updateSettings } from 'src/actions/settings';
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

export function ClientePortalSettings({ clienteId }) {
  const { settings, settingsLoading, refetchSettings } = useGetSettings(clienteId);

  const [saving, setSaving] = useState(false);

  const funcionalidades = useMemo(
    () => ({
      emissaoNFSe: Boolean(settings?.funcionalidades?.emissaoNFSe),
      cadastroClientes: Boolean(settings?.funcionalidades?.cadastroClientes),
      cadastroServicos: Boolean(settings?.funcionalidades?.cadastroServicos),
      vendas: Boolean(settings?.funcionalidades?.vendas),
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

  const [localState, setLocalState] = useState({ funcionalidades, configuracoes, eNotas });

  // Atualiza local state quando settings carregar
  const syncLocal = () => setLocalState({ funcionalidades, configuracoes, eNotas });

  useEffect(() => {
    if (settings) {
      setLocalState({ funcionalidades, configuracoes, eNotas });
    }
  }, [settings, funcionalidades, configuracoes, eNotas]);

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
    setLocalState((prev) => ({
      ...prev,
      eNotas: { ...prev.eNotas, [key]: event.target.checked },
    }));
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

  const handleSave = async () => {
    try {
      setSaving(true);
      // Monta payload explícito para garantir envio correto da integração eNotas
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

      const response = await updateSettings(clienteId, {
        funcionalidades: { ...localState.funcionalidades },
        configuracoes: { ...localState.configuracoes },
        eNotasConfig: eNotasPayload,
      });
      toast.success('Configurações atualizadas com sucesso');
      // Atualiza o estado local imediatamente com o retorno da API (quando disponível)
      const updated = response?.data?.settings || response?.settings;
      if (updated) {
        setLocalState({
          funcionalidades: {
            emissaoNFSe: Boolean(updated?.funcionalidades?.emissaoNFSe),
            cadastroClientes: Boolean(updated?.funcionalidades?.cadastroClientes),
            cadastroServicos: Boolean(updated?.funcionalidades?.cadastroServicos),
            vendas: Boolean(updated?.funcionalidades?.vendas),
            agendamentos: Boolean(updated?.funcionalidades?.agendamentos),
          },
          configuracoes: {
            limiteClientes: updated?.configuracoes?.limiteClientes ?? '',
            limiteServicos: updated?.configuracoes?.limiteServicos ?? '',
            limiteOrcamentos: updated?.configuracoes?.limiteOrcamentos ?? '',
          },
          eNotas: {
            empresaId: updated?.eNotasConfig?.empresaId ?? '',
            ambiente: updated?.eNotasConfig?.ambiente ?? 'homologacao',
            status: updated?.eNotasConfig?.status ?? 'inativa',
            emiteNFSeNacional: Boolean(updated?.eNotasConfig?.emiteNFSeNacional),
            emiteNotaRetroativa: Boolean(updated?.eNotasConfig?.emiteNotaRetroativa),
            configuracaoNFSe: {
              codigoMunicipio: updated?.eNotasConfig?.configuracaoNFSe?.codigoMunicipio ?? '',
              codigoServico: updated?.eNotasConfig?.configuracaoNFSe?.codigoServico ?? '',
              aliquotaIss: updated?.eNotasConfig?.configuracaoNFSe?.aliquotaIss ?? '',
              discriminacao: updated?.eNotasConfig?.configuracaoNFSe?.discriminacao ?? '',
            },
            configuracaoEmpresa: {
              logo: updated?.eNotasConfig?.configuracaoEmpresa?.logo ?? '',
              certificadoVinculado:
                (updated?.eNotasConfig?.configuracaoEmpresa?.certificadoVinculado ??
                  updated?.eNotasConfig?.configuracaoEmpresa?.cerfificadoVinculado) ?? false,
              idCertificado: updated?.eNotasConfig?.configuracaoEmpresa?.idCertificado ?? '',
            },
          },
        });
      }
      await refetchSettings();
    } catch (error) {
      toast.error('Falha ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };

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
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Funcionalidades do Portal</Typography>
        <LoadingButton loading={saving} variant="contained" onClick={handleSave}>
          Salvar Configurações
        </LoadingButton>
      </Box>

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

      {localState.funcionalidades.emissaoNFSe && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Integração eNotas (NFSe)</Typography>
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

                <Grid xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Código do Município"
                    value={localState.eNotas.configuracaoNFSe.codigoMunicipio}
                    onChange={handleEnotasNFSeChange('codigoMunicipio')}
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
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Certificados Digitais</Typography>
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

      {settingsLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Carregando configurações...
        </Typography>
      )}
    </Box>
  );
}

export default ClientePortalSettings;
