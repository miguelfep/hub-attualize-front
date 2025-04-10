import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

const ITEM_HEIGHT = 64;

export function KanbanContactsDialog({
  clientes = [],
  cliente,
  handleChangeCliente,
  open,
  onClose,
}) {
  const [searchContact, setSearchContact] = useState('');

  const handleSearchContacts = useCallback((event) => {
    setSearchContact(event.target.value);
  }, []);

  const handleAssign = useCallback(
    (contact) => {
      const isAssigned = cliente && cliente.nome === contact.nome;
      handleChangeCliente(isAssigned ? null : contact); // Remove se já estiver selecionado, adiciona caso contrário
    },
    [cliente, handleChangeCliente]
  );

  const dataFiltered = applyFilter({ inputData: clientes, query: searchContact });
  const notFound = !dataFiltered.length && !!searchContact;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>
        Clientes <Typography component="span">({clientes.length})</Typography>
      </DialogTitle>

      <Box sx={{ px: 3, py: 2.5 }}>
        <TextField
          fullWidth
          value={searchContact}
          onChange={handleSearchContacts}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {notFound ? (
          <SearchNotFound query={searchContact} sx={{ mt: 3, mb: 10 }} />
        ) : (
          <Scrollbar sx={{ height: ITEM_HEIGHT * 6, px: 2.5 }}>
            <Box component="ul">
              {dataFiltered.map((contact) => {
                const isAssigned = cliente && cliente.nome === contact.nome;

                return (
                  <Box
                    component="li"
                    key={contact.id}
                    sx={{
                      gap: 2,
                      display: 'flex',
                      height: ITEM_HEIGHT,
                      alignItems: 'center',
                    }}
                  >
                    <Avatar src={contact.avatarUrl} />
                    <ListItemText
                      primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
                      secondaryTypographyProps={{ typography: 'caption' }}
                      primary={contact.nome}
                      secondary={contact.email}
                    />
                    <Button
                      size="small"
                      color={isAssigned ? 'primary' : 'inherit'}
                      onClick={() => handleAssign(contact)}
                      startIcon={
                        <Iconify
                          width={16}
                          icon={isAssigned ? 'eva:checkmark-fill' : 'mingcute:add-line'}
                          sx={{ mr: -0.5 }}
                        />
                      }
                    >
                      {isAssigned ? 'Remover' : 'Adicionar'}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Scrollbar>
        )}
      </DialogContent>
    </Dialog>
  );
}

function applyFilter({ inputData, query }) {
  if (query) {
    inputData = inputData.filter(
      (contact) =>
        contact.nome.toLowerCase().includes(query.toLowerCase()) ||
        contact.email.toLowerCase().includes(query.toLowerCase())
    );
  }
  return inputData;
}
