import { Chip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const INSTANCE_CONFIG = {
  operacional: {
    name: 'Operacional',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    borderColor: '#93C5FD',
    icon: 'eva:settings-fill',
  },
  'financeiro-comercial': {
    name: 'Financeiro/Comercial',
    color: '#10B981',
    bgColor: '#ECFDF5',
    textColor: '#047857',
    borderColor: '#6EE7B7',
    icon: 'eva:credit-card-fill',
  }
};

export function InstanceBadge({ 
  instanceType, 
  size = 'small', 
  variant = 'filled' 
}) {
  const config = INSTANCE_CONFIG[instanceType];
  
  return (
    <Chip
      icon={<Iconify icon={config.icon} width={12} />}
      label={config.name}
      size={size}
      variant={variant}
      sx={{
        bgcolor: variant === 'filled' ? config.bgColor : 'transparent',
        color: variant === 'filled' ? config.textColor : config.color,
        borderColor: config.borderColor,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
    />
  );
} 