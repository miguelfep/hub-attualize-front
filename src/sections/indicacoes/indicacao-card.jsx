'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { obterCodigoIndicacao, obterLinkIndicacao } from 'src/actions/indicacoes';

// ----------------------------------------------------------------------

export function IndicacaoCard() {
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [codigoData, linkData] = await Promise.all([
          obterCodigoIndicacao(),
          obterLinkIndicacao(),
        ]);
        setCodigo(codigoData?.codigo || '');
        setLink(linkData?.link || '');
      } catch (error) {
        console.error('Erro ao carregar dados de indicação:', error);
        toast.error('Erro ao carregar código de indicação');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error('Erro ao copiar link');
    }
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      toast.success('Código copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Seu código de indicação
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compartilhe seu código ou link para indicar pessoas e ganhar recompensas
          </Typography>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Código"
            value={loading ? 'Carregando...' : codigo}
            disabled={loading}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={copiarCodigo}
                    startIcon={<Iconify icon="solar:copy-bold" />}
                  >
                    Copiar
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Link de indicação"
            value={loading ? 'Carregando...' : link}
            disabled={loading}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={copiarLink}
                    startIcon={<Iconify icon="solar:copy-bold" />}
                  >
                    Copiar
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
}
