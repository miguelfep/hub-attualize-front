'use client';

import { useRef, useCallback } from 'react';

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

function Alerts({ meuId }) {
  const router = useRouter();
  const pathname = usePathname();
  // Uma mensagem pode disparar mais de um evento (ex.: DM + @todos) — dedupe por id.
  const notificadasRef = useRef(new Set());

  const onEvent = useCallback(
    (tipo, envelope) => {
      const { payload, canalId } = envelope || {};

      // @todos: o backend não gera chat.mencao para todos, mas o chat.mensagem
      // chega a cada membro do canal — detectamos aqui e avisamos localmente.
      const ehTodos =
        tipo === 'chat.mensagem' &&
        /@todos\b/i.test(payload?.mensagem?.texto || '') &&
        String(payload?.mensagem?.autor?._id || payload?.mensagem?.autor) !== String(meuId);

      if (tipo !== 'chat.mencao' && tipo !== 'chat.dm' && !ehTodos) return;

      // Dedupe entre eventos da mesma mensagem (quando o payload traz o id).
      const msgId = payload?.mensagem?._id;
      if (msgId) {
        if (notificadasRef.current.has(msgId)) return;
        notificadasRef.current.add(msgId);
        if (notificadasRef.current.size > 500) notificadasRef.current.clear();
      }

      tocarSomChat();

      // Na página do chat os avisos visuais já existem — só o som basta.
      if (pathname?.startsWith(paths.dashboard.chat)) return;

      const texto =
        tipo === 'chat.mencao'
          ? `Você foi mencionado: ${payload?.trecho || ''}`
          : ehTodos
            ? `@todos: ${payload?.mensagem?.texto?.slice(0, 80) || ''}`
            : `Nova mensagem direta: ${payload?.mensagem?.texto?.slice(0, 80) || ''}`;

      toast.info(texto, {
        action: {
          label: 'Abrir',
          onClick: () => router.push(`${paths.dashboard.chat}?canal=${canalId}&n=${Date.now()}`),
        },
      });
    },
    [pathname, router, meuId]
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
  return <Alerts meuId={user?.id || user?._id || user?.userId} />;
}
