import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';



// ----------------------------------------------------------------------

export function ClienteListDialog({
  list,
  action,
  selected,
  onSelect,
  title = 'Lista de Clientes',
  selectedClient,
}) {

  const [searchAddress, setSearchAddress] = useState('');
  const dataFiltered = applyFilter({ inputData: list, query: searchAddress });
  const notFound = !dataFiltered.length && !!searchAddress;
  const handleSearchAddress = useCallback((event) => {

    setSearchAddress(event.target.value);
  }, []);

  const handleSelectAddress = useCallback((cliente) => {
    onSelect(cliente);
    setSearchAddress('');
  }, [onSelect]
  );

  const renderList = (
    <Scrollbar sx={{ p: 0.5, maxHeight: 480 }}>
      {dataFiltered.map((cliente) => (
        <ButtonBase
          key={cliente._id}
          onClick={() => handleSelectAddress(cliente)}
          sx={{
            py: 1,
            my: 0.5,
            px: 1.5,
            gap: 0.5,
            width: 1,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            opacity: selectedClient?._id === cliente._id ? 0.6 : 1,
            ...(selected(`${cliente._id}`) && {
              bgcolor: 'action.selected',
            }),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{cliente.nome}</Typography>
          </Stack>

          {cliente.razaoSocial && (
            <Box sx={{ color: 'primary.main', typography: 'caption' }}>{cliente.razaoSocial}</Box>
          )}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {cliente.cnpj}
          </Typography>

          {cliente.whatsapp && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {cliente.whatsapp}
            </Typography>
          )}
        </ButtonBase>
      ))}
    </Scrollbar>
  );


  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 2 }}
      >
        <Typography variant="h6"> {title} </Typography>
        {action && action}
      </Stack>
      <Stack sx={{ pb: 2 }}>
        <TextField
          value={searchAddress}
          onChange={handleSearchAddress}
          placeholder="Buscar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {notFound ? (
        <SearchNotFound query={searchAddress} sx={{ pt: 3, pb: 5 }} />
      ) : (
        renderList
      )}
    </Box>
  );
}

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (cliente) =>
        cliente.nome.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        cliente.razaoSocial.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${cliente.razaoSocial}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;

}