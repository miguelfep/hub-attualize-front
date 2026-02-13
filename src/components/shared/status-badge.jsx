import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

/**
 * Badge de status genérico e reutilizável
 * Baseado na documentação FRONTEND_IMPLEMENTATION_GUIDE.md
 */
export function StatusBadge({ status, config }) {
  const statusData = config[status] || {
    label: status,
    color: 'default',
    icon: '❓',
  };

  const colorStyles = {
    default: {
      bgcolor: 'grey.200',
      color: 'grey.800',
      borderColor: 'grey.300',
    },
    yellow: {
      bgcolor: 'warning.lighter',
      color: 'warning.darker',
      borderColor: 'warning.main',
    },
    blue: {
      bgcolor: 'info.lighter',
      color: 'info.darker',
      borderColor: 'info.main',
    },
    purple: {
      bgcolor: 'secondary.lighter',
      color: 'secondary.darker',
      borderColor: 'secondary.main',
    },
    green: {
      bgcolor: 'success.lighter',
      color: 'success.darker',
      borderColor: 'success.main',
    },
    red: {
      bgcolor: 'error.lighter',
      color: 'error.darker',
      borderColor: 'error.main',
    },
    orange: {
      bgcolor: 'warning.lighter',
      color: 'warning.darker',
      borderColor: 'warning.main',
    },
  };

  const style = colorStyles[statusData.color] || colorStyles.default;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        border: '1px solid',
        ...style,
      }}
    >
      <Typography variant="caption" component="span">
        {statusData.icon}
      </Typography>
      <Typography variant="caption" component="span" fontWeight="medium">
        {statusData.label}
      </Typography>
    </Box>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  config: PropTypes.objectOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      color: PropTypes.oneOf(['default', 'yellow', 'blue', 'purple', 'green', 'red', 'orange'])
        .isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// ----------------------------------------------------------------------

/**
 * Configurações pré-definidas para Status de Indicação
 */
export const INDICACAO_STATUS_CONFIG = {
  pendente: {
    label: 'Aguardando Contato',
    color: 'yellow',
    icon: '⏳',
  },
  contato_iniciado: {
    label: 'Em Contato',
    color: 'blue',
    icon: '📞',
  },
  em_negociacao: {
    label: 'Negociando',
    color: 'purple',
    icon: '🔄',
  },
  fechado: {
    label: 'Fechado - Aguardando Pagamento',
    color: 'orange',
    icon: '✅',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'green',
    icon: '✅',
  },
  recusado: {
    label: 'Não Converteu',
    color: 'red',
    icon: '❌',
  },
};

/**
 * Configurações pré-definidas para Status de Transação
 */
export const TRANSACAO_STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    color: 'yellow',
    icon: '⏳',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'green',
    icon: '✅',
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'red',
    icon: '❌',
  },
  processado: {
    label: 'Processado',
    color: 'blue',
    icon: '✅',
  },
};

/**
 * Configurações pré-definidas para Tipo de Transação
 */
export const TRANSACAO_TIPO_CONFIG = {
  recompensa: {
    label: 'Recompensa',
    color: 'green',
    icon: '💰',
  },
  desconto: {
    label: 'Desconto',
    color: 'blue',
    icon: '🎫',
  },
  pix: {
    label: 'PIX',
    color: 'purple',
    icon: '💳',
  },
  estorno: {
    label: 'Estorno',
    color: 'orange',
    icon: '↩️',
  },
};
