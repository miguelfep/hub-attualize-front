'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { getSetores } from 'src/actions/setores';
import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  reagirChat,
  sairCanalChat,
  getUsuariosChat,
  deletarCanalChat,
  votarEnqueteChat,
  arquivarCanalChat,
  editarMensagemChat,
  enviarMensagemChat,
  removerMensagemChat,
} from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { TarefaFormDialog } from 'src/sections/tarefas/tarefa-form-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { ChatNav } from '../chat-nav';
import { ChatHeader } from '../chat-header';
import { ChatDropZone } from '../chat-drop-zone';
import { nomeDaConversa } from '../chat-nav-item';
import { useChatInbox } from '../hooks/use-chat-inbox';
import { ChatMessageList } from '../chat-message-list';
import { useChatSalvos } from '../hooks/use-chat-salvos';
import { ChatSalvosDrawer } from '../chat-salvos-drawer';
import { ChatMessageInput } from '../chat-message-input';
import { ChatThreadDrawer } from '../chat-thread-drawer';
import { ChatWaIniciarDialog } from '../chat-wa-dialogs';
import {
  ChatNovaDmDialog,
  ChatBrowseDialog,
  ChatMembrosDialog,
  ChatNovoCanalDialog,
  ChatEditarCanalDialog,
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
    primeiraNaoLidaId,
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

  // Deep-link do sino/toast: /dashboard/chat?canal=<id>&n=<ts> abre a conversa.
  // Guarda a última chave APLICADA (canal + nonce `n`): um novo clique no sino,
  // mesmo já dentro da página (e até para o MESMO canal da URL, graças ao
  // nonce), troca a conversa — mas navegar manualmente entre conversas não faz
  // a query antiga "puxar de volta".
  const searchParams = useSearchParams();
  const canalQuery = searchParams.get('canal');
  const nonceQuery = searchParams.get('n') || '';
  const deepLinkAplicado = useRef(null);
  useEffect(() => {
    const chave = canalQuery ? `${canalQuery}|${nonceQuery}` : null;
    if (!chave || chave === deepLinkAplicado.current) return;
    deepLinkAplicado.current = chave;
    selecionar(canalQuery);
  }, [canalQuery, nonceQuery, selecionar]);

  // Diálogos / painéis
  const [dialog, setDialog] = useState(null); // 'novo-canal'|'editar-canal'|'nova-dm'|'browse'|'membros'|'wa-iniciar'
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

  // ------------------------------------------------------------------
  // Salvos: "salvar para depois" (localStorage, por usuário/navegador).
  // ------------------------------------------------------------------
  const { salvos, alternarSalvo, removerSalvo } = useChatSalvos();
  const [salvosAberto, setSalvosAberto] = useState(false);
  const salvosIds = useMemo(() => new Set(salvos.map((s) => s.mensagemId)), [salvos]);

  const handleSalvar = useCallback(
    (mensagem) => alternarSalvo(mensagem, canal, nomeDaConversa(canal, meuId)),
    [alternarSalvo, canal, meuId]
  );

  // ------------------------------------------------------------------
  // Chat → Tarefas: criar tarefa a partir de uma mensagem (gestores).
  // Setores/clientes do form são carregados sob demanda, na primeira vez.
  // ------------------------------------------------------------------
  const [tarefaDeMsg, setTarefaDeMsg] = useState(null);
  const [setores, setSetores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const auxTarefaCarregado = useRef(false);

  const handleCriarTarefa = useCallback((mensagem) => {
    setTarefaDeMsg(mensagem);
    if (auxTarefaCarregado.current) return;
    auxTarefaCarregado.current = true;
    getSetores()
      .then((data) => setSetores(Array.isArray(data) ? data : []))
      .catch(() => setSetores([]));
    getClientes({ status: true, tipoContato: 'cliente' })
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => setClientes([]));
  }, []);

  const valoresTarefa = useMemo(() => {
    if (!tarefaDeMsg) return undefined;
    const autor = tarefaDeMsg.autor || {};
    const autorNome = autor.name || autor.email || 'Usuário';
    const texto = tarefaDeMsg.texto || '';
    const origem = canal?.tipo === 'canal' ? `#${canal?.nome}` : 'mensagem direta';
    return {
      titulo: texto.slice(0, 80),
      descricao: `Criada a partir do chat (${origem}) — mensagem de ${autorNome}:\n\n${texto}`,
    };
  }, [tarefaDeMsg, canal]);

  // Após criar, compartilha o link da tarefa na própria conversa.
  const handleTarefaCriada = useCallback(
    async (criada) => {
      setTarefaDeMsg(null);
      if (!canal?._id) return;
      const id = criada?._id || criada?.data?._id;
      const titulo = criada?.titulo || criada?.data?.titulo || '';
      const link = id
        ? `${window.location.origin}${paths.dashboard.tarefas.minhas}?tarefa=${id}`
        : '';
      try {
        const msg = await enviarMensagemChat(
          canal._id,
          `📋 Tarefa criada${titulo ? `: "${titulo}"` : ''}${link ? `\n${link}` : ''}`
        );
        anexarMensagem(msg);
      } catch {
        /* a tarefa já foi criada; falha ao avisar no canal não deve bloquear */
      }
    },
    [canal, anexarMensagem]
  );

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
            onSalvos={() => setSalvosAberto(true)}
            totalSalvos={salvos.length}
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
                  onEditarCanal={() => setDialog('editar-canal')}
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
                  primeiraNaoLidaId={primeiraNaoLidaId}
                  meuId={meuId}
                  ehGestor={ehGestor}
                  onReagir={handleReagir}
                  onVotar={handleVotar}
                  onAbrirThread={(m) => setThreadRaiz(m)}
                  onCriarTarefa={ehGestor ? handleCriarTarefa : undefined}
                  salvosIds={salvosIds}
                  onSalvar={handleSalvar}
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
      <ChatEditarCanalDialog
        open={dialog === 'editar-canal'}
        canal={canal}
        onClose={fechar}
        onSalvo={() => {
          fechar();
          recarregarLista();
        }}
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

      {/* Mensagens salvas */}
      <ChatSalvosDrawer
        open={salvosAberto}
        salvos={salvos}
        onClose={() => setSalvosAberto(false)}
        onAbrir={(item) => {
          setSalvosAberto(false);
          if (item.canalId) selecionar(item.canalId);
        }}
        onConcluir={(id) => {
          removerSalvo(id);
          toast.success('Concluído! Item removido dos salvos.');
        }}
      />

      {/* Criar tarefa a partir de uma mensagem do chat */}
      <TarefaFormDialog
        open={!!tarefaDeMsg}
        onClose={() => setTarefaDeMsg(null)}
        valoresIniciais={valoresTarefa}
        usuarios={usuarios}
        clientes={clientes}
        setores={setores}
        onSuccess={handleTarefaCriada}
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
