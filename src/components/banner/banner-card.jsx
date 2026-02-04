import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

const StyledOverlay = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 8,
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(3),
  color: theme.palette.common.white,
  background: `linear-gradient(to top, ${alpha(theme.palette.grey[900], 0.8)} 0%, transparent 70%)`,
}));

export function BannerCard({ banner }) {
  const { title, description, icon, color, buttonText, link, badge, image } = banner;

  // Se o banner tiver uma imagem, renderizar como banner de imagem
  if (image) {
    return (
      <Card
        component={link ? 'a' : 'div'}
        href={link || undefined}
        target={link ? '_blank' : undefined}
        rel={link ? 'noopener noreferrer' : undefined}
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: link ? 'pointer' : 'default',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          '&:hover': link
            ? {
                transform: 'scale(1.02)',
                transition: 'transform 0.3s ease-in-out',
              }
            : {},
        }}
      >
        <Box
          component="img"
          alt={title || 'Banner'}
          src={image}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
          }}
        />
        {badge && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 9,
              py: 0.5,
              px: 1,
              borderRadius: 1,
              typography: 'caption',
              fontWeight: 'bold',
              color: 'common.white',
              bgcolor: color || 'primary.main',
            }}
          >
            {badge}
          </Box>
        )}
      </Card>
    );
  }

  // Renderização padrão para banners de texto/ícone
  return (
    <Card sx={{ height: '100%', width: '100%', maxWidth: '100%', position: 'relative', overflow: 'hidden' }}>
      <Iconify
        icon={icon}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 180,
          color: alpha(color, 0.1),
          zIndex: 1,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.1)} 100%)`,
        }}
      />
      
      <StyledOverlay>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2, opacity: 0.8 }}>
          {description}
        </Typography>
        <Button
          component="a"
          href={link}
          target="_blank"
          rel="noopener"
          variant="contained"
          color="primary"
          sx={{ alignSelf: 'flex-start' }}
        >
          {buttonText}
        </Button>
      </StyledOverlay>

      {badge && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 9,
            py: 0.5,
            px: 1,
            borderRadius: 1,
            typography: 'caption',
            fontWeight: 'bold',
            color: 'common.white',
            bgcolor: color,
          }}
        >
          {badge}
        </Box>
      )}
    </Card>
  );
}
