'use client';

import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import { useResponsive } from 'src/hooks/use-responsive';

import { useMockedUser } from 'src/auth/hooks';
import { useContacts, useContactActions } from 'src/hooks/useContacts';

import { ContactList } from 'src/components/contact/ContactList';
import { ContactEditModal } from 'src/components/contact/ContactEditModal';
import { ContactDeleteModal } from 'src/components/contact/ContactDeleteModal';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ContatosPage() {
  const mdUp = useResponsive('up', 'md');
  const { user } = useMockedUser();

  // Estados
  const [filters, setFilters] = useState({
    instanceType: 'all',
    search: '',
    tags: [],
    hasClient: undefined
  });
  
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);

  // Hooks
  const { contacts, isLoading, error, refetch } = useContacts(filters);
  const { 
    startConversation, 
    sendMessageToContact, 
    updateContact, 
    deleteContact,
    isLoading: isActionLoading 
  } = useContactActions();

  // Tags disponíveis
  const availableTags = useMemo(() => {
    const allTags = contacts.flatMap(contact => contact.tags || []);
    return [...new Set(allTags)].sort();
  }, [contacts]);

  // Handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      instanceType: 'all',
      search: '',
      tags: [],
      hasClient: undefined
    });
  };

  const handleStartConversation = async (contactId, instanceType, userId) => {
    try {
      await startConversation(contactId, instanceType, userId);
      // Redirecionar para o chat
      window.location.href = `/dashboard/chat?contactId=${contactId}`;
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  };

  const handleSendMessage = async (contactId, userId) => {
    try {
      await sendMessageToContact(contactId, 'Olá! Como posso ajudar?', userId);
      // Redirecionar para o chat
      window.location.href = `/dashboard/chat?contactId=${contactId}`;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
  };

  const handleDeleteContact = (contact) => {
    setDeletingContact(contact);
  };

  const handleUpdateContact = async (contactId, updateData) => {
    try {
      await updateContact(contactId, updateData);
      setEditingContact(null);
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
    }
  };

  const handleDeleteContactConfirm = async (contactId) => {
    try {
      await deleteContact(contactId);
      setDeletingContact(null);
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" gutterBottom>
              Contatos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie seus contatos e inicie conversas
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={refetch}
              disabled={isLoading}
              color="inherit"
            >
              <Iconify icon="eva:refresh-fill" />
            </IconButton>
            
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setEditingContact({})}
            >
              Novo Contato
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Lista de contatos */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ContactList
          contacts={contacts}
          isLoading={isLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onStartConversation={handleStartConversation}
          onSendMessage={handleSendMessage}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
          currentUserId={user?.id}
          availableTags={availableTags}
        />
      </Box>

      {/* Modais */}
      {editingContact && (
        <ContactEditModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={handleUpdateContact}
          isLoading={isActionLoading}
        />
      )}

      {deletingContact && (
        <ContactDeleteModal
          contact={deletingContact}
          onClose={() => setDeletingContact(null)}
          onConfirm={handleDeleteContactConfirm}
          isLoading={isActionLoading}
        />
      )}
    </Box>
  );
} 