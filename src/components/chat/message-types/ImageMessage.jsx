import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ImageMessage({ message, isOwn }) {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (imageError) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          maxWidth: 200,
          bgcolor: 'grey.100',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:image-fill" width={20} color="text.secondary" />
          <Typography variant="body2" color="text.secondary">
            Erro ao carregar imagem
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: 1,
          maxWidth: 250,
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
        onClick={handleOpen}
      >
        <Stack spacing={1}>
          <Box
            component="img"
            src={message.mediaUrl}
            alt="Imagem"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 200,
              borderRadius: 1,
              objectFit: 'cover',
            }}
            onError={() => setImageError(true)}
          />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Imagem
            </Typography>
            
            <Tooltip title="Visualizar em tela cheia">
              <IconButton size="small" onClick={handleOpen}>
                <Iconify icon="eva:expand-fill" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      {/* Modal para visualização em tela cheia */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            component="img"
            src={message.mediaUrl}
            alt="Imagem"
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

ImageMessage.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
