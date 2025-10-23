import { m } from 'framer-motion';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

export function LicencaAlertBanner({ vencidasCount, aExpirarCount, onClose, sx, ...other }) {
  const theme = useTheme();

  const severity = vencidasCount > 0 ? 'error' : 'warning';
  const icon = vencidasCount > 0 ? 'solar:shield-cross-bold-duotone' : 'solar:shield-alert-bold-duotone';
  const title = vencidasCount > 0 ? 'Atenção: Licenças Vencidas!' : 'Alerta: Licenças a Expirar!';

  const vencidasText = vencidasCount > 0 ? `**${vencidasCount} ${vencidasCount > 1 ? 'licenças vencidas' : 'licença vencida'}**` : '';
  const aExpirarText = aExpirarCount > 0 ? `**${aExpirarCount} ${aExpirarCount > 1 ? 'licenças a expirar' : 'licença a expirar'}**` : '';
  const message = `Você possui ${vencidasText}${vencidasCount > 0 && aExpirarCount > 0 ? ' e ' : ''}${aExpirarText}. Verifique abaixo para mais detalhes.`;
  
  return (
    <m.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderLeft: `4px solid ${theme.palette[severity].main}`,
          bgcolor: alpha(theme.palette[severity].main, 0.08),
          ...sx,
        }}
        {...other}
      >
        <Iconify icon={icon} width={40} sx={{ color: `${severity}.main`, flexShrink: 0 }} />

        <Stack sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: `${severity}.darker` }}>
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: `${severity}.dark`, '& strong': { fontWeight: 700 } }}
            dangerouslySetInnerHTML={{ __html: message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </Stack>

        <IconButton onClick={onClose} size="small">
          <Iconify icon="mdi:close" />
        </IconButton>
      </Paper>
    </m.div>
  );
}
