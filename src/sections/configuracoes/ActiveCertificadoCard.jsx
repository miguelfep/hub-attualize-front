import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

export function ActiveCertificateCard({ certificado, onDesativar, onDownload }) {
  const theme = useTheme();

  return (
    <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.light, 0.08)})`,
          borderColor: 'success.main',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="solar:sertificate-bold-duotone" width={40} sx={{ color: 'success.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Certificado Ativo</Typography>
              <Typography variant="body2" color="text.secondary">Este é o certificado usado para emissão de notas.</Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2"><strong>Emitido para:</strong> {certificado.subject}</Typography>
            <Typography variant="body2"><strong>Emissor:</strong> {certificado.issuer}</Typography>
            <Typography variant="body2"><strong>Validade:</strong> {formatDate(certificado.validFrom)} até {formatDate(certificado.validTo)}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Baixar Arquivo .pfx" arrow>
              <IconButton onClick={() => onDownload(certificado._id, certificado.fileName)}>
                <Iconify icon="solar:download-minimalistic-bold" />
              </IconButton>
            </Tooltip>
            <Button
              color="error"
              variant="soft"
              startIcon={<Iconify icon="solar:power-bold" />}
              onClick={() => onDesativar(certificado._id)}
            >
              Desativar
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </m.div>
  );
}
