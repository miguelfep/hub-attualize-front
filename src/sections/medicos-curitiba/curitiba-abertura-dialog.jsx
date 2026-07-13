'use client';

import { z } from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Step,
  Stack,
  Dialog,
  Button,
  Stepper,
  StepLabel,
  IconButton,
  Typography,
} from '@mui/material';

import { buscarCep } from 'src/actions/cep';
import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

import { CORES } from './dados';

// ----------------------------------------------------------------------

const stepOneSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'O e-mail é obrigatório'),
  telefone: z.string().min(10, 'Informe seu WhatsApp com DDD'),
});

const stepTwoSchema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  estado: z.string().min(2, 'Estado obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  situacao: z.string().min(1, 'Escolha uma opção'),
  observacoes: z.string().optional(),
});

const DEFAULT_VALUES = {
  nome: '',
  email: '',
  telefone: '',
  cep: '',
  estado: 'PR',
  cidade: 'Curitiba',
  situacao: '',
  observacoes: '',
};

const STEPS = ['Seus contatos', 'Sobre sua empresa'];

// ----------------------------------------------------------------------

/** Modal de captação "quero abrir minha empresa" da landing de Médicos em Curitiba. */
export function CuritibaAberturaDialog({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const methods = useForm({
    resolver: zodResolver(activeStep === 0 ? stepOneSchema : stepTwoSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const { trigger, getValues, setValue, reset } = methods;

  const handleCepChange = async (event) => {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      const endereco = await buscarCep(cep);
      if (endereco) {
        setValue('estado', endereco.estado);
        setValue('cidade', endereco.cidade);
      }
    }
  };

  const handleNext = async () => {
    const valido = await trigger();
    if (valido) setActiveStep(1);
  };

  const handleFinish = async () => {
    const valido = await trigger();
    if (!valido) return;
    try {
      setEnviando(true);
      const dados = getValues();
      await criarLead({
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cep: dados.cep,
        estado: dados.estado,
        cidade: dados.cidade,
        segment: 'medicina',
        origem: 'site-medicos-curitiba',
        observacoes: `Situação: ${dados.situacao}${dados.observacoes ? ` · ${dados.observacoes}` : ''} (modal abrir empresa — landing Médicos Curitiba)`,
      });
      toast.success('Recebemos seus dados! Vamos falar com você em breve.');
      reset(DEFAULT_VALUES);
      setActiveStep(0);
      onClose();
    } catch (error) {
      toast.error('Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    if (!enviando) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, py: 2, bgcolor: CORES.tinta }}
      >
        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
          Abrir minha empresa em Curitiba
        </Typography>
        <IconButton onClick={handleClose} aria-label="Fechar" sx={{ color: '#FFFFFF' }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <FormProvider {...methods}>
        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Stack spacing={2}>
            {activeStep === 0 && (
              <>
                <Field.Text name="nome" label="Nome" fullWidth />
                <Field.Text name="email" label="E-mail" fullWidth />
                <Field.Phone name="telefone" label="WhatsApp" fullWidth />
              </>
            )}

            {activeStep === 1 && (
              <>
                <Field.Text name="cep" label="CEP" fullWidth onBlur={handleCepChange} />
                <Stack direction="row" spacing={2}>
                  <Field.Text name="cidade" label="Cidade" fullWidth />
                  <Field.Text name="estado" label="Estado" fullWidth />
                </Stack>
                <Field.RadioGroup
                  name="situacao"
                  label="Qual é a sua situação hoje?"
                  options={[
                    { label: 'Quero abrir meu primeiro CNPJ', value: 'abrir-cnpj' },
                    { label: 'Já tenho CNPJ e quero trocar de contador', value: 'trocar-contador' },
                    { label: 'Recebo no carnê-leão e quero avaliar a PJ', value: 'carne-leao' },
                  ]}
                />
                <Field.Text
                  name="observacoes"
                  label="Algo que devemos saber? (opcional)"
                  fullWidth
                  multiline
                  rows={3}
                />
              </>
            )}
          </Stack>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
            {activeStep === 0 ? (
              <>
                <Box />
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    minWidth: 150,
                    bgcolor: CORES.azul,
                    '&:hover': { bgcolor: CORES.azulEscuro },
                  }}
                >
                  Próximo
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setActiveStep(0)} disabled={enviando} sx={{ minWidth: 120 }}>
                  Voltar
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={enviando}
                  onClick={handleFinish}
                  sx={{
                    minWidth: 190,
                    bgcolor: CORES.azul,
                    '&:hover': { bgcolor: CORES.azulEscuro },
                  }}
                >
                  Receber diagnóstico gratuito
                </LoadingButton>
              </>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
