'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetContacts, sendQuickMessage, startConversation } from 'src/actions/contacts';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ContactList() {
  const router = useRouter();
  const { user } = useMockedUser();

  const [search, setSearch] = useState('');
  const [instanceType, setInstanceType] = useState('operacional');

  // Usar o hook das actions
  const { contacts, contactsLoading, contactsError } = useGetContacts({ 
    instanceType, 
    search 
  });

  // Iniciar conversa
  const handleStartConversation = useCallback(async (contactId) => {
    try {
      const data = await startConversation(contactId, user?.id, instanceType);
      if (data.success) {
        router.push(`${paths.dashboard.chat}?id=${data.data._id}`);
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast.error('Erro ao iniciar conversa');
    }
  }, [user?.id, instanceType, router]);

  // Enviar mensagem rápida
  const handleQuickMessage = useCallback(async (contactId, message) => {
    try {
      const data = await sendQuickMessage(contactId, message, user?.id);
      if (data.success) {
        toast.success('Mensagem enviada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  }, [user?.id]);

  const handleQuickMessagePrompt = useCallback((contactId) => {
    const message = prompt('Digite a mensagem:');
    if (message) {
      handleQuickMessage(contactId, message);
    }
  }, [handleQuickMessage]);

  const renderLoading = (
    <Stack sx={{ width: 1, height: 320 }}>
      <LinearProgress color="inherit" sx={{ height: 2, width: 1 }} />
    </Stack>
  );

  const renderEmpty = (
    <EmptyContent
      title="Nenhum contato encontrado"
      description="Tente ajustar seus filtros ou criar um novo contato"
      sx={{ py: 10 }}
    />
  );

  const renderFilters = (
    <Stack spacing={3} sx={{ mb: 3 }}>
      <TextField
        label="Buscar contatos"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
        }}
      />
      
      <Stack direction="row" spacing={1}>
        <Button
          variant={instanceType === 'operacional' ? 'contained' : 'outlined'}
          onClick={() => setInstanceType('operacional')}
          size="small"
        >
          Operacional
        </Button>
        
        <Button
          variant={instanceType === 'financeiro-comercial' ? 'contained' : 'outlined'}
          onClick={() => setInstanceType('financeiro-comercial')}
          size="small"
        >
          Financeiro/Comercial
        </Button>
      </Stack>
    </Stack>
  );

  const renderContacts = (
    <Grid container spacing={3}>
      {contacts.map((contact) => (
        <Grid key={contact._id} xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 48, height: 48 }}>
                  {contact.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {contact.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {contact.whatsappNumber}
                  </Typography>
                  {contact.clienteId && (
                    <Typography variant="caption" color="primary.main">
                      Cliente: {contact.clienteId.nome}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                  {contact.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="soft" />
                  ))}
                </Stack>
              )}

              {/* Ações */}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
                  onClick={() => handleStartConversation(contact._id)}
                  sx={{ flex: 1 }}
                >
                  Chat
                </Button>
                
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:phone-bold" />}
                  onClick={() => handleQuickMessagePrompt(contact._id)}
                  sx={{ flex: 1 }}
                >
                  Mensagem
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">
          Contatos - {instanceType === 'operacional' ? 'Operacional' : 'Financeiro/Comercial'}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => router.push(paths.dashboard.contacts?.new || '/dashboard/contacts/new')}
        >
          Novo Contato
        </Button>
      </Stack>

      {renderFilters}

      {contactsLoading && renderLoading}
      
      {!contactsLoading && contacts.length === 0 && renderEmpty}
      
      {!contactsLoading && contacts.length > 0 && renderContacts}
    </Stack>
  );
}
