import { useRef, useState, useEffect, useCallback } from 'react';

import {
  getCanaisChat,
  marcarLidoChat,
  getMensagensChat,
} from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';

import { useChatStream } from './use-chat-stream';

// ----------------------------------------------------------------------
// Orquestra o estado do chat interno: lista de conversas (canais + DMs),
// conversa selecionada, mensagens e integração com o SSE. As rotas REST são a
// fonte da verdade; o SSE complementa ao vivo.
// ----------------------------------------------------------------------

/** Ordena por ultimaMensagemEm desc (sem mensagem: updatedAt/createdAt). */
function ordenar(lista) {
  return [...lista].sort(
    (a, b) =>
      new Date(b.ultimaMensagemEm || b.updatedAt || 0) -
      new Date(a.ultimaMensagemEm || a.updatedAt || 0)
  );
}

const previewDe = (m) => {
  if (m?.texto) return m.texto.slice(0, 120);
  if (m?.anexos?.length) return `📎 ${m.anexos[0].nomeOriginal}`;
  if (m?.tipo === 'wa_card') return '💬 Atendimento WhatsApp';
  return 'Mensagem';
};

export function useChatInbox(meuId) {
  const [canais, setCanais] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [selecionadoId, setSelecionadoId] = useState('');
  const [canal, setCanal] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [temMais, setTemMais] = useState(false);
  const [carregandoCanal, setCarregandoCanal] = useState(false);
  // Última resposta de thread recebida via SSE (consumida pelo drawer aberto).
  const [ultimaRespostaThread, setUltimaRespostaThread] = useState(null);

  const selecionadoRef = useRef(selecionadoId);
  selecionadoRef.current = selecionadoId;
  const meuIdRef = useRef(meuId);
  meuIdRef.current = meuId;

  // ------------------------------------------------------------------
  // Lista de conversas
  // ------------------------------------------------------------------
  const carregarLista = useCallback(async () => {
    setCarregandoLista(true);
    try {
      const res = await getCanaisChat();
      setCanais(ordenar(res));
    } catch (error) {
      console.error('[chat] falha ao listar conversas', error);
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  // Ref da lista para efeitos acharem o canal sem depender de `canais`.
  const canaisRef = useRef(canais);
  canaisRef.current = canais;

  // ------------------------------------------------------------------
  // Conversa selecionada + mensagens
  // ------------------------------------------------------------------
  const selecionar = useCallback((id) => setSelecionadoId(id || ''), []);

  useEffect(() => {
    if (!selecionadoId) {
      setCanal(null);
      setMensagens([]);
      setTemMais(false);
      return undefined;
    }

    let ativo = true;
    setCarregandoCanal(true);

    (async () => {
      try {
        const res = await getMensagensChat(selecionadoId, { limit: 50 });
        if (!ativo) return;
        setMensagens(res?.itens || []);
        setTemMais(Boolean(res?.temMais));
        setCanal((prev) => canaisRef.current.find((c) => c._id === selecionadoId) || prev);

        await marcarLidoChat(selecionadoId);
        if (!ativo) return;
        setCanais((prev) =>
          prev.map((c) => (c._id === selecionadoId ? { ...c, naoLidas: 0 } : c))
        );
      } catch (error) {
        console.error('[chat] falha ao abrir conversa', error);
      } finally {
        if (ativo) setCarregandoCanal(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [selecionadoId]);

  // Mantém `canal` sincronizado com a lista (nome/membros podem mudar via SSE).
  useEffect(() => {
    if (!selecionadoId) return;
    const atual = canais.find((c) => c._id === selecionadoId);
    if (atual) setCanal(atual);
  }, [canais, selecionadoId]);

  /** Paginação: carrega mensagens mais antigas (prepend). */
  const carregarMaisAntigas = useCallback(async () => {
    if (!selecionadoId || !mensagens.length) return;
    const antesDe = mensagens[0]?.createdAt;
    try {
      const res = await getMensagensChat(selecionadoId, { antesDe, limit: 50 });
      setMensagens((prev) => [...(res?.itens || []), ...prev]);
      setTemMais(Boolean(res?.temMais));
    } catch (error) {
      console.error('[chat] falha ao paginar', error);
    }
  }, [selecionadoId, mensagens]);

  /** Anexa mensagem enviada (retorno do POST) ao feed aberto. */
  const anexarMensagem = useCallback((msg) => {
    if (!msg || msg.threadDe) return; // respostas de thread não entram no feed
    setMensagens((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
  }, []);

  /** Substitui uma mensagem no feed (edição/reação/remoção). */
  const substituirMensagem = useCallback((mensagemId, patch) => {
    setMensagens((prev) =>
      prev.map((m) => (m._id === mensagemId ? { ...m, ...patch } : m))
    );
  }, []);

  // ------------------------------------------------------------------
  // SSE
  // ------------------------------------------------------------------
  const onEvent = useCallback(
    (tipo, envelope) => {
      const { canalId, payload } = envelope || {};
      const aberto = selecionadoRef.current;
      const eu = meuIdRef.current;

      switch (tipo) {
        case 'chat.mensagem': {
          const { mensagem } = payload || {};
          if (!mensagem) break;
          const minha = String(mensagem?.autor?._id || mensagem?.autor) === String(eu);
          if (canalId === aberto && !mensagem.threadDe) {
            setMensagens((prev) =>
              prev.some((m) => m._id === mensagem._id) ? prev : [...prev, mensagem]
            );
          }
          setCanais((prev) => {
            const idx = prev.findIndex((c) => c._id === canalId);
            if (idx === -1) {
              // Canal novo para mim (fui adicionado / DM nova) — repuxa a lista.
              carregarLista();
              return prev;
            }
            const atual = prev[idx];
            const lista = [...prev];
            lista[idx] = {
              ...atual,
              ultimaMensagemEm: mensagem.createdAt,
              ultimaMensagemPreview: previewDe(mensagem),
              naoLidas:
                canalId === aberto || minha ? atual.naoLidas || 0 : (atual.naoLidas || 0) + 1,
            };
            return ordenar(lista);
          });
          break;
        }

        case 'chat.mensagem.editada': {
          const { mensagem } = payload || {};
          if (canalId === aberto && mensagem) {
            setMensagens((prev) => prev.map((m) => (m._id === mensagem._id ? mensagem : m)));
          }
          break;
        }

        case 'chat.mensagem.removida': {
          const { mensagemId } = payload || {};
          if (canalId === aberto && mensagemId) {
            setMensagens((prev) =>
              prev.map((m) =>
                m._id === mensagemId
                  ? { ...m, removida: true, texto: undefined, anexos: [], reacoes: [] }
                  : m
              )
            );
          }
          break;
        }

        case 'chat.reacao': {
          const { mensagemId, reacoes } = payload || {};
          if (canalId === aberto && mensagemId) {
            setMensagens((prev) =>
              prev.map((m) => (m._id === mensagemId ? { ...m, reacoes } : m))
            );
          }
          break;
        }

        case 'chat.thread.resposta': {
          const { raizId, mensagem: resposta } = payload || {};
          if (resposta) setUltimaRespostaThread(resposta);
          if (canalId === aberto && raizId) {
            setMensagens((prev) =>
              prev.map((m) =>
                m._id === raizId
                  ? {
                      ...m,
                      threadContagem: (m.threadContagem || 0) + 1,
                      threadUltimaRespostaEm: new Date().toISOString(),
                    }
                  : m
              )
            );
          }
          break;
        }

        case 'chat.mencao': {
          const { trecho } = payload || {};
          if (canalId !== aberto) {
            toast.info(`Você foi mencionado: ${trecho || ''}`);
          }
          break;
        }

        case 'chat.lido': {
          const { canalId: cid } = payload || {};
          setCanais((prev) => prev.map((c) => (c._id === cid ? { ...c, naoLidas: 0 } : c)));
          break;
        }

        case 'chat.canal.atualizado':
        case 'chat.membro.adicionado':
        case 'chat.membro.removido': {
          carregarLista();
          break;
        }

        case 'chat.canal.arquivado': {
          const { canalId: cid } = payload || {};
          setCanais((prev) => prev.filter((c) => c._id !== cid));
          if (cid === aberto) setSelecionadoId('');
          break;
        }

        default:
          break;
      }
    },
    [carregarLista]
  );

  const { conectado } = useChatStream(onEvent);

  return {
    canais,
    carregandoLista,
    recarregarLista: carregarLista,
    selecionadoId,
    selecionar,
    canal,
    mensagens,
    temMais,
    carregandoCanal,
    carregarMaisAntigas,
    anexarMensagem,
    substituirMensagem,
    ultimaRespostaThread,
    conectado,
  };
}
