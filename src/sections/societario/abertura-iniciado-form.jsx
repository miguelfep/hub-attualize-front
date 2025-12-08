'use client';

import { toast } from 'sonner';
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import {
  Card,
  Button,
  Switch,
  Stack,
  TextField,
  CardContent,
  CardActions,
  FormControlLabel,
} from '@mui/material';

import { updateAbertura, enviarLinkAbertura } from 'src/actions/societario';

export default function AberturaIniciadoForm({ currentAbertura = {}, handleAdvanceStatus }) {
  const { control, register, handleSubmit, getValues } = useFormContext({});

  // Função para lidar com o envio do formulário
  const onSave = async (data, shouldAdvance = false) => {
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
    <Card sx={{ padding: 2, marginBottom: 2 }}>
      <CardContent>
        <form onSubmit={handleSubmit(onSave)}>
          <TextField
            fullWidth
            label="Nome"
            defaultValue={currentAbertura.nome || ''}
            {...register('nome', { required: true })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            defaultValue={currentAbertura.email || ''}
            {...register('email', { required: true })}
            margin="normal"
          />

          <Controller
            name="telefone"
            control={control}
            defaultValue={currentAbertura.telefone || ''}
            render={({ field }) => (
              <InputMask
                mask="(99) 9 9999-9999"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              >
                {(inputProps) => (
                  <TextField {...inputProps} label="Telefone" fullWidth margin="normal" />
                )}
              </InputMask>
            )}
          />

          <Controller
            name="valorMensalidade"
            control={control}
            defaultValue={currentAbertura.valorMensalidade || ''}
            render={({ field }) => (
              <NumericFormat
                {...field}
                customInput={TextField}
                label="Valor Mensalidade"
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                value={field.value}
                onValueChange={(values) => field.onChange(values.floatValue)}
                fullWidth
                margin="normal"
              />
            )}
          />

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

          <CardActions sx={{ justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={onReenviarLink}>
              Reenviar Link
            </Button>
            <Stack direction="row" spacing={2}>
              <Button color="success" variant="contained" onClick={() => onSave(null, false)}>
                Salvar
              </Button>
              {handleAdvanceStatus && (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => onSave(null, true)}
                >
                  Salvar e Avançar
                </Button>
              )}
            </Stack>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  );
}
