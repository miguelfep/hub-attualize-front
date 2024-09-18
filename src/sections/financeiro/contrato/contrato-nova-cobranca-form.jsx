import dayjs from 'dayjs';
import { toast } from 'sonner';
import { z as zod } from 'zod';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Dialog,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { today } from 'src/utils/format-time';

import { atualizarCobrancaPorId, criarCobrancasPorContrato } from 'src/actions/financeiro';

// Define o schema de validação usando zod
const cobrancaSchema = zod.object({
  observacoes: zod.string().min(1, 'Descrição é obrigatória'),
  valor: zod.string().min(1, 'Valor é obrigatório'),
  dataVencimento: zod.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
});

// Funções auxiliares para formatar e remover formatação de moeda
const formatCurrency = (value) => {
  const numberValue = Number(value.replace(/[^\d]/g, '')) / 100;
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrency = (formattedValue) => Number(formattedValue.replace(/[R$,]/g, '')) / 100;

const NovaCobrancaForm = ({ open, handleClose, contrato, fetchCobrancas, cobrancaAtual }) => {
  // Estado local para os campos
  const [observacoes, setObservacoes] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [dataVencimento, setDataVencimento] = useState(dayjs(today()));
  const [status, setStatus] = useState('EMABERTO'); // Estado para o status da cobrança

  // UseMemo para gerar os valores padrão com base no contrato e na cobrança atual
  const defaultValues = useMemo(
    () => ({
      observacoes: cobrancaAtual?.observacoes || '',
      valor:
        cobrancaAtual?.valor?.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        }) || '',
      dataVencimento: cobrancaAtual?.dataVencimento
        ? dayjs(cobrancaAtual.dataVencimento)
        : dayjs(today()),
      status: cobrancaAtual?.status || 'EMABERTO', // Valor padrão para o status
    }),
    [cobrancaAtual]
  );

  useEffect(() => {
    if (open) {
      // Reseta os valores ao abrir o modal
      setObservacoes(defaultValues.observacoes);
      setFormattedValue(defaultValues.valor || '');
      setDataVencimento(defaultValues.dataVencimento);
      setStatus(defaultValues.status); // Define o status inicial
    }
  }, [open, defaultValues]);

  // Função para formatar o valor ao digitar
  const handleValorChange = (event) => {
    const rawValue = event.target.value;
    setFormattedValue(formatCurrency(rawValue));
  };

  // Função para lidar com o clique no botão
  const handleCreateOrUpdate = async () => {
    try {
      const parsedValue = parseCurrency(formattedValue);
      const data = {
        observacoes,
        valor: parsedValue,
        dataVencimento: dataVencimento.toDate(),
        contrato: contrato._id,
        status, // Adiciona o status da cobrança no envio
      };

      if (cobrancaAtual && cobrancaAtual.boleto) {
        toast.error('Não é possível alterar uma cobrança que já possui boleto gerado.');
        return;
      }

      if (cobrancaAtual) {
        await atualizarCobrancaPorId(cobrancaAtual._id, data); // Atualizar cobrança existente
        toast.success('Cobrança atualizada com sucesso!');
      } else {
        await criarCobrancasPorContrato(data); // Criar nova cobrança
        toast.success('Cobrança criada com sucesso!');
      }

      await fetchCobrancas(); // Atualiza a lista de cobranças
      handleClose(); // Fecha o modal
    } catch (error) {
      console.error('Erro ao criar/editar cobrança:', error);
      toast.error(
        `Erro ao criar/editar cobrança: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="form-dialog-title">
        {cobrancaAtual ? 'Editar Cobrança' : 'Nova Cobrança'}
      </DialogTitle>
      <DialogContent sx={{ marginTop: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              fullWidth
              multiline
              rows={6}
              label="Descrição"
              error={!observacoes}
              helperText={!observacoes && 'Descrição é obrigatória'}
              disabled={!!cobrancaAtual?.boleto}
            />
          </Grid>

          <Grid item xs={12}>
            <DatePicker
              label="Data de Vencimento"
              value={dataVencimento}
              onChange={(newValue) => setDataVencimento(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!dataVencimento}
                  helperText={!dataVencimento && 'Data de vencimento é obrigatória'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Valor"
              fullWidth
              value={formattedValue}
              onChange={handleValorChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              error={!formattedValue}
              helperText={!formattedValue && 'Valor é obrigatório'}
              disabled={!!cobrancaAtual?.boleto}
            />
          </Grid>

          {/* Select para o Status */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status da Cobrança</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status da Cobrança"
              >
                <MenuItem value="RECEBIDO">Pago</MenuItem>
                <MenuItem value="EMABERTO">Pendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        {!cobrancaAtual?.boleto && (
          <Button
            onClick={handleCreateOrUpdate}
            color="primary"
            variant="contained"
            disabled={!observacoes || !formattedValue || !dataVencimento}
          >
            {cobrancaAtual ? 'Atualizar' : 'Criar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NovaCobrancaForm;
