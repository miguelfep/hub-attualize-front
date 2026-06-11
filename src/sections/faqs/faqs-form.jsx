'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { PhoneInput } from 'src/components/phone-input';

// ----------------------------------------------------------------------

export function FaqsForm() {
  const [values, setValues] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
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
        observacoes: values.mensagem.trim(),
        origem: 'FAQs',
      });
      toast.success('Recebemos sua dúvida! Em breve entraremos em contato.');
      setValues({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Não foi possível enviar seus dados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h4">Não encontrou a resposta que procurava?</Typography>

      <Typography sx={{ mt: 1, color: 'text.secondary' }}>
        Deixe seus dados e sua dúvida que nosso time entra em contato com você.
      </Typography>

      <Box gap={3} display="flex" flexDirection="column" sx={{ my: 5 }}>
        <TextField
          fullWidth
          label="Nome"
          required
          value={values.nome}
          onChange={handleChange('nome')}
        />

        <TextField
          fullWidth
          type="email"
          label="E-mail"
          required
          value={values.email}
          onChange={handleChange('email')}
        />

        <PhoneInput
          country="BR"
          label="Telefone / WhatsApp"
          value={normalizePhoneToE164(values.telefone) || undefined}
          onChange={(newValue) => setValues((prev) => ({ ...prev, telefone: newValue ?? '' }))}
          fullWidth
          required
        />

        <TextField
          fullWidth
          label="Escreva sua dúvida aqui."
          multiline
          rows={4}
          value={values.mensagem}
          onChange={handleChange('mensagem')}
        />
      </Box>

      <LoadingButton type="submit" size="large" variant="contained" loading={submitting}>
        Enviar
      </LoadingButton>
    </Box>
  );
}
