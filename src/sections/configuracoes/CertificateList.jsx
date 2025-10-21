import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

function CertificateListItem({ certificado, onDownload }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Iconify icon="solar:sertificate-line-duotone" width={28} sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{certificado.subject}</Typography>
        <Typography variant="caption" color="text.secondary">Validade: {formatDate(certificado.validFrom)} até {formatDate(certificado.validTo)}</Typography>
      </Stack>
      <Tooltip title="Baixar Arquivo .pfx" arrow>
        <IconButton onClick={() => onDownload(certificado._id, certificado.fileName)}>
          <Iconify icon="solar:download-minimalistic-line-duotone" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}

export function CertificateList({ certificados, onDownload }) {
  if (!certificados || certificados.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Certificados Inativos
      </Typography>
      <Stack spacing={2}>
        {certificados.map((cert, index) => (
          <m.div key={cert._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <CertificateListItem certificado={cert} onDownload={onDownload} />
          </m.div>
        ))}
      </Stack>
    </Box>
  );
}
