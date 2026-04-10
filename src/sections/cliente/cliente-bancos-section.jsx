'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { useInstituicoesBancarias } from 'src/app/portal-cliente/conciliacao-bancaria/hooks';

import { Iconify } from 'src/components/iconify';
import { SelectContaContabil } from 'src/components/plano-contas';

// ✅ Helper para formatar data ISO sem problemas de timezone
const formatarDataISO = (dataISO) => {
  if (!dataISO) return '';
  
  if (typeof dataISO === 'string' && dataISO.includes('T')) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  if (dataISO instanceof Date) {
    return dataISO.toLocaleDateString('pt-BR');
  }
  
  try {
    const data = new Date(dataISO);
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

/** Axios interceptor retorna `response.data` no reject — não há `error.response`. */
function getApiErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return 'Erro ao processar solicitação';
  if (typeof error.message === 'string' && error.message) return error.message;
  if (typeof error.error === 'string') return error.error;
  if (error.error && typeof error.error === 'object' && error.error.message) return error.error.message;
  if (Array.isArray(error.errors)) return error.errors.filter(Boolean).join(', ');
  return 'Erro ao processar solicitação';
}

/**
 * Componente para gerenciar bancos do cliente no dashboard
 */
export default function ClienteBancosSection({ clienteId }) {
  const [loading, setLoading] = useState(true);
  const [bancos, setBancos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editarBanco, setEditarBanco] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    agencia: '',
    conta: '',
    digitoConta: '',
    tipoConta: 'corrente',
    dataInicio: '',
    saldoInicial: 0,
    contaContabilId: '',
  });

  // ✅ Usar hook existente para carregar instituições bancárias
  const { instituicoes, loading: loadingInstituicoes } = useInstituicoesBancarias();

  // Carregar bancos do cliente
  useEffect(() => {
    const carregarBancos = async () => {
      if (!clienteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
          { params: { clienteId, incluirInativos: true } }
        );
        setBancos(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar bancos:', error);
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    // ✅ Só carregar se clienteId estiver disponível
    if (clienteId) {
      carregarBancos();
    }
  }, [clienteId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /** Não usar <form> aqui: este bloco fica dentro do formulário principal do cliente (HTML inválido e submit errado). */
  const cadastrarConta = async () => {
    if (!formData.codigo || !formData.conta) {
      toast.error('Selecione o banco e informe a conta');
      return;
    }

    if (!formData.dataInicio) {
      toast.error('Data de início é obrigatória');
      return;
    }

    const saldoRaw = formData.saldoInicial;
    if (saldoRaw === '' || saldoRaw === null || saldoRaw === undefined) {
      toast.error('Saldo inicial é obrigatório');
      return;
    }
    const saldoNum =
      typeof saldoRaw === 'number'
        ? saldoRaw
        : parseFloat(String(saldoRaw).replace(/\./g, '').replace(',', '.'));
    if (Number.isNaN(saldoNum)) {
      toast.error('Informe um saldo inicial válido');
      return;
    }

    try {
      const dados = {
        codigo: formData.codigo,
        conta: formData.conta,
        tipoConta: formData.tipoConta,
        dataInicio: new Date(`${formData.dataInicio}T12:00:00`).toISOString(),
        saldoInicial: saldoNum,
        saldo: saldoNum,
      };

      if (formData.agencia) dados.agencia = formData.agencia;
      if (formData.digitoConta) dados.digitoConta = formData.digitoConta;
      if (formData.contaContabilId) dados.contaContabilId = formData.contaContabilId;

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}financeiro/banco/cadastrar`, {
        ...dados,
        clienteId,
      });

      toast.success('Conta bancária cadastrada com sucesso!');
      setMostrarForm(false);
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

      const bancosResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`, {
        params: { clienteId, incluirInativos: true },
      });
      setBancos(bancosResponse.data || []);
    } catch (error) {
      console.error('Erro ao cadastrar conta:', error);
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleEditar = (banco) => {
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

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    if (!editarBanco) return;

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
        dataInicio: new Date(`${formData.dataInicio}T12:00:00`).toISOString(),
        saldoInicial:
          typeof formData.saldoInicial === 'number'
            ? formData.saldoInicial
            : parseFloat(String(formData.saldoInicial).replace(/\./g, '').replace(',', '.')),
        contaContabilId: formData.contaContabilId || undefined,
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}contas/bancos/${editarBanco._id}`,
        dados
      );

      const updatedBanco = response.data?.success ? response.data.data : response.data;

      if (updatedBanco) {
        if (updatedBanco.saldoRecalculado) {
          toast.success(updatedBanco.mensagem || 'Banco atualizado. Saldo recalculado automaticamente.', {
            duration: 5000,
          });
        } else {
          toast.success('Banco atualizado com sucesso!');
        }

        const bancosResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
          { params: { clienteId, incluirInativos: true } }
        );
        setBancos(bancosResponse.data || []);
        handleFecharEdicao();
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar banco');
      }
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDesativar = async (bancoId, nome) => {
    if (!window.confirm(`Tem certeza que deseja desativar o banco ${nome}?`)) {
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos/${bancoId}`);
      toast.success('Banco desativado com sucesso!');

      // Recarregar bancos
      const bancosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
        { params: { clienteId, incluirInativos: true } }
      );
      setBancos(bancosResponse.data || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleReativar = async (bancoId, nome) => {
    if (!window.confirm(`Tem certeza que deseja reativar o banco ${nome}?`)) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}contas/bancos/${bancoId}`,
        { status: true, ativo: true }
      );

      const bancoReativado = response.data?.success ? response.data.data : response.data;

      if (bancoReativado) {
        toast.success('Banco reativado com sucesso!');

        // Recarregar bancos
        const bancosResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`,
          { params: { clienteId, incluirInativos: true } }
        );
        setBancos(bancosResponse.data || []);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (!clienteId) {
    return (
      <Alert severity="info">
        Selecione um cliente para gerenciar os bancos.
      </Alert>
    );
  }

  const bancosAtivos = bancos.filter((b) => b.status !== false && b.ativo !== false);
  const bancosInativos = bancos.filter((b) => b.status === false || b.ativo === false);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6">🏦 Bancos do Cliente</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => setMostrarForm(!mostrarForm)}
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
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid xs={12}>
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
                      label="Banco *"
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
                    />
                  )}
                />
              </Grid>

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
                  value={formData.saldoInicial === undefined ? '' : formData.saldoInicial}
                  onValueChange={(values) => {
                    handleChange(
                      'saldoInicial',
                      values.floatValue === undefined ? undefined : values.floatValue
                    );
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

              <Grid xs={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Conta Contábil do Banco
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Opcional - para exportação Domínio Sistemas)
                    </Typography>
                  </Typography>
                  <SelectContaContabil
                    clienteId={clienteId}
                    value={formData.contaContabilId}
                    onChange={(contaId) => {
                      handleChange('contaContabilId', contaId || '');
                    }}
                    label="Selecione a conta contábil do banco"
                    disabled={loadingInstituicoes}
                    size="medium"
                    filterGroup11
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Se não selecionar, o sistema tentará encontrar automaticamente pelo nome da instituição bancária.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="button" variant="outlined" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="contained" onClick={cadastrarConta}>
                Cadastrar Conta
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Lista de Bancos */}
      {loading ? (
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
                Cadastre a primeira conta para começar a conciliar extratos
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
              {/* Bancos Ativos */}
              {bancosAtivos.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Bancos Ativos
                  </Typography>
                  <Grid container spacing={3}>
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

                              {(() => {
                                const contaContabil = banco.contaContabilId || banco.contaContabil;
                                if (!contaContabil) return null;
                                
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
                                onClick={() => handleDesativar(banco._id, banco.instituicaoBancariaId?.nome || banco.nome)}
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
              )}

              {/* Bancos Inativos */}
              {bancosInativos.length > 0 && (
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
              )}
            </>
          )}
        </>
      )}

      {/* Modal de Edição de Banco */}
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
              {/* Aviso sobre recálculo */}
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

              <Grid container spacing={2}>
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
                    value={formData.saldoInicial === undefined ? '' : formData.saldoInicial}
                    onValueChange={(values) => {
                      handleChange(
                        'saldoInicial',
                        values.floatValue === undefined ? undefined : values.floatValue
                      );
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
                    <SelectContaContabil
                      clienteId={clienteId}
                      value={formData.contaContabilId}
                      onChange={(contaId) => {
                        handleChange('contaContabilId', contaId || '');
                      }}
                      label="Selecione a conta contábil do banco"
                      size="medium"
                      filterGroup11
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Se não selecionar, o sistema tentará encontrar automaticamente pelo nome da instituição bancária.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button type="button" variant="outlined" onClick={handleFecharEdicao}>
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
