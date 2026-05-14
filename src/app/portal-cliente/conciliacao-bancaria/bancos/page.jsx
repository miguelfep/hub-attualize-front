'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NumericFormat } from 'react-number-format';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { SelectContaContabil } from 'src/components/plano-contas';

import { useAuthContext } from 'src/auth/hooks';

import { useBancosCliente, useInstituicoesBancarias } from '../hooks';

// ✅ Helper para formatar data ISO sem problemas de timezone
const formatarDataISO = (dataISO) => {
  if (!dataISO) return '';

  // Se for string ISO, extrair apenas a parte da data (YYYY-MM-DD)
  if (typeof dataISO === 'string' && dataISO.includes('T')) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Se for Date object, usar toLocaleDateString
  if (dataISO instanceof Date) {
    return dataISO.toLocaleDateString('pt-BR');
  }

  // Fallback: tentar criar Date
  try {
    const data = new Date(dataISO);
    // Extrair apenas a parte da data da string ISO original se possível
    if (typeof dataISO === 'string') {
      const match = dataISO.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }
    return data.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

export default function GestaoBancosPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [empresaData, setEmpresaData] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editarBanco, setEditarBanco] = useState(null); // ✅ NOVO: Banco sendo editado
  const [formData, setFormData] = useState({
    codigo: '',
    agencia: '',
    conta: '',
    digitoConta: '',
    tipoConta: 'corrente',
    dataInicio: '',
    saldoInicial: 0,
    contaContabilId: '', // ✅ NOVO: Conta contábil do banco
  });

  // Buscar instituições bancárias disponíveis
  const { instituicoes, loading: loadingInstituicoes } = useInstituicoesBancarias();

  // Buscar dados da empresa
  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!user?.userId) {
        setLoadingEmpresa(false);
        return;
      }
      try {
        setLoadingEmpresa(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dados/${user.userId}`
        );
        setEmpresaData(response.data.data.cliente);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoadingEmpresa(false);
      }
    };
    fetchEmpresaData();
  }, [user?.userId]);

  const clienteId = empresaData?._id || empresaData?.id;

  const { bancos, loading: loadingBancos, criarBanco, desativarBanco, reativarBanco, recarregar } = useBancosCliente(clienteId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.conta) {
      toast.error('Selecione o banco e informe a conta');
      return;
    }

    // ✅ Validação dos novos campos obrigatórios
    if (!formData.dataInicio) {
      toast.error('Data de início é obrigatória');
      return;
    }


    try {
      const dados = {
        codigo: formData.codigo,
        conta: formData.conta,
        tipoConta: formData.tipoConta,
        dataInicio: new Date(formData.dataInicio).toISOString(), // ✅ Converter para ISO
        saldoInicial: parseFloat(formData.saldoInicial),
        saldo: parseFloat(formData.saldoInicial), // Saldo inicial = saldo atual
      };

      if (formData.agencia) dados.agencia = formData.agencia;
      if (formData.digitoConta) dados.digitoConta = formData.digitoConta;
      // ✅ NOVO: Incluir conta contábil se selecionada
      if (formData.contaContabilId) dados.contaContabilId = formData.contaContabilId;

      await criarBanco(dados);

      toast.success('Conta bancária cadastrada com sucesso!');
      setMostrarForm(false);
      setFormData({
        codigo: '',
        agencia: '',
        conta: '',
        digitoConta: '',
        tipoConta: 'corrente',
        dataInicio: '',
        saldoInicial: '',
        contaContabilId: '',
      });
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar conta');
    }
  };

  const handleDesativar = async (bancoId, nome) => {
    if (!window.confirm(`Tem certeza que deseja desativar o banco ${nome}?`)) {
      return;
    }

    try {
      await desativarBanco(bancoId);
      toast.success('Banco desativado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao desativar banco');
    }
  };

  // ✅ NOVO: Reativar banco
  const handleReativar = async (bancoId, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o banco ${nome}?`)) {
      return;
    }

    try {
      await reativarBanco(bancoId);
      toast.success('Banco reativado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao reativar banco');
    }
  };

  // ✅ NOVO: Abrir modal de edição
  const handleEditar = (banco) => {
    // Converter dataInicio de ISO para formato de input date (YYYY-MM-DD)
    const dataInicioFormatada = banco.dataInicio
      ? new Date(banco.dataInicio).toISOString().split('T')[0]
      : '';

    setEditarBanco(banco);
    setFormData({
      codigo: banco.instituicaoBancariaId?.codigo || banco.codigo || '',
      agencia: banco.agencia || '',
      conta: banco.conta || '',
      digitoConta: banco.digitoConta || '',
      tipoConta: banco.tipoConta || 'corrente',
      dataInicio: dataInicioFormatada,
      saldoInicial: banco.saldoInicial || 0,
      contaContabilId: banco.contaContabilId?._id || banco.contaContabilId || '',
    });
  };

  // ✅ NOVO: Fechar modal de edição
  const handleFecharEdicao = () => {
    setEditarBanco(null);
    setFormData({
      codigo: '',
      agencia: '',
      conta: '',
      digitoConta: '',
      tipoConta: 'corrente',
      dataInicio: '',
      saldoInicial: 0,
      contaContabilId: '',
    });
  };

  // ✅ NOVO: Salvar edição do banco
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    if (!editarBanco) return;

    // Validações
    if (!formData.conta) {
      toast.error('A conta é obrigatória');
      return;
    }

    if (!formData.dataInicio) {
      toast.error('Data de início é obrigatória');
      return;
    }

    if (formData.saldoInicial === undefined || formData.saldoInicial === null) {
      toast.error('Saldo inicial é obrigatório');
      return;
    }

    try {
      const dados = {
        agencia: formData.agencia || undefined,
        conta: formData.conta,
        digitoConta: formData.digitoConta || undefined,
        tipoConta: formData.tipoConta,
        dataInicio: new Date(formData.dataInicio).toISOString(),
        saldoInicial: parseFloat(formData.saldoInicial),
        contaContabilId: formData.contaContabilId || undefined,
      };

      // Verificar se saldo inicial ou data de início foram alterados
      const saldoInicialAlterado = formData.saldoInicial !== (editarBanco.saldoInicial || 0);
      const dataInicioAlterada = formData.dataInicio !== (editarBanco.dataInicio ? new Date(editarBanco.dataInicio).toISOString().split('T')[0] : '');

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}contas/bancos/${editarBanco._id}`,
        dados
      );

      // ✅ A resposta pode ter success ou retornar diretamente os dados
      const updatedBanco = response.data?.success ? response.data.data : response.data;

      if (updatedBanco) {
        // Mostrar mensagem de sucesso com informação sobre recálculo
        if (updatedBanco.saldoRecalculado) {
          toast.success(updatedBanco.mensagem || 'Banco atualizado. Saldo recalculado automaticamente.', {
            duration: 5000,
          });
        } else {
          toast.success('Banco atualizado com sucesso!');
        }

        // Recarregar lista de bancos
        await recarregar();
        handleFecharEdicao();
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar banco');
      }
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Erro ao atualizar banco';
      toast.error(errorMessage);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading empresa
  if (loadingEmpresa) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="h6">Carregando dados do cliente...</Typography>
        </Stack>
      </Box>
    );
  }

  // Erro ao carregar empresa
  if (!empresaData || !clienteId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Erro ao carregar dados do cliente</Typography>
          <Typography variant="body2">
            Não foi possível identificar o cliente. Por favor, faça login novamente.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push(`${paths.cliente.conciliacaoBancaria}/status`)}
        >
          Voltar
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            🏦 Meus Bancos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as contas bancárias da sua empresa
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => { setMostrarForm(!mostrarForm); handleFecharEdicao(); }}
        >
          {mostrarForm ? 'Cancelar' : 'Adicionar Banco'}
        </Button>
      </Stack>

      {/* Formulário de Cadastro */}
      {mostrarForm && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cadastrar Nova Conta Bancária
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selecione o banco e informe os dados da sua conta
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 3, '& > *': { p: 2 } }}>
              <Grid xs={12} md={12}>
                <Autocomplete
                  options={instituicoes}
                  value={instituicoes.find((inst) => inst.codigo === formData.codigo) || null}
                  onChange={(event, newValue) => {
                    handleChange('codigo', newValue?.codigo || '');
                  }}
                  loading={loadingInstituicoes}
                  disabled={loadingInstituicoes}
                  getOptionLabel={(option) => {
                    if (!option) return '';
                    return `${option.codigo} - ${option.nome}`;
                  }}
                  isOptionEqualToValue={(option, value) => option.codigo === value.codigo}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Banco"
                      required
                      placeholder="Digite o código ou nome do banco..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingInstituicoes ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      helperText="Busque por código (ex: 001) ou nome (ex: Banco do Brasil)"
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase().trim();
                    if (!searchTerm) return options;

                    return options.filter((option) => {
                      const codigo = (option.codigo || '').toLowerCase();
                      const nome = (option.nome || '').toLowerCase();
                      const nomeCompleto = (option.nomeCompleto || '').toLowerCase();

                      // Buscar por código OU nome
                      return codigo.includes(searchTerm) ||
                        nome.includes(searchTerm) ||
                        nomeCompleto.includes(searchTerm);
                    });
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option._id}>
                      <Stack direction="row" spacing={1} alignItems="center" width="100%">
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace" sx={{ minWidth: 50 }}>
                          {option.codigo}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {option.nome}
                          </Typography>
                          {option.nomeCompleto && option.nomeCompleto !== option.nome && (
                            <Typography variant="caption" color="text.secondary">
                              {option.nomeCompleto}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  noOptionsText={
                    loadingInstituicoes
                      ? 'Carregando bancos...'
                      : 'Nenhum banco encontrado. Tente buscar por código ou nome.'
                  }
                />
              </Grid>

              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Agência"
                  value={formData.agencia}
                  onChange={(e) => handleChange('agencia', e.target.value)}
                  placeholder="Ex: 0001"
                  helperText="Opcional"
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Conta"
                  value={formData.conta}
                  onChange={(e) => handleChange('conta', e.target.value)}
                  placeholder="Ex: 12345-6"
                />
              </Grid>

              <Grid xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Dígito"
                  value={formData.digitoConta}
                  onChange={(e) => handleChange('digitoConta', e.target.value)}
                  placeholder="6"
                  inputProps={{ maxLength: 1 }}
                  helperText="Opcional"
                />
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Conta</InputLabel>
                  <Select
                    value={formData.tipoConta}
                    onChange={(e) => handleChange('tipoConta', e.target.value)}
                    label="Tipo de Conta"
                  >
                    <MenuItem value="corrente">Corrente</MenuItem>
                    <MenuItem value="poupanca">Poupança</MenuItem>
                    <MenuItem value="investimento">Investimento</MenuItem>
                    <MenuItem value="pagamento">Pagamento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* ✅ NOVO: Data de Início (Obrigatório) */}
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Data de Início *"
                  value={formData.dataInicio}
                  onChange={(e) => handleChange('dataInicio', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Data a partir da qual o banco começará a conciliar extratos"
                  inputProps={{
                    max: new Date().toISOString().split('T')[0], // Não permitir datas futuras
                  }}
                />
              </Grid>

              {/* ✅ NOVO: Saldo Inicial (Obrigatório) */}
              <Grid xs={12} md={6}>
                <NumericFormat
                  customInput={TextField}
                  fullWidth
                  required
                  label="Saldo Inicial (R$)"
                  value={formData.saldoInicial}
                  onValueChange={(values) => {
                    handleChange('saldoInicial', values.value);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="R$ 0,00"
                  helperText="Saldo da conta bancária na data de início"
                />
              </Grid>

              {/* ✅ NOVO: Conta Contábil do Banco (Opcional) */}
              <Grid xs={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Conta Contábil do Banco
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Opcional - para exportação Domínio Sistemas)
                    </Typography>
                  </Typography>
                  {clienteId ? (
                    <SelectContaContabil
                      clienteId={clienteId}
                      value={formData.contaContabilId}
                      onChange={(contaId) => {
                        handleChange('contaContabilId', contaId || '');
                      }}
                      label="Selecione a conta contábil do banco"
                      disabled={loadingInstituicoes}
                      size="medium"
                      filterGroup11 // ✅ Filtrar apenas Grupo 1.1 (Disponibilidades)
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Carregando dados do cliente...
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Se não selecionar, o sistema tentará encontrar automaticamente pelo nome da instituição bancária.
                    Recomendado vincular manualmente para garantir o código correto na exportação.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button variant="outlined" onClick={() => { setMostrarForm(false); handleFecharEdicao(); }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                Cadastrar Conta
              </Button>
            </Stack>
          </form>
        </Card>
      )}

      {/* Lista de Bancos */}
      {loadingBancos ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {bancos.length === 0 ? (
            <Card sx={{ p: 5, textAlign: 'center' }}>
              <Iconify icon="eva:credit-card-outline" width={64} color="text.disabled" sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma conta bancária cadastrada
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Cadastre sua primeira conta para começar a conciliar extratos
              </Typography>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => setMostrarForm(true)}
              >
                Cadastrar Primeira Conta
              </Button>
            </Card>
          ) : (
            <>
              {/* ✅ Bancos Ativos */}
              {(() => {
                const bancosAtivos = bancos.filter((b) => b.status !== false && b.ativo !== false);
                return bancosAtivos.length > 0 ? (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Bancos Ativos
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 3, '& > *': { p: 2 } }}>
                      {bancosAtivos.map((banco) => (
                        <Grid xs={12} md={6} lg={4} key={banco._id}>
                          <Card sx={{ p: 3, height: '100%' }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Iconify icon="eva:credit-card-fill" width={24} color="primary.main" />
                                  <Typography variant="h6">
                                    {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {banco.instituicaoBancariaId?.codigo || banco.codigo || 'N/A'}
                                </Typography>
                              </Stack>

                              <Divider />

                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Agência:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {banco.agencia || 'N/A'}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Conta:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {banco.conta}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Tipo:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                    {banco.tipoConta || 'N/A'}
                                  </Typography>
                                </Stack>

                                {/* ✅ Saldo Atual */}
                                {banco.saldo !== undefined && banco.saldo !== null && (
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Saldo Atual:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                      {fCurrency(banco.saldo)}
                                    </Typography>
                                  </Stack>
                                )}

                                {/* ✅ Saldo Inicial e Data de Início */}
                                {banco.saldoInicial !== undefined && banco.saldoInicial !== null && (
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Saldo Inicial:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {fCurrency(banco.saldoInicial)}
                                      {banco.dataInicio && (
                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                          (em {formatarDataISO(banco.dataInicio)})
                                        </Typography>
                                      )}
                                    </Typography>
                                  </Stack>
                                )}

                                {/* ✅ Variação do Saldo */}
                                {banco.saldo !== undefined && banco.saldoInicial !== undefined && (
                                  <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                      Variação:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={
                                        (banco.saldo || 0) >= (banco.saldoInicial || 0) ? 'success.main' : 'error.main'
                                      }
                                    >
                                      {(banco.saldo || 0) >= (banco.saldoInicial || 0) ? '+' : ''}
                                      {fCurrency((banco.saldo || 0) - (banco.saldoInicial || 0))}
                                    </Typography>
                                  </Stack>
                                )}

                                {/* ✅ Conta Contábil Vinculada */}
                                {(() => {
                                  // Verificar se tem conta contábil (pode ser ID string ou objeto populado)
                                  const contaContabil = banco.contaContabilId || banco.contaContabil;
                                  if (!contaContabil) return null;

                                  // Se for objeto populado, exibir dados
                                  if (typeof contaContabil === 'object' && contaContabil !== null) {
                                    return (
                                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Conta Contábil:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium" color="success.main">
                                          {contaContabil.codigoSequencial || contaContabil.codigo || 'N/A'} - {contaContabil.nome || 'N/A'}
                                        </Typography>
                                      </Stack>
                                    );
                                  }

                                  // Se for apenas ID, mostrar que está vinculada
                                  if (typeof contaContabil === 'string') {
                                    return (
                                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Conta Contábil:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium" color="success.main">
                                          ✓ Vinculada
                                        </Typography>
                                      </Stack>
                                    );
                                  }

                                  return null;
                                })()}
                              </Stack>

                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  startIcon={<Iconify icon="eva:edit-fill" />}
                                  onClick={() => handleEditar(banco)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                                  onClick={() => handleDesativar(banco._id, banco.nome)}
                                >
                                  Desativar
                                </Button>
                              </Stack>
                            </Stack>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : null;
              })()}

              {/* ✅ Bancos Inativos */}
              {(() => {
                const bancosInativos = bancos.filter((b) => b.status === false || b.ativo === false);
                return bancosInativos.length > 0 ? (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Bancos Inativos
                    </Typography>
                    <Grid container spacing={3}>
                      {bancosInativos.map((banco) => (
                        <Grid xs={12} md={6} lg={4} key={banco._id}>
                          <Card sx={{ p: 3, height: '100%', opacity: 0.7, bgcolor: 'grey.50' }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Iconify icon="eva:credit-card-outline" width={24} color="text.disabled" />
                                  <Typography variant="h6" color="text.disabled">
                                    {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'}
                                  </Typography>
                                </Stack>
                                <Chip label="Inativo" size="small" color="error" />
                              </Stack>

                              <Divider />

                              <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Agência:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {banco.agencia || 'N/A'}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Conta:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {banco.conta}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Tipo:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                    {banco.tipoConta || 'N/A'}
                                  </Typography>
                                </Stack>
                              </Stack>

                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                fullWidth
                                startIcon={<Iconify icon="eva:refresh-fill" />}
                                onClick={() => handleReativar(banco._id, banco.instituicaoBancariaId?.nome || banco.nome)}
                              >
                                Reativar Banco
                              </Button>
                            </Stack>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : null;
              })()}
            </>
          )}
        </>
      )}

      {/* ✅ NOVO: Modal de Edição de Banco */}
      <Dialog
        open={!!editarBanco}
        onClose={handleFecharEdicao}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon="eva:edit-fill" width={24} color="primary.main" />
            <Typography variant="h6">
              Editar Banco - {editarBanco?.instituicaoBancariaId?.nome || editarBanco?.nome || 'Banco'}
            </Typography>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleSalvarEdicao}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* ✅ Aviso sobre recálculo */}
              {editarBanco && (
                (() => {
                  const saldoInicialAlterado =
                    formData.saldoInicial !== (editarBanco.saldoInicial || 0);
                  const dataInicioAlterada =
                    formData.dataInicio !==
                    (editarBanco.dataInicio
                      ? new Date(editarBanco.dataInicio).toISOString().split('T')[0]
                      : '');

                  if (saldoInicialAlterado || dataInicioAlterada) {
                    return (
                      <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-fill" />}>
                        <Typography variant="body2">
                          {saldoInicialAlterado && dataInicioAlterada
                            ? 'Saldo inicial e data de início alterados. O saldo atual será recalculado automaticamente com base em todas as transações conciliadas.'
                            : saldoInicialAlterado
                              ? 'Saldo inicial alterado. O saldo atual será recalculado automaticamente com base em todas as transações conciliadas.'
                              : 'Data de início alterada. O saldo atual será recalculado automaticamente.'}
                        </Typography>
                      </Alert>
                    );
                  }
                  return null;
                })()
              )}

              {/* Saldo Atual (somente leitura) */}
              {editarBanco && (
                <TextField
                  fullWidth
                  label="Saldo Atual"
                  value={fCurrency(editarBanco.saldo || 0)}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText={
                    (() => {
                      const saldoInicialAlterado =
                        formData.saldoInicial !== (editarBanco.saldoInicial || 0);
                      const dataInicioAlterada =
                        formData.dataInicio !==
                        (editarBanco.dataInicio
                          ? new Date(editarBanco.dataInicio).toISOString().split('T')[0]
                          : '');
                      return saldoInicialAlterado || dataInicioAlterada
                        ? 'Será recalculado após salvar'
                        : 'Baseado no saldo inicial e transações conciliadas';
                    })()
                  }
                  sx={{
                    '& .MuiInputBase-input': {
                      bgcolor: 'grey.50',
                    },
                  }}
                />
              )}

              <Grid container spacing={2} sx={{ mb: 3, '& > *': { p: 2 } }}>
                <Grid xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Agência"
                    value={formData.agencia}
                    onChange={(e) => handleChange('agencia', e.target.value)}
                    placeholder="Ex: 0001"
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Conta *"
                    value={formData.conta}
                    onChange={(e) => handleChange('conta', e.target.value)}
                    placeholder="Ex: 12345-6"
                  />
                </Grid>

                <Grid xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Dígito"
                    value={formData.digitoConta}
                    onChange={(e) => handleChange('digitoConta', e.target.value)}
                    placeholder="6"
                    inputProps={{ maxLength: 1 }}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Conta</InputLabel>
                    <Select
                      value={formData.tipoConta}
                      onChange={(e) => handleChange('tipoConta', e.target.value)}
                      label="Tipo de Conta"
                    >
                      <MenuItem value="corrente">Corrente</MenuItem>
                      <MenuItem value="poupanca">Poupança</MenuItem>
                      <MenuItem value="investimento">Investimento</MenuItem>
                      <MenuItem value="pagamento">Pagamento</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Data de Início *"
                    value={formData.dataInicio}
                    onChange={(e) => handleChange('dataInicio', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Data a partir da qual o banco começará a conciliar extratos"
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                    }}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    required
                    label="Saldo Inicial (R$) *"
                    value={formData.saldoInicial}
                    onValueChange={(values) => {
                      handleChange('saldoInicial', values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    placeholder="R$ 0,00"
                    helperText="Saldo da conta bancária na data de início. Se alterado, o saldo atual será recalculado."
                  />
                </Grid>

                <Grid xs={12}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Conta Contábil do Banco
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Opcional - para exportação Domínio Sistemas)
                      </Typography>
                    </Typography>
                    {clienteId ? (
                      <SelectContaContabil
                        clienteId={clienteId}
                        value={formData.contaContabilId}
                        onChange={(contaId) => {
                          handleChange('contaContabilId', contaId || '');
                        }}
                        label="Selecione a conta contábil do banco"
                        size="medium"
                        filterGroup11 // ✅ Filtrar apenas Grupo 1.1 (Disponibilidades)
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Carregando dados do cliente...
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Se não selecionar, o sistema tentará encontrar automaticamente pelo nome da instituição bancária.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button variant="outlined" onClick={handleFecharEdicao}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Salvar Alterações
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
