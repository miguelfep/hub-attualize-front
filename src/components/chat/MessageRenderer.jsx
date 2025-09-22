import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import {
  AudioMessage,
  ImageMessage,
  VideoMessage,
  StickerMessage,
  DocumentMessage,
} from './message-types';

// ----------------------------------------------------------------------

export function MessageRenderer({ message, isOwn }) {
  // Renderizar mensagem de texto simples
  if (message.type === 'text' || !message.type) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          maxWidth: '70%',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4
          }}
        >
          {message.content?.replace(/\n/g, ' ').trim()}
        </Typography>
      </Card>
    );
  }

  // Renderizar sticker
  if (message.type === 'sticker') {
    return <StickerMessage message={message} isOwn={isOwn} />;
  }

  // Renderizar áudio
  if (message.type === 'audio' || message.type === 'ptt') {
    return <AudioMessage message={message} isOwn={isOwn} />;
  }

  // Renderizar imagem
  if (message.type === 'image') {
    return <ImageMessage message={message} isOwn={isOwn} />;
  }

  // Renderizar vídeo
  if (message.type === 'video') {
    return <VideoMessage message={message} isOwn={isOwn} />;
  }

  // Renderizar documento
  if (message.type === 'document') {
    return <DocumentMessage message={message} isOwn={isOwn} />;
  }

  // Renderizar localização
  if (message.type === 'location') {
    return (
      <Card variant="outlined" sx={{ p: 2, maxWidth: 250 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" gutterBottom>
            📍 Localização
          </Typography>
          {message.latitude && message.longitude && (
            <Box
              component="a"
              href={`https://maps.google.com/?q=${message.latitude},${message.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-block',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Ver no Google Maps
            </Box>
          )}
        </Box>
      </Card>
    );
  }

  // Renderizar contato
  if (message.type === 'contact') {
    return (
      <Card variant="outlined" sx={{ p: 2, maxWidth: 250 }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            👤 Contato
          </Typography>
          <Typography variant="body2">
            {message.contactName || 'Nome não disponível'}
          </Typography>
          {message.contactNumber && (
            <Typography variant="caption" color="text.secondary">
              {message.contactNumber}
            </Typography>
          )}
        </Box>
      </Card>
    );
  }

  // Renderizar mensagem não suportada
  return (
    <Card variant="outlined" sx={{ p: 2, maxWidth: 250 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Tipo de mensagem não suportado: {message.type}
        </Typography>
        {message.content && (
          <Typography variant="caption" color="text.secondary">
            {message.content}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

MessageRenderer.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
