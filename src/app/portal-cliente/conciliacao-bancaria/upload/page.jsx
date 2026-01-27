'use client';

import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { useUploadExtrato, useBancosCliente } from '../hooks';

// ✅ Helper para formatar data ISO sem problemas de timezone
const formatarDataISO = (dataISO) => {
  if (!dataISO) return '';
  
  // Se for string ISO, extrair apenas a parte da data (YYYY-MM-DD)
  if (typeof dataISO === 'string' && dataISO.includes('T')) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  // Se for Date object, usar toLocaleDateString
  if (dataISO instanceof Date) {
    return dataISO.toLocaleDateString('pt-BR');
  }
  
  // Fallback: tentar criar Date
  try {
    const data = new Date(dataISO);
    // Extrair apenas a parte da data da string ISO original se possível
    if (typeof dataISO === 'string') {
      const match = dataISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }
    return data.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

const TIPOS_ACEITOS = '.ofx,.pdf,.xlsx,.xls,.csv';
const MIME_TYPES_ACEITOS = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/pdf',
  'application/x-ofx',
];

export default function UploadExtratoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [bancoId, setBancoId] = useState(searchParams.get('banco') || searchParams.get('bancoId') || '');
  const [arquivo, setArquivo] = useState(null);
  // 🔥 Pegar mesAno da URL (quando vem da página de status) ou deixar vazio
  const [mesAno, setMesAno] = useState(searchParams.get('mesAno') || '');
  // Flag para saber se veio da URL (então bloqueia edição)
  const mesAnoVeioDaURL = Boolean(searchParams.get('mesAno'));

  // 🔥 Estados para Modais
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [tipoErro, setTipoErro] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');
  const [statusMes, setStatusMes] = useState(null);
  const [verificandoStatus, setVerificandoStatus] = useState(false);
  
  // 🔥 Estados para transações ignoradas (novo comportamento do backend)
  const [transacoesIgnoradas, setTransacoesIgnoradas] = useState([]);
  const [modalIgnoradasAberto, setModalIgnoradasAberto] = useState(false);
  
  // ✅ Estados para validação de dataInicio e meses faltantes
  const [mesesFaltantes, setMesesFaltantes] = useState([]);
  const [mostrarAvisoMesesFaltantes, setMostrarAvisoMesesFaltantes] = useState(false);

  const { upload, loading, uploadProgress, resultado, error: uploadError, errorData, reset } = useUploadExtrato();

  // 🔥 Detectar quando há erro e abrir modal apropriado
  useEffect(() => {
    console.log('🔍 useEffect - uploadError:', uploadError);
    console.log('🔍 useEffect - errorData:', errorData);
    
    if (uploadError && errorData?.tipo) {
      console.log('🔥 Erro detectado! Tipo:', errorData.tipo);
      console.log('🔥 Abrindo modal...');
      setTipoErro(errorData.tipo);
      setMensagemErro(uploadError);
      setModalErroAberto(true);
    } else if (uploadError && !errorData) {
      console.log('⚠️ Erro sem errorData, modal será aberto pelo handleUpload');
      // Não mostrar toast aqui - o erro será tratado no handleUpload ou modal
    }
  }, [uploadError, errorData]);

  // Buscar dados da empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!user?.userId) {
        setLoadingEmpresa(false);
        return;
      }
      try {
        setLoadingEmpresa(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados/${user.userId}`
        );
        setEmpresaData(response.data.data.cliente);
      } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoadingEmpresa(false);
      }
    };
    fetchEmpresaData();
  }, [user?.userId]);

  const clienteId = empresaData?._id || empresaData?.id;

  // Hook de bancos (buscar bancos reais da API)
  const { bancos, loading: loadingBancos } = useBancosCliente(clienteId);

  // Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setArquivo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/x-ofx': ['.ofx'],
    },
    multiple: false,
  });

  // Validar arquivo
  const validarArquivo = (file) => {
    const extensao = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const extensoesAceitas = ['.ofx', '.pdf', '.xlsx', '.xls', '.csv'];
    return extensoesAceitas.includes(extensao);
  };

  // ✅ Verificar meses faltantes
  const verificarMesesFaltantes = async (bancoIdParam, mesAnoParam) => {
    if (!bancoIdParam || !mesAnoParam) return null;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}conciliacao/verificar-meses-faltantes/${bancoIdParam}?mesAno=${mesAnoParam}`
      );
      return response.data?.data || null;
    } catch (error) {
      console.error('Erro ao verificar meses faltantes:', error);
      return null;
    }
  };

  // ✅ Validar data de início do banco
  const validarDataInicio = (bancoSelecionado, mesAnoParam) => {
    if (!bancoSelecionado?.dataInicio || !mesAnoParam) return { valido: true };

    const [ano, mes] = mesAnoParam.split('-').map(Number);
    const dataExtrato = new Date(ano, mes - 1, 1); // Primeiro dia do mês
    const dataInicio = new Date(bancoSelecionado.dataInicio);

    if (dataExtrato < dataInicio) {
      return {
        valido: false,
        mensagem: `Não é possível enviar extrato para ${mes}/${ano}. Este banco iniciou a conciliação em ${formatarDataISO(bancoSelecionado.dataInicio)}. Apenas extratos a partir de ${formatarDataISO(bancoSelecionado.dataInicio)} são permitidos.`,
      };
    }

    return { valido: true };
  };

  // ✅ Filtrar meses faltantes que são anteriores à data de início do banco
  const filtrarMesesFaltantesPorDataInicio = (mesesFaltantesArray, bancoSelecionado) => {
    if (!bancoSelecionado?.dataInicio || !mesesFaltantesArray || mesesFaltantesArray.length === 0) {
      return mesesFaltantesArray || [];
    }

    const dataInicio = new Date(bancoSelecionado.dataInicio);
    
    return mesesFaltantesArray.filter((mesAnoItem) => {
      const [ano, mes] = mesAnoItem.split('-').map(Number);
      const dataMes = new Date(ano, mes - 1, 1); // Primeiro dia do mês
      // Só incluir meses que são >= data de início
      return dataMes >= dataInicio;
    });
  };

  // 🔥 Verificar status do mês quando bancoId e mesAno mudarem
  useEffect(() => {
    const verificarStatusMes = async () => {
      if (!clienteId || !bancoId || !mesAno) {
        setStatusMes(null);
        return;
      }

      try {
        setVerificandoStatus(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}reconciliation/meses-conciliados/${clienteId}?bancoId=${bancoId}`
        );
        const meses = response.data?.data || response.data || [];
        const mesEncontrado = meses.find((m) => m.mesAno === mesAno);
        setStatusMes(mesEncontrado?.status || null);
      } catch (error) {
        console.error('Erro ao verificar status do mês:', error);
        setStatusMes(null);
      } finally {
        setVerificandoStatus(false);
      }
    };

    verificarStatusMes();
  }, [clienteId, bancoId, mesAno]);

  // Handle Upload
  const handleUpload = async () => {
    if (!arquivo) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (!bancoId) {
      toast.error('Selecione um banco');
      return;
    }

    // 🔥 NOVA VALIDAÇÃO: mesAno é obrigatório
    if (!mesAno) {
      toast.error('Selecione o período (mês/ano) do extrato');
      return;
    }

    // Validar formato YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(mesAno)) {
      toast.error('Período inválido. Use o formato YYYY-MM');
      return;
    }

    if (!clienteId) {
      toast.error('Cliente não identificado');
      return;
    }

    // 🔥 VALIDAÇÃO: Verificar se status é "fechado_sem_movimento"
    if (statusMes === 'fechado_sem_movimento') {
      toast.error('⚠️ Este mês está fechado sem movimento. Entre em contato com o suporte para liberar o upload.');
      setTipoErro('FECHADO_SEM_MOVIMENTO');
      setMensagemErro('Este período está marcado como "Fechado sem Movimento" e não permite upload de arquivo. Entre em contato com o suporte para liberar.');
      setModalErroAberto(true);
      return;
    }

    // ✅ VALIDAÇÃO: Verificar data de início do banco
    const bancoSelecionado = bancos.find((b) => b._id === bancoId);
    if (bancoSelecionado) {
      const validacaoDataInicio = validarDataInicio(bancoSelecionado, mesAno);
      if (!validacaoDataInicio.valido) {
        toast.error('⚠️ Extrato anterior à data de início');
        setTipoErro('DATA_INICIO_INVALIDA');
        setMensagemErro(validacaoDataInicio.mensagem);
        setModalErroAberto(true);
        return;
      }
    }

    // ✅ VALIDAÇÃO: Verificar meses faltantes
    const mesesInfo = await verificarMesesFaltantes(bancoId, mesAno);
    if (mesesInfo?.temMesesFaltantes) {
      // ✅ Filtrar meses faltantes que são anteriores à data de início do banco
      // Reutilizar bancoSelecionado já declarado acima
      const mesesFaltantesFiltrados = filtrarMesesFaltantesPorDataInicio(
        mesesInfo.mesesFaltantes || [],
        bancoSelecionado
      );
      
      // Só mostrar aviso se houver meses faltantes após o filtro
      if (mesesFaltantesFiltrados.length > 0) {
        setMesesFaltantes(mesesFaltantesFiltrados);
        setMostrarAvisoMesesFaltantes(true);
      } else {
        // Se todos os meses foram filtrados, não há meses faltantes válidos
        setMesesFaltantes([]);
        setMostrarAvisoMesesFaltantes(false);
      }
      // Não bloquear, apenas avisar - o usuário pode continuar
    }

    if (!validarArquivo(arquivo)) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }

    // ✅ Se há aviso de meses faltantes, confirmar antes de continuar
    if (mostrarAvisoMesesFaltantes && mesesFaltantes.length > 0) {
      const confirmar = window.confirm(
        `⚠️ Atenção: Faltam ${mesesFaltantes.length} mês(es) anterior(es): ${mesesFaltantes.join(', ')}\n\n` +
        `O saldo será recalculado automaticamente após processar este extrato.\n\n` +
        `Deseja continuar mesmo assim?`
      );
      
      if (!confirmar) {
        setMostrarAvisoMesesFaltantes(false);
        setMesesFaltantes([]);
        return;
      }
    }

    try {
      // ⚠️ IMPORTANTE: Passar bancoId e mesAno para o upload
      const result = await upload(clienteId, bancoId, mesAno, arquivo);
      
      // Limpar avisos após upload bem-sucedido
      setMostrarAvisoMesesFaltantes(false);
      setMesesFaltantes([]);
      
      if (result) {
        // 🔥 NOVO: Verificar se há transações ignoradas
        if (result.transacoesIgnoradas && result.transacoesIgnoradas.length > 0) {
          console.log('⚠️ Transações ignoradas encontradas:', result.transacoesIgnoradas.length);
          setTransacoesIgnoradas(result.transacoesIgnoradas);
          setModalIgnoradasAberto(true);
          
          // 🔥 Redirecionar após fechar o modal de aviso (não bloquear)
          // O usuário pode fechar o modal e continuar normalmente
        } else {
          // 🔥 Sem transações ignoradas, redirecionar normalmente após 2 segundos
          setTimeout(() => {
            if (result.conciliacaoId) {
              router.push(`${paths.cliente.conciliacaoBancaria}/validar/${result.conciliacaoId}`);
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      // 🔥 O useEffect vai detectar o erro e abrir o modal apropriado
      // Não fazemos nada aqui, deixamos o useEffect cuidar da exibição
    }
  };

  // 🔥 Fechar modal e limpar erro
  const handleFecharModal = () => {
    console.log('🔥 Fechando modal');
    setModalErroAberto(false);
    setTipoErro(null);
    setMensagemErro('');
    reset(); // Limpa error e errorData do hook
  };

  // 🔥 Voltar para status para selecionar outro período
  const handleTentarNovamente = () => {
    console.log('🔥 Redirecionando para página de status');
    setModalErroAberto(false);
    setTipoErro(null);
    setMensagemErro('');
    reset();
    router.push(`${paths.cliente.conciliacaoBancaria}/status`);
    toast.info('Selecione o período correto');
  };

  // 🔥 Fechar modal de transações ignoradas e continuar
  const handleFecharModalIgnoradas = () => {
    console.log('🔥 Fechando modal de transações ignoradas e redirecionando');
    setModalIgnoradasAberto(false);
    // Redirecionar para validação após fechar o modal
    if (resultado?.conciliacaoId) {
      setTimeout(() => {
        router.push(`${paths.cliente.conciliacaoBancaria}/validar/${resultado.conciliacaoId}`);
      }, 500);
    }
  };

  const handleContinuarValidacao = () => {
    if (resultado?.conciliacaoId) {
      router.push(`${paths.cliente.conciliacaoBancaria}/validar/${resultado.conciliacaoId}`);
    }
  };

  // Loading empresa
  if (loadingEmpresa) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="h6">Carregando dados do cliente...</Typography>
        </Stack>
      </Box>
    );
  }

  // Erro ao carregar empresa
  if (!empresaData || !clienteId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Erro ao carregar dados do cliente</Typography>
          <Typography variant="body2">
            Não foi possível identificar o cliente. Por favor, faça login novamente.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Stack>
          <Typography variant="h4" gutterBottom>
            📤 Upload de Extrato Bancário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Envie o extrato do seu banco para realizar a conciliação automática
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
        >
          Voltar
        </Button>
      </Stack>

      {/* 📋 Formulário de Upload */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Coluna 1: Seletor de Banco */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="bold">
                  🏦 Banco *
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/bancos`)}
                >
                  Cadastrar
                </Button>
              </Stack>

              <FormControl fullWidth required>
                <InputLabel>Selecione o banco</InputLabel>
                <Select
                  value={bancoId}
                  onChange={(e) => setBancoId(e.target.value)}
                  label="Selecione o banco"
                  disabled={loading || loadingBancos}
                >
                  <MenuItem value="">
                    <em>Selecione o banco</em>
                  </MenuItem>
                  {bancos.map((banco) => (
                    <MenuItem key={banco._id} value={banco._id}>
                      🏦 {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'} (
                      {banco.instituicaoBancariaId?.codigo || banco.codigo || 'N/A'}) - Ag:{' '}
                      {banco.agencia || 'N/A'} Conta: {banco.conta}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {bancos.length === 0 && !loadingBancos && (
                <Alert severity="warning" variant="outlined">
                  <Typography variant="caption">
                    Cadastre um banco primeiro
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Grid>

          {/* Coluna 2: Seletor de Período */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                📅 Período do Extrato *
              </Typography>
              
              {statusMes === 'fechado_sem_movimento' && (
                <Alert severity="error" icon={<Iconify icon="eva:lock-fill" />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    🔒 Upload Bloqueado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Este período está marcado como &quot;Fechado sem Movimento&quot; e não permite upload.
                    Entre em contato com o suporte para liberar.
                  </Typography>
                </Alert>
              )}
              {/* ✅ Aviso de meses faltantes */}
              {mostrarAvisoMesesFaltantes && mesesFaltantes.length > 0 && (
                <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-outline" />} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    ⚠️ Meses Anteriores Não Enviados
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Faltam {mesesFaltantes.length} mês(es): {mesesFaltantes.join(', ')}. O saldo será recalculado automaticamente.
                  </Typography>
                </Alert>
              )}

              {mesAnoVeioDaURL ? (
                <Alert severity={statusMes === 'fechado_sem_movimento' ? 'error' : 'success'} icon={<Iconify icon="eva:calendar-outline" />}>
                  <Typography variant="body2" fontWeight="bold">
                    {(() => {
                      // 🔥 Corrigir formatação do mês (evitar problema de timezone)
                      const [ano, mes] = mesAno.split('-');
                      const meses = [
                        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
                      ];
                      const mesIndex = parseInt(mes, 10) - 1; // Converter para índice (0-11)
                      return `${meses[mesIndex]} de ${ano}`;
                    })()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {statusMes === 'fechado_sem_movimento' ? '🔒 Bloqueado para upload' : 'Selecionado automaticamente'}
                  </Typography>
                </Alert>
              ) : (
                <TextField
                  fullWidth
                  required
                  type="month"
                  label="Mês e Ano"
                  value={mesAno}
                  onChange={(e) => setMesAno(e.target.value)}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Período das transações do arquivo"
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* 📄 Área de Upload do Arquivo */}
      <Card sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box
          {...getRootProps()}
          sx={{
            p: 5,
            textAlign: 'center',
            bgcolor: isDragActive ? 'primary.lighter' : arquivo ? 'success.lighter' : 'background.neutral',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: 2,
            borderStyle: 'dashed',
            borderColor: isDragActive ? 'primary.main' : arquivo ? 'success.main' : 'grey.300',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter',
            },
          }}
        >
          <input {...getInputProps()} />
          
          {arquivo ? (
            <Stack spacing={2} alignItems="center">
              <Iconify icon="eva:file-text-fill" width={48} color="success.main" />
              <Typography variant="h6" color="success.main">
                {arquivo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(arquivo.size / 1024).toFixed(2)} KB
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setArquivo(null);
                }}
              >
                Remover Arquivo
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center">
              <Iconify 
                icon={isDragActive ? "eva:cloud-download-fill" : "eva:cloud-upload-fill"} 
                width={64} 
                color="primary.main" 
              />
              <Typography variant="h6">
                {isDragActive ? '📥 Solte o arquivo aqui' : '📤 Arraste o arquivo ou clique para selecionar'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formatos aceitos: <strong>OFX, PDF, XLSX, CSV</strong>
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Tamanho máximo: 10 MB
              </Typography>
            </Stack>
          )}
        </Box>
      </Card>

      {/* 🚀 Botão de Envio */}
      {!loading && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleUpload}
          disabled={!arquivo || !bancoId || !mesAno}
          startIcon={<Iconify icon="eva:upload-fill" />}
          sx={{ 
            mb: 3,
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          Enviar e Processar Extrato
        </Button>
      )}

      {/* ⏳ Estado de Loading */}
      {(loading || resultado) && (
        <Card sx={{ p: 4, mb: 3, bgcolor: resultado ? 'success.lighter' : 'primary.lighter', border: 2, borderColor: resultado ? 'success.main' : 'primary.main' }}>
          <Stack spacing={3} alignItems="center">
            {resultado ? (
              <>
                <Iconify icon="eva:checkmark-circle-2-fill" width={60} color="success.main" />
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ✅ Arquivo processado com sucesso!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Redirecionando para validação...
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                <CircularProgress size={60} thickness={4} />
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight="bold">
                    Processando extrato bancário...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aguarde enquanto processamos as transações
                  </Typography>
                </Stack>
                {uploadProgress > 0 && (
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" textAlign="center" mt={1} fontWeight="bold">
                      {uploadProgress}% concluído
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Card>
      )}

      {/* 🔥 MODAL DE ERRO - PERÍODO INVÁLIDO */}
      <Dialog
        open={modalErroAberto && tipoErro === 'PERIODO_INVALIDO'}
        onClose={handleFecharModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:calendar-mark-bold-duotone" width={36} color="error.main" />
            <Box>
              <Typography variant="h5" color="error.main">
                Período Incorreto
              </Typography>
              <Typography variant="caption" color="text.secondary">
                O arquivo contém transações de outro período
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Mensagem Principal */}
            <Alert severity="error" sx={{ border: 2, borderColor: 'error.main' }}>
              <Typography variant="body2" fontWeight="bold">
                {mensagemErro}
              </Typography>
            </Alert>

            {/* Período Esperado */}
            {errorData?.periodoEsperado && (
              <Card sx={{ p: 2, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Iconify icon="eva:calendar-outline" width={24} color="warning.dark" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Período esperado:
                    </Typography>
                    <Typography variant="h6" color="warning.dark">
                      {errorData.periodoEsperado.mesAnoFormatado}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Transações Inválidas */}
            {errorData?.transacoesInvalidas && errorData.transacoesInvalidas.total > 0 && (
              <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  📋 Exemplos de transações encontradas no arquivo:
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  {errorData.transacoesInvalidas.total} transação(ões) de período diferente
                </Typography>
                
                <Stack spacing={1.5}>
                  {errorData.transacoesInvalidas.exemplos?.slice(0, 5).map((transacao, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'error.light',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="bold">
                          {transacao.descricao}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Chip
                            label={new Date(transacao.data).toLocaleDateString('pt-BR')}
                            size="small"
                            color="error"
                            icon={<Iconify icon="eva:calendar-outline" />}
                          />
                          <Typography variant="caption" color="error.main">
                            Período: {String(transacao.mes).padStart(2, '0')}/{transacao.ano}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                {errorData.transacoesInvalidas.total > 5 && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                    ... e mais {errorData.transacoesInvalidas.total - 5} transação(ões)
                  </Typography>
                )}
              </Card>
            )}

            {/* Dica de Resolução */}
            <Alert severity="info" icon={<Iconify icon="eva:bulb-outline" />}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                💡 Como resolver:
              </Typography>
              <Typography variant="body2">
                • Selecione o período correto que corresponde às transações do arquivo<br />
                • Ou faça upload de um arquivo que contenha apenas transações do período selecionado
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="eva:calendar-outline" />}
            onClick={handleTentarNovamente}
          >
            Selecionar Outro Período
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="eva:file-outline" />}
            onClick={() => {
              setModalErroAberto(false);
              setArquivo(null);
              reset();
              toast.info('Selecione o arquivo correto para o período escolhido');
            }}
          >
            Enviar Outro Arquivo
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFecharModal}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 MODAL DE ERRO - CONCILIAÇÃO EXISTENTE */}
      <Dialog
        open={modalErroAberto && tipoErro === 'CONCILIACAO_EXISTENTE'}
        onClose={handleFecharModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:file-check-bold-duotone" width={32} color="warning.main" />
            <Typography variant="h5" color="warning.main">
              Conciliação Já Existe
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              <Typography variant="body2" fontWeight="bold">
                {mensagemErro}
              </Typography>
            </Alert>

            <Alert severity="info" sx={{ bgcolor: 'info.lighter' }}>
              <Typography variant="body2">
                Este período já foi conciliado anteriormente. Se deseja refazer a conciliação, você precisará excluir a conciliação existente primeiro.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleFecharModal}
          >
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
          >
            Voltar para Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 MODAL DE ERRO - FECHADO SEM MOVIMENTO */}
      <Dialog
        open={modalErroAberto && tipoErro === 'FECHADO_SEM_MOVIMENTO'}
        onClose={handleFecharModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:lock-password-bold-duotone" width={32} color="error.main" />
            <Typography variant="h5" color="error.main">
              Upload Bloqueado
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="error">
              <Typography variant="body2" fontWeight="bold">
                {mensagemErro}
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ bgcolor: 'warning.lighter' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                🔒 Status: Fechado sem Movimento
              </Typography>
              <Typography variant="body2" component="div">
                Este período foi marcado como <strong>&quot;Fechado sem Movimento&quot;</strong> pelo time administrativo.
                <br />
                <br />
                <strong>O que isso significa:</strong>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                  <li>O upload está bloqueado para este período</li>
                  <li>Entre em contato com o suporte para liberar</li>
                  <li>O time precisa marcar como &quot;Não Enviado&quot; para permitir upload novamente</li>
                </Box>
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleFecharModal}>
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
          >
            Voltar para Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ MODAL DE ERRO - DATA INÍCIO INVÁLIDA */}
      <Dialog
        open={modalErroAberto && tipoErro === 'DATA_INICIO_INVALIDA'}
        onClose={handleFecharModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:calendar-mark-bold-duotone" width={32} color="error.main" />
            <Typography variant="h5" color="error.main">
              Extrato Anterior à Data de Início
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="error">
              <Typography variant="body2" fontWeight="bold">
                {mensagemErro}
              </Typography>
            </Alert>

            <Alert severity="info" sx={{ bgcolor: 'info.lighter' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                💡 O que fazer:
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  <li>Selecione um período igual ou posterior à data de início do banco</li>
                  <li>Ou entre em contato com o suporte para ajustar a data de início</li>
                </Box>
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleFecharModal}>
            Fechar
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleTentarNovamente}
          >
            Selecionar Outro Período
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 MODAL DE ERRO - OFX INVÁLIDO */}
      <Dialog
        open={modalErroAberto && tipoErro === 'OFX_INVALIDO'}
        onClose={handleFecharModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:file-corrupted-bold-duotone" width={32} color="error.main" />
            <Typography variant="h5" color="error.main">
              Arquivo Inválido
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="error">
              <Typography variant="body2" fontWeight="bold">
                {mensagemErro}
              </Typography>
            </Alert>

            <Alert severity="info" sx={{ bgcolor: 'info.lighter' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                💡 Possíveis causas:
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  <li>O arquivo está corrompido</li>
                  <li>O arquivo não contém transações</li>
                  <li>O formato do arquivo não é suportado</li>
                  <li>O arquivo não é um extrato bancário válido</li>
                </Box>
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleFecharModal}
          >
            Fechar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:file-outline" />}
            onClick={() => {
              setModalErroAberto(false);
              setArquivo(null);
              reset();
              toast.info('Selecione um arquivo válido');
            }}
          >
            Selecionar Outro Arquivo
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 MODAL DE AVISO - TRANSAÇÕES IGNORADAS (NOVO) */}
      <Dialog
        open={modalIgnoradasAberto}
        onClose={handleFecharModalIgnoradas}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="solar:info-circle-bold-duotone" width={32} color="warning.main" />
            <Box>
              <Typography variant="h5" color="warning.main">
                ⚠️ Transações Ignoradas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                O arquivo foi processado, mas algumas transações foram ignoradas
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Mensagem Principal */}
            <Alert severity="warning" sx={{ border: 2, borderColor: 'warning.main' }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                O arquivo foi processado com sucesso!
              </Typography>
              <Typography variant="body2">
                No entanto, <strong>{transacoesIgnoradas.length} transação(ões)</strong> foram ignoradas porque 
                não pertencem ao período selecionado (<strong>{(() => {
                  if (!mesAno) return mesAno;
                  const [ano, mes] = mesAno.split('-');
                  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                  return `${meses[parseInt(mes, 10) - 1]} de ${ano}`;
                })()}</strong>).
              </Typography>
            </Alert>

            {/* Resumo */}
            {resultado && (
              <Card sx={{ p: 2, bgcolor: 'success.lighter', border: 1, borderColor: 'success.main' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                    ✅ Transações Processadas: {resultado.transacoes?.length || 0}
                  </Typography>
                  {resultado.resumo && (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        Entradas: R$ {resultado.resumo.totalCreditos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Saídas: R$ {resultado.resumo.totalDebitos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </Typography>
                    </>
                  )}
                </Stack>
              </Card>
            )}

            {/* Lista de Transações Ignoradas */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                📋 Transações Ignoradas ({transacoesIgnoradas.length}):
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Essas transações não foram incluídas na conciliação
              </Typography>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                <Stack spacing={1.5}>
                  {transacoesIgnoradas.slice(0, 10).map((transacao, index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'warning.light',
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                          <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-word', flex: 1 }}>
                            {transacao.descricao || 'N/A'}
                          </Typography>
                          <Chip
                            label={transacao.tipo === 'credito' ? 'Crédito' : 'Débito'}
                            size="small"
                            color={transacao.tipo === 'credito' ? 'success' : 'error'}
                            sx={{ ml: 1 }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">
                            Data: {new Date(transacao.data).toLocaleDateString('pt-BR')}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            fontWeight="bold"
                            color={transacao.tipo === 'credito' ? 'success.main' : 'error.main'}
                          >
                            {transacao.tipo === 'credito' ? '+' : '-'} R$ {parseFloat(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Stack>
                        {transacao.motivo && (
                          <Typography variant="caption" color="warning.dark" sx={{ fontStyle: 'italic' }}>
                            ⚠️ {transacao.motivo}
                          </Typography>
                        )}
                      </Stack>
                    </Card>
                  ))}
                  {transacoesIgnoradas.length > 10 && (
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      ... e mais {transacoesIgnoradas.length - 10} transação(ões)
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Dica */}
            <Alert severity="info" icon={<Iconify icon="eva:bulb-outline" />}>
              <Typography variant="body2">
                💡 As transações válidas já foram processadas e estão prontas para conciliação. 
                Você pode continuar normalmente.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleFecharModalIgnoradas}
          >
            Continuar para Validação
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:arrow-forward-fill" />}
            onClick={handleFecharModalIgnoradas}
          >
            Ver Conciliação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
