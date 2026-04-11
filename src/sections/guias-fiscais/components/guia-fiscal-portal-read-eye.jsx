'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import {
  getClienteVisualizouEm,
  getLeiturasPortalItensAdmin,
  getUltimaLeituraPortalAdmin,
  clienteJaVisualizouDocumento,
} from '../guia-documento-visualizacao';

// ----------------------------------------------------------------------

function buildTooltipTitle(guia) {
  const visto = clienteJaVisualizouDocumento(guia);
  if (!visto) {
    return 'Nenhum usuário do portal registrou visualização ou download deste documento.';
  }

  const itens = getLeiturasPortalItensAdmin(guia);
  if (itens.length > 0) {
    return itens
      .map((row) => (row.vistoEm ? `${row.label} — ${fDate(row.vistoEm)}` : `${row.label}`))
      .join('\n');
  }

  const em = getClienteVisualizouEm(guia);
  if (em) {
    return `Visualização registrada em ${fDate(em)}.\n(A API não retornou a lista de usuários; veja o detalhe do documento quando disponível.)`;
  }

  return 'Visualização registrada no portal, sem data ou usuário na resposta da API.';
}

function buildInlineCaption(guia) {
  const r = getUltimaLeituraPortalAdmin(guia);
  if (!r.visto) return null;

  let line = '';
  if (r.nome && r.em) line = `${r.nome} · ${fDate(r.em)}`;
  else if (r.nome) line = r.nome;
  else if (r.em) line = fDate(r.em);

  if (r.totalLeituras > 1) {
    const suffix = ` (+${r.totalLeituras - 1})`;
    line = line ? `${line}${suffix}` : `${r.totalLeituras} leituras no portal`;
  }

  return line || null;
}

/**
 * Ícone de olho (admin): verde = visto no portal, vermelho = não visto. Tooltip com usuário(s) e data(s).
 * @param {object} props
 * @param {boolean} [props.showInlineSummary] — nome · data ao lado do ícone quando a API enviar dados
 */
export function GuiaFiscalPortalReadEye({ guia, iconWidth = 22, showInlineSummary = false }) {
  const visto = clienteJaVisualizouDocumento(guia);
  const title = buildTooltipTitle(guia);
  const caption = showInlineSummary ? buildInlineCaption(guia) : null;

  return (
    <Tooltip
      title={title}
      slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 380 } } }}
    >
      <Stack
        component="span"
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          cursor: 'default',
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        {caption ? (
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            title={caption}
            sx={{
              lineHeight: 1.2,
              minWidth: 0,
              maxWidth: showInlineSummary ? { xs: 100, sm: 160, md: 200 } : 'none',
              textAlign: 'right',
            }}
          >
            {caption}
          </Typography>
        ) : null}

        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: visto ? 'success.main' : 'error.main',
            lineHeight: 0,
            flexShrink: 0,
          }}
          aria-label={visto ? 'Visualizado no portal' : 'Não visualizado no portal'}
        >
          <Iconify icon="solar:eye-bold" width={iconWidth} />
        </Box>
      </Stack>
    </Tooltip>
  );
}
