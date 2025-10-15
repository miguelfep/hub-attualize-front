'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import axios from 'src/utils/axios';

import { 
  uploadCertificado, 
  getCertificadoAtivo, 
  downloadCertificado, 
  desativarCertificado,
  getCertificadosCliente,
  formatarDataCertificado,
  getCorStatusCertificado,
  validarArquivoCertificado,
  getIconeStatusCertificado
} from 'src/actions/certificados';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const CertificateSchema = zod.object({
  password: zod.string().min(1, 'Senha do certificado é obrigatória'),
  confirmPassword: zod.string().min(1, 'Confirmação da senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

// ----------------------------------------------------------------------

export default function PortalClienteSettingsView() {
  const { user, empresa } = useAuthContext();

  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    push: false,
  });
  
  // Estados para certificado digital
  const [certificados, setCertificados] = useState([]);
  const [certificadoAtivo, setCertificadoAtivo] = useState(null);
  const [loadingCertificados, setLoadingCertificados] = useState(true);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Formulário para certificado digital
  const certificateMethods = useForm({
    resolver: zodResolver(CertificateSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit: handleCertificateSubmit,
    formState: { isSubmitting: isCertificateSubmitting },
  } = certificateMethods;

  const fetchCertificados = useCallback(async () => {
    // Verificar se a empresa está disponível
    if (!empresa?.empresaAtiva) {
      console.warn('Empresa não disponível para carregar certificados');
      setLoadingCertificados(false);
      return;
    }

    try {
      setLoadingCertificados(true);
      console.log('Tentando carregar certificados para empresa:', empresa.empresaAtiva);
      
      const [certificadosResponse, ativoResponse] = await Promise.all([
        getCertificadosCliente(empresa.empresaAtiva),
        getCertificadoAtivo(empresa.empresaAtiva)
      ]);
      
      console.log('Respostas recebidas:', { certificadosResponse, ativoResponse });
      
      // Tratar resposta da lista de certificados
      if (certificadosResponse.data.success) {
        setCertificados(certificadosResponse.data.data || []);
      } else {
        // Se não há certificados, é um estado normal, não mostrar erro
        setCertificados([]);
      }
      
      // Tratar resposta do certificado ativo
      if (ativoResponse.data.success && ativoResponse.data.data) {
        setCertificadoAtivo(ativoResponse.data.data);
      } else {
        // Se não há certificado ativo, é um estado normal, não mostrar erro
        setCertificadoAtivo(null);
      }
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      
      // Verificar se é erro de "nenhum certificado encontrado" (estado normal)
      if (error.response?.data?.message && 
          error.response.data.message.includes('Nenhum certificado ativo encontrado para este cliente')) {
        // Não mostrar toast para este caso, é um estado normal
        setCertificados([]);
        setCertificadoAtivo(null);
      } else {
        // Mostrar toast apenas para erros reais
        toast.error('Erro ao carregar certificados');
      }
    } finally {
      setLoadingCertificados(false);
    }
  }, [empresa?.empresaAtiva]);

  // Carregar certificados ao montar o componente
  useEffect(() => {
    if (empresa?.empresaAtiva) {
      // Adicionar um pequeno delay para garantir que tudo esteja carregado
      const timer = setTimeout(() => {
        fetchCertificados();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [empresa?.empresaAtiva, fetchCertificados]);

 
  const handleNotificationChange = async (type, value) => {
    try {
      setNotifications(prev => ({ ...prev, [type]: value }));

      const url = `${process.env.NEXT_PUBLIC_API_URL}users/cliente/notifications`;
      
      await axios.put(url, {
        [type]: value,
      });

      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      toast.error('Erro ao atualizar notificações');
      // Reverte a mudança em caso de erro
      setNotifications(prev => ({ ...prev, [type]: !value }));
    }
  };

  // Funções para certificado digital
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validarArquivoCertificado(file);
      
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      setCertificateFile(file);
      setCertificateDialogOpen(true);
    }
  };

  const handleCertificateUpload = handleCertificateSubmit(async (data) => {
    try {
      setUploadingCertificate(true);
      
      const response = await uploadCertificado(
        certificateFile, 
        data.password, 
        empresa.empresaAtiva
      );
      
      if (response.data.success) {
        toast.success('Certificado digital enviado com sucesso!');
        setCertificateDialogOpen(false);
        setCertificateFile(null);
        certificateMethods.reset();
        
        // Recarregar lista de certificados
        await fetchCertificados();
      } else if (response.data.message && response.data.message.includes('Senha do certificado inválida')) {
        // Tratamento específico para senha incorreta
        toast.error('❌ Senha incorreta! Verifique a senha do certificado e tente novamente.');
      } else {
        toast.error(response.data.message || 'Erro ao enviar certificado');
      }
    } catch (error) {
      console.error('Erro ao enviar certificado:', error);
      
      // Verificar se é erro de senha inválida
      if (error.response?.data?.message && error.response.data.message.includes('Senha do certificado inválida')) {
        toast.error('❌ Senha incorreta! Verifique a senha do certificado e tente novamente.');
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao enviar certificado digital';
        toast.error(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Erro ao desativar certificado';
      toast.error(errorMessage);
    }
  };

  const handleDownloadCertificado = async (certificadoId, fileName) => {
    try {
      const response = await downloadCertificado(certificadoId);
      
      // Criar URL do blob e fazer download
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


  return (
    <>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        sx={{ mb: { xs: 3, sm: 5 } }}
      >
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Configurações
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Informações da Conta" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tipo de Usuário
                    </Typography>
                    <Typography variant="body1">
                      Cliente
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Status da Conta
                    </Typography>
                    <Typography variant="body1" color={user?.status === true ? 'success.main' : 'error.main'}>
                      {user?.status === true ? 'Ativa' : 'Inativa'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Data de Criação
                    </Typography>
                    <Typography variant="body1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Último Acesso
                    </Typography>
                    <Typography variant="body1">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : '-'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Notificações" />
            <CardContent>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">Notificações por Email</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Receber notificações sobre faturas, contratos e documentos
                      </Typography>
                    </Stack>
                  }
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.whatsapp}
                      onChange={(e) => handleNotificationChange('whatsapp', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">Notificações por Whatsapp</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Receber notificações importantes por Whatsapp
                      </Typography>
                    </Stack>
                  }
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">Notificações Push</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Receber notificações no navegador
                      </Typography>
                    </Stack>
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Certificados Digitais" 
              action={
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:cloud-upload-outline" />}
                  onClick={() => {
                    const input = document.getElementById('certificate-upload');
                    input?.click();
                  }}
                >
                  Novo Certificado
                </Button>
              }
            />
            <CardContent>
              <input
                type="file"
                accept=".p12,.pfx,.cer,.crt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="certificate-upload"
              />
              
              {loadingCertificados ? (
                <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                  <Iconify icon="eos-icons:loading" width={32} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando certificados...
                  </Typography>
                </Stack>
              ) : certificados.length === 0 ? (
                <Stack spacing={3}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Nenhum certificado digital configurado</strong>
                    </Typography>
                    <Typography variant="caption">
                      Faça upload do seu certificado digital (.p12, .pfx, .cer ou .crt) para facilitar 
                      a assinatura de documentos e acesso a serviços governamentais.
                    </Typography>
                  </Alert>
                  
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <Iconify icon="solar:shield-check-bold" width={48} sx={{ color: 'primary.main' }} />
                      <Typography variant="h6">Enviar Certificado Digital</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Selecione um arquivo .p12, .pfx, .cer ou .crt válido (máx. 5MB)
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={3}>
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
                          <TableRow key={certificado._id}>
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
                              <Typography variant="body2">
                                {formatarDataCertificado(certificado.validTo)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={certificado.status}
                                color={getCorStatusCertificado(certificado.status)}
                                size="small"
                                startIcon={<Iconify icon={getIconeStatusCertificado(certificado.status)} />}
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
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadCertificado(certificado.id, certificado.nome)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <Iconify icon="solar:download-bold" />
                                  </IconButton>
                                </Tooltip>
                                
                                {certificado.status === 'ativo' && (
                                  <Tooltip title="Desativar certificado">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDesativarCertificado(certificado.id)}
                                      sx={{ color: 'error.main' }}
                                    >
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
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para senha do certificado */}
      <Dialog
        open={certificateDialogOpen}
        onClose={() => setCertificateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:shield-check-bold" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Configurar Certificado Digital</Typography>
          </Stack>
        </DialogTitle>
        
        <Form methods={certificateMethods} onSubmit={handleCertificateUpload}>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Arquivo selecionado:</strong> {certificateFile?.name}
                </Typography>
                <Typography variant="caption">
                  Digite a senha do certificado digital para continuar. 
                  {certificateFile?.name?.toLowerCase().includes('.cer') || certificateFile?.name?.toLowerCase().includes('.crt') 
                    ? ' Nota: Certificados .cer/.crt podem não precisar de senha.' 
                    : ''
                  }
                </Typography>
              </Alert>
              
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>⚠️ Dica:</strong> Se a senha estiver incorreta, você receberá uma mensagem de erro específica. 
                  Certifique-se de usar a senha correta do certificado digital.
                </Typography>
              </Alert>
              
              <Field.Text
                name="password"
                label="Senha do Certificado"
                type="password"
                fullWidth
                placeholder="Digite a senha do certificado"
              />
              
              <Field.Text
                name="confirmPassword"
                label="Confirmar Senha"
                type="password"
                fullWidth
                placeholder="Confirme a senha do certificado"
              />
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setCertificateDialogOpen(false);
                setCertificateFile(null);
                certificateMethods.reset();
              }}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isCertificateSubmitting || uploadingCertificate}
              startIcon={<Iconify icon="eva:cloud-upload-outline" />}
            >
              {uploadingCertificate ? 'Enviando...' : 'Enviar Certificado'}
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}
