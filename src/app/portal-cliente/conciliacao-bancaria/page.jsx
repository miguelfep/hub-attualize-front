'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CardContent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';

import { listarConciliacoes } from 'src/actions/conciliacao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import ConciliacaoUpload from './components/conciliacao-upload';
import ConciliacaoRevisao from './components/conciliacao-revisao';

// ----------------------------------------------------------------------

export default function ConciliacaoBancariaClientePage() {
  const theme = useTheme();
  const { user } = useAuthContext();

  const [view, setView] = useState('upload'); // 'upload' | 'revisao' | 'historico'
  const [conciliacaoAtual, setConciliacaoAtual] = useState(null);

  console.log(user);
  const clienteId = user?.clienteProprietarioId || user?.cliente?._id || user?.cliente?.id;

  // Carregar conciliações do cliente
  const { data: conciliacoes, isLoading: loadingConciliacoes } = useSWR(
    clienteId ? `/reconciliation/cliente/${clienteId}` : null,
    () => listarConciliacoes(clienteId),
    {
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Erro ao carregar conciliações:', error);
      },
    }
  );

  const handleUploadSuccess = useCallback(
    (conciliacao) => {
      setConciliacaoAtual(conciliacao);
      setView('revisao');
      toast.success('Arquivo processado com sucesso!');

      // Revalidar lista de conciliações
      if (clienteId) {
        mutate(`/reconciliation/cliente/${clienteId}`);
      }
    },
    [clienteId]
  );

  const handleVoltarUpload = useCallback(() => {
    setView('upload');
    setConciliacaoAtual(null);
  }, []);

  const handleFinalizarConciliacao = useCallback(() => {
    setView('upload');
    setConciliacaoAtual(null);
    toast.success('Conciliação finalizada com sucesso!');

    // Revalidar lista
    if (clienteId) {
      mutate(`/reconciliation/cliente/${clienteId}`);
    }
  }, [clienteId]);

  const handleVisualizarConciliacao = useCallback((conciliacao) => {
    setConciliacaoAtual(conciliacao);
    setView('revisao');
  }, []);

  if (!clienteId) {
    return (
      <Card sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}>
        <Iconify icon="solar:danger-triangle-bold" width={80} sx={{ mb: 2, opacity: 0.3 }} />
        <Typography variant="h6">Erro ao carregar dados do cliente</Typography>
        <Typography variant="body2" color="text.secondary">
          Não foi possível identificar o cliente. Por favor, faça login novamente.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Conciliação Bancária
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Importe seus extratos bancários e facilite a conciliação contábil
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant={view === 'upload' ? 'contained' : 'outlined'}
              onClick={() => setView('upload')}
              startIcon={<Iconify icon="solar:upload-bold" />}
            >
              Upload
            </Button>
            <Button
              variant={view === 'historico' ? 'contained' : 'outlined'}
              onClick={() => setView('historico')}
              startIcon={<Iconify icon="solar:history-bold" />}
            >
              Histórico
            </Button>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {view === 'upload' && (
            <ConciliacaoUpload clienteId={clienteId} onSuccess={handleUploadSuccess} />
          )}

          {view === 'revisao' && conciliacaoAtual && (
            <ConciliacaoRevisao
              conciliacao={conciliacaoAtual}
              onVoltar={handleVoltarUpload}
              onFinalizar={handleFinalizarConciliacao}
            />
          )}

          {view === 'historico' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Histórico de Conciliações
              </Typography>

              {loadingConciliacoes ? (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando...
                  </Typography>
                </Box>
              ) : !conciliacoes?.data?.length ? (
                <Box
                  sx={{
                    py: 10,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Iconify icon="solar:document-broken" width={80} sx={{ mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6">Nenhuma conciliação encontrada</Typography>
                  <Typography variant="body2">
                    Faça o upload de um extrato para começar
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {conciliacoes.data.map((conc) => (
                    <Card key={conc._id || conc.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            {conc.nomeArquivo || 'Conciliação'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(conc.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Status: <strong>{conc.status || 'Pendente'}</strong>
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleVisualizarConciliacao(conc)}
                          startIcon={<Iconify icon="solar:eye-bold" />}
                        >
                          Visualizar
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
