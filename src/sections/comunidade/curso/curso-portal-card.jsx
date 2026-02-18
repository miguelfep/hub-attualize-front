'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

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
  };
  return colorMap[tipoAcesso] || 'default';
};

// ----------------------------------------------------------------------

export function CursoPortalCard({ curso }) {
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
      {curso.thumbnailUrl && (
        <CardMedia
          component="img"
          height="200"
          image={curso.thumbnailUrl}
          alt={curso.titulo}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <Stack spacing={2} sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Label variant="soft" color={getTipoAcessoColor(curso.tipoAcesso)}>
            {getTipoAcessoLabel(curso.tipoAcesso)}
          </Label>
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
          {curso.tipoAcesso === 'pago' ? (
            <Typography variant="h6" color="primary.main">
              {fCurrency(curso.preco)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Gratuito
            </Typography>
          )}

          <Button
            component={RouterLink}
            href={paths.cliente.comunidade.cursos.details(curso._id)}
            variant="contained"
            size="small"
          >
            Ver Detalhes
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
