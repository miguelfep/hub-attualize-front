'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { criarLead, atualizarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';

import  { StepThree } from './form-steps-three';
import { Stepper, StepOne, StepTwo, StepCompleted } from './form-steps';

// Novo componente de pré-visualização
function PreviewStep({ data }) {
  return (
    <Box>
      <h2>Pré-visualização dos Dados</h2>
      <p>
        <strong>Nome:</strong> {data.stepOne.nome}
      </p>
      <p>
        <strong>Email:</strong> {data.stepOne.email}
      </p>
      <p>
        <strong>Telefone:</strong> {data.stepOne.telefone}
      </p>
      <p>
        <strong>Segmento:</strong> {data.stepTwo.segment}
      </p>
      <p>
        <strong>Estado:</strong> {data.stepThree.estado}
      </p>
      <p>
        <strong>Cidade:</strong> {data.stepThree.cidade}
      </p>
      <p>
        <strong>Receber Orçamento por:</strong> {data.stepThree.receberOrcamento}
      </p>
      <p>
        <strong>Observações:</strong> {data.stepThree.observacoes}
      </p>
    </Box>
  );
}

// ----------------------------------------------------------------------

const steps = ['Dados Iniciais', 'Segmento do negócio', 'Dados Gerais', 'Pré-visualização'];

// Validação Zod para cada passo
const StepOneSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  telefone: zod.string().min(1, { message: 'Telefone é obrigatório!' }),
});

const StepTwoSchema = zod.object({
  segment: zod.string().min(1, { message: 'Por favor, selecione um segmento de negócio!' }),
});

const StepThreeSchema = zod.object({
  estado: zod.string().min(1, { message: 'Estado é obrigatório!' }),
  cidade: zod.string().min(1, { message: 'Cidade é obrigatória!' }),
  receberOrcamento: zod.enum(['whatsapp', 'email'], { message: 'Selecione uma opção válida!' }),
  observacoes: zod.string().optional(),
});

const WizardSchema = zod.object({
  stepOne: StepOneSchema,
  stepTwo: StepTwoSchema,
  stepThree: StepThreeSchema,
});

// Valores padrões do formulário
const defaultValues = {
  stepOne: { nome: '', email: '', telefone: '' },
  stepTwo: { segment: '' },
  stepThree: { estado: '', cidade: '', receberOrcamento: 'email', observacoes: '' },
};

export function FormWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [leadId, setLeadId] = useState(null);

  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(WizardSchema),
    defaultValues,
  });

  const {
    reset,
    trigger,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  // Função para avançar para o próximo passo
  const handleNext = useCallback(
    async (step) => {
      const isValid = await trigger(step);

      if (isValid) {
        const dataToSend = getValues(step);

        try {
          if (step === 'stepOne') {
            // Criar lead no Step One
            const DataSend = {
              ...dataToSend,
              origem: 'siteAbertura',
            };

            const response = await criarLead(DataSend);
            setLeadId(response.leadId); // Salva o ID do lead criado
          } else if (step === 'stepTwo' && leadId) {
            // Atualizar lead no Step Two
            await atualizarLead(leadId, { segment: dataToSend.segment });
            toast.success('Lead atualizado com sucesso!');
          } else if (step === 'stepThree' && leadId) {
            // Atualizar lead novamente no Step Three

            const stepThreeData = {
              estado: dataToSend.estado,
              cidade: dataToSend.cidade,
              receberOrcamento: dataToSend.receberOrcamento,
              observacoes: dataToSend.observacoes,
            };

            await atualizarLead(leadId, stepThreeData);
            toast.success('Lead atualizado com sucesso!');
          }

          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } catch (error) {
          toast.error('Erro ao processar dados!');
          console.error('Erro ao processar dados:', error);
          // Não avança para o próximo passo se houver erro
        }
      }
    },
    [trigger, getValues, leadId]
  );

  // Função para retroceder ao passo anterior
  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  // Função para resetar o formulário
  const handleReset = useCallback(() => {
    reset();
    setActiveStep(0);
    setLeadId(null); // Reseta o ID do lead ao resetar o formulário
  }, [reset]);

  // Função de submissão final do formulário
  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.info('Dados completos enviados:', data);
      toast.success('Formulário enviado com sucesso!');
      setActiveStep((prevActiveStep) => prevActiveStep + 1); // Avança para a pré-visualização
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    }
  });

  const completedStep = activeStep === steps.length;

  return (
    <Card sx={{ p: 5, width: 1, mx: 'auto', maxWidth: 920 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stepper steps={steps} activeStep={activeStep} />
        <Box
          gap={3}
          display="flex"
          flexDirection="column"
          sx={{
            p: 3,
            mb: 3,
            minHeight: 240,
            borderRadius: 1.5,
            border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          }}
        >
          {activeStep === 0 && <StepOne />}
          {activeStep === 1 && <StepTwo />}
          {activeStep === 2 && <StepThree />}
          {activeStep === 3 && <PreviewStep data={getValues()} />}
          {completedStep && <StepCompleted onReset={handleReset} />}
        </Box>

        {!completedStep && (
          <Box display="flex">
            {activeStep !== 0 && <Button onClick={handleBack}>Voltar</Button>}

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === 0 && (
              <Button variant="contained" onClick={() => handleNext('stepOne')}>
                Próximo
              </Button>
            )}
            {activeStep === 1 && (
              <Button variant="contained" onClick={() => handleNext('stepTwo')}>
                Próximo
              </Button>
            )}
            {activeStep === 2 && (
              <Button variant="contained" onClick={() => handleNext('stepThree')}>
                Pré-visualizar
              </Button>
            )}
            {activeStep === 3 && (
              <Button variant="contained" onClick={() => setActiveStep(steps.length)}>
                Gerar Orçamento
              </Button>
            )}
            {activeStep === 4 && (
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Salvar
              </LoadingButton>
            )}
          </Box>
        )}
      </Form>
    </Card>
  );
}
