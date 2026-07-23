import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

export function ChatMessageList({
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
  const { messagesEndRef } = useMessagesScroll(mensagens);
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
    <>
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

      <Lightbox
        open={!!imagemAberta}
        close={() => setImagemAberta(null)}
        slides={imagemAberta ? [{ src: imagemAberta }] : []}
      />
    </>
  );
}
