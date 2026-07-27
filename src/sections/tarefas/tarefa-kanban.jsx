'use client';

import { useState } from 'react';

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
  transicoesPermitidas,
} from './utils';

// ----------------------------------------------------------------------

function KanbanCard({ tarefa, setores, onClick, onDragStart, onDragEnd, arrastavel }) {
  const totalItens = tarefa.checklist?.length || 0;
  const itensConcluidos = totalItens
    ? tarefa.checklist.filter((i) => i.concluido).length
    : 0;

  return (
    <Card
      onClick={() => onClick(tarefa)}
      draggable={arrastavel}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(tarefa);
      }}
      onDragEnd={() => onDragEnd?.()}
      sx={{
        p: 1.5,
        cursor: arrastavel ? 'grab' : 'pointer',
        '&:hover': { boxShadow: (theme) => theme.customShadows.z8 },
        '&:active': arrastavel ? { cursor: 'grabbing' } : undefined,
      }}
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
        {totalItens > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{ ml: 0.75, color: itensConcluidos === totalItens ? 'success.main' : 'text.disabled' }}
          >
            <Iconify icon="eva:checkmark-square-2-outline" width={14} />
            <Typography variant="caption">
              {itensConcluidos}/{totalItens}
            </Typography>
          </Stack>
        )}
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
 * Quadro Kanban das tarefas, agrupadas por status. Os cards abrem o drawer de
 * detalhes e podem ser ARRASTADOS entre colunas — o drop só é aceito quando a
 * transição de status é válida (Cancelada fica de fora: exige motivo, feito
 * pelo drawer). A mudança em si é responsabilidade do pai via `onMoverStatus`.
 *
 * @param {object} props
 * @param {Array}  props.tarefas
 * @param {Array}  props.setores
 * @param {boolean} props.loading
 * @param {(tarefa: object) => void} props.onCardClick
 * @param {(tarefa: object, novoStatus: string) => void} [props.onMoverStatus]
 */
export function TarefaKanban({ tarefas = [], setores = [], loading, onCardClick, onMoverStatus }) {
  // Tarefa em arrasto (HTML5 DnD não expõe o payload durante o dragover).
  const [arrastando, setArrastando] = useState(null);

  const aceitaDrop = (col) =>
    Boolean(
      arrastando &&
        onMoverStatus &&
        col !== 'cancelada' &&
        transicoesPermitidas(arrastando.status).includes(col)
    );

  return (
    <Scrollbar sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, minHeight: 360 }}>
        {STATUS_OPTIONS.map((col) => {
          const itens = tarefas.filter((t) => t.status === col.value);
          const dropAtivo = aceitaDrop(col.value);
          return (
            <Paper
              key={col.value}
              variant="outlined"
              onDragOver={(e) => {
                if (dropAtivo) e.preventDefault();
              }}
              onDrop={(e) => {
                if (!dropAtivo) return;
                e.preventDefault();
                const tarefa = arrastando;
                setArrastando(null);
                onMoverStatus?.(tarefa, col.value);
              }}
              sx={{
                width: 300,
                flexShrink: 0,
                p: 1.5,
                bgcolor: 'background.neutral',
                ...(arrastando && {
                  opacity: dropAtivo ? 1 : 0.55,
                  ...(dropAtivo && {
                    outline: (theme) => `2px dashed ${theme.vars.palette.primary.main}`,
                    outlineOffset: -2,
                  }),
                }),
              }}
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
                  <KanbanCard
                    key={t._id}
                    tarefa={t}
                    setores={setores}
                    onClick={onCardClick}
                    arrastavel={Boolean(onMoverStatus) && transicoesPermitidas(t.status).length > 0}
                    onDragStart={setArrastando}
                    onDragEnd={() => setArrastando(null)}
                  />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Scrollbar>
  );
}
