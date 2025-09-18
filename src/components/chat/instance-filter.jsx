import { useState } from 'react';
import {
  Box,
  Stack,
  Chip,
  Typography,
  useTheme,
} from '@mui/material';
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

export function InstanceFilter({ 
  selectedInstance, 
  onInstanceChange, 
  userRole = 'admin',
  showStats = false,
  stats 
}) {
  const theme = useTheme();

  const getInstanceChip = (instanceType, count) => {
    const config = INSTANCE_CONFIG[instanceType];
    
    return (
      <Chip
        key={instanceType}
        label={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Iconify icon={config.icon} width={16} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {config.name}
            </Typography>
            {showStats && count !== undefined && (
              <Typography variant="caption" sx={{ fontWeight: 400 }}>
                ({count})
              </Typography>
            )}
          </Stack>
        }
        variant={selectedInstance === instanceType ? 'filled' : 'outlined'}
        sx={{
          bgcolor: selectedInstance === instanceType ? config.bgColor : 'transparent',
          color: selectedInstance === instanceType ? config.textColor : 'text.secondary',
          borderColor: config.borderColor,
          '&:hover': {
            bgcolor: config.bgColor,
            color: config.textColor,
          },
        }}
        onClick={() => onInstanceChange(instanceType)}
      />
    );
  };

  return (
    <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Filtrar por Instância
        </Typography>
        
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify icon="eva:grid-fill" width={16} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Todas
                </Typography>
                {showStats && stats && (
                  <Typography variant="caption" sx={{ fontWeight: 400 }}>
                    ({(stats.operacional || 0) + (stats.financeiroComercial || 0)})
                  </Typography>
                )}
              </Stack>
            }
            variant={selectedInstance === 'all' ? 'filled' : 'outlined'}
            sx={{
              bgcolor: selectedInstance === 'all' ? theme.palette.primary.main : 'transparent',
              color: selectedInstance === 'all' ? 'white' : 'text.secondary',
              '&:hover': {
                bgcolor: theme.palette.primary.main,
                color: 'white',
              },
            }}
            onClick={() => onInstanceChange('all')}
          />
          
          {getInstanceChip('operacional', stats?.operacional)}
          {getInstanceChip('financeiro-comercial', stats?.financeiroComercial)}
        </Stack>
      </Stack>
    </Box>
  );
} 