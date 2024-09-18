import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Step from '@mui/material/Step';
import Button from '@mui/material/Button';
import MuiStepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { ComponentCardAbertura } from 'src/components/abertura/componente-card-abertura';

// ----------------------------------------------------------------------

const businessSegments = [
  {
    id: 'saude',
    name: 'Saúde',
    icon: '/assets/icons/home/icone-especialidade-6.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'beleza',
    name: 'Beleza',
    icon: '/assets/icons/home/icone-especialidade-5.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'profissional',
    name: 'Profissional',
    icon: '/assets/icons/home/icone-especialidade-8.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'estetica',
    name: 'Estética',
    icon: '/assets/icons/home/icones-especialidades-estetica.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'psicologo',
    name: 'Psicologo',
    icon: '/assets/icons/home/icone-especialidade-9.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'bemestar',
    name: 'Bem-estar',
    icon: '/assets/icons/home/icone-especialidade-7.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'prestadorServico',
    name: 'Serviço',
    icon: '/assets/icons/home/icone-especialidade-10.png', // Atualize com o caminho do ícone correto
  },
  {
    id: 'outros',
    name: 'Outros',
    icon: '/assets/icons/home/icone-especialidade-negocios.png', // Atualize com o caminho do ícone correto
  },
];

export function Stepper({ steps, activeStep }) {
  return (
    <MuiStepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
      {steps.map((label, index) => (
        <Step key={label}>
          <StepLabel
            StepIconComponent={({ active, completed }) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  color: 'text.disabled',
                  typography: 'subtitle2',
                  bgcolor: 'action.disabledBackground',
                  ...(active && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                  ...(completed && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
                }}
              >
                {completed ? (
                  <Iconify width={14} icon="mingcute:check-fill" />
                ) : (
                  <Box sx={{ typography: 'subtitle2' }}>{index + 1}</Box>
                )}
              </Box>
            )}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}

// ----------------------------------------------------------------------

export function StepOne() {
  return (
    <Box mb={4}>
      <Typography variant="h3" align="center" gutterBottom>
        Dados Iniciais
      </Typography>
      <Grid container spacing={2}>
        {/* Campo Nome ocupando metade da largura em telas grandes */}
        <Grid item xs={12} md={12}>
          <Field.Text
            name="stepOne.nome"
            label="Nome"
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Campo Email ocupando metade da largura em telas grandes */}
        <Grid item xs={12} md={6}>
          <Field.Text
            name="stepOne.email"
            label="Email"
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Campo Telefone ocupando um terço da largura em telas grandes */}
        <Grid item xs={12} md={6}>
          <Field.Phone
            name="stepOne.telefone"
            label="Telefone"
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export function StepTwo() {
  const { control, setValue } = useFormContext();

  return (
    <Box mb={4}>
      <Typography variant="h3" align="center" gutterBottom>
        Selecione o Segmento
      </Typography>
      <Controller
        name="stepTwo.segment"
        control={control}
        render={({ field: { value, onChange } }) => (
          <Grid container spacing={2}>
            {businessSegments.map((segment) => (
              <Grid item xs={12} sm={6} md={3} key={segment.id}>
                <ComponentCardAbertura
                  item={segment}
                  selected={value === segment.id}
                  onClick={() => {
                    setValue('stepTwo.segment', segment.id, { shouldValidate: true });
                    onChange(segment.id);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      />
    </Box>
  );
}

export function StepCompleted({ onReset }) {
  return (
    <Box
      gap={3}
      display="flex"
      flex="1 1 auto"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      sx={{ borderRadius: 'inherit', bgcolor: 'background.neutral' }}
    >
      <Typography variant="subtitle1">
        Orçamento esta sendo gerado - iremos enviar o mais rápido possivel!
      </Typography>

      <Button
        variant="outlined"
        onClick={onReset}
        startIcon={<Iconify icon="solar:restart-bold" />}
      >
        Voltar
      </Button>
    </Box>
  );
}
