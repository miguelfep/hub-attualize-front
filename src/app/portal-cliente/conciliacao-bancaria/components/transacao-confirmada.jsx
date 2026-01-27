import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

/**
 * Componente para exibir transação confirmada
 * Status: confirmada
 * Cor: Verde
 * Ação: Apenas visualização
 */
export default function TransacaoConfirmada({ transacao }) {
  const matchScore = transacao.matchScore || 0;
  const scorePercent = (matchScore * 100).toFixed(0);

  return (
    <Card
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: 'success.main',
        bgcolor: 'success.lighter',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" color="success.main" width={24} />
            <Chip label="Confirmada" color="success" size="small" />
          </Stack>
          
          <Chip
            label={`Score: ${scorePercent}%`}
            color="success"
            variant="outlined"
            size="small"
          />
        </Stack>

        {/* Detalhes da Transação Importada */}
        {transacao.transacaoImportada && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📄 Transação do Extrato
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Descrição:</strong> {transacao.transacaoImportada.descricao || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Valor:</strong>{' '}
                <span
                  style={{
                    color:
                      transacao.transacaoImportada.tipo === 'credito'
                        ? '#10b981'
                        : '#ef4444',
                  }}
                >
                  {transacao.transacaoImportada.tipo === 'credito' ? '+' : '-'}{' '}
                  {fCurrency(transacao.transacaoImportada.valor || 0)}
                </span>
              </Typography>
              {transacao.transacaoImportada.data && (
                <Typography variant="body2">
                  <strong>Data:</strong>{' '}
                  {new Date(transacao.transacaoImportada.data).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {/* Match com Transação Existente */}
        {transacao.transacaoExistente && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ✅ Match com Transação Existente
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Descrição:</strong> {transacao.transacaoExistente.descricao || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Valor:</strong> {fCurrency(transacao.transacaoExistente.valor || 0)}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Motivo da Confirmação */}
        {transacao.motivo && (
          <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Motivo da Confirmação:
            </Typography>
            <Typography variant="body2" mt={0.5}>
              {transacao.motivo}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
