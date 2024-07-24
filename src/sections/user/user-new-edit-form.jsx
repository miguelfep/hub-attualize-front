import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  { value: true, label: 'Ativo' },
  { value: false, label: 'Inativo' },
];

export const REGIME_TRIBUTARIO_OPTIONS = [
  { value: 'simples', label: 'Simples' },
  { value: 'presumido', label: 'Presumido' },
  { value: 'real', label: 'Real' },
  { value: 'pf', label: 'PF' },
];

export const PLANO_EMPRESA_OPTIONS = [
  { value: 'carneleao', label: 'Carnê Leão' },
  { value: 'mei', label: 'MEI' },
  { value: 'start', label: 'Start' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'premium', label: 'Premium' },
  { value: 'plus', label: 'Plus' },
];

export const TRIBUTACAO_OPTIONS = [
  { value: 'anexo1', label: 'Anexo I' },
  { value: 'anexo2', label: 'Anexo II' },
  { value: 'anexo3', label: 'Anexo III' },
  { value: 'anexo4', label: 'Anexo IV' },
  { value: 'anexo5', label: 'Anexo V' },
  { value: 'simei', label: 'SIMEI' },
  { value: 'autonomo', label: 'Autônomo' },
];

export const ClienteQuickEditSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  whatsapp: schemaHelper.phoneNumber({ isValidPhoneNumber }),
  address: zod.string().min(1, { message: 'Endereço é obrigatório!' }),
  estado: zod.string().min(1, { message: 'Estado é obrigatório!' }),
  cidade: zod.string().min(1, { message: 'Cidade é obrigatória!' }),
  cep: zod.string().min(1, { message: 'CEP é obrigatório!' }),
  razaoSocial: zod.string().optional(),
  cnpj: zod.string().min(1, { message: 'CNPJ é obrigatório!' }),
  codigo: zod.number().min(1, { message: 'Código é obrigatório!' }),
  emailFinanceiro: zod.string().optional(),
  telefoneComercial: zod.string().optional(),
  observacao: zod.string().optional(),
  dataEntrada: zod.date().optional(),
  dataSaida: zod.date().optional(),
  status: zod.boolean(),
  regimeTributario: zod.string().min(1, { message: 'Regime Tributário é obrigatório!' }),
  planoEmpresa: zod.string().min(1, { message: 'Plano Empresa é obrigatório!' }),
  tributacao: zod.array(zod.string()).min(1, { message: 'Tributação é obrigatória!' }),
});

// ----------------------------------------------------------------------

export function ClienteQuickEditForm({ currentUser, open, onClose }) {
  const enderecoAtual = currentUser.endereco[0];
  const [cepValue, setCepValue] = useState(enderecoAtual?.cep || '');

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      whatsapp: currentUser?.whatsapp || '',
      address: enderecoAtual?.rua || '',
      estado: enderecoAtual?.estado || '',
      cidade: enderecoAtual?.cidade || '',
      cep: enderecoAtual?.cep || '',
      status: currentUser?.status,
      razaoSocial: currentUser?.razaoSocial || '',
      cnpj: currentUser?.cnpj || '',
      codigo: currentUser?.codigo || 0,
      emailFinanceiro: currentUser?.emailFinanceiro || '',
      telefoneComercial: currentUser?.telefoneComercial || '',
      observacao: currentUser?.observacao || '',
      dataEntrada: currentUser?.dataEntrada || '',
      dataSaida: currentUser?.dataSaida || '',
      regimeTributario: currentUser?.regimeTributario || '',
      planoEmpresa: currentUser?.planoEmpresa || '',
      tributacao: currentUser?.tributacao || [],
    }),
    [currentUser]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ClienteQuickEditSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      reset();
      onClose();

      toast.promise(promise, {
        loading: 'Loading...',
        success: 'Update success!',
        error: 'Update error!',
      });

      await promise;
    } catch (error) {
      console.error(error);
    }
  });

  const handleCepChange = async (event) => {
    const cep = event.target.value;
    setCepValue(cep);
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
          throw new Error('CEP não encontrado');
        }
        setValue('address', data.logradouro);
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
      } catch (error) {
        console.error(error);
        toast.error('CEP não encontrado ou inválido');
      }
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 720 } }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Atualização Rápida</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Select name="status" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Field.Text name="nome" label="Nome Completo" />
            <Field.Text name="email" label="Email" />
            <Field.Text name="whatsapp" label="Telefone" />
            <Field.Text name="razaoSocial" label="Razão Social" />
            <Field.Text name="cnpj" label="CNPJ" />
            <Field.Text name="codigo" label="Código" type="number" />
            <Field.Text name="emailFinanceiro" label="Email Financeiro" />
            <Field.Text name="telefoneComercial" label="Telefone Comercial" />
            <Field.DatePicker name="dataEntrada" label="Data de Entrada" />
            <Field.DatePicker name="dataSaida" label="Data de Saída" />

            <Field.Select name="regimeTributario" label="Regime Tributário">
              {REGIME_TRIBUTARIO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="planoEmpresa" label="Plano Empresa">
              {PLANO_EMPRESA_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.MultiSelect name="tributacao" label="Tributação" value={TRIBUTACAO_OPTIONS}>
              {TRIBUTACAO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.MultiSelect>

            <Field.Text name="cep" label="CEP" value={cepValue} onChange={handleCepChange} />
            <Field.Text name="address" label="Endereço" />
            <Field.Text name="estado" label="Estado" />
            <Field.Text name="cidade" label="Cidade" />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Field.Editor
              fullWidth
              name="observacao"
              label="Observação"
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Atualizar
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
