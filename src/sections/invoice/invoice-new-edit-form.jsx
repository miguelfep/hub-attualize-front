import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today, fIsAfter } from 'src/utils/format-time';

import { createInvoice, updateInvoice } from 'src/actions/invoices';

import { Form, schemaHelper } from 'src/components/hook-form';

import { getUser } from 'src/auth/context/jwt';

import { InvoiceNewEditDetails } from './invoice-new-edit-details';
import { InvoiceNewEditAddress } from './invoice-new-edit-address';
import { InvoiceNewEditPayment } from './invoice-new-edit-payment';
import { InvoiceNewEditStatusDate } from './invoice-new-edit-status-date';

export const NewInvoiceSchema = zod
  .object({
    cliente: zod.custom().refine((data) => data !== null, { message: 'Cliente é obrigatório!' }),
    createdDate: schemaHelper.date({ message: { required_error: 'Data criação é obrigatória!' } }),
    dataVencimento: schemaHelper.date({
      message: { required_error: 'Data vencimento é obrigatória!' },
    }),
    items: zod.array(
      zod.object({
        servico: zod.string().min(1, { message: 'Serviço é obrigatório!' }),
        quantidade: zod.number().min(1, { message: 'Quantidade deve ser maior que 0' }),
        titulo: zod.string().min(1, { message: 'Titulo é obrigatório!' }),
        descricao: zod.string().min(1, { message: 'Descrição é obrigatória!' }),
        // Not required
        preco: zod.number(),
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

// ----------------------------------------------------------------------

export function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const user = getUser();
  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const defaultValues = useMemo(
    () => ({
      createdDate: currentInvoice?.createdAt ?? today(),
      dataVencimento: currentInvoice?.dataVencimento || today(),
      status: currentInvoice?.status || 'orcamento',
      desconto: currentInvoice?.desconto || 0,
      totalAmount: currentInvoice?.total || 0,
      cliente: currentInvoice?.cliente || null,
      motivoPerda: currentInvoice?.motivoPerda || ' ',
      items: currentInvoice?.items || [
        {
          titulo: '',
          descricao: '',
          servico: '',
          quantidade: 1,
          preco: 0,
          total: 0,
        },
      ],
      formaPagamento: currentInvoice?.formaPagamento || 'boleto',
      paymentUrl: currentInvoice?.paymentUrl || null,
      cobrancas: currentInvoice?.cobrancas || null,
    }),
    [currentInvoice]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const handleSaveAsDraft = handleSubmit(async (data) => {
    try {
      loadingSave.onTrue();
      const res = await updateInvoice(currentInvoice._id, data);
      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    const dataToSend = { ...data, proprietarioVenda: user.name };
    try {
      const response = await createInvoice(dataToSend);
      if (response.status === 201) {
        reset();
        loadingSend.onFalse();
        router.push(paths.dashboard.invoice.root);
        console.info('DATA', JSON.stringify(data, null, 2));
      } else {
        toast.error('Erro ao gerar Venda');
      }
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  return (
    <Form methods={methods}>
      <Card>
        <InvoiceNewEditAddress />

        <InvoiceNewEditStatusDate />

        <InvoiceNewEditDetails />

        <InvoiceNewEditPayment currentInvoice={currentInvoice} />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Salvar
        </LoadingButton>

        {!currentInvoice && (
          <LoadingButton
            size="large"
            variant="contained"
            loading={loadingSend.value && isSubmitting}
            onClick={handleCreateAndSend}
          >
            Criar
          </LoadingButton>
        )}
      </Stack>
    </Form>
  );
}
