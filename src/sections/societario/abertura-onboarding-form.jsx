'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import {
  verificarAcessoWordpress,
  regenerarAcessoWordpress,
  notificarClienteRegeneracaoAcesso,
} from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

// Formata CPF (apenas dígitos) como 000.000.000-00
const formatCpf = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return digits;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export function AberturaOnboardingForm({ currentAbertura }) {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  // estado da verificação ao abrir o modal
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // { exists, email, user? }
  const [checkError, setCheckError] = useState(null);

  // estado da criação
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null); // { created, email, password?, user }
  const [createError, setCreateError] = useState(null);

  // estado da notificação
  const [notifying, setNotifying] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);

  const resetModal = () => {
    setCheckResult(null);
    setCheckError(null);
    setCreateResult(null);
    setCreateError(null);
    setNotifyDone(false);
  };

  const handleOpenModal = async () => {
    resetModal();
    setModalOpen(true);
    setChecking(true);

    try {
      const { data } = await verificarAcessoWordpress(currentAbertura._id);
      setCheckResult(data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao verificar acesso no WordPress';
      setCheckError(msg);
      toast.error(msg);
    } finally {
      setChecking(false);
    }
  };

  const handleCriarAcesso = async () => {
    setCreating(true);
    setCreateResult(null);
    setCreateError(null);
    setNotifyDone(false);

    try {
      const { data } = await regenerarAcessoWordpress(currentAbertura._id);
      setCreateResult(data);
      // Atualiza o checkResult para refletir que agora existe
      setCheckResult((prev) => ({
        ...prev,
        exists: true,
        user: data.user,
      }));
      toast.success(data.created ? 'Acesso criado com sucesso!' : 'Usuário já existia no WordPress.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao criar acesso';
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleNotificar = async () => {
    setNotifying(true);

    try {
      await notificarClienteRegeneracaoAcesso(currentAbertura._id);
      setNotifyDone(true);
      toast.success('Cliente notificado no WhatsApp!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao enviar notificação';
      toast.error(msg);
    } finally {
      setNotifying(false);
    }
  };

  const handleClose = () => {
    if (creating || notifying) return;
    setModalOpen(false);
  };

  // Usuário disponível após verificação ou criação
  const userInfo = createResult?.user ?? checkResult?.user ?? null;
  const userExists = checkResult?.exists === true;

  // Mostrar botão de criar quando: verificação concluída e usuário não existe
  const showCreateButton = !checking && !checkError && !userExists;

  // Mostrar botão de notificar quando: existe usuário (pré-existente ou recém-criado)
  const showNotifyButton = !checking && !checkError && (userExists || createResult?.created);

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Onboarding — Acesso à Plataforma
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie o acesso do cliente à plataforma de treinamentos.
      </Typography>

      {currentAbertura?.usuarioGerado && (
        <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />} sx={{ mb: 2 }}>
          Usuário já foi gerado anteriormente
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleOpenModal}
        startIcon={<Iconify icon="solar:user-id-bold" />}
      >
        Gerenciar Acesso WordPress
      </Button>

      <Dialog open={modalOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Acesso WordPress</DialogTitle>

        <DialogContent dividers>
          {/* Verificando */}
          {checking && (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Verificando acesso...</Typography>
            </Stack>
          )}

          {/* Erro na verificação */}
          {checkError && (
            <Alert severity="error">{checkError}</Alert>
          )}

          {/* Resultado da verificação */}
          {!checking && !checkError && checkResult && (
            <>
              {userExists ? (
                <Alert
                  severity="success"
                  icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  sx={{ mb: 2 }}
                >
                  Usuário encontrado no WordPress.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Nenhum usuário encontrado. Clique em <strong>Criar Acesso</strong> para gerar.
                </Alert>
              )}

              {userInfo && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Iconify icon="solar:user-bold" width={20} color="primary.main" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {userInfo.name || userInfo.username}
                    </Typography>
                    <Chip label={`ID ${userInfo.id}`} size="small" variant="outlined" />
                  </Stack>

                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:at-fill" width={16} color="text.secondary" />
                      <Typography variant="body2" color="text.secondary">
                        {userInfo.username}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:email-fill" width={16} color="text.secondary" />
                      <Typography variant="body2" color="text.secondary">
                        {userInfo.email}
                      </Typography>
                    </Stack>

                    {(checkResult?.cpf || currentAbertura?.cpf) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:user-id-bold" width={16} color="text.secondary" />
                        <Typography variant="body2" color="text.secondary">
                          CPF: {formatCpf(checkResult?.cpf || currentAbertura?.cpf)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
            </>
          )}

          {/* Resultado da criação */}
          {createResult && (
            <Alert
              severity={createResult.created ? 'success' : 'info'}
              sx={{ mt: 2 }}
              icon={<Iconify icon={createResult.created ? 'eva:checkmark-circle-2-fill' : 'eva:info-fill'} />}
            >
              {createResult.created
                ? 'Acesso criado! A senha inicial é o CPF (somente números) do cliente.'
                : 'Usuário já existia — nenhuma alteração foi feita.'}
            </Alert>
          )}

          {/* Erro na criação */}
          {createError && (
            <Alert severity="error" sx={{ mt: 2 }}>{createError}</Alert>
          )}

          {/* Notificação enviada */}
          {notifyDone && (
            <Alert
              severity="success"
              icon={<Iconify icon="ic:baseline-whatsapp" />}
              sx={{ mt: 2 }}
            >
              Mensagem enviada ao cliente via WhatsApp.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={handleClose} disabled={creating || notifying}>
            Fechar
          </Button>

          <Box sx={{ flex: 1 }} />

          {showNotifyButton && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNotificar}
              disabled={notifying || notifyDone}
              startIcon={notifying ? <CircularProgress size={16} /> : <Iconify icon="ic:baseline-whatsapp" />}
            >
              {notifyDone ? 'Notificado' : 'Notificar WhatsApp'}
            </Button>
          )}

          {showCreateButton && (
            <Button
              variant="contained"
              onClick={handleCriarAcesso}
              disabled={creating}
              startIcon={creating ? <CircularProgress size={16} /> : <Iconify icon="solar:user-plus-bold" />}
            >
              Criar Acesso
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}
