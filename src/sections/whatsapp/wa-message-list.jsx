import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { WaMessageItem } from './wa-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

export function WaMessageList({ mensagens = [], carregando }) {
  const { messagesEndRef } = useMessagesScroll(mensagens);

  // As imagens usam objectURL (blob:) montado no item; o clique passa o src
  // pronto, então guardamos só a imagem aberta em estado local.
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
        description="As mensagens desta conversa aparecerão aqui."
        sx={{ flex: '1 1 auto' }}
      />
    );
  }

  return (
    <>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        <Box>
          {mensagens.map((mensagem) => (
            <WaMessageItem
              key={mensagem._id}
              mensagem={mensagem}
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
