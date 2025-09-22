import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AudioMessage({ message, isOwn }) {
  console.log('AudioMessage - COMPONENTE CHAMADO');
  console.log('AudioMessage - message:', message);
  console.log('AudioMessage - isOwn:', isOwn);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const audioRef = useRef(null);

  // Obter a URL do áudio (prioriza mediaBase64)
  console.log('AudioMessage - mediaBase64:', message.mediaBase64);
  console.log('AudioMessage - mediaUrl:', message.mediaUrl);
  
  const audioSrc = message.mediaBase64 || message.mediaUrl;
  console.log('AudioMessage - audioSrc:', audioSrc);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      console.log('AudioMessage - Duração atualizada:', audio.duration);
      setDuration(audio.duration);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (error) => {
      console.error('AudioMessage - Erro no áudio:', error);
      console.error('AudioMessage - audioSrc:', audioSrc);
      console.error('AudioMessage - audio element:', audio);
      console.error('AudioMessage - audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleLoadStart = () => {
      console.log('AudioMessage - Iniciando carregamento do áudio');
      setIsLoadingMetadata(true);
      setHasError(false);
    };
    const handleCanPlay = () => {
      console.log('AudioMessage - Áudio pronto para reprodução');
      setIsLoading(false);
      setHasError(false);
    };
    const handleLoadedMetadata = () => {
      console.log('AudioMessage - Metadados carregados, duração:', audio.duration);
      setDuration(audio.duration);
      setIsLoadingMetadata(false);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Carregar metadados automaticamente
    console.log('AudioMessage - Carregando metadados...');
    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioSrc]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    console.log('AudioMessage - handlePlayPause chamado');
    console.log('AudioMessage - audio element:', audio);
    console.log('AudioMessage - hasError:', hasError);
    console.log('AudioMessage - isPlaying:', isPlaying);
    console.log('AudioMessage - audioSrc:', audioSrc);
    console.log('AudioMessage - readyState:', audio?.readyState);
    console.log('AudioMessage - duration:', audio?.duration);
    
    if (!audio || !audioSrc) {
      console.log('AudioMessage - Não é possível reproduzir (sem áudio ou src)');
      return;
    }

    if (isPlaying) {
      console.log('AudioMessage - Pausando áudio');
      audio.pause();
      setIsPlaying(false);
    } else {
      console.log('AudioMessage - Iniciando reprodução');
      setIsLoading(true);
      setHasError(false);
      
      audio.play()
        .then(() => {
          console.log('AudioMessage - Reprodução iniciada com sucesso');
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('AudioMessage - Erro ao reproduzir áudio:', error);
          console.error('AudioMessage - Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
          });
          setHasError(true);
          setIsLoading(false);
        });
    }
  };

  const handleSeek = (event, newValue) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    console.log('AudioMessage - Tentando novamente...');
    setHasError(false);
    setIsLoading(false);
    setIsPlaying(false);
    setIsLoadingMetadata(true);
    setCurrentTime(0);
    setDuration(0);
    
    const audio = audioRef.current;
    if (audio) {
      audio.load();
    }
  };

  // Se não há fonte de áudio, mostrar erro
  if (!audioSrc) {
    console.log('AudioMessage - ERRO: audioSrc não encontrado');
    console.log('AudioMessage - message.mediaBase64:', message.mediaBase64);
    console.log('AudioMessage - message.mediaUrl:', message.mediaUrl);
    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          minWidth: 250,
          maxWidth: 300,
          bgcolor: 'error.lighter',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="eva:alert-triangle-fill" color="error.main" width={24} />
          <Typography variant="body2" color="error.darker">
            Áudio não disponível
          </Typography>
        </Stack>
      </Card>
    );
  }

  console.log('AudioMessage - Renderizando player com audioSrc:', audioSrc);
  console.log('AudioMessage - Estados:', {
    isPlaying,
    isLoading,
    isLoadingMetadata,
    hasError,
    duration,
    currentTime
  });

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        minWidth: 200,
        maxWidth: 280,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        {/* Controles de áudio */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title={isPlaying ? "Pausar" : "Reproduzir"}>
            <IconButton
              onClick={handlePlayPause}
              sx={{ 
                bgcolor: isPlaying ? 'error.main' : 'success.main',
                color: 'white',
                width: 18,
                height: 18,
                borderRadius: '50%',
                '&:hover': { 
                  bgcolor: isPlaying ? 'error.dark' : 'success.dark',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <Iconify
                icon={isPlaying ? "ph:pause-fill" : "ph:play-fill"}
                width={12}
              />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Box>

          <Tooltip title="Download">
            <IconButton
              component="a"
              href={audioSrc}
              download={message.fileName || 'audio.ogg'}
              size="small"
              sx={{
                width: 28,
                height: 28,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <Iconify icon="ph:download" width={14} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Barra de progresso */}
        <Slider
          value={currentTime}
          min={0}
          max={duration || 0}
          onChange={handleSeek}
          size="small"
          disabled={!duration}
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
            '& .MuiSlider-track': {
              height: 4,
              borderRadius: 2,
            },
            '& .MuiSlider-rail': {
              height: 4,
              borderRadius: 2,
              opacity: 0.3,
            },
          }}
        />
      </Stack>
      

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        onLoadStart={() => console.log('AudioMessage - onLoadStart')}
        onCanPlay={() => console.log('AudioMessage - onCanPlay')}
        onError={(e) => console.error('AudioMessage - onError:', e)}
        onLoadedMetadata={() => console.log('AudioMessage - onLoadedMetadata')}
      />
    </Card>
  );
}

AudioMessage.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
