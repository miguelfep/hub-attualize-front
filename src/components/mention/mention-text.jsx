import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

// Casa `@handle` (token único: letras, números, ponto, hífen, underscore).
const MENTION_SPLIT = /(@[\p{L}\p{N}._-]+)/gu;
const MENTION_MATCH = /^@[\p{L}\p{N}._-]+$/u;

/**
 * Renderiza um texto destacando as menções `@handle`.
 *
 * @param {object} props
 * @param {string} props.text
 */
export function MentionText({ text = '' }) {
  if (!text) return null;

  return text.split(MENTION_SPLIT).map((part, i) =>
    MENTION_MATCH.test(part) ? (
      <Box
        key={i}
        component="span"
        sx={{ color: 'primary.main', fontWeight: 'fontWeightSemiBold' }}
      >
        {part}
      </Box>
    ) : (
      <Box key={i} component="span">
        {part}
      </Box>
    )
  );
}
