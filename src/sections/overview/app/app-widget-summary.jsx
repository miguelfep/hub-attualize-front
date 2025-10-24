import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { AnimateCountUp, formatToInteger, formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

export function AppWidgetSummary({ title, percent, total, chart, sx, isCurrency = false, requirePassword = false, password = '', maskInitially = true, ...other }) {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(!maskInitially);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  const chartColors = chart.colors ?? [theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value) => fNumber(value), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
    ...chart.options,
  });

  const renderPeriodInfo = (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Iconify
        width={20}
        icon="solar:calendar-bold-duotone"
        sx={{ flexShrink: 0, color: 'primary.main' }}
      />
      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
        Período selecionado
      </Box>
    </Box>
  );

  const handleToggleVisibility = () => {
    if (requirePassword && !showValue) {
      setPwdOpen(true);
    } else {
      setShowValue((v) => !v);
    }
  };

  const handleConfirmPassword = () => {
    if (!requirePassword || !password || pwdInput === password) {
      setShowValue(true);
      setPwdOpen(false);
      setPwdInput('');
      setPwdError('');
    } else {
      setPwdError('Senha incorreta');
    }
  };

  const handleCloseDialog = () => {
    setPwdOpen(false);
    setPwdInput('');
    setPwdError('');
  };

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ typography: 'subtitle2' }}>{title}</Box>
          <Tooltip title={showValue ? 'Ocultar valor' : 'Mostrar valor'}>
            <IconButton size="small" onClick={handleToggleVisibility}>
              <Iconify icon={showValue ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
            </IconButton>
          </Tooltip>
        </Box>
        {showValue ? (
          <AnimateCountUp
            to={total}
            component={Box}
            formatter={isCurrency ? formatToCurrency : formatToInteger}
            sx={{ mt: 1.5, typography: 'h3' }}
          />
        ) : (
          <Box sx={{ mt: 1.5, typography: 'h3', fontFamily: 'monospace' }}>••••</Box>
        )}
        <Box sx={{ mt: 1 }}>
          {renderPeriodInfo}
        </Box>
      </Box>

      <Chart
        type="bar"
        series={[{ data: chart.series }]}
        options={chartOptions}
        width={60}
        height={40}
      />
      <Dialog open={pwdOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Digite a senha para visualizar</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={pwdInput}
            onChange={(e) => setPwdInput(e.target.value)}
            error={Boolean(pwdError)}
            helperText={pwdError}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmPassword}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
