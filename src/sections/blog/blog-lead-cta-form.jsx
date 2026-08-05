'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { PhoneInput } from 'src/components/phone-input';

// ----------------------------------------------------------------------
// Formulário do CTA de lead do blog.
//
// Vive em módulo próprio porque `PhoneInput` e `normalizePhoneToE164` puxam
// react-phone-number-input + libphonenumber-js (~200 KiB) — peso que não pode
// entrar no carregamento inicial de um post, já que o CTA fica abaixo da dobra.
// O `blog-lead-cta.jsx` importa este arquivo via next/dynamic (ssr: false) e
// reserva a altura exata enquanto ele não chega, para não gerar layout shift.
// ----------------------------------------------------------------------

export function BlogLeadCtaForm({ origem }) {
  const [values, setValues] = useState({ nome: '', email: '', telefone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.nome.trim() || !values.email.trim() || !values.telefone.trim()) {
      toast.error('Preencha nome, e-mail e telefone.');
      return;
    }

    setSubmitting(true);
    try {
      await criarLead({
        nome: values.nome.trim(),
        email: values.email.trim(),
        telefone: normalizePhoneToE164(values.telefone) ?? values.telefone,
        origem,
      });
      toast.success('Recebemos seus dados! Em breve entraremos em contato.');
      setValues({ nome: '', email: '', telefone: '' });
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Não foi possível enviar seus dados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Nome"
            required
            value={values.nome}
            onChange={handleChange('nome')}
          />
          <TextField
            fullWidth
            size="small"
            type="email"
            label="E-mail"
            required
            value={values.email}
            onChange={handleChange('email')}
          />
        </Stack>

        <PhoneInput
          country="BR"
          label="Telefone / WhatsApp"
          size="small"
          value={normalizePhoneToE164(values.telefone) || undefined}
          onChange={(newValue) => setValues((prev) => ({ ...prev, telefone: newValue ?? '' }))}
          fullWidth
          required
        />

        <LoadingButton type="submit" variant="contained" size="large" loading={submitting}>
          Quero falar com um especialista
        </LoadingButton>
      </Stack>
    </Box>
  );
}
