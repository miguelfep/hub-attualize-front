'use client';

import { useState } from 'react';

import { Box, Button, TextField, Container, Typography, CircularProgress } from '@mui/material';

export function LeadCapture() {
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // // Enviar os dados para a API
      // const response = await fetch('/api/capturar-lead', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error('Erro ao enviar os dados. Tente novamente.');
      // }

      // Após sucesso, exibe a mensagem e oculta o formulário
      setLeadCaptured(true);
    } catch (error) {
      console.error(error);
      alert('Houve um problema ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container>
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
          Presentes exclusivos para você!
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto', mb: 4 }}>
          A <strong>Attualize Contábil</strong> e a <strong>Defina Estética</strong> se uniram para
          apoiar você no caminho do sucesso! Como participante da jornada seu espaço em dia com a vigilância, 
          você vai receber materiais <strong>EXCLUSIVOS</strong> que irão te ajudar nas burocracias contábeis e tributárias do seu espaço.
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', fontWeight: 600, maxWidth: 700, mx: 'auto', mb: 4 }}
        >
          Preencha seus dados abaixo para receber os presentes diretamente no seu e-mail.
        </Typography>

        {!leadCaptured ? (
          // Formulário para capturar leads
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}
          >
            <TextField
              fullWidth
              name="name"
              label="Nome"
              variant="outlined"
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              name="email"
              type="email"
              label="E-mail"
              variant="outlined"
              required
              value={formData.email}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              name="phone"
              label="WhatsApp"
              variant="outlined"
              required
              value={formData.phone}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Quero meus materiais gratuitos'
              )}
            </Button>
          </Box>
        ) : (
          // Mensagem de confirmação após envio
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'green' }}>
              🎉 Presentes enviados com sucesso!
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Verifique seu e-mail! Enviamos os materiais exclusivos diretamente para você. Caso não
              encontre, cheque a pasta de spam ou promoções. 😉
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
