import React, { useState } from 'react';

import {
  Box,
  Step,
  Grid,
  Paper,
  Stack,
  Button,
  Stepper,
  StepLabel,
  Container,
  TextField,
  Typography,
  StepContent,
} from '@mui/material';

import { MotionViewport } from 'src/components/animate';

const steps = [
  {
    label: 'Registro na Junta Comercial',
    description: (
      <>
        <Typography variant="body1" paragraph>
          O registro na Junta Comercial é o primeiro passo para formalizar sua clínica. Esse
          processo cria a base legal para operar sua empresa, permitindo que você obtenha outros
          documentos essenciais.
        </Typography>
        <Typography variant="body1">
          Certifique-se de ter os seguintes documentos:
          <ul>
            <li>Contrato social da empresa</li>
            <li>Documentos dos sócios (RG, CPF, comprovante de residência)</li>
            <li>Requerimento de Empresário, se aplicável</li>
          </ul>
        </Typography>
      </>
    ),
  },
  {
    label: 'Tipos de Empresa para Clínicas de Estética',
    description: (
      <>
        <Typography variant="body1" paragraph>
          Escolher o tipo de empresa certo é fundamental para definir o regime tributário, as
          responsabilidades e as obrigações fiscais. Aqui estão os principais tipos de empresa que
          podem se enquadrar para clínicas de estética:
        </Typography>
        <Typography variant="body1">
          <ul>
            <li>
              <strong>MEI (Microempreendedor Individual):</strong> Ideal para profissionais
              autônomos que atendem sozinhos e faturam até R$ 81.000 por ano.
            </li>
            <li>
              <strong>ME (Microempresa):</strong> Para clínicas com faturamento anual de até R$
              360.000 e que possuam até 9 funcionários.
            </li>
            <li>
              <strong>EPP (Empresa de Pequeno Porte):</strong> Indicada para clínicas com
              faturamento entre R$ 360.000 e R$ 4.800.000 por ano.
            </li>
            <li>
              <strong>Sociedade Limitada:</strong> Para clínicas que possuem dois ou mais sócios,
              com divisão clara de responsabilidades e capital.
            </li>
          </ul>
        </Typography>
        <Typography variant="body1">
          Cada tipo de empresa possui vantagens e desvantagens. Um contador pode ajudá-lo a escolher
          a melhor opção para o seu negócio.
        </Typography>
      </>
    ),
  },
  {
    label: 'Obtenção do CNPJ',
    description: (
      <>
        <Typography variant="body1" paragraph>
          Com o CNPJ, sua clínica será reconhecida como pessoa jurídica pela Receita Federal. Esse
          documento é necessário para emitir notas fiscais, abrir contas bancárias empresariais e
          cumprir obrigações tributárias.
        </Typography>
        <Typography variant="body1">
          Realize o cadastro no site da Receita Federal e tenha em mãos o número do protocolo gerado
          na Junta Comercial.
        </Typography>
      </>
    ),
  },
  {
    label: 'Alvará de Funcionamento',
    description: (
      <>
        <Typography variant="body1" paragraph>
          O alvará de funcionamento é emitido pela Prefeitura e certifica que sua clínica atende às
          exigências locais para operar no endereço escolhido.
        </Typography>
        <Typography variant="body1">
          Durante o processo, será necessária uma inspeção do local para garantir a conformidade com
          as normas de segurança e acessibilidade.
        </Typography>
      </>
    ),
  },
  {
    label: 'Licença da Vigilância Sanitária',
    description: (
      <>
        <Typography variant="body1" paragraph>
          Essa licença é indispensável para clínicas de estética, garantindo que os padrões de
          higiene e segurança sejam seguidos.
        </Typography>
        <Typography variant="body1">
          Prepare:
          <ul>
            <li>Manual de boas práticas</li>
            <li>Certificados de manutenção de equipamentos</li>
            <li>Registro de esterilização</li>
          </ul>
        </Typography>
      </>
    ),
  },
  {
    label: 'Regularize Obrigações Fiscais',
    description: (
      <>
        <Typography variant="body1" paragraph>
          Garanta que sua clínica esteja em conformidade com todas as obrigações fiscais e
          tributárias, como o pagamento do ISS (Imposto Sobre Serviços) e declarações ao governo.
        </Typography>
        <Typography variant="body1">
          Um contador especializado pode ajudar a manter sua clínica regularizada e evitar multas.
        </Typography>
      </>
    ),
  },
  {
    label: 'Quer Ajuda da Attualize?',
    description: (
      <Typography variant="body1" paragraph>
        Preencha as informações abaixo para que possamos ajudá-lo a regularizar sua clínica de
        estética. Entraremos em contato rapidamente para oferecer o suporte necessário.
      </Typography>
    ),
    isFormStep: true,
  },
];

export function LegalizarClinicaEsteticaStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });
  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (steps[activeStep].isFormStep && !validateForm()) return;

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const handleReset = () => {
    setActiveStep(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // await axios.post('/api/enviar-dados', formData);
      const whatsappUrl = `https://wa.me/5541996982267?text=Olá,%20meu%20nome%20é%20${encodeURIComponent(
        formData.nome
      )},%20e%20tenho%20interesse%20em%20regularizar%20minha%20clínica%20de%20estética!`;
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
    }
  };

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: 8, md: 12 },
        textAlign: 'center',
      }}
    >
      {/* Título Centralizado */}
      <Typography
        variant="h3"
        component="h2"
        gutterBottom
        sx={{
          mb: 4,
        }}
      >
        Como Legalizar uma Clínica de Estética?
      </Typography>

      {/* Texto de introdução */}
      <Grid container spacing={4} alignItems="center">
        <Box sx={{ mb: 6 }}>
          <Typography variant="body1" paragraph>
            Abrir uma clínica de estética é um sonho para muitos empreendedores, mas garantir que o
            negócio opere legalmente é fundamental. A legalização não só assegura que sua clínica
            esteja em conformidade com as leis, mas também transmite confiança para seus clientes e
            parceiros.
          </Typography>
          <Typography variant="body1">
            Conheça os principais passos para legalizar sua clínica e operar com segurança e
            tranquilidade.
          </Typography>
        </Box>
      </Grid>

      {/* Stepper */}
      <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'left' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>{step.description}</Box>
                {step.isFormStep && (
                  <Stack spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      label="Nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      error={!!errors.nome}
                      helperText={errors.nome}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      fullWidth
                    />
                    <TextField
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      error={!!errors.telefone}
                      helperText={errors.telefone}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      sx={{ mt: 2 }}
                    >
                      Ajuda do especialista
                    </Button>
                  </Stack>
                )}
                {!step.isFormStep && (
                  <Box>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mr: 1 }}
                      disabled={index === steps.length - 1}
                    >
                      {index === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                    </Button>
                    <Button disabled={index === 0} onClick={handleBack}>
                      Voltar
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Mensagem Final */}
        {activeStep === steps.length && (
          <Paper square elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6">
              Parabéns! Sua clínica está pronta para operar legalmente.
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 2 }}>
              Recomeçar
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
