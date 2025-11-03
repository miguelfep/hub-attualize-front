'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { buscarCep } from 'src/actions/cep';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StepEndereco({ formData, updateFormData }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleCEPChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    updateFormData('cep', cep);

    if (cep.length === 8) {
      setLoading(true);
      try {
        const result = await buscarCep(cep);
        
        if (result.erro) {
          toast.error('CEP não encontrado');
        } else {
          updateFormData('endereco', result.logradouro || '');
          updateFormData('bairro', result.bairro || '');
          updateFormData('cidade', result.localidade || '');
          updateFormData('estado', result.uf || '');
          
          // Avisar se o CEP for fora do PR
          if (result.uf && result.uf !== 'PR') {
            toast.warning(`⚠️ CEP fora do Paraná! Você perderá a abertura GRATUITA. Considere usar nosso Endereço Fiscal.`, {
              duration: 6000,
            });
          }
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      }
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Onde sua empresa irá funcionar?
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
        Para psicólogos, geralmente é o endereço do consultório ou residencial.
      </Typography>

      <Stack spacing={3}>
        {/* Opção de Endereço Fiscal - APENAS para atendimento ONLINE */}
        {formData.formaAtuacao === 'online' ? (
          <Card
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `2px solid ${formData.usarEnderecoFiscal ? '#0096D9' : alpha(theme.palette.grey[500], 0.12)}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#0096D9',
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => updateFormData('usarEnderecoFiscal', !formData.usarEnderecoFiscal)}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.usarEnderecoFiscal}
                  onChange={(e) => updateFormData('usarEnderecoFiscal', e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Iconify icon="solar:buildings-2-bold-duotone" width={24} sx={{ color: '#0096D9' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Usar Endereço Fiscal da Attualize
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: '#FEC615',
                        color: '#333',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontWeight: 700,
                      }}
                    >
                      +R$ 50/mês
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Não tem consultório próprio? Use nosso endereço comercial em Curitiba para sua
                    empresa. Ideal para atendimentos 100% online.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    ✓ Endereço comercial profissional • ✓ Recebimento de correspondências • ✓
                    Legalizado • ✓ Abertura GRATUITA
                  </Typography>
                </Box>
              }
            />
          </Card>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Iconify icon="solar:info-circle-bold" width={24} sx={{ color: 'text.disabled', mt: 0.25 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                  Endereço Fiscal não disponível
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Como você atende de forma presencial, é necessário informar o endereço físico do seu consultório.
                  O endereço fiscal da Attualize está disponível apenas para atendimentos 100% online.
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Ou informe seu endereço */}
        {!formData.usarEnderecoFiscal && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'info.dark', mb: 0.5 }}>
              📍 Informe seu endereço abaixo
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Será o endereço oficial da sua empresa
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Formulário de endereço - só aparece se NÃO usar endereço fiscal */}
      {!formData.usarEnderecoFiscal && (
        <Stack spacing={3} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="CEP"
          value={formData.cep}
          onChange={handleCEPChange}
          placeholder="00000-000"
          required
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:map-point-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
            endAdornment: loading && <CircularProgress size={20} />,
          }}
          helperText="Digite o CEP para preenchermos automaticamente"
        />

        <Grid container spacing={2}>
          <Grid xs={12} sm={8}>
            <TextField
              fullWidth
              label="Endereço"
              value={formData.endereco}
              onChange={(e) => updateFormData('endereco', e.target.value)}
              placeholder="Rua, Avenida..."
              required
            />
          </Grid>

          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Número"
              value={formData.numero}
              onChange={(e) => updateFormData('numero', e.target.value)}
              placeholder="123"
              required
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Complemento"
          value={formData.complemento}
          onChange={(e) => updateFormData('complemento', e.target.value)}
          placeholder="Sala, Apartamento... (Opcional)"
        />

        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bairro"
              value={formData.bairro}
              onChange={(e) => updateFormData('bairro', e.target.value)}
              placeholder="Centro"
              required
            />
          </Grid>

          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => updateFormData('cidade', e.target.value)}
              placeholder="São Paulo"
              required
            />
          </Grid>

          <Grid xs={12} sm={2}>
            <TextField
              fullWidth
              label="UF"
              value={formData.estado}
              onChange={(e) => updateFormData('estado', e.target.value.toUpperCase())}
              placeholder="SP"
              required
              inputProps={{ maxLength: 2 }}
            />
          </Grid>
        </Grid>

        {/* Aviso: Perda de abertura gratuita se for fora de PR */}
        {formData.estado && formData.estado !== 'PR' && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: alpha('#FF6B35', 0.12),
              border: `3px solid #FF6B35`,
              mb: 2,
              position: 'relative',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: `0 0 0 0 ${alpha('#FF6B35', 0.4)}`,
                },
                '50%': {
                  boxShadow: `0 0 0 8px ${alpha('#FF6B35', 0)}`,
                },
              },
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                <Iconify icon="solar:danger-triangle-bold" width={32} sx={{ color: '#FF6B35' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FF6B35', textAlign: 'center' }}>
                  ⚠️ ATENÇÃO: Você perderá a Abertura GRATUITA!
                </Typography>
              </Stack>
              
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha('#000', 0.03),
                  border: `1px dashed ${alpha('#FF6B35', 0.3)}`,
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, fontWeight: 600 }}>
                  A abertura de CNPJ gratuita é <strong style={{ color: '#FF6B35' }}>exclusiva para o Paraná (PR)</strong>. 
                  <br />
                  Com endereço em <strong>{formData.estado}</strong>, você terá <strong style={{ color: '#FF6B35' }}>custo adicional de ~R$ 800</strong> na abertura.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha('#28a745', 0.12),
                  border: `2px solid #28a745`,
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:lightbulb-bold" width={24} sx={{ color: '#28a745' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#28a745' }}>
                      💡 SOLUÇÃO: Mantenha o benefício GRÁTIS!
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    ✅ Use o <strong>Endereço Fiscal da Attualize</strong> (localizado em PR) marcando a opção acima
                    <br />
                    ✅ Mantenha a <strong>abertura 100% GRATUITA</strong>
                    <br />
                    ✅ Você ainda pode atender em qualquer lugar do Brasil
                    <br />
                    ✅ Apenas <strong>+R$ 50/mês</strong> no plano
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Dica útil */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: alpha('#FEC615', 0.08),
            border: `1px dashed #FEC615`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Iconify icon="solar:lightbulb-bold-duotone" width={24} sx={{ color: '#FEC615', mt: 0.25 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              <strong>💡 Dica:</strong> Você pode usar seu endereço residencial para consultório
              domiciliar. É 100% permitido para psicólogos!
            </Typography>
          </Stack>
        </Box>
      </Stack>
      )}
    </Box>
  );
}

