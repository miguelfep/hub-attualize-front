import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { getLeads } from 'src/actions/lead';
import { getClientes } from 'src/actions/clientes';

import { Iconify } from 'src/components/iconify';

import { ClienteLeadDialog } from 'src/sections/cliente/view/cliente-lead-dialog';

import { NewLeadDialog } from './view/invoice-new-client';
// ----------------------------------------------------------------------

export function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const mdUp = useResponsive('up', 'md');

  const values = watch();

  const { cliente: clienteValue, lead: leadValue } = values;
  const selectedPerson = clienteValue || leadValue;
  
  console.log('InvoiceNewEditAddress selected:', selectedPerson);

  const to = useBoolean();
  const newClientDialog = useBoolean();

  const [clientes, setClientes] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, leadsData] = await Promise.all([
          getClientes(),
          getLeads(),
        ]);
        const clientesArray = Array.isArray(clientesData)
          ? clientesData
          : clientesData?.data || clientesData?.clientes || [];

        const leadsArray = Array.isArray(leadsData)
          ? leadsData
          : leadsData?.leads || leadsData?.data || [];

        setClientes(clientesArray);
        setLeads(leadsArray);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddClient = (newClient) => {
    setClientes((prev) => [...prev, newClient]);
    setValue('cliente', newClient);
    setValue('lead', null);
  };

  const handleAddLead = (newLead) => {
    setLeads((prev) => {
      const exists = prev.find((lead) => lead._id === newLead._id);

      if (exists) {
        return prev.map(item => item._id === newLead._id ? newLead : item);
      }
      return [...prev, newLead];
    });

    setValue('lead', newLead);
    setValue('cliente', null);
    to.onTrue();
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
            <Typography variant="body2">Avenida Senador Salgado Filho 1847</Typography>
            <Typography variant="body2">41 99698-2267</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Para:
            </Typography>

            <IconButton onClick={to.onTrue}>
              <Iconify icon={selectedPerson ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {selectedPerson ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{selectedPerson.razaoSocial || selectedPerson.nome}</Typography>
              <Typography variant="body2">{selectedPerson.nome}</Typography>
              <Typography variant="body2"> {selectedPerson.whatsapp || selectedPerson.telefone || '-'}</Typography>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.cliente?.message || errors.lead?.message}
            </Typography>
          )}
        </Stack>
      </Stack>
      <ClienteLeadDialog
        key={`dialog-${leads.length}-${clientes.length}`}
        title="Clientes e Leads"
        open={to.value}
        onClose={to.onFalse}
        selected={(selectedId) => selectedPerson?._id === selectedId || selectedPerson?.id === selectedId}
        onSelect={(item) => {
          if (item.__type === 'lead') {
            setValue('lead', item);
            setValue('cliente', null);
          } else {
            setValue('cliente', item);
            setValue('lead', null);
          }
        }}
        clientes={clientes}
        leads={leads}
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
            Novo Lead
          </Button>
        }
      />
      <NewLeadDialog
        open={newClientDialog.value}
        onClose={newClientDialog.onFalse}
        onAddLead={handleAddLead}
      />
    </>
  );
}
