'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

import { Card, Button, Switch, TextField, CardContent, CardActions, FormControlLabel } from '@mui/material';

import { updateAbertura, enviarLinkAbertura } from 'src/actions/societario';

export default function AberturaIniciadoForm({ currentAbertura = {}, handleAdvanceStatus }) {
  const { register, handleSubmit, setValue, watch } = useFormContext();
  const [valorMensalidade, setValorMensalidade] = useState(
    currentAbertura.valorMensalidade || '' // Valor inicial formatado
  );

  // Lidar com a alteração do valorMensalidade
  const handleValueChange = (values) => {
    setValorMensalidade(values.formattedValue); // Formato para exibição (R$ 25.000,00)
    setValue('valorMensalidade', values.formattedValue); // Atualiza no estado do formulário
  };

  // Função para lidar com o envio do formulário
  const onSave = async (data) => {
    try {
      // Adiciona o ID da abertura no payload
      const preparedData = {
        ...currentAbertura,
        valorMensalidade, // Garante que o valor é enviado formatado
        aberturaId: currentAbertura._id,
      };

      console.log(data);
      

      // Envia os dados para o backend
      const res = await updateAbertura(currentAbertura._id, preparedData);
      if (res.status === 200) {
        toast.success('Dados salvos com sucesso!');
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

          <TextField
            fullWidth
            label="Telefone"
            defaultValue={currentAbertura.telefone || ''}
            {...register('telefone', { required: true })}
            margin="normal"
          />

          <NumericFormat
            fullWidth
            label="Valor Mensalidade"
            customInput={TextField}
            value={valorMensalidade}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            onValueChange={handleValueChange}
            margin="normal"
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
            <Button color="success" variant="contained" onClick={onSave}>
              Salvar
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  );
}
