import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { z as zod } from 'zod';
import { useMemo, useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFormContext } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Card,
  Grid,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  CardHeader,
  FormControl,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import {
  listarBancos,
  criarContaPagar,
  atualizarContaPagarPorId,
  registrarContaNoBancoInter,
} from 'src/actions/contas';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';

import { categoriasDespesas } from 'src/utils/constants/categorias';

const decodificarLinhaDigitavel = (codigoBarras) => {
  const valor = parseFloat(codigoBarras.substring(37, 47)) / 100;
  const fatorVencimento = parseInt(codigoBarras.substring(33, 37), 10);
  const dataBase = new Date(1997, 9, 7);
  const dataVencimento = new Date(dataBase.getTime() + fatorVencimento * 24 * 60 * 60 * 1000);

  return { valor, dataVencimento };
};

export const ContaPagarSchema = zod.object({
  descricao: zod.string().min(1, { message: 'Descrição é obrigatória!' }),
  nome: zod.string().min(1, { message: 'Nome Despesa é obrigatória!' }),
  valor: zod.string().min(1, { message: 'Valor é obrigatório!' }),
  dataVencimento: zod.string().min(1, { message: 'Data de Vencimento é obrigatória!' }),
  dataPagamento: zod.string().optional(),
  codigoBarras: zod.string().optional(),
  tipo: zod.enum(['AVULSA', 'RECORRENTE']),
  parcelas: zod
    .union([zod.string(), zod.number()])
    .transform((value) => Number(value))
    .optional(),
  status: zod.enum(['PENDENTE', 'PAGO', 'CANCELADO', 'AGENDADO']),
  banco: zod.string().min(1, { message: 'Banco é obrigatório!' }),
  statusPagamento: zod.string().optional(),
  codigoTransacao: zod.string().optional(),
  categoria: zod.string().min(1, { message: 'Categoria é obrigatória!' }),
});

