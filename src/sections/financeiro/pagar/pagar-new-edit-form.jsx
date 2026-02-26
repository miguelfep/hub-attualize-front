import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { z as zod } from 'zod';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Card,
  Grid,
  Stack,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { listarCentrosCusto } from 'src/actions/centros-custo';
import { listarCategoriasFinanceiras } from 'src/actions/categorias-financeiras';
import {
  listarBancos,
  criarContaPagar,
  atualizarContaPagarPorId,
  registrarContaNoBancoInter,
} from 'src/actions/contas';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';

const decodificarLinhaDigitavel = (codigoBarras) => {
  // Remove tudo que não for número caso venha com pontos ou espaços
  const apenasNumeros = codigoBarras.replace(/\D/g, '');

  // O valor continua igual
  const valor = parseFloat(apenasNumeros.substring(37, 47)) / 100;

  // Fator de vencimento (posições 33 a 37)
  const fatorVencimento = parseInt(apenasNumeros.substring(33, 37), 10);

  /**
   * LÓGICA DE REVALIDAÇÃO DO FATOR (FEBRABAN):
   * Se o fator for para datas após 22/02/2025, a base muda.
   */
  const dataBase = dayjs('1997-10-07');

  // Se o fator for "baixo" em relação ao reset de 2025, 
  // somamos o fator à nova base de 2025
  const dataVencimento = fatorVencimento >= 1000
    ? dataBase.add(fatorVencimento, 'day')
    : dataBase.add(fatorVencimento + 9000, 'day'); // Ajuste para o overflow

  // Mas a regra simplificada para boletos atuais (pós-reset) é:
  // Se a data calculada for menor que 2025, adicionamos 9000 dias (o ciclo completo)
  let dataFinal = dataBase.add(fatorVencimento, 'day');

  if (dataFinal.isBefore(dayjs('2025-02-22'))) {
    dataFinal = dataFinal.add(9000, 'day');
  }

  return { valor, dataVencimento: dataFinal.toDate() };
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
    .transform((value) => (value === '' || value === undefined ? undefined : Number(value)))
    .optional()
    .refine((val) => val === undefined || (val >= 1 && val <= 120), {
      message: 'Quantidade de parcelas deve ser entre 1 e 120',
    }),
  status: zod.enum(['PENDENTE', 'PAGO', 'CANCELADO', 'AGENDADO']),
  banco: zod.string().min(1, { message: 'Banco é obrigatório!' }),
  statusPagamento: zod.string().optional(),
  codigoTransacao: zod.string().optional(),
  categoria: zod.string().min(1, { message: 'Categoria é obrigatória!' }),
  centroCusto: zod.string().optional(),
});

