import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';

// ----------------------------------------------------------------------
// Rolagem estilo WhatsApp:
// - ao abrir um canal, salta direto para a última mensagem;
// - mensagem nova só rola sozinha se o usuário já estava perto do fim —
//   quem está lendo o histórico não é puxado para baixo, e um aviso de
//   "novas mensagens" fica disponível via `novasMensagens`;
// - carregar mensagens antigas (prepend) preserva a posição de leitura;
// - conteúdo que muda de altura depois (imagens, GIFs) mantém a lista
//   ancorada no fim enquanto o usuário estiver no fim.
// ----------------------------------------------------------------------

const LIMIAR_FIM_PX = 120;

export function useMessagesScroll(mensagens, canalId) {
  const messagesEndRef = useRef(null);
  const [longeDoFim, setLongeDoFim] = useState(false);
  const [novasMensagens, setNovasMensagens] = useState(false);

  const pertoDoFimRef = useRef(true);
  const canalAnteriorRef = useRef(null);
  const primeiraIdRef = useRef(null);
  const ultimaIdRef = useRef(null);
  const alturaAnteriorRef = useRef(0);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const el = messagesEndRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    pertoDoFimRef.current = true;
    setLongeDoFim(false);
    setNovasMensagens(false);
  }, []);

  const primeiraId = mensagens?.[0]?._id ?? null;
  const ultimaId = mensagens?.length ? mensagens[mensagens.length - 1]._id : null;
  const temMensagens = !!mensagens?.length;

  // Decide o que fazer a cada mudança na lista, antes do paint (sem "pulo" visual).
  useLayoutEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;

    const trocouCanal = canalAnteriorRef.current !== canalId;
    const prependou =
      !trocouCanal &&
      primeiraId &&
      primeiraIdRef.current &&
      primeiraId !== primeiraIdRef.current &&
      ultimaId === ultimaIdRef.current;
    const chegouNova = !trocouCanal && ultimaId && ultimaId !== ultimaIdRef.current;

    if (trocouCanal) {
      el.scrollTop = el.scrollHeight;
      pertoDoFimRef.current = true;
      setLongeDoFim(false);
      setNovasMensagens(false);
    } else if (prependou) {
      // Mensagens antigas entraram acima: mantém o que o usuário via na tela.
      el.scrollTop += el.scrollHeight - alturaAnteriorRef.current;
    } else if (chegouNova) {
      if (pertoDoFimRef.current) {
        el.scrollTop = el.scrollHeight;
      } else {
        setNovasMensagens(true);
      }
    }

    canalAnteriorRef.current = canalId;
    primeiraIdRef.current = primeiraId;
    ultimaIdRef.current = ultimaId;
    alturaAnteriorRef.current = el.scrollHeight;
  }, [canalId, primeiraId, ultimaId]);

  // Rastreia se o usuário está perto do fim + reancora quando o conteúdo cresce
  // depois do render (imagens carregando, etc.).
  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
      const perto = distancia < LIMIAR_FIM_PX;
      pertoDoFimRef.current = perto;
      setLongeDoFim(!perto);
      if (perto) setNovasMensagens(false);
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    let observer;
    if (typeof ResizeObserver !== 'undefined' && el.firstElementChild) {
      observer = new ResizeObserver(() => {
        if (pertoDoFimRef.current) {
          el.scrollTop = el.scrollHeight;
        }
      });
      observer.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, [canalId, temMensagens]);

  return { messagesEndRef, longeDoFim, novasMensagens, scrollToBottom };
}
