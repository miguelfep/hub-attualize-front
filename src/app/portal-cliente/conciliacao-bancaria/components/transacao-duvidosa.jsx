import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { SelectContaContabil } from 'src/components/plano-contas';

/**
 * Componente para exibir transação duvidosa
 * Status: duvidosa
 * Cor: Amarelo
 * Ação: Usuário deve revisar e confirmar
 */
export default function TransacaoDuvidosa({ transacao, onConfirmar, clienteId }) {
  const matchScore = transacao.matchScore || 0;
  const scorePercent = (matchScore * 100).toFixed(0);

  // Estado para match selecionado
  const [matchSelecionado, setMatchSelecionado] = useState(
    transacao.transacaoExistenteId || ''
  );

  // Estado para conta contábil selecionada (inicializar com sugestão se houver)
  const [contaContabilId, setContaContabilId] = useState(
    transacao.contaSugerida?._id || ''
  );
  const [confirmando, setConfirmando] = useState(false);

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

    // contaContabilId é OBRIGATÓRIO
    onConfirmar(
      transacaoId,
      matchSelecionado || null,
      contaContabilId
    );
  };

  return (
    <Card
      sx={{
        p: 2,
        borderLeft: 4,
        borderColor: 'warning.main',
        bgcolor: 'warning.lighter',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:alert-triangle-fill" color="warning.main" width={24} />
            <Chip label="⚠️ Requer Revisão" color="warning" size="small" />
          </Stack>

          <Chip
            label={`Score: ${scorePercent}%`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Stack>

        {/* Detalhes da Transação */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="eva:file-text-outline" width={18} />
            Transação do Extrato
          </Typography>
          <Stack spacing={1} mt={1}>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              <strong>Descrição:</strong> {transacao.descricao || 'N/A'}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Typography variant="body2">
                <strong>Valor:</strong>{' '}
                <span
                  style={{
                    color: transacao.tipo === 'credito' ? '#10b981' : '#ef4444',
                    fontWeight: 'bold',
                    fontSize: '1.1em',
                  }}
                >
                  {transacao.tipo === 'credito' ? '+' : '-'}{' '}
                  {fCurrency(transacao.valor || 0)}
                </span>
              </Typography>
              {transacao.data && (
                <Typography variant="body2">
                  <strong>Data:</strong>{' '}
                  {new Date(transacao.data).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Possíveis Matches */}
        {transacao.matches && transacao.matches.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              🔍 Possíveis Correspondências Encontradas:
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Selecione a transação correspondente ou crie uma nova
            </Typography>

            <RadioGroup
              value={matchSelecionado}
              onChange={(e) => setMatchSelecionado(e.target.value)}
            >
              {transacao.matches.map((match, idx) => (
                <Card
                  key={idx}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor:
                      matchSelecionado === match.transacaoId ? 'primary.main' : 'grey.300',
                  }}
                >
                  <FormControlLabel
                    value={match.transacaoId}
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            Match #{idx + 1}
                          </Typography>
                          <Chip
                            label={`${(match.score * 100).toFixed(0)}%`}
                            size="small"
                            color={match.score > 0.8 ? 'success' : 'warning'}
                          />
                        </Stack>

                        {match.transacao && (
                          <Stack spacing={0.5}>
                            <Typography variant="caption">
                              <strong>Descrição:</strong> {match.transacao.descricao || 'N/A'}
                            </Typography>
                            <Typography variant="caption">
                              <strong>Valor:</strong> {fCurrency(match.transacao.valor || 0)}
                            </Typography>
                            {match.transacao.data && (
                              <Typography variant="caption">
                                <strong>Data:</strong>{' '}
                                {new Date(match.transacao.data).toLocaleDateString('pt-BR')}
                              </Typography>
                            )}
                          </Stack>
                        )}

                        {match.motivo && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            💡 {match.motivo}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </Card>
              ))}

              {/* Opção: Criar Nova Transação */}
              <Card
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: matchSelecionado === '' ? 'primary.main' : 'grey.300',
                }}
              >
                <FormControlLabel
                  value=""
                  control={<Radio />}
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        ➕ Criar Nova Transação
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Esta transação não corresponde a nenhuma existente
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </RadioGroup>
          </Box>
        )}

        {/* Sugestão baseada em histórico */}
        {transacao.contaSugerida && (
          <Card
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              border: 2,
              borderColor: 'info.main',
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="eva:bulb-fill" color="info.main" width={20} />
                <Typography variant="body2" fontWeight="bold" color="info.dark">
                  💡 Sugestão baseada no histórico
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                  {transacao.contaSugerida.codigoSequencial || transacao.contaSugerida.codigo}
                </Typography>
                {transacao.contaSugerida.classificacao && (
                  <Chip 
                    label={transacao.contaSugerida.classificacao}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
              <Typography variant="body2">
                {transacao.contaSugerida.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Esta conta foi usada anteriormente para transações similares
              </Typography>
            </Stack>
          </Card>
        )}

        {/* Seleção de Conta Contábil */}
        <Box>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            📊 Conta Contábil (Obrigatório)
          </Typography>
          <SelectContaContabil
            clienteId={clienteId}
            value={contaContabilId}
            onChange={setContaContabilId}
            descricaoTransacao={transacao.descricao || ''}
            transacaoTipo={transacao.tipo}
            label="Selecione a conta contábil"
            contaSugeridaId={transacao.contaSugerida?._id}
            required
          />
        </Box>

        {/* Botão Confirmar */}
        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={handleConfirmar}
          startIcon={<Iconify icon="eva:checkmark-fill" />}
          disabled={!contaContabilId || confirmando}
          sx={{ 
            ...(confirmando && { opacity: 0.7 })
          }}
        >
          {confirmando ? 'Confirmando...' : '✅ Confirmar Seleção'}
        </Button>
      </Stack>
    </Card>
  );
}
