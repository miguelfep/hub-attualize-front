'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StepDadosPessoais({ formData, updateFormData }) {
  const theme = useTheme();

  const handleCPFChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      updateFormData('cpf', value);
    }
  };

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      updateFormData('telefone', value);
    }
  };

  return (
    <Box>
      {/* Título com viés cognitivo */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: alpha('#FEC615', 0.08),
          border: `1px solid ${alpha('#FEC615', 0.2)}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Iconify icon="solar:star-bold-duotone" width={32} sx={{ color: '#FEC615' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Você está a poucos passos de profissionalizar sua prática!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Mais de <strong>200 psicólogos</strong> já abriram seu CNPJ conosco. Seja o próximo!
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Vamos começar com seus dados pessoais
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Nome Completo"
          value={formData.nome}
          onChange={(e) => updateFormData('nome', e.target.value)}
          placeholder="Ex: Maria Silva"
          required
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:user-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />

        <TextField
          fullWidth
          label="CPF"
          value={formData.cpf}
          onChange={handleCPFChange}
          placeholder="000.000.000-00"
          required
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:card-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />

        <TextField
          fullWidth
          label="E-mail"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="seu@email.com"
          required
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:letter-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />

        <TextField
          fullWidth
          label="Telefone/WhatsApp"
          value={formData.telefone}
          onChange={handleTelefoneChange}
          placeholder="(00) 00000-0000"
          required
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:phone-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />

        <TextField
          fullWidth
          label="Data de Nascimento"
          type="date"
          value={formData.dataNascimento}
          onChange={(e) => updateFormData('dataNascimento', e.target.value)}
          required
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: (
              <Iconify
                icon="solar:calendar-bold-duotone"
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />
      </Stack>

      {/* Elemento de urgência */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: `1px dashed ${theme.palette.info.main}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} sx={{ color: 'info.main' }} />
          <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 600 }}>
            ⏰ Última vaga com <strong>abertura gratuita</strong> hoje! Garanta já a sua.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

