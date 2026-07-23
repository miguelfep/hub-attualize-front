'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  reagirChat,
  sairCanalChat,
  getUsuariosChat,
  deletarCanalChat,
  votarEnqueteChat,
  arquivarCanalChat,
  editarMensagemChat,
  removerMensagemChat,
} from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { ChatNav } from '../chat-nav';
import { ChatHeader } from '../chat-header';
import { ChatDropZone } from '../chat-drop-zone';
import { useChatInbox } from '../hooks/use-chat-inbox';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatThreadDrawer } from '../chat-thread-drawer';
import { ChatWaIniciarDialog } from '../chat-wa-dialogs';
import {
  ChatNovaDmDialog,
  ChatBrowseDialog,
  ChatMembrosDialog,
  ChatNovoCanalDialog,
} from '../chat-dialogs';

// ----------------------------------------------------------------------

const GESTOR_ROLES = ['admin', 'gerencial'];
// Arquivar/desarquivar/excluir canal: só o criador ou admin/superadmin (regra do backend).
const CICLO_ROLES = ['admin', 'superadmin'];

export function ChatInternoView() {
  const { user } = useAuthContext();
  // O payload do login pode trazer o id como id, _id ou userId (mesma ordem do auth-provider).
  const meuId = user?.id || user?._id || user?.userId;
  const roles = Array.isArray(user?.role) ? user.role : [user?.role].filter(Boolean);
  const ehGestor = roles.some((r) => GESTOR_ROLES.includes(r));
  const ehAdminTop = roles.some((r) => CICLO_ROLES.includes(r));

  const {
    canais,
    carregandoLista,
    recarregarLista,
    selecionadoId,
    selecionar,
    canal,
    mensagens,
    temMais,
    carregandoCanal,
    carregarMaisAntigas,
    anexarMensagem,
    substituirMensagem,
    ultimaRespostaThread,
    onlineIds,
    ausenteIds,
    conectado,
  } = useChatInbox(meuId);

  // Usuários internos (menções, DMs, membros) — carregados uma vez.
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    getUsuariosChat()
      .then(setUsuarios)
      .catch(() => {});
  }, []);

  // Deep-link do sino/toast: /dashboard/chat?canal=<id> abre direto a conversa.
  const searchParams = useSearchParams();
  const canalQuery = searchParams.get('canal');
  const deepLinkAplicado = useRef(false);
  useEffect(() => {
    if (!canalQuery || deepLinkAplicado.current) return;
    deepLinkAplicado.current = true;
    selecionar(canalQuery);
  }, [canalQuery, selecionar]);

  // Diálogos / painéis
  const [dialog, setDialog] = useState(null); // 'novo-canal'|'nova-dm'|'browse'|'membros'|'wa-iniciar'
  const [threadRaiz, setThreadRaiz] = useState(null);
  const [editando, setEditando] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [removendo, setRemovendo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmar, setConfirmar] = useState(null); // 'arquivar' | 'sair' | 'excluir'

  // Ciclo de vida do canal aberto: criador ou admin/superadmin.
  const podeCiclo =
    ehAdminTop || (canal?.criadoPor && String(canal.criadoPor) === String(meuId));

  const fechar = () => setDialog(null);

  const aoCriarConversa = useCallback(
    (c) => {
      fechar();
      recarregarLista();
      if (c?._id) selecionar(c._id);
    },
    [recarregarLista, selecionar]
  );

  // Reações (feed principal; a thread trata as dela no drawer).
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

  // Voto em enquete (toggle/troca) — o SSE `chat.mensagem.editada` atualiza os demais.
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

  const handleSalvarEdicao = useCallback(async () => {
    if (!editando?._id || !textoEdicao.trim()) return;
    setSalvando(true);
    try {
      const msg = await editarMensagemChat(editando._id, textoEdicao.trim());
      substituirMensagem(editando._id, msg);
      setEditando(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha ao editar.');
    } finally {
      setSalvando(false);
    }
  }, [editando, textoEdicao, substituirMensagem]);

  const handleRemover = useCallback(async () => {
    if (!removendo?._id) return;
    try {
      await removerMensagemChat(removendo._id);
      substituirMensagem(removendo._id, { removida: true, texto: undefined, anexos: [], reacoes: [] });
      setRemovendo(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha ao remover.');
    }
  }, [removendo, substituirMensagem]);

  const handleConfirmarAcaoCanal = useCallback(async () => {
    if (!canal?._id) return;
    try {
      if (confirmar === 'arquivar') {
        await arquivarCanalChat(canal._id);
        toast.success('Canal arquivado. Você pode desarquivá-lo em Explorar canais → Arquivados.');
      } else if (confirmar === 'excluir') {
        await deletarCanalChat(canal._id);
        toast.success('Canal excluído definitivamente.');
      } else {
        await sairCanalChat(canal._id);
        toast.success('Você saiu do canal.');
      }
      setConfirmar(null);
      selecionar('');
      recarregarLista();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Não foi possível concluir.');
    }
  }, [canal, confirmar, selecionar, recarregarLista]);

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        // Trava o chat na altura da viewport (descontando o header) para a
        // rolagem acontecer dentro da lista de mensagens, não na página.
        height: {
          xs: 'calc(100dvh - var(--layout-header-mobile-height))',
          lg: 'calc(100dvh - var(--layout-header-desktop-height))',
        },
        pb: 2,
      }}
    >
      <Card sx={{ flex: '1 1 auto', display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Stack direction="row" sx={{ flex: '1 1 auto', minHeight: 0 }}>
          <ChatNav
            canais={canais}
            meuId={meuId}
            onlineIds={onlineIds}
            ausenteIds={ausenteIds}
            ehGestor={ehGestor}
            carregando={carregandoLista}
            selecionadoId={selecionadoId}
            onSelecionar={selecionar}
            onRecarregar={recarregarLista}
            onNovoCanal={() => setDialog('novo-canal')}
            onNovaDm={() => setDialog('nova-dm')}
            onBrowse={() => setDialog('browse')}
            conectado={conectado}
          />

          <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
            {canal ? (
              <ChatDropZone canalId={canal._id} onEnviada={anexarMensagem}>
                <ChatHeader
                  canal={canal}
                  meuId={meuId}
                  onlineIds={onlineIds}
                  ausenteIds={ausenteIds}
                  podeCiclo={podeCiclo}
                  onMembros={() => setDialog('membros')}
                  onWaIniciar={() => setDialog('wa-iniciar')}
                  onArquivar={() => setConfirmar('arquivar')}
                  onExcluir={() => setConfirmar('excluir')}
                  onSair={() => setConfirmar('sair')}
                />

                <ChatMessageList
                  canalId={canal._id}
                  mensagens={mensagens}
                  carregando={carregandoCanal}
                  temMais={temMais}
                  onCarregarMais={carregarMaisAntigas}
                  meuId={meuId}
                  ehGestor={ehGestor}
                  onReagir={handleReagir}
                  onVotar={handleVotar}
                  onAbrirThread={(m) => setThreadRaiz(m)}
                  onEditar={(m) => {
                    setEditando(m);
                    setTextoEdicao(m.texto || '');
                  }}
                  onRemover={(m) => setRemovendo(m)}
                />

                <ChatMessageInput
                  canalId={canal._id}
                  usuarios={usuarios}
                  onEnviada={anexarMensagem}
                />
              </ChatDropZone>
            ) : (
              <EmptyContent
                title="Selecione uma conversa"
                description="Escolha um canal ou DM à esquerda — ou crie um novo no botão +."
                imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                sx={{ flex: '1 1 auto' }}
              />
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Thread */}
      <ChatThreadDrawer
        open={!!threadRaiz}
        raizId={threadRaiz?._id}
        canalId={canal?._id}
        meuId={meuId}
        ehGestor={ehGestor}
        usuarios={usuarios}
        novaResposta={ultimaRespostaThread}
        onClose={() => setThreadRaiz(null)}
      />

      {/* Diálogos */}
      <ChatNovoCanalDialog
        open={dialog === 'novo-canal'}
        usuarios={usuarios}
        onClose={fechar}
        onCriado={aoCriarConversa}
      />
      <ChatNovaDmDialog
        open={dialog === 'nova-dm'}
        usuarios={usuarios}
        meuId={meuId}
        onClose={fechar}
        onCriada={aoCriarConversa}
      />
      <ChatBrowseDialog
        open={dialog === 'browse'}
        meuId={meuId}
        ehAdminTop={ehAdminTop}
        onClose={fechar}
        onEntrou={aoCriarConversa}
        onMudou={recarregarLista}
      />
      <ChatMembrosDialog
        open={dialog === 'membros'}
        canal={canal}
        usuarios={usuarios}
        ehGestor={ehGestor}
        onlineIds={onlineIds}
        ausenteIds={ausenteIds}
        onClose={fechar}
        onMudou={recarregarLista}
      />
      <ChatWaIniciarDialog
        open={dialog === 'wa-iniciar'}
        canalId={canal?._id}
        onClose={fechar}
        onFeito={(res) => {
          fechar();
          if (res?.mensagem) anexarMensagem(res.mensagem);
        }}
      />

      {/* Edição de mensagem */}
      <Dialog open={!!editando} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar mensagem</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={textoEdicao}
            onChange={(e) => setTextoEdicao(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditando(null)}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" loading={salvando} onClick={handleSalvarEdicao}>
            Salvar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Remoção */}
      <ConfirmDialog
        open={!!removendo}
        onClose={() => setRemovendo(null)}
        title="Remover mensagem"
        content="A mensagem será removida para todos. Continuar?"
        action={
          <Button variant="contained" color="error" onClick={handleRemover}>
            Remover
          </Button>
        }
      />

      {/* Arquivar / excluir / sair */}
      <ConfirmDialog
        open={!!confirmar}
        onClose={() => setConfirmar(null)}
        title={
          confirmar === 'arquivar'
            ? 'Arquivar canal'
            : confirmar === 'excluir'
              ? 'Excluir canal'
              : 'Sair do canal'
        }
        content={
          confirmar === 'arquivar'
            ? `Arquivar #${canal?.nome}? O canal some da lista, mas pode ser desarquivado depois.`
            : confirmar === 'excluir'
              ? `Excluir #${canal?.nome} DEFINITIVAMENTE? Todas as mensagens e anexos serão apagados. Não dá para desfazer.`
              : `Sair de #${canal?.nome}?`
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmarAcaoCanal}>
            {confirmar === 'arquivar' ? 'Arquivar' : confirmar === 'excluir' ? 'Excluir' : 'Sair'}
          </Button>
        }
      />
    </DashboardContent>
  );
}
