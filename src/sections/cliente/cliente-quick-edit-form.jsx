import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { updateCliente } from 'src/actions/clientes';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

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

export const TIPO_CONTATO_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'lead', label: 'Lead' },
];

export const ClienteQuickEditSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  whatsapp: zod.string().min(1, { message: 'Telefone é obrigatório!' }),
  cnpj: zod.string().min(1, { message: 'CNPJ é obrigatório!' }),
  status: zod.boolean(),
  tipoContato: zod.string().min(1, { message: 'Tipo de Contato é obrigatório!' }),
  rua: zod.string().optional(),
  numero: zod.string().optional(),
  complemento: zod.string().optional(),
  estado: zod.string().optional(),
  cidade: zod.string().optional(),
  cep: zod.string().optional(),
  razaoSocial: zod.string().optional(),
  codigo: zod.number().optional(),
  emailFinanceiro: zod.string().optional(),
  telefoneComercial: zod.string().optional(),
  observacao: zod.string().optional(),
  dataEntrada: zod.union([zod.date(), zod.string().optional(), zod.null()]).optional(),
  dataSaida: zod.union([zod.date(), zod.string().optional(), zod.null()]).optional(),
  regimeTributario: zod.string().optional(),
  planoEmpresa: zod.string().optional(),
  tributacao: zod.array(zod.string()).optional(),
});

// ----------------------------------------------------------------------

export function ClienteQuickEditForm({ currentUser, open, onClose, onUpdate }) {
  const [cepValue, setCepValue] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  const enderecoAtual = useMemo(() => currentUser.endereco?.[0] || {}, [currentUser.endereco]);

  const defaultValues = useMemo(
    () => ({
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
      whatsapp: currentUser?.whatsapp || '',
      cnpj: currentUser?.cnpj || '',
      status: currentUser?.status,
      tipoContato: currentUser?.tipoContato || '',
      rua: enderecoAtual?.rua || '',
      numero: enderecoAtual?.numero || '',
      complemento: enderecoAtual?.complemento || '',
      estado: enderecoAtual?.estado || '',
      cidade: enderecoAtual?.cidade || '',
      cep: enderecoAtual?.cep || '',
      razaoSocial: currentUser?.razaoSocial || '',
      codigo: currentUser?.codigo || 0,
      emailFinanceiro: currentUser?.emailFinanceiro || '',
      telefoneComercial: currentUser?.telefoneComercial || '',
      observacao: currentUser?.observacao || '',
      dataEntrada: currentUser?.dataEntrada ? new Date(currentUser.dataEntrada) : null,
      dataSaida: currentUser?.dataSaida ? new Date(currentUser.dataSaida) : null,
      regimeTributario: currentUser?.regimeTributario || '',
      planoEmpresa: currentUser?.planoEmpresa || '',
      tributacao: currentUser?.tributacao || [],
    }),
    [currentUser, enderecoAtual]
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

  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
      setCepValue(enderecoAtual?.cep || '');
    }
  }, [currentUser, defaultValues, reset, enderecoAtual]);

  const onSubmit = handleSubmit(async (data) => {
    const formattedData = {
      ...data,
      endereco: [
        {
          rua: data.rua,
          numero: data.numero,
          complemento: data.complemento,
          cidade: data.cidade,
          estado: data.estado,
          cep: cepValue,
        },
      ],
    };

    const promise = updateCliente(currentUser._id, formattedData);

    toast.promise(promise, {
      loading: 'Loading...',
      success: 'Cliente atualizado com sucesso!',
      error: 'Erro ao atualizar o cliente!',
    });

    try {
      await promise;
      reset();
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Erro na atualização do cliente:', error);
    }
  });

  const handleCepChange = async (event) => {
    const cep = event.target.value;
    setCepValue(cep);
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
          throw new Error('CEP não encontrado');
        }
        setValue('rua', data.logradouro);
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
      } catch (error) {
        console.error(error);
        toast.error('CEP não encontrado ou inválido');
      } finally {
        setLoadingCep(false);
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
            <Field.Select name="tipoContato" label="Tipo de Contato">
              {TIPO_CONTATO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Text name="nome" label="Nome Completo" />
            <Field.Text name="email" label="Email" />
            <Field.Text name="whatsapp" label="Telefone" />
            <Field.Text name="cnpj" label="CNPJ" />
            <Field.Text name="cep" label="CEP" value={cepValue} onChange={handleCepChange} />
            <Field.Text
              name="rua"
              label="Endereço"
              disabled={loadingCep}
              InputProps={{
                endAdornment: loadingCep ? <CircularProgress size={20} /> : null,
              }}
            />
            <Field.Text name="numero" label="Número" />
            <Field.Text name="complemento" label="Complemento" />
            <Field.Text name="estado" label="Estado" />
            <Field.Text name="cidade" label="Cidade" />
            <Field.Text name="razaoSocial" label="Razão Social" />
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
            <Field.MultiSelect name="tributacao" label="Tributação" options={TRIBUTACAO_OPTIONS} />
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
