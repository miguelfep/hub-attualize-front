import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles'
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { atualizarCobrancaPorId, criarCobrancasPorContrato } from 'src/actions/financeiro';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { getUser } from 'src/auth/context/jwt';

const user = getUser();

const formatCurrency = (value) => {
  const numberValue = Number(value.replace(/[^\d]/g, '')) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrency = (formattedValue) => {
  const sanitizedValue = formattedValue
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(sanitizedValue);
};

const NovaCobrancaForm = ({ open, handleClose, contrato, fetchCobrancas, cobrancaAtual }) => {
  const [observacoes, setObservacoes] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [dataVencimento, setDataVencimento] = useState(dayjs());
  const [status, setStatus] = useState('EMABERTO');

  useEffect(() => {
    if (open) {
      if (contrato.tipoContrato === 'parceiroid') {
        const descricaoObservacoes = contrato.items.map((item) => item.descricao).join('\n');
        const valorTotal = contrato.items.reduce(
          (acc, item) => acc + item.valorUnitario * item.quantidade,
          0
        );
        setObservacoes(descricaoObservacoes);
        setFormattedValue(
          valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        );
      } else {
        setObservacoes(cobrancaAtual?.observacoes || '');
        setFormattedValue(
          cobrancaAtual?.valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }) || ''
        );
        setDataVencimento(
          cobrancaAtual?.dataVencimento ? dayjs(cobrancaAtual.dataVencimento) : dayjs()
        );
        setStatus(cobrancaAtual?.status || 'EMABERTO');
      }
    }
  }, [open, contrato, cobrancaAtual]);

  const handleValorChange = (event) => {
    const rawValue = event.target.value;
    setFormattedValue(formatCurrency(rawValue));
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Validação: se tem boleto, não permite editar descrição, valor ou vencimento
      if (cobrancaAtual?.boleto) {
        const descricaoAlterada = observacoes !== (cobrancaAtual?.observacoes || '');
        const valorAlterado =
          parseCurrency(formattedValue) !== (cobrancaAtual?.valor || 0);
        const vencimentoAlterado =
          dataVencimento.format('YYYY-MM-DD') !==
          (cobrancaAtual?.dataVencimento
            ? dayjs(cobrancaAtual.dataVencimento).format('YYYY-MM-DD')
            : dayjs().format('YYYY-MM-DD'));

        if (descricaoAlterada || valorAlterado || vencimentoAlterado) {
          toast.error(
            'Não é possível editar descrição, valor ou vencimento de uma cobrança com boleto gerado. ' +
            'É necessário cancelar o boleto primeiro.'
          );
          return;
        }
      }

      const parsedValue = parseCurrency(formattedValue);
      const data = {
        observacoes,
        valor: parsedValue,
        dataVencimento: dataVencimento.toDate(),
        contrato: contrato._id,
        status,
      };

      if (cobrancaAtual) {
        await atualizarCobrancaPorId(cobrancaAtual._id, data);
        toast.success('Cobrança atualizada com sucesso!');
      } else {
        await criarCobrancasPorContrato(data);
        toast.success('Cobrança criada com sucesso!');
      }

      await fetchCobrancas();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar/editar cobrança:', error);
      toast.error(
        `Erro ao criar/editar cobrança: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const isAdmin = user.role === 'admin';
  const isFinanceiro = user.role === 'financeiro';
  const temBoleto = !!cobrancaAtual?.boleto;
  const camposDesabilitados = temBoleto || (!isAdmin && !isFinanceiro);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, overflow: 'hidden' },
      }}
    >
      {/* Header inspirado no estilo Excel */}
      <DialogTitle sx={{ pb: 2, pt: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:bill-list-bold-duotone" width={28} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {cobrancaAtual ? 'Detalhes da Cobrança' : 'Nova Cobrança'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {temBoleto ? 'Visualização bloqueada - Boleto emitido' : 'Gerencie os valores e itens desta fatura'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Stack spacing={3}>

          {/* Alerta de Bloqueio (Estilo sutil) */}
          {temBoleto && (
            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 1.5, borderStyle: 'dashed' }}>
              O boleto já foi gerado. Para editar, cancele-o primeiro.
            </Alert>
          )}

          {/* Input de Descrição */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Descrição Geral</Typography>
            <TextField
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={camposDesabilitados}
              placeholder="Ex: Consultoria referente ao mês de..."
              sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
            />
          </Box>

          {/* Grid de Data e Valor */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Vencimento</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <DatePicker
                  value={dataVencimento}
                  onChange={(date) => setDataVencimento(date)}
                  disabled={camposDesabilitados}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: { '& .MuiInputBase-root': { borderRadius: 1.5 } },
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Valor Total</Typography>
              <TextField
                fullWidth
                value={formattedValue}
                onChange={handleValorChange}
                disabled={camposDesabilitados}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />
            </Box>
          </Stack>

          {cobrancaAtual?.items && cobrancaAtual.items.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                Itens da Cobrança
              </Typography>

              <Box
                sx={{
                  py: 2,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
                  border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                }}
              >
                <Stack spacing={2}>
                  {cobrancaAtual.items.map((item, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.titulo}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.quantidade}x de {formatToCurrency(item.preco)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatToCurrency(item.preco * item.quantidade)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                Estes itens são fixos conforme o contrato pai.
              </Typography>
            </Box>
          )}

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Fechar
        </Button>
        {!temBoleto && (
          <Button variant="contained" onClick={handleCreateOrUpdate} sx={{ borderRadius: 1.5 }}>
            Salvar Alterações
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NovaCobrancaForm;
