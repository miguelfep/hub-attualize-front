import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';

import { WaMessageList } from './wa-message-list';
import { WaHeaderDetail } from './wa-header-detail';
import { WaMessageInput } from './wa-message-input';

// ----------------------------------------------------------------------
// "Sala" de atendimento: cabeçalho + lista de mensagens + input.
// ----------------------------------------------------------------------

export function WaRoom({
  conversa,
  mensagens,
  carregando,
  onEnviada,
  onAtribuir,
  onTransferir,
  onMudarStatus,
  temMaisMensagens,
  carregandoMais,
  onCarregarMais,
}) {
  // Mensagem sendo respondida (reply/quote) — limpa ao trocar de conversa.
  const [respondendoA, setRespondendoA] = useState(null);

  useEffect(() => {
    setRespondendoA(null);
  }, [conversa?._id]);

  return (
    <Stack sx={{ flex: '1 1 auto', minHeight: 0 }}>
      <WaHeaderDetail
        conversa={conversa}
        onAtribuir={onAtribuir}
        onTransferir={onTransferir}
        onMudarStatus={onMudarStatus}
      />

      <WaMessageList
        conversaId={conversa?._id}
        mensagens={mensagens}
        carregando={carregando}
        onResponder={setRespondendoA}
        temMais={temMaisMensagens}
        carregandoMais={carregandoMais}
        onCarregarMais={onCarregarMais}
      />

      <WaMessageInput
        conversa={conversa}
        onEnviada={onEnviada}
        respondendoA={respondendoA}
        onCancelarResposta={() => setRespondendoA(null)}
      />
    </Stack>
  );
}
