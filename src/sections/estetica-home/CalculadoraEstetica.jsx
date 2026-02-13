'use client';

import InputMask from 'react-input-mask';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Step,
  Grid,
  Paper,
  Stack,
  Button,
  Switch,
  Select,
  Stepper,
  MenuItem,
  TextField,
  StepLabel,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { consultarCep } from 'src/utils/consultarCep';

const atividadesEstetica = [
  'Clínica de Estética',
  'Centro de Beleza',
  'Spa',
  'Academia',
  'Pilates',
  'Crossfit',
];

export function Calculadora() {
  const [isClient, setIsClient] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [cep, setCep] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [faturamento, setFaturamento] = useState('');
  const [despesas, setDespesas] = useState('');
  const [formaAtuacao, setFormaAtuacao] = useState('');
  const [atividadePrincipal, setAtividadePrincipal] = useState('');
  const [possuiCnpj, setPossuiCnpj] = useState(false);
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [imposto, setImposto] = useState(null);

  const steps = ['Dados da Empresa', 'Contato', 'Resumo'];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      calcularImposto();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const calcularImposto = () => {
    if (!faturamento || !despesas) return;
    const faturamentoValor = parseFloat(faturamento.replace(/[^\d,-]+/g, '').replace(',', '.'));
    const despesasValor = parseFloat(despesas.replace(/[^\d,-]+/g, '').replace(',', '.'));
    const lucro = faturamentoValor - despesasValor;
    const aliquota = 5; // Alíquota fixa de 5%
    const result = (lucro * aliquota) / 100;
    setImposto(result.toFixed(2));
  };

  const handleCepChange = async (value) => {
    setCep(value);
    if (value.length === 8) {
      try {
        const data = await consultarCep(value);
        setMunicipio(data.localidade || '');
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const formatCurrency = (value, setValue) => {
    let formattedValue = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    formattedValue = (Number(formattedValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue(formattedValue);
  };

  if (!isClient) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Conteúdo dos Steps */}
      <Paper elevation={3} sx={{ p: 4 }}>
        {activeStep === 0 && (
          <Stack spacing={3}>
            {/* CEP e Município */}
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  label="CEP"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value.replace(/\D/g, ''))}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Município"
                  value={municipio}
                  disabled
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Faturamento e Despesas */}
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  label="Faturamento Mensal (R$)"
                  value={faturamento}
                  onChange={(e) => formatCurrency(e.target.value, setFaturamento)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Despesas Mensais (R$)"
                  value={despesas}
                  onChange={(e) => formatCurrency(e.target.value, setDespesas)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {/* Forma de Atuação */}
            <FormControl fullWidth>
              <InputLabel>Forma de Atuação</InputLabel>
              <Select
                value={formaAtuacao}
                onChange={(e) => setFormaAtuacao(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="Presencial">Presencial</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Híbrido">Híbrido</MenuItem>
              </Select>
            </FormControl>

            {/* Atividade Principal */}
            <FormControl fullWidth>
              <InputLabel>Atividade Principal</InputLabel>
              <Select
                value={atividadePrincipal}
                onChange={(e) => setAtividadePrincipal(e.target.value)}
                variant="outlined"
              >
                {atividadesEstetica.map((atividade, index) => (
                  <MenuItem key={index} value={atividade}>
                    {atividade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Toggle CNPJ */}
            <FormControlLabel
              control={
                <Switch checked={possuiCnpj} onChange={(e) => setPossuiCnpj(e.target.checked)} />
              }
              label="Já possui CNPJ?"
            />

            {/* Campo de CNPJ Condicional */}
            {possuiCnpj && (
              <InputMask
                mask="99.999.999/9999-99"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              >
                {() => <TextField label="CNPJ" variant="outlined" fullWidth />}
              </InputMask>
            )}
          </Stack>
        )}

        {/* Steps restantes */}
        {activeStep === 1 && (
          <Stack spacing={3}>
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <InputMask
              mask="(99) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            >
              {() => <TextField label="Telefone" variant="outlined" fullWidth />}
            </InputMask>
          </Stack>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6">Resumo</Typography>
            <Typography>Faturamento: {faturamento || '-'}</Typography>
            <Typography>Despesas: {despesas || '-'}</Typography>
            <Typography>Forma de Atuação: {formaAtuacao || '-'}</Typography>
            <Typography>Atividade Principal: {atividadePrincipal || '-'}</Typography>
            <Typography>CNPJ: {possuiCnpj ? cnpj || '-' : 'Não possui'}</Typography>
            {imposto !== null && (
              <Typography variant="h5" color="primary">
                Imposto Estimado: {imposto}
              </Typography>
            )}
          </Box>
        )}

        {/* Botões de Navegação */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              Voltar
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext}>
              Avançar
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Calcular
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
