import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { somAtivo, alternarSom } from 'src/components/chat-alerts/chat-som';

import { ChatNavItem, nomeDaConversa } from './chat-nav-item';

// ----------------------------------------------------------------------
// Navegação do chat: seção de Canais (#) e de Mensagens diretas, busca e o menu
// "+" (novo canal p/ gestores, nova DM, explorar canais públicos).
// ----------------------------------------------------------------------

function Secao({ titulo, children }) {
  return (
    <Box sx={{ pb: 1 }}>
      <Typography
        variant="overline"
        sx={{ px: 2.5, py: 1, display: 'block', color: 'text.disabled' }}
      >
        {titulo}
      </Typography>
      <Box component="ul">{children}</Box>
    </Box>
  );
}

export function ChatNav({
  canais,
  meuId,
  onlineIds,
  ausenteIds,
  ehGestor,
  carregando,
  selecionadoId,
  onSelecionar,
  onRecarregar,
  onNovoCanal,
  onNovaDm,
  onBrowse,
  conectado,
}) {
  const [busca, setBusca] = useState('');
  const [menuEl, setMenuEl] = useState(null);
  const [som, setSom] = useState(() => somAtivo());

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return canais;
    return canais.filter((c) => nomeDaConversa(c, meuId).toLowerCase().includes(q));
  }, [busca, canais, meuId]);

  const listaCanais = filtrados.filter((c) => c.tipo === 'canal');
  const listaDms = filtrados.filter((c) => c.tipo === 'dm');

  const fecharMenu = () => setMenuEl(null);

  return (
    <Stack
      sx={{
        width: 300,
        flexShrink: 0,
        borderRight: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1.5 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Chat
        </Typography>

        <Tooltip title={conectado ? 'Conectado (ao vivo)' : 'Reconectando…'}>
          <Box
            sx={{
              width: 10,
              height: 10,
              mr: 1,
              borderRadius: '50%',
              bgcolor: conectado ? 'success.main' : 'warning.main',
            }}
          />
        </Tooltip>

        <Tooltip title={som ? 'Som de notificação ligado' : 'Som de notificação desligado'}>
          <IconButton onClick={() => setSom(alternarSom())}>
            <Iconify icon={som ? 'solar:volume-loud-bold' : 'solar:volume-cross-bold'} />
          </IconButton>
        </Tooltip>

        <IconButton onClick={onRecarregar}>
          <Iconify icon="solar:refresh-bold" />
        </IconButton>

        <IconButton color="primary" onClick={(e) => setMenuEl(e.currentTarget)}>
          <Iconify icon="mingcute:add-line" />
        </IconButton>

        <Menu anchorEl={menuEl} open={!!menuEl} onClose={fecharMenu}>
          {ehGestor && (
            <MenuItem
              onClick={() => {
                fecharMenu();
                onNovoCanal();
              }}
            >
              <ListItemIcon>
                <Iconify icon="material-symbols:tag" />
              </ListItemIcon>
              <ListItemText>Novo canal</ListItemText>
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              fecharMenu();
              onNovaDm();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:user-rounded-bold" />
            </ListItemIcon>
            <ListItemText>Nova mensagem direta</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              fecharMenu();
              onBrowse();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:compass-bold" />
            </ListItemIcon>
            <ListItemText>Explorar canais</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      {/* Busca */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <InputBase
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar…"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ px: 1.5, height: 40, width: 1, borderRadius: 1, bgcolor: 'background.neutral' }}
        />
      </Box>

      {/* Lista */}
      <Scrollbar sx={{ flex: '1 1 auto' }}>
        {carregando && !canais.length ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : filtrados.length ? (
          <>
            {listaCanais.length > 0 && (
              <Secao titulo="Canais">
                {listaCanais.map((c) => (
                  <ChatNavItem
                    key={c._id}
                    canal={c}
                    meuId={meuId}
                    onlineIds={onlineIds}
                    ausenteIds={ausenteIds}
                    selecionado={c._id === selecionadoId}
                    onSelecionar={onSelecionar}
                  />
                ))}
              </Secao>
            )}
            {listaDms.length > 0 && (
              <Secao titulo="Mensagens diretas">
                {listaDms.map((c) => (
                  <ChatNavItem
                    key={c._id}
                    canal={c}
                    meuId={meuId}
                    onlineIds={onlineIds}
                    ausenteIds={ausenteIds}
                    selecionado={c._id === selecionadoId}
                    onSelecionar={onSelecionar}
                  />
                ))}
              </Secao>
            )}
          </>
        ) : (
          <EmptyContent
            title="Nenhuma conversa"
            description="Crie um canal, explore os públicos ou inicie uma DM."
            sx={{ py: 5 }}
          />
        )}
      </Scrollbar>
    </Stack>
  );
}
