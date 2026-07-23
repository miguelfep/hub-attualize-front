import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------
// Seletor de GIFs (Giphy). Busca direto na API pública do Giphy usando a chave
// NEXT_PUBLIC_GIPHY_API_KEY (crie grátis em developers.giphy.com). Sem chave,
// mostra instrução. Selecionar envia a URL (media*.giphy.com — validada no back).
// ----------------------------------------------------------------------

const GIPHY_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

async function buscarGifs(termo) {
  const base = termo
    ? `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(termo)}`
    : 'https://api.giphy.com/v1/gifs/trending?';
  const res = await fetch(`${base}&api_key=${GIPHY_KEY}&limit=24&rating=pg-13&lang=pt`);
  const json = await res.json();
  return (json?.data || []).map((g) => ({
    id: g.id,
    thumb: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url,
    url: g.images?.fixed_width?.url || g.images?.original?.url,
  }));
}

export function ChatGifPicker({ anchorEl, onClose, onSelecionar }) {
  const open = !!anchorEl;
  const [busca, setBusca] = useState('');
  const [gifs, setGifs] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Busca com debounce simples.
  useEffect(() => {
    if (!open || !GIPHY_KEY) return undefined;
    setCarregando(true);
    const t = setTimeout(() => {
      buscarGifs(busca.trim())
        .then(setGifs)
        .catch(() => setGifs([]))
        .finally(() => setCarregando(false));
    }, 350);
    return () => clearTimeout(t);
  }, [open, busca]);

  useEffect(() => {
    if (!open) setBusca('');
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ paper: { sx: { width: 340, p: 1.5 } } }}
    >
      {!GIPHY_KEY ? (
        <Typography variant="body2" sx={{ p: 1, color: 'text.secondary' }}>
          Configure <b>NEXT_PUBLIC_GIPHY_API_KEY</b> no .env do front (chave gratuita em
          developers.giphy.com) para habilitar os GIFs.
        </Typography>
      ) : (
        <Stack spacing={1}>
          <InputBase
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar GIF…"
            autoFocus
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{ px: 1.5, height: 38, borderRadius: 1, bgcolor: 'background.neutral' }}
          />

          <Scrollbar sx={{ height: 280 }}>
            {carregando ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                <CircularProgress size={22} />
              </Stack>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
                {gifs.map((g) => (
                  <Box
                    key={g.id}
                    component="img"
                    src={g.thumb}
                    alt="GIF"
                    loading="lazy"
                    onClick={() => onSelecionar?.(g.url)}
                    sx={{
                      width: 1,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  />
                ))}
              </Box>
            )}
          </Scrollbar>

          <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'right' }}>
            Powered by GIPHY
          </Typography>
        </Stack>
      )}
    </Popover>
  );
}
