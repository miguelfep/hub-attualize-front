'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StepAtividades({ formData, updateFormData }) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Sobre suas atividades profissionais
      </Typography>

      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Precisamos entender melhor sua atuação para definir os CNAEs corretos.
      </Typography>

      <Stack spacing={4}>
        {/* Atividade Principal */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Atividade Principal
          </Typography>
          <TextField
            fullWidth
            label="Descrição da Atividade"
            value={formData.descricaoAtividade}
            onChange={(e) => updateFormData('descricaoAtividade', e.target.value)}
            placeholder="Ex: Psicologia clínica, Psicoterapia, Avaliação psicológica..."
            multiline
            rows={3}
            helperText="Descreva os principais serviços que você irá oferecer"
            InputProps={{
              startAdornment: (
                <Iconify
                  icon="solar:document-text-bold-duotone"
                  width={24}
                  sx={{ mr: 1, color: 'text.disabled', alignSelf: 'flex-start', mt: 1 }}
                />
              ),
            }}
          />
        </Box>

        {/* Funcionários */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.possuiFuncionarios}
                onChange={(e) => {
                  updateFormData('possuiFuncionarios', e.target.checked);
                  if (!e.target.checked) {
                    updateFormData('numeroFuncionarios', 0);
                  }
                }}
              />
            }
            label={
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Pretende contratar funcionários?
              </Typography>
            }
          />

          {formData.possuiFuncionarios && (
            <Box sx={{ mt: 2, ml: 4 }}>
              <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>
                Quantos funcionários CLT?
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} sx={{ color: '#0096D9' }} />
                <Slider
                  value={formData.numeroFuncionarios}
                  onChange={(e, value) => updateFormData('numeroFuncionarios', value)}
                  min={0}
                  max={10}
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
                {formData.numeroFuncionarios === 0
                  ? 'Nenhum funcionário'
                  : `${formData.numeroFuncionarios} funcionário${formData.numeroFuncionarios > 1 ? 's' : ''}`}
                {formData.numeroFuncionarios > 0 && ` (+R$ ${formData.numeroFuncionarios * 50}/mês)`}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Informação sobre impostos */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha('#0096D9', 0.08),
            border: `1px solid ${alpha('#0096D9', 0.2)}`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="solar:calculator-minimalistic-bold-duotone" width={28} sx={{ color: '#0096D9' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0096D9' }}>
                💰 Você sabia?
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Psicólogos podem pagar apenas <strong>6% de impostos</strong> com o Simples Nacional
              usando o <strong>Fator R</strong>. Nossa equipe faz essa análise para você
              automaticamente!
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

