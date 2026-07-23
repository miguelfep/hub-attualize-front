import { useState } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

export function ChatMessageList({
  canalId,
  mensagens = [],
  carregando,
  temMais,
  onCarregarMais,
  meuId,
  ehGestor,
  onReagir,
  onVotar,
  onAbrirThread,
  onEditar,
  onRemover,
}) {
  const { messagesEndRef, longeDoFim, novasMensagens, scrollToBottom } = useMessagesScroll(
    mensagens,
    canalId
  );
  const [imagemAberta, setImagemAberta] = useState(null);

  if (carregando && !mensagens.length) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ flex: '1 1 auto' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!mensagens.length) {
    return (
      <EmptyContent
        title="Sem mensagens ainda"
        description="Comece a conversa — mencione alguém com @nome."
        sx={{ flex: '1 1 auto' }}
      />
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
      <Scrollbar ref={messagesEndRef} sx={{ px: 2, pt: 3, pb: 2, flex: '1 1 auto' }}>
        {temMais && (
          <Stack alignItems="center" sx={{ pb: 1 }}>
            <Button size="small" onClick={onCarregarMais}>
              Carregar mensagens anteriores
            </Button>
          </Stack>
        )}
        <Box>
          {mensagens.map((mensagem) => (
            <ChatMessageItem
              key={mensagem._id}
              mensagem={mensagem}
              meuId={meuId}
              ehGestor={ehGestor}
              onReagir={onReagir}
              onVotar={onVotar}
              onAbrirThread={onAbrirThread}
              onEditar={onEditar}
              onRemover={onRemover}
              onOpenLightbox={(src) => setImagemAberta(src)}
            />
          ))}
        </Box>
      </Scrollbar>

      <Fade in={longeDoFim}>
        <Badge
          variant="dot"
          color="error"
          invisible={!novasMensagens}
          sx={{ position: 'absolute', right: 24, bottom: 16, zIndex: 9 }}
        >
          <Fab
            size="small"
            color="default"
            aria-label="Ir para as mensagens mais recentes"
            onClick={() => scrollToBottom('smooth')}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </Fab>
        </Badge>
      </Fade>

      <Lightbox
        open={!!imagemAberta}
        close={() => setImagemAberta(null)}
        slides={imagemAberta ? [{ src: imagemAberta }] : []}
      />
    </Box>
  );
}
