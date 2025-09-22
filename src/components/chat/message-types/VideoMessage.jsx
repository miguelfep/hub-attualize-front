import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

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

export function VideoMessage({ message, isOwn }) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: 1,
          maxWidth: 300,
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
            sx={{
              position: 'relative',
              width: '100%',
              height: 200,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'grey.900',
            }}
          >
            <Box
              component="video"
              src={message.mediaUrl}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              poster={message.thumbnailUrl}
            />
            
            {/* Overlay com botão de play */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <IconButton
                size="large"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
              >
                <Iconify
                  icon={isPlaying ? 'eva:pause-fill' : 'eva:play-fill'}
                  width={32}
                  color="primary.main"
                />
              </IconButton>
            </Box>
          </Box>
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Vídeo
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
            component="video"
            ref={videoRef}
            src={message.mediaUrl}
            controls
            autoPlay
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              borderRadius: 2,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

VideoMessage.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
