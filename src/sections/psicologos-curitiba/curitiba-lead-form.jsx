'use client';

import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Stack,
  MenuItem,
  TextField,
  Container,
  Typography,
} from '@mui/material';

import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { CORES } from './dados';

// ----------------------------------------------------------------------

const PROFISSOES = [
  'Psicólogo(a)',
  'Psiquiatra',
  'Psicanalista',
  'Terapeuta',
  'Outro profissional de saúde',
];

const FAIXAS_FATURAMENTO = [
  'Até R$ 5.000/mês',
  'R$ 5.000 a R$ 10.000/mês',
  'R$ 10.000 a R$ 25.000/mês',
  'R$ 25.000 a R$ 50.000/mês',
  'Acima de R$ 50.000/mês',
  'Ainda não faturo (vou abrir agora)',
];

const FORM_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  profissao: '',
  faturamento: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CuritibaLeadForm() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const handleChange = (campo) => (event) => {
    setForm((prev) => ({ ...prev, [campo]: event.target.value }));
    setErros((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = 'Informe seu nome';
    if (!EMAIL_REGEX.test(form.email)) novosErros.email = 'Informe um e-mail válido';
    if (form.telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Informe seu WhatsApp com DDD';
    }
    if (!form.profissao) novosErros.profissao = 'Selecione sua profissão';
    if (!form.faturamento) novosErros.faturamento = 'Selecione uma faixa';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleEnviar = async () => {
    if (!validar()) return;
    try {
      setEnviando(true);
      await criarLead({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        segment: 'psicologia',
        origem: 'site-psicologos-curitiba',
        observacoes: `Profissão: ${form.profissao} · Faturamento: ${form.faturamento} (landing Psicólogos Curitiba)`,
      });
      toast.success('Recebemos seus dados! Vamos falar com você em breve.');
      setForm(FORM_INICIAL);
    } catch (error) {
      toast.error('Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      component="section"
      id="diagnostico-gratuito"
      aria-labelledby="titulo-lead"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: CORES.tinta, scrollMarginTop: 96 }}
    >
      <Container maxWidth="md">
        <Stack spacing={1} sx={{ textAlign: 'center', mb: 4 }}>
          <Typography id="titulo-lead" component="h2" variant="h3" sx={{ color: '#FFFFFF' }}>
            Receba um diagnóstico gratuito do seu consultório
          </Typography>
          <Typography variant="body1" sx={{ color: '#D9C9D1', maxWidth: 560, mx: 'auto' }}>
            Em uma conversa rápida, simulamos seu enquadramento, o Fator R e quanto você pode
            economizar. Sem compromisso e sem juridiquês.
          </Typography>
        </Stack>

        <Box
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            bgcolor: '#FFFFFF',
          }}
        >
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                id="lead-nome"
                label="Nome"
                value={form.nome}
                onChange={handleChange('nome')}
                error={!!erros.nome}
                helperText={erros.nome || ' '}
                autoComplete="name"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                id="lead-email"
                label="E-mail"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                error={!!erros.email}
                helperText={erros.email || ' '}
                autoComplete="email"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                id="lead-whatsapp"
                label="WhatsApp (com DDD)"
                value={form.telefone}
                onChange={handleChange('telefone')}
                error={!!erros.telefone}
                helperText={erros.telefone || ' '}
                inputMode="tel"
                placeholder="(41) 99999-9999"
                autoComplete="tel"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                select
                id="lead-profissao"
                label="Profissão"
                value={form.profissao}
                onChange={handleChange('profissao')}
                error={!!erros.profissao}
                helperText={erros.profissao || ' '}
              >
                {PROFISSOES.map((opcao) => (
                  <MenuItem key={opcao} value={opcao}>
                    {opcao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                select
                id="lead-faturamento"
                label="Faturamento mensal aproximado"
                value={form.faturamento}
                onChange={handleChange('faturamento')}
                error={!!erros.faturamento}
                helperText={erros.faturamento || ' '}
              >
                {FAIXAS_FATURAMENTO.map((opcao) => (
                  <MenuItem key={opcao} value={opcao}>
                    {opcao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12}>
              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                loading={enviando}
                onClick={handleEnviar}
                startIcon={<Iconify icon="solar:letter-bold" />}
                sx={{
                  py: 1.5,
                  bgcolor: CORES.rosa,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#9E1245' },
                  '&:focus-visible': { outline: `3px solid ${CORES.tinta}`, outlineOffset: 2 },
                }}
              >
                Receber diagnóstico gratuito
              </LoadingButton>
            </Grid>
          </Grid>
          <Typography variant="caption" sx={{ color: CORES.grafite, display: 'block', mt: 1.5 }}>
            Usamos seus dados apenas para retornar o contato — nada de spam.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
