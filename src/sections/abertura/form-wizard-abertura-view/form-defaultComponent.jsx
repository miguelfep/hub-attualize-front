import { z } from 'zod';
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import {
  Box,
  Step,
  Stack,
  Radio,
  Dialog,
  AppBar,
  Button,
  Toolbar,
  Stepper,
  StepLabel,
  TextField,
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import EstadoCidadeSelect from 'src/components/abertura/componente-estados-brasil';

const schema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'O e-mail é obrigatório'),
  telefone: z.string().min(1, 'O telefone é obrigatório'),
  detalhes: z.string().optional(),
  receberOrcamento: z.string().min(1, 'Escolha uma opção'),
  observacoes: z.string().optional(),
});

export function FormWizardAbrirEmpresa({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [leadId, setLeadId] = useState(null);

  const steps = ['Informações de Contato', 'Dados para Orçamento', 'Confirmação'];

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      detalhes: '',
      receberOrcamento: '',
      observacoes: '',
    },
    mode: 'onBlur',
  });

  const { handleSubmit, control, trigger, getValues, formState } = methods;
  const { errors } = formState;

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      const formData = getValues();
      console.log('Enviando dados para API:', formData);
      
      if (activeStep === 0) {
        // Simula a criação de um lead e armazena o ID
        setLeadId('12345'); // Substituir por chamada real à API
      }

      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Field.Text name="nome" label="Nome" fullWidth sx={{ width: '80%' }} error={!!errors.nome} helperText={errors.nome?.message} />
            <Field.Text name="email" label="Email" fullWidth sx={{ width: '80%' }} error={!!errors.email} helperText={errors.email?.message} />
            <Field.Phone name="telefone" label="Telefone" fullWidth sx={{ width: '80%' }} error={!!errors.telefone} helperText={errors.telefone?.message} />
          </Stack>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h4" align="center" gutterBottom>
              Informações Gerais
            </Typography>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Como gostaria de receber o orçamento?
              </Typography>
              <Controller
                name="receberOrcamento"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
                    <FormControlLabel value="email" control={<Radio />} label="Email" />
                  </RadioGroup>
                )}
              />
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Onde irá ficar seu negócio?
            </Typography>
            <Box mb={3}>
              <EstadoCidadeSelect />
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Fale um pouco sobre seu negócio!
              </Typography>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="História"
                    variant="filled"
                    fullWidth
                    multiline
                    rows={4}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Box>
          </Box>
        );
      case 2:
        return (
          <Typography variant="h6">Por favor, revise suas informações antes de enviar.</Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ flex: 1, textAlign: 'center' }} variant="h6">Abrir Minha Empresa</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <Iconify icon="solar:close-circle-bold-duotone" width={24} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <FormProvider {...methods}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
          <Box>{renderStepContent(activeStep)}</Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, mx: 6 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ minWidth: '150px' }}>Voltar</Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" color="primary" onClick={handleSubmit((data) => { console.log('Enviando dados finais para API:', data); onClose(); })} sx={{ minWidth: '150px' }}>Enviar</Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleNext} sx={{ minWidth: '150px' }}>Próximo</Button>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
