import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { atualizarCobrancaPorId, criarCobrancasPorContrato } from 'src/actions/financeiro';

import { Iconify } from 'src/components/iconify';

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
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <Iconify
              icon={cobrancaAtual ? 'solar:pen-bold-duotone' : 'solar:document-add-bold-duotone'}
              width={24}
            />
          </Box>
          <Box>
            <Box sx={{ typography: 'h6', fontWeight: 700 }}>
              {cobrancaAtual ? 'Editar Cobrança' : 'Nova Cobrança'}
            </Box>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              {cobrancaAtual
                ? 'Atualize as informações da cobrança'
                : 'Preencha os dados para criar uma nova cobrança'}
            </Box>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 5, pb: 2, px: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <Stack spacing={3}>
            {/* Alerta quando tem boleto */}
            {temBoleto && (
              <Alert 
                severity="warning" 
                icon={<Iconify icon="solar:danger-triangle-bold-duotone" width={24} />}
                sx={{ 
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                  Boleto gerado - Edição bloqueada
                </Box>
                <Box sx={{ typography: 'body2' }}>
                  Para editar descrição, valor ou vencimento, é necessário cancelar o boleto primeiro.
                  Apenas o status pode ser alterado.
                </Box>
              </Alert>
            )}

            {/* Descrição */}
            <TextField
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Descrição"
              placeholder="Descreva os detalhes da cobrança..."
              disabled={camposDesabilitados}
              InputLabelProps={{ shrink: true }}
              helperText={
                temBoleto
                  ? 'Cancelar o boleto para editar este campo'
                  : 'Informe uma descrição clara sobre esta cobrança'
              }
            />

            {/* Data e Valor em linha */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data de Vencimento"
                  value={dataVencimento}
                  onChange={(newValue) => setDataVencimento(newValue)}
                  format="DD/MM/YYYY"
                  disabled={camposDesabilitados}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      disabled: camposDesabilitados,
                      helperText: temBoleto ? 'Cancelar o boleto para editar' : undefined,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="solar:calendar-mark-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor"
                  fullWidth
                  value={formattedValue}
                  onChange={handleValorChange}
                  disabled={camposDesabilitados}
                  placeholder="R$ 0,00"
                  helperText={temBoleto ? 'Cancelar o boleto para editar' : undefined}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:dollar-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Status (apenas para admin) */}
            {isAdmin && (
              <FormControl fullWidth>
                <InputLabel>Status da Cobrança</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status da Cobrança"
                  renderValue={(value) => {
                    if (value === 'RECEBIDO' || value === 'PAGO') {
                      return 'Pago';
                    }
                    if (value === 'EMABERTO') {
                      return 'Pendente';
                    }
                    if (value === 'CANCELADO') {
                      return 'Cancelado';
                    }
                    return value;
                  }}
                >
                  <MenuItem value="RECEBIDO">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:check-circle-bold-duotone" width={18} sx={{ color: 'success.main' }} />
                      <Box>Pago</Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="PAGO">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:check-circle-bold-duotone" width={18} sx={{ color: 'success.main' }} />
                      <Box>Pago</Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="EMABERTO">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:clock-circle-bold-duotone" width={18} sx={{ color: 'warning.main' }} />
                      <Box>Pendente</Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="CANCELADO">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:close-circle-bold-duotone" width={18} sx={{ color: 'error.main' }} />
                      <Box>Cancelado</Box>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:close-circle-bold-duotone" />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreateOrUpdate}
          variant="contained"
          disabled={
            !observacoes || !formattedValue || !dataVencimento || (!isAdmin && !isFinanceiro)
          }
          startIcon={
            <Iconify
              icon={cobrancaAtual ? 'solar:check-circle-bold-duotone' : 'solar:add-circle-bold-duotone'}
            />
          }
        >
          {cobrancaAtual ? 'Atualizar' : 'Criar Cobrança'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NovaCobrancaForm;
