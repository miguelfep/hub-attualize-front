import { useState } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AvatarGroup from '@mui/material/AvatarGroup';
import ListItemIcon from '@mui/material/ListItemIcon';

import { avatarUrl } from 'src/utils/avatar';

import { Iconify } from 'src/components/iconify';

import { nomeDaConversa } from './chat-nav-item';

// ----------------------------------------------------------------------

export function ChatHeader({
  canal,
  meuId,
  podeCiclo,
  onMembros,
  onWaIniciar,
  onArquivar,
  onExcluir,
  onSair,
}) {
  const [menuEl, setMenuEl] = useState(null);
  const ehCanal = canal?.tipo === 'canal';
  const nome = nomeDaConversa(canal, meuId);
  const membros = canal?.membros || [];

  const fechar = () => setMenuEl(null);
  const acao = (fn) => () => {
    fechar();
    fn?.();
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ px: 2.5, py: 1.5, borderBottom: (t) => `solid 1px ${t.vars.palette.divider}` }}
    >
      <Iconify
        icon={
          !ehCanal
            ? 'solar:user-rounded-bold'
            : canal?.privado
              ? 'solar:lock-keyhole-bold'
              : 'material-symbols:tag'
        }
        sx={{ color: 'text.secondary' }}
      />

      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>
          {nome}
        </Typography>
        {canal?.descricao && (
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
            {canal.descricao}
          </Typography>
        )}
      </Stack>

      {ehCanal && (
        <AvatarGroup
          max={4}
          onClick={onMembros}
          sx={{ cursor: 'pointer', '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}
        >
          {membros.map((m) => {
            const u = m?.usuario || {};
            return (
              <Avatar key={u._id || m.usuario} src={avatarUrl(u) || undefined}>
                {(u.name || '?')[0]?.toUpperCase()}
              </Avatar>
            );
          })}
        </AvatarGroup>
      )}

      <IconButton onClick={(e) => setMenuEl(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu anchorEl={menuEl} open={!!menuEl} onClose={fechar}>
        <MenuItem onClick={acao(onWaIniciar)}>
          <ListItemIcon>
            <Iconify icon="ic:baseline-whatsapp" />
          </ListItemIcon>
          Iniciar atendimento WhatsApp
        </MenuItem>
        {ehCanal && (
          <MenuItem onClick={acao(onMembros)}>
            <ListItemIcon>
              <Iconify icon="solar:users-group-rounded-bold" />
            </ListItemIcon>
            Membros
          </MenuItem>
        )}
        {ehCanal && (
          <MenuItem onClick={acao(onSair)}>
            <ListItemIcon>
              <Iconify icon="solar:logout-2-bold" />
            </ListItemIcon>
            Sair do canal
          </MenuItem>
        )}
        {ehCanal && podeCiclo && (
          <MenuItem onClick={acao(onArquivar)}>
            <ListItemIcon>
              <Iconify icon="solar:archive-bold" />
            </ListItemIcon>
            Arquivar canal
          </MenuItem>
        )}
        {ehCanal && podeCiclo && (
          <MenuItem sx={{ color: 'error.main' }} onClick={acao(onExcluir)}>
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Excluir canal
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
}
