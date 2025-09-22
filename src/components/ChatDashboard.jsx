import React, { useState, useCallback } from 'react';

import { Box, Card, Grid, Chip, Stack, Button, Typography, CardContent, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSocket, useQueueEvents } from 'src/hooks/use-socket';

import { 
  closeChat, 
  useGetAllChats, 
  useGetQueueStats,
  returnChatToQueue,
  getNextChatFromQueue,
  useGetActiveUserChats
} from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';

export default function ChatDashboard() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState('atendimento');
  const [selectedInstance, setSelectedInstance] = useState('operacional');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks para dados
  const { chats, chatsLoading } = useGetAllChats({ limit: 20 });
  const { queueStats, queueStatsLoading } = useGetQueueStats(selectedSector, selectedInstance);
  const { activeChats, activeChatsLoading } = useGetActiveUserChats();
  
  // Hooks para WebSocket
  const { isConnected } = useSocket();
  const { queueStats: realtimeStats } = useQueueEvents(selectedSector, selectedInstance);

  const handleGetNextChat = useCallback(async (sector, instanceType) => {
    setIsLoading(true);
    try {
      const response = await getNextChatFromQueue(sector, instanceType);
      if (response.success && response.data) {
        router.push(`${paths.dashboard.chatIntegrated}?id=${response.data._id}`);
      }
    } catch (error) {
      console.error('Erro ao pegar chat da fila:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleCloseChat = useCallback(async (chatId) => {
    try {
      await closeChat(chatId);
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    }
  }, []);

  const handleReturnToQueue = useCallback(async (chatId) => {
    try {
      await returnChatToQueue(chatId);
    } catch (error) {
      console.error('Erro ao retornar chat para fila:', error);
    }
  }, []);

  const handleOpenChat = useCallback((chatId) => {
    router.push(`${paths.dashboard.chatIntegrated}?id=${chatId}`);
  }, [router]);

  // Usar estatísticas em tempo real se disponíveis
  const currentStats = realtimeStats && Object.keys(realtimeStats).length > 0 ? realtimeStats : queueStats;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Dashboard de Chat
        </Typography>
        <Chip 
          label={isConnected ? 'Conectado' : 'Desconectado'} 
          color={isConnected ? 'success' : 'error'} 
          size="small" 
        />
      </Stack>

      {/* Estatísticas da Fila */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Na Fila ({selectedSector})
                  </Typography>
                  <Typography variant="h3">
                    {queueStatsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      currentStats?.naFila || 0
                    )}
                  </Typography>
                </Box>
                <Iconify icon="eva:clock-fill" width={40} color="warning.main" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Em Atendimento
                  </Typography>
                  <Typography variant="h3">
                    {queueStatsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      currentStats?.emAtendimento || 0
                    )}
                  </Typography>
                </Box>
                <Iconify icon="eva:message-circle-fill" width={40} color="success.main" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tempo Médio
                  </Typography>
                  <Typography variant="h3">
                    {queueStatsLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      `${currentStats?.tempoMedioEspera || 0}min`
                    )}
                  </Typography>
                </Box>
                <Iconify icon="eva:clock-outline" width={40} color="info.main" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botões Pegar Próximo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Atendimento - Operacional</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sistema FIFO para atendimento geral
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleGetNextChat('atendimento', 'operacional')}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Iconify icon="eva:arrow-right-fill" />
                  )
                }
              >
                {isLoading ? 'Buscando...' : 'Pegar Próximo Chat'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Financeiro - Financeiro-Comercial</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sistema FIFO para questões financeiras
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleGetNextChat('financeiro', 'financeiro-comercial')}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Iconify icon="eva:arrow-right-fill" />
                  )
                }
              >
                {isLoading ? 'Buscando...' : 'Pegar Próximo Chat'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chats Ativos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Meus Chats Ativos
          </Typography>
          
          {activeChatsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : activeChats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              Nenhum chat ativo no momento
            </Typography>
          ) : (
            <Stack spacing={2}>
              {activeChats.map((chat) => (
                <Box key={chat._id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6">{chat.clienteName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {chat.whatsappNumber}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip 
                          label={chat.status} 
                          size="small" 
                          color={chat.status === 'em_atendimento' ? 'success' : 'default'}
                        />
                        <Chip 
                          label={chat.instanceType} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={chat.assignedSectorId} 
                          size="small" 
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenChat(chat._id)}
                        startIcon={<Iconify icon="eva:message-circle-fill" />}
                      >
                        Abrir
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleReturnToQueue(chat._id)}
                        startIcon={<Iconify icon="eva:arrow-back-fill" />}
                        color="warning"
                      >
                        Retornar
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCloseChat(chat._id)}
                        startIcon={<Iconify icon="eva:close-fill" />}
                        color="error"
                      >
                        Fechar
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Lista de Todos os Chats */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Todos os Chats ({chats.length})
          </Typography>
          {chatsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : chats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              Nenhum chat encontrado
            </Typography>
          ) : (
            <Stack spacing={1}>
              {chats.slice(0, 10).map((chat) => (
                <Box key={chat._id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1">{chat.clienteName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {chat.whatsappNumber}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip label={chat.status} size="small" color="primary" />
                        <Chip label={chat.instanceType} size="small" variant="outlined" />
                        <Chip label={chat.assignedSectorId} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenChat(chat._id)}
                      startIcon={<Iconify icon="eva:message-circle-fill" />}
                    >
                      Abrir
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
