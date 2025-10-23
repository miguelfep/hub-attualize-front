'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Controller } from 'react-hook-form';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  Stack,
  Divider,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { useGetSettings, updateSettings } from 'src/actions/settings';
import {
  uploadCertificado,
  getCertificadoAtivo,
  downloadCertificado,
  desativarCertificado,
  getCertificadosCliente,
  formatarDataCertificado,
  getCorStatusCertificado,
  validarArquivoCertificado,
  getIconeStatusCertificado,
} from 'src/actions/certificados';

import { toast } from 'src/components/snackbar';

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
    setLocalState((prev) => ({
      ...prev,
      funcionalidades: { ...prev.funcionalidades, [key]: event.target.checked },
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
    const value = event.target.value;
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
      await updateSettings(clienteId, {
        funcionalidades: localState.funcionalidades,
        configuracoes: localState.configuracoes,
        eNotasConfig: localState.eNotas,
      });
      toast.success('Configurações atualizadas com sucesso');
      await refetchSettings();
      syncLocal();
    } catch (error) {
      toast.error('Falha ao atualizar configurações');
    } finally {
      setSaving(false);
    }
  };
export function ClientePortalSettings({ control }) {

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
    if (!certificatePassword) {
      toast.error('Informe a senha do certificado');
      return;
    }
    if (certificatePassword !== certificatePasswordConfirm) {
      toast.error('Senhas não coincidem');
      return;
    }
    try {
      setUploadingCertificate(true);
      const response = await uploadCertificado(certificateFile, certificatePassword, clienteId);
      if (response.data.success) {
        toast.success('Certificado digital enviado com sucesso!');
        setCertificateDialogOpen(false);
        setCertificateFile(null);
        setCertificatePassword('');
        setCertificatePasswordConfirm('');
        await fetchCertificados();
      } else if (response.data.message?.includes('Senha do certificado inválida')) {
        toast.error('Senha incorreta! Verifique a senha do certificado.');
      } else {
        toast.error(response.data.message || 'Erro ao enviar certificado');
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('Senha do certificado inválida')) {
        toast.error('Senha incorreta! Verifique a senha do certificado.');
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao enviar certificado digital';
        toast.error(errorMessage);
      }
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

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h6">Funcionalidades do Portal</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Controller
            name="settings.funcionalidades.cadastroClientes"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Cadastro de Clientes"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.cadastroServicos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Cadastro de Serviços"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.vendas"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Vendas / Orçamentos"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.agendamentos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Agendamentos"
              />
            )}
          />
          <Controller
            name="settings.funcionalidades.emissaoNFSe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label="Emissão de NFSe"
              />
            )}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Limites</Typography>
          <Controller
            name="settings.configuracoes.limiteClientes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Clientes"
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="settings.configuracoes.limiteServicos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Serviços"
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="settings.configuracoes.limiteOrcamentos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Limite de Orçamentos"
              />
            )}
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
                        <Chip
                          label={certificado.status}
                          color={getCorStatusCertificado(certificado.status)}
                          size="small"
                          icon={<Iconify icon={getIconeStatusCertificado(certificado.status)} />}
                        />
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
                          {localState?.eNotas?.configuracaoEmpresa?.idCertificado &&
                            (certificado._id === localState.eNotas.configuracaoEmpresa.idCertificado ||
                              certificado.id === localState.eNotas.configuracaoEmpresa.idCertificado) && (
                              <Chip
                                size="small"
                                color="success"
                                label={`Vinculado ao eNotas até ${formatarDataCertificado(certificado.validTo)}`}
                              />
                            )}
                          {certificado.status === 'ativo' && (
                            <Tooltip title="Desativar certificado">
                              <IconButton size="small" onClick={() => handleDesativarCertificado(certificado.id)} sx={{ color: 'error.main' }}>
                                <Iconify icon="eva:minus-circle-outline" />
                              </IconButton>
                            </Tooltip>
                          )}
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

      {settingsLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Carregando configurações...
        </Typography>
      )}
    </Box>
  );
}
