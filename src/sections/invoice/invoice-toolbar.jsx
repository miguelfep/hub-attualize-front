'use client';

import { toast } from 'sonner';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { enviarPedidoOrcamento } from 'src/actions/invoices';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceToolbar({ invoice, currentStatus, statusOptions = [], onChangeStatus }) {
  const router = useRouter();

  // Normalização do ID
  const invoiceId = invoice?._id || invoice?.id || '';

  const handleEdit = useCallback(() => {
    if (invoiceId) {
      router.push(paths.dashboard.invoice.edit(String(invoiceId)));
    }
  }, [invoiceId, router]);

  const handleSend = useCallback(async () => {
    if (!invoiceId) return;
    try {
      const res = await enviarPedidoOrcamento(invoiceId);
      if (res?.status === 200) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        toast.error(res?.data?.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      toast.error(error?.message || 'Erro ao enviar mensagem');
    }
  }, [invoiceId]);

  return (
    <Stack
      spacing={3}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      sx={{ mb: { xs: 3, md: 5 } }}
    >
      <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
        <Tooltip title="Editar">
          <IconButton onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Enviar link">
          <IconButton onClick={handleSend}>
            <Iconify icon="iconamoon:send-fill" />
          </IconButton>
        </Tooltip>
      </Stack>

      <TextField
        fullWidth
        select
        label="Status"
        value={currentStatus || ''}
        onChange={onChangeStatus}
        sx={{ maxWidth: 160 }}
      >
        {statusOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}