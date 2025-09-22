'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSocket, useQueueEvents, useNotifications } from 'src/hooks/use-socket';

import { 
  closeChat,
  useGetQueueStats,
  returnChatToQueue,
  getNextChatFromQueue,
  useGetActiveUserChats
} from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

const SECTORS = [
  { id: 'atendimento', name: 'Atendimento', color: 'primary' },
  { id: 'financeiro', name: 'Financeiro', color: 'success' },
  { id: 'comercial', name: 'Comercial', color: 'info' },
  { id: 'suporte', name: 'Suporte', color: 'warning' },
];

const INSTANCE_TYPES = [
  { id: 'operacional', name: 'Operacional', color: 'primary' },
  { id: 'financeiro-comercial', name: 'Financeiro-Comercial', color: 'success' },
];

// ----------------------------------------------------------------------

export function QueueDashboard() {
  const router = useRouter();
  
  const [selectedSector, setSelectedSector] = useState('atendimento');
  const [selectedInstance, setSelectedInstance] = useState('operacional');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks para dados
  const { queueStats, queueStatsLoading } = useGetQueueStats(selectedSector, selectedInstance);
  const { activeChats, activeChatsLoading } = useGetActiveUserChats();
  
  // Hooks para WebSocket
  const { isConnected } = useSocket();
  const { queueStats: realtimeStats, newMessagesInQueue } = useQueueEvents(selectedSector, selectedInstance);
  const { notifications } = useNotifications();

  // Pegar próximo chat da fila
  const handleGetNextChat = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getNextChatFromQueue(selectedSector, selectedInstance);
      
      if (response.success && response.data) {
        // Redirecionar para o chat
        router.push(`${paths.dashboard.chatIntegrated}?id=${response.data._id}`);
      } else {
        // Mostrar mensagem de que não há chats na fila
        console.log('Nenhum chat disponível na fila');
      }
    } catch (error) {
      console.error('Erro ao pegar próximo chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSector, selectedInstance, router]);

  // Fechar chat ativo
  const handleCloseChat = useCallback(async (chatId) => {
    try {
      await closeChat(chatId);
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    }
  }, []);

  // Retornar chat para fila
  const handleReturnToQueue = useCallback(async (chatId) => {
    try {
      await returnChatToQueue(chatId);
    } catch (error) {
      console.error('Erro ao retornar chat para fila:', error);
    }
  }, []);

  // Abrir chat ativo
  const handleOpenChat = useCallback((chatId) => {
    router.push(`${paths.dashboard.chatIntegrated}?id=${chatId}`);
  }, [router]);

  // Usar estatísticas em tempo real se disponíveis
  const currentStats = realtimeStats && Object.keys(realtimeStats).length > 0 ? realtimeStats : queueStats;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Dashboard de Fila
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip 
            label={isConnected ? 'Conectado' : 'Desconectado'} 
            color={isConnected ? 'success' : 'error'} 
            size="small" 
          />
          {newMessagesInQueue.length > 0 && (
            <Badge badgeContent={newMessagesInQueue.length} color="error">
              <Iconify icon="eva:bell-fill" />
            </Badge>
          )}
        </Stack>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Setor
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {SECTORS.map((sector) => (
                  <Chip
                    key={sector.id}
                    label={sector.name}
                    color={selectedSector === sector.id ? sector.color : 'default'}
                    variant={selectedSector === sector.id ? 'filled' : 'outlined'}
                    onClick={() => setSelectedSector(sector.id)}
                    clickable
                  />
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Instância
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {INSTANCE_TYPES.map((instance) => (
                  <Chip
                    key={instance.id}
                    label={instance.name}
                    color={selectedInstance === instance.id ? instance.color : 'default'}
                    variant={selectedInstance === instance.id ? 'filled' : 'outlined'}
                    onClick={() => setSelectedInstance(instance.id)}
                    clickable
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estatísticas da Fila */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Na Fila
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

      {/* Botão Pegar Próximo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">
                Pegar Próximo Chat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema FIFO - {selectedSector} - {selectedInstance}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleGetNextChat}
              disabled={isLoading || !isConnected}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:arrow-right-fill" />
                )
              }
            >
              {isLoading ? 'Buscando...' : 'Pegar Próximo'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Chats Ativos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Meus Chats Ativos
          </Typography>
          
          {activeChatsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : activeChats.length === 0 ? (
            <EmptyContent
              title="Nenhum chat ativo"
              description="Você não possui chats em atendimento no momento"
              imgUrl="/assets/icons/empty/ic_chat.svg"
            />
          ) : (
            <Stack spacing={2}>
              {activeChats.map((chat) => (
                <Card key={chat._id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">
                          {chat.clienteName}
                        </Typography>
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
                        <Tooltip title="Abrir Chat">
                          <IconButton 
                            onClick={() => handleOpenChat(chat._id)}
                            color="primary"
                          >
                            <Iconify icon="eva:message-circle-fill" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Retornar para Fila">
                          <IconButton 
                            onClick={() => handleReturnToQueue(chat._id)}
                            color="warning"
                          >
                            <Iconify icon="eva:arrow-back-fill" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Fechar Chat">
                          <IconButton 
                            onClick={() => handleCloseChat(chat._id)}
                            color="error"
                          >
                            <Iconify icon="eva:close-fill" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      {notifications.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notificações
          </Typography>
          <Stack spacing={1}>
            {notifications.slice(-5).map((notification) => (
              <Alert 
                key={notification.id} 
                severity="info" 
                onClose={() => {/* Implementar limpeza */}}
              >
                {notification.message}
              </Alert>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
