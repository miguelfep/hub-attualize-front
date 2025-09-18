import { useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';

import { useResponsive } from 'src/hooks/use-responsive';

import { ContactItem } from './ContactItem';
import { ContactFilters } from './ContactFilters';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function ContactList({ 
  contacts = [], 
  isLoading = false,
  filters,
  onFiltersChange,
  onClearFilters,
  onStartConversation,
  onSendMessage,
  onEdit,
  onDelete,
  currentUserId,
  availableTags = []
}) {
  const mdUp = useResponsive('up', 'md');

  // Estatísticas dos contatos
  const stats = useMemo(() => {
    const total = contacts.length;
    const withClient = contacts.filter(c => c.clienteId).length;
    const withoutClient = total - withClient;
    const byInstance = contacts.reduce((acc, contact) => {
      acc[contact.instanceType] = (acc[contact.instanceType] || 0) + 1;
      return acc;
    }, {});

    return { total, withClient, withoutClient, byInstance };
  }, [contacts]);

  // Agrupar contatos por instância
  const groupedContacts = useMemo(() => {
    const groups = {
      operacional: [],
      'financeiro-comercial': []
    };

    contacts.forEach(contact => {
      if (groups[contact.instanceType]) {
        groups[contact.instanceType].push(contact);
      }
    });

    return groups;
  }, [contacts]);

  const renderContactSkeleton = () => (
    <Stack spacing={1} sx={{ p: 2 }}>
      {[...Array(5)].map((_, index) => (
        <Stack key={index} direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} />
        </Stack>
      ))}
    </Stack>
  );

  const renderEmptyState = () => (
    <EmptyContent
      title="Nenhum contato encontrado"
      description="Não há contatos que correspondam aos filtros selecionados"
      imgUrl="/assets/illustrations/illustration_empty_content.svg"
    />
  );

  const renderContactGroup = (instanceType, contacts) => (
    <Box key={instanceType}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {instanceType === 'operacional' ? 'Operacional' : 'Financeiro/Comercial'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({contacts.length} contatos)
        </Typography>
      </Stack>
      
      <List disablePadding>
        {contacts.map((contact) => (
          <ContactItem
            key={contact._id}
            contact={contact}
            onStartConversation={onStartConversation}
            onSendMessage={onSendMessage}
            onEdit={onEdit}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />
        ))}
      </List>
      
      {contacts.length > 0 && <Divider sx={{ mx: 2 }} />}
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Filtros */}
      <ContactFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        availableTags={availableTags}
      />

      {/* Estatísticas */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Total: {stats.total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Com Cliente: {stats.withClient}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sem Cliente: {stats.withoutClient}
          </Typography>
          {stats.byInstance.operacional > 0 && (
            <Typography variant="caption" color="text.secondary">
              Operacional: {stats.byInstance.operacional}
            </Typography>
          )}
          {stats.byInstance['financeiro-comercial'] > 0 && (
            <Typography variant="caption" color="text.secondary">
              Financeiro/Comercial: {stats.byInstance['financeiro-comercial']}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Lista de contatos */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          renderContactSkeleton()
        ) : contacts.length === 0 ? (
          renderEmptyState()
        ) : (
          <Box>
            {filters.instanceType === 'all' || !filters.instanceType ? (
              // Mostrar agrupado por instância
              <>
                {renderContactGroup('operacional', groupedContacts.operacional)}
                {renderContactGroup('financeiro-comercial', groupedContacts['financeiro-comercial'])}
              </>
            ) : (
              // Mostrar filtrado por instância
              <List disablePadding>
                {contacts.map((contact) => (
                  <ContactItem
                    key={contact._id}
                    contact={contact}
                    onStartConversation={onStartConversation}
                    onSendMessage={onSendMessage}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    currentUserId={currentUserId}
                  />
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
} 