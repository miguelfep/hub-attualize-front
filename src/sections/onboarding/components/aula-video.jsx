'use client';

import { useState, useRef, useEffect } from 'react';

import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';

import ReactPlayer from 'react-player/lazy';

import { Iconify } from 'src/components/iconify';

import { isYouTubeUrl, extractYouTubeVideoId } from 'src/utils/youtube-utils';

// ----------------------------------------------------------------------

export function AulaVideo({ aula, progressoAula, onConcluir, onProgresso }) {
  const [tempoAssistido, setTempoAssistido] = useState(progressoAula?.tempoAssistido || 0);
  const [concluida, setConcluida] = useState(progressoAula?.concluida || false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Sincroniza o estado quando progressoAula mudar
  useEffect(() => {
    if (progressoAula) {
      setTempoAssistido(progressoAula.tempoAssistido || 0);
      setConcluida(progressoAula.concluida || false);
    }
  }, [progressoAula]);

  // Tenta encontrar a URL do vídeo em diferentes formatos possíveis
  const urlVideoRaw = 
    aula.conteudo?.urlVideo || 
    aula.conteudo?.url || 
    aula.urlVideo || 
    aula.url || 
    '';
  
  const isYouTube = isYouTubeUrl(urlVideoRaw);
  
  // Normaliza a URL do YouTube para remover parâmetros extras e garantir apenas o ID do vídeo
  const urlVideo = isYouTube && urlVideoRaw 
    ? (() => {
        const videoId = extractYouTubeVideoId(urlVideoRaw);
        // Retorna apenas a URL base com o ID do vídeo, sem parâmetros extras
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : urlVideoRaw;
      })()
    : urlVideoRaw;

  // Debug: log para verificar a estrutura dos dados
  useEffect(() => {
    if (!urlVideo) {
      console.warn('AulaVideo: URL do vídeo não encontrada', aula);
    } else if (isYouTube) {
      console.log('AulaVideo: Vídeo do YouTube detectado', urlVideo);
    }
  }, [urlVideo, isYouTube, aula]);

  // Para vídeos HTML5 nativos
  useEffect(() => {
    if (isYouTube) return; // Não aplica para YouTube

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const tempo = Math.floor(video.currentTime);
      setTempoAssistido(tempo);
      
      // Salva progresso a cada 10 segundos
      if (tempo % 10 === 0 && onProgresso) {
        onProgresso({ tempoAssistido: tempo });
      }
    };

    const handleEnded = () => {
      if (!concluida) {
        setConcluida(true);
        if (onConcluir) {
          onConcluir({ tempoAssistido: Math.floor(video.duration), concluida: true });
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [concluida, onConcluir, onProgresso, isYouTube]);

  // Para vídeos do YouTube (ReactPlayer)
  const handleProgress = (state) => {
    const tempo = Math.floor(state.playedSeconds);
    setTempoAssistido(tempo);
    setPlayedSeconds(state.playedSeconds);
    
    // Salva progresso a cada 10 segundos
    if (tempo % 10 === 0 && tempo > 0 && onProgresso) {
      onProgresso({ tempoAssistido: tempo });
    }
  };

  const handleEnded = () => {
    // Marca automaticamente como concluída quando o vídeo termina
    if (!concluida && onConcluir) {
      setConcluida(true);
      // Usa o tempo assistido atual ou a duração total estimada
      const tempoFinal = tempoAssistido > 0 ? tempoAssistido : (aula.duracaoEstimada ? aula.duracaoEstimada * 60 : 0);
      onConcluir({ tempoAssistido: tempoFinal, concluida: true });
    }
  };

  const handleMarcarConcluida = () => {
    setConcluida(true);
    if (onConcluir) {
      onConcluir({ tempoAssistido, concluida: true });
    }
  };

  if (!urlVideo) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          URL do vídeo não encontrada. Verifique se a aula foi configurada corretamente.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Título no topo */}
      {aula.titulo && (
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {aula.titulo}
          </Typography>
        </Box>
      )}

      {/* Vídeo no meio */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: 'grey.900',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {isYouTube ? (
          // Player do YouTube usando ReactPlayer
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!playerReady && !playerError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            {playerError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  textAlign: 'center',
                  color: 'error.main',
                }}
              >
                <Typography variant="body2">Erro ao carregar vídeo</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setPlayerError(false);
                    setPlayerReady(false);
                  }}
                  sx={{ mt: 1 }}
                >
                  Tentar novamente
                </Button>
              </Box>
            )}
            <ReactPlayer
              ref={playerRef}
              url={urlVideo}
              width="100%"
              height="100%"
              controls
              playing={false}
              onReady={() => {
                setPlayerReady(true);
                setPlayerError(false);
              }}
              onError={(error) => {
                console.error('Erro no ReactPlayer:', error);
                setPlayerError(true);
                setPlayerReady(false);
              }}
              onProgress={handleProgress}
              onEnded={handleEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    enablejsapi: 1,
                  },
                },
              }}
            />
          </Box>
        ) : (
          // Player HTML5 para vídeos normais
          <Box
            component="video"
            ref={videoRef}
            src={urlVideo}
            controls
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </Box>

      {/* Descrição e demais informações embaixo do vídeo */}
      <Stack spacing={2}>
        {aula.descricao && (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Descrição
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {aula.descricao}
            </Typography>
          </Box>
        )}

        {/* Informações adicionais */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {aula.duracaoEstimada && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Duração estimada
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {aula.duracaoEstimada} minutos
              </Typography>
            </Box>
          )}
          
          {tempoAssistido > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Tempo assistido
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.floor(tempoAssistido / 60)}:{(tempoAssistido % 60).toString().padStart(2, '0')}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Botão de conclusão e status */}
        <Stack spacing={2}>
          <Button
            variant="contained"
            onClick={handleMarcarConcluida}
            disabled={concluida}
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Marcar como Concluída
          </Button>
          
          {concluida && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Iconify icon="eva:checkmark-circle-2-fill" width={24} sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ color: 'success.darker' }}>
                Aula concluída
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

