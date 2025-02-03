import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import {
  Box,
  Grid,
  Modal,
  Stack,
  Button,
  TextField,
  Container,
  Typography,
  IconButton,
} from '@mui/material';

export function CallToAction({ pageSource }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    // Lógica para enviar os dados do cliente
    console.log({ name, email, phone, pageSource });
    handleClose();
  };

  return (
    <Box
      sx={{
        backgroundColor: 'grey.200',
        color: 'black',
        py: 1.5,
        px: 2,
        textAlign: 'center',
        borderRadius: 2,
        my: 2, // Espaçamento acima e abaixo
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h5" gutterBottom>
          Fale com nossos especialistas agora mesmo!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Está com dúvidas? Preencha seus dados e entraremos em contato.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={handleOpen}
          sx={{ px: 3, py: 1 }}
        >
          Falar com um especialista
        </Button>

        {/* Modal para coletar os dados do cliente */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 800,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 3,
              borderRadius: 2,
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Icon icon="mdi:close" width={24} height={24} />
            </IconButton>

            <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
              Solicite o contato de um especialista
            </Typography>

            <Grid container spacing={4}>
              {/* Formulário */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <TextField
                    label="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    fullWidth
                  />
                  <TextField
                    label="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Enviar
                  </Button>
                </Stack>
              </Grid>

              {/* Foto do time */}
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="https://attualizecontabil.com.br/wp-content/uploads/2024/10/ESPECIALIZADO.png" // Altere para a imagem correta do time
                  alt="Nosso Time"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}