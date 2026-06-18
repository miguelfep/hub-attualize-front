import { useMemo, useState, useEffect } from 'react';
import {
  useSensor,
  DndContext,
  useSensors,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  KeyboardSensor,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';

import { updateLeadStatus } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';

import { LeadKanbanColumn } from './lead-kanban-column';
import { LeadKanbanCardOverlay } from './lead-kanban-card';
import { getLeadStatus, LEAD_KANBAN_COLUMNS } from '../lead-status';

// ----------------------------------------------------------------------

export function LeadKanbanBoard({ leads, onStatusChange, onOpen }) {
  // Cópia local para atualização otimista durante o drag.
  const [items, setItems] = useState(leads);
  const [activeLead, setActiveLead] = useState(null);

  useEffect(() => {
    setItems(leads);
  }, [leads]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Agrupa leads por status.
  const leadsByColumn = useMemo(() => {
    const grouped = {};
    LEAD_KANBAN_COLUMNS.forEach((col) => {
      grouped[col.value] = [];
    });
    items.forEach((lead) => {
      const status = getLeadStatus(lead);
      if (grouped[status]) {
        grouped[status].push(lead);
      } else {
        grouped[LEAD_KANBAN_COLUMNS[0].value].push(lead);
      }
    });
    return grouped;
  }, [items]);

  // Descobre a coluna de destino a partir do elemento sob o cursor.
  const findColumnId = (overId) => {
    if (!overId) return null;
    // Soltou sobre uma coluna diretamente.
    if (LEAD_KANBAN_COLUMNS.some((col) => col.value === overId)) {
      return overId;
    }
    // Soltou sobre outro card → usa o status desse card.
    const overLead = items.find((l) => l._id === overId);
    return overLead ? getLeadStatus(overLead) : null;
  };

  const handleDragStart = (event) => {
    const lead = items.find((l) => l._id === event.active.id);
    setActiveLead(lead || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id;
    const lead = items.find((l) => l._id === leadId);
    if (!lead) return;

    const fromStatus = getLeadStatus(lead);
    const toStatus = findColumnId(over.id);

    if (!toStatus || toStatus === fromStatus) return;

    // Atualização otimista.
    const previousItems = items;
    setItems((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, statusLead: toStatus } : l))
    );

    try {
      const result = await updateLeadStatus(leadId, {
        statusLead: toStatus,
        owner: lead.owner,
        nextFollowUpAt: lead.nextFollowUpAt,
      });

      if (result?.success) {
        toast.success('Status atualizado!');
        onStatusChange?.();
      } else {
        setItems(previousItems);
        toast.error(result?.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      setItems(previousItems);
      toast.error('Erro ao atualizar status');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          alignItems: 'flex-start',
        }}
      >
        {LEAD_KANBAN_COLUMNS.map((column) => (
          <LeadKanbanColumn
            key={column.value}
            column={column}
            leads={leadsByColumn[column.value] || []}
            onOpen={onOpen}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeLead ? (
          <Box sx={{ width: 276 }}>
            <LeadKanbanCardOverlay lead={activeLead} />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
