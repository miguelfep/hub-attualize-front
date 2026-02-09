import { notFound } from 'next/navigation';

import { CONFIG } from 'src/config-global';
import { getInvoiceById } from 'src/actions/invoices';

import { InvoiceDetailsView } from 'src/sections/invoice/view';

export const metadata = { title: `Detalhes da venda | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params: paramsPromise }) {
  const params = await paramsPromise;
  const { id } = params;

  const data = await getInvoiceById(id);
  if (!data) return notFound();

  // Lavagem de JSON para garantir que nenhum Proxy do Next 16 cause conflito com o PDF
  const safeInvoice = JSON.parse(JSON.stringify(data.invoice || data));
  const safeNfses = JSON.parse(JSON.stringify(data.nfses || []));

  return <InvoiceDetailsView invoice={safeInvoice} nfses={safeNfses} />;
}

export const dynamic = 'force-dynamic';