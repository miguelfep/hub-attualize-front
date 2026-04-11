'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// ----------------------------------------------------------------------

/** @param {string} str */
export function parseDiasIsoFromString(str) {
  if (!str || !String(str).trim()) return [];
  const parts = String(str)
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(parts.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
}

function MultiDay(props) {
  const { day, outsideCurrentMonth, formDisabled, isInCompetencia, selectedSet, onToggle, ...other } = props;

  const iso = day.format('YYYY-MM-DD');
  const selected = selectedSet.has(iso);
  const inMonth = isInCompetencia(day);
  const canPick = !formDisabled && !outsideCurrentMonth && inMonth;

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected}
      disabled={formDisabled || outsideCurrentMonth || !inMonth}
      onClick={(e) => {
        if (!canPick) return;
        e.preventDefault();
        e.stopPropagation();
        onToggle(iso);
      }}
      sx={{
        ...(selected && {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 700,
          '&:hover, &.Mui-selected': { bgcolor: 'primary.dark' },
        }),
      }}
    />
  );
}

/**
 * Seleção de várias datas de falta dentro da competência (mês/ano).
 * @param {object} props
 * @param {string} props.value — datas ISO separadas por quebra de linha (mesmo formato interno do form)
 * @param {(next: string) => void} props.onChange
 * @param {number} props.ano
 * @param {number} props.mes — 1–12
 * @param {boolean} [props.disabled]
 */
export function PortalDpFaltasCalendarField({ value, onChange, ano, mes, disabled = false }) {
  const theme = useTheme();
  const reference = useMemo(() => dayjs(`${ano}-${String(mes).padStart(2, '0')}-01`), [ano, mes]);

  const selectedSet = useMemo(() => new Set(parseDiasIsoFromString(value)), [value]);

  const isInCompetencia = useCallback(
    (d) => d.year() === ano && d.month() + 1 === mes,
    [ano, mes]
  );

  const onToggle = useCallback(
    (iso) => {
      const next = new Set(selectedSet);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      const arr = [...next].sort();
      onChange(arr.join('\n'));
    },
    [selectedSet, onChange]
  );

  const removeOne = useCallback(
    (iso) => {
      const next = [...selectedSet].filter((d) => d !== iso).sort();
      onChange(next.join('\n'));
    },
    [selectedSet, onChange]
  );

  const sortedList = useMemo(() => [...selectedSet].sort(), [selectedSet]);

  const DaySlot = useCallback(
    (dayProps) => (
      <MultiDay
        {...dayProps}
        formDisabled={disabled}
        isInCompetencia={isInCompetencia}
        selectedSet={selectedSet}
        onToggle={onToggle}
      />
    ),
    [disabled, isInCompetencia, selectedSet, onToggle]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[500], 0.04),
        borderStyle: 'dashed',
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Dias sem trabalho
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, lineHeight: 1.6 }}>
            Toque no calendário para marcar ou desmarcar. Só vale para{' '}
            <strong>{reference.format('MMMM [de] YYYY')}</strong>.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', maxWidth: '100%' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DateCalendar
              referenceDate={reference}
              value={null}
              onChange={() => {}}
              views={['day']}
              slots={{ day: DaySlot }}
              sx={{
                maxWidth: '100%',
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                '& .MuiPickersCalendarHeader-root': {
                  marginBottom: 0.5,
                  px: 0.5,
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {sortedList.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Selecionadas ({sortedList.length})
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
              {sortedList.map((iso) => (
                <Chip
                  key={iso}
                  size="small"
                  label={dayjs(iso).format('DD/MM')}
                  onDelete={disabled ? undefined : () => removeOne(iso)}
                  color="primary"
                  variant="soft"
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
