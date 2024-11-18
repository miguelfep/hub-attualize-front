import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function EcommerceCurrentBalance({
  sx,
  title,
  earning,
  refunded,
  orderTotal,
  currentBalance,
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

      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ typography: 'h3' }}>{fCurrency(currentBalance)}</Box>

        {row('Total de vendas', orderTotal)}
     

      </Box>
    </Card>
  );
}
