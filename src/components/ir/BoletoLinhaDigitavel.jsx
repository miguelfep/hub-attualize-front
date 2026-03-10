import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Campo com linha digitável do boleto e botão para copiar
 * @param {{ code: string }} props
 */
export default function BoletoLinhaDigitavel({ code }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
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
        Código de Barras (Linha Digitável)
      </Typography>

      <TextField
        value={code}
        fullWidth
        InputProps={{ readOnly: true }}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: 13,
            fontFamily: 'monospace',
            letterSpacing: 1,
          },
        }}
      />

      <Button
        variant={copiado ? 'contained' : 'outlined'}
        color={copiado ? 'success' : 'primary'}
        startIcon={
          <Iconify icon={copiado ? 'eva:checkmark-circle-2-outline' : 'eva:copy-outline'} />
        }
        onClick={handleCopy}
      >
        {copiado ? 'Copiado!' : 'Copiar código de barras'}
      </Button>
    </Stack>
  );
}
