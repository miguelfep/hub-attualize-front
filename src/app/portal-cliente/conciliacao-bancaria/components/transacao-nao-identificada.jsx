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

const ORIGEM_SUGESTAO_LABEL = {
  ml_cliente: 'ML',
  historico_exato: 'Histórico',
  historico_similar: 'Similar',
  gemini: 'IA',
  ia_pdf: 'IA (PDF)',
};

const getNivelConfianca = (confianca) => {
  if (typeof confianca !== 'number') {
    return { label: 'Não informada', color: 'default' };
  }
  if (confianca >= 85) return { label: 'Alta', color: 'success' };
  if (confianca >= 60) return { label: 'Média', color: 'warning' };
  return { label: 'Baixa', color: 'default' };
};

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
  onAplicarSemelhantes,
  autoConfirm, // 🔥 NOVO: Flag para confirmar automaticamente
}) {
  // Estado para conta contábil selecionada (inicializar com sugestão se houver)
  const [contaContabilId, setContaContabilId] = useState(
    transacao.contaSugerida?._id || ''
  );
  const [confirmando, setConfirmando] = useState(false);
  const nivelConfianca = getNivelConfianca(Number(transacao.confiancaSugestao));

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

  const handleAplicarSemelhantes = () => {
    if (!onAplicarSemelhantes || !contaContabilId) return;
    onAplicarSemelhantes(transacao, contaContabilId);
  };

  return (
    <Card
      sx={{
        p: 1,
        mb: 0.75,
        borderLeft: 3,
        borderColor: 'error.main',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: 1,
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ width: '100%' }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 140 }}>
            <Iconify icon="eva:question-mark-circle-fill" color="error.main" width={20} />
            <Chip label="Não Identificada" color="error" size="small" sx={{ height: 24 }} />
          </Stack>

          <Typography
            variant="body2"
            sx={{
              flex: 1,
              minWidth: 220,
              fontWeight: 500,
              wordBreak: 'break-word',
              lineHeight: 1.35,
            }}
          >
            {transacao.descricao || 'N/A'}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 170 }}>
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
                {new Date(transacao.data).toLocaleDateString('pt-BR')}
              </Typography>
            )}
          </Stack>
        </Stack>

        {transacao.contaSugerida && (
          <Box
            sx={{
              p: 0.75,
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
                {transacao.sugestaoOrigem && (
                  <Chip
                    label={ORIGEM_SUGESTAO_LABEL[transacao.sugestaoOrigem] || transacao.sugestaoOrigem}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.65rem' }}
                  />
                )}
                <Chip
                  size="small"
                  color={nivelConfianca.color}
                  label={`Confiança ${nivelConfianca.label}`}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                {typeof transacao.confiancaSugestao === 'number' && (
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(transacao.confiancaSugestao)}%
                  </Typography>
                )}
                <Typography variant="body2" fontWeight="medium" sx={{ ml: 0.5 }}>
                  {transacao.contaSugerida.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontFamily="monospace" sx={{ ml: 0.5 }}>
                  {transacao.contaSugerida.codigoSequencial || transacao.contaSugerida.codigo || ''}
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
            </Stack>
          </Box>
        )}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <Box sx={{ flex: 1 }}>
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

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleConfirmar}
            startIcon={<Iconify icon="eva:checkmark-fill" width={16} />}
            disabled={!contaContabilId || confirmando}
            sx={{ minWidth: 150, ...(confirmando && { opacity: 0.7 }) }}
          >
            {confirmando ? 'Confirmando...' : (transacao.contaSugerida && contaContabilId === transacao.contaSugerida._id ? 'Aceitar Sugestão' : 'Confirmar')}
          </Button>
          {contaContabilId && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleAplicarSemelhantes}
              startIcon={<Iconify icon="eva:copy-fill" width={16} />}
              sx={{ minWidth: 220 }}
            >
              Aplicar conta para semelhantes
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
