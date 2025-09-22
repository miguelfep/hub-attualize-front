'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetConversations } from 'src/actions/chat';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useMockedUser } from 'src/auth/hooks';

import { ContactList } from './contact-list';

// ----------------------------------------------------------------------

export function ChatIntegration({ onContactSelect }) {
  const router = useRouter();
  const { user } = useMockedUser();

  const [showContacts, setShowContacts] = useState(false);

  // Usar o hook do chat para buscar conversas
  const { conversations, conversationsLoading, conversationsError } = useGetConversations();

  const handleContactSelect = useCallback((contactId) => {
    setShowContacts(false);
    onContactSelect?.(contactId);
  }, [onContactSelect]);

  const renderLoading = (
    <Stack sx={{ width: 1, height: 200 }}>
      <LinearProgress color="inherit" sx={{ height: 2, width: 1 }} />
    </Stack>
  );

  const renderEmpty = (
    <EmptyContent
      title="Nenhuma conversa recente"
      description="Inicie uma nova conversa para começar"
      sx={{ py: 5 }}
    />
  );

  const renderRecentChats = (
    <Stack spacing={2}>
      {conversations.allIds.map((conversationId) => {
        const conversation = conversations.byId[conversationId];
        return (
          <Card key={conversationId} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 40, height: 40 }}>
                {conversation.contact?.name?.charAt(0).toUpperCase() || 'C'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {conversation.contact?.name || 'Contato'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {conversation.lastMessage?.content || 'Nenhuma mensagem'}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => router.push(`${paths.dashboard.chat}?id=${conversationId}`)}
              >
                Abrir
              </Button>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Conversas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setShowContacts(true)}
        >
          Nova Conversa
        </Button>
      </Stack>

      {conversationsLoading && renderLoading}
      
      {!conversationsLoading && conversations.allIds.length === 0 && renderEmpty}
      
      {!conversationsLoading && conversations.allIds.length > 0 && renderRecentChats}

      {/* Modal de seleção de contatos */}
      <Dialog
        open={showContacts}
        onClose={() => setShowContacts(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Selecionar Contato</DialogTitle>
        <DialogContent>
          <ContactList />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
