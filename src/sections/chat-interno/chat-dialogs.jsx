import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { avatarUrl } from 'src/utils/avatar';

import {
  criarDmChat,
  criarCanalChat,
  entrarCanalChat,
  getBrowseCanais,
  removerMembroChat,
  adicionarMembroChat,
  getCanaisArquivados,
  desarquivarCanalChat,
} from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------
// Diálogos do chat interno: novo canal (gestor), nova DM, explorar canais
// públicos e gestão de membros.
// ----------------------------------------------------------------------

/**
 * Opção de usuário com foto (fallback: inicial) — usada nos Autocompletes.
 * A `key` vem dentro de `props` (padrão do MUI + React 19) e precisa ser passada
 * explicitamente, fora do spread.
 */
const renderOptionUsuario = (props, u) => {
  const { key, ...optionProps } = props;
  return (
    <Stack
      component="li"
      key={key ?? u._id}
      {...optionProps}
      direction="row"
      alignItems="center"
      spacing={1}
    >
      <Avatar src={avatarUrl(u) || undefined} sx={{ width: 28, height: 28, fontSize: 13 }}>
        {(u?.name || '?')[0]?.toUpperCase()}
      </Avatar>
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {u?.name}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: 'text.disabled' }}>
          {u?.email}
        </Typography>
      </Stack>
    </Stack>
  );
};

