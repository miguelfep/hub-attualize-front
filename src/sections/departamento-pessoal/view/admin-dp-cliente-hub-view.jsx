'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { paths } from 'src/routes/paths';

import { isClientePortalFlagAtiva } from 'src/utils/cliente-portal-flags';

import { getClientes, getClienteById } from 'src/actions/clientes';

import { AdminDpListView } from './admin-dp-list-view';

// ----------------------------------------------------------------------

function formatClienteOptionLabel(c) {
  if (!c) return '';
  const cod = c.codigo != null && String(c.codigo).trim() !== '' ? String(c.codigo) : '—';
  const rs = (c.razaoSocial || '').trim();
  return `${cod} - ${rs}`;
}

export function AdminDpClienteHubView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteParam = searchParams.get('cliente') || '';

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteRazaoFetched, setClienteRazaoFetched] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter((c) => isClientePortalFlagAtiva(c?.possuiFuncionario));
        if (!cancelled) setClientes(filtered);
      } catch {
        if (!cancelled) setClientes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = clientes.find((c) => (c._id || c.id) === clienteParam) ?? null;
  const razaoFromList = (selected?.razaoSocial || '').trim();

  useEffect(() => {
    let cancelled = false;
    if (razaoFromList) {
      setClienteRazaoFetched('');
    } else if (!clienteParam) {
      setClienteRazaoFetched('');
    } else {
      (async () => {
        try {
          const data = await getClienteById(clienteParam);
          const rs = (data?.razaoSocial || '').trim();
          if (!cancelled) setClienteRazaoFetched(rs);
        } catch {
          if (!cancelled) setClienteRazaoFetched('');
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [clienteParam, razaoFromList]);

  const clienteRazaoSocial = razaoFromList || clienteRazaoFetched;

  const onChangeCliente = useCallback(
    (_, value) => {
      const id = value?._id || value?.id || '';
      const qs = id ? `?cliente=${encodeURIComponent(id)}` : '';
      router.replace(`${paths.dashboard.cliente.departamentoPessoalHub}${qs}`);
    },
    [router]
  );

  const selector = (
    <Autocomplete
      fullWidth
      options={clientes}
      loading={loading}
      getOptionLabel={(option) => formatClienteOptionLabel(option)}
      isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
      value={selected}
      onChange={onChangeCliente}
      renderInput={(paramsInput) => (
        <TextField
          {...paramsInput}
          label="Cliente"
          helperText="Empresas com a opção Possui Funcionário ativa no cadastro"
        />
      )}
    />
  );

  return (
    <AdminDpListView
      clienteId={clienteParam}
      topSlot={selector}
      clienteRazaoSocial={clienteRazaoSocial}
    />
  );
}
