'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';

import {
  getSenhaCredencial,
  getCredenciaisAcesso,
  createCredencialAcesso,
  updateCredencialAcesso,
  deleteCredencialAcesso,
} from 'src/actions/credenciais-acesso';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const ROLES_PODE_DELETAR = ['admin', 'gerencial', 'superadmin'];

const FORM_VAZIO = {
  nome: '',
  usuarioLogin: '',
  urlAcesso: '',
  codigoAcesso: '',
  senha: '',
};

function getId(row) {
  return row?.id || row?._id;
}

// ----------------------------------------------------------------------
// Sub-componentes de linha dentro do card

function CredRow({ icon, label, value, isLink, onCopy, mono = false }) {
  if (!value) return null;
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.6 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
        <Iconify icon={icon} width={15} sx={{ color: 'text.disabled', flexShrink: 0 }} />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ flexShrink: 0, width: 46, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        {isLink ? (
          <Link
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            underline="hover"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontSize: '0.8125rem',
            }}
          >
            {value}
          </Link>
        ) : (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontSize: '0.8125rem',
              fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'inherit',
            }}
          >
            {value}
          </Typography>
        )}
      </Stack>
      <Tooltip title={`Copiar ${label.toLowerCase()}`}>
        <IconButton
          size="small"
          onClick={onCopy}
          sx={{ ml: 0.5, flexShrink: 0, color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
        >
          <Iconify icon="solar:copy-bold" width={15} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function SenhaRow({ revealed, onToggle, onCopy }) {
  const isLoading = revealed?.loading;
  const isVisible = revealed?.visible && !!revealed?.value;
  const value = revealed?.value;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.6 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
        <Iconify icon="solar:key-bold" width={15} sx={{ color: 'text.disabled', flexShrink: 0 }} />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ flexShrink: 0, width: 46, lineHeight: 1.2 }}
        >
          Senha
        </Typography>
        {isLoading ? (
          <CircularProgress size={14} sx={{ ml: 0.5 }} />
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontSize: '0.8125rem',
              letterSpacing: isVisible ? 'inherit' : '0.15em',
              color: isVisible ? 'text.primary' : 'text.disabled',
            }}
          >
            {isVisible ? value : '••••••••'}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" sx={{ flexShrink: 0, ml: 0.5 }}>
        <Tooltip title={isVisible ? 'Ocultar' : 'Revelar senha (30s)'}>
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{ color: isVisible ? 'warning.main' : 'text.disabled', '&:hover': { color: 'warning.main' } }}
          >
            <Iconify icon={isVisible ? 'solar:eye-closed-bold' : 'solar:eye-bold'} width={15} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copiar senha">
          <IconButton
            size="small"
            onClick={onCopy}
            sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
          >
            <Iconify icon="solar:copy-bold" width={15} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default function ClienteCredenciaisSection({ clienteId }) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const podeDeletar = ROLES_PODE_DELETAR.includes(user?.role);

  const [credenciais, setCredenciais] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado de senha revelada por credencial: { [id]: { loading, value, visible, timerId } }
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiandoTudo, setCopiandoTudo] = useState({});

  const dialogForm = useBoolean();
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const mostrarSenhaForm = useBoolean();

  const [confirmExcluir, setConfirmExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    if (!clienteId) { setCredenciais([]); setLoading(false); return; }
    try {
      setLoading(true);
      const lista = await getCredenciaisAcesso(clienteId);
      setCredenciais(Array.isArray(lista) ? lista : []);
    } catch (error) {
      toast.error(extrairMensagem(error, 'Não foi possível carregar as credenciais.'));
      setCredenciais([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => { carregar(); }, [carregar]);

  // ---- Formulário ----

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    mostrarSenhaForm.onFalse();
    dialogForm.onTrue();
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setForm({
      nome: row.nome || '',
      usuarioLogin: row.usuarioLogin || '',
      urlAcesso: row.urlAcesso || '',
      codigoAcesso: row.codigoAcesso || '',
      senha: '',
    });
    mostrarSenhaForm.onFalse();
    dialogForm.onTrue();
  };

  const handleChange = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSalvar = async () => {
    if (!form.nome.trim()) { toast.error('Informe o nome da credencial.'); return; }
    if (!form.usuarioLogin.trim()) { toast.error('Informe o usuário/login.'); return; }
    if (!editando && !form.senha) { toast.error('A senha é obrigatória no cadastro.'); return; }
    try {
      setSalvando(true);
      const payload = {
        nome: form.nome.trim(),
        usuarioLogin: form.usuarioLogin.trim(),
        urlAcesso: form.urlAcesso.trim(),
        codigoAcesso: form.codigoAcesso.trim(),
      };
      if (form.senha) payload.senha = form.senha;
      if (editando) {
        await updateCredencialAcesso(clienteId, getId(editando), payload);
        toast.success('Credencial atualizada com sucesso.');
        // Limpa senha revelada desta credencial ao editar
        setRevealedPasswords((prev) => { const n = { ...prev }; delete n[getId(editando)]; return n; });
      } else {
        await createCredencialAcesso(clienteId, payload);
        toast.success('Credencial salva com sucesso.');
      }
      dialogForm.onFalse();
      setForm(FORM_VAZIO);
      await carregar();
    } catch (error) {
      toast.error(extrairMensagem(error, 'Erro ao salvar a credencial.'));
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirmExcluir) return;
    try {
      setExcluindo(true);
      await deleteCredencialAcesso(clienteId, getId(confirmExcluir));
      toast.success('Credencial removida com sucesso.');
      setConfirmExcluir(null);
      await carregar();
    } catch (error) {
      toast.error(extrairMensagem(error, 'Erro ao remover a credencial.'));
    } finally {
      setExcluindo(false);
    }
  };

  // ---- Senha inline ----

  const handleTogglePassword = async (row) => {
    const id = getId(row);
    const cur = revealedPasswords[id];

    // Se já visível, ocultar
    if (cur?.visible && cur?.value) {
      if (cur.timerId) clearTimeout(cur.timerId);
      setRevealedPasswords((prev) => ({ ...prev, [id]: { ...prev[id], visible: false, timerId: null } }));
      return;
    }

    // Se já carregada, apenas tornar visível
    if (cur?.value) {
      const timerId = setTimeout(() => {
        setRevealedPasswords((prev) => ({ ...prev, [id]: { ...prev[id], visible: false, timerId: null } }));
      }, 30000);
      setRevealedPasswords((prev) => ({ ...prev, [id]: { ...prev[id], visible: true, timerId } }));
      return;
    }

    // Buscar da API
    setRevealedPasswords((prev) => ({ ...prev, [id]: { loading: true, value: '', visible: false, timerId: null } }));
    try {
      const senha = await getSenhaCredencial(id);
      const timerId = setTimeout(() => {
        setRevealedPasswords((prev) => ({ ...prev, [id]: { ...prev[id], visible: false, timerId: null } }));
      }, 30000);
      setRevealedPasswords((prev) => ({ ...prev, [id]: { loading: false, value: senha, visible: true, timerId } }));
    } catch (error) {
      toast.error(extrairMensagem(error, 'Não foi possível obter a senha.'));
      setRevealedPasswords((prev) => ({ ...prev, [id]: { loading: false, value: '', visible: false, timerId: null } }));
    }
  };

  const handleCopyPassword = async (row) => {
    const id = getId(row);
    const cached = revealedPasswords[id]?.value;
    try {
      const senha = cached || (await getSenhaCredencial(id));
      if (!cached) {
        // guarda em cache sem revelar na tela
        setRevealedPasswords((prev) => ({ ...prev, [id]: { loading: false, value: senha, visible: false, timerId: null } }));
      }
      await navigator.clipboard.writeText(senha);
      toast.success('Senha copiada');
    } catch (error) {
      toast.error(extrairMensagem(error, 'Não foi possível copiar a senha.'));
    }
  };

  const handleCopiarTudo = async (row) => {
    const id = getId(row);
    setCopiandoTudo((prev) => ({ ...prev, [id]: true }));
    try {
      let senha = revealedPasswords[id]?.value;
      if (!senha) {
        try {
          senha = await getSenhaCredencial(id);
          setRevealedPasswords((prev) => ({ ...prev, [id]: { loading: false, value: senha, visible: false, timerId: null } }));
        } catch { /* segue sem senha */ }
      }
      const linhas = [`Sistema: ${row.nome}`];
      if (row.urlAcesso) linhas.push(`Link: ${row.urlAcesso}`);
      if (row.usuarioLogin) linhas.push(`Login: ${row.usuarioLogin}`);
      if (senha) linhas.push(`Senha: ${senha}`);
      if (row.codigoAcesso) linhas.push(`Código: ${row.codigoAcesso}`);
      await navigator.clipboard.writeText(linhas.join('\n'));
      toast.success('Credenciais copiadas!');
    } catch {
      toast.error('Não foi possível copiar.');
    } finally {
      setCopiandoTudo((prev) => ({ ...prev, [id]: false }));
    }
  };

  const copiar = async (texto, label = 'Copiado') => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(label);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  if (!clienteId) {
    return (
      <Typography variant="body2" color="text.secondary">
        Salve o cliente para cadastrar credenciais de acesso.
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Cabeçalho */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h6">Senhas e Acessos</Typography>
          <Typography variant="body2" color="text.secondary">
            Credenciais de portais e sistemas desta empresa. Senhas armazenadas de forma criptografada.
          </Typography>
        </Box>
        <Button
          type="button"
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={abrirNovo}
        >
          Nova credencial
        </Button>
      </Stack>

      {/* Lista */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : credenciais.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
          }}
        >
          <Iconify
            icon="solar:lock-password-bold-duotone"
            width={48}
            sx={{ color: 'text.disabled', mb: 1.5 }}
          />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nenhuma credencial cadastrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre os acessos de portais e sistemas usados por esta empresa.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {credenciais.map((row) => {
            const id = getId(row);
            const revealed = revealedPasswords[id];
            const isCopiandoTudo = copiandoTudo[id];

            return (
              <Grid key={id} xs={12} sm={6} lg={4}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: (t) => t.customShadows?.z8 || '0 8px 16px 0 rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {/* Cabeçalho do card */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.04)})`,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:lock-password-bold" width={18} sx={{ color: 'primary.contrastText' }} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {row.nome}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0} sx={{ flexShrink: 0, ml: 0.5 }}>
                      <Tooltip title="Copiar tudo">
                        <IconButton
                          size="small"
                          onClick={() => handleCopiarTudo(row)}
                          disabled={isCopiandoTudo}
                          sx={{ color: 'text.secondary' }}
                        >
                          {isCopiandoTudo ? (
                            <CircularProgress size={14} />
                          ) : (
                            <Iconify icon="solar:copy-bold" width={16} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => abrirEditar(row)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon="solar:pen-bold" width={16} />
                        </IconButton>
                      </Tooltip>
                      {podeDeletar && (
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmExcluir(row)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  {/* Campos */}
                  <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
                    {row.urlAcesso && (
                      <>
                        <CredRow
                          icon="solar:link-bold"
                          label="Link"
                          value={row.urlAcesso}
                          isLink
                          onCopy={() => copiar(row.urlAcesso, 'Link copiado')}
                        />
                        <Divider sx={{ my: 0.25 }} />
                      </>
                    )}

                    <CredRow
                      icon="solar:user-bold"
                      label="Login"
                      value={row.usuarioLogin}
                      mono
                      onCopy={() => copiar(row.usuarioLogin, 'Login copiado')}
                    />

                    <>
                      <Divider sx={{ my: 0.25 }} />
                      <SenhaRow
                        revealed={revealed}
                        onToggle={() => handleTogglePassword(row)}
                        onCopy={() => handleCopyPassword(row)}
                      />
                    </>

                    {row.codigoAcesso && (
                      <>
                        <Divider sx={{ my: 0.25 }} />
                        <CredRow
                          icon="solar:hashtag-bold"
                          label="Código"
                          value={row.codigoAcesso}
                          mono
                          onCopy={() => copiar(row.codigoAcesso, 'Código copiado')}
                        />
                      </>
                    )}
                  </Box>

                  {/* Rodapé */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.grey[500], 0.04),
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      Atualizado {row.updatedAt ? fDateTime(row.updatedAt) : '—'}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal de criação / edição */}
      <Dialog open={dialogForm.value} onClose={dialogForm.onFalse} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar credencial' : 'Nova credencial'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              placeholder="Ex.: Portal da Prefeitura, e-CAC, NFSe..."
              value={form.nome}
              onChange={handleChange('nome')}
              required
              fullWidth
            />
            <TextField
              label="Usuário / Login"
              value={form.usuarioLogin}
              onChange={handleChange('usuarioLogin')}
              required
              fullWidth
            />
            <TextField
              label="URL de acesso"
              placeholder="https://..."
              value={form.urlAcesso}
              onChange={handleChange('urlAcesso')}
              fullWidth
            />
            <TextField
              label="Código de acesso (opcional)"
              helperText="Código de acesso do contador, certificado, etc."
              value={form.codigoAcesso}
              onChange={handleChange('codigoAcesso')}
              fullWidth
            />
            <TextField
              label={editando ? 'Senha (deixe em branco para manter)' : 'Senha'}
              type={mostrarSenhaForm.value ? 'text' : 'password'}
              value={form.senha}
              onChange={handleChange('senha')}
              required={!editando}
              fullWidth
              autoComplete="new-password"
              helperText={editando ? 'Preencha somente se desejar alterar a senha atual.' : undefined}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="button" edge="end" onClick={mostrarSenhaForm.onToggle} size="small">
                      <Iconify icon={mostrarSenhaForm.value ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" color="inherit" onClick={dialogForm.onFalse} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSalvar}
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {editando ? 'Salvar alterações' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={Boolean(confirmExcluir)}
        onClose={() => setConfirmExcluir(null)}
        title="Excluir credencial?"
        content={
          confirmExcluir
            ? `Confirma a exclusão da credencial "${confirmExcluir.nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        action={
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={handleExcluir}
            disabled={excluindo}
            startIcon={excluindo ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Excluir
          </Button>
        }
      />
    </Stack>
  );
}

// ----------------------------------------------------------------------

function extrairMensagem(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error?.message || error?.error || fallback;
}
