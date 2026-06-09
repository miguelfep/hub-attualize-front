'use client';

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

/**
 * Ícone "Logar como cliente" para a linha da lista. Self-contained: dispara a
 * impersonação, trata o 409 (vários usuários do portal) com um diálogo de
 * escolha e, em sucesso, navega para o portal já como o cliente.
 */
export function ClienteImpersonarButton({ cliente }) {
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
    async (userId) => {
      setLoading(true);
      try {
        await impersonateCliente({ clienteId, userId });
        toast.success(`Acessando como ${nome}...`);
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
    executar(userIdSelecionado);
  }, [userIdSelecionado, executar]);

  if (!podeImpersonar) return null;

  return (
    <>
      <Tooltip title="Logar como cliente">
        <span>
          <IconButton color="primary" onClick={handleClick} disabled={loading}>
            <Iconify icon="solar:login-3-bold-duotone" />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={!!candidatos} onClose={() => setCandidatos(null)} fullWidth maxWidth="xs">
        <DialogTitle>Selecionar usuário do portal</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Este cliente possui mais de um usuário de acesso. Escolha qual deseja acessar.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Usuário"
              value={userIdSelecionado}
              onChange={(e) => setUserIdSelecionado(e.target.value)}
            >
              {(candidatos || []).map((c) => (
                <MenuItem key={c.userId} value={c.userId}>
                  {c.name ? `${c.name} — ${c.email || ''}` : c.email || c.userId}
                </MenuItem>
              ))}
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
