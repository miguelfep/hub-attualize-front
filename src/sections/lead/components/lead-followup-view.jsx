import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getStatusLabel, getStatusColor } from '../lead-status';
import { parseLeadDate, diasAteFollowUp, getFollowUpStatus } from '../lead-permissions';

// ----------------------------------------------------------------------

const GRUPOS = [
  { key: 'overdue', label: 'Atrasados', icon: 'solar:danger-triangle-bold', color: 'error' },
  { key: 'today', label: 'Hoje', icon: 'solar:calendar-mark-bold', color: 'warning' },
  { key: 'week', label: 'Próximos 7 dias', icon: 'solar:calendar-bold', color: 'info' },
  { key: 'later', label: 'Mais adiante', icon: 'solar:calendar-minimalistic-bold', color: 'default' },
];

export function LeadFollowupView({ leads, onOpen }) {
  const grupos = useMemo(() => {
    const acc = { overdue: [], today: [], week: [], later: [] };
    leads
      .filter((l) => l.nextFollowUpAt)
      .forEach((l) => {
        const status = getFollowUpStatus(l.nextFollowUpAt);
        if (status === 'overdue') acc.overdue.push(l);
        else if (status === 'today') acc.today.push(l);
        else if ((diasAteFollowUp(l.nextFollowUpAt) ?? 99) <= 7) acc.week.push(l);
        else acc.later.push(l);
      });
    // Ordena cada grupo por data crescente.
    Object.values(acc).forEach((arr) =>
      arr.sort((a, b) => parseLeadDate(a.nextFollowUpAt) - parseLeadDate(b.nextFollowUpAt))
    );
    return acc;
  }, [leads]);

  const total = leads.filter((l) => l.nextFollowUpAt).length;

  if (total === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center' }}>
        <Iconify icon="solar:calendar-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6">Nenhum follow-up agendado</Typography>
        <Typography variant="body2" color="text.secondary">
          Defina um próximo follow-up nos leads para acompanhar os retornos por aqui.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {GRUPOS.map((grupo) => {
        const lista = grupos[grupo.key];
        if (!lista.length) return null;
        return (
          <Card key={grupo.key} sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Iconify icon={grupo.icon} width={24} sx={{ color: `${grupo.color}.main` }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {grupo.label}
              </Typography>
              <Label color={grupo.color} variant="soft">
                {lista.length}
              </Label>
            </Stack>

            <Stack spacing={1.5}>
              {lista.map((lead) => (
                <FollowupRow key={lead._id} lead={lead} onOpen={onOpen} />
              ))}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function FollowupRow({ lead, onOpen }) {
  const theme = useTheme();
  const status = getFollowUpStatus(lead.nextFollowUpAt);
  const dias = diasAteFollowUp(lead.nextFollowUpAt);

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const telefone = lead.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(
        `https://wa.me/55${telefone}?text=${encodeURIComponent(
          `Olá ${lead.nome}, tudo bem? Estou retomando nosso contato pela Attualize.`
        )}`,
        '_blank'
      );
    }
  };

  const corData = status === 'overdue' ? 'error.main' : status === 'today' ? 'warning.dark' : 'text.secondary';

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      onClick={() => onOpen?.(lead._id)}
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        '&:hover': { bgcolor: 'background.neutral' },
      }}
    >
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {lead.nome || 'Sem nome'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {lead.owner ? `Resp.: ${lead.owner}` : 'Sem responsável'}
          {lead.telefone ? ` • ${lead.telefone}` : ''}
        </Typography>
      </Box>

      <Label color={getStatusColor(lead.statusLead || 'novo')} variant="soft">
        {getStatusLabel(lead.statusLead || 'novo')}
      </Label>

      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 96, color: corData }}>
        <Iconify icon="solar:calendar-bold" width={16} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {fDate(parseLeadDate(lead.nextFollowUpAt))}
          {status === 'overdue' && dias != null ? ` (${Math.abs(dias)}d)` : ''}
        </Typography>
      </Stack>

      <Tooltip title="WhatsApp" arrow>
        <IconButton size="small" onClick={handleWhatsApp}>
          <Iconify icon="logos:whatsapp-icon" width={18} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
