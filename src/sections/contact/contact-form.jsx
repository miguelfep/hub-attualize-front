import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function ContactForm() {
  return (
    <div>
      <Typography variant="h3">
        Fale com nosso time agora mesmo. <br />
      </Typography>

      <Box gap={3} display="flex" flexDirection="column" sx={{ my: 5 }}>
        <TextField fullWidth label="Nome" />
        <TextField fullWidth label="Email" />
        <TextField fullWidth label="Assunto" />
        <TextField fullWidth label="Digite sua mensagem aqui." multiline rows={4} />
      </Box>

      <Button size="large" variant="contained">
        Enviar
      </Button>
    </div>
  );
}
