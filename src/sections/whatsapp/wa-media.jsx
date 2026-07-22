import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fData } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { useWaMedia } from './hooks/use-wa-media';

// ----------------------------------------------------------------------
// Renderiza a mídia de uma mensagem (image/audio/video/document) buscando o
// binário com o Bearer (a mídia não é pública). Enquanto `midia.baixada` for
// false (inbound ainda baixando) mostramos um placeholder.
// ----------------------------------------------------------------------

export function WaMedia({ mensagem, onOpenLightbox }) {
  const { _id, tipo, midia } = mensagem;
  const baixada = midia?.baixada !== false; // undefined => trata como pronta
  const { src, carregando, erro } = useWaMedia(_id, baixada);

  if (!baixada || carregando) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ width: 240, height: 160, borderRadius: 1.5, bgcolor: 'background.neutral' }}
      >
        <CircularProgress size={22} />
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
          Baixando mídia…
        </Typography>
      </Stack>
    );
  }

  if (erro || !src) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{ width: 240, height: 120, borderRadius: 1.5, bgcolor: 'error.lighter', p: 1 }}
      >
        <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'error.main' }} />
        <Typography variant="caption" sx={{ color: 'error.dark', textAlign: 'center' }}>
          {erro || 'Mídia indisponível'}
        </Typography>
      </Stack>
    );
  }

  if (tipo === 'image' || tipo === 'sticker') {
    return (
      <Box
        component="img"
        alt={midia?.filename || 'imagem'}
        src={src}
        onClick={() => onOpenLightbox?.(src)}
        sx={{
          maxWidth: 320,
          maxHeight: 360,
          borderRadius: 1.5,
          cursor: 'pointer',
          objectFit: 'cover',
          '&:hover': { opacity: 0.9 },
        }}
      />
    );
  }

  if (tipo === 'audio') {
    return <Box component="audio" src={src} controls sx={{ width: 260, height: 40 }} />;
  }

  if (tipo === 'video') {
    return (
      <Box
        component="video"
        src={src}
        controls
        sx={{ maxWidth: 320, maxHeight: 360, borderRadius: 1.5 }}
      />
    );
  }

  // Documento / outros
  return (
    <Link
      href={src}
      target="_blank"
      rel="noopener"
      underline="none"
      download={midia?.filename || undefined}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          p: 1.5,
          minWidth: 220,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Iconify icon="solar:file-bold" width={32} sx={{ color: 'text.secondary' }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {midia?.filename || 'Documento'}
          </Typography>
          {midia?.tamanho ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fData(midia.tamanho)}
            </Typography>
          ) : null}
        </Box>
        <Iconify icon="eva:download-fill" sx={{ ml: 'auto', color: 'text.secondary' }} />
      </Stack>
    </Link>
  );
}
