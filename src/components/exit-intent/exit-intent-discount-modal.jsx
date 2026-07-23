'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { usePathname } from 'src/routes/hooks';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { CONFIG } from 'src/config-global';
import { criarLead } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { PhoneInput } from 'src/components/phone-input';

const DISCOUNT_CODE = 'ATTUALIZE10';
const SESSION_KEY_SHOWN = 'attualize_exit_intent_shown_v1';
const STORAGE_KEY_CONVERTED = 'attualize_exit_intent_converted_v1';
const STORAGE_KEY_NEXT_ALLOWED_AT = 'attualize_exit_intent_next_allowed_at_v1';
const MIN_TIME_ON_PAGE_MS = 30000;
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

// O exit-intent é ferramenta de CAPTAÇÃO: só aparece em páginas de marketing/conteúdo
// (allowlist). Páginas transacionais — orçamento, fatura, fluxos de abertura/alteração
// contratados, dashboard, portal — nunca exibem: cliente com proposta fechada veria a
// oferta e pediria desconto sobre algo já negociado.
const ALLOWED_EXACT = ['/', '/sobre'];

const ALLOWED_PREFIXES = [
  '/contabilidade-para-', // todas as landings de especialidade
  '/fale-conosco',
  '/blog',
  '/post',
  '/faqs',
  '/abertura', // wizard público de captação (inclui /abertura-cnpj-psicologo)
  '/aulao-reforma',
  '/como-instalar-certificado-digital',
  '/imposto-de-renda',
  '/jornada-defina',
  '/medpass',
];

const normalizePath = (pathname) => {
  const semBarraFinal = String(pathname || '/').replace(/\/+$/, '');
  return semBarraFinal === '' ? '/' : semBarraFinal;
};

