'use client';

import React from 'react';
import { LazyMotion, m as motion, domAnimation } from 'framer-motion';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Stack, Button, Dialog, Divider, MenuItem, TextField, Typography, CardContent, DialogTitle, DialogContent, DialogActions, CircularProgress, Autocomplete } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import { buscarCep } from 'src/actions/cep';
import { usePortalClientes, usePortalServicos, portalCreateCliente, portalCreateServico, portalCreateOrcamento } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { NovoOrcamentoPageSkeleton } from 'src/components/skeleton/PortalNovaVendaPageSkeleton';

import { useAuthContext } from 'src/auth/hooks';


export default function NovoOrcamentoPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos } = useSettings();
  const router = useRouter();

  const [saving, setSaving] = React.useState(false);
  const [filtersCli, setFiltersCli] = React.useState({ status: 'true', search: '' });
  const { data: clientes, mutate: mutateClientes } = usePortalClientes(clienteProprietarioId, filtersCli);
  const { data: servicos, mutate: mutateServicos } = usePortalServicos(clienteProprietarioId, { status: 'true' });

  const [form, setForm] = React.useState({
    clienteDoClienteId: '',
    dataValidade: '',
    observacoes: '',
    condicoesPagamento: '',
  });
  const [itens, setItens] = React.useState([]);
  const [openNovoCliente, setOpenNovoCliente] = React.useState(false);
  const [openNovoServico, setOpenNovoServico] = React.useState(false);
  const onlyDigits = (v) => (v || '').replace(/\D/g, '');
  const formatBRLInput = (v) => { const digits = onlyDigits(v); const num = Number(digits) / 100; return { text: fCurrency(num), value: num }; };

  const [errors, setErrors] = React.useState({});
  const [fetchingCep, setFetchingCep] = React.useState(false);

  const validateForm = () => {
    const newErrors = {};
    const docDigits = onlyDigits(quickCli.doc);

    if (!quickCli.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!quickCli.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(quickCli.email)) {
      newErrors.email = 'Email inválido';
    }
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      newErrors.doc = 'CPF/CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateItens = () => {
    const hasError = itens.some(item => {
      if (!item.servicoId) {
        toast.error('Existe um item na lista sem um serviço selecionado.');
        return true;
      }

      if (!item.quantidade || item.quantidade <= 0) {
        const nomeServico = item.descricao || item.servicoNome || 'um dos serviços';
        toast.error(`A quantidade de "${nomeServico}" deve ser maior que zero.`);
        return true;
      }

      if (item.valorUnitario === null || item.valorUnitario === undefined || item.valorUnitario < 0) {
        const nomeServico = item.descricao || item.servicoNome || 'um dos serviços';
        toast.error(`O valor de "${nomeServico}" não pode ser negativo.`);
        return true;
      }

      return false;
    });

    return !hasError;
  };

  // Máscaras CPF/CNPJ, Telefone e CEP
  const formatCEP = (v) => {
    const d = onlyDigits(v).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
  };
  const formatPhone = (v) => {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 10) {
      return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m, a, b, c) => [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' '));
    }
    return d.replace(/(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m, a, b, c) => [a && `(${a})`, b, c && `-${c}`].filter(Boolean).join(' '));
  };
  const formatCPF = (v) => {
    const d = onlyDigits(v).slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const formatCNPJ = (v) => {
    const d = onlyDigits(v).slice(0, 14);
    return d
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };
  const formatCPFOrCNPJ = (v) => {
    const d = onlyDigits(v);
    return d.length > 11 ? formatCNPJ(d) : formatCPF(d);
  };

  const initialState = {
    nome: '',
    doc: '',
    email: '',
    telefone: '',
    endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  }

  const [quickCli, setQuickCli] = React.useState(initialState);

  const handleCloseModal = () => {
    setOpenNovoCliente(false);
    setQuickCli(initialState);
    setErrors({});
  }

  const handleQuickCepBlur = async () => {
    const raw = onlyDigits(quickCli.endereco.cep);
    if (raw.length !== 8) return;
    try {
      setFetchingCep(true);
      const data = await buscarCep(raw);
      setQuickCli((q) => ({
        ...q,
        endereco: {
          ...q.endereco,
          rua: data.rua || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
        },
      }));
    } catch (e) {
      toast.error('CEP não encontrado');
    } finally {
      setFetchingCep(false);
    }
  };

  if (loadingEmpresas || !clienteProprietarioId) return <NovoOrcamentoPageSkeleton />;
  if (!podeCriarOrcamentos) return <Typography>Funcionalidade não disponível</Typography>;

  const addItem = () => setItens((arr) => {
    if (arr.length >= 1) { toast.error('Apenas 1 item é permitido'); return arr; }
    return [...arr, { servicoId: '', quantidade: 1, valorUnitario: 0, valorUnitarioText: fCurrency(0), desconto: 0, descontoText: fCurrency(0), descricao: '' }];
  });
  const rmItem = (i) => setItens((arr) => arr.filter((_, idx) => idx !== i));
  const setItemField = (i, field, value) => setItens((arr) => arr.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));

  const handleServicoChange = (i, id) => {
    const s = (servicos || []).find((x) => x._id === id);
    const valor = Number(s?.valor || 0);
    setItens((arr) => arr.map((it, idx) => (idx === i ? { ...it, servicoId: id, valorUnitario: valor, valorUnitarioText: fCurrency(valor), descricao: s?.descricao || '' } : it)));
  };

  const subtotal = itens.reduce((acc, it) => acc + (Number(it.quantidade) * Number(it.valorUnitario) - Number(it.desconto || 0)), 0);
  const total = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clienteDoClienteId) { toast.error('É obritatório selecionar um cliente'); return; }
    if (!form.dataValidade) { toast.error('É obrigatório selecionar uma data de validade'); return; }
    if (!itens.length) { toast.error('Adicione pelo menos um item de serviço ao orçamento.'); return; }
    if (!validateItens()) return;
    try {
      setSaving(true);
      const created = await portalCreateOrcamento({
        clienteProprietarioId,
        clienteDoClienteId: form.clienteDoClienteId,
        dataValidade: form.dataValidade,
        itens,
        observacoes: form.observacoes,
        condicoesPagamento: form.condicoesPagamento,
      });
      toast.success('Orçamento criado com sucesso!');
      const newId = created?._id || created?.data?._id;
      if (newId) {
        router.replace(`${paths.cliente.orcamentos.root}/${newId}`);
      } else {
        router.replace(paths.cliente.orcamentos.root);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar orçamento';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

return (
  <LazyMotion features={domAnimation}>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Nova Venda
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0. }}>
                Preencha os dados da venda e adicione o item de serviço.
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
            >
              <Button href="../vendas" variant="outlined" color="inherit">
                Cancelar
              </Button>
              <LoadingButton type="submit" variant="contained" loading={saving}>
                Salvar
              </LoadingButton>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Dados da Venda
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={8}>
                    <Autocomplete
                      fullWidth
                      options={Array.isArray(clientes) ? clientes : []}
                      getOptionLabel={(option) => {
                        if (!option) return '';
                        const nome = option.nome || '';
                        const doc = option.cpfCnpj ? ` - ${option.cpfCnpj}` : '';
                        return `${nome}${doc}`;
                      }}
                      value={clientes?.find((c) => c._id === form.clienteDoClienteId) || null}
                      onChange={(event, newValue) => {
                        setForm((f) => ({ ...f, clienteDoClienteId: newValue?._id || '' }));
                      }}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cliente"
                          placeholder="Digite para buscar o cliente..."
                        />
                      )}
                      noOptionsText="Nenhum cliente encontrado"
                    />
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Button
                      onClick={() => setOpenNovoCliente(true)}
                      fullWidth
                      startIcon={<Iconify icon="solar:user-plus-bold" />}
                      variant="outlined"
                      sx={{ height: '100%' }}
                    >
                      Novo Cliente
                    </Button>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Validade"
                      value={form.dataValidade}
                      onChange={(e) => setForm((f) => ({ ...f, dataValidade: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">Item do Serviço</Typography>
                  <Button
                    onClick={addItem}
                    startIcon={<Iconify icon="solar:add-circle-bold" />}
                    disabled={itens.length >= 1}
                  >
                    Adicionar Item
                  </Button>
                </Stack>
                <Stack spacing={3}>
                  {itens.map((it, i) => (
                    <Box key={i} >
                      <Grid container spacing={2}>
                        <Grid xs={12}>
                          <TextField fullWidth select label="Serviço" value={it.servicoId} onChange={(e) => handleServicoChange(i, e.target.value)}>
                            <MenuItem value=""><em>Selecione</em></MenuItem>
                            {(servicos || []).map((s) => (<MenuItem key={s._id} value={s._id}>{s.nome}</MenuItem>))}
                          </TextField>
                        </Grid>
                        <Grid xs={12}>
                          <TextField fullWidth label="Descrição" value={it.descricao} onChange={(e) => setItemField(i, 'descricao', e.target.value)} />
                        </Grid>
                        <Grid xs={6} sm={4} md={3}>
                          <TextField fullWidth type="number" label="Qtd" value={it.quantidade} onChange={(e) => setItemField(i, 'quantidade', Number(e.target.value))} />
                        </Grid>
                        <Grid xs={6} sm={4} md={3}>
                          <TextField fullWidth label="Vlr Unit" value={it.valorUnitarioText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItens((arr) => arr.map((item, idx) => (idx === i ? { ...item, valorUnitario: value, valorUnitarioText: text } : item))); }} />
                        </Grid>
                        <Grid xs={12} sm={4} md={3}>
                          <TextField fullWidth label="Desconto" value={it.descontoText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItens((arr) => arr.map((item, idx) => (idx === i ? { ...item, desconto: value, descontoText: text } : item))); }} />
                        </Grid>
                        <Grid xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button color="error" onClick={() => rmItem(i)} startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}>Remover</Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  {itens.length === 0 && (
                     <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Nenhum item adicionado.</Typography>
                  )}
                </Stack>
              </Box>
              
              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Observações e Totais
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <TextField fullWidth multiline minRows={3} label="Observações" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <TextField fullWidth multiline minRows={3} label="Condições de Pagamento" value={form.condicoesPagamento} onChange={(e) => setForm((f) => ({ ...f, condicoesPagamento: e.target.value }))} />
                  </Grid>
                  <Grid xs={12}>
                    <Stack spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }} sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                      <Typography variant="body1">Subtotal: <strong>{fCurrency(subtotal)}</strong></Typography>
                      <Typography variant="h6">Total: <strong>{fCurrency(total)}</strong></Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </form>

      <Dialog open={openNovoCliente} onClose={() => setOpenNovoCliente(false)} fullWidth maxWidth="md">
        <DialogTitle>Novo Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField fullWidth label="Nome" value={quickCli.nome} onChange={(e) => setQuickCli((q) => ({ ...q, nome: e.target.value }))} error={!!errors.nome} helperText={errors.nome} />
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth label="CPF/CNPJ" value={quickCli.doc} onChange={(e) => setQuickCli((q) => ({ ...q, doc: formatCPFOrCNPJ(e.target.value) }))} error={!!errors.doc} helperText={errors.doc} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Email" value={quickCli.email} onChange={(e) => setQuickCli((q) => ({ ...q, email: e.target.value }))} error={!!errors.email} helperText={errors.email} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Telefone" value={quickCli.telefone} onChange={(e) => setQuickCli((q) => ({ ...q, telefone: formatPhone(e.target.value) }))} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth label="CEP" value={quickCli.endereco.cep} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, cep: formatCEP(e.target.value) } }))} onBlur={handleQuickCepBlur} InputProps={{ endAdornment: fetchingCep ? <CircularProgress size={20} /> : null }}/>
            </Grid>
            <Grid xs={12} sm={8}>
              <TextField fullWidth disabled={fetchingCep}label="Rua" value={quickCli.endereco.rua} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, rua: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField fullWidth label="Número" value={quickCli.endereco.numero} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, numero: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={5}>
              <TextField fullWidth label="Complemento" value={quickCli.endereco.complemento} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, complemento: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth disabled={fetchingCep} label="Bairro" value={quickCli.endereco.bairro} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, bairro: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth disabled={fetchingCep} label="Cidade" value={quickCli.endereco.cidade} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, cidade: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth disabled={fetchingCep} label="Estado" value={quickCli.endereco.estado} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, estado: e.target.value } }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={async () => {
            if (!validateForm()) {
              toast.warning('Preencha todos os campos');
              return;
            }
            try {
              const docDigits = onlyDigits(quickCli.doc);
              const payload = {
                clienteProprietarioId,
                tipoPessoa: docDigits.length > 11 ? 'juridica' : 'fisica',
                nome: quickCli.nome,
                cpfCnpj: docDigits,
                email: quickCli.email,
                telefone: onlyDigits(quickCli.telefone),
                endereco: {
                  ...quickCli.endereco,
                  cep: onlyDigits(quickCli.endereco.cep),
                },
              };
              const res = await portalCreateCliente(payload);
              
              // Verificar se o cliente já existia
              if (res?.jaExistia === true) {
                toast.info('Cliente já existe! Selecionado automaticamente na venda.');
                const existingCliente = res?.cliente;
                const clienteId = existingCliente?._id;
                
                if (clienteId) {
                  // Atualizar lista de clientes para incluir o existente se não estiver
                  await mutateClientes();
                  // Setar automaticamente na venda
                  setForm((f) => ({ ...f, clienteDoClienteId: clienteId }));
                }
              } else {
                // Cliente criado com sucesso
                toast.success('Cliente criado com sucesso!');
                const newId = res?._id || res?.data?._id;
                
                if (newId) {
                  // otimista: adiciona novo cliente na lista
                  const optimistic = { 
                    _id: newId, 
                    nome: payload.nome, 
                    cpfCnpj: quickCli.doc, 
                    email: payload.email, 
                    telefone: quickCli.telefone 
                  };
                  await mutateClientes((prev) => (Array.isArray(prev) ? [...prev, optimistic] : [optimistic]), false);
                  setForm((f) => ({ ...f, clienteDoClienteId: newId }));
                }
                mutateClientes();
              }
              
              setQuickCli(initialState);
              setOpenNovoCliente(false);
            } catch (err) {
              const errorMessage = err.response?.data?.message || 'Erro ao criar cliente. Tente novamente.';
              toast.error(errorMessage);
            }
          }} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNovoServico} onClose={() => setOpenNovoServico(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField fullWidth label="Nome" id="qs-nome"/>
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth label="Descrição" id="qs-descricao" />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Valor" id="qs-valor" />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Unidade" id="qs-unidade" defaultValue="UN" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNovoServico(false)}>Cancelar</Button>
          <Button onClick={async () => {
            try {
              const nome = document.getElementById('qs-nome').value;
              const descricao = document.getElementById('qs-descricao').value;
              const valorMask = document.getElementById('qs-valor').value;
              const { value: valor } = formatBRLInput(valorMask);
              const unidade = document.getElementById('qs-unidade').value;
              const payload = { clienteProprietarioId, nome, descricao, valor, unidade };
              const res = await portalCreateServico(payload);
              toast.success('Serviço criado');
              setOpenNovoServico(false);
              const novoId = res?._id || res?.data?._id;
              if (novoId) {
                // otimista: adiciona na lista de serviços
                const optimistic = { _id: novoId, nome, descricao, valor, unidade };
                await mutateServicos((prev) => (Array.isArray(prev) ? [...prev, optimistic] : [optimistic]), false);
              }
              mutateServicos();
              if (novoId) {
                setItens((arr) => [...arr, { servicoId: novoId, quantidade: 1, valorUnitario: valor, valorUnitarioText: fCurrency(valor), desconto: 0, descontoText: fCurrency(0), descricao }]);
              }
            } catch (err) {
              toast.error('Erro ao criar serviço');
            }
          }} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
     </motion.div>
    </LazyMotion>
  );
}


