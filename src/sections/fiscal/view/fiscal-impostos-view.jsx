'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FiscalPgdasPanel } from '../components/fiscal-pgdas-panel';
import { FiscalDctfWebPanel } from '../components/fiscal-dctfweb-panel';
import { FiscalPagtoWebPanel } from '../components/fiscal-pagto-web-panel';

const TABS = [
  {
    value: 'pgdas',
    label: 'PGDAS-D Simples Nacional',
    icon: <Iconify icon="solar:calculator-bold-duotone" width={22} />,
  },
  {
    value: 'dctfweb',
    label: 'DCTFWeb',
    icon: <Iconify icon="solar:document-bold-duotone" width={22} />,
  },
  {
    value: 'pagto-web',
    label: 'Pagto Web',
    icon: <Iconify icon="solar:wallet-money-bold-duotone" width={22} />,
  },
];

export function FiscalImpostosView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteParam = searchParams.get('cliente') || '';
  const tabParam = searchParams.get('tab') || '';
  const loteParam = searchParams.get('lote') || '';

  const tabs = useTabs('pgdas');

  // Deep-link (ex.: notificação de fila DCTFWeb finalizada) — abre direto na aba pedida.
  const { setValue: setTab } = tabs;
  useEffect(() => {
    if (tabParam && TABS.some((t) => t.value === tabParam)) setTab(tabParam);
  }, [tabParam, setTab]);

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingClientes(true);
        const data = await getClientes({ status: true, tipoContato: 'cliente' });
        if (!cancelled) setClientes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setClientes([]);
      } finally {
        if (!cancelled) setLoadingClientes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // A aba PGDAS-D é exclusiva do Simples Nacional, então filtra fora Lucro Real/Presumido/PF/MEI.
  const clientesSimples = useMemo(
    () => clientes.filter((c) => c.regimeTributario === 'simples'),
    [clientes]
  );

  const selectedCliente = useMemo(
    () => clientes.find((c) => c._id === clienteParam) ?? null,
    [clientes, clienteParam]
  );

  const selectedClienteSimples = useMemo(
    () => clientesSimples.find((c) => c._id === clienteParam) ?? null,
    [clientesSimples, clienteParam]
  );

  const handleClienteChange = useCallback(
    (_, value) => {
      const id = value?._id || '';
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('cliente', id);
      else params.delete('cliente');
      const qs = params.toString();
      router.replace(qs ? `${paths.dashboard.fiscal.impostos}?${qs}` : paths.dashboard.fiscal.impostos);
    },
    [router, searchParams]
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Impostos' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ mb: 3 }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {tabs.value === 'pgdas' && (
        <FiscalPgdasPanel
          clientes={clientesSimples}
          loadingClientes={loadingClientes}
          clienteParam={clienteParam}
          selectedCliente={selectedClienteSimples}
          onClienteChange={handleClienteChange}
        />
      )}

      {tabs.value === 'dctfweb' && (
        <FiscalDctfWebPanel
          clientes={clientes}
          loadingClientes={loadingClientes}
          clienteParam={clienteParam}
          selectedCliente={selectedCliente}
          onClienteChange={handleClienteChange}
          loteParam={loteParam}
        />
      )}

      {tabs.value === 'pagto-web' && (
        <FiscalPagtoWebPanel
          clientes={clientes}
          loadingClientes={loadingClientes}
          clienteParam={clienteParam}
          selectedCliente={selectedCliente}
          onClienteChange={handleClienteChange}
        />
      )}
    </DashboardContent>
  );
}
