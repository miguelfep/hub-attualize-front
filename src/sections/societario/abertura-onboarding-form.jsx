'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { updateAbertura } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

export function AberturaOnboardingForm({ currentAbertura }) {
  const loading = useBoolean();
  const [usuarioGerado, setUsuarioGerado] = useState(
    currentAbertura?.usuarioGerado || false
  );

  const handleRegenerarAcesso = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, {
        somenteAtualizar: false,
        statusAbertura: 'onboarding',
      });
      setUsuarioGerado(true);
      toast.success('Acesso regenerado com sucesso!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao regenerar acesso do usuário';
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      loading.onFalse();
    }
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Onboarding - Geração de Usuário
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Nesta etapa, um usuário será gerado para o cliente acessar o portal.
        </Typography>
        
        {usuarioGerado && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1,
              bgcolor: 'success.lighter',
              color: 'success.darker',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" width={24} />
            <Typography variant="body2">
              Usuário já foi gerado anteriormente
            </Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegenerarAcesso}
          disabled={loading.value}
          startIcon={
            loading.value ? (
              <CircularProgress size={20} />
            ) : (
              <Iconify icon="eva:refresh-fill" />
            )
          }
        >
          Regenerar Acesso
        </Button>
      </Stack>
    </Card>
  );
}

