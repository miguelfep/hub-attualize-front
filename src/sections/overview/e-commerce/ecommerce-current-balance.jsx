import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { fCurrency } from 'src/utils/format-number';

import { AnimateCountUp, formatToCurrency } from 'src/components/animate';

// ----------------------------------------------------------------------

export function EcommerceCurrentBalance({
  sx,
  title,
  earning,
  refunded,
  orderTotal,
  currentBalance,
  texto,
  ...other
}) {
  const row = (label, value) => (
    <Box sx={{ display: 'flex', typography: 'body2', justifyContent: 'space-between' }}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      <Box component="span">{fCurrency(value)}</Box>
    </Box>
  );

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
        <AnimateCountUp
          to={currentBalance}
          component={Box}
          formatter={formatToCurrency}
          sx={{ typography: 'h3', mb: 0.5 }}
        />
        {row(texto, orderTotal)}
    </Card>
  );
}
