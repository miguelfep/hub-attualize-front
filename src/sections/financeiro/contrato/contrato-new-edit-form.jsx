import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

import { postContrato, updateContrato } from 'src/actions/financeiro';

import { Form, schemaHelper } from 'src/components/hook-form';

import { ContratoCobrancas } from './contrato-cobranca';
import { ContratoNewEditData } from './contrato-new-edit-data';
import { ContratoNewEditDetails } from './contrato-new-edit-details';
import { ContratoNewEditAddress } from './contrato-new-edit-address';
import { ContratoNewEditStatusDate } from './contrato-new-edit-status-date';

export const NewContratoSchema = zod.object({
  titulo: zod.string().min(1, { message: 'Título é obrigatório!' }),
  cliente: zod.custom().refine((data) => data !== null, { message: 'Cliente é obrigatório!' }),
  valorMensalidade: zod.number().min(0, { message: 'Valor da mensalidade é obrigatório!' }),
  metodoCobranca: zod.enum(['boleto', 'cartao'], {
    errorMap: () => ({ message: 'Método de cobrança é obrigatório!' }),
  }),
  tipoCobranca: zod.enum(['mensal', 'pontual', 'anual', 'trimestral'], {
    errorMap: () => ({ message: 'Tipo de cobrança é obrigatório!' }),
  }),
  tipoContrato: zod.enum(['normal', 'parceiroid']),
  cobrancaContabil: zod.boolean().default(true),
  possuiDecimoTerceiro: zod.boolean().default(true),
  dataVencimento: zod
    .number()
    .min(1)
    .max(31, { message: 'Data de vencimento deve ser um dia válido do mês (1-31)' }),
  status: zod.enum(['ativo', 'inativo', 'pendente']),
  dataInicio: schemaHelper.date({ message: { required_error: 'Data de início é obrigatória!' } }),
  observacoes: zod.string().optional(),
  items: zod
    .array(
      zod.object({
        servico: zod.string().min(1, { message: 'Serviço é obrigatório!' }),
        descricao: zod.string().min(1, { message: 'Descrição é obrigatória!' }),
        quantidade: zod.number().min(1, { message: 'Quantidade deve ser maior que 0' }),
        valorUnitario: zod.number().min(0, { message: 'Valor unitário é obrigatório!' }),
      })
    )
    .optional(),
});

export function ContratoNewEditForm({ currentContrato }) {
  const router = useRouter();

  const loadingSave = useBoolean();
  const loadingSend = useBoolean();
  const [tabIndex, setTabIndex] = useState(0); // Controle da aba ativa

  const defaultValues = useMemo(
    () => ({
      titulo: currentContrato?.titulo || '',
      cliente: currentContrato?.cliente || null,
      valorMensalidade: currentContrato?.valorMensalidade || 0,
      metodoCobranca: currentContrato?.metodoCobranca || 'boleto',
      tipoCobranca: currentContrato?.tipoCobranca || 'mensal',
      tipoContrato: currentContrato?.tipoContrato || 'normal',
      cobrancaContabil: currentContrato?.cobrancaContabil ?? false,
      possuiDecimoTerceiro: currentContrato?.possuiDecimoTerceiro ?? false,
      dataVencimento: currentContrato?.dataVencimento || 10,
      status: currentContrato?.status || 'ativo',
      dataInicio: currentContrato?.dataInicio || today(),
      observacoes: currentContrato?.observacoes || '',
      items: currentContrato?.items || [
        {
          servico: '',
          descricao: '',
          quantidade: 1,
          valorUnitario: 0,
        },
      ],
    }),
    [currentContrato]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewContratoSchema),
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

      const resp = await updateContrato(currentContrato._id, data);

      if (resp.status === 200) {
        reset({
          titulo: resp.data.titulo || '',
          cliente: resp.data.cliente || null,
          valorMensalidade: resp.data.valorMensalidade || 0,
          metodoCobranca: resp.data.metodoCobranca || 'boleto',
          tipoCobranca: resp.data.tipoCobranca || 'mensal',
          tipoContrato: resp.data.tipoContrato || 'normal',
          cobrancaContabil: resp.data.cobrancaContabil ?? false,
          possuiDecimoTerceiro: resp.data.possuiDecimoTerceiro ?? false,
          dataVencimento: resp.data.dataVencimento || 10,
          status: resp.data.status || 'ativo',
          dataInicio: resp.data.dataInicio || today(),
          observacoes: resp.data.observacoes || '',
          items: resp.data.items || [
            {
              servico: '',
              descricao: '',
              quantidade: 1,
              valorUnitario: 0,
            },
          ],
        });

        loadingSave.onFalse();
        toast.success('Atualizado com sucesso');
      } else {
        toast.error(resp.data.message);
      }
    } catch (error) {
      console.error(error);
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();
    try {
      const response = await postContrato(data);
      if (response === 201) {
        reset();
        loadingSend.onFalse();
        router.push(paths.dashboard.contratos.root);
      } else {
        toast.error('Erro ao gerar Contrato');
      }
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  // Função para controlar a troca de abas
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Form methods={methods}>
      <Card sx={{ p: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="tabs contrato">
          <Tab label="Dados do Contrato" />
          <Tab label="Cobranças" />
        </Tabs>

        {/* Conteúdo das Tabs */}
        <Box sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <>
              <ContratoNewEditAddress />
              <ContratoNewEditData />
              <ContratoNewEditStatusDate />
              <ContratoNewEditDetails />
            </>
          )}
          {tabIndex === 1 && (
            <ContratoCobrancas contratoId={currentContrato?._id} contrato={currentContrato} />
          )}{' '}
          {/* Exibe as cobranças relacionadas ao contrato */}
        </Box>
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

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentContrato ? 'Duplicar' : 'Criar'}
        </LoadingButton>
      </Stack>
    </Form>
  );
}