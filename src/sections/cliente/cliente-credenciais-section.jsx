'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
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

// Perfis autorizados a visualizar a senha (rota interna). O backend também valida.
const ROLES_PODE_VER_SENHA = ['admin', 'operacional', 'financeiro', 'contabil_externo'];

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

export default function ClienteCredenciaisSection({ clienteId }) {
  const { user } = useAuthContext();
  const podeVerSenha = ROLES_PODE_VER_SENHA.includes(user?.role);

  const [credenciais, setCredenciais] = useState([]);
  const [loading, setLoading] = useState(true);

  const dialogForm = useBoolean();
  const [editando, setEditando] = useState(null); // credencial em edição ou null
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const mostrarSenhaForm = useBoolean();

  const [confirmExcluir, setConfirmExcluir] = useState(null); // credencial a excluir
  const [excluindo, setExcluindo] = useState(false);

  const dialogSenha = useBoolean();
  const [senhaVisivel, setSenhaVisivel] = useState({ nome: '', valor: '', loading: false });

  const carregar = useCallback(async () => {
    if (!clienteId) {
      setCredenciais([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const lista = await getCredenciaisAcesso(clienteId);
      setCredenciais(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
      toast.error(extrairMensagem(error, 'Não foi possível carregar as credenciais.'));
      setCredenciais([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
      senha: '', // nunca pré-preenche; só envia se o usuário digitar
    });
    mostrarSenhaForm.onFalse();
    dialogForm.onTrue();
  };

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error('Informe o nome da credencial.');
      return;
    }
    if (!form.usuarioLogin.trim()) {
      toast.error('Informe o usuário/login.');
      return;
    }
    if (!editando && !form.senha) {
      toast.error('A senha é obrigatória no cadastro.');
      return;
    }

    try {
      setSalvando(true);
      const payload = {
        nome: form.nome.trim(),
        usuarioLogin: form.usuarioLogin.trim(),
        urlAcesso: form.urlAcesso.trim(),
        codigoAcesso: form.codigoAcesso.trim(),
      };
      // Só envia a senha quando preenchida (na edição, vazio mantém a anterior).
      if (form.senha) payload.senha = form.senha;

      if (editando) {
        await updateCredencialAcesso(clienteId, getId(editando), payload);
        toast.success('Credencial atualizada com sucesso.');
      } else {
        await createCredencialAcesso(clienteId, payload);
        toast.success('Credencial salva com sucesso.');
      }
      dialogForm.onFalse();
      setForm(FORM_VAZIO);
      await carregar();
    } catch (error) {
      console.error('Erro ao salvar credencial:', error);
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
      console.error('Erro ao excluir credencial:', error);
      toast.error(extrairMensagem(error, 'Erro ao remover a credencial.'));
    } finally {
      setExcluindo(false);
    }
  };

  const handleVerSenha = async (row) => {
    setSenhaVisivel({ nome: row.nome, valor: '', loading: true });
    dialogSenha.onTrue();
    try {
      const senha = await getSenhaCredencial(getId(row));
      setSenhaVisivel({ nome: row.nome, valor: senha, loading: false });
    } catch (error) {
      console.error('Erro ao obter senha:', error);
      dialogSenha.onFalse();
      setSenhaVisivel({ nome: '', valor: '', loading: false });
      toast.error(extrairMensagem(error, 'Não foi possível obter a senha.'));
    }
  };

  const fecharDialogSenha = () => {
    dialogSenha.onFalse();
    // Limpa a senha da memória ao fechar — não persistir.
    setSenhaVisivel({ nome: '', valor: '', loading: false });
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
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h6">Senhas e Acessos</Typography>
          <Typography variant="body2" color="text.secondary">
            Credenciais de portais e sistemas desta empresa. As senhas são armazenadas
            criptografadas.
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : credenciais.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Iconify
            icon="solar:lock-password-bold-duotone"
            width={48}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Nenhuma credencial cadastrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre os acessos de portais e sistemas usados por esta empresa.
          </Typography>
        </Card>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Usuário / Login</TableCell>
                <TableCell>URL de acesso</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Atualizado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credenciais.map((row) => (
                <TableRow key={getId(row)} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{row.nome}</Typography>
                  </TableCell>
                  <TableCell>{row.usuarioLogin || '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    {row.urlAcesso ? (
                      <Link
                        href={row.urlAcesso}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-block',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.urlAcesso}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{row.codigoAcesso || '—'}</TableCell>
                  <TableCell>{row.updatedAt ? fDateTime(row.updatedAt) : '—'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {podeVerSenha && (
                        <Tooltip title="Ver senha">
                          <IconButton
                            type="button"
                            size="small"
                            color="warning"
                            onClick={() => handleVerSenha(row)}
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Editar">
                        <IconButton type="button" size="small" onClick={() => abrirEditar(row)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          type="button"
                          size="small"
                          color="error"
                          onClick={() => setConfirmExcluir(row)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de criação / edição */}
      <Dialog open={dialogForm.value} onClose={dialogForm.onFalse} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar credencial' : 'Nova credencial'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              placeholder="Ex.: Portal da Prefeitura"
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
              helperText={
                editando ? 'Preencha somente se desejar alterar a senha atual.' : undefined
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      onClick={mostrarSenhaForm.onToggle}
                      size="small"
                    >
                      <Iconify
                        icon={mostrarSenhaForm.value ? 'solar:eye-closed-bold' : 'solar:eye-bold'}
                      />
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
            startIcon={
              salvando ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {editando ? 'Salvar alterações' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de visualização de senha */}
      <Dialog open={dialogSenha.value} onClose={fecharDialogSenha} maxWidth="xs" fullWidth>
        <DialogTitle>Senha — {senhaVisivel.nome}</DialogTitle>
        <DialogContent>
          {senhaVisivel.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <TextField
                label="Senha"
                value={senhaVisivel.valor}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copiar">
                        <IconButton
                          type="button"
                          edge="end"
                          size="small"
                          onClick={() => copiar(senhaVisivel.valor, 'Senha copiada')}
                        >
                          <Iconify icon="solar:copy-bold" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Por segurança, esta senha não fica salva no navegador e some ao fechar.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outlined" color="inherit" onClick={fecharDialogSenha}>
            Fechar
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
