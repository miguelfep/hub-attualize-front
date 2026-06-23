import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _socials } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { Iconify, SocialIcon } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ESPECIALIDADES = [
  { name: 'Clínicas de Estética', href: paths.esteticaHome },
  { name: 'Área da Saúde', href: paths.saudeHome },
  { name: 'Psicólogos', href: paths.psychologistHome },
  { name: 'Terapeutas e Bem-Estar', href: paths.terapeutasHome },
  { name: 'Profissional Parceiro', href: paths.profissionalParceiroHome },
  { name: 'Prestadores de Serviços', href: paths.prestadoresServicosHome },
];

const INSTITUCIONAL = [
  { name: 'Sobre', href: paths.about },
  { name: 'Blog', href: paths.post.blog },
  { name: 'Fale Conosco', href: paths.contact },
  { name: 'VR/VA Benefícios', href: paths.vrVa.solicitar },
  { name: 'MedPass', href: paths.medpass.solicitar },
];

const CONTATO = [
  {
    icon: 'mdi:whatsapp',
    name: '(41) 99698-2267',
    href: 'https://wa.me/554196982267',
  },
  {
    icon: 'solar:letter-bold-duotone',
    name: 'adm@attualizecontabil.com.br',
    href: 'mailto:adm@attualizecontabil.com.br',
  },
  {
    icon: 'solar:map-point-bold-duotone',
    name: 'Av. Sen. Salgado Filho, 1847 - Sobreloja, Guabirotuba, Curitiba - PR',
    href: null,
  },
  {
    icon: 'solar:buildings-2-bold-duotone',
    name: 'Atendimento 100% digital em todo o Brasil',
    href: null,
  },
];

// ----------------------------------------------------------------------

function FooterHeadline({ children }) {
  return (
    <Typography
      component="div"
      variant="overline"
      sx={{ color: 'text.primary', letterSpacing: 1 }}
    >
      {children}
    </Typography>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      component={RouterLink}
      href={href}
      color="inherit"
      variant="body2"
      sx={{
        color: 'text.secondary',
        width: 'fit-content',
        transition: 'all 0.2s ease',
        '&:hover': { color: '#0096D9', pl: 0.25, textDecoration: 'none' },
      }}
    >
      {children}
    </Link>
  );
}

// ----------------------------------------------------------------------

export function Footer({ layoutQuery, sx }) {
  const theme = useTheme();

  return (
    <Box component="footer" sx={{ position: 'relative', bgcolor: 'background.default', ...sx }}>
      <Divider />

      <Container
        sx={{
          pt: { xs: 8, md: 10 },
          pb: 4,
          textAlign: 'center',
          [theme.breakpoints.up(layoutQuery)]: { textAlign: 'unset' },
        }}
      >
        <Grid
          container
          spacing={{ xs: 5, [layoutQuery]: 4 }}
          sx={{
            justifyContent: 'center',
            [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'space-between' },
          }}
        >
          {/* Marca */}
          <Grid {...{ xs: 12, [layoutQuery]: 3.5 }}>
            <Stack
              spacing={2.5}
              sx={{
                alignItems: 'center',
                [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
              }}
            >
              <Logo />

              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }}>
                Contabilidade digital e inteligente, especializada em beleza, saúde e bem-estar.
                Atendimento humanizado em todo o Brasil.
              </Typography>

              <Stack direction="row" spacing={0.5}>
                {_socials.map((social) => (
                  <IconButton
                    key={social.name}
                    href={social.path}
                    target="_blank"
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha('#0096D9', 0.08),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <SocialIcon icon={social.name} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Especialidades - grade de 2 colunas */}
          <Grid {...{ xs: 12, sm: 6, [layoutQuery]: 3.5 }}>
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
              }}
            >
              <FooterHeadline>Especialidades</FooterHeadline>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  columnGap: 3,
                  gridTemplateColumns: 'repeat(2, auto)',
                  justifyContent: 'center',
                  [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'flex-start' },
                }}
              >
                {ESPECIALIDADES.map((link) => (
                  <FooterLink key={link.name} href={link.href}>
                    {link.name}
                  </FooterLink>
                ))}
              </Box>
            </Stack>
          </Grid>

          {/* Institucional */}
          <Grid {...{ xs: 12, sm: 6, [layoutQuery]: 2 }}>
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
              }}
            >
              <FooterHeadline>Institucional</FooterHeadline>

              <Stack
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                  [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
                }}
              >
                {INSTITUCIONAL.map((link) => (
                  <FooterLink key={link.name} href={link.href}>
                    {link.name}
                  </FooterLink>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Contato */}
          <Grid {...{ xs: 12, sm: 6, [layoutQuery]: 3 }}>
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
              }}
            >
              <FooterHeadline>Contato</FooterHeadline>

              <Stack
                spacing={1.5}
                sx={{
                  alignItems: 'center',
                  [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
                }}
              >
                {CONTATO.map((item) => (
                  <Stack key={item.name} direction="row" spacing={1} alignItems="flex-start">
                    <Iconify
                      icon={item.icon}
                      width={18}
                      sx={{ color: '#0096D9', flexShrink: 0, mt: 0.25 }}
                    />
                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        color="inherit"
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: '#0096D9', textDecoration: 'none' },
                        }}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.name}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: { xs: 6, md: 8 }, mb: 3 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            © {new Date().getFullYear()} Attualize Contábil. Todos os direitos reservados.
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            CRC PR010858/O-0
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function HomeFooter({ sx }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default',
        ...sx,
      }}
    >
      <Container>
        <Logo />
        <Box sx={{ mt: 1, typography: 'caption' }}>
          © Todos os direitos reservados
          <br /> Feito por
          <Link href="https://www.attualize.com.br/"> Attualize TECH </Link>
        </Box>
      </Container>
    </Box>
  );
}