const isAllowedPath = (pathname) => {
  const path = normalizePath(pathname);
  if (ALLOWED_EXACT.includes(path)) return true;
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const MODAL_VARIANTS = [
  {
    id: 'estetica',
    match: (pathname) => pathname.startsWith('/contabilidade-para-clinicas-de-estetica'),
    badge: 'Oferta para Estetica',
    title: 'Condicao especial para clinicas de estetica',
    subtitle: 'Receba um beneficio exclusivo em servicos contabeis para seu nicho.',
    code: 'ESTETICA15',
    serviceOffer: 'Diagnostico fiscal inicial para clinicas de estetica',
  },
  {
    id: 'psicologos',
    match: (pathname) => pathname.startsWith('/contabilidade-para-psicologos'),
    badge: 'Oferta para Psicologos',
    title: 'Beneficio especial para psicologos',
    subtitle: 'Aproveite um codigo exclusivo para iniciar com suporte contabil especializado.',
    code: 'PSICO12',
    serviceOffer: 'Consultoria inicial para psicologos e clinicas',
  },
  {
    id: 'saude',
    match: (pathname) =>
      pathname.startsWith('/contabilidade-para-negocios-da-area-da-saude') ||
      pathname.startsWith('/contabilidade-para-medicos') ||
      pathname.startsWith('/contabilidade-para-dentistas') ||
      pathname.startsWith('/contabilidade-para-fisioterapeutas') ||
      pathname.startsWith('/contabilidade-para-nutricionistas') ||
      pathname.startsWith('/contabilidade-para-fonoaudiologos') ||
      pathname.startsWith('/contabilidade-para-terapeutas'),
    badge: 'Oferta para Area da Saude',
    title: 'Desconto especial para profissionais da saude',
    subtitle: 'Receba condicoes exclusivas e atendimento especializado para o seu perfil.',
    code: 'SAUDE10',
    serviceOffer: 'Raio-X tributario para profissionais de saude',
  },
];

const DEFAULT_VARIANT = {
  id: 'geral',
  badge: 'Oferta especial',
  title: 'Espere! Garantimos desconto para voce.',
  subtitle: 'Deixe seus dados e receba o codigo exclusivo agora.',
  code: DISCOUNT_CODE,
  serviceOffer: 'Condicao especial na contratacao de servicos Attualize',
};

const getVariantByPath = (pathname) =>
  MODAL_VARIANTS.find((variant) => variant.match(pathname)) || DEFAULT_VARIANT;

export function ExitIntentDiscountModal() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [values, setValues] = useState({ nome: '', email: '', telefone: '' });

  const isEligiblePage = useMemo(() => {
    if (!pathname) return false;
    return isAllowedPath(pathname);
  }, [pathname]);

  const variant = useMemo(() => getVariantByPath(pathname || '/'), [pathname]);

  const handleClose = useCallback(() => {
    setOpen(false);

    // Se fechou sem converter, respeita um intervalo maior para evitar incômodo.
    if (!leadCaptured && typeof window !== 'undefined') {
      const nextAllowedAt = String(Date.now() + DISMISS_COOLDOWN_MS);
      localStorage.setItem(STORAGE_KEY_NEXT_ALLOWED_AT, nextAllowedAt);
    }
  }, [leadCaptured]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(variant.code);
      toast.success('Codigo copiado!');
    } catch (_error) {
      toast.error('Nao foi possivel copiar o codigo.');
    }
  }, [variant.code]);

  const handleChange = useCallback(
    (field) => (event) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const nome = values.nome.trim();
      const email = values.email.trim();
      const telefone = values.telefone.trim();

      if (!nome || !email || !telefone) {
        toast.error('Preencha nome, email e WhatsApp.');
        return;
      }

      setSubmitting(true);

      try {
        const fullUrl = window.location.href;

        await criarLead({
          nome,
          email,
          telefone: normalizePhoneToE164(telefone) ?? telefone,
          origem: `exit-intent:${variant.id}:${pathname}`,
          paginasVisitadas: [pathname],
          additionalInfo: {
            paginaSaida: pathname,
            urlCompletaSaida: fullUrl,
            tipoCaptura: 'exit-intent-modal',
            codigoDescontoOferecido: variant.code,
            segmentoOferta: variant.id,
            ofertaServico: variant.serviceOffer,
          },
        });

        localStorage.setItem(STORAGE_KEY_CONVERTED, '1');
        setLeadCaptured(true);
        setValues({ nome: '', email: '', telefone: '' });
        toast.success('Perfeito! Enviamos seu codigo de desconto.');
      } catch (error) {
        console.error('Erro ao salvar lead de saida:', error);
        toast.error(typeof error === 'string' ? error : 'Nao foi possivel registrar seus dados.');
      } finally {
        setSubmitting(false);
      }
    },
    [pathname, values, variant]
  );

  useEffect(() => {
    if (!isEligiblePage) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (leadCaptured) return undefined;
    if (sessionStorage.getItem(SESSION_KEY_SHOWN) === '1') return undefined;
    if (localStorage.getItem(STORAGE_KEY_CONVERTED) === '1') return undefined;
    const now = Date.now();
    const nextAllowedAt = Number(localStorage.getItem(STORAGE_KEY_NEXT_ALLOWED_AT) || '0');
    if (nextAllowedAt > now) return undefined;

    const pageEnterAt = now;

    const onMouseOut = (event) => {
      if (event.relatedTarget || event.toElement) return;
      if (event.clientY > 8) return;
      if (Date.now() - pageEnterAt < MIN_TIME_ON_PAGE_MS) return;

      sessionStorage.setItem(SESSION_KEY_SHOWN, '1');
      localStorage.setItem(STORAGE_KEY_NEXT_ALLOWED_AT, String(Date.now() + DISMISS_COOLDOWN_MS));
      setOpen(true);
    };

    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, [isEligiblePage, leadCaptured]);

  if (!isEligiblePage) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      {!leadCaptured ? (
        <>
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 170, sm: 200 },
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={`${CONFIG.site.basePath}/assets/images/home/home-principal.webp`}
                alt="Oferta especial Attualize"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: 1,
                  height: 1,
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(120deg, rgba(12, 16, 32, 0.86) 0%, rgba(12, 16, 32, 0.4) 60%, rgba(12, 16, 32, 0.15) 100%)',
                }}
              />
              <Stack
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 2.5, sm: 3 },
                  height: 1,
                  color: 'common.white',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    mb: 1,
                    width: 'fit-content',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  {variant.badge}
                </Typography>

                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {variant.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.92 }}>
                  {variant.subtitle}
                </Typography>
              </Stack>
            </Box>

            <Stack spacing={2} sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  border: (theme) => `1px dashed ${theme.vars.palette.primary.main}`,
                  bgcolor: (theme) => theme.vars.palette.primary.lighter,
                }}
              >
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                  Seu codigo:
                  {' '}
                  <strong>{variant.code}</strong>
                </Typography>
                <Button size="small" variant="contained" onClick={handleCopyCode}>
                  Copiar codigo
                </Button>
              </Stack>

              <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome"
                  required
                  value={values.nome}
                  onChange={handleChange('nome')}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="E-mail"
                  required
                  value={values.email}
                  onChange={handleChange('email')}
                />
                <PhoneInput
                  country="BR"
                  label="WhatsApp"
                  size="small"
                  value={normalizePhoneToE164(values.telefone) || undefined}
                  onChange={(newValue) =>
                    setValues((prev) => ({ ...prev, telefone: newValue ?? '' }))
                  }
                  fullWidth
                  required
                />
                <LoadingButton type="submit" variant="contained" loading={submitting}>
                  Receber desconto
                </LoadingButton>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {variant.serviceOffer}. Atendimento comercial em horario util. Sem spam.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Fechar
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                color: 'common.white',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main})`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Desconto liberado!
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.92 }}>
                Seu lead foi registrado com sucesso.
              </Typography>
            </Box>

            <Stack spacing={1.25} sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary">
                Use o codigo abaixo no atendimento com nosso time:
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ letterSpacing: 1.2 }}>
                  {variant.code}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} variant="contained">
              Entendi
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
