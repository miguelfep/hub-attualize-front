'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSocket, useQueueEvents, useNotifications } from 'src/hooks/use-socket';

import { useGetAllChats, useGetChatStats, getNextChatFromQueue } from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const SECTORS = [
  { value: 'atendimento', label: 'Atendimento', color: 'primary' },
  { value: 'financeiro', label: 'Financeiro', color: 'success' },
  { value: 'comercial', label: 'Comercial', color: 'warning' },
  { value: 'societario', label: 'Societário', color: 'info' },
  { value: 'contabil', label: 'Contábil', color: 'secondary' },
];

const INSTANCE_TYPES = [
  { value: 'operacional', label: 'Operacional', color: 'primary' },
  { value: 'financeiro-comercial', label: 'Financeiro-Comercial', color: 'success' },
];

// ----------------------------------------------------------------------

export function ChatDashboard() {
  const router = useRouter();
  const { user } = useMockedUser();

  const [selectedSector, setSelectedSector] = useState('atendimento');
  const [selectedInstance, setSelectedInstance] = useState('operacional');
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  // Hooks para dados
  const { stats = {}, statsLoading } = useGetChatStats();
  const { chats = [], chatsLoading } = useGetAllChats({ 
    status: 'na_fila',
    instanceType: selectedInstance,
    sector: selectedSector 
  });

  // Hooks para WebSocket
  const { isConnected } = useSocket();
  const { queueStats } = useQueueEvents(selectedSector, selectedInstance);
  const { notifications = [] } = useNotifications();

  // Pegar próximo chat da fila
  const handleGetNextChat = useCallback(async () => {
    try {
      setIsLoadingNext(true);
      const response = await getNextChatFromQueue(selectedSector, selectedInstance);
      
      if (response.success && response.data) {
        // Redirecionar para o chat
        router.push(`${paths.dashboard.chat}?id=${response.data._id}`);
      } else {
        // Nenhum chat na fila - mostrar notificação
        console.log('Nenhum chat disponível na fila');
        // Aqui você pode adicionar uma notificação toast
      }
    } catch (error) {
      console.error('Erro ao pegar próximo chat:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setIsLoadingNext(false);
    }
  }, [selectedSector, selectedInstance, router]);

  // Renderizar estatísticas
  const renderStats = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" color="primary">
            {stats?.totalChats || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total de Chats
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" color="warning.main">
            {stats?.chatsInQueue || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Na Fila
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" color="success.main">
            {stats?.chatsInProgress || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Em Atendimento
          </Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h3" color="error.main">
            {stats?.chatsClosed || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fechados
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  // Renderizar controles de fila
  const renderQueueControls = (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Controle de Fila</Typography>
        
        {/* Status de conexão */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isConnected ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Typography>
        </Stack>

        {/* Seleção de setor */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">Setor:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {SECTORS.map((sector) => (
              <Chip
                key={sector.value}
                label={sector.label}
                color={selectedSector === sector.value ? sector.color : 'default'}
                variant={selectedSector === sector.value ? 'filled' : 'outlined'}
                onClick={() => setSelectedSector(sector.value)}
                clickable
              />
            ))}
          </Stack>
        </Stack>

        {/* Seleção de instância */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">Instância:</Typography>
          <Stack direction="row" spacing={1}>
            {INSTANCE_TYPES.map((instance) => (
              <Chip
                key={instance.value}
                label={instance.label}
                color={selectedInstance === instance.value ? instance.color : 'default'}
                variant={selectedInstance === instance.value ? 'filled' : 'outlined'}
                onClick={() => setSelectedInstance(instance.value)}
                clickable
              />
            ))}
          </Stack>
        </Stack>

        {/* Estatísticas da fila */}
        {queueStats && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Estatísticas da Fila:</Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                Na fila: <strong>{queueStats.inQueue || 0}</strong>
              </Typography>
              <Typography variant="body2">
                Tempo médio: <strong>{queueStats.averageWaitTime || '0min'}</strong>
              </Typography>
            </Stack>
          </Stack>
        )}

        {/* Botão para pegar próximo chat */}
        <Button
          variant="contained"
          size="large"
          onClick={handleGetNextChat}
          disabled={isLoadingNext || chatsLoading || !isConnected}
          startIcon={
            isLoadingNext ? (
              <Iconify icon="eos-icons:loading" />
            ) : (
              <Iconify icon="eva:message-circle-fill" />
            )
          }
          sx={{
            minHeight: 48,
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          {isLoadingNext ? 'Buscando Chat...' : 'Pegar Próximo Chat'}
        </Button>

        {/* Informações adicionais */}
        {!isConnected && (
          <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
            ⚠️ Conecte-se ao WebSocket para usar o sistema de chat
          </Typography>
        )}
      </Stack>
    </Card>
  );

  // Renderizar lista de chats na fila
  const renderQueueList = (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Chats na Fila</Typography>
        
        {chatsLoading ? (
          <LinearProgress />
        ) : !Array.isArray(chats) || chats.length === 0 ? (
          <EmptyContent
            title="Nenhum chat na fila"
            description="Não há chats aguardando atendimento no momento"
            sx={{ py: 5 }}
          />
        ) : (
          <Stack spacing={1}>
            {chats.map((chat) => (
              <Card key={chat._id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {chat.clienteName || 'Cliente'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {chat.whatsappNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(chat.lastMessageAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Atribuir chat">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`${paths.dashboard.chat}?id=${chat._id}`)}
                        color="primary"
                      >
                        <Iconify icon="eva:message-circle-fill" />
                      </IconButton>
                    </Tooltip>
                    
                    <Chip
                      label={chat.status || 'na_fila'}
                      size="small"
                      color={chat.status === 'na_fila' ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );

  // Renderizar notificações
  const renderNotifications = notifications.length > 0 && (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Notificações Recentes</Typography>
        <Stack spacing={1}>
          {notifications.slice(-5).map((notification) => (
            <Card key={notification.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify 
                  icon={notification.type === 'new_chat' ? 'eva:message-circle-fill' : 'eva:bell-fill'} 
                  color={notification.type === 'new_chat' ? 'primary.main' : 'warning.main'}
                />
                <Box>
                  <Typography variant="body2">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Card>
  );

  if (statsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Dashboard de Chat</Typography>
        
        {renderStats}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderQueueControls}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderQueueList}
          </Grid>
        </Grid>

        {renderNotifications}
      </Stack>
    </Box>
  );
}
