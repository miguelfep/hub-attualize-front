import { keyframes } from '@mui/material/styles';

/**
 * Tokens de design compartilhados do dashboard (dash-2).
 * Mantém fontes, cores, sombras e animações padronizadas.
 */

export const CARD = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'grey.200',
  bgcolor: 'background.paper',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderColor: 'grey.300',
  },
};

export const CARD_HEADER = {
  title: { fontSize: '0.875rem', fontWeight: 700 },
  subheader: { fontSize: '0.7rem' },
  py: 1,
  px: 2,
};

const fadeInUpKeyframes = keyframes`
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
`;

/** Animação de entrada suave (crescimento + fade) - use em sx */
export const ANIMATION_FADE_IN_UP = {
  animation: `${fadeInUpKeyframes} 0.75s ease-in-out forwards`,
};

/** Delays para stagger (0, 50, 100, 150 ms) */
export const staggerDelay = (i) => `${i * 50}ms`;
