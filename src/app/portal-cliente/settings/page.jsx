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

import { uploadCertificado, downloadCertificado, getCertificadoAtivo, desativarCertificado, getCertificadosCliente, validarArquivoCertificado } from 'src/actions/certificados';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

import { CertificateList } from 'src/sections/configuracoes/CertificateList';
import { UploadCertificate } from 'src/sections/configuracoes/UploadCertificate';
import { ActiveCertificateCard } from 'src/sections/configuracoes/ActiveCertificadoCard';

import { useAuthContext } from 'src/auth/hooks';

const CertificateSchema = zod.object({
  password: zod.string().min(1, 'Senha do certificado é obrigatória'),
  confirmPassword: zod.string().min(1, 'Confirmação da senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});


const SectionHeader = ({ icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
        <Iconify icon={icon} width={24} color="primary.main" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
    </Stack>
);

const InfoItem = ({ label, children }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" component="p">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>{children}</Typography>
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
    try {
      setUploadingCertificate(true);
      const response = await uploadCertificado(certificateFile, data.password, empresa.empresaAtiva);
      if (response.data.success) {
        toast.success('Certificado digital enviado com sucesso!');
        setCertificateDialogOpen(false);
        setCertificateFile(null);
        certificateMethods.reset();
        await fetchCertificados();
      } else if (response.data.message?.includes('Senha do certificado inválida')) {
        toast.error('❌ Senha incorreta! Verifique a senha do certificado e tente novamente.');
      } else {
        toast.error(response.data.message || 'Erro ao enviar certificado');
      }
    } catch (error) {
      console.error('Erro ao enviar certificado:', error);
      if (error.response?.data?.message?.includes('Senha do certificado inválida')) {
        toast.error('❌ Senha incorreta! Verifique a senha do certificado e tente novamente.');
      } else {
        toast.error(error.response?.data?.message || 'Erro ao enviar certificado digital');
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
      console.error('Erro ao fazer download do certificado:', error);
      toast.error('Erro ao fazer download do certificado');
    }
  };
  
  const inativos = certificados.filter(c => c._id !== certificadoAtivo?._id);

  return (
    <>
      <LazyMotion features={domAnimation}>
        <m.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ p: 4, bgcolor: 'background.neutral', borderRadius: '16px 16px 0 0', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Configurações</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Gerencie suas preferências e segurança da conta.</Typography>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Grid container spacing={5}>
                <Grid xs={12} md={6}>
                  <SectionHeader icon="solar:user-circle-bold-duotone" title="Minha Conta" />
                  <Stack spacing={2}>
                    <InfoItem label="Tipo de Usuário">Cliente</InfoItem>
                    <InfoItem label="Status da Conta"><Typography component="span" variant="inherit" color={user?.status ? 'success.main' : 'error.main'}>{user?.status ? 'Ativa' : 'Inativa'}</Typography></InfoItem>
                    <InfoItem label="Data de Criação">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</InfoItem>
                    <InfoItem label="Último Acesso">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : '-'}</InfoItem>
                  </Stack>
                </Grid>

                <Grid xs={12} md={6}>
                  <SectionHeader icon="solar:bell-bing-bold-duotone" title="Notificações" />
                  <Stack spacing={2} divider={<Divider />}>
                    <NotificationSwitch checked={notifications.email} onChange={(e) => handleNotificationChange('email', e.target.checked)} title="Notificações por Email" subheader="Receba avisos sobre faturas e documentos." />
                    <NotificationSwitch checked={notifications.whatsapp} onChange={(e) => handleNotificationChange('whatsapp', e.target.checked)} title="Notificações por Whatsapp" subheader="Receba alertas importantes no seu celular." />
                    <NotificationSwitch checked={notifications.push} onChange={(e) => handleNotificationChange('push', e.target.checked)} title="Notificações Push" subheader="Receba notificações no navegador." />
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

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
                    <ActiveCertificateCard certificado={certificadoAtivo} onDesativar={handleDesativarCertificado} onDownload={handleDownloadCertificado} />
                  ) : (
                    <UploadCertificate onFileSelect={handleFileSelect} />
                  )}
                  <CertificateList certificados={inativos} onDownload={handleDownloadCertificado} />
                </>
              )}
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
