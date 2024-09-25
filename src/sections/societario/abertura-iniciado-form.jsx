'use client';

import { toast } from 'sonner';
import { useFormContext } from 'react-hook-form';

import { Card, Button, Switch, TextField, CardActions, FormControlLabel } from '@mui/material';

import { enviarLinkAbertura } from 'src/actions/societario';

export default function AberturaIniciadoForm({ currentAbertura = {} }) {
  const { register, handleSubmit, setValue } = useFormContext();

  // Função para lidar com o envio do formulário
  const onSave = (data) => {
    console.log('Dados salvos:', data);
    // Lógica para salvar dados
  };

  // Função para reenviar o link
  const onReenviarLink = async () => {
    try {
      const res = await enviarLinkAbertura(currentAbertura._id);
      if (res.status === 200) {
        toast.success('Mensagem enviada com sucesso!');
      } else {
        const errorMessage = res.data.message || 'Erro ao enviar mensagem';
        toast.error(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar mensagem';
      toast.error(`Erro: ${errorMessage}`);
    }
  };

  return (
    <Card>
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
          <Button type="submit" variant="outlined">
            Salvar
          </Button>
          <Button variant="contained" color="primary" onClick={onReenviarLink}>
            Reenviar Link
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}
