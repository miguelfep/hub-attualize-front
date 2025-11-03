import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { toTitleCase } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Bom dia 👋', icon: 'solar:sun-bold-duotone' };
  if (hour < 18) return { text: 'Boa tarde 👋', icon: 'solar:cloud-sun-bold-duotone' };
  return { text: 'Boa noite 👋', icon: 'solar:moon-bold-duotone' };
};

export function AnalyticsWelcome({ user, sx, ...other }) {
  const theme = useTheme();
  const greeting = getGreeting();

  const message = 'Tudo em dia para começar a trabalhar! Que tal criar uma nova venda?';
  const ctaText = 'Nova Venda';
  const ctaLink = paths.cliente.orcamentos.novo;
  const ctaIcon = 'solar:add-circle-bold-duotone';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Card
      sx={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        p: 4,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        ...sx,
      }}
      {...other}
    >
      <Stack
        component={m.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ flexGrow: 1 }}
      >
        <m.div variants={itemVariants}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={greeting.icon} width={28} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 0.5, wordBreak: 'break-word' }}
              >
                {toTitleCase(greeting.text)},
              </Typography>
          </Stack>
        </m.div>

        <m.div variants={itemVariants}>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            {toTitleCase(user?.name) || 'Cliente'}!
          </Typography>
        </m.div>

        <m.div variants={itemVariants}>
          <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 360, opacity: 0.8 }}>
            {message}
          </Typography>
        </m.div>

        <m.div variants={itemVariants}>
          <Button
            href={ctaLink}
            variant="contained"
            color="secondary"
            startIcon={<Iconify icon={ctaIcon} />}
            sx={{ mt: 3 }}
          >
            {ctaText}
          </Button>
        </m.div>
      </Stack>

      <Box
        component={m.div}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          width: 180,
          height: 180,
        }}
      >
        <Iconify icon="solar:bill-list-bold-duotone" width={120} sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, transform: 'rotate(15deg)' }} />
        <Iconify icon="solar:users-group-rounded-bold-duotone" width={140} sx={{ position: 'absolute', bottom: 0, left: -20, opacity: 0.08, transform: 'rotate(-20deg)' }} />
      </Box>
    </Card>
  );
}
