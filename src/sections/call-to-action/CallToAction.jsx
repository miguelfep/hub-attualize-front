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

        <Modal open={open} onClose={handleClose} aria-labelledby="contact-modal-title">
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95vw', sm: '90vw', md: '70vw' },
              maxWidth: 900,
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
              <Icon icon="mdi:close" width={24} height={24} color="black" style={{ cursor: 'pointer' }}/>
            </IconButton>

            <Grid container>
              <Grid xs={12} md={6}>
                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                  <Typography id="contact-modal-title" variant="h5" sx={{ mb: 1 }}>
                    Solicite o contato
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Preencha seus dados e um de nossos especialistas entrará em contato em breve.
                  </Typography>

                  <Stack component="form" spacing={2.5}  onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextField
                      label="Nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      fullWidth
                      required
                    />
                    <TextField
                      label="Telefone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      fullWidth
                      required
                    />
                    <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1, py: 1.5 }}>
                      Enviar Solicitação
                    </Button>
                  </Stack>
                </Box>
              </Grid>

              <Grid md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component="img"
                  src="/assets/images/estetica/operacao-att.webp"
                  alt="Nosso Time"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: { xs: 300, sm: 400, md: 450 },
                    objectFit: 'cover',
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
