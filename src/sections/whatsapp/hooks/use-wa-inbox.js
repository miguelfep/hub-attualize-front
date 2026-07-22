import { useRef, useState, useEffect, useCallback } from 'react';

import {
  marcarLida,
  getConversa,
  getConversas,
  getMensagens,
} from 'src/actions/whatsapp';

import { useWaStream } from './use-wa-stream';

// ----------------------------------------------------------------------
// Orquestra o estado do inbox WhatsApp: lista de conversas (por aba/status),
// conversa selecionada, mensagens e a integração com o SSE. As rotas REST são a
// fonte da verdade; o SSE só complementa ao vivo.
// ----------------------------------------------------------------------

/** Aba (status) → filtro de listagem. `pendente` é a fila sem atendente. */
export const ABAS = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aberta', label: 'Em atendimento' },
  { value: 'resolvida', label: 'Resolvidas' },
];

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

/** Ordena por ultimaMensagemEm desc. */
function ordenar(lista) {
  return [...lista].sort(
    (a, b) => new Date(b.ultimaMensagemEm || 0) - new Date(a.ultimaMensagemEm || 0)
  );
}

export function useWaInbox() {
  const [aba, setAba] = useState('aberta');
  const [conversas, setConversas] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [selecionadaId, setSelecionadaId] = useState('');
  const [conversa, setConversa] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [carregandoConversa, setCarregandoConversa] = useState(false);

  // Ref pra o SSE enxergar sempre a seleção atual sem virar dependência.
  const selecionadaRef = useRef(selecionadaId);
  selecionadaRef.current = selecionadaId;

  // ------------------------------------------------------------------
  // Lista de conversas (por aba)
  // ------------------------------------------------------------------
  const carregarLista = useCallback(async () => {
    setCarregandoLista(true);
    try {
      const res = await getConversas({ status: aba, limit: 100 });
      setConversas(ordenar(res?.itens || []));
    } catch (error) {
      console.error('[wa] falha ao listar conversas', error);
    } finally {
      setCarregandoLista(false);
    }
  }, [aba]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  // ------------------------------------------------------------------
  // Conversa selecionada + mensagens
  // ------------------------------------------------------------------
  const selecionar = useCallback((id) => setSelecionadaId(id || ''), []);

  useEffect(() => {
    if (!selecionadaId) {
      setConversa(null);
      setMensagens([]);
      return undefined;
    }

    let ativo = true;
    setCarregandoConversa(true);

    (async () => {
      try {
        const [conv, msgs] = await Promise.all([
          getConversa(selecionadaId),
          getMensagens(selecionadaId, { limit: 100 }),
        ]);
        if (!ativo) return;
        setConversa(conv);
        setMensagens(msgs?.itens || []);

        // Zera não lidas ao abrir.
        await marcarLida(selecionadaId);
        if (!ativo) return;
        setConversas((prev) =>
          prev.map((c) => (c._id === selecionadaId ? { ...c, naoLidas: 0 } : c))
        );
      } catch (error) {
        console.error('[wa] falha ao abrir conversa', error);
      } finally {
        if (ativo) setCarregandoConversa(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [selecionadaId]);

  // Reatribui/atualiza a conversa selecionada no estado (após mutações REST).
  const atualizarConversaSelecionada = useCallback((conv) => {
    if (!conv) return;
    setConversa(conv);
    setConversas((prev) => {
      const existe = prev.some((c) => c._id === conv._id);
      const lista = existe ? prev.map((c) => (c._id === conv._id ? { ...c, ...conv } : c)) : prev;
      return ordenar(lista);
    });
  }, []);

  // Anexa uma mensagem enviada (retorno do POST) à thread aberta.
  const anexarMensagem = useCallback((msg) => {
    if (!msg) return;
    setMensagens((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
  }, []);

  // ------------------------------------------------------------------
  // SSE — atualizações ao vivo
  // ------------------------------------------------------------------
  const onEvent = useCallback(
    (tipo, envelope) => {
      const { conversaId, payload } = envelope || {};
      const aberta = selecionadaRef.current;

      switch (tipo) {
        case 'mensagem': {
          const { mensagem, conversa: conv } = payload || {};
          // Thread aberta: anexa a mensagem.
          if (conversaId === aberta && mensagem) {
            setMensagens((prev) =>
              prev.some((m) => m._id === mensagem._id) ? prev : [...prev, mensagem]
            );
          }
          // Lista: atualiza preview/naoLidas/ordem.
          setConversas((prev) => {
            const idx = prev.findIndex((c) => c._id === conversaId);
            if (idx === -1) {
              // Conversa nova nesta aba — puxa a versão completa.
              if (conv && conv.status === aba) return ordenar([conv, ...prev]);
              return prev;
            }
            const atual = prev[idx];
            const ehAberta = conversaId === aberta;
            const atualizada = {
              ...atual,
              ...(conv || {}),
              ultimaMensagemEm: mensagem?.timestampMeta || conv?.ultimaMensagemEm,
              ultimaMensagemPreview: mensagem?.texto ?? atual.ultimaMensagemPreview,
              naoLidas:
                mensagem?.direcao === 'inbound' && !ehAberta
                  ? (atual.naoLidas || 0) + 1
                  : ehAberta
                    ? 0
                    : atual.naoLidas,
            };
            const lista = [...prev];
            lista[idx] = atualizada;
            return ordenar(lista);
          });
          break;
        }

        case 'mensagem_status': {
          if (conversaId !== aberta) break;
          const { mensagemId, status } = payload || {};
          setMensagens((prev) =>
            prev.map((m) => (m._id === mensagemId ? { ...m, status } : m))
          );
          break;
        }

        case 'mensagem_midia': {
          if (conversaId !== aberta) break;
          const { mensagemId, urlPublica } = payload || {};
          setMensagens((prev) =>
            prev.map((m) =>
              m._id === mensagemId
                ? { ...m, midia: { ...(m.midia || {}), urlPublica, baixada: true } }
                : m
            )
          );
          break;
        }

        case 'atribuicao': {
          const { setores, atendente } = payload || {};
          const patch = { setores, atendente };
          if (conversaId === aberta) setConversa((c) => (c ? { ...c, ...patch } : c));
          setConversas((prev) =>
            prev.map((c) => (c._id === conversaId ? { ...c, ...patch } : c))
          );
          break;
        }

        case 'transferencia': {
          // Detalhes mudam; recarrega a conversa aberta e a lista.
          if (conversaId === aberta) {
            getConversa(conversaId).then(setConversa).catch(() => {});
          }
          carregarLista();
          break;
        }

        case 'conversa_status': {
          const { status } = payload || {};
          if (conversaId === aberta) setConversa((c) => (c ? { ...c, status } : c));
          setConversas((prev) => {
            // Se saiu da aba atual, some da lista; se entrou, deixa carregarLista repuxar.
            if (status && status !== aba) return prev.filter((c) => c._id !== conversaId);
            return prev.map((c) => (c._id === conversaId ? { ...c, status } : c));
          });
          break;
        }

        default:
          break;
      }
    },
    [aba, carregarLista]
  );

  const { conectado } = useWaStream(onEvent);

  return {
    // abas / lista
    aba,
    setAba,
    conversas,
    carregandoLista,
    recarregarLista: carregarLista,
    // seleção
    selecionadaId,
    selecionar,
    conversa,
    mensagens,
    carregandoConversa,
    // mutações locais
    atualizarConversaSelecionada,
    anexarMensagem,
    // realtime
    conectado,
    // util
    idOf,
  };
}
