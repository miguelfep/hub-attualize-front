import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { reagirChat, getThreadChat, votarEnqueteChat } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ChatMessageItem } from './chat-message-item';
import { ChatMessageInput } from './chat-message-input';

// ----------------------------------------------------------------------
// Painel lateral da thread: raiz + respostas + input (envia com threadDe).
// Respostas ao vivo chegam pelo evento SSE `chat.thread.resposta` (a view
// repassa via `novaResposta`).
// ----------------------------------------------------------------------

export function ChatThreadDrawer({ open, raizId, canalId, meuId, ehGestor, usuarios, novaResposta, onClose }) {
  const [raiz, setRaiz] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!open || !raizId) return undefined;
    let ativo = true;
    setCarregando(true);
    getThreadChat(raizId)
      .then((res) => {
        if (!ativo) return;
        setRaiz(res.raiz);
        setRespostas(res.respostas || []);
      })
      .catch(() => toast.error('Falha ao carregar a thread.'))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [open, raizId]);

  // Resposta chegando ao vivo (SSE) para esta thread.
  useEffect(() => {
    if (!novaResposta || String(novaResposta.threadDe) !== String(raizId)) return;
    setRespostas((prev) =>
      prev.some((m) => m._id === novaResposta._id) ? prev : [...prev, novaResposta]
    );
  }, [novaResposta, raizId]);

  const handleEnviada = useCallback((msg) => {
    if (!msg) return;
    setRespostas((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
  }, []);

  const handleReagir = useCallback(async (mensagemId, emoji) => {
    try {
      const { reacoes } = await reagirChat(mensagemId, emoji);
      const patch = (m) => (m._id === mensagemId ? { ...m, reacoes } : m);
      setRaiz((prev) => (prev && prev._id === mensagemId ? { ...prev, reacoes } : prev));
      setRespostas((prev) => prev.map(patch));
    } catch {
      toast.error('Falha ao reagir.');
    }
  }, []);

  const handleVotar = useCallback(async (mensagemId, opcao) => {
    try {
      const msg = await votarEnqueteChat(mensagemId, opcao);
      setRaiz((prev) => (prev && prev._id === mensagemId ? msg : prev));
      setRespostas((prev) => prev.map((m) => (m._id === mensagemId ? msg : m)));
    } catch {
      toast.error('Falha ao votar.');
    }
  }, []);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Stack sx={{ height: 1 }}>
        <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Thread
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <Divider />

        {carregando ? (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Scrollbar sx={{ px: 1.5, py: 2, flex: '1 1 auto' }}>
            {raiz && (
              <>
                <ChatMessageItem
                  mensagem={raiz}
                  meuId={meuId}
                  ehGestor={ehGestor}
                  emThread
                  onReagir={handleReagir}
                  onVotar={handleVotar}
                />
                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {respostas.length} resposta{respostas.length === 1 ? '' : 's'}
                  </Typography>
                </Divider>
              </>
            )}
            {respostas.map((m) => (
              <ChatMessageItem
                key={m._id}
                mensagem={m}
                meuId={meuId}
                ehGestor={ehGestor}
                emThread
                onReagir={handleReagir}
                onVotar={handleVotar}
              />
            ))}
          </Scrollbar>
        )}

        <ChatMessageInput
          canalId={canalId}
          threadDe={raizId}
          usuarios={usuarios}
          onEnviada={handleEnviada}
          placeholder="Responder na thread…"
        />
      </Stack>
    </Drawer>
  );
}
