'use client';

import { useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/utils/axios';
import { useEmpresa } from 'src/hooks/use-empresa';
import { uploadClienteExtratos, getClienteLancamentos } from 'src/actions/bank-statements';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { LancamentosMesDialog } from './lancamentos-mes-dialog';

// ----------------------------------------------------------------------

export default function ExtratosBancariosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva } = useEmpresa(userId);
  const clienteId = empresaAtiva;

  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const endpointUrl = clienteId ? endpoints.conciliacao.clienteExtratosStatus(clienteId) : null;
  
  const { data: statusData, error: statusError, isLoading: statusLoading, mutate: mutateStatus } = useSWR(
    endpointUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Erro ao carregar histórico de extratos:', error);
      },
    }
  );

  const meses = useMemo(() => {
    const mesesList = [];
    const hoje = new Date();
    
    // Se não houver dados, usar histórico mockado
    let historico = statusData?.historico || [];
    
    // Se não houver histórico e não estiver carregando, gerar mock
    if (!historico.length && !statusLoading) {
      for (let i = 1; i <= 4; i += 1) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAnoMock = data.toISOString().slice(0, 7);
        
        // Variar os tipos de arquivos
        let arquivos = [];
        if (i === 1) {
          arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.pdf`];
        } else if (i === 2) {
          arquivos = [`extrato-${mesAnoMock}.ofx`];
        } else if (i === 3) {
          arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.csv`, `extrato-${mesAnoMock}.pdf`];
        } else if (i === 4) {
          arquivos = [`extrato-${mesAnoMock}.ofx`, `extrato-${mesAnoMock}.pdf`];
        }
        
        historico.push({
          mesAno: mesAnoMock,
          enviado: true,
          enviadoEm: new Date(data.getFullYear(), data.getMonth(), 15).toISOString(),
          batchId: `batch-${mesAnoMock}`,
          arquivos,
          quantidadeArquivos: arquivos.length,
        });
      }
    }
    
    // Gerar últimos 12 meses
    for (let i = 0; i < 12; i += 1) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toISOString().slice(0, 7);
      const mesNome = data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      
      const statusMes = historico.find((h) => h.mesAno === mesAno);
      
      mesesList.push({
        mesAno,
        mesNome: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
        enviado: statusMes?.enviado || false,
        enviadoEm: statusMes?.enviadoEm,
        quantidadeArquivos: statusMes?.quantidadeArquivos || 0,
        arquivos: statusMes?.arquivos || [],
        batchId: statusMes?.batchId,
      });
    }
    
    return mesesList;
  }, [statusData, statusLoading, statusError]);

  const handleUpload = useCallback(
    async (fileList) => {
      if (!fileList?.length) {
        setFeedback({ type: 'error', message: 'Selecione ao menos um arquivo para importar.' });
        return;
      }

      if (!clienteId) {
        setFeedback({ type: 'error', message: 'Empresa não identificada. Por favor, recarregue a página.' });
        return;
      }

      setUploading(true);
      setFeedback(null);

      try {
        await uploadClienteExtratos(clienteId, fileList);
        setFeedback({ type: 'success', message: 'Extratos enviados com sucesso! Os lançamentos serão processados em breve.' });
        mutateStatus();
      } catch (err) {
        setFeedback({ type: 'error', message: extractErrorMessage(err) });
      } finally {
        setUploading(false);
      }
    },
    [clienteId, mutateStatus]
  );

  const handleFileChange = useCallback(
    (event) => {
      const { files } = event.target;
      if (files?.length) {
        handleUpload(files);
      }
      event.target.value = '';
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const { files } = event.dataTransfer;
      if (files?.length) {
        handleUpload(files);
      }
    },
    [handleUpload]
  );

  const handleVerLancamentos = useCallback(
    async (mes) => {
      setMesSelecionado(mes);
      setDialogAberto(true);
    },
    []
  );

  const preventDefault = (event) => event.preventDefault();

  const mesAtual = meses[0];
  const podeEnviarMesAtual = !mesAtual?.enviado;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Extratos Bancários</Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie seus extratos bancários mensais. Envie os extratos e visualize os lançamentos processados.
        </Typography>
      </Stack>

      {/* Upload para mês atual */}
      {podeEnviarMesAtual && (
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6">Enviar extratos - {mesAtual.mesNome}</Typography>
              <Typography variant="body2" color="text.secondary">
                Faça o upload dos extratos do mês atual. Formatos aceitos: PDF, CSV e OFX (FOZ).
              </Typography>
            </Stack>

            <Box
              onDrop={handleDrop}
              onDragOver={preventDefault}
              onDragEnter={preventDefault}
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                py: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <Iconify icon="solar:cloud-upload-bold-duotone" width={64} sx={{ mb: 2, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Arraste e solte os arquivos aqui
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ou selecione pelo botão abaixo
              </Typography>

              <Button variant="contained" component="label" disabled={uploading} startIcon={<Iconify icon="solar:file-text-bold-duotone" />}>
                Selecionar arquivos
                <input 
                  type="file" 
                  hidden 
                  multiple 
                  accept=".pdf,.csv,.ofx,.foz,application/pdf,text/csv,application/vnd.ms-money,application/x-ofx" 
                  onChange={handleFileChange} 
                />
              </Button>
            </Box>

            {uploading && <LinearProgress />}

            {feedback?.message && (
              <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
                {feedback.message}
              </Alert>
            )}
          </Stack>
        </Card>
      )}

      {/* Lista de meses */}
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Histórico de Extratos</Typography>
          
          {!clienteId ? (
            <Alert severity="warning">Empresa não identificada. Por favor, recarregue a página.</Alert>
          ) : statusLoading ? (
            <LinearProgress />
          ) : statusError ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Carregando dados mockados. Em produção, os dados virão da API.
            </Alert>
          ) : null}
          
          {/* Sempre mostrar meses (mesmo se houver erro, mostrará meses vazios) */}
          {clienteId && (
            <Grid container spacing={2}>
              {meses.map((mes) => (
                <Grid key={mes.mesAno} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: mes.enviado ? 'pointer' : 'default',
                      '&:hover': mes.enviado ? { bgcolor: 'action.hover' } : {},
                      borderColor: mes.enviado ? 'success.main' : 'divider',
                    }}
                    onClick={() => mes.enviado && handleVerLancamentos(mes)}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1">{mes.mesNome}</Typography>
                        {mes.enviado ? (
                          <Chip
                            icon={<Iconify icon="solar:check-circle-bold-duotone" width={16} />}
                            label="Enviado"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
                            label="Pendente"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Stack>

                      {mes.enviado && (
                        <>
                          <Divider />
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {mes.quantidadeArquivos} arquivo(s) enviado(s)
                            </Typography>
                            {mes.enviadoEm && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(mes.enviadoEm).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </Typography>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:eye-bold-duotone" width={18} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerLancamentos(mes);
                              }}
                              sx={{ mt: 1 }}
                            >
                              Ver lançamentos
                            </Button>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Card>

      {/* Dialog de lançamentos */}
      <LancamentosMesDialog
        open={dialogAberto}
        onClose={() => {
          setDialogAberto(false);
          setMesSelecionado(null);
        }}
        mes={mesSelecionado}
        clienteId={clienteId}
      />

      {/* Informações */}
      <Card sx={{ p: 3, bgcolor: 'info.lighter' }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:info-circle-bold-duotone" width={20} />
            Informações importantes
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Envie os extratos mensalmente para manter a conciliação atualizada</li>
            <li>Formatos aceitos: PDF, CSV e OFX (FOZ)</li>
            <li>Os lançamentos são processados automaticamente e ficam disponíveis para conciliação</li>
            <li>Lançamentos duplicados são identificados e removidos automaticamente</li>
            <li>Clique em um mês enviado para visualizar os lançamentos processados</li>
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}

function extractErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Erro inesperado ao enviar extratos. Tente novamente.';
}