export function PagarNewEditForm({ currentConta }) {
  const [loading, setLoading] = useState(false);
  const [bancos, setBancos] = useState([]);
  const [bancoMap, setBancoMap] = useState({});
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      descricao: currentConta?.descricao || '',
      nome: currentConta?.nome || '',
      valor: currentConta?.valor ? currentConta.valor.toFixed(2).replace('.', ',') : '',
      dataVencimento: currentConta?.dataVencimento
        ? dayjs(currentConta.dataVencimento).format('DD/MM/YYYY')
        : '',
      dataPagamento: currentConta?.dataPagamento
        ? dayjs(currentConta.dataPagamento).format('DD/MM/YYYY')
        : '',
      codigoBarras: currentConta?.codigoBarras || '',
      tipo: currentConta?.tipo || 'AVULSA',
      parcelas: currentConta?.parcelas || 1,
      status: currentConta?.status || 'PENDENTE',
      banco: currentConta?.banco?.codigo || '', 
      categoria: currentConta?.categoria || '',
      statusPagamento: currentConta?.statusPagamento || '',
      codigoTransacao: currentConta?.codigoTransacao || '',
    }),
    [currentConta]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ContaPagarSchema),
    defaultValues,
  });

  const { control, handleSubmit, setValue, watch } = methods;
  const values = watch();

  const tipo = watch('tipo'); // Observa o valor do campo `tipo`
 
  useEffect(() => {
    const fetchBancos = async () => {
      try {
        const response = await listarBancos();
        setBancos(response);
        const novoBancoMap = response.reduce((acc, banco) => {
          acc[banco.codigo] = banco._id;
          return acc;
        }, {});
        setBancoMap(novoBancoMap); // Mantenha o setBancoMap usando o novo nome
      } catch (error) {
        toast.error('Erro ao buscar bancos');
      }
    };
    fetchBancos();
  }, []);

  // Formata o valor enquanto o usuário digita
  const handleValorChange = (event) => {
    const inputValue = event.target.value;
    const apenasNumeros = inputValue.replace(/\D/g, '');
    const valorFormatado = (parseFloat(apenasNumeros) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setValue('valor', valorFormatado, { shouldValidate: true });
  };

  const handleCodigoBarrasChange = async (event) => {
    const codigoBarras = event.target.value.replace(/\s/g, '').replace(/[^\w]/g, '');
    setValue('codigoBarras', codigoBarras);

    if (codigoBarras.replace(/[^\d]/g, '').length === 47) {
      const { valor, dataVencimento } = decodificarLinhaDigitavel(codigoBarras);

      const valorFormatado = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      setValue('valor', valorFormatado, { shouldValidate: true });
      setValue('dataVencimento', dayjs(dataVencimento).format('DD/MM/YYYY'), {
        shouldValidate: true,
      });
    }
  };

  const handleAgendarPagamento = async () => {
    try {
      const { statusPagamento, codigoTransacao } = await registrarContaNoBancoInter(
        currentConta._id
      );
      setValue('statusPagamento', statusPagamento);
      setValue('codigoTransacao', codigoTransacao);
      toast.success('Pagamento agendado com sucesso');
    } catch (error) {
      toast.error('Erro ao agendar pagamento');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Converter o valor de 'banco' para o ID correto
      const bancoId = bancoMap[data.banco];

      // Converter o valor do campo 'valor' de string para número
      const valor = parseFloat(
        data.valor.replace(/\./g, '').replace(',', '.').replace('R$', '').trim()
      );

      // Converter as datas de DD/MM/YYYY para objetos Date
      const [vencDay, vencMonth, vencYear] = data.dataVencimento.split('/');
      const dataVencimentoISO = new Date(`${vencYear}-${vencMonth}-${vencDay}T10:00:00.000Z`);

      let dataPagamentoISO = null;
      if (data.dataPagamento) {
        const [pagDay, pagMonth, pagYear] = data.dataPagamento.split('/');
        dataPagamentoISO = new Date(`${pagYear}-${pagMonth}-${pagDay}T10:00:00.000Z`);
      }

      // Preparar os dados atualizados
      const updatedData = {
        ...data,
        banco: bancoId,
        valor,
        parcelas: Number(data.parcelas), // Certifique-se de que parcelas seja um número
        dataVencimento: dataVencimentoISO,
        dataPagamento: dataPagamentoISO,
      };

      // Verificar se estamos criando ou atualizando uma conta
      if (currentConta) {
        await atualizarContaPagarPorId(currentConta._id, updatedData);
        toast.success('Conta atualizada com sucesso');
      } else {
        await criarContaPagar(updatedData);
        await router.push('/dashboard/financeiro/pagar');
        toast.success('Conta criada com sucesso');
      }
    } catch (error) {
      console.log(error);
      toast.error('Erro ao processar conta');
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors) => {
    console.log('Validation Errors:', errors);
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit, onError)}>
      <Card>
        <CardHeader title={currentConta ? 'Atualizar Despesa' : 'Cadastre uma Nova Despesa'} />
        <CardContent>
          <Grid container spacing={3}>
            {/* Código de Barras */}
            <Grid item xs={12}>
              <Controller
                name="codigoBarras"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código de Barras"
                    fullWidth
                    onChange={handleCodigoBarrasChange}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Controller
                  name="categoria"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Categoria" fullWidth>
                      {categoriasDespesas.map((categoria) => (
                        <MenuItem key={categoria._id} value={categoria._id}>
                          {categoria.nome} {/* Mostrando o nome da categoria */}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            {/* Descrição */}
            <Grid item xs={12}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nome Despesa" fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Descrição" fullWidth rows={4} multiline required />
                )}
              />
            </Grid>
            {/* Valor */}
            <Grid item xs={12}>
              <Controller
                name="valor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor"
                    value={field.value}
                    onChange={handleValorChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            {/* Labels e Data de Vencimento / Pagamento */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {/* Data de Vencimento */}
                <Grid item xs={6}>
                  <Controller
                    name="dataVencimento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Data Vencimento"
                        value={
                          dayjs(field.value, 'DD/MM/YYYY').isValid()
                            ? dayjs(field.value, 'DD/MM/YYYY')
                            : null
                        }
                        onChange={(date) =>
                          setValue('dataVencimento', dayjs(date).format('DD/MM/YYYY'))
                        }
                        format="DD/MM/YYYY"
                        renderInput={(params) => (
                          <TextField {...params} label="Data de Vencimento" fullWidth required />
                        )}
                      />
                    )}
                  />
                </Grid>
                {/* Data de Pagamento */}
                <Grid item xs={6}>
                  <Controller
                    name="dataPagamento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Data Pagamento"
                        value={
                          dayjs(field.value, 'DD/MM/YYYY').isValid()
                            ? dayjs(field.value, 'DD/MM/YYYY')
                            : null
                        }
                        onChange={(date) =>
                          setValue('dataPagamento', dayjs(date).format('DD/MM/YYYY'))
                        }
                        format="DD/MM/YYYY"
                        renderInput={(params) => (
                          <TextField {...params} label="Data de Pagamento" fullWidth />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            {/* Banco */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Banco</InputLabel>
                <Controller
                  name="banco"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Banco" fullWidth>
                      {bancos.map((banco) => (
                        <MenuItem key={banco._id} value={banco.codigo}>
                          {banco.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            {/* Status */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Status">
                      <MenuItem value="PENDENTE">Pendente</MenuItem>
                      <MenuItem value="PAGO">Pago</MenuItem>
                      <MenuItem value="CANCELADO">Cancelado</MenuItem>
                      <MenuItem value="AGENDADO">Agendado</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            {/* Tipo */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Tipo">
                      <MenuItem value="AVULSA">Avulsa</MenuItem>
                      <MenuItem value="RECORRENTE">Recorrente</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            {/* Parcelas - Exibir apenas se tipo for 'RECORRENTE' */}
            {tipo === 'RECORRENTE' && (
              <Grid item xs={12}>
                <Controller
                  name="parcelas"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Parcelas" fullWidth type="number" />
                  )}
                />
              </Grid>
            )}
            {values.codigoTransacao && (
              <Grid item xs={12}>
                <Controller
                  name="codigoTransacao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Código da Transação"
                      fullWidth
                      InputProps={{
                        readOnly: true, // Campo apenas para leitura
                      }}
                    />
                  )}
                />
              </Grid>
            )}
            {values.banco === '77' && (
              <Grid item xs={12}>
                <Button
                  onClick={handleAgendarPagamento}
                  variant="contained"
                  disabled={!values.codigoBarras || !!values.codigoTransacao}
                >
                  Agendar Pagamento
                </Button>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Form>
  );
}
