import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { parseLeadDate, getFollowUpStatus } from '../lead-permissions';

// ----------------------------------------------------------------------

// Conteúdo visual do card (usado tanto no card arrastável quanto no overlay).
function LeadCardContent({ lead, onOpen, dragging, cardProps }) {
  const theme = useTheme();
  const followStatus = getFollowUpStatus(lead.nextFollowUpAt);
  const followColor =
    followStatus === 'overdue'
      ? theme.palette.error
      : followStatus === 'today'
        ? theme.palette.warning
        : theme.palette.info;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const telefone = lead.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(
        `https://wa.me/55${telefone}?text=${encodeURIComponent(
          `Olá ${lead.nome}, vi que você se interessou pela Attualize. Como posso ajudar?`
        )}`,
        '_blank'
      );
    }
  };

  return (
    <Card
      {...cardProps}
      onClick={() => !dragging && onOpen?.(lead._id)}
      sx={{
        p: 2,
        cursor: 'grab',
        boxShadow: theme.customShadows?.z1,
        '&:hover': { boxShadow: theme.customShadows?.z8 },
        '&:active': { cursor: 'grabbing' },
        ...cardProps?.sx,
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
            {lead.nome || 'Sem nome'}
          </Typography>
          <Tooltip title="WhatsApp" arrow>
            <IconButton
              size="small"
              onClick={handleWhatsApp}
              onMouseDown={(e) => e.stopPropagation()}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <Iconify icon="logos:whatsapp-icon" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        {lead.email && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {lead.email}
          </Typography>
        )}

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {lead.segment && (
            <Chip
              label={lead.segment}
              size="small"
              variant="soft"
              sx={{ textTransform: 'capitalize', height: 22 }}
            />
          )}
          {lead.origem && (
            <Tooltip title={lead.origem} arrow>
              <Chip
                label={lead.origem}
                size="small"
                variant="soft"
                color="default"
                sx={{
                  height: 22,
                  maxWidth: 160,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </Tooltip>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 0.5, color: 'text.disabled' }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify icon="solar:user-bold" width={14} />
            <Typography variant="caption">{lead.owner || 'Sem responsável'}</Typography>
          </Stack>

          {lead.nextFollowUpAt && (
            <Tooltip
              title={
                followStatus === 'overdue'
                  ? 'Follow-up atrasado'
                  : followStatus === 'today'
                    ? 'Follow-up hoje'
                    : 'Próximo follow-up'
              }
              arrow
            >
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.75,
                  bgcolor: alpha(followColor.main, 0.16),
                  color: followColor.dark,
                  fontWeight: followStatus === 'overdue' ? 700 : 500,
                }}
              >
                <Iconify
                  icon={followStatus === 'overdue' ? 'solar:danger-triangle-bold' : 'solar:calendar-bold'}
                  width={14}
                />
                <Typography variant="caption" sx={{ fontWeight: 'inherit' }}>
                  {fDate(parseLeadDate(lead.nextFollowUpAt))}
                </Typography>
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

// Versão estática usada dentro do DragOverlay (não registra sortable).
export function LeadKanbanCardOverlay({ lead }) {
  return <LeadCardContent lead={lead} dragging sx={{ cursor: 'grabbing' }} />;
}

// ----------------------------------------------------------------------

export function LeadKanbanCard({ lead, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead._id,
    data: { type: 'lead', lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <LeadCardContent
      lead={lead}
      onOpen={onOpen}
      dragging={isDragging}
      cardProps={{ ref: setNodeRef, style, ...attributes, ...listeners }}
    />
  );
}
