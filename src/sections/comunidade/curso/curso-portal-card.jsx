'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { endpoints } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const getTipoAcessoLabel = (tipoAcesso) => {
  const tipoMap = {
    gratuito: 'Gratuito',
    exclusivo_cliente: 'Exclusivo Cliente',
    pago: 'Pago',
  };
  return tipoMap[tipoAcesso] || tipoAcesso;
};

const getTipoAcessoColor = (tipoAcesso) => {
  const colorMap = {
    gratuito: 'success',
    exclusivo_cliente: 'info',
    pago: 'warning',
    compra: 'success',
    cliente_especifico: 'info',
  };
  return colorMap[tipoAcesso] || 'default';
};

const getMotivoAcessoLabel = (motivoAcesso) => {
  const map = {
    gratuito: 'Gratuito',
    exclusivo_cliente: 'Exclusivo clientes',
    compra: 'Adquirido',
    cliente_especifico: 'Disponível para você',
  };
  return map[motivoAcesso] || null;
};

// ----------------------------------------------------------------------

export function CursoPortalCard({ curso }) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const temAcesso = curso?.temAcesso ?? false;
  const motivoAcesso = curso?.motivoAcesso;
  // Sempre usar URL padrão: {BASE}/comunidade/cursos/{id}/thumbnail — exibir capa; se 404, onError mostra ícone
  const thumbnailSrc = curso?._id ? endpoints.comunidade.cursos.thumbnail(curso._id) : null;

  useEffect(() => {
    setThumbnailError(false);
  }, [curso?._id]);

  const getButtonLabel = () => {
    if (temAcesso) return 'Acessar';
    if (curso?.tipoAcesso === 'pago') return 'Ver detalhes';
    if (curso?.tipoAcesso === 'exclusivo_cliente') return 'Exclusivo clientes';
    return 'Ver detalhes';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
    >
      {/* Sempre tentar exibir imagem de capa; se não houver (404), onError exibe o ícone */}
      {thumbnailSrc && !thumbnailError ? (
        <CardMedia
          component="img"
          height="200"
          image={thumbnailSrc}
          alt={curso.titulo}
          sx={{ objectFit: 'cover' }}
          onError={() => setThumbnailError(true)}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          <Iconify icon="solar:book-bookmark-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
        </Box>
      )}

      <Stack spacing={2} sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          {temAcesso && motivoAcesso && getMotivoAcessoLabel(motivoAcesso) ? (
            <Label variant="soft" color={getTipoAcessoColor(motivoAcesso)}>
              {getMotivoAcessoLabel(motivoAcesso)}
            </Label>
          ) : (
            <Label variant="soft" color={getTipoAcessoColor(curso.tipoAcesso)}>
              {getTipoAcessoLabel(curso.tipoAcesso)}
            </Label>
          )}
        </Stack>

        <Typography variant="h6" sx={{ minHeight: 48 }}>
          {curso.titulo}
        </Typography>

        {curso.descricao && (
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            {curso.descricao.length > 100
              ? `${curso.descricao.substring(0, 100)}...`
              : curso.descricao}
          </Typography>
        )}

        <Stack direction="row" spacing={2} alignItems="center">
          {curso.duracaoTotal && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify icon="solar:clock-circle-bold-duotone" width={16} />
              <Typography variant="caption">{curso.duracaoTotal} min</Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon="solar:book-bookmark-bold-duotone" width={16} />
            <Typography variant="caption">
              {curso.materiais?.length || 0} materiais
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            {temAcesso ? 'Você tem acesso' : curso?.tipoAcesso === 'pago' ? fCurrency(curso.preco ?? 0) : 'Gratuito'}
          </Typography>

          <Button
            component={RouterLink}
            href={paths.cliente.comunidade.cursos.details(curso._id)}
            variant={temAcesso ? 'contained' : 'outlined'}
            size="small"
          >
            {getButtonLabel()}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
