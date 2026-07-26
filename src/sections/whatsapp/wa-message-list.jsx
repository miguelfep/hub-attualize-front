import { useState, Fragment } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { WaMessageItem } from './wa-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

export function WaMessageList({ mensagens = [], carregando, onResponder }) {
  const { messagesEndRef } = useMessagesScroll(mensagens);

  // Índice wamid → mensagem para resolver respostas citadas (quote) localmente.
  const porWamid = new Map(
    mensagens.filter((m) => m.waMessageId).map((m) => [m.waMessageId, m])
  );

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
          {mensagens.map((mensagem, index) => {
            // A thread mostra o histórico completo do CONTATO: quando a conversa
            // (atendimento) muda entre uma mensagem e a seguinte, marcamos a
            // fronteira — igual ao WhatsApp, sem quebrar em chats separados.
            const anterior = mensagens[index - 1];
            const novoAtendimento =
              anterior && String(anterior.conversa) !== String(mensagem.conversa);

            return (
              <Fragment key={mensagem._id}>
                {novoAtendimento && (
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Atendimento anterior encerrado
                    </Typography>
                  </Divider>
                )}
                <WaMessageItem
                  mensagem={mensagem}
                  onResponder={onResponder}
                  citada={
                    mensagem.contexto?.waMessageIdReferenciada
                      ? porWamid.get(mensagem.contexto.waMessageIdReferenciada)
                      : undefined
                  }
                  onOpenLightbox={(src) => setImagemAberta(src)}
                />
              </Fragment>
            );
          })}
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
