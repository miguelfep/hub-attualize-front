import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function ClienteListDialog({
  list,
  action,
  selected,
  onSelect,
  title = 'Nova Alteração',
  selectedClient,
  notificarWhats,
  onNotificarChange,
}) {
  const [searchAddress, setSearchAddress] = useState('');
  const dataFiltered = applyFilter({ inputData: list, query: searchAddress });
  const notFound = !dataFiltered.length && !!searchAddress;

  const handleSearchAddress = useCallback((event) => {
    setSearchAddress(event.target.value);
  }, []);

  const handleSelectAddress = useCallback(
    (cliente) => {
      onSelect(cliente);
      setSearchAddress('');
    },
    [onSelect]
  );

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderList = (
    <Scrollbar sx={{ maxHeight: 320 }}>
      <Stack spacing={1}>
        {dataFiltered.map((cliente) => {
          const isSelected = selectedClient?._id === cliente._id;

          return (
            <Card
              key={cliente._id}
              onClick={() => handleSelectAddress(cliente)}
              sx={{
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s ease-in-out',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: isSelected ? 'primary.main' : 'grey.300',
                  color: isSelected ? 'white' : 'text.primary',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(cliente.nome)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {cliente.nome}
                </Typography>
                {cliente.razaoSocial && (
                  <Typography variant="body2" color="primary.main" noWrap>
                    {cliente.razaoSocial}
                  </Typography>
                )}
                <Stack direction="row" spacing={2} alignItems="center">
                  {cliente.cnpj && (
                    <Typography variant="caption" color="text.secondary">
                      {cliente.cnpj}
                    </Typography>
                  )}
                  {cliente.whatsapp && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon="ic:baseline-whatsapp" width={14} sx={{ color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {cliente.whatsapp}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              {isSelected && (
                <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'primary.main' }} />
              )}
            </Card>
          );
        })}
      </Stack>
    </Scrollbar>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:file-document-edit" width={28} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        value={searchAddress}
        onChange={handleSearchAddress}
        placeholder="Buscar cliente por nome ou razão social..."
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Selected Client Card */}
      {selectedClient ? (
        <Card
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'success.main',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              {getInitials(selectedClient.nome)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Iconify icon="eva:checkmark-circle-2-fill" width={18} sx={{ color: 'success.main' }} />
                <Typography variant="caption" color="success.dark" fontWeight="bold">
                  CLIENTE SELECIONADO
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedClient.nome}
              </Typography>
              {selectedClient.razaoSocial && (
                <Typography variant="body2" color="text.secondary">
                  {selectedClient.razaoSocial}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {selectedClient.cnpj}
              </Typography>
            </Box>
          </Stack>
        </Card>
      ) : (
        <Card
          sx={{
            p: 3,
            mb: 2,
            bgcolor: 'grey.50',
            border: '2px dashed',
            borderColor: 'grey.300',
            textAlign: 'center',
          }}
        >
          <Iconify icon="mdi:account-search" width={40} sx={{ color: 'grey.400', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Selecione um cliente na lista abaixo
          </Typography>
        </Card>
      )}

      {/* Notification Switch */}
      {onNotificarChange && (
        <Card
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: notificarWhats ? 'success.lighter' : 'grey.100',
            border: '1px solid',
            borderColor: notificarWhats ? 'success.light' : 'grey.300',
          }}
        >
          <Iconify
            icon={notificarWhats ? 'ic:baseline-whatsapp' : 'ic:baseline-notifications-off'}
            width={24}
            sx={{ color: notificarWhats ? 'success.main' : 'grey.500' }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={notificarWhats}
                onChange={(e) => onNotificarChange(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {notificarWhats ? 'Notificar cliente via WhatsApp' : 'Não notificar cliente'}
              </Typography>
            }
            sx={{ m: 0, flex: 1 }}
          />
        </Card>
      )}

      {/* Client List */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {dataFiltered.length} cliente(s) encontrado(s)
      </Typography>

      {notFound ? <SearchNotFound query={searchAddress} sx={{ py: 3 }} /> : renderList}

      {/* Action Button */}
      {action && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {action}
        </Box>
      )}
    </Box>
  );
}

function applyFilter({ inputData, query }) {
  if (!inputData) return [];

  if (query) {
    return inputData.filter(
      (cliente) =>
        cliente.nome?.toLowerCase().includes(query.toLowerCase()) ||
        cliente.razaoSocial?.toLowerCase().includes(query.toLowerCase()) ||
        cliente.cnpj?.includes(query)
    );
  }

  return inputData;
}