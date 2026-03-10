import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Campo com código PIX copia e cola e botão para copiar
 * @param {{ code: string }} props
 */
export default function PixCopiaCola({ code }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // fallback para navegadores sem suporte
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary">
        PIX Copia e Cola
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <TextField
          value={code}
          fullWidth
          multiline
          rows={3}
          InputProps={{ readOnly: true }}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: 13,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            },
          }}
        />
      </Box>

      <Button
        variant={copiado ? 'contained' : 'outlined'}
        color={copiado ? 'success' : 'primary'}
        startIcon={
          <Iconify icon={copiado ? 'eva:checkmark-circle-2-outline' : 'eva:copy-outline'} />
        }
        onClick={handleCopy}
      >
        {copiado ? 'Copiado!' : 'Copiar Pix Copia e Cola'}
      </Button>
    </Stack>
  );
}
