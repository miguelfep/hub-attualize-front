import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { SelectContaContabil } from 'src/components/plano-contas';

/**
 * Componente para exibir transação confirmada
 * Status: confirmada
 * Cor: Verde
 * Ação: Apenas visualização
 */
export default function TransacaoConfirmada({
  transacao,
  clienteId,
  onAlterarConta,
  alterandoConta = false,
}) {
  // ✅ Adaptar para estrutura da API - transação pode vir direto ou dentro de transacaoImportada
  const transacaoData = transacao.transacaoImportada || transacao;
  const contaContabil = transacao.contaContabil || transacao.contaContabilId || transacao.contaSugerida;
  const transacaoId = transacao._id || transacao.transacaoImportadaId || transacaoData._id;
  const [contaSelecionada, setContaSelecionada] = useState(
    typeof contaContabil === 'object' ? contaContabil._id : contaContabil || ''
  );

  const contaLabel = useMemo(() => {
    if (!contaContabil) return 'Não informada';
    if (typeof contaContabil === 'object') {
      return contaContabil.nome || contaContabil.descricao || 'Conta selecionada';
    }
    return 'Conta selecionada';
  }, [contaContabil]);

  useEffect(() => {
    setContaSelecionada(typeof contaContabil === 'object' ? contaContabil._id : contaContabil || '');
  }, [contaContabil]);

  const handleSalvar = async () => {
    if (!onAlterarConta || !transacaoId || !contaSelecionada) return;
    await onAlterarConta(transacaoId, contaSelecionada);
  };

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
        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="eva:book-fill" color="success.main" width={16} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Conta Contábil:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {contaLabel}
                  {typeof contaContabil === 'object' && (contaContabil.codigo || contaContabil.codigoSequencial) && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({contaContabil.codigo || contaContabil.codigoSequencial})
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Stack>
            {clienteId && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <SelectContaContabil
                    clienteId={clienteId}
                    value={contaSelecionada}
                    onChange={(novaConta) => setContaSelecionada(novaConta || '')}
                    descricaoTransacao={transacaoData.descricao || ''}
                    transacaoTipo={transacaoData.tipo}
                    label="Alterar conta contábil"
                    size="small"
                  />
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={handleSalvar}
                  disabled={!transacaoId || !contaSelecionada || alterandoConta}
                  startIcon={alterandoConta ? <CircularProgress size={14} /> : <Iconify icon="eva:save-fill" />}
                >
                  {alterandoConta ? 'Salvando...' : 'Salvar conta'}
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
