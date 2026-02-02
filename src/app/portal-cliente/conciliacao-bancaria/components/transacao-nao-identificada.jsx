import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { SelectContaContabil } from 'src/components/plano-contas';

/**
 * Componente para exibir transação não identificada
 * Status: nao_identificada
 * Cor: Vermelho
 * Ação: Ver sugestão baseada em histórico e aceitar/editar
 */
export default function TransacaoNaoIdentificada({ 
  transacao, 
  onConfirmar, 
  clienteId,
  onContaChange, // 🔥 NOVO: Callback quando conta muda
  autoConfirm, // 🔥 NOVO: Flag para confirmar automaticamente
}) {
  // Estado para conta contábil selecionada (inicializar com sugestão se houver)
  const [contaContabilId, setContaContabilId] = useState(
    transacao.contaSugerida?._id || ''
  );
  const [confirmando, setConfirmando] = useState(false);

  // 🔥 NOVO: Notificar mudança de conta
  const handleContaChange = (novaConta) => {
    setContaContabilId(novaConta);
    if (onContaChange) {
      onContaChange(transacao._id || transacao.transacaoImportadaId, novaConta);
    }
  };

  // 🔥 NOVO: Auto-confirmar se flag estiver ativa e tiver conta
  useEffect(() => {
    if (autoConfirm && contaContabilId && !confirmando) {
      const transacaoId = transacao._id || transacao.transacaoImportadaId;
      if (transacaoId && contaContabilId) {
        onConfirmar(transacaoId, null, contaContabilId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConfirm]);

  const handleConfirmar = () => {
    const transacaoId = transacao._id || transacao.transacaoImportadaId;
    
    if (!transacaoId) {
      alert('ID da transação não encontrado');
      return;
    }

    if (!contaContabilId) {
      alert('Por favor, selecione uma conta contábil');
      return;
    }

    if (confirmando) return; // Prevenir múltiplas confirmações

    setConfirmando(true);

    // Confirmar sem match (vai criar nova transação)
    // contaContabilId é OBRIGATÓRIO
    onConfirmar(transacaoId, null, contaContabilId);
  };

  const handleEditarManualmente = () => {
    alert('Funcionalidade de edição manual ainda não implementada');
    // TODO: Abrir dialog para editar manualmente
  };

  return (
    <Card
      sx={{
        p: 1.5,
        mb: 1,
        borderLeft: 3,
        borderColor: 'error.main',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: 2,
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Linha 1: Header + Valor + Data */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={1} flex={1} minWidth={200}>
            <Iconify icon="eva:question-mark-circle-fill" color="error.main" width={20} />
            <Chip label="Não Identificada" color="error" size="small" sx={{ height: 24 }} />
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold',
                color: transacao.tipo === 'credito' ? 'success.main' : 'error.main',
              }}
            >
              {transacao.tipo === 'credito' ? '+' : '-'} {fCurrency(transacao.valor || 0)}
            </Typography>
            {transacao.data && (
              <Typography variant="caption" color="text.secondary">
                {new Date(transacao.data).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </Typography>
            )}
          </Stack>
        </Stack>

        {/* Linha 2: Descrição */}
        <Typography 
          variant="body2" 
          sx={{ 
            wordBreak: 'break-word',
            color: 'text.primary',
            fontSize: '0.875rem',
            lineHeight: 1.4,
          }}
        >
          {transacao.descricao || 'N/A'}
        </Typography>

        {/* Linha 3: Sugestão (se houver) */}
        {/* ✅ Sugestão já vem salva na resposta (gerada durante upload, não ao buscar) */}
        {transacao.contaSugerida && (
          <Box
            sx={{
              p: 1,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Iconify icon="eva:trending-up-fill" color="info.main" width={16} />
              <Typography variant="caption" color="info.dark" fontWeight="bold">
                Sugestão:
              </Typography>
              <Typography variant="caption" fontFamily="monospace" fontWeight="bold">
                {transacao.contaSugerida.codigoSequencial || transacao.contaSugerida.codigo}
              </Typography>
              {transacao.contaSugerida.classificacao && (
                <Chip 
                  label={transacao.contaSugerida.classificacao}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {transacao.contaSugerida.nome}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Linha 4: Seleção de Conta + Botão */}
        <Stack spacing={1.5}>
          <Box>
            <SelectContaContabil
              clienteId={clienteId}
              value={contaContabilId}
              onChange={handleContaChange}
              descricaoTransacao={transacao.descricao || ''}
              transacaoTipo={transacao.tipo}
              label="Conta contábil"
              contaSugeridaId={transacao.contaSugerida?._id}
              required
              size="small"
            />
          </Box>

          {/* Botão de confirmação - sempre visível */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            fullWidth
            onClick={handleConfirmar}
            startIcon={<Iconify icon="eva:checkmark-fill" width={16} />}
            disabled={!contaContabilId || confirmando}
            sx={{ 
              minWidth: 120,
              ...(confirmando && { opacity: 0.7 })
            }}
          >
            {confirmando ? 'Confirmando...' : (transacao.contaSugerida && contaContabilId === transacao.contaSugerida._id ? 'Aceitar Sugestão' : 'Confirmar')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
