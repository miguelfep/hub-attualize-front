import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const STATUS_COLOR = { pendente: 'warning', aberta: 'info', resolvida: 'success' };
const PROXIMOS_STATUS = [
  { value: 'aberta', label: 'Reabrir (em atendimento)', icon: 'solar:chat-round-dots-bold' },
  { value: 'pendente', label: 'Mover para pendente', icon: 'solar:clock-circle-bold' },
  { value: 'resolvida', label: 'Marcar como resolvida', icon: 'solar:check-circle-bold' },
];

const iniciais = (nome) =>
  (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

// ----------------------------------------------------------------------

export function WaHeaderDetail({ conversa, onAtribuir, onTransferir, onMudarStatus }) {
  const statusPopover = usePopover();
  const [mudando, setMudando] = useState(false);

  if (!conversa) return null;

  const nome = conversa?.contato?.profileName || conversa?.contato?.waId || 'Contato';
  const setores = conversa?.setores || [];
  const atendente = conversa?.atendente;

  const handleStatus = async (status) => {
    statusPopover.onClose();
    if (status === conversa.status) return;
    setMudando(true);
    try {
      await onMudarStatus?.(status);
    } finally {
      setMudando(false);
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{
        pr: 1,
        pl: 2.5,
        py: 1,
        height: 72,
        borderBottom: (t) => `solid 1px ${t.vars.palette.divider}`,
      }}
    >
      <Avatar sx={{ width: 40, height: 40, mr: 2 }}>{iniciais(nome)}</Avatar>

      <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {nome}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
          <Typography variant="caption" noWrap>
            {conversa?.contato?.waId}
          </Typography>
          {conversa?.ultimaMensagemEm && (
            <Typography variant="caption" noWrap>
              · última {fToNow(conversa.ultimaMensagemEm)}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Chips de setor/atendente */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mr: 1 }}>
        {setores.map((s) => (
          <Label key={s} variant="soft" sx={{ textTransform: 'lowercase' }}>
            {s}
          </Label>
        ))}
        {atendente && (
          <Label variant="outlined" startIcon={<Iconify icon="solar:user-bold" width={14} />}>
            {atendente.name}
          </Label>
        )}
      </Stack>

      {/* Status */}
      <Button
        size="small"
        color={STATUS_COLOR[conversa.status] || 'default'}
        variant="soft"
        disabled={mudando}
        endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
        onClick={statusPopover.onOpen}
        sx={{ mr: 1, textTransform: 'capitalize' }}
      >
        {conversa.status}
      </Button>

      <IconButton onClick={onAtribuir} title="Atribuir">
        <Iconify icon="solar:user-plus-bold" />
      </IconButton>
      <IconButton onClick={onTransferir} title="Transferir">
        <Iconify icon="solar:transfer-horizontal-bold" />
      </IconButton>

      <CustomPopover open={statusPopover.open} anchorEl={statusPopover.anchorEl} onClose={statusPopover.onClose}>
        <MenuList sx={{ width: 240 }}>
          {PROXIMOS_STATUS.map((s) => (
            <MenuItem
              key={s.value}
              selected={s.value === conversa.status}
              onClick={() => handleStatus(s.value)}
            >
              <Iconify icon={s.icon} />
              {s.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </Stack>
  );
}
