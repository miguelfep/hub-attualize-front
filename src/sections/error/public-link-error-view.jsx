'use client';

import { alpha } from '@mui/material/styles';
import { Box, Card, Stack, Button, Container, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const WHATSAPP_NUMBER = '554196982267';

/**
 * Página de erro para links públicos (fatura, proposta, abertura, alteração...).
 * Mantém a identidade visual da Attualize e oferece saídas úteis ao cliente.
 */
export function PublicLinkErrorView({
  headerSubtitle,
  icon = 'solar:danger-triangle-bold',
  title,
  description,
  whatsappMessage,
  onRetry,
}) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Faixa superior com identidade */}
      <Box
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(
            theme.palette.primary.main,
            0.01
          )})`,
        })}
      >
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box component="img" alt="Attualize" src="/logo/hub-tt.png" sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                Attualize Contábil
              </Typography>
              {headerSubtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {headerSubtitle}
                </Typography>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 10 } }}>
        <Card
          variant="outlined"
          sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', maxWidth: 560, mx: 'auto', borderRadius: 2 }}
        >
          <Box
            sx={(theme) => ({
              width: 72,
              height: 72,
              mx: 'auto',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.warning.main, 0.12),
            })}
          >
            <Iconify icon={icon} width={36} sx={{ color: 'warning.main' }} />
          </Box>

          <Typography variant="h4" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            {description}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            {onRetry && (
              <Button
                variant="contained"
                size="large"
                onClick={onRetry}
                startIcon={<Iconify width={18} icon="solar:refresh-bold" />}
                sx={{ minHeight: 48 }}
              >
                Tentar novamente
              </Button>
            )}
            <Button
              variant="outlined"
              color="success"
              size="large"
              component="a"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Iconify width={18} icon="mdi:whatsapp" />}
              sx={{ minHeight: 48 }}
            >
              Falar com atendimento
            </Button>
          </Stack>

          <Button
            component={RouterLink}
            href="/"
            color="inherit"
            startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            Voltar para o site
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