export function ChatNovoCanalDialog({ open, usuarios, onClose, onCriado }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [privado, setPrivado] = useState(false);
  const [membros, setMembros] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome('');
    setDescricao('');
    setPrivado(false);
    setMembros([]);
  }, [open]);

  const handleCriar = useCallback(async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do canal.');
      return;
    }
    setSalvando(true);
    try {
      const canal = await criarCanalChat({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        privado,
        membros: membros.map((u) => u._id),
      });
      toast.success('Canal criado.');
      onCriado?.(canal);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Falha ao criar o canal.');
    } finally {
      setSalvando(false);
    }
  }, [nome, descricao, privado, membros, onCriado]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Novo canal</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
          <TextField
            label="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            multiline
            minRows={2}
          />
          <Autocomplete
            multiple
            options={usuarios}
            value={membros}
            onChange={(_, v) => setMembros(v)}
            getOptionLabel={(u) => u?.name || u?.email || ''}
            isOptionEqualToValue={(a, b) => a._id === b._id}
            renderOption={renderOptionUsuario}
            renderInput={(params) => <TextField {...params} label="Membros iniciais" />}
          />
          <FormControlLabel
            control={<Switch checked={privado} onChange={(e) => setPrivado(e.target.checked)} />}
            label="Canal privado (só membros veem)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} onClick={handleCriar}>
          Criar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function ChatNovaDmDialog({ open, usuarios, meuId, onClose, onCriada }) {
  const [usuario, setUsuario] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) setUsuario(null);
  }, [open]);

  const opcoes = usuarios.filter((u) => String(u._id) !== String(meuId));

  const handleCriar = useCallback(async () => {
    if (!usuario?._id) return;
    setSalvando(true);
    try {
      const dm = await criarDmChat(usuario._id);
      onCriada?.(dm);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Falha ao abrir a DM.');
    } finally {
      setSalvando(false);
    }
  }, [usuario, onCriada]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova mensagem direta</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ pt: 1 }}
          options={opcoes}
          value={usuario}
          onChange={(_, v) => setUsuario(v)}
          getOptionLabel={(u) => u?.name || u?.email || ''}
          isOptionEqualToValue={(a, b) => a._id === b._id}
          renderOption={renderOptionUsuario}
          renderInput={(params) => <TextField {...params} label="Com quem?" autoFocus />}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" loading={salvando} disabled={!usuario} onClick={handleCriar}>
          Conversar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function ChatBrowseDialog({ open, meuId, ehAdminTop, onClose, onEntrou, onMudou }) {
  const [aba, setAba] = useState('publicos'); // 'publicos' | 'arquivados'
  const [canais, setCanais] = useState([]);
  const [arquivados, setArquivados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [acaoId, setAcaoId] = useState(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    Promise.all([getBrowseCanais(), getCanaisArquivados()])
      .then(([pub, arq]) => {
        setCanais(pub);
        setArquivados(arq);
      })
      .catch(() => toast.error('Falha ao listar canais.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    setAba('publicos');
    carregar();
  }, [open, carregar]);

  const handleEntrar = useCallback(
    async (canal) => {
      setAcaoId(canal._id);
      try {
        const c = await entrarCanalChat(canal._id);
        toast.success(`Você entrou em #${canal.nome}.`);
        onEntrou?.(c);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Falha ao entrar no canal.');
      } finally {
        setAcaoId(null);
      }
    },
    [onEntrou]
  );

  const handleDesarquivar = useCallback(
    async (canal) => {
      setAcaoId(canal._id);
      try {
        await desarquivarCanalChat(canal._id);
        toast.success(`#${canal.nome} desarquivado.`);
        carregar();
        onMudou?.();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Falha ao desarquivar.');
      } finally {
        setAcaoId(null);
      }
    },
    [carregar, onMudou]
  );

  // Ciclo de vida: criador ou admin/superadmin (o backend também valida).
  const podeCicloItem = (c) => ehAdminTop || String(c.criadoPor) === String(meuId);

  const lista = aba === 'publicos' ? canais : arquivados;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 0 }}>Explorar canais</DialogTitle>
      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ px: 3 }}>
        <Tab value="publicos" label="Públicos" />
        <Tab value="arquivados" label={`Arquivados (${arquivados.length})`} />
      </Tabs>
      <DialogContent sx={{ minHeight: 200 }}>
        {!carregando && !lista.length && (
          <EmptyContent
            title={aba === 'publicos' ? 'Nenhum canal público' : 'Nenhum canal arquivado'}
            sx={{ py: 4 }}
          />
        )}
        <List dense>
          {lista.map((c) => (
            <ListItem
              key={c._id}
              secondaryAction={
                aba === 'publicos' ? (
                  c.souMembro ? (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      membro
                    </Typography>
                  ) : (
                    <LoadingButton
                      size="small"
                      variant="outlined"
                      loading={acaoId === c._id}
                      onClick={() => handleEntrar(c)}
                    >
                      Entrar
                    </LoadingButton>
                  )
                ) : podeCicloItem(c) ? (
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={acaoId === c._id}
                    onClick={() => handleDesarquivar(c)}
                  >
                    Desarquivar
                  </LoadingButton>
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    só o criador
                  </Typography>
                )
              }
            >
              <ListItemText
                primary={`#${c.nome}`}
                secondary={c.descricao || `${c.totalMembros} membro(s)`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function ChatMembrosDialog({ open, canal, usuarios, ehGestor, onClose, onMudou }) {
  const [novo, setNovo] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const membros = canal?.membros || [];
  const membrosIds = new Set(membros.map((m) => String(m?.usuario?._id || m?.usuario)));
  const candidatos = usuarios.filter((u) => !membrosIds.has(String(u._id)));

  const handleAdicionar = useCallback(async () => {
    if (!novo?._id || !canal?._id) return;
    setSalvando(true);
    try {
      await adicionarMembroChat(canal._id, novo._id);
      setNovo(null);
      onMudou?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Falha ao adicionar.');
    } finally {
      setSalvando(false);
    }
  }, [novo, canal, onMudou]);

  const handleRemover = useCallback(
    async (userId) => {
      try {
        await removerMembroChat(canal._id, userId);
        onMudou?.();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Falha ao remover.');
      }
    },
    [canal, onMudou]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Membros {canal?.nome ? `de #${canal.nome}` : ''}</DialogTitle>
      <DialogContent>
        {ehGestor && (
          <Stack direction="row" spacing={1} sx={{ pt: 1, pb: 2 }}>
            <Autocomplete
              fullWidth
              options={candidatos}
              value={novo}
              onChange={(_, v) => setNovo(v)}
              getOptionLabel={(u) => u?.name || u?.email || ''}
              isOptionEqualToValue={(a, b) => a._id === b._id}
            renderOption={renderOptionUsuario}
              renderInput={(params) => <TextField {...params} size="small" label="Adicionar membro" />}
            />
            <LoadingButton variant="contained" loading={salvando} disabled={!novo} onClick={handleAdicionar}>
              Adicionar
            </LoadingButton>
          </Stack>
        )}
        <List dense>
          {membros.map((m) => {
            const u = m?.usuario || {};
            const id = String(u._id || m.usuario);
            return (
              <ListItemButton key={id} disableRipple sx={{ cursor: 'default' }}>
                <ListItemAvatar>
                  <Avatar src={avatarUrl(u) || undefined} sx={{ width: 32, height: 32 }}>{(u.name || '?')[0]?.toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={u.name || id} secondary={m.papel === 'admin' ? 'admin' : ''} />
                {ehGestor && (
                  <IconButton size="small" color="error" onClick={() => handleRemover(id)}>
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