export function PagarNewEditForm({ currentConta }) {
  const [loading, setLoading] = useState(false);
  const [bancos, setBancos] = useState([]);
  const [bancoMap, setBancoMap] = useState({});
  const [categoriasOrdenadas, setCategoriasOrdenadas] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [atualizarFuturas, setAtualizarFuturas] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await listarCategoriasFinanceiras('DESPESA');
        setCategoriasOrdenadas(data || []);
      } catch (error) {
        toast.error('Erro ao buscar categorias');
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchCentrosCusto = async () => {
      try {
        const data = await listarCentrosCusto();
        setCentrosCusto(data || []);
      } catch (error) {
        toast.error('Erro ao buscar centros de custo');
      }
    };
    fetchCentrosCusto();
  }, []);

  const defaultValues = useMemo(
    () => ({
      descricao: currentConta?.descricao || '',
      nome: currentConta?.nome || '',
      valor: currentConta?.valor ? currentConta.valor.toFixed(2).replace('.', ',') : '',
      dataVencimento: currentConta?.dataVencimento ? dayjs(currentConta.dataVencimento).format('DD/MM/YYYY') : '',
      dataPagamento: currentConta?.dataPagamento ? dayjs(currentConta.dataPagamento).format('DD/MM/YYYY') : '',
      codigoBarras: currentConta?.codigoBarras || '',
      tipo: currentConta?.tipo || 'AVULSA',
      parcelas: currentConta?.parcelas || 1,
      status: currentConta?.status || 'PENDENTE',
      banco: currentConta?.banco?.codigo || '',
      categoria: currentConta?.categoria?._id ?? currentConta?.categoria ?? '',
      centroCusto: currentConta?.centroCusto?._id ?? currentConta?.centroCusto ?? '',
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
  const tipo = watch('tipo');

  useEffect(() => {
    const fetchBancos = async () => {
      try {
        const response = await listarBancos();
        setBancos(response);
        const novoBancoMap = response.reduce((acc, banco) => {
          acc[banco.codigo] = banco._id;
          return acc;
        }, {});
        setBancoMap(novoBancoMap);
      } catch (error) {
        toast.error('Erro ao buscar bancos');
      }
    };
    fetchBancos();
  }, []);

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
      const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      setValue('valor', valorFormatado, { shouldValidate: true });
      setValue('dataVencimento', dayjs(dataVencimento).format('DD/MM/YYYY'), { shouldValidate: true });
      toast.info('Dados extraídos do código de barras!');
    }
  };

  const handleAgendarPagamento = async () => {
    try {
      const { statusPagamento, codigoTransacao } = await registrarContaNoBancoInter(currentConta._id);
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
      const bancoId = bancoMap[data.banco];
      const valor = parseFloat(data.valor.replace(/\./g, '').replace(',', '.').replace('R$', '').trim());

      const [vencDay, vencMonth, vencYear] = data.dataVencimento.split('/');
      const dataVencimentoISO = new Date(`${vencYear}-${vencMonth}-${vencDay}T10:00:00.000Z`);

      let dataPagamentoISO = null;
      if (data.dataPagamento) {
        const [pagDay, pagMonth, pagYear] = data.dataPagamento.split('/');
        dataPagamentoISO = new Date(`${pagYear}-${pagMonth}-${pagDay}T10:00:00.000Z`);
      }

      const updatedData = {
        ...data,
        banco: bancoId,
        valor,
        parcelas: Number(data.parcelas),
        dataVencimento: dataVencimentoISO,
        dataPagamento: dataPagamentoISO,
        centroCusto: data.centroCusto || null,
        categoria: data.categoria || null
      };

      if (currentConta) {
        const payload = atualizarFuturas ? { ...updatedData, atualizarFuturas: true } : updatedData;
        await atualizarContaPagarPorId(currentConta._id, payload);
        toast.success(
          atualizarFuturas
            ? 'Conta e parcelas futuras atualizadas com sucesso'
            : 'Conta atualizada com sucesso'
        );
      } else {
        await criarContaPagar(updatedData);
        toast.success('Conta criada com sucesso');
        router.push('/dashboard/financeiro/pagar');
      }
    } catch (error) {
      toast.error('Erro ao processar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit, (errors) => console.log("ERROS: ", errors))}>
      <Grid container spacing={3}>

        {/* COLUNA ESQUERDA: Identificação */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Dados do Documento</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="codigoBarras"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Código de Barras / Linha Digitável"
                        fullWidth
                        onChange={handleCodigoBarrasChange}
                        error={!!error}
                        helperText={error?.message || "Cole o código para preenchimento automático"}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="nome"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField {...field} label="Nome da Despesa" fullWidth required error={!!error} />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="descricao"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Descrição / Observações" fullWidth rows={4} multiline required />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Classificação</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Controller
                    name="categoria"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={categoriasOrdenadas}
                        getOptionLabel={(option) => option.nome || ''}
                        isOptionEqualToValue={(option, value) => option._id === value}
                        value={categoriasOrdenadas.find((cat) => cat._id === field.value) || null}
                        onChange={(event, newValue) => setValue('categoria', newValue?._id || '')}
                        renderInput={(params) => <TextField {...params} label="Categoria (Despesa)" fullWidth required />}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Controller
                    name="centroCusto"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={centrosCusto}
                        getOptionLabel={(option) => option.nome || ''}
                        isOptionEqualToValue={(option, value) => option._id === value}
                        value={centrosCusto.find((cc) => cc._id === field.value) || null}
                        onChange={(event, newValue) => setValue('centroCusto', newValue?._id || '')}
                        renderInput={(params) => (
                          <TextField {...params} label="Centro de Custo" fullWidth placeholder="Opcional" />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth>
                    <InputLabel>Banco para Pagamento</InputLabel>
                    <Controller
                      name="banco"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label="Banco para Pagamento">
                          {bancos.map((banco) => (
                            <MenuItem key={banco._id} value={banco.codigo}>{banco.nome}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>

        {/* COLUNA DIREITA: Valores e Status */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Financeiro</Typography>

              <Stack spacing={2.5}>
                <Controller
                  name="valor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor da Conta"
                      onChange={handleValorChange}
                      fullWidth
                      required
                      InputProps={{
                        sx: { typography: 'h5', fontWeight: 'bold', color: 'primary.main' }
                      }}
                    />
                  )}
                />

                <Controller
                  name="dataVencimento"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Vencimento"
                      value={dayjs(field.value, 'DD/MM/YYYY').isValid() ? dayjs(field.value, 'DD/MM/YYYY') : null}
                      onChange={(date) => setValue('dataVencimento', dayjs(date).format('DD/MM/YYYY'), { shouldValidate: true })}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  )}
                />

                <Controller
                  name="dataPagamento"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Data do Pagamento"
                      value={dayjs(field.value, 'DD/MM/YYYY').isValid() ? dayjs(field.value, 'DD/MM/YYYY') : null}
                      onChange={(date) => setValue('dataPagamento', dayjs(date).format('DD/MM/YYYY'))}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  )}
                />

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Status">
                        <MenuItem value="PENDENTE">⏳ Pendente</MenuItem>
                        <MenuItem value="PAGO">✅ Pago</MenuItem>
                        <MenuItem value="AGENDADO">📅 Agendado</MenuItem>
                        <MenuItem value="CANCELADO">🚫 Cancelado</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

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

                {tipo === 'RECORRENTE' && (
                  <Controller
                    name="parcelas"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const numParcelas = Number(field.value) || 1;
                      return (
                        <TextField
                          {...field}
                          label="Quantidade de Parcelas"
                          fullWidth
                          type="number"
                          error={!!error}
                          helperText={
                            error?.message ||
                            `Serão criadas ${numParcelas} parcela(s) (uma por mês a partir do vencimento informado).`
                          }
                          inputProps={{ min: 1, max: 120 }}
                        />
                      );
                    }}
                  />
                )}

                {currentConta && currentConta.tipo === 'RECORRENTE' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={atualizarFuturas}
                        onChange={(e) => setAtualizarFuturas(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Aplicar alterações às parcelas futuras (não vencidas)
                      </Typography>
                    }
                  />
                )}
                {currentConta && currentConta.tipo === 'RECORRENTE' && atualizarFuturas && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Valor, nome, descrição, banco, categoria, centro de custo e status serão replicados. As datas de
                    vencimento das parcelas futuras não serão alteradas.
                  </Typography>
                )}
              </Stack>
            </Card>

            {values.codigoTransacao && (
              <Card sx={{ p: 2, borderLeft: (theme) => `4px solid ${theme.palette.success.main}` }}>
                <Typography variant="overline" color="text.secondary">Código de Transação Inter</Typography>
                <Typography variant="subtitle2">{values.codigoTransacao}</Typography>
              </Card>
            )}

            <Stack spacing={2}>
              {values.banco === '77' && (
                <Button
                  fullWidth
                  size="large"
                  onClick={handleAgendarPagamento}
                  variant="outlined"
                  color="warning"
                  disabled={!values.codigoBarras || !!values.codigoTransacao}
                >
                  Agendar no Banco Inter
                </Button>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : currentConta ? 'Salvar Alterações' : 'Cadastrar Conta'}
              </Button>

              <Button fullWidth color="inherit" onClick={() => router.back()}>
                Voltar para Listagem
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
}