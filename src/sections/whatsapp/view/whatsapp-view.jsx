'use client';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  atribuirConversa,
  transferirConversa,
  mudarStatusConversa,
} from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { EmptyContent } from 'src/components/empty-content';

import { WaNav } from '../wa-nav';
import { Layout } from '../layout';
import { WaRoom } from '../wa-room';
import { useWaInbox } from '../hooks/use-wa-inbox';
import { WaAssignDialog } from '../wa-assign-dialog';
import { WaNovaConversaDialog } from '../wa-nova-conversa-dialog';

// ----------------------------------------------------------------------

export function WhatsAppView() {
  const {
    aba,
    setAba,
    conversas,
    carregandoLista,
    recarregarLista,
    selecionadaId,
    selecionar,
    conversa,
    mensagens,
    carregandoConversa,
    atualizarConversaSelecionada,
    anexarMensagem,
    conectado,
  } = useWaInbox();

  const [dialog, setDialog] = useState(null); // 'atribuir' | 'transferir' | null
  const [salvando, setSalvando] = useState(false);
  const [novaConversaOpen, setNovaConversaOpen] = useState(false);

  // Conversa iniciada pela empresa (POST /wa/iniciar): já abre a thread. Se ela
  // pertencer à aba atual, o carregarLista/SSE a traz para a lista; senão, ao
  // menos seleciona para o atendente continuar.
  const handleIniciada = useCallback(
    (novaConversa) => {
      if (!novaConversa?._id) return;
      recarregarLista();
      selecionar(novaConversa._id);
    },
    [recarregarLista, selecionar]
  );

  // Ao trocar de aba, limpa a seleção (a conversa pode não pertencer à nova aba).
  const handleChangeAba = useCallback(
    (nova) => {
      setAba(nova);
      selecionar('');
    },
    [setAba, selecionar]
  );

  const handleConfirmarDialog = useCallback(
    async (payload) => {
      if (!conversa?._id) return;
      setSalvando(true);
      try {
        const atualizada =
          dialog === 'transferir'
            ? await transferirConversa(conversa._id, payload)
            : await atribuirConversa(conversa._id, payload);
        atualizarConversaSelecionada(atualizada);
        toast.success(dialog === 'transferir' ? 'Conversa transferida.' : 'Conversa atribuída.');
        setDialog(null);
        recarregarLista();
      } catch (error) {
        toast.error(error?.message || 'Não foi possível concluir a ação.');
      } finally {
        setSalvando(false);
      }
    },
    [conversa, dialog, atualizarConversaSelecionada, recarregarLista]
  );

  const handleMudarStatus = useCallback(
    async (status) => {
      if (!conversa?._id) return;
      try {
        const atualizada = await mudarStatusConversa(conversa._id, status);
        atualizarConversaSelecionada(atualizada);
        toast.success('Status atualizado.');
        // Se a conversa saiu da aba atual, recarrega e desmarca.
        if (status !== aba) {
          selecionar('');
          recarregarLista();
        }
      } catch (error) {
        toast.error(error?.message || 'Não foi possível mudar o status.');
      }
    },
    [conversa, aba, atualizarConversaSelecionada, recarregarLista, selecionar]
  );

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <Card sx={{ flex: '1 1 auto', display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <Layout
          sx={{ flex: '1 1 auto', minHeight: 0 }}
          slots={{
            nav: (
              <WaNav
                aba={aba}
                onChangeAba={handleChangeAba}
                conversas={conversas}
                carregando={carregandoLista}
                selecionadaId={selecionadaId}
                onSelecionar={selecionar}
                onRecarregar={recarregarLista}
                onNovaConversa={() => setNovaConversaOpen(true)}
                conectado={conectado}
              />
            ),
            main: conversa ? (
              <WaRoom
                conversa={conversa}
                mensagens={mensagens}
                carregando={carregandoConversa}
                onEnviada={anexarMensagem}
                onAtribuir={() => setDialog('atribuir')}
                onTransferir={() => setDialog('transferir')}
                onMudarStatus={handleMudarStatus}
              />
            ) : (
              <EmptyContent
                title="Selecione uma conversa"
                description="Escolha uma conversa à esquerda para começar o atendimento."
                imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                sx={{ flex: '1 1 auto' }}
              />
            ),
          }}
        />
      </Card>

      <WaAssignDialog
        open={!!dialog}
        modo={dialog || 'atribuir'}
        conversa={conversa}
        onClose={() => setDialog(null)}
        onConfirmar={handleConfirmarDialog}
        salvando={salvando}
      />

      <WaNovaConversaDialog
        open={novaConversaOpen}
        onClose={() => setNovaConversaOpen(false)}
        onIniciada={handleIniciada}
      />
    </DashboardContent>
  );
}
