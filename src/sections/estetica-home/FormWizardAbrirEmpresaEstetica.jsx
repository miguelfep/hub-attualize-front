import { z } from 'zod';
import { toast } from 'sonner';
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Box,
  Step,
  Stack,
  Dialog,
  AppBar,
  Button,
  Toolbar,
  Stepper,
  StepLabel,
  Typography,
  IconButton,
} from '@mui/material';

import { buscarCep } from 'src/actions/cep';
import { criarLead } from 'src/actions/lead';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

const stepOneSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'O e-mail é obrigatório'),
  telefone: z.string().min(1, 'O telefone é obrigatório'),
});

const stepTwoSchema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  estado: z.string().min(2, 'Estado obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  receberOrcamento: z.string().min(1, 'Escolha uma opção'),
  observacoes: z.string().optional(),
});

export function FormWizardAbrirEmpresa({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Informações de Contato', 'Dados para Orçamento'];

  const methods = useForm({
    resolver: zodResolver(activeStep === 0 ? stepOneSchema : stepTwoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cep: '',
      estado: '',
      cidade: '',
      receberOrcamento: '',
      observacoes: '',
      segment: 'estetica',
      origem: 'site-pagina-estetica',
    },
    mode: 'onBlur',
  });

  const { handleSubmit, trigger, getValues, setValue, formState } = methods;
  const { errors } = formState;

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      const endereco = await buscarCep(cep);
      if (endereco) {
        setValue('estado', endereco.estado);
        setValue('cidade', endereco.cidade);
      }
    }
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setActiveStep(1);
    }
  };

  const handleFinish = async () => {
    try {
      const formData = getValues(); // Obtém todos os valores do formulário
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cep: formData.cep,
        estado: formData.estado,
        cidade: formData.cidade,
        receberOrcamento: formData.receberOrcamento,
        observacoes: formData.observacoes,
        segment: 'estetica',
        origem: 'site-pagina-estetica',
      };

      await criarLead(payload);
      methods.reset();
      setActiveStep(0);
      toast.success('Enviado com sucesso! Entraremos em contato em breve.');

      onClose();
    } catch (error) {
      toast.error('Erro ao enviar os dados. Tente novamente.');
      console.error('Erro ao enviar dados:', error);
    }
  };

  const renderStepContent = (step) => (
    <Stack spacing={2} sx={{ alignItems: 'center', width: '80%', mx: 'auto' }}>
      {step === 0 && (
        <>
          <Field.Text
            name="nome"
            label="Nome"
            fullWidth
            error={!!errors.nome}
            helperText={errors.nome?.message}
          />
          <Field.Text
            name="email"
            label="Email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <Field.Phone
            name="telefone"
            label="Telefone"
            fullWidth
            error={!!errors.telefone}
            helperText={errors.telefone?.message}
          />
        </>
      )}
      {step === 1 && (
        <>
          <Typography variant="h4" align="center" gutterBottom>
            Informações Gerais
          </Typography>

          <Field.Text
            name="cep"
            label="CEP"
            fullWidth
            onBlur={handleCepChange}
            error={!!errors.cep}
            helperText={errors.cep?.message}
          />

          <Field.Text
            name="estado"
            label="Estado"
            fullWidth
            error={!!errors.estado}
            helperText={errors.estado?.message}
          />

          <Field.Text
            name="cidade"
            label="Cidade"
            fullWidth
            error={!!errors.cidade}
            helperText={errors.cidade?.message}
          />

          <Typography variant="subtitle1" gutterBottom>
            Como gostaria de receber o orçamento?
          </Typography>
          <Field.RadioGroup
            name="receberOrcamento"
            options={[
              { label: 'WhatsApp', value: 'whatsapp' },
              { label: 'Email', value: 'email' },
            ]}
            row
            error={!!errors.receberOrcamento}
            helperText={errors.receberOrcamento?.message}
          />

          <Field.Text
            name="observacoes"
            label="Observações"
            variant="filled"
            fullWidth
            multiline
            rows={4}
            InputLabelProps={{ shrink: true }}
          />
        </>
      )}
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ flex: 1, textAlign: 'center' }} variant="h6">
            Abrir Minha Empresa
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <Iconify icon="solar:close-circle-bold-duotone" width={24} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <FormProvider {...methods}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box>{renderStepContent(activeStep)}</Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, mx: 6 }}>
            {activeStep === 0 ? (
              <>
                <Box sx={{ width: '150px' }} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{ minWidth: '150px' }}
                >
                  Próximo
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setActiveStep(0)} sx={{ minWidth: '150px' }}>
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(handleFinish)}
                  sx={{ minWidth: '150px' }}
                >
                  Finalizar
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
