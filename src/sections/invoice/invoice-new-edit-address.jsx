import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { getClientes } from 'src/actions/clientes';

import { Iconify } from 'src/components/iconify';

import { AddressListDialog } from '../address';
import { NewClientDialog } from './view/invoice-new-client';
// ----------------------------------------------------------------------

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const mdUp = useResponsive('up', 'md');

  const values = watch();

  const { cliente } = values;

  const to = useBoolean();
  const newClientDialog = useBoolean();

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };

    fetchClientes();
  }, []);

  const handleAddClient = (newClient) => {
    setClientes((prev) => [...prev, newClient]);
    setValue('cliente', newClient);
  };

  return (
    <>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider
            flexItem
            orientation={mdUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ p: 3 }}
      >
        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Contratante:
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Attualize Contabil LTDA</Typography>
            <Typography variant="body2">Rua Dias da Rocha Filho 670</Typography>
            <Typography variant="body2">41 3068-1800</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Para:
            </Typography>

            <IconButton onClick={to.onTrue}>
              <Iconify icon={cliente ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {cliente ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{cliente.razaoSocial}</Typography>
              <Typography variant="body2">{cliente.nome}</Typography>
              <Typography variant="body2"> {cliente.whatsapp}</Typography>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.cliente?.message}
            </Typography>
          )}
        </Stack>
      </Stack>
      <AddressListDialog
        title="Clientes"
        open={to.value}
        onClose={to.onFalse}
        selected={(selectedId) => cliente?.id === selectedId}
        onSelect={(cliente) => setValue('cliente', cliente)}
        list={clientes}
        action={
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => {
              to.onFalse();
              newClientDialog.onTrue();
            }}
          >
            Novo Cliente
          </Button>
        }
      />
      <NewClientDialog
        open={newClientDialog.value}
        onClose={newClientDialog.onFalse}
        onAddClient={handleAddClient}
      />
    </>
  );
}
