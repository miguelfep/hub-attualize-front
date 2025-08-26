import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Stack, useTheme, IconButton } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export default function DashboardFiltros({ onFilterChange = () => {} }) {
  const [dataInicio, setDataInicio] = useState(dayjs().startOf('month'));
  const [dataFim, setDataFim] = useState(dayjs().endOf('month'));
  const theme = useTheme();

  useEffect(() => {
    if (dataInicio) {
      onFilterChange({
        target: { name: 'dataInicio', value: dataInicio.toISOString() },
      });
    }
    if (dataFim) {
      onFilterChange({
        target: { name: 'dataFim', value: dataFim.toISOString() },
      });
    }
  }, [dataInicio, dataFim, onFilterChange]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box
        sx={{
          my: 4,
          p: 4,
          borderRadius: 7,
          boxShadow: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems="center"
          justifyContent="center"
        >
          <DatePicker
            label="Data de Início"
            value={dataInicio}
            onChange={(newDate) => setDataInicio(newDate)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'medium',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.dark,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.dark,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.palette.primary.dark,
                    },
                  },
                },
                InputProps: {
                  startAdornment: (
                    <IconButton edge="start" size="small" sx={{ mr: 1 }}>
                      <Icon icon="mdi:calendar" />
                    </IconButton>
                  ),
                },
              },
              popper: {
                sx: {
                  '& .MuiPickersDay-root': {
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                },
              },
            }}
            sx={{ minWidth: 200 }}
          />

          <Box
            sx={{
              width: 2,
              height: 40,
              backgroundColor: theme.palette.divider,
              mx: 1,
              display: { xs: 'none', sm: 'block' },
            }}
          />

          <DatePicker
            label="Data de Fim"
            value={dataFim}
            onChange={(newDate) => setDataFim(newDate)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'medium',
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.dark,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.dark,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.palette.primary.dark,
                    },
                  },
                },
                InputProps: {
                  startAdornment: (
                    <IconButton edge="start" size="small" sx={{ mr: 1 }}>
                      <Icon icon="mdi:calendar" />
                    </IconButton>
                  ),
                },
              },
              popper: {
                sx: {
                  '& .MuiPickersDay-root': {
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                },
              },
            }}
            sx={{ minWidth: 200 }}
          />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
