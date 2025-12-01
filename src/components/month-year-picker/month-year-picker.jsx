'use client';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// ----------------------------------------------------------------------

/**
 * Converte período AAAAMM para dayjs
 * @param {string} periodo - Período no formato AAAAMM (ex: "202412")
 * @returns {dayjs.Dayjs|null} Objeto dayjs ou null
 */
export function periodoToDayjs(periodo) {
  if (!periodo || typeof periodo !== 'string' || periodo.length !== 6) return null;
  const ano = parseInt(periodo.substring(0, 4), 10);
  const mes = parseInt(periodo.substring(4, 6), 10) - 1; // dayjs usa mês 0-11
  if (isNaN(ano) || isNaN(mes) || mes < 0 || mes > 11) return null;
  return dayjs().year(ano).month(mes).date(1);
}

/**
 * Converte dayjs para período AAAAMM
 * @param {dayjs.Dayjs} date - Data dayjs
 * @returns {string} Período no formato AAAAMM
 */
export function dayjsToPeriodo(date) {
  if (!date || !dayjs.isDayjs(date)) return '';
  const ano = date.year();
  const mes = String(date.month() + 1).padStart(2, '0'); // dayjs usa mês 0-11
  return `${ano}${mes}`;
}

// ----------------------------------------------------------------------

export function MonthYearPicker({ value, onChange, label, disabled, required, helperText, ...other }) {
  const dayjsValue = value ? periodoToDayjs(value) : null;

  const handleChange = (newValue) => {
    if (onChange) {
      const periodo = dayjsToPeriodo(newValue);
      onChange(periodo);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <DatePicker
        views={['month', 'year']}
        label={label || 'Período (Mês/Ano)'}
        value={dayjsValue}
        onChange={handleChange}
        disabled={disabled}
        format="MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            required,
            helperText,
            ...other.slotProps?.textField,
          },
          ...other.slotProps,
        }}
        {...other}
      />
    </LocalizationProvider>
  );
}

