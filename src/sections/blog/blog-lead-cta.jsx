'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';

// ----------------------------------------------------------------------

/**
 * CTA de captura de lead exibido nas páginas do blog.
 * @param {string} origem - identifica a origem do lead (ex.: "Blog - slug").
 * @param {string} [titulo]
 * @param {string} [subtitulo]
 */
export function BlogLeadCta({
  origem = 'Blog',
  titulo = 'Fale com um contador especialista',
  subtitulo = 'Receba orientação contábil para a sua área. Deixe seus dados e entramos em contato.',
}) {
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
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        my: 5,
        color: 'common.white',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main})`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:chat-square-call-bold" width={28} />
            <Typography variant="h5">{titulo}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitulo}
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ flex: 1.2, bgcolor: 'background.paper', borderRadius: 2, p: 2 }}
        >
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
              onChange={(newValue) =>
                setValues((prev) => ({ ...prev, telefone: newValue ?? '' }))
              }
              fullWidth
              required
            />

            <LoadingButton type="submit" variant="contained" size="large" loading={submitting}>
              Quero falar com um especialista
            </LoadingButton>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
