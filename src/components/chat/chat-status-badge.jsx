import { Stack, Chip } from '@mui/material';
import { InstanceBadge } from './instance-badge';

const STATUS_CONFIG = {
  na_fila: {
    label: 'Na Fila',
    color: 'warning',
    sx: { bgcolor: '#FEF3C7', color: '#92400E' }
  },
  em_atendimento: {
    label: 'Em Atendimento',
    color: 'success',
    sx: { bgcolor: '#D1FAE5', color: '#065F46' }
  },
  fechado: {
    label: 'Fechado',
    color: 'default',
    sx: { bgcolor: '#F3F4F6', color: '#374151' }
  },
  pausado: {
    label: 'Pausado',
    color: 'error',
    sx: { bgcolor: '#FEE2E2', color: '#991B1B' }
  }
};

export function ChatStatusBadge({ status, instanceType, size = 'small' }) {
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.fechado;
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={statusConfig.label}
        size={size}
        sx={{
          ...statusConfig.sx,
          fontWeight: 600,
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        }}
      />
      {instanceType && <InstanceBadge instanceType={instanceType} size={size} />}
    </Stack>
  );
} 