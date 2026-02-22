'use client';

// Updated: Removed InputMask dependency - using formatPhone utility instead
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import {
  Card,
  Grid,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  CardContent,
  CardActions,
  FormControlLabel,
} from '@mui/material';

import { formatPhone } from 'src/utils/format-input';

import { updateAbertura, enviarLinkAbertura } from 'src/actions/societario';

export default function AberturaIniciadoForm({ currentAbertura = {}, handleAdvanceStatus }) {
  const { control, register, handleSubmit, getValues } = useFormContext();

  // Função para lidar com o envio do formulário
  const onSave = async (shouldAdvance = false) => {
    try {
      // Adiciona o ID da abertura no payload
      const editedData = getValues();
      const preparedData = {
        ...editedData,
        aberturaId: currentAbertura._id,
      };

      // Envia os dados para o backend
      const res = await updateAbertura(currentAbertura._id, preparedData);
      if (res.status === 200) {
        toast.success('Dados salvos com sucesso!');
        if (shouldAdvance && handleAdvanceStatus) {
          handleAdvanceStatus('em_validacao');
        }
      } else {
        const errorMessage = res.data?.message || 'Erro ao salvar os dados';
        toast.error(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao salvar os dados';
      toast.error(`Erro: ${errorMessage}`);
    }
  };

  // Função para reenviar o link
  const onReenviarLink = async () => {
    try {
      const res = await enviarLinkAbertura(currentAbertura._id);
      if (res.status === 200) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        const errorMessage = res.data?.message || 'Erro ao enviar mensagem';
        toast.error(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar mensagem';
      toast.error(`Erro: ${errorMessage}`);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', p: 4, mb: 3 }}>
      <CardContent sx={{ pt: 0, px: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, px: 2 }}>
          Dados da Abertura
        </Typography>

        <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
          <Grid xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Nome"
              defaultValue={currentAbertura.nome || ''}
              {...register('nome', { required: true })}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Email"
              defaultValue={currentAbertura.email || ''}
              {...register('email', { required: true })}
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <Controller
              name="telefone"
              control={control}
              defaultValue={currentAbertura.telefone || ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Telefone"
                  fullWidth
                  value={field.value || ''}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              )}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Controller
              name="valorMensalidade"
              control={control}
              defaultValue={currentAbertura.valorMensalidade || ''}
              render={({ field }) => (
                <NumericFormat
                  {...field}
                  customInput={TextField}
                  size="small"
                  label="Valor Mensalidade"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  value={field.value}
                  onValueChange={(values) => field.onChange(values.floatValue)}
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid xs={12}>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked={currentAbertura.notificarWhats || false}
                  {...register('notificarWhats')}
                  color="primary"
                />
              }
              label="Notificar pelo WhatsApp"
            />
          </Grid>
        </Grid>

        <CardActions sx={{ justifyContent: 'space-between', mt: 3, px: 0 }}>
          <Button variant="contained" color="primary" onClick={onReenviarLink}>
            Reenviar Link
          </Button>
          <Stack direction="row" spacing={2}>
            <Button color="success" variant="contained" onClick={() => onSave(false)}>
              Salvar
            </Button>
            {handleAdvanceStatus && (
              <Button
                color="primary"
                variant="contained"
                onClick={() => onSave(true)}
              >
                Salvar e Avançar
              </Button>
            )}
          </Stack>
        </CardActions>
      </CardContent>
    </Card>
  );
}
