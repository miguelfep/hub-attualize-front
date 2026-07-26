import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { fToNow } from 'src/utils/format-time';

// ----------------------------------------------------------------------
// Termômetro do cliente: sentimento inferido por IA ao concluir cada
// atendimento (fica no contato). Exibido como emoji com tooltip do motivo.
// ----------------------------------------------------------------------

export const TERMOMETRO_OPCOES = [
  { value: 'feliz', emoji: '😊', label: 'Feliz' },
  { value: 'neutro', emoji: '😐', label: 'Neutro' },
  { value: 'bravo', emoji: '😠', label: 'Bravo' },
];

const porNivel = (nivel) => TERMOMETRO_OPCOES.find((o) => o.value === nivel);

export function WaTermometro({ termometro, size = 16, sx }) {
  const opcao = porNivel(termometro?.nivel);
  if (!opcao) return null;

  const detalhes = [
    `${opcao.label} (${termometro.score}/100)`,
    termometro.resumo,
    termometro.atualizadoEm ? `Atualizado ${fToNow(termometro.atualizadoEm)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tooltip title={detalhes}>
      <Box component="span" sx={{ fontSize: size, lineHeight: 1, cursor: 'default', ...sx }}>
        {opcao.emoji}
      </Box>
    </Tooltip>
  );
}
