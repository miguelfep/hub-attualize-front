'use client';

import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { buscarCobrancasContratoId } from 'src/actions/financeiro';

// ----------------------------------------------------------------------

export function AprovarDescontoDialog({ open, onClose, desconto, onConfirm, loading }) {
  const [cobrancas, setCobrancas] = useState([]);
  const [loadingCobrancas, setLoadingCobrancas] = useState(false);
  const [cobrancaId, setCobrancaId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && desconto?.contrato) {
      buscarCobrancas();
    } else {
      setCobrancas([]);
      setCobrancaId('');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, desconto?.contrato]);

  const buscarCobrancas = async () => {
    try {
      setLoadingCobrancas(true);
      setError(null);
      const response = await buscarCobrancasContratoId(desconto.contrato);
      // Filtrar apenas cobranças pendentes (EMABERTO ou VENCIDO)
      const cobrancasPendentes = (response.data || []).filter((cob) => {
        // 1. O status NÃO pode ser 'PAGO' nem 'CANCELADO'
        const statusValido = cob.status !== 'PAGO' && cob.status !== 'RECEBIDO' && cob.status !== 'CANCELADO';
        
        // 2. O valor deve ser maior que 0
        const valorValido = cob.valor > 0;
        
        // 3. NÃO pode ter boleto (assumindo que a propriedade seja 'boleto' ou 'temBoleto')
        // Ajuste o nome da propriedade 'cob.boleto' conforme sua API
        const semBoleto = !cob.boleto; 
      
        return statusValido && valorValido && semBoleto;
      });
      
      setCobrancas(cobrancasPendentes);
      
      if (cobrancasPendentes.length === 0) {
        setError('Não há cobranças pendentes para este contrato.');
      }
    } catch (_error) {
      console.error('Erro ao buscar cobranças:', _error);
      setError('Erro ao carregar cobranças do contrato.');
      setCobrancas([]);
    } finally {
      setLoadingCobrancas(false);
    }
  };

  const handleConfirm = () => {
    if (!cobrancaId) {
      setError('Selecione uma cobrança para aplicar o desconto.');
      return;
    }
    onConfirm(cobrancaId);
  };

  const handleClose = () => {
    setCobrancaId('');
    setError(null);
    onClose();
  };

  if (!desconto) return null;

  const cobrancaSelecionada = cobrancas.find((c) => c._id === cobrancaId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aprovar Desconto</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Selecione a cobrança que receberá o desconto:
          </Typography>

          <Stack 
            spacing={1.5}
            sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Cliente:
              </Typography>
              <Typography variant="subtitle2">
                {desconto.cliente?.nome || desconto.cliente?.razaoSocial || '-'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Contrato:
              </Typography>
              <Typography variant="subtitle2">
              {desconto.cliente?.razaoSocial 
                ? `Desconto de ${desconto.cliente.razaoSocial}` 
                : (desconto.contrato || '-')}
            </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Valor do Desconto:
              </Typography>
              <Typography variant="h6" color="success.main">
                {fCurrency(desconto.valor)}
              </Typography>
            </Stack>
          </Stack>

          {loadingCobrancas ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Carregando cobranças...
              </Typography>
            </Stack>
          ) : error && cobrancas.length === 0 ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TextField
                select
                label="Selecione a cobrança"
                value={cobrancaId}
                onChange={(e) => {
                  setCobrancaId(e.target.value);
                  setError(null);
                }}
                fullWidth
                error={!!error && !cobrancaId}
                helperText={error && !cobrancaId ? error : ''}
              >
                {cobrancas.map((cobranca) => (
                  <MenuItem key={cobranca._id} value={cobranca._id}>
                    <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                      <Typography variant="body2">
                        {cobranca.observacoes || `Cobrança #${cobranca.observacoes}`}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 2, fontWeight: 600 }}>
                        {fCurrency(cobranca.valor)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              {cobrancaSelecionada && (
                <Alert severity="info" icon={false}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={600}>
                      Valor original: {fCurrency(cobrancaSelecionada.valor)}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="success.main">
                      Valor com desconto: {fCurrency(Math.max(0, cobrancaSelecionada.valor - desconto.valor))}
                    </Typography>
                  </Stack>
                </Alert>
              )}
            </>
          )}

          <Typography variant="caption" color="text.secondary">
            💡 O desconto será aplicado na cobrança selecionada e o saldo será debitado da conta do cliente.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || loadingCobrancas}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={handleConfirm}
          loading={loading}
          disabled={!cobrancaId || loadingCobrancas || cobrancas.length === 0}
        >
          Confirmar Aprovação
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
