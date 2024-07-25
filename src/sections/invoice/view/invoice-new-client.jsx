import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { cpf as cpfValidator, cnpj as cnpjValidator } from 'cpf-cnpj-validator';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { formatCpfCnpj } from 'src/utils/format-number';

import { criarCliente } from 'src/actions/clientes';

export function NewClientDialog({ open, onClose, onAddClient }) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      documento: '',
      tipoContato: 'lead',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Validar CPF/CNPJ
      if (!cpfValidator.isValid(data.documento) && !cnpjValidator.isValid(data.documento)) {
        setError('documento', {
          type: 'manual',
          message: 'Documento inválido',
        });
        return;
      }

      const cnpj = formatCpfCnpj(data.documento);

      const dataToSend = {
        ...data,
        cnpj,
        razaoSocial: data.nome,
      };
      const response = await criarCliente(dataToSend);

      if (response.status === 200 || response.status === 201) {
        const newClient = response.data;
        onAddClient(newClient);
        reset();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Novo Cliente</DialogTitle>
      <DialogContent>
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Nome" fullWidth margin="normal" required />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Email" fullWidth margin="normal" required />
          )}
        />
        <Controller
          name="whatsapp"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="WhatsApp" fullWidth margin="normal" required />
          )}
        />
        <Controller
          name="documento"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="CPF/CNPJ"
              fullWidth
              margin="normal"
              required
              error={!!errors.documento}
              helperText={errors.documento ? errors.documento.message : ''}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
