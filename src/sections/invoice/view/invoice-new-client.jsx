import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { formatToCamelCase } from 'src/utils/formatter'; import { onlyDigits, formatCPFOrCNPJ } from 'src/utils/format-number';

import { criarLead, getAllLeadsOrigens } from 'src/actions/lead';

import { Field } from 'src/components/hook-form';


const validarCpfCnpj = (value) => {
  const cleanValue = onlyDigits(value);
  if (!cleanValue) return 'CPF/CNPJ é obrigatório';

  if (cleanValue.length !== 11 && cleanValue.length !== 14) {
    return 'Insira um CPF ou CNPJ válido';
  }
  return true;
};

export function NewLeadDialog({ open, onClose, onAddLead }) {
  const [origens, setOrigens] = useState([]);
  const [loadingOrigens, setLoadingOrigens] = useState(true);
  const [origemInputValue, setOrigemInputValue] = useState('');

  const methods = useForm({
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      cnpj: '',
      origem: '',
    },
    mode: 'onSubmit',
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchOrigens = async () => {
      try {
        setLoadingOrigens(true);
        const origins = await getAllLeadsOrigens();
        setOrigens(origins);
      } catch (error) {
        console.error('❌ Erro ao buscar origens:', error);
        setOrigens([]);
      } finally {
        setLoadingOrigens(false);
      }
    };

    if (open) {
      fetchOrigens();
      setOrigemInputValue('');
    }
  }, [open]);

  const handleClose = () => {
    reset();
    setOrigemInputValue('');
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      const rawWhatsapp = data.whatsapp || '';
      let digitsWhatsapp = rawWhatsapp.replace(/\D/g, '');

      if (digitsWhatsapp.startsWith('55')) {
        digitsWhatsapp = digitsWhatsapp.slice(2);
      }

      if (digitsWhatsapp.length < 10) {
        setError('whatsapp', {
          type: 'manual',
          message: 'Telefone inválido',
        });
        return;
      }

      const clearedWhatsapp = digitsWhatsapp;
      const clearedCpfCnpj = onlyDigits(data.cnpj);

      let origemFinal = data.origem;
      if (typeof data.origem === 'string' && data.origem) {
        const jaECamelCase = /^[a-z][a-zA-Z0-9]*$/.test(data.origem);
        if (!jaECamelCase) {
          origemFinal = formatToCamelCase(data.origem);
        }
      }

      const payloadLead = {
        nome: data.nome,
        email: data.email,
        telefone: clearedWhatsapp,
        cnpj: clearedCpfCnpj,
        origem: origemFinal,
        status: true
      };

      const newLead = await criarLead(payloadLead);

      toast.success('Lead criado com sucesso!');
      handleClose();

      if (onAddLead) {
        const leadCriado = newLead.data || newLead;
        onAddLead(leadCriado);
      }

    } catch (error) {
      console.error('Erro ao criar lead:', error);

      const errorMsg = error.response?.data?.message || error.message;

      if (errorMsg?.toLowerCase().includes('já existe')) {
        setError('cnpj', {
          type: 'manual',
          message: 'Este CPF/CNPJ já está cadastrado.'
        });
      } else {
        toast.error(errorMsg || 'Erro ao salvar lead');
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Novo Lead</DialogTitle>
        <DialogContent>
          <Controller
            name="nome"
            control={control}
            rules={{ required: 'Nome é obrigatório' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome"
                fullWidth
                margin="normal"
                error={!!errors.nome}
                helperText={errors.nome?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email é obrigatório',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Field.Phone
            name="whatsapp"
            label="WhatsApp/Telefone"
            country="BR"
            margin="normal"
            rules={{
              required: 'WhatsApp/Telefone é obrigatório',
              validate: (value) => {
                const raw = value || '';
                let digits = String(raw).replace(/\D/g, '');

                if (digits.startsWith('55')) digits = digits.slice(2);

                if (digits.length < 10) return 'Telefone inválido';
                return true;
              },
            }}
          />
          <Controller
            name="cnpj"
            control={control}
            rules={{
              required: 'CPF/CNPJ é obrigatório',
              validate: validarCpfCnpj
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="CPF ou CNPJ"
                fullWidth
                margin="normal"
                onChange={(e) => {
                  const valorFormatado = formatCPFOrCNPJ(e.target.value);
                  if (valorFormatado.length <= 18) {
                    field.onChange(valorFormatado);
                  }
                }}
                error={!!errors.cnpj}
                helperText={errors.cnpj?.message}
                placeholder="000.000.000-00"
                inputProps={{ maxLength: 18 }}
              />
            )}
          />
          <Controller
            name="origem"
            control={control}
            rules={{ required: 'Origem é obrigatória' }}
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                {...field}
                freeSolo
                value={value || null}
                inputValue={origemInputValue}
                onInputChange={(_, newValue, reason) => {
                  setOrigemInputValue(newValue);
                  if (reason === 'input' || reason === 'clear') {
                    onChange(newValue);
                  }
                }}
                onChange={(_, newValue) => {
                  if (!newValue) {
                    onChange('');
                    setOrigemInputValue('');
                    return;
                  }

                  const valor = typeof newValue === 'string' ? newValue : (newValue.tipo || newValue.id || '');
                  onChange(valor);
                  setOrigemInputValue(valor);
                }}
                options={origens}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.tipo || option.id || '';
                }}
                isOptionEqualToValue={(option, selectedValue) => {
                  const optionValue = typeof option === 'string' ? option : (option.tipo || option.id);
                  return optionValue === selectedValue;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Origem"
                    fullWidth
                    margin="normal"
                    error={!!errors.origem}
                    helperText={errors.origem?.message || 'Selecione uma origem ou digite uma nova'}
                    disabled={loadingOrigens}
                    placeholder="Selecione ou digite uma origem"
                  />
                )}
                loading={loadingOrigens}
                loadingText="Carregando origens..."
                noOptionsText="Nenhuma origem disponível. Digite para criar uma nova."
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Adicionar Lead'}
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
