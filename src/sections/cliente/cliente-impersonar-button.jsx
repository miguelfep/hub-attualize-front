'use client';

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import {
  impersonateCliente,
  isMultipleUsersError,
  extractImpersonationCandidates,
} from 'src/auth/context/jwt/impersonation';

// ----------------------------------------------------------------------

// Perfis internos autorizados a logar como cliente (espelha o backend).
const ROLES_PERMITIDAS = ['admin', 'operacional', 'gerencial'];

// Valor sentinela do seletor para o acesso virtual (sem usuário real).
const OPCAO_VIRTUAL = '__virtual__';

/**
 * Ícone "Logar como cliente" para a linha da lista. Self-contained: dispara a
 * impersonação, trata o 409 (vários usuários do portal) com um diálogo de
 * escolha e, em sucesso, navega para o portal já como o cliente.
 */
export function ClienteImpersonarButton({ cliente, variant = 'icon' }) {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [candidatos, setCandidatos] = useState(null); // array | null (diálogo aberto)
  const [userIdSelecionado, setUserIdSelecionado] = useState('');

  const clienteId = cliente?._id || cliente?.id;
  const nome = cliente?.razaoSocial || cliente?.nome || cliente?.codigo || 'cliente';

  const podeImpersonar = ROLES_PERMITIDAS.includes(user?.role);

  const irParaPortal = useCallback(() => {
    // Navegação dura: garante que o AuthProvider releia a nova sessão.
    window.location.href = paths.cliente.dashboard;
  }, []);

  const executar = useCallback(
    async ({ userId, virtual } = {}) => {
      setLoading(true);
      try {
        await impersonateCliente({ clienteId, userId, virtual, clienteNome: nome });
        toast.success(
          virtual ? `Acessando ${nome} com usuário virtual...` : `Acessando como ${nome}...`
        );
        irParaPortal();
      } catch (error) {
        if (isMultipleUsersError(error)) {
          const lista = extractImpersonationCandidates(error);
          setCandidatos(lista);
          setUserIdSelecionado(lista?.[0]?.userId || '');
          setLoading(false);
          return;
        }
        console.error('Erro ao logar como cliente:', error);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          'Não foi possível logar como este cliente';
        toast.error(msg);
        setLoading(false);
      }
    },
    [clienteId, nome, irParaPortal]
  );

  const handleClick = useCallback(() => {
    if (!clienteId) {
      toast.error('Cliente sem identificador válido');
      return;
    }
    executar();
  }, [clienteId, executar]);

  const handleConfirmarSelecao = useCallback(() => {
    if (!userIdSelecionado) return;
    setCandidatos(null);
    if (userIdSelecionado === OPCAO_VIRTUAL) {
      executar({ virtual: true });
    } else {
      executar({ userId: userIdSelecionado });
    }
  }, [userIdSelecionado, executar]);

  if (!podeImpersonar) return null;

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          disabled={loading}
          startIcon={<Iconify icon="solar:login-3-bold-duotone" />}
        >
          Logar como cliente
        </Button>
      ) : (
        <Tooltip title="Logar como cliente">
          <span>
            <IconButton color="primary" onClick={handleClick} disabled={loading}>
              <Iconify icon="solar:login-3-bold-duotone" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      <Dialog open={!!candidatos} onClose={() => setCandidatos(null)} fullWidth maxWidth="xs">
        <DialogTitle>Selecionar usuário do portal</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Este cliente possui mais de um usuário de acesso. Escolha qual deseja acessar, ou use o
            acesso virtual para entrar sem assumir nenhum usuário real.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Usuário"
              value={userIdSelecionado}
              onChange={(e) => setUserIdSelecionado(e.target.value)}
              helperText={
                userIdSelecionado === OPCAO_VIRTUAL
                  ? 'Notificações, preferências e permissões serão as do usuário sintético — para reproduzir exatamente o que um cliente vê, acesse com um usuário real.'
                  : ''
              }
            >
              {(candidatos || []).map((c) => (
                <MenuItem key={c.userId} value={c.userId}>
                  {c.name ? `${c.name} — ${c.email || ''}` : c.email || c.userId}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem value={OPCAO_VIRTUAL}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:ghost-bold-duotone" width={18} />
                  <span>Acesso Attualize (virtual) — sem usuário real</span>
                </Stack>
              </MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setCandidatos(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmarSelecao}
            disabled={!userIdSelecionado || loading}
          >
            Acessar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
