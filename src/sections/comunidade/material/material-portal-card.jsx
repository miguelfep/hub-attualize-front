'use client';

import { useRouter } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { fCurrency } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const getTipoIcon = (tipo) => {
  const iconMap = {
    ebook: 'solar:book-bold-duotone',
    videoaula: 'solar:play-circle-bold-duotone',
    documento: 'solar:document-bold-duotone',
    link: 'solar:link-bold-duotone',
    outro: 'solar:file-bold-duotone',
  };
  return iconMap[tipo] || 'solar:file-bold-duotone';
};

const getTipoLabel = (tipo) => {
  const tipoMap = {
    ebook: 'E-book',
    videoaula: 'Videoaula',
    documento: 'Documento',
    link: 'Link',
    outro: 'Outro',
  };
  return tipoMap[tipo] || tipo;
};

const getTipoAcessoColor = (tipoAcesso) => {
  const colorMap = {
    gratuito: 'success',
    exclusivo_cliente: 'info',
    pago: 'warning',
  };
  return colorMap[tipoAcesso] || 'default';
};

const getTipoAcessoLabel = (tipoAcesso) => {
  const tipoMap = {
    gratuito: 'Gratuito',
    exclusivo_cliente: 'Exclusivo',
    pago: 'Pago',
  };
  return tipoMap[tipoAcesso] || tipoAcesso;
};

// ----------------------------------------------------------------------

export function MaterialPortalCard({ material }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(paths.cliente.comunidade.materiais.details(material._id));
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows.z24,
        },
      }}
      onClick={handleClick}
    >
      {material.thumbnailUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={material.thumbnailUrl}
          alt={material.titulo}
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
          <Iconify icon={getTipoIcon(material.tipo)} width={64} sx={{ color: 'text.disabled' }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Label variant="soft" color={getTipoAcessoColor(material.tipoAcesso)}>
              {getTipoAcessoLabel(material.tipoAcesso)}
            </Label>
            <Label variant="soft">{getTipoLabel(material.tipo)}</Label>
          </Stack>

          <Typography variant="h6" noWrap>
            {material.titulo}
          </Typography>

          {material.descricao && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {material.descricao}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            {material.visualizacoes > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:eye-fill" width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">
                  {material.visualizacoes}
                </Typography>
              </Stack>
            )}
            {material.downloads > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:download-fill" width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">
                  {material.downloads}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={material.tipoAcesso === 'pago' ? 'contained' : 'outlined'}
          onClick={handleClick}
          endIcon={<Iconify icon="eva:arrow-forward-fill" />}
        >
          {material.tipoAcesso === 'pago' ? `Comprar por ${fCurrency(material.preco)}` : 'Acessar'}
        </Button>
      </CardActions>
    </Card>
  );
}
