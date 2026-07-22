import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { WaMedia } from './wa-media';

// ----------------------------------------------------------------------
// Ciclo de status (outbound, nunca regride):
// enviando → enviada → entregue → lida (ou falha). Inbound nasce `recebida`.
// ----------------------------------------------------------------------

const STATUS_ICON = {
  enviando: { icon: 'solar:clock-circle-outline', color: 'text.disabled' },
  enviada: { icon: 'eva:done-all-fill', color: 'text.disabled', single: true },
  entregue: { icon: 'eva:done-all-fill', color: 'text.disabled' },
  lida: { icon: 'eva:done-all-fill', color: 'info.main' },
  falha: { icon: 'solar:danger-triangle-bold', color: 'error.main' },
};

const MIDIA_TIPOS = ['image', 'audio', 'video', 'document', 'sticker'];

// ----------------------------------------------------------------------

function StatusCheck({ status }) {
  const cfg = STATUS_ICON[status];
  if (!cfg) return null;
  return (
    <Iconify
      icon={cfg.single ? 'eva:done-fill' : cfg.icon}
      width={14}
      sx={{ color: cfg.color, ml: 0.5, flexShrink: 0 }}
    />
  );
}

// ----------------------------------------------------------------------

export function WaMessageItem({ mensagem, onOpenLightbox }) {
  const me = mensagem.direcao === 'outbound';
  const temMidia = MIDIA_TIPOS.includes(mensagem.tipo) && mensagem.midia;
  const falhou = mensagem.status === 'falha';

  const quando = mensagem.timestampMeta || mensagem.createdAt;

  const renderInfo = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ mb: 0.5, ...(me ? { justifyContent: 'flex-end' } : {}) }}
    >
      <Typography noWrap variant="caption" sx={{ color: 'text.disabled' }}>
        {!me && mensagem.enviadaPor?.name ? `${mensagem.enviadaPor.name} · ` : ''}
        {quando ? fTime(quando) : ''}
      </Typography>
      {me && <StatusCheck status={mensagem.status} />}
    </Stack>
  );

  const renderTemplate = mensagem.tipo === 'template' && (
    <Stack spacing={0.5}>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
        <Iconify icon="solar:document-text-bold" width={14} />
        <Typography variant="caption">Template: {mensagem.template?.name}</Typography>
      </Stack>
      {mensagem.texto && <span>{mensagem.texto}</span>}
    </Stack>
  );

  const renderBody = (
    <Stack
      sx={{
        p: 1.5,
        minWidth: 48,
        maxWidth: 360,
        borderRadius: 1,
        typography: 'body2',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        bgcolor: 'background.neutral',
        ...(me && { color: 'grey.800', bgcolor: 'primary.lighter' }),
        ...(falhou && { bgcolor: 'error.lighter' }),
        ...(temMidia && { p: 0.5, bgcolor: 'transparent' }),
      }}
    >
      {temMidia ? (
        <Stack spacing={0.5}>
          <WaMedia mensagem={mensagem} onOpenLightbox={onOpenLightbox} />
          {mensagem.texto && (
            <Typography variant="body2" sx={{ px: 1 }}>
              {mensagem.texto}
            </Typography>
          )}
        </Stack>
      ) : mensagem.tipo === 'template' ? (
        renderTemplate
      ) : (
        mensagem.texto || <em style={{ opacity: 0.6 }}>({mensagem.tipo})</em>
      )}
    </Stack>
  );

  return (
    <Stack direction="row" justifyContent={me ? 'flex-end' : 'flex-start'} sx={{ mb: 2.5 }}>
      <Stack alignItems={me ? 'flex-end' : 'flex-start'} sx={{ maxWidth: '75%' }}>
        {renderInfo}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {renderBody}
          {falhou && (
            <Tooltip
              title={mensagem.erro?.title || mensagem.erro?.details || 'Falha no envio'}
            >
              <Iconify icon="solar:danger-triangle-bold" width={18} sx={{ color: 'error.main' }} />
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
