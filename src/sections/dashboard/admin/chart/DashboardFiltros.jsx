import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useState, useEffect } from 'react';

import { Box, Stack, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
          my: 2,
          p: 2.5,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems="center"
          justifyContent={{ xs: 'stretch', sm: 'flex-start' }}
        >
          <DatePicker
            label="Data de Início"
            value={dataInicio}
            onChange={(newDate) => setDataInicio(newDate)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'medium',
                fullWidth: { xs: true, sm: false },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.95rem',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                    padding: '12px 14px',
                  },
                },
              },
              popper: {
                sx: {
                  '& .MuiPickersDay-root': {
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                },
              },
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 180 },
              width: { xs: '100%', sm: 'auto' }
            }}
          />

          <Box
            sx={{
              width: { xs: '100%', sm: 1 },
              height: { xs: 1, sm: 24 },
              backgroundColor: theme.palette.divider,
              mx: { xs: 0, sm: 1 },
              my: { xs: 1, sm: 0 },
              display: 'block',
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
                fullWidth: { xs: true, sm: false },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontSize: '0.95rem',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                    padding: '12px 14px',
                  },
                },
              },
              popper: {
                sx: {
                  '& .MuiPickersDay-root': {
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                },
              },
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 180 },
              width: { xs: '100%', sm: 'auto' }
            }}
          />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
