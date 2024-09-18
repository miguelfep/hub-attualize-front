'use client';

import { useFormContext } from 'react-hook-form';

import { Card, Button, Switch, TextField, CardActions, FormControlLabel } from '@mui/material';

export default function AberturaIniciadoForm({ currentAbertura = {} }) {
  const { register, handleSubmit, setValue } = useFormContext();
  console.log(currentAbertura);

  // Função para lidar com o envio do formulário
  const onSave = (data) => {
    console.log('Dados salvos:', data);
    // Lógica para salvar dados
  };

  // Função para reenviar o link
  const onReenviarLink = () => {
    console.log('Reenviar link para a abertura com ID:', currentAbertura._id);
    // Lógica para reenviar o link
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
