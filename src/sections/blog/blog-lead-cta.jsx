'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// O formulário puxa react-phone-number-input + libphonenumber-js (~200 KiB) e
// fica abaixo da dobra, então só é buscado depois da hidratação. O placeholder
// abaixo reproduz a altura exata dos campos (2 linhas de 40px em xs / 1 em sm+,
// telefone 40px, botão 48px, spacing 1.5 = 12px) para não causar layout shift.
// O skeleton é renderizado no SSR e mantido até montar (em vez de `ssr: false`,
// que serializa um marcador "Bail out to client-side rendering" no HTML).
const FormSkeleton = () => (
  <Stack spacing={1.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
      <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
    </Stack>
    <Skeleton variant="rounded" height={40} />
    <Skeleton variant="rounded" height={48} />
  </Stack>
);

const BlogLeadCtaForm = dynamic(
  () => import('./blog-lead-cta-form').then((mod) => mod.BlogLeadCtaForm),
  { loading: FormSkeleton }
);

// ----------------------------------------------------------------------

/**
 * CTA de captura de lead exibido nas páginas do blog.
 * @param {string} origem - identifica a origem do lead (ex.: "Blog - slug").
 * @param {string} [titulo]
 * @param {string} [subtitulo]
 */
export function BlogLeadCta({
  origem = 'Blog',
  titulo = 'Fale com um contador especialista',
  subtitulo = 'Receba orientação contábil para a sua área. Deixe seus dados e entramos em contato.',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        my: 5,
        color: 'common.white',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main})`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:chat-square-call-bold" width={28} />
            <Typography variant="h5">{titulo}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {subtitulo}
          </Typography>
        </Stack>

        <Box sx={{ flex: 1.2, bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
          {mounted ? <BlogLeadCtaForm origem={origem} /> : <FormSkeleton />}
        </Box>
      </Stack>
    </Card>
  );
}
