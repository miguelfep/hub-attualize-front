import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

/**
 * Componente para exibir transação confirmada
 * Status: confirmada
 * Cor: Verde
 * Ação: Apenas visualização
 */
export default function TransacaoConfirmada({ transacao }) {
  // ✅ Adaptar para estrutura da API - transação pode vir direto ou dentro de transacaoImportada
  const transacaoData = transacao.transacaoImportada || transacao;
  const contaContabil = transacao.contaContabil || transacao.contaContabilId;
  
  return (
    <Card
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: 'success.main',
        bgcolor: 'success.lighter',
        opacity: 0.9,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" color="success.main" width={20} />
            <Chip label="Conciliada" color="success" size="small" />
          </Stack>
          {transacaoData.data && (
            <Typography variant="caption" color="text.secondary">
              {new Date(transacaoData.data).toLocaleDateString('pt-BR')}
            </Typography>
          )}
        </Stack>

        {/* Descrição */}
        <Typography variant="body2" fontWeight="medium">
          {transacaoData.descricao || 'N/A'}
        </Typography>

        {/* Valor e Tipo */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold" color={transacaoData.tipo === 'credito' ? 'success.main' : 'error.main'}>
            {transacaoData.tipo === 'credito' ? '+' : '-'} R$ {parseFloat(transacaoData.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Chip 
            label={transacaoData.tipo === 'credito' ? 'Crédito' : 'Débito'} 
            color={transacaoData.tipo === 'credito' ? 'success' : 'error'} 
            size="small" 
            variant="outlined"
          />
        </Stack>

        {/* Conta Contábil */}
        {contaContabil && (
          <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:book-fill" color="success.main" width={16} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Conta Contábil:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {typeof contaContabil === 'object' ? contaContabil.nome : 'Conta selecionada'}
                  {typeof contaContabil === 'object' && contaContabil.codigo && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({contaContabil.codigo})
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
