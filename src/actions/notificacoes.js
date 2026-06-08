import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// Notificações in-app de tarefas (sino do header).
//
// Contrato da API (backend):
//   GET   /api/tarefas/notificacoes?lida=&page=&limit=
//                                  -> { data, total, page, limit, naoLidas }
//   PATCH /api/tarefas/notificacoes/:id/lida
//   PATCH /api/tarefas/notificacoes/:id/nao-lida
//   PATCH /api/tarefas/notificacoes/marcar-todas-lidas
//
// Notificacao:
//   { _id, tipo, titulo, mensagem, lida, createdAt, dataLeitura?,
//     tarefa?: { _id, titulo, status } }
//
// Se a chamada falhar, os hooks degradam para lista vazia (sem erro visível)
// graças ao `shouldRetryOnError: false`.
// ----------------------------------------------------------------------

const SWR_OPTIONS = {
  refreshInterval: 60000, // polling a cada 60s
  revalidateOnFocus: true,
  shouldRetryOnError: false,
};

export function useGetNotificacoes() {
  const { data, isLoading, error, mutate } = useSWR(
    endpoints.notificacoes.root,
    fetcher,
    SWR_OPTIONS
  );

  return useMemo(() => {
    const lista = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    const naoLidas =
      typeof data?.naoLidas === 'number'
        ? data.naoLidas
        : lista.filter((n) => !n.lida).length;

    return {
      notificacoes: lista,
      naoLidas,
      isLoading,
      error,
      mutate,
    };
  }, [data, isLoading, error, mutate]);
}

// ----------------------------------------------------------------------

/**
 * Lista notificações com filtro/paginação (para a página de gerenciamento).
 * @param {{ lida?: 'true'|'false', page?: number, limit?: number }} [params]
 * @returns `{ data, total, page, limit, naoLidas }`
 */
export async function getNotificacoes(params = {}) {
  const limpos = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const res = await axios.get(endpoints.notificacoes.root, { params: limpos });
  return res.data;
}

// ----------------------------------------------------------------------

export async function marcarNotificacaoLida(id) {
  await axios.patch(endpoints.notificacoes.lida(id));
}

/**
 * Marca várias notificações como lidas/não lidas (loop — não há endpoint de
 * bulk arbitrário). Retorna `{ ok, falhas }`.
 */
export async function marcarVariasNotificacoes(ids = [], lida = true) {
  const fn = lida ? marcarNotificacaoLida : marcarNotificacaoNaoLida;
  const results = await Promise.allSettled(ids.map((id) => fn(id)));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  return { ok, falhas: results.length - ok };
}

export async function marcarNotificacaoNaoLida(id) {
  await axios.patch(endpoints.notificacoes.naoLida(id));
}

export async function marcarTodasNotificacoesLidas() {
  await axios.patch(endpoints.notificacoes.marcarTodasLidas);
}
