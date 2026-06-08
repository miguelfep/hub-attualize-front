'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import {
  setorNome,
  statusColor,
  statusLabel,
  clienteLabel,
  STATUS_OPTIONS,
  prioridadeColor,
  prioridadeLabel,
} from './utils';

// ----------------------------------------------------------------------

function KanbanCard({ tarefa, setores, onClick }) {
  return (
    <Card
      onClick={() => onClick(tarefa)}
      sx={{ p: 1.5, cursor: 'pointer', '&:hover': { boxShadow: (theme) => theme.customShadows.z8 } }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {tarefa.titulo}
      </Typography>

      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
        {clienteLabel(tarefa.cliente)}
      </Typography>

      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
        <Label variant="soft" color={prioridadeColor(tarefa.prioridade)}>
          {prioridadeLabel(tarefa.prioridade)}
        </Label>
        {tarefa.atrasada && (
          <Label variant="soft" color="error">
            Atrasada
          </Label>
        )}
        {(tarefa.setores || []).map((s) => (
          <Label key={s} variant="outlined" color="default">
            {setorNome(s, setores)}
          </Label>
        ))}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.disabled' }}>
        <Iconify icon="solar:calendar-mark-bold" width={14} />
        <Typography variant="caption">{fDate(tarefa.prazo)}</Typography>
        {tarefa.responsavel?.name && (
          <Typography variant="caption" sx={{ ml: 'auto' }} noWrap>
            {tarefa.responsavel.name}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

/**
 * Quadro Kanban (visualização) das tarefas, agrupadas por status. Os cards são
 * clicáveis e abrem o drawer de detalhes, onde o status muda respeitando as
 * transições válidas.
 *
 * @param {object} props
 * @param {Array}  props.tarefas
 * @param {Array}  props.setores
 * @param {boolean} props.loading
 * @param {(tarefa: object) => void} props.onCardClick
 */
export function TarefaKanban({ tarefas = [], setores = [], loading, onCardClick }) {
  return (
    <Scrollbar sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, minHeight: 360 }}>
        {STATUS_OPTIONS.map((col) => {
          const itens = tarefas.filter((t) => t.status === col.value);
          return (
            <Paper
              key={col.value}
              variant="outlined"
              sx={{ width: 300, flexShrink: 0, p: 1.5, bgcolor: 'background.neutral' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle2">{statusLabel(col.value)}</Typography>
                <Label color={statusColor(col.value)}>{itens.length}</Label>
              </Stack>

              <Stack spacing={1.5}>
                {!loading && itens.length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', py: 2, textAlign: 'center' }}>
                    Nenhuma tarefa
                  </Typography>
                )}
                {itens.map((t) => (
                  <KanbanCard key={t._id} tarefa={t} setores={setores} onClick={onCardClick} />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Scrollbar>
  );
}
