import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { today, fIsAfter } from 'src/utils/format-time';

import { createInvoice } from 'src/actions/invoices';

import { getUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function KanbanOrcamentosInput({ task }) {
  const user = getUser();
  const loadingSend = useBoolean();

  const NewInvoiceSchema = zod
  .object({
    cliente: zod.string().min(1, { message: 'Cliente é obrigatório!' }),
    createdDate: zod.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), zod.date({
      required_error: 'Data criação é obrigatória!',
    })),
    dataVencimento: zod.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), zod.date({
      required_error: 'Data vencimento é obrigatória!',
    })),
    items: zod.array(
      zod.object({
        titulo: zod.string().min(1, { message: 'Título é obrigatório!' }),
        descricao: zod.string().min(1, { message: 'Descrição é obrigatória!' }),
        quantidade: zod.number().min(1, { message: 'Quantidade deve ser maior que 0' }),
        preco: zod.number().min(0, { message: 'Preço deve ser maior ou igual a 0' }),
        total: zod.number().optional(),
      })
    ),
    status: zod.string(),
    desconto: zod.number(),
    totalAmount: zod.number(),
    formaPagamento: zod.string().optional(),
  })
  .refine((data) => !fIsAfter(data.createdDate, data.dataVencimento), {
    message: 'Data de vencimento não pode ser anterior à data de criação!',
    path: ['dataVencimento'],
  });

  // Valores iniciais do formulário
  const defaultValues = useMemo(
    () => ({
      createdDate: task.invoice?.createdDate || today(),
      dataVencimento: task.invoice?.dataVencimento || today(),
      cliente: task?.cliente?.nome || '',
      desconto: task.invoice?.desconto || 0,
      totalAmount: task.invoice?.total || 0,
      status: task.invoice?.status || 'orcamento',
      items: task.invoice?.items || [
        {
          titulo: '',
          descricao: '',
          quantidade: 1,
          preco: 0,
          total: 0,
        },
      ],
      formaPagamento: task.invoice?.formaPagamento || 'boleto',
    }),
    [task]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const watchItems = watch('items');

  const handleSaveInvoice = handleSubmit(async (data) => {
    loadingSend.onTrue();

    console.log(data);    

    try {
      if (task.invoice) {
        // await updateInvoice(task.invoice._id, data);
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        await createInvoice({ ...data, proprietarioVenda: user.name });
        toast.success('Orçamento criado com sucesso!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar orçamento!');
    } finally {
      loadingSend.onFalse();
    }
  });

  return (
    <Stack >
      {!task?.cliente ? (
        <Typography color="error" variant="h6">
          Selecione um cliente para criar o orçamento.
        </Typography>
      ) : (
        <>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              {/* Cliente */}
              <TextField
                label="Cliente"
                {...register('cliente')}
                error={!!errors.cliente}
                helperText={errors.cliente?.message}
              />

              {/* Datas */}
              <Stack direction="row" spacing={2}>

                <TextField
                  label="Data Vencimento"
                  type="date"
                  {...register('dataVencimento')}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dataVencimento}
                  helperText={errors.dataVencimento?.message}
                />
              </Stack>

         

              {/* Valores */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Desconto"
                  type="number"
                  {...register('desconto')}
                  error={!!errors.desconto}
                  helperText={errors.desconto?.message}
                />
                <TextField
                  label="Total"
                  type="number"
                  {...register('totalAmount')}
                  error={!!errors.totalAmount}
                  helperText={errors.totalAmount?.message}
                />
              </Stack>
            </Stack>
          </Card>

          {/* Botão de salvar */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <LoadingButton
              size="large"
              variant="contained"
              loading={loadingSend.value && isSubmitting}
              onClick={handleSaveInvoice}
            >
              {task.invoice ? 'Atualizar Orçamento' : 'Criar Orçamento'}
            </LoadingButton>
          </Stack>
        </>
      )}
    </Stack>
  );
}
