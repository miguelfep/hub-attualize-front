'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { downloadLicenca, listarLicencasPorCliente } from 'src/actions/societario';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { LicencaRow } from 'src/sections/societario/licenca/LicencaRow';

// ----------------------------------------------------------------------

function normalizarListaLicencas(res) {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function ClienteLicencasSection({ clienteId }) {
  const router = useRouter();
  const [licencas, setLicencas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!clienteId) {
      setLicencas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await listarLicencasPorCliente(clienteId, {
        page: 1,
        limit: 100,
        sortBy: 'dataVencimento',
        sortOrder: 'asc',
      });
      setLicencas(normalizarListaLicencas(res));
    } catch (error) {
      console.error('Erro ao carregar licenças do cliente:', error);
      toast.error('Não foi possível carregar as licenças deste cliente.');
      setLicencas([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleDownload = async (id, nome) => {
    try {
      const response = await downloadLicenca(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (nome || 'licenca').replace(/[^\w\s-]/g, '').trim() || 'licenca';
      link.setAttribute('download', `${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao baixar o arquivo da licença.');
    }
  };

  if (!clienteId) {
    return (
      <Typography variant="body2" color="text.secondary">
        Salve o cliente para associar licenças.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="h6">Licenças e alvarás</Typography>
          <Typography variant="body2" color="text.secondary">
            Licenças cadastradas no módulo societário para esta empresa.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="eva:external-link-fill" />}
          onClick={() => router.push(paths.dashboard.aberturas.licenca)}
        >
          Abrir módulo de licenças
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : licencas.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="solar:document-text-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nenhuma licença cadastrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre licenças e alvarás na tela de Licenças do dashboard.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {licencas.map((licenca) => (
            <LicencaRow key={licenca._id} licenca={licenca} onDownload={handleDownload} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
