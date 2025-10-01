import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function BannerCard({ banner, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose(banner.id);
    }
  };

  const handleClick = () => {
    if (banner.link) {
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank');
      } else {
        window.location.href = banner.link;
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        cursor: banner.link ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': banner.link ? {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8],
        } : {},
      }}
      onClick={handleClick}
    >
      {/* Botão de fechar */}
      {banner.dismissible && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Iconify icon="eva:close-fill" width={16} />
        </IconButton>
      )}

      {/* Imagem de fundo ou cor de fundo */}
      {banner.image ? (
        <CardMedia
          component="img"
          height="200"
          image={banner.image}
          alt={banner.title}
          sx={{
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            background: banner.gradient || `linear-gradient(135deg, ${banner.color || '#1976d2'} 0%, ${banner.colorSecondary || '#42a5f5'} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {banner.icon && (
            <Iconify
              icon={banner.icon}
              width={64}
              sx={{ color: 'white', opacity: 0.3 }}
            />
          )}
        </Box>
      )}

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {banner.title}
          </Typography>
          
          {banner.subtitle && (
            <Typography variant="body2" color="text.secondary">
              {banner.subtitle}
            </Typography>
          )}

          {banner.description && (
            <Typography variant="body2" color="text.secondary">
              {banner.description}
            </Typography>
          )}

          {banner.badge && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: banner.badgeColor || 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {banner.badge}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      {banner.link && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<Iconify icon="eva:arrow-forward-fill" width={16} />}
            sx={{
              bgcolor: banner.buttonColor || 'primary.main',
              '&:hover': {
                bgcolor: banner.buttonColor || 'primary.dark',
              },
            }}
          >
            {banner.buttonText || 'Saiba Mais'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
