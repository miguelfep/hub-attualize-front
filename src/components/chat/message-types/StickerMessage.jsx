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

export function StickerMessage({ message, isOwn }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: 1,
          maxWidth: 200,
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
        onClick={handleOpen}
      >
        <Stack spacing={1}>
          <Box
            component="img"
            src={message.mediaUrl}
            alt="Sticker"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Sticker
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
        maxWidth="sm"
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
            alt="Sticker"
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

StickerMessage.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
