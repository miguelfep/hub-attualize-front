import { useMemo, useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { WaNavItem } from './wa-nav-item';
import { ABAS } from './hooks/use-wa-inbox';

// ----------------------------------------------------------------------

const nomeContato = (c) => c?.contato?.profileName || c?.contato?.waId || '';

// ----------------------------------------------------------------------

export function WaNav({
  aba,
  onChangeAba,
  conversas,
  carregando,
  selecionadaId,
  onSelecionar,
  onRecarregar,
  onNovaConversa,
  conectado,
}) {
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return conversas;
    return conversas.filter(
      (c) =>
        nomeContato(c).toLowerCase().includes(q) ||
        (c?.ultimaMensagemPreview || '').toLowerCase().includes(q)
    );
  }, [busca, conversas]);

  return (
    <Stack
      sx={{
        width: 320,
        flexShrink: 0,
        borderRight: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1.5 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Atendimento
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

        <IconButton onClick={onRecarregar}>
          <Iconify icon="solar:refresh-bold" />
        </IconButton>
      </Stack>

      {/* Nova conversa */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
          onClick={onNovaConversa}
        >
          Nova conversa
        </Button>
      </Box>

      {/* Busca */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <InputBase
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar contato…"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{
            px: 1.5,
            height: 40,
            width: 1,
            borderRadius: 1,
            bgcolor: 'background.neutral',
          }}
        />
      </Box>

      {/* Abas por status */}
      <Tabs
        value={aba}
        onChange={(_, v) => onChangeAba(v)}
        variant="fullWidth"
        sx={{ px: 1, boxShadow: (t) => `inset 0 -1px 0 0 ${t.vars.palette.divider}` }}
      >
        {ABAS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} sx={{ minHeight: 44 }} />
        ))}
      </Tabs>

      {/* Lista */}
      <Scrollbar sx={{ flex: '1 1 auto' }}>
        {carregando && !conversas.length ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : filtradas.length ? (
          <Box component="ul">
            {filtradas.map((conversa) => (
              <WaNavItem
                key={conversa._id}
                conversa={conversa}
                selecionada={conversa._id === selecionadaId}
                onSelecionar={onSelecionar}
              />
            ))}
          </Box>
        ) : (
          <EmptyContent title="Nenhuma conversa" sx={{ py: 5 }} />
        )}
      </Scrollbar>
    </Stack>
  );
}
