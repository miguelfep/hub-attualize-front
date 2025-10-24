'use client';

import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import { Card, Stack, Button, Dialog, MenuItem, TextField, Typography, CardContent, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import { buscarCep } from 'src/actions/cep';
import { usePortalClientes, usePortalServicos, portalCreateCliente, portalCreateServico, portalCreateOrcamento } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

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

  const [quickCli, setQuickCli] = React.useState({
    nome: '',
    doc: '',
    email: '',
    telefone: '',
    endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  });

  const handleQuickCepBlur = async () => {
    const raw = onlyDigits(quickCli.endereco.cep);
    if (raw.length !== 8) return;
    try {
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
    }
  };

  if (loadingEmpresas || !clienteProprietarioId) return <Typography>Carregando...</Typography>;
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
    if (!form.clienteDoClienteId) { toast.error('Selecione um cliente'); return; }
    if (!itens.length) { toast.error('Adicione ao menos um item'); return; }
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
      toast.success('Orçamento criado');
      const newId = created?._id || created?.data?._id;
      if (newId) {
        router.replace(`${paths.cliente.orcamentos}/${newId}`);
      } else {
        router.replace(paths.cliente.orcamentos);
      }
    } catch (err) {
      toast.error('Erro ao criar orçamento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SimplePaper>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Nova Venda
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Preencha os dados da venda e adicione o item de serviço.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button href="../vendas" variant="outlined" color="inherit">Cancelar</Button>
              <LoadingButton type="submit" variant="contained" loading={saving}>Salvar</LoadingButton>
            </Stack>
          </Box>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Dados</Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={8}>
                <TextField fullWidth select label="Cliente" value={form.clienteDoClienteId} onChange={(e) => setForm((f) => ({ ...f, clienteDoClienteId: e.target.value }))} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
                  <MenuItem value="">Selecione</MenuItem>
                  {(clientes || []).map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.nome} {c.cpfCnpj ? `- ${c.cpfCnpj}` : ''}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} sm={4}>
                <Button onClick={() => setOpenNovoCliente(true)} fullWidth startIcon={<Iconify icon="solar:user-plus-bold" />} variant="outlined">Novo Cliente</Button>
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField fullWidth type="date" label="Validade" value={form.dataValidade} onChange={(e) => setForm((f) => ({ ...f, dataValidade: e.target.value }))} InputLabelProps={{ shrink: true }} />
              </Grid>
              
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Item do Serviço</Typography>
              <Button onClick={addItem} startIcon={<Iconify icon="solar:add-circle-bold" />} disabled={itens.length >= 1}>Adicionar Item</Button>
            </Stack>
            <Stack spacing={2}>
              {itens.map((it, i) => (
                <Grid container spacing={2} key={i}>
                  <Grid xs={12}>
                    <TextField fullWidth select label="Serviço" value={it.servicoId} onChange={(e) => handleServicoChange(i, e.target.value)} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
                      <MenuItem value="">Selecione</MenuItem>
                      {(servicos || []).map((s) => (
                        <MenuItem key={s._id} value={s._id}>{s.nome}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12}>
                    <TextField fullWidth label="Descrição" value={it.descricao} onChange={(e) => setItemField(i, 'descricao', e.target.value)} />
                  </Grid>
                  <Grid xs={6} sm={2}>
                    <TextField fullWidth type="number" label="Qtd" value={it.quantidade} onChange={(e) => setItemField(i, 'quantidade', Number(e.target.value))} />
                  </Grid>
                  <Grid xs={6} sm={2}>
                    <TextField fullWidth label="Vlr Unit" value={it.valorUnitarioText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItens((arr) => arr.map((item, idx) => (idx === i ? { ...item, valorUnitario: value, valorUnitarioText: text } : item))); }} />
                  </Grid>
                  <Grid xs={12} sm={2}>
                    <TextField fullWidth label="Desconto" value={it.descontoText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItens((arr) => arr.map((item, idx) => (idx === i ? { ...item, desconto: value, descontoText: text } : item))); }} />
                  </Grid>
                  <Grid xs={12} sm={2}>
                    <Button color="error" onClick={() => rmItem(i)}><Iconify icon="solar:trash-bin-trash-bold" /></Button>
                  </Grid>
                </Grid>
              ))}
              {itens.length > 1 && (
                <Typography variant="caption" color="text.secondary">Apenas 1 item é permitido. Os demais itens não serão considerados.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField fullWidth multiline minRows={3} label="Observações" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField fullWidth multiline minRows={3} label="Condições de Pagamento" value={form.condicoesPagamento} onChange={(e) => setForm((f) => ({ ...f, condicoesPagamento: e.target.value }))} />
              </Grid>
              <Grid xs={12}>
                <Stack direction="row" justifyContent="flex-end" spacing={3}>
                  <Typography>Subtotal: {fCurrency(subtotal)}</Typography>
                  <Typography>Total: {fCurrency(total)}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>

      <Dialog open={openNovoCliente} onClose={() => setOpenNovoCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField fullWidth label="Nome" value={quickCli.nome} onChange={(e) => setQuickCli((q) => ({ ...q, nome: e.target.value }))} />
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth label="CPF/CNPJ" value={quickCli.doc} onChange={(e) => setQuickCli((q) => ({ ...q, doc: formatCPFOrCNPJ(e.target.value) }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Email" value={quickCli.email} onChange={(e) => setQuickCli((q) => ({ ...q, email: e.target.value }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Telefone" value={quickCli.telefone} onChange={(e) => setQuickCli((q) => ({ ...q, telefone: formatPhone(e.target.value) }))} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth label="CEP" value={quickCli.endereco.cep} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, cep: formatCEP(e.target.value) } }))} onBlur={handleQuickCepBlur} />
            </Grid>
            <Grid xs={12} sm={8}>
              <TextField fullWidth label="Rua" value={quickCli.endereco.rua} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, rua: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={3}>
              <TextField fullWidth label="Número" value={quickCli.endereco.numero} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, numero: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={5}>
              <TextField fullWidth label="Complemento" value={quickCli.endereco.complemento} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, complemento: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth label="Bairro" value={quickCli.endereco.bairro} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, bairro: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Cidade" value={quickCli.endereco.cidade} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, cidade: e.target.value } }))} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Estado" value={quickCli.endereco.estado} onChange={(e) => setQuickCli((q) => ({ ...q, endereco: { ...q.endereco, estado: e.target.value } }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNovoCliente(false)}>Cancelar</Button>
          <Button onClick={async () => {
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
              toast.success('Cliente criado');
              setOpenNovoCliente(false);
              const newId = res?._id || res?.data?._id;
              if (newId) {
                // otimista: adiciona novo cliente na lista
                const optimistic = { _id: newId, nome: payload.nome, cpfCnpj: quickCli.doc, email: payload.email, telefone: quickCli.telefone };
                await mutateClientes((prev) => (Array.isArray(prev) ? [...prev, optimistic] : [optimistic]), false);
                setForm((f) => ({ ...f, clienteDoClienteId: newId }));
                // revalida em background
                mutateClientes();
              } else {
                // fallback: revalida lista
                mutateClientes();
              }
            } catch (err) {
              toast.error('Erro ao criar cliente');
            }
          }} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNovoServico} onClose={() => setOpenNovoServico(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField fullWidth label="Nome" id="qs-nome" />
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
    </SimplePaper>
  );
}


