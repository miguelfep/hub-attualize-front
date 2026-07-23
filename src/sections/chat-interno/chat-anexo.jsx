import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fData } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { useChatAnexo } from './hooks/use-chat-anexo';

// ----------------------------------------------------------------------
// Renderiza UM anexo de mensagem. Imagens: thumbnail clicável (lightbox);
// demais tipos: chip de download. O binário é baixado com o Bearer (blob:).
// ----------------------------------------------------------------------

export function ChatAnexo({ mensagemId, anexo, indice, onOpenLightbox }) {
  const mime = anexo?.mimeType || '';
  const ehImagem = mime.startsWith('image/');
  const ehAudio = mime.startsWith('audio/');
  const { src, carregando } = useChatAnexo(mensagemId, indice, true);

  if (carregando) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ width: 120, height: 80 }}>
        <CircularProgress size={18} />
      </Stack>
    );
  }

  if (ehAudio && src) {
    return (
      <Stack
        component="audio"
        controls
        src={src}
        preload="metadata"
        sx={{ height: 40, maxWidth: 280 }}
      />
    );
  }

  if (ehImagem && src) {
    return (
      <Stack
        component="img"
        src={src}
        alt={anexo.nomeOriginal}
        onClick={() => onOpenLightbox?.(src)}
        sx={{ maxWidth: 240, maxHeight: 200, borderRadius: 1, cursor: 'pointer', objectFit: 'cover' }}
      />
    );
  }

  return (
    <Link
      href={src || '#'}
      download={anexo.nomeOriginal}
      underline="none"
      sx={{
        px: 1.5,
        py: 1,
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: (t) => `solid 1px ${t.vars.palette.divider}`,
      }}
    >
      <Iconify icon="solar:file-bold" width={22} sx={{ color: 'text.secondary' }} />
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {anexo.nomeOriginal}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {anexo.tamanho ? fData(anexo.tamanho) : anexo.mimeType}
        </Typography>
      </Stack>
      <Iconify icon="solar:download-minimalistic-bold" width={16} sx={{ color: 'text.disabled' }} />
    </Link>
  );
}
