import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { maxLine } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CATEGORIES = [
  { label: 'Dashboard', icon: 'solar:chart-2-bold', href: paths.cliente.dashboard },
  { label: 'Financeiro', icon: 'solar:wallet-money-bold', href: paths.cliente.financeiro.root },
  {
    label: 'Documentos e Societário',
    icon: 'solar:document-text-bold',
    href: paths.cliente.societario.root,
  },
  { label: 'Vendas e Orçamentos', icon: 'solar:bill-list-bold', href: paths.cliente.orcamentos.root },
  {
    label: 'Conteúdos Exclusivos',
    icon: 'solar:book-2-bold',
    href: paths.cliente.conteudos.root,
  },
  {
    label: 'Comunidade',
    icon: 'solar:users-group-rounded-bold',
    href: paths.cliente.comunidade.root,
  },
  {
    label: 'Indicações e Recompensas',
    icon: 'solar:gift-bold',
    href: paths.cliente.indicacoes.root,
  },
  {
    label: 'Contratos e Licenças',
    icon: 'solar:document-bold',
    href: paths.cliente.contratos.root,
  },
];

// ----------------------------------------------------------------------

export function FaqsCategory() {
  const nav = useBoolean();

  const renderMobile = (
    <>
      <Box
        sx={{
          p: 2,
          top: 0,
          left: 0,
          width: 1,
          position: 'absolute',
          display: { xs: 'block', md: 'none' },
          borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <Button startIcon={<Iconify icon="solar:list-bold" />} onClick={nav.onTrue}>
          Áreas do Portal
        </Button>
      </Box>

      <Drawer open={nav.value} onClose={nav.onFalse}>
        <Box gap={1} display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 1 }}>
          {CATEGORIES.map((category) => (
            <CardMobile key={category.label} category={category} />
          ))}
        </Box>
      </Drawer>
    </>
  );

  const renderDesktop = (
    <Box
      gap={3}
      display={{ xs: 'none', md: 'grid' }}
      gridTemplateColumns={{ md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
    >
      {CATEGORIES.map((category) => (
        <CardDesktop key={category.label} category={category} />
      ))}
    </Box>
  );

  return (
    <>
      {renderMobile}
      {renderDesktop}
    </>
  );
}

function CardDesktop({ category }) {
  const theme = useTheme();

  return (
    <Paper
      component={RouterLink}
      href={category.href}
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'unset',
        cursor: 'pointer',
        textAlign: 'center',
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': { bgcolor: 'background.paper', boxShadow: theme.customShadows.z20 },
      }}
    >
      <Box
        sx={{
          mb: 2,
          width: 80,
          height: 80,
          mx: 'auto',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.main',
        }}
      >
        <Iconify icon={category.icon} width={40} />
      </Box>

      <Typography
        variant="subtitle2"
        sx={{ ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }) }}
      >
        {category.label}
      </Typography>
    </Paper>
  );
}

// ----------------------------------------------------------------------

function CardMobile({ category }) {
  return (
    <ListItemButton
      key={category.label}
      component={RouterLink}
      href={category.href}
      sx={{
        py: 2,
        maxWidth: 160,
        borderRadius: 1,
        textAlign: 'center',
        alignItems: 'center',
        typography: 'subtitle2',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          mb: 1,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.main',
        }}
      >
        <Iconify icon={category.icon} width={28} />
      </Box>

      {category.label}
    </ListItemButton>
  );
}
