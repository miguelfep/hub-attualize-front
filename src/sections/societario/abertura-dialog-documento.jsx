// ** React Imports
import { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
// ** MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { Iconify } from 'src/components/iconify';

// ** Custom Components Imports
import { DialogContent } from '@mui/material';

import UploadArquivoAbertura from './abertura-arquivo-upload';

// ** Styled Component
const StyledGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4.8),
  [theme.breakpoints.down('md')]: {
    order: -1,
  },
}));

const DialogDocumentsAbertura = ({ document, name, id, onFileUploaded }) => {
  // ** States
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);



  return (
    <StyledGrid item xs={12} md={12}>
      <Box
        sx={{
          borderRadius: 1,
          p: (theme) => theme.spacing(2.5, 5, 4.75),
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">{name}</Typography>
        </Box>
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2">Adicione o {name}</Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }} />
        <Button
          fullWidth
          size="small"
          variant="contained"
          sx={{ marginTop: 6.75 }}
          onClick={handleClickOpen}
        >
          Enviar Documento
        </Button>
        <Dialog
          fullWidth
          maxWidth="md"
          onClose={handleDialogClose}
          aria-labelledby="simple-dialog-title"
          open={open}
        >
           <IconButton
              size="small"
              onClick={handleDialogClose}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Iconify icon="eva:close-fill" width={24} height={24} /> {/* Ícone de fechar */}
            </IconButton>
            <DialogTitle id="simple-dialog-title" sx={{ textAlign: 'center' }}>
              Faça o upload do arquivo
            </DialogTitle>
          <DialogContent
              sx={{
                px: { xs: 8, sm: 15 },
                py: { xs: 8, sm: 12.5 },
                display: 'flex',  // Flexbox para centralizar o conteúdo
                justifyContent: 'center',  // Centraliza horizontalmente
                alignItems: 'center',  // Centraliza verticalmente
                flexDirection: 'column',  // Conteúdo em formato de coluna
              }}
          >
            <UploadArquivoAbertura handleDialogClose={handleDialogClose} name={name} clientId={id} onFileUploaded={onFileUploaded} />
          </DialogContent>
        </Dialog>
      </Box>
    </StyledGrid>
  );
};

export default DialogDocumentsAbertura;
