'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Fab from '@mui/material/Fab';
import Grow from '@mui/material/Grow';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { reagirChat, getUsuariosChat, votarEnqueteChat } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { useAuthContext } from 'src/auth/hooks';

import { ChatDropZone } from './chat-drop-zone';
import { useChatInbox } from './hooks/use-chat-inbox';
import { ChatMessageList } from './chat-message-list';
import { ChatMessageInput } from './chat-message-input';
import { ChatNavItem, nomeDaConversa } from './chat-nav-item';

// ----------------------------------------------------------------------
// Chat flutuante global do dashboard: Fab no canto inferior direito com o
// total de não-lidas; abre um painel compacto com as conversas e a conversa
// selecionada (mensagens + input completos, reusando os componentes da página).
// Na própria página /dashboard/chat o widget some (lá já existe o chat cheio).
// ----------------------------------------------------------------------

const LARGURA = 360;
const ALTURA = 'min(540px, calc(100dvh - 140px))';

// Mesmas roles do item "Chat interno" na navegação (config-nav-dashboard).
const CHAT_ROLES = ['admin', 'gerencial', 'operacional', 'comercial', 'financeiro', 'contabil_externo', 'ir'];

export function ChatFlutuante() {
  const pathname = usePathname();
  const { user, authenticated } = useAuthContext();

  const naPaginaDeChat = pathname?.startsWith(paths.dashboard.chat);
  const roles = Array.isArray(user?.role) ? user.role : [user?.role].filter(Boolean);
  const temAcesso = roles.some((r) => CHAT_ROLES.includes(r));

  if (!authenticated || !temAcesso || naPaginaDeChat) return null;

  return <ChatFlutuanteInner user={user} />;
}

function ChatFlutuanteInner({ user }) {
  const router = useRouter();
  const meuId = user?.id || user?._id || user?.userId;

  const [aberto, setAberto] = useState(false);

  const {
    canais,
    selecionadoId,
    selecionar,
    canal,
    mensagens,
    temMais,
    carregandoCanal,
    carregarMaisAntigas,
    anexarMensagem,
    substituirMensagem,
    onlineIds,
    ausenteIds,
  } = useChatInbox(meuId, { alertasDeMencao: false });

  // Usuários internos (menções do input) — só quando o painel abre.
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    if (!aberto || usuarios.length) return;
    getUsuariosChat()
      .then(setUsuarios)
      .catch(() => {});
  }, [aberto, usuarios.length]);

  const totalNaoLidas = useMemo(
    () => canais.reduce((soma, c) => soma + (c.naoLidas || 0), 0),
    [canais]
  );

  const fechar = useCallback(() => {
    setAberto(false);
    selecionar('');
  }, [selecionar]);

  const abrirPaginaCompleta = useCallback(() => {
    const destino = selecionadoId
      ? `${paths.dashboard.chat}?canal=${selecionadoId}`
      : paths.dashboard.chat;
    fechar();
    router.push(destino);
  }, [selecionadoId, fechar, router]);

  const handleReagir = useCallback(
    async (mensagemId, emoji) => {
      try {
        const { reacoes } = await reagirChat(mensagemId, emoji);
        substituirMensagem(mensagemId, { reacoes });
      } catch {
        toast.error('Falha ao reagir.');
      }
    },
    [substituirMensagem]
  );

  const handleVotar = useCallback(
    async (mensagemId, opcao) => {
      try {
        const msg = await votarEnqueteChat(mensagemId, opcao);
        substituirMensagem(mensagemId, msg);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Falha ao votar.');
      }
    },
    [substituirMensagem]
  );

  return (
    <>
      <Grow in={aberto} unmountOnExit>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 92,
            zIndex: (t) => t.zIndex.drawer,
            width: LARGURA,
            maxWidth: 'calc(100vw - 32px)',
            height: ALTURA,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            transformOrigin: 'bottom right',
          }}
        >
          {/* Cabeçalho */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: 1.5, py: 1, flexShrink: 0, borderBottom: (t) => `solid 1px ${t.vars.palette.divider}` }}
          >
            {canal ? (
              <>
                <IconButton size="small" onClick={() => selecionar('')} title="Voltar às conversas">
                  <Iconify icon="eva:arrow-ios-back-fill" />
                </IconButton>
                <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                  {canal.tipo === 'canal' ? `#${nomeDaConversa(canal, meuId)}` : nomeDaConversa(canal, meuId)}
                </Typography>
              </>
            ) : (
              <Typography variant="subtitle2" sx={{ flex: 1, pl: 0.5 }}>
                Conversas
              </Typography>
            )}

            <IconButton size="small" onClick={abrirPaginaCompleta} title="Abrir chat completo">
              <Iconify icon="eva:expand-fill" />
            </IconButton>
            <IconButton size="small" onClick={fechar} title="Fechar">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          {/* Corpo */}
          {canal ? (
            <ChatDropZone canalId={canal._id} onEnviada={anexarMensagem}>
              <ChatMessageList
                canalId={canal._id}
                mensagens={mensagens}
                carregando={carregandoCanal}
                temMais={temMais}
                onCarregarMais={carregarMaisAntigas}
                meuId={meuId}
                onReagir={handleReagir}
                onVotar={handleVotar}
                onAbrirThread={abrirPaginaCompleta}
              />
              <ChatMessageInput compacto canalId={canal._id} usuarios={usuarios} onEnviada={anexarMensagem} />
            </ChatDropZone>
          ) : (
            <Scrollbar sx={{ flex: '1 1 auto' }}>
              {canais.length ? (
                <Stack component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                  {canais.map((c) => (
                    <ChatNavItem
                      key={c._id}
                      canal={c}
                      meuId={meuId}
                      onlineIds={onlineIds}
                      ausenteIds={ausenteIds}
                      onSelecionar={selecionar}
                    />
                  ))}
                </Stack>
              ) : (
                <EmptyContent
                  title="Nenhuma conversa"
                  description="Abra o chat completo para criar canais e DMs."
                  sx={{ py: 6 }}
                />
              )}
            </Scrollbar>
          )}
        </Paper>
      </Grow>

      <Badge
        badgeContent={totalNaoLidas}
        color="error"
        overlap="circular"
        max={99}
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: (t) => t.zIndex.drawer,
          // O Fab tem z-index próprio (zIndex.fab) — sem isto o contador fica atrás dele.
          '& .MuiBadge-badge': { zIndex: (t) => t.zIndex.fab + 1 },
        }}
      >
        <Fab
          color="primary"
          aria-label={aberto ? 'Fechar chat' : 'Abrir chat'}
          onClick={() => (aberto ? fechar() : setAberto(true))}
        >
          <Iconify icon={aberto ? 'mingcute:close-line' : 'solar:chat-round-dots-bold'} width={26} />
        </Fab>
      </Badge>
    </>
  );
}
