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
}) {
  return (
    <Stack sx={{ flex: '1 1 auto', minHeight: 0 }}>
      <WaHeaderDetail
        conversa={conversa}
        onAtribuir={onAtribuir}
        onTransferir={onTransferir}
        onMudarStatus={onMudarStatus}
      />

      <WaMessageList mensagens={mensagens} carregando={carregando} />

      <WaMessageInput conversa={conversa} onEnviada={onEnviada} />
    </Stack>
  );
}
