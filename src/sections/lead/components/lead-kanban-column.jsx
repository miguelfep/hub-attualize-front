import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Label } from 'src/components/label';

import { LeadKanbanCard } from './lead-kanban-card';

// ----------------------------------------------------------------------

export function LeadKanbanColumn({ column, leads, onOpen }) {
  const theme = useTheme();

  const { setNodeRef, isOver } = useDroppable({
    id: column.value,
    data: { type: 'column', columnId: column.value },
  });

  return (
    <Stack
      sx={{
        flexShrink: 0,
        width: 300,
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      {/* Cabeçalho */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ p: 2, pb: 1.5 }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: `${column.color}.main`,
          }}
        />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {column.label}
        </Typography>
        <Label color={column.color} variant="soft">
          {leads.length}
        </Label>
      </Stack>

      {/* Lista de cards (área droppable) */}
      <Box
        ref={setNodeRef}
        sx={{
          flexGrow: 1,
          minHeight: 120,
          px: 1.5,
          pb: 2,
          borderRadius: 2,
          transition: theme.transitions.create(['background-color']),
          ...(isOver && { bgcolor: alpha(theme.palette[column.color]?.main || theme.palette.grey[500], 0.12) }),
        }}
      >
        <SortableContext
          items={leads.map((l) => l._id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1.5}>
            {leads.map((lead) => (
              <LeadKanbanCard key={lead._id} lead={lead} onOpen={onOpen} />
            ))}
          </Stack>
        </SortableContext>

        {leads.length === 0 && (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              color: 'text.disabled',
              border: `1px dashed ${alpha(theme.palette.grey[500], 0.24)}`,
              borderRadius: 1.5,
            }}
          >
            <Typography variant="caption">Arraste leads para cá</Typography>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
