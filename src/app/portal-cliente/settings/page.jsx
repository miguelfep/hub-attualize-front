'use client';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axios from 'src/utils/axios';

import { useGetSettings, updateSettings, uploadInterCertificates } from 'src/actions/settings';
import {
  desativarCertificado,
  uploadPortalCertificado,
  validarSenhaCertificado,
  getPortalCertificadoAtivo,
  validarArquivoCertificado,
  getPortalCertificadosCliente,
} from 'src/actions/certificados';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

import { CertificateList } from 'src/sections/configuracoes/CertificateList';
import { UploadCertificate } from 'src/sections/configuracoes/UploadCertificate';
import { ActiveCertificateCard } from 'src/sections/configuracoes/ActiveCertificadoCard';

import { useAuthContext } from 'src/auth/hooks';

const CertificateSchema = zod.object({
  password: zod
    .string()
    .min(1, 'Senha do certificado é obrigatória')
    .refine((val) => val.trim().length >= 4, 'Senha deve ter no mínimo 4 caracteres'),
  confirmPassword: zod.string().min(1, 'Confirmação da senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});


const SectionHeader = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, minWidth: 0 }}>
    <Box sx={{ flexShrink: 0, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
      <Iconify icon={icon} width={24} color="primary.main" />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>{title}</Typography>
  </Stack>
);

const InfoItem = ({ label, children }) => (
  <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
    <Typography variant="caption" color="text.secondary" component="p" sx={{ display: 'block', wordBreak: 'break-word' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }} component="span">
      {children}
    </Typography>
  </Box>
);

const NotificationSwitch = ({ checked, onChange, title, subheader, disabled }) => (
  <FormControlLabel
    disabled={disabled}
    control={<Switch checked={checked} onChange={onChange} />}
    label={
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{subheader}</Typography>
      </Box>
    }
    sx={{ m: 0, justifyContent: 'flex-start' }}
  />
);

// O Modal agora é um sub-componente aqui para facilitar
function CertificateUploadModal({ open, onClose, onSubmit, methods, fileName, isUploading }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:password-bold-duotone" />
            Confirmar Senha do Certificado
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Você está enviando o arquivo <strong>{fileName}</strong>. Por favor, digite a senha (PIN) do seu certificado para prosseguir.
              </Typography>
              <RHFTextField name="password" label="Senha do Certificado" type="password" />
              <RHFTextField name="confirmPassword" label="Confirme a Senha" type="password" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="inherit" variant="outlined">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isUploading}>
              {isUploading ? 'Enviando...' : 'Enviar Certificado'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}

export default function PortalClienteSettingsView() {
  const { user, empresa } = useAuthContext();
  const theme = useTheme();

  // TODA a sua lógica de estados e handlers que você já tinha
  const [notifications, setNotifications] = useState({ email: true, whatsapp: true });
  const [certificados, setCertificados] = useState([]);
  const [certificadoAtivo, setCertificadoAtivo] = useState(null);
  const [loadingCertificados, setLoadingCertificados] = useState(true);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [savingInterConfig, setSavingInterConfig] = useState(false);
  const [uploadingInterCertificates, setUploadingInterCertificates] = useState(false);
  const [interCrtFile, setInterCrtFile] = useState(null);
  const [interKeyFile, setInterKeyFile] = useState(null);
  const [interConfig, setInterConfig] = useState({
    environment: 'homologacao',
    environments: {
      homologacao: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        contaCorrente: '',
        boletoConfig: {
          instrucoes: { linha1: '' },
          multa: { codigo: 'PERCENTUAL', taxa: '' },
          mora: { codigo: 'TAXAMENSAL', taxa: '' },
        },
        certCrtPath: '',
        certKeyPath: '',
        certUpdatedAt: '',
      },
      producao: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        contaCorrente: '',
        boletoConfig: {
          instrucoes: { linha1: '' },
          multa: { codigo: 'PERCENTUAL', taxa: '' },
          mora: { codigo: 'TAXAMENSAL', taxa: '' },
        },
        certCrtPath: '',
        certKeyPath: '',
        certUpdatedAt: '',
      },
    },
  });

  const clienteId = empresa?.empresaAtiva || null;
  const { settings, refetchSettings } = useGetSettings(clienteId);

  const certificateMethods = useForm({
    resolver: zodResolver(CertificateSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { handleSubmit: handleCertificateSubmit } = certificateMethods;

  const fetchCertificados = useCallback(async () => {
    if (!empresa?.empresaAtiva) { setLoadingCertificados(false); return; }
    try {
      setLoadingCertificados(true);
      const [certificadosResponse, ativoResponse] = await Promise.all([
        getPortalCertificadosCliente(empresa.empresaAtiva),
        getPortalCertificadoAtivo(empresa.empresaAtiva),
      ]);
      if (certificadosResponse.data.success) setCertificados(certificadosResponse.data.data || []);
      else setCertificados([]);
      if (ativoResponse.data.success && ativoResponse.data.data) setCertificadoAtivo(ativoResponse.data.data);
      else setCertificadoAtivo(null);
    } catch (error) {
      setCertificados([]);
      setCertificadoAtivo(null);

      const apiMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        '';
      const statusCode = error?.response?.status || error?.status;
      const semCertificadoAtivo = apiMessage.includes('Nenhum certificado ativo encontrado para este cliente');
      const acessoNegadoCliente = apiMessage.includes('Acesso negado ao cliente informado');
      const semCorpoDeErro = !apiMessage && typeof error === 'object' && Object.keys(error || {}).length === 0;
      const erroEsperado = semCertificadoAtivo || acessoNegadoCliente || semCorpoDeErro;

      if (!erroEsperado) {
        if (statusCode === 403) toast.error('Sem permissão para consultar certificados deste cliente.');
        else toast.error('Erro ao carregar certificados');
      }
    } finally {
      setLoadingCertificados(false);
    }
  }, [empresa?.empresaAtiva]);

  useEffect(() => {
    if (empresa?.empresaAtiva) {
      const timer = setTimeout(() => { fetchCertificados(); }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [empresa?.empresaAtiva, fetchCertificados]);

  useEffect(() => {
    const cfg = settings?.interConfig;
    if (!cfg) return;
    const selectedEnvironment = cfg.environment || 'homologacao';
    const legacy = {
      enabled: Boolean(cfg.enabled),
      clientId: cfg.clientId || '',
      clientSecret: cfg.clientSecret || '',
      contaCorrente: cfg.contaCorrente || '',
      boletoConfig: {
        instrucoes: { linha1: cfg?.boletoConfig?.instrucoes?.linha1 || '' },
        multa: {
          codigo: cfg?.boletoConfig?.multa?.codigo || 'PERCENTUAL',
          taxa:
            cfg?.boletoConfig?.multa?.taxa === 0 || cfg?.boletoConfig?.multa?.taxa
              ? cfg?.boletoConfig?.multa?.taxa
              : '',
        },
        mora: {
          codigo: cfg?.boletoConfig?.mora?.codigo || 'TAXAMENSAL',
          taxa:
            cfg?.boletoConfig?.mora?.taxa === 0 || cfg?.boletoConfig?.mora?.taxa
              ? cfg?.boletoConfig?.mora?.taxa
              : '',
        },
      },
      certCrtPath: cfg?.crtPath || cfg?.certificadoCrtPath || '',
      certKeyPath: cfg?.keyPath || cfg?.certificadoKeyPath || '',
      certUpdatedAt: cfg?.certUpdatedAt || '',
    };
    const environments = cfg.environments || {};
    const hasPerEnvironment = Boolean(environments?.homologacao || environments?.producao);

    setInterConfig({
      environment: selectedEnvironment,
      environments: hasPerEnvironment
        ? {
            homologacao: {
              enabled: Boolean(environments?.homologacao?.enabled),
              clientId: environments?.homologacao?.clientId || '',
              clientSecret: environments?.homologacao?.clientSecret || '',
              contaCorrente: environments?.homologacao?.contaCorrente || '',
              boletoConfig: {
                instrucoes: {
                  linha1: environments?.homologacao?.boletoConfig?.instrucoes?.linha1 || '',
                },
                multa: {
                  codigo:
                    environments?.homologacao?.boletoConfig?.multa?.codigo || 'PERCENTUAL',
                  taxa:
                    environments?.homologacao?.boletoConfig?.multa?.taxa === 0 ||
                    environments?.homologacao?.boletoConfig?.multa?.taxa
                      ? environments?.homologacao?.boletoConfig?.multa?.taxa
                      : '',
                },
                mora: {
                  codigo:
                    environments?.homologacao?.boletoConfig?.mora?.codigo || 'TAXAMENSAL',
                  taxa:
                    environments?.homologacao?.boletoConfig?.mora?.taxa === 0 ||
                    environments?.homologacao?.boletoConfig?.mora?.taxa
                      ? environments?.homologacao?.boletoConfig?.mora?.taxa
                      : '',
                },
              },
              certCrtPath: environments?.homologacao?.certCrtPath || '',
              certKeyPath: environments?.homologacao?.certKeyPath || '',
              certUpdatedAt: environments?.homologacao?.certUpdatedAt || '',
            },
            producao: {
              enabled: Boolean(environments?.producao?.enabled),
              clientId: environments?.producao?.clientId || '',
              clientSecret: environments?.producao?.clientSecret || '',
              contaCorrente: environments?.producao?.contaCorrente || '',
              boletoConfig: {
                instrucoes: {
                  linha1: environments?.producao?.boletoConfig?.instrucoes?.linha1 || '',
                },
                multa: {
                  codigo: environments?.producao?.boletoConfig?.multa?.codigo || 'PERCENTUAL',
                  taxa:
                    environments?.producao?.boletoConfig?.multa?.taxa === 0 ||
                    environments?.producao?.boletoConfig?.multa?.taxa
                      ? environments?.producao?.boletoConfig?.multa?.taxa
                      : '',
                },
                mora: {
                  codigo: environments?.producao?.boletoConfig?.mora?.codigo || 'TAXAMENSAL',
                  taxa:
                    environments?.producao?.boletoConfig?.mora?.taxa === 0 ||
                    environments?.producao?.boletoConfig?.mora?.taxa
                      ? environments?.producao?.boletoConfig?.mora?.taxa
                      : '',
                },
              },
              certCrtPath: environments?.producao?.certCrtPath || '',
              certKeyPath: environments?.producao?.certKeyPath || '',
              certUpdatedAt: environments?.producao?.certUpdatedAt || '',
            },
          }
        : {
            homologacao:
              selectedEnvironment === 'homologacao'
                ? { ...legacy }
                : {
                    enabled: false,
                    clientId: '',
                    clientSecret: '',
                    contaCorrente: '',
                    boletoConfig: {
                      instrucoes: { linha1: '' },
                      multa: { codigo: 'PERCENTUAL', taxa: '' },
                      mora: { codigo: 'TAXAMENSAL', taxa: '' },
                    },
                    certCrtPath: '',
                    certKeyPath: '',
                    certUpdatedAt: '',
                  },
            producao:
              selectedEnvironment === 'producao'
                ? { ...legacy }
                : {
                    enabled: false,
                    clientId: '',
                    clientSecret: '',
                    contaCorrente: '',
                    boletoConfig: {
                      instrucoes: { linha1: '' },
                      multa: { codigo: 'PERCENTUAL', taxa: '' },
                      mora: { codigo: 'TAXAMENSAL', taxa: '' },
                    },
                    certCrtPath: '',
                    certKeyPath: '',
                    certUpdatedAt: '',
                  },
          },
    });
  }, [settings]);

  const handleNotificationChange = async (type, value) => {
    try {
      setNotifications(prev => ({ ...prev, [type]: value }));
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}users/cliente/notifications`, { [type]: value });
      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      toast.error('Ainda não é possível atualizar as notificações');
      setNotifications(prev => ({ ...prev, [type]: !value }));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validarArquivoCertificado(file);
      if (!validation.isValid) { toast.error(validation.error); return; }
      setCertificateFile(file);
      setCertificateDialogOpen(true);
    }
  };

  const handleCertificateUpload = handleCertificateSubmit(async (data) => {
    if (!empresa?.empresaAtiva) {
      toast.error('ID do cliente não disponível. Faça login novamente.');
      return;
    }
    const pwdValidation = validarSenhaCertificado(data.password);
    if (!pwdValidation.isValid) {
      toast.error(pwdValidation.error);
      return;
    }
    try {
      setUploadingCertificate(true);
      const response = await uploadPortalCertificado(
        empresa.empresaAtiva,
        certificateFile,
        data.password.trim()
      );
      const resData = response.data;
      if (resData.success) {
        toast.success(resData.message || 'Certificado digital enviado com sucesso!');
        setCertificateDialogOpen(false);
        setCertificateFile(null);
        certificateMethods.reset();
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
          toast.error('Senha incorreta. Verifique a senha do certificado e tente novamente.');
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message || 'Erro ao enviar certificado digital';
      if (status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (status === 403) {
        toast.error('Você não tem permissão para enviar certificado.');
      } else if (status === 404) {
        toast.error(msg || 'Cliente não encontrado.');
      } else if (msg.toLowerCase().includes('senha') && (msg.includes('incorreta') || msg.includes('inválida'))) {
        toast.error('Senha incorreta. Verifique a senha do certificado e tente novamente.');
      } else {
        toast.error(msg);
      }
    } finally {
      setUploadingCertificate(false);
    }
  });

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
      console.error('Erro ao desativar certificado:', error);
      toast.error(error.response?.data?.message || 'Erro ao desativar certificado');
    }
  };

  const inativos = certificados.filter((c) => {
    const certId = c?.id || c?._id;
    const ativoId = certificadoAtivo?.id || certificadoAtivo?._id;
    return certId && ativoId ? certId !== ativoId : true;
  });

  const getHttpErrorMessage = (error, fallback) => {
    const statusCode = error?.status || error?.response?.status;
    const apiMessage = error?.message || error?.response?.data?.message;
    if (apiMessage) return apiMessage;
    if (statusCode === 400) return 'Dados inválidos para esta operação.';
    if (statusCode === 401) return 'Sessão expirada. Faça login novamente.';
    if (statusCode === 403) return 'Você não tem permissão para esta ação.';
    if (statusCode === 404) return 'Recurso não encontrado.';
    if (statusCode >= 500) return 'Falha interna ao processar a solicitação.';
    return fallback;
  };

  const currentInterEnvironment = interConfig.environment || 'homologacao';
  const currentInterEnvConfig = interConfig.environments?.[currentInterEnvironment] || {};
  const interCertificatesMeta = {
    crtUploaded: Boolean(currentInterEnvConfig?.certCrtPath),
    keyUploaded: Boolean(currentInterEnvConfig?.certKeyPath),
    certUpdatedAt: currentInterEnvConfig?.certUpdatedAt || '',
  };

  const interBasicsReady = Boolean(
    currentInterEnvConfig?.clientId?.trim() &&
      currentInterEnvConfig?.clientSecret?.trim() &&
      currentInterEnvConfig?.contaCorrente?.trim()
  );

  const interCertificatesReady = Boolean(
    interCertificatesMeta.crtUploaded && interCertificatesMeta.keyUploaded
  );

  const updateInterEnvironmentField = useCallback((field, value) => {
    setInterConfig((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [prev.environment]: {
          ...prev.environments?.[prev.environment],
          [field]: value,
        },
      },
    }));
  }, []);

  const updateInterBoletoField = useCallback((section, field, value) => {
    setInterConfig((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [prev.environment]: {
          ...prev.environments?.[prev.environment],
          boletoConfig: {
            ...prev.environments?.[prev.environment]?.boletoConfig,
            [section]: {
              ...prev.environments?.[prev.environment]?.boletoConfig?.[section],
              [field]: value,
            },
          },
        },
      },
    }));
  }, []);

  const handleSaveInterBasics = async () => {
    if (!clienteId) {
      toast.error('Empresa ativa não encontrada.');
      return;
    }
    try {
      if (!currentInterEnvConfig?.clientId?.trim()) {
        toast.error('Client ID é obrigatório.');
        return;
      }
      if (!currentInterEnvConfig?.clientSecret?.trim()) {
        toast.error('Client Secret é obrigatório.');
        return;
      }
      if (!currentInterEnvConfig?.contaCorrente?.trim()) {
        toast.error('Conta corrente é obrigatória.');
        return;
      }

      setSavingInterConfig(true);
      await updateSettings(clienteId, {
        interConfig: {
          environment: interConfig.environment,
          environments: {
            [interConfig.environment]: {
              enabled: Boolean(currentInterEnvConfig?.enabled),
              clientId: currentInterEnvConfig?.clientId?.trim(),
              clientSecret: currentInterEnvConfig?.clientSecret,
              contaCorrente: currentInterEnvConfig?.contaCorrente?.trim(),
              boletoConfig: {
                instrucoes: {
                  linha1: currentInterEnvConfig?.boletoConfig?.instrucoes?.linha1 || '',
                },
                multa: {
                  codigo:
                    currentInterEnvConfig?.boletoConfig?.multa?.codigo || 'PERCENTUAL',
                  taxa:
                    currentInterEnvConfig?.boletoConfig?.multa?.taxa === '' ||
                    currentInterEnvConfig?.boletoConfig?.multa?.taxa === null ||
                    typeof currentInterEnvConfig?.boletoConfig?.multa?.taxa === 'undefined'
                      ? undefined
                      : Number(currentInterEnvConfig?.boletoConfig?.multa?.taxa),
                },
                mora: {
                  codigo:
                    currentInterEnvConfig?.boletoConfig?.mora?.codigo || 'TAXAMENSAL',
                  taxa:
                    currentInterEnvConfig?.boletoConfig?.mora?.taxa === '' ||
                    currentInterEnvConfig?.boletoConfig?.mora?.taxa === null ||
                    typeof currentInterEnvConfig?.boletoConfig?.mora?.taxa === 'undefined'
                      ? undefined
                      : Number(currentInterEnvConfig?.boletoConfig?.mora?.taxa),
                },
              },
            },
          },
        },
      });
      toast.success(`Dados de ${interConfig.environment} salvos com sucesso.`);
      await refetchSettings();
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'Erro ao salvar dados básicos do Inter.'));
    } finally {
      setSavingInterConfig(false);
    }
  };

  const handleUploadInterCertificates = async () => {
    if (!clienteId) {
      toast.error('Empresa ativa não encontrada.');
      return;
    }
    if (!interCrtFile) {
      toast.error('Selecione o arquivo .crt.');
      return;
    }
    if (!interKeyFile) {
      toast.error('Selecione o arquivo .key.');
      return;
    }

    try {
      setUploadingInterCertificates(true);
      await uploadInterCertificates(
        clienteId,
        interConfig.environment,
        interCrtFile,
        interKeyFile
      );
      toast.success(`Certificados de ${interConfig.environment} enviados com sucesso.`);
      setInterCrtFile(null);
      setInterKeyFile(null);
      await refetchSettings();
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'Erro ao enviar certificados Inter.'));
    } finally {
      setUploadingInterCertificates(false);
    }
  };

  const handleToggleInterEnabled = async (nextEnabled) => {
    if (!clienteId) {
      toast.error('Empresa ativa não encontrada.');
      return;
    }
    if (nextEnabled && !interBasicsReady) {
      toast.error('Preencha clientId, clientSecret e contaCorrente antes de ativar.');
      return;
    }
    if (nextEnabled && !interCertificatesReady) {
      toast.error(`Envie os certificados .crt e .key de ${interConfig.environment} antes de ativar.`);
      return;
    }
    try {
      setSavingInterConfig(true);
      await updateSettings(clienteId, {
        interConfig: {
          environment: interConfig.environment,
          environments: {
            [interConfig.environment]: {
              enabled: nextEnabled,
            },
          },
        },
      });
      toast.success(
        nextEnabled
          ? `Ambiente ${interConfig.environment} ativado com sucesso.`
          : `Ambiente ${interConfig.environment} desativado.`
      );
      await refetchSettings();
    } catch (error) {
      toast.error(getHttpErrorMessage(error, 'Erro ao atualizar status do ambiente Inter.'));
    } finally {
      setSavingInterConfig(false);
    }
  };

  return (
    <>
      <LazyMotion features={domAnimation}>
        <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Cabeçalho da página - dentro do fluxo para não sobrepor */}
              <Box
                sx={{
                  p: { xs: 2.5, md: 4 },
                  pb: { xs: 2, md: 3 },
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                  borderBottom: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                  Configurações
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, wordBreak: 'break-word' }}>
                  Gerencie suas preferências e segurança da conta.
                </Typography>
              </Box>

              {/* Conteúdo principal */}
              <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Grid container spacing={2} sx={{ mb: 3, '& > *': { p: 2, mb: 2 } }}>
                  {/* Card Minha Conta */}
                  <Grid xs={12} md={6} sx={{ minWidth: 0 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        height: '100%',
                        minWidth: 0,
                        overflow: 'hidden',
                        borderRadius: 2,
                      }}
                    >
                      <SectionHeader icon="solar:user-circle-bold-duotone" title="Minha Conta" />
                      <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                        <InfoItem label="Tipo de Usuário">Cliente</InfoItem>
                        <InfoItem label="Status da Conta">
                          <Typography component="span" variant="body2" sx={{ fontWeight: 500, color: user?.status ? 'success.main' : 'error.main' }}>
                            {user?.status ? 'Ativa' : 'Inativa'}
                          </Typography>
                        </InfoItem>
                        <InfoItem label="Data de Criação">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</InfoItem>
                        <InfoItem label="Último Acesso">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : '-'}</InfoItem>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Card Notificações */}
                  <Grid xs={12} md={6} sx={{ minWidth: 0 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        height: '100%',
                        minWidth: 0,
                        overflow: 'hidden',
                        borderRadius: 2,
                      }}
                    >
                      <SectionHeader icon="solar:bell-bing-bold-duotone" title="Notificações" />
                      <Stack spacing={1} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                        <NotificationSwitch disabled checked={notifications.email} onChange={(e) => handleNotificationChange('email', e.target.checked)} title="Notificações por Email" subheader="Receba avisos sobre faturas e documentos." />
                        <NotificationSwitch disabled checked={notifications.whatsapp} onChange={(e) => handleNotificationChange('whatsapp', e.target.checked)} title="Notificações por Whatsapp" subheader="Receba alertas importantes no seu celular." />
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                {/* Card Certificado Digital (legado do cliente) */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, md: 3 },
                    minWidth: 0,
                    overflow: 'hidden',
                    borderRadius: 2,
                  }}
                >
                  <SectionHeader icon="line-md:upload-loop" title="Certificado Digital do Cliente" />
                  {loadingCertificados ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="text" width="30%" sx={{ fontSize: '1rem' }} />
                      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    </Stack>
                  ) : (
                    <>
                      {certificadoAtivo ? (
                        <Stack spacing={2}>
                          <ActiveCertificateCard
                            certificado={certificadoAtivo}
                            onDesativar={handleDesativarCertificado}
                            showDownload={false}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Reenviar certificado
                            </Typography>
                            <UploadCertificate onFileSelect={handleFileSelect} />
                          </Box>
                        </Stack>
                      ) : (
                        <UploadCertificate onFileSelect={handleFileSelect} />
                      )}
                      <CertificateList certificados={inativos} showDownload={false} />
                    </>
                  )}
                </Paper>

                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 3, md: 4 },
                    minWidth: 0,
                    overflow: 'hidden',
                    borderRadius: 2,
                  }}
                >
                  <SectionHeader icon="solar:buildings-3-bold-duotone" title="Certificados e Configuração Banco Inter" />
                  <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        Fluxo recomendado: 1) Salvar credenciais do ambiente, 2) Enviar certificados,
                        3) Ativar o ambiente no toggle acima.
                      </Typography>
                    </Alert>

                    <Stack spacing={3.5}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          borderRadius: 2,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                        }}
                      >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={Boolean(currentInterEnvConfig?.enabled)}
                                onChange={(e) => handleToggleInterEnabled(e.target.checked)}
                                disabled={savingInterConfig || uploadingInterCertificates}
                              />
                            }
                            label={`Ativar ambiente ${interConfig.environment}`}
                            sx={{ m: 0 }}
                          />
                          <TextField
                            select
                            size="small"
                            label="Ambiente"
                            value={interConfig.environment}
                            onChange={(e) =>
                              setInterConfig((prev) => ({ ...prev, environment: e.target.value }))
                            }
                            sx={{ width: { xs: '100%', md: 220 } }}
                          >
                            <MenuItem value="homologacao">Homologação</MenuItem>
                            <MenuItem value="producao">Produção</MenuItem>
                          </TextField>
                        </Stack>
                      </Paper>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: { xs: 2.5, md: 3 },
                        }}
                      >
                        <Box>
                          <TextField
                            fullWidth
                            label="Client ID"
                            value={currentInterEnvConfig?.clientId || ''}
                            onChange={(e) => updateInterEnvironmentField('clientId', e.target.value)}
                            placeholder="Informe o Client ID do Inter"
                          />
                        </Box>
                        <Box>
                          <TextField
                            fullWidth
                            label="Client Secret"
                            type="password"
                            value={currentInterEnvConfig?.clientSecret || ''}
                            onChange={(e) => updateInterEnvironmentField('clientSecret', e.target.value)}
                            placeholder="Informe o Client Secret do Inter"
                          />
                        </Box>
                        <Box sx={{ gridColumn: { xs: 'auto', md: '1 / 2' } }}>
                          <TextField
                            fullWidth
                            label="Conta Corrente"
                            value={currentInterEnvConfig?.contaCorrente || ''}
                            onChange={(e) => updateInterEnvironmentField('contaCorrente', e.target.value)}
                            placeholder="Ex.: 123456-7"
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          border: (t) => `1px dashed ${alpha(t.palette.warning.main, 0.35)}`,
                          bgcolor: (t) => alpha(t.palette.warning.main, 0.03),
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                          Configuração de boleto ({interConfig.environment})
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                            gap: 2,
                          }}
                        >
                          <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
                            <TextField
                              fullWidth
                              label="Instrução (linha 1)"
                              value={currentInterEnvConfig?.boletoConfig?.instrucoes?.linha1 || ''}
                              onChange={(e) =>
                                updateInterBoletoField('instrucoes', 'linha1', e.target.value)
                              }
                            />
                          </Box>
                          <TextField
                            select
                            fullWidth
                            label="Multa - código"
                            value={currentInterEnvConfig?.boletoConfig?.multa?.codigo || 'PERCENTUAL'}
                            onChange={(e) =>
                              updateInterBoletoField('multa', 'codigo', e.target.value)
                            }
                          >
                            <MenuItem value="PERCENTUAL">PERCENTUAL</MenuItem>
                            <MenuItem value="VALORFIXO">VALORFIXO</MenuItem>
                            <MenuItem value="NAOTEMMULTA">NAOTEMMULTA</MenuItem>
                          </TextField>
                          <TextField
                            fullWidth
                            type="number"
                            label="Multa - taxa"
                            value={currentInterEnvConfig?.boletoConfig?.multa?.taxa ?? ''}
                            onChange={(e) => updateInterBoletoField('multa', 'taxa', e.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                          />
                          <TextField
                            select
                            fullWidth
                            label="Mora - código"
                            value={currentInterEnvConfig?.boletoConfig?.mora?.codigo || 'TAXAMENSAL'}
                            onChange={(e) =>
                              updateInterBoletoField('mora', 'codigo', e.target.value)
                            }
                          >
                            <MenuItem value="TAXAMENSAL">TAXAMENSAL</MenuItem>
                            <MenuItem value="ISENTO">ISENTO</MenuItem>
                          </TextField>
                          <TextField
                            fullWidth
                            type="number"
                            label="Mora - taxa"
                            value={currentInterEnvConfig?.boletoConfig?.mora?.taxa ?? ''}
                            onChange={(e) => updateInterBoletoField('mora', 'taxa', e.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          border: (t) => `1px dashed ${alpha(t.palette.info.main, 0.35)}`,
                          bgcolor: (t) => alpha(t.palette.info.main, 0.02),
                        }}
                      >
                        <Box
                          sx={{
                            mb: 2.5,
                            pb: 1.5,
                            borderBottom: (t) => `1px solid ${t.palette.divider}`,
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Upload de Certificados da API Inter
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Envie os dois arquivos para concluir a etapa de certificados.
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ '& > *': { p: 2.5 } }}>
                          <Grid xs={12} md={6}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Certificado `.crt`
                              </Typography>
                              <input
                                id="upload-inter-crt"
                                type="file"
                                accept=".crt"
                                hidden
                                onChange={(e) => setInterCrtFile(e.target.files?.[0] || null)}
                              />
                              <Button
                                variant="outlined"
                                startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                                onClick={() => document.getElementById('upload-inter-crt')?.click()}
                                sx={{ alignSelf: 'flex-start' }}
                              >
                                Selecionar arquivo .crt
                              </Button>
                              {!!interCrtFile && (
                                <Typography variant="caption" color="text.primary">
                                  Arquivo selecionado: {interCrtFile.name}
                                </Typography>
                              )}
                              <Alert
                                severity={interCertificatesMeta.crtUploaded ? 'success' : 'warning'}
                                sx={{ py: 0.5 }}
                              >
                                <Typography variant="caption">
                                  {interCertificatesMeta.crtUploaded
                                    ? 'Certificado .crt já enviado'
                                    : 'Certificado .crt ainda não enviado'}
                                </Typography>
                              </Alert>
                            </Paper>
                          </Grid>
                          <Grid xs={12} md={6}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Chave `.key`
                              </Typography>
                              <input
                                id="upload-inter-key"
                                type="file"
                                accept=".key"
                                hidden
                                onChange={(e) => setInterKeyFile(e.target.files?.[0] || null)}
                              />
                              <Button
                                variant="outlined"
                                startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                                onClick={() => document.getElementById('upload-inter-key')?.click()}
                                sx={{ alignSelf: 'flex-start' }}
                              >
                                Selecionar arquivo .key
                              </Button>
                              {!!interKeyFile && (
                                <Typography variant="caption" color="text.primary">
                                  Arquivo selecionado: {interKeyFile.name}
                                </Typography>
                              )}
                              <Alert
                                severity={interCertificatesMeta.keyUploaded ? 'success' : 'warning'}
                                sx={{ py: 0.5 }}
                              >
                                <Typography variant="caption">
                                  {interCertificatesMeta.keyUploaded
                                    ? 'Certificado .key já enviado'
                                    : 'Certificado .key ainda não enviado'}
                                </Typography>
                              </Alert>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>

                      <Alert severity={interCertificatesReady ? 'success' : 'info'}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {interCertificatesReady
                            ? `Certificados prontos no ambiente ${interConfig.environment}`
                            : `Ambiente ${interConfig.environment} aguardando certificados`}
                        </Typography>
                        {interCertificatesMeta.certUpdatedAt && (
                          <Typography variant="caption" display="block">
                            Certificados atualizados em: {new Date(interCertificatesMeta.certUpdatedAt).toLocaleString('pt-BR')}
                          </Typography>
                        )}
                      </Alert>

                      <Stack
                        direction="row"
                        spacing={1.5}
                        flexWrap="wrap"
                        justifyContent="flex-end"
                        useFlexGap
                      >
                        <Button variant="outlined" onClick={handleSaveInterBasics} disabled={savingInterConfig}>
                          1. Salvar credenciais ({interConfig.environment})
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleUploadInterCertificates}
                          disabled={uploadingInterCertificates || !interCrtFile || !interKeyFile}
                        >
                          {uploadingInterCertificates
                            ? 'Enviando certificados...'
                            : interCertificatesReady
                              ? '2. Atualizar certificados'
                              : '2. Enviar certificados .crt/.key'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </m.div>
      </LazyMotion>

      <CertificateUploadModal
        open={certificateDialogOpen}
        onClose={() => {
          setCertificateDialogOpen(false);
          setCertificateFile(null);
          certificateMethods.reset();
        }}
        onSubmit={handleCertificateUpload}
        methods={certificateMethods}
        fileName={certificateFile?.name}
        isUploading={uploadingCertificate}
      />
    </>
  );
}
