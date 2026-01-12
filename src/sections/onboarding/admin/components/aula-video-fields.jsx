'use client';

import { useState, useEffect } from 'react';
import { TextField, CircularProgress, InputAdornment } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { extractYouTubeVideoId, isYouTubeUrl, getVideoDuration } from 'src/utils/youtube-utils';

// ----------------------------------------------------------------------

export function AulaVideoFields({ register, watch, setValue, errors }) {
  const conteudo = watch('conteudo') || {};
  const urlVideo = conteudo.urlVideo || '';
  const [loadingDuration, setLoadingDuration] = useState(false);

  // Verifica se a URL mudou e tenta obter a duração
  useEffect(() => {
    let timeoutId;

    const fetchDuration = async () => {
      if (!urlVideo || !isYouTubeUrl(urlVideo)) {
        return;
      }

      // Aguarda um pouco para o usuário terminar de digitar
      timeoutId = setTimeout(async () => {
        setLoadingDuration(true);
        try {
          // Tenta obter a duração (pode usar API key se configurada)
          const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || null;
          const duration = await getVideoDuration(urlVideo, apiKey);
          
          if (duration !== null && duration > 0) {
            setValue('duracaoEstimada', duration, { shouldValidate: true });
          }
        } catch (error) {
          console.error('Erro ao obter duração do vídeo:', error);
        } finally {
          setLoadingDuration(false);
        }
      }, 1500); // Aguarda 1.5 segundos após parar de digitar

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    };

    fetchDuration();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [urlVideo, setValue]);

  const isYouTube = isYouTubeUrl(urlVideo);
  const videoId = extractYouTubeVideoId(urlVideo);

  return (
    <TextField
      label="URL do Vídeo"
      value={urlVideo}
      onChange={(e) => {
        setValue('conteudo.urlVideo', e.target.value, { shouldValidate: true });
      }}
      error={!!errors.conteudo?.urlVideo}
      helperText={
        errors.conteudo?.urlVideo?.message ||
        (isYouTube && videoId
          ? loadingDuration
            ? 'Obtendo duração do vídeo...'
            : process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
              ? 'Duração será preenchida automaticamente'
              : 'Vídeo do YouTube detectado. Configure NEXT_PUBLIC_YOUTUBE_API_KEY para preenchimento automático da duração.'
          : 'Cole a URL do vídeo (YouTube, Vimeo, etc.)')
      }
      fullWidth
      required
      InputProps={{
        endAdornment: loadingDuration ? (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ) : isYouTube && videoId ? (
          <InputAdornment position="end">
            <Iconify icon="logos:youtube-icon" width={24} />
          </InputAdornment>
        ) : null,
      }}
    />
  );
}

