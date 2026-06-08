'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CARDS = [
  { key: 'aVencer', label: 'A vencer (7 dias)', color: 'warning.main', icon: 'solar:clock-circle-bold' },
  { key: 'atrasadas', label: 'Atrasadas', color: 'error.main', icon: 'solar:danger-triangle-bold' },
  { key: 'pendentes', label: 'Pendentes', color: 'text.secondary', icon: 'solar:hourglass-line-bold' },
  { key: 'emAndamento', label: 'Em andamento', color: 'info.main', icon: 'solar:play-circle-bold' },
  { key: 'concluidas', label: 'Concluídas', color: 'success.main', icon: 'solar:check-circle-bold' },
];

/**
 * Barra de contadores da tela de tarefas. Cada card é clicável e aplica o
 * filtro correspondente.
 *
 * @param {object}  props
 * @param {object}  props.resumo   { aVencer, atrasadas, pendentes, emAndamento, concluidas }
 * @param {boolean} props.loading
 * @param {string}  props.ativo    chave do card atualmente filtrado
 * @param {(key: string) => void} props.onSelect
 */
export function TarefasCounters({ resumo = {}, loading, ativo, onSelect }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        mb: 3,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(5, 1fr)',
        },
      }}
    >
      {CARDS.map((c) => (
        <Card
          key={c.key}
          onClick={() => onSelect?.(c.key)}
          sx={{
            p: 2.5,
            cursor: 'pointer',
            transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
            border: (theme) => `solid 2px ${ativo === c.key ? theme.vars.palette.primary.main : 'transparent'}`,
            '&:hover': { boxShadow: (theme) => theme.customShadows.z8 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon={c.icon} width={22} sx={{ color: c.color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {c.label}
            </Typography>
          </Stack>
          {loading ? (
            <Skeleton width={40} height={32} />
          ) : (
            <Typography variant="h4">{resumo[c.key] ?? 0}</Typography>
          )}
        </Card>
      ))}
    </Box>
  );
}
