import dayjs from 'dayjs';

import { CONFIG } from 'src/config-global';
import { getClienteById } from 'src/actions/clientes';
import { obterExtratosPorMes } from 'src/actions/contabil';

import ConciliacaoPageView from 'src/sections/contabil/conciliacao/conciliacao-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Conciliação bancaria - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id: clienteId } = params;

  // Obtém o mês e ano atuais
  const currentDate = dayjs();
  const ano = currentDate.year();
  const mes = currentDate.month() + 1; // month() é zero-based em dayjs

  // Chama a API para buscar o extrato do cliente para o mês atual
  const extratos = await obterExtratosPorMes(clienteId, ano, mes);
  console.log(extratos);
  
  const cliente = await getClienteById(clienteId)

  // Retorna a view com os dados carregados
  return <ConciliacaoPageView cliente={cliente} extratos={extratos} currentDate={currentDate} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
