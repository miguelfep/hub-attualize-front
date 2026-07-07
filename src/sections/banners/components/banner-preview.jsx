'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { safeAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function BannerPreview({ banner, compact = false }) {
  const {
    titulo,
    descricao,
    corFundo = '#1976d2',
    corTexto = '#ffffff',
    corBotaoTexto = '#1976d2',
    corBotaoFundo = '#ffffff',
    textoBotao,
    linkBotao,
    iconeBotao = 'solar:bell-bold-duotone',
  } = banner || {};

  const textoExibido = titulo
    ? `${titulo}${descricao ? ` — ${descricao}` : ''}`
    : descricao || 'Título do banner';

  const tooltipTitle = [titulo, descricao].filter(Boolean).join(' — ') || 'Sem título';

  if (compact) {
    return (
      <Box
        sx={{
          bgcolor: corFundo,
          color: corTexto,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          maxWidth: 300,
        }}
      >
        <Tooltip title={tooltipTitle} arrow>
          <Typography
            variant="caption"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {descricao || titulo || 'Sem título'}
          </Typography>
        </Tooltip>
        {textoBotao && (
          <Box
            component="span"
            sx={{
              bgcolor: corBotaoFundo,
              color: corBotaoTexto,
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '0.65rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {textoBotao}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: corFundo,
        color: corTexto,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: 2, py: 1.25 }}>
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          justifyContent="space-between"
        >
          <Tooltip title={tooltipTitle} arrow>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {textoExibido}
            </Typography>
          </Tooltip>
          {textoBotao && (
            <Button
              component="a"
              href={linkBotao || '#'}
              variant="contained"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              size="small"
              startIcon={<Iconify icon={iconeBotao} />}
              sx={{
                color: corBotaoTexto,
                bgcolor: corBotaoFundo,
                fontWeight: 700,
                flexShrink: 0,
                '&:hover': {
                  bgcolor: safeAlpha(corBotaoFundo, 0.85),
                },
              }}
            >
              {textoBotao}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
