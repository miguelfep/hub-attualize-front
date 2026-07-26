import { useState, Fragment } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { WaMessageItem } from './wa-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';

// ----------------------------------------------------------------------

export function WaMessageList({
  conversaId,
  mensagens = [],
  carregando,
  onResponder,
  temMais,
  carregandoMais,
  onCarregarMais,
}) {
  const { messagesEndRef, longeDoFim, novasMensagens, scrollToBottom } = useMessagesScroll(
    mensagens,
    conversaId
  );

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
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
      <Scrollbar ref={messagesEndRef} sx={{ px: 3, pt: 5, pb: 3, flex: '1 1 auto' }}>
        <Box>
          {temMais && (
            <Stack alignItems="center" sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="soft"
                color="inherit"
                disabled={carregandoMais}
                startIcon={
                  carregandoMais ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Iconify icon="eva:arrow-ios-upward-fill" width={16} />
                  )
                }
                onClick={onCarregarMais}
              >
                Carregar mensagens anteriores
              </Button>
            </Stack>
          )}
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
