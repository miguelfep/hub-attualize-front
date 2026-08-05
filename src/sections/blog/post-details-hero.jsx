import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import SpeedDial from '@mui/material/SpeedDial';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import { useResponsive } from 'src/hooks/use-responsive';

import { fDate } from 'src/utils/format-time';

import { varAlpha, bgGradient } from 'src/theme/styles';

import { Image } from 'src/components/image';
import { Iconify, SocialIcon } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PostDetailsHero({ title, author, authorRole, authorAvatar, coverUrl, createdAt }) {
  const theme = useTheme();

  const _socialsShare = [
    {
      name: 'Facebook',
      icon: 'eva:facebook-fill',
      url: (postUrl, postTitle) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
    },
    {
      name: 'LinkedIn',
      icon: 'eva:linkedin-fill',
      url: (postUrl, postTitle) =>
        `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
    },
  ];

  const smUp = useResponsive('up', 'sm');

  return (
    <Box sx={{ height: 480, overflow: 'hidden', position: 'relative' }}>
      {/* Capa via next/image (LCP): otimizada/redimensionada e com priority.
          Antes era background-image — sem otimização nem preload. */}
      {!!coverUrl && (
        <Image
          alt={title}
          src={coverUrl}
          useNextImage
          priority
          fetchPriority="high"
          sizes="100vw"
          // A capa tem 480px de altura e fica sob um gradiente escuro de 64%
          // com o título por cima — qualidade 70 é indistinguível aqui e alivia
          // bastante o elemento de LCP. O teto de resolução vem do
          // `images.deviceSizes` no next.config.mjs.
          quality={70}
          sx={{ position: 'absolute', inset: 0, width: 1, height: 1 }}
        />
      )}
      <Box
        sx={{
          ...bgGradient({
            color: `0deg, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.64)}, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.64)}`,
          }),
          position: 'absolute',
          inset: 0,
        }}
      />
      <Container 
        sx={{ 
          height: 1, 
          position: 'relative',
          maxWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            zIndex: 9,
            color: 'common.white',
            position: 'absolute',
            maxWidth: { xs: '100%', sm: 700, md: 900 },
            pt: { xs: 3, md: 8 },
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
            lineHeight: { xs: 1.3, md: 1.2 },
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Stack
          sx={{
            left: 0,
            width: 1,
            bottom: 0,
            position: 'absolute',
          }}
        >
          {author && createdAt && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{ px: { xs: 2, md: 3 }, pb: { xs: 3, md: 8 } }}
            >
              <Avatar
                alt={typeof author === 'string' ? author : author?.name || 'Autor'}
                src={authorAvatar || '/logo/hub-tt.png'}
                sx={{ width: 64, height: 64, mr: 2 }}
              />

              <ListItemText
                sx={{ color: 'common.white' }}
                primary={typeof author === 'string' ? author : author?.name || 'Autor'}
                secondary={authorRole ? `${authorRole} · ${fDate(createdAt)}` : fDate(createdAt)}
                primaryTypographyProps={{ typography: 'subtitle1', mb: 0.5 }}
                secondaryTypographyProps={{ color: 'inherit', sx: { opacity: 0.64 } }}
              />
            </Stack>
          )}

          <SpeedDial
            direction={smUp ? 'left' : 'up'}
            ariaLabel="Share post"
            icon={<Iconify icon="solar:share-bold" />}
            FabProps={{ size: 'medium' }}
            sx={{ position: 'absolute', bottom: { xs: 32, md: 64 }, right: { xs: 16, md: 24 } }}
          >
            {_socialsShare.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={<SocialIcon icon={action.name} />}
                tooltipTitle={action.name}
                tooltipPlacement="top"
                FabProps={{ color: 'default' }}
                onClick={() => window.open(action.url(window.location.href, title), '_blank')} // Abertura em nova aba
              />
            ))}
          </SpeedDial>
        </Stack>
      </Container>
    </Box>
  );
}
