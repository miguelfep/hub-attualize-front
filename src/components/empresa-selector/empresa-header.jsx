import { Box, Chip, Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function EmpresaHeader({ empresaAtivaData, temMultiplasEmpresas }) {
  if (!empresaAtivaData) return null;

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.neutral', 
      borderRadius: 1,
      border: 1,
      borderColor: 'divider'
    }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Iconify 
          icon="solar:buildings-bold" 
          width={24} 
          sx={{ color: 'primary.main' }} 
        />
        
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {empresaAtivaData.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCNPJ(empresaAtivaData.cnpj)}
          </Typography>
        </Stack>

        {temMultiplasEmpresas && (
          <Chip
            label="Múltiplas Empresas"
            color="info"
            size="small"
            startIcon={<Iconify icon="eva:arrow-downward-fill" />}
          />
        )}
      </Stack>
    </Box>
  );
}
