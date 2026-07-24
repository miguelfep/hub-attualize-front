import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ICONE_POR_TIPO = {
  tarefa_mencionada: 'solar:chat-round-line-bold',
  tarefa_mencao: 'solar:chat-round-line-bold',
  tarefa_atribuicao: 'solar:clipboard-check-bold',
  tarefa_prazo: 'solar:clock-circle-bold',
  tarefa_prazo_digest: 'solar:clock-circle-bold',
  // Leads
  lead_responsavel_mudou: 'solar:user-check-bold',
  lead_atribuicao: 'solar:user-check-bold',
  lead_prazo_vencimento: 'solar:clock-circle-bold',
  lead_prazo_digest: 'solar:clock-circle-bold',
  // Chat interno
  chat_mencao: 'solar:chat-round-line-bold',
  chat_dm: 'solar:user-rounded-bold',
  chat_thread: 'solar:chat-line-bold',
  // Fila DCTFWeb (emissão de guias)
  dctfweb_lote_finalizado: 'solar:document-bold',
};

/** Ícone correspondente ao tipo de notificação (reusado fora do drawer). */
export function iconeNotificacao(tipo) {
  return ICONE_POR_TIPO[tipo] || 'solar:bell-bold';
}

// ----------------------------------------------------------------------

/**
 * Item de notificação in-app de tarefas.
 *
 * @param {object}   props
 * @param {object}   props.notification  { _id, tipo, titulo, mensagem, lida, createdAt, tarefa }
 * @param {(n: object) => void} props.onClick
 * @param {(n: object) => void} [props.onToggleRead]  alterna lida/não lida sem navegar
 */
export function NotificationItem({ notification, onClick, onToggleRead }) {
  const { tipo, titulo, mensagem, lida, createdAt } = notification;
  const naoLida = !lida;

  const renderAvatar = (
    <ListItemAvatar>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          color: 'primary.main',
          bgcolor: 'background.neutral',
        }}
      >
        <Iconify icon={ICONE_POR_TIPO[tipo] || 'solar:bell-bold'} width={22} />
      </Stack>
    </ListItemAvatar>
  );

  return (
    <ListItemButton
      onClick={() => onClick?.(notification)}
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
      }}
    >
      {naoLida && (
        <Box
          sx={{
            top: 18,
            width: 8,
            height: 8,
            right: 44,
            borderRadius: '50%',
            bgcolor: 'info.main',
            position: 'absolute',
          }}
        />
      )}

      {renderAvatar}

      <ListItemText
        disableTypography
        primary={
          <Typography variant="subtitle2" sx={{ mb: 0.25, pr: 4 }}>
            {titulo}
          </Typography>
        }
        secondary={
          <>
            {mensagem && (
              <Typography
                variant="body2"
                component="div"
                sx={{ color: 'text.secondary', mb: 0.5 }}
                noWrap
              >
                {mensagem}
              </Typography>
            )}
            <Typography variant="caption" component="div" sx={{ color: 'text.disabled' }}>
              {fToNow(createdAt)}
            </Typography>
          </>
        }
      />

      {onToggleRead && (
        <Tooltip title={naoLida ? 'Marcar como lida' : 'Marcar como não lida'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(notification);
            }}
            sx={{ position: 'absolute', top: 12, right: 12 }}
          >
            <Iconify
              width={18}
              icon={naoLida ? 'solar:check-read-line-duotone' : 'solar:bell-bing-line-duotone'}
            />
          </IconButton>
        </Tooltip>
      )}
    </ListItemButton>
  );
}
