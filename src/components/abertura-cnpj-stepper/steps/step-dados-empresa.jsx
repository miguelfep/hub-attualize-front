'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StepDadosEmpresa({ formData, updateFormData }) {
  const theme = useTheme();

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleFaturamentoChange = (e) => {
    // Remove tudo exceto números
    const value = e.target.value.replace(/\D/g, '');
    
    if (value === '') {
      updateFormData('faturamentoMensal', '');
      return;
    }
    
    // Converte para número (divide por 100 para considerar centavos)
    const numericValue = parseInt(value, 10) / 100;
    updateFormData('faturamentoMensal', numericValue);
  };

  const formatFaturamentoDisplay = (value) => {
    if (!value && value !== 0) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Box>
      {/* Progresso visual */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: alpha('#0096D9', 0.08),
          border: `1px solid ${alpha('#0096D9', 0.2)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Iconify icon="solar:graph-up-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Ótimo! Agora vamos configurar sua empresa
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Essas informações nos ajudam a calcular o melhor plano para você.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Informações da Empresa
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Nome da Empresa (Razão Social)"
          value={formData.nomeEmpresa}
          onChange={(e) => updateFormData('nomeEmpresa', e.target.value)}
          placeholder="Ex: Maria Silva Serviços de Psicologia"
          required
          helperText="Este será o nome oficial da sua empresa"
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:buildings-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />

        <TextField
          fullWidth
          label="Faturamento Mensal Estimado"
          value={formData.faturamentoMensal ? formatFaturamentoDisplay(formData.faturamentoMensal) : ''}
          onChange={handleFaturamentoChange}
          placeholder="0,00"
          required
          helperText={
            formData.faturamentoMensal
              ? `Você estima faturar ${formatCurrency(formData.faturamentoMensal)} por mês`
              : 'Quanto você espera faturar por mês?'
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:dollar-bold-duotone" width={24} sx={{ color: 'text.disabled' }} />
                R$
              </InputAdornment>
            ),
          }}
        />

        {/* Forma de Atuação */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Como você pretende atuar?
          </Typography>
          
          <Stack spacing={2}>
            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                border: `2px solid ${formData.formaAtuacao === 'online' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
                bgcolor: formData.formaAtuacao === 'online' ? alpha('#0096D9', 0.08) : 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#0096D9',
                },
              }}
              onClick={() => updateFormData('formaAtuacao', 'online')}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:laptop-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
                <Box flex={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Atendimento Online
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Consultas por videochamada, telefone ou chat
                  </Typography>
                </Box>
                {formData.formaAtuacao === 'online' && (
                  <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: '#0096D9' }} />
                )}
              </Stack>
            </Card>

            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                border: `2px solid ${formData.formaAtuacao === 'presencial' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
                bgcolor: formData.formaAtuacao === 'presencial' ? alpha('#0096D9', 0.08) : 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#0096D9',
                },
              }}
              onClick={() => updateFormData('formaAtuacao', 'presencial')}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:home-2-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
                <Box flex={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Atendimento Presencial
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Consultório físico para atendimento presencial
                  </Typography>
                </Box>
                {formData.formaAtuacao === 'presencial' && (
                  <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: '#0096D9' }} />
                )}
              </Stack>
            </Card>

            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                border: `2px solid ${formData.formaAtuacao === 'ambos' ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
                bgcolor: formData.formaAtuacao === 'ambos' ? alpha('#0096D9', 0.08) : 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#0096D9',
                },
              }}
              onClick={() => updateFormData('formaAtuacao', 'ambos')}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:widget-5-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
                <Box flex={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Ambos (Online e Presencial)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Atendo tanto online quanto no consultório
                  </Typography>
                </Box>
                {formData.formaAtuacao === 'ambos' && (
                  <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: '#0096D9' }} />
                )}
              </Stack>
            </Card>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Número de Sócios
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} sx={{ color: '#0096D9' }} />
            <Slider
              value={formData.numeroSocios}
              onChange={(e, value) => updateFormData('numeroSocios', value)}
              min={1}
              max={5}
              marks
              valueLabelDisplay="on"
              sx={{
                flex: 1,
                '& .MuiSlider-valueLabel': {
                  bgcolor: '#0096D9',
                },
              }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
            {formData.numeroSocios === 1 ? 'Apenas você (sem custo adicional)' : `${formData.numeroSocios} sócios (sem custo adicional)`}
          </Typography>
        </Box>

        {/* Elemento de prova social */}
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.08),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:shield-check-bold-duotone" width={24} sx={{ color: 'success.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                Por que esses dados são importantes?
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              ✓ <strong>Faturamento</strong>: Define seu regime tributário e impostos
              <br />
              ✓ <strong>Sócios</strong>: Importante para o contrato social e pró-labore
              <br />
              ✓ <strong>100% Seguro</strong>: Seus dados são criptografados e confidenciais
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

