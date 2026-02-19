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
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axios from 'src/utils/axios';

import {
  uploadCertificado,
  getCertificadoAtivo,
  desativarCertificado,
  getCertificadosCliente,
  validarSenhaCertificado,
  validarArquivoCertificado,
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

const NotificationSwitch = ({ checked, onChange, title, subheader }) => (
    <FormControlLabel
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
  const [notifications, setNotifications] = useState({ email: true, whatsapp: true, push: false });
  const [certificados, setCertificados] = useState([]);
  const [certificadoAtivo, setCertificadoAtivo] = useState(null);
  const [loadingCertificados, setLoadingCertificados] = useState(true);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  const certificateMethods = useForm({
    resolver: zodResolver(CertificateSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { handleSubmit: handleCertificateSubmit } = certificateMethods;

  const fetchCertificados = useCallback(async () => {
    if (!empresa?.empresaAtiva) { setLoadingCertificados(false); return; }
    try {
      setLoadingCertificados(true);
      const [certificadosResponse, ativoResponse] = await Promise.all([ getCertificadosCliente(empresa.empresaAtiva), getCertificadoAtivo(empresa.empresaAtiva) ]);
      if (certificadosResponse.data.success) setCertificados(certificadosResponse.data.data || []);
      else setCertificados([]);
      if (ativoResponse.data.success && ativoResponse.data.data) setCertificadoAtivo(ativoResponse.data.data);
      else setCertificadoAtivo(null);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      if (!error.response?.data?.message?.includes('Nenhum certificado ativo encontrado para este cliente')) {
        toast.error('Erro ao carregar certificados');
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

  const handleNotificationChange = async (type, value) => {
    try {
      setNotifications(prev => ({ ...prev, [type]: value }));
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}users/cliente/notifications`, { [type]: value });
      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      toast.error('Erro ao atualizar notificações');
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
      const response = await uploadCertificado(
        certificateFile,
        data.password.trim(),
        empresa.empresaAtiva
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

  const inativos = certificados.filter(c => c._id !== certificadoAtivo?._id);

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
                <Grid container spacing={3}>
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
                      <Stack spacing={0} divider={<Divider />}>
                        <NotificationSwitch checked={notifications.email} onChange={(e) => handleNotificationChange('email', e.target.checked)} title="Notificações por Email" subheader="Receba avisos sobre faturas e documentos." />
                        <NotificationSwitch checked={notifications.whatsapp} onChange={(e) => handleNotificationChange('whatsapp', e.target.checked)} title="Notificações por Whatsapp" subheader="Receba alertas importantes no seu celular." />
                        <NotificationSwitch checked={notifications.push} onChange={(e) => handleNotificationChange('push', e.target.checked)} title="Notificações Push" subheader="Receba notificações no navegador." />
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                {/* Card Certificado Digital */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    minWidth: 0,
                    overflow: 'hidden',
                    borderRadius: 2,
                  }}
                >
                  <SectionHeader icon="line-md:upload-loop" title="Certificado Digital" />
                  {loadingCertificados ? (
                    <Stack spacing={2}>
                      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="text" width="30%" sx={{ fontSize: '1rem' }} />
                      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    </Stack>
                  ) : (
                    <>
                      {certificadoAtivo ? (
                        <ActiveCertificateCard
                          certificado={certificadoAtivo}
                          onDesativar={handleDesativarCertificado}
                          showDownload={false}
                        />
                      ) : (
                        <UploadCertificate onFileSelect={handleFileSelect} />
                      )}
                      <CertificateList certificados={inativos} showDownload={false} />
                    </>
                  )}
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </m.div>
      </LazyMotion>

      <CertificateUploadModal
        open={certificateDialogOpen}
        onClose={() => setCertificateDialogOpen(false)}
        onSubmit={handleCertificateUpload}
        methods={certificateMethods}
        fileName={certificateFile?.name}
        isUploading={uploadingCertificate}
      />
    </>
  );
}
