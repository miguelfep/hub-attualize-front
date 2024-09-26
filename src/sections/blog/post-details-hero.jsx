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

import { Iconify, SocialIcon } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PostDetailsHero({ title, author, coverUrl, createdAt }) {
  const theme = useTheme();


  const _socialsShare = [
    {
      name: 'Facebook',
      icon: 'eva:facebook-fill',
      url: (postUrl, postTitle) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
    },
     {
      name: 'LinkedIn',
      icon: 'eva:linkedin-fill',
      url: (postUrl, postTitle) => `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`,
    },
  ];
  
  

  const smUp = useResponsive('up', 'sm');

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.64)}, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.64)}`,
          imgUrl: coverUrl,
        }),
        height: 480,
        overflow: 'hidden',
      }}
    >
      <Container sx={{ height: 1, position: 'relative' }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            zIndex: 9,
            color: 'common.white',
            position: 'absolute',
            maxWidth: 600,
            pt: { xs: 2, md: 8 },
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
                alt={author.name}
                src="/logo/hub-tt.png"
                sx={{ width: 64, height: 64, mr: 2 }}
              />

              <ListItemText
                sx={{ color: 'common.white' }}
                primary={author}
                secondary={fDate(createdAt)}
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
