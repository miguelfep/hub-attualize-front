'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';

import ClienteBancosSection from 'src/sections/cliente/cliente-bancos-section';

// ----------------------------------------------------------------------

export default function AdminContabilBancosPage() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingClientes(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        if (!cancelled) setClientes(data || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setClientes([]);
      } finally {
        if (!cancelled) setLoadingClientes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clienteId = clienteSelecionado?._id || clienteSelecionado?.id || null;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">Bancos — portal do cliente</Typography>
        <Typography variant="body2" color="text.secondary">
          Cadastro, edição, desativação e reativação das contas bancárias usadas na conciliação. Selecione o
          cliente abaixo (mesmas rotas do cadastro de cliente: financeiro e contas).
        </Typography>
      </Stack>

      <Card sx={{ p: 2, mb: 3 }}>
        <Autocomplete
          loading={loadingClientes}
          options={clientes}
          getOptionLabel={(o) => formatClienteCodigoRazao(o)}
          isOptionEqualToValue={(a, b) => String(a?._id || a?.id) === String(b?._id || b?.id)}
          value={clienteSelecionado}
          onChange={(_, v) => setClienteSelecionado(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cliente"
              placeholder="Buscar por código ou razão social"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingClientes ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          ListboxProps={{ sx: { maxHeight: 320 } }}
        />
      </Card>

      {!clienteId && (
        <Alert severity="info">Escolha um cliente para listar e gerenciar as contas bancárias.</Alert>
      )}

      {clienteId ? <ClienteBancosSection clienteId={clienteId} /> : null}
    </Box>
  );
}
