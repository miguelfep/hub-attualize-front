'use client';

import { useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';

import { tocarSomChat } from './chat-som';
import { usePresencaAtividade } from './use-presenca-atividade';
import { useChatStream } from '../../sections/chat-interno/hooks/use-chat-stream';

// ----------------------------------------------------------------------
// Alertas globais do chat interno (estilo Slack): montado no layout do dashboard,
// mantém a conexão SSE viva em QUALQUER página e, ao chegar menção ou DM:
//  - toca o som de notificação (preferência do usuário em localStorage);
//  - mostra um toast clicável (exceto se já estiver na página do chat, que tem
//    os próprios avisos visuais).
// O sino (TarefaNotificacao) continua sendo o registro persistente.
// ----------------------------------------------------------------------

const ROLES_INTERNOS = ['admin', 'gerencial', 'operacional', 'comercial', 'financeiro', 'contabil_externo', 'ir'];

function Alerts() {
  const router = useRouter();
  const pathname = usePathname();

  const onEvent = useCallback(
    (tipo, envelope) => {
      if (tipo !== 'chat.mencao' && tipo !== 'chat.dm') return;

      tocarSomChat();

      // Na página do chat os avisos visuais já existem — só o som basta.
      if (pathname?.startsWith(paths.dashboard.chat)) return;

      const { payload, canalId } = envelope || {};
      const texto =
        tipo === 'chat.mencao'
          ? `Você foi mencionado: ${payload?.trecho || ''}`
          : `Nova mensagem direta: ${payload?.mensagem?.texto?.slice(0, 80) || ''}`;

      toast.info(texto, {
        action: {
          label: 'Abrir',
          onClick: () => router.push(`${paths.dashboard.chat}?canal=${canalId}`),
        },
      });
    },
    [pathname, router]
  );

  useChatStream(onEvent);

  // Status "ausente" após inatividade (estilo Slack) — vale em qualquer página.
  usePresencaAtividade(true);

  return null;
}

export function GlobalChatAlerts() {
  const { user } = useAuthContext();
  const roles = Array.isArray(user?.role) ? user.role : [user?.role].filter(Boolean);
  const interno = roles.some((r) => ROLES_INTERNOS.includes(r));

  // Só conecta para usuários internos autenticados (clientes não têm acesso ao
  // stream e ficariam num loop de reconexão).
  if (!user || !interno) return null;
  return <Alerts />;
}
