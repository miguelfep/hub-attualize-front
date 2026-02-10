'use client';

import { toast } from 'sonner';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function IndicacaoShareCard() {
  const { 
    codigo, 
    link, 
    loadingCodigo, 
    buscarCodigo, 
    copiarCodigo, 
    copiarLink,
    compartilharWhatsApp,
    compartilharEmail,
  } = useIndicacoes();

  useEffect(() => {
    buscarCodigo();
  }, [buscarCodigo]);

  if (loadingCodigo) {
    return (
      <Card sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ flex: 1 }} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Compartilhe seu código de indicação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Indique amigos e ganhe recompensas quando eles se tornarem clientes
          </Typography>
        </Box>

        <TextField
          label="Seu código"
          value={codigo || ''}
          fullWidth
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={copiarCodigo} edge="end">
                  <Iconify icon="solar:copy-bold" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Link de indicação"
          value={link || ''}
          fullWidth
          disabled
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={copiarLink} edge="end">
                  <Iconify icon="solar:copy-bold" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="logos:whatsapp-icon" />}
            onClick={compartilharWhatsApp}
            fullWidth
          >
            WhatsApp
          </Button>
          
          <Button
            variant="outlined"
            color="info"
            startIcon={<Iconify icon="solar:letter-bold" />}
            onClick={compartilharEmail}
            fullWidth
          >
            Email
          </Button>
        </Stack>

        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: 'primary.lighter',
          }}
        >
          <Typography variant="caption" color="primary.darker">
            💰 <strong>Como funciona:</strong> Você ganha recompensas quando sua indicação se tornar cliente e fizer o primeiro pagamento.
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
