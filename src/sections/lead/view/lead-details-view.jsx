'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { getUsersInternos } from 'src/actions/users';
import { DashboardContent } from 'src/layouts/dashboard';
import { getInvoicesByLeadId } from 'src/actions/invoices';
import {
  getLeadById,
  addLeadContact,
  getLeadContacts,
  updateLeadStatus,
  saveLeadProgress,
} from 'src/actions/lead';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { LeadResponsavelField } from '../components/lead-responsavel-field';
import { getStatusLabel, getStatusColor, LEAD_STATUS_OPTIONS } from '../lead-status';

// ----------------------------------------------------------------------

export function LeadDetailsView({ id }) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pegando, setPegando] = useState(false);

  // ---- Formulários de edição (inline) ----
  const [infoForm, setInfoForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    statusLead: '',
    owner: '',
    ownerId: '',
    nextFollowUpAt: '',
  });
  const [obsForm, setObsForm] = useState('');
  const [empresaForm, setEmpresaForm] = useState({
    nomeEmpresa: '',
    faturamentoMensal: '',
    numeroSocios: '',
    formaAtuacao: '',
    atividadePrincipal: '',
    descricaoAtividade: '',
    possuiFuncionarios: false,
    numeroFuncionarios: '',
  });
  const [enderecoForm, setEnderecoForm] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingObs, setSavingObs] = useState(false);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [savingEndereco, setSavingEndereco] = useState(false);

  // Form de adicionar contato
  const [novoContato, setNovoContato] = useState({ channel: 'whatsapp', notes: '', outcome: '' });
  const [adding, setAdding] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [leadResult, contatosResult, orcamentosResult] = await Promise.all([
        getLeadById(id),
        getLeadContacts(id),
        getInvoicesByLeadId(id),
      ]);

      const leadData = leadResult?.lead || leadResult?.data || leadResult;

      if (leadData && !leadResult?.message && !leadResult?.response) {
        setLead(leadData);
        const add = leadData.additionalInfo || {};
        const end = leadData.endereco || add.endereco || {};

        setInfoForm({
          nome: leadData.nome || '',
          email: leadData.email || '',
          telefone: leadData.telefone || '',
          statusLead: leadData.statusLead || 'novo',
          owner: leadData.owner || '',
          ownerId: leadData.ownerId || '',
          nextFollowUpAt: leadData.nextFollowUpAt ? leadData.nextFollowUpAt.split('T')[0] : '',
        });
        setObsForm(leadData.observacoes || '');
        setEmpresaForm({
          nomeEmpresa: add.nomeEmpresa || '',
          faturamentoMensal: add.faturamentoMensal ?? '',
          numeroSocios: add.numeroSocios ?? '',
          formaAtuacao: add.formaAtuacao || '',
          atividadePrincipal: add.atividades?.atividadePrincipal || '',
          descricaoAtividade: add.atividades?.descricaoAtividade || '',
          possuiFuncionarios: !!add.atividades?.possuiFuncionarios,
          numeroFuncionarios: add.atividades?.numeroFuncionarios ?? '',
        });
        setEnderecoForm({
          cep: end.cep || '',
          rua: end.rua || end.endereco || '',
          numero: end.numero || '',
          complemento: end.complemento || '',
          bairro: end.bairro || '',
          cidade: end.cidade || leadData.cidade || '',
          estado: end.estado || leadData.estado || '',
        });
      } else {
        toast.error('Lead não encontrado');
      }

      if (contatosResult?.success) {
        setContatos(contatosResult.contatos || []);
      } else if (contatosResult?.data) {
        setContatos(contatosResult.data || []);
      }

      if (orcamentosResult?.invoices) {
        setOrcamentos(orcamentosResult.invoices || []);
      } else if (orcamentosResult?.data) {
        setOrcamentos(orcamentosResult.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar lead:', error);
      toast.error('Erro ao carregar dados do lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) carregarDados();
  }, [id, carregarDados]);

  // Carrega todos os usuários internos para o select de responsável.
  useEffect(() => {
    getUsersInternos()
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        setUsuarios(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsuarios([]));
  }, []);

  // Mescla um patch ao additionalInfo atual, preservando o que já existe.
  const mergeAdditionalInfo = (patch) => ({ ...(lead?.additionalInfo || {}), ...patch });

  const handleSalvarInfo = async () => {
    setSavingInfo(true);
    try {
      const [statusRes, dadosRes] = await Promise.all([
        updateLeadStatus(id, {
          statusLead: infoForm.statusLead,
          owner: infoForm.owner,
          ownerId: infoForm.ownerId || null,
          nextFollowUpAt: infoForm.nextFollowUpAt || null,
        }),
        saveLeadProgress({
          id,
          nome: infoForm.nome,
          email: infoForm.email,
          telefone: infoForm.telefone,
        }),
      ]);

      if (statusRes?.success && dadosRes?.success) {
        toast.success('Informações salvas!');
        await carregarDados();
      } else {
        toast.error(statusRes?.error || dadosRes?.error || 'Erro ao salvar informações');
      }
    } catch (error) {
      toast.error('Erro ao salvar informações');
    }
    setSavingInfo(false);
  };

  // Comercial "pega" o lead: atribui a si mesmo e persiste imediatamente.
  const handlePegarLead = async () => {
    setPegando(true);
    try {
      const res = await updateLeadStatus(id, {
        statusLead: infoForm.statusLead || lead?.statusLead || 'novo',
        owner: user?.name,
        ownerId: user?._id || user?.id || null,
        nextFollowUpAt: infoForm.nextFollowUpAt || lead?.nextFollowUpAt || null,
      });
      if (res?.success) {
        toast.success('Lead atribuído a você!');
        await carregarDados();
      } else {
        toast.error(res?.error || 'Erro ao pegar o lead');
      }
    } catch (error) {
      toast.error('Erro ao pegar o lead');
    }
    setPegando(false);
  };

  const handleSalvarObs = async () => {
    setSavingObs(true);
    try {
      const res = await saveLeadProgress({ id, observacoes: obsForm });
      if (res?.success) {
        toast.success('Observações salvas!');
        await carregarDados();
      } else {
        toast.error(res?.error || 'Erro ao salvar observações');
      }
    } catch (error) {
      toast.error('Erro ao salvar observações');
    }
    setSavingObs(false);
  };

  const handleSalvarEmpresa = async () => {
    setSavingEmpresa(true);
    try {
      const additionalInfo = mergeAdditionalInfo({
        nomeEmpresa: empresaForm.nomeEmpresa,
        faturamentoMensal: empresaForm.faturamentoMensal === '' ? null : Number(empresaForm.faturamentoMensal),
        numeroSocios: empresaForm.numeroSocios === '' ? null : Number(empresaForm.numeroSocios),
        formaAtuacao: empresaForm.formaAtuacao,
        atividades: {
          ...(lead?.additionalInfo?.atividades || {}),
          atividadePrincipal: empresaForm.atividadePrincipal,
          descricaoAtividade: empresaForm.descricaoAtividade,
          possuiFuncionarios: empresaForm.possuiFuncionarios,
          numeroFuncionarios:
            empresaForm.numeroFuncionarios === '' ? null : Number(empresaForm.numeroFuncionarios),
        },
      });

      const res = await saveLeadProgress({ id, additionalInfo });
      if (res?.success) {
        toast.success('Dados da empresa salvos!');
        await carregarDados();
      } else {
        toast.error(res?.error || 'Erro ao salvar dados da empresa');
      }
    } catch (error) {
      toast.error('Erro ao salvar dados da empresa');
    }
    setSavingEmpresa(false);
  };

  const handleSalvarEndereco = async () => {
    setSavingEndereco(true);
    try {
      const additionalInfo = mergeAdditionalInfo({
        endereco: {
          ...(lead?.additionalInfo?.endereco || {}),
          cep: enderecoForm.cep,
          rua: enderecoForm.rua,
          numero: enderecoForm.numero,
          complemento: enderecoForm.complemento,
          bairro: enderecoForm.bairro,
          cidade: enderecoForm.cidade,
          estado: enderecoForm.estado,
        },
      });

      const res = await saveLeadProgress({
        id,
        additionalInfo,
        cidade: enderecoForm.cidade,
        estado: enderecoForm.estado,
      });
      if (res?.success) {
        toast.success('Endereço salvo!');
        await carregarDados();
      } else {
        toast.error(res?.error || 'Erro ao salvar endereço');
      }
    } catch (error) {
      toast.error('Erro ao salvar endereço');
    }
    setSavingEndereco(false);
  };

  const handleAdicionarContato = async () => {
    if (!novoContato.notes.trim()) {
      toast.warning('Adicione uma observação sobre o contato');
      return;
    }
    setAdding(true);
    try {
      const result = await addLeadContact(id, {
        ...novoContato,
        agent: user?.name || lead?.owner || 'sistema',
      });
      if (result.success) {
        toast.success('Contato adicionado com sucesso!');
        setNovoContato({ channel: 'whatsapp', notes: '', outcome: '' });
        await carregarDados();
      } else {
        toast.error(result.error || 'Erro ao adicionar contato');
      }
    } catch (error) {
      toast.error('Erro ao adicionar contato');
    }
    setAdding(false);
  };

  const handleVoltar = () => router.push(paths.dashboard.comercial.leads);

  const handleWhatsApp = () => {
    const telefone = lead?.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(
        `https://wa.me/55${telefone}?text=${encodeURIComponent(
          `Olá ${lead.nome}, vi que você se interessou pela Attualize. Como posso ajudar?`
        )}`,
        '_blank'
      );
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!lead) {
    return (
      <DashboardContent>
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Lead não encontrado</Typography>
          <Button variant="contained" onClick={handleVoltar} sx={{ mt: 2 }}>
            Voltar para Lista
          </Button>
        </Card>
      </DashboardContent>
    );
  }

  const usarEnderecoFiscal = lead.additionalInfo?.endereco?.usarEnderecoFiscal;

  return (
    <DashboardContent>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={handleVoltar}
          >
            Voltar
          </Button>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {lead.nome}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {lead.email} {lead.telefone ? `• ${lead.telefone}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {lead.statusLead && (
            <Chip
              label={getStatusLabel(lead.statusLead)}
              color={getStatusColor(lead.statusLead)}
              sx={{ fontWeight: 600 }}
            />
          )}
          <Button
            variant="soft"
            color="success"
            startIcon={<Iconify icon="logos:whatsapp-icon" />}
            onClick={handleWhatsApp}
          >
            WhatsApp
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* ---- Coluna principal (editável) ---- */}
        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            {/* Informações principais */}
            <SectionCard
              title="Informações Principais"
              icon="solar:user-bold-duotone"
              onSave={handleSalvarInfo}
              saving={savingInfo}
            >
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={infoForm.nome}
                    onChange={(e) => setInfoForm((p) => ({ ...p, nome: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={infoForm.telefone}
                    onChange={(e) => setInfoForm((p) => ({ ...p, telefone: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    value={infoForm.email}
                    onChange={(e) => setInfoForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={infoForm.statusLead}
                    onChange={(e) => setInfoForm((p) => ({ ...p, statusLead: e.target.value }))}
                  >
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Próximo Follow-up"
                    value={infoForm.nextFollowUpAt}
                    onChange={(e) => setInfoForm((p) => ({ ...p, nextFollowUpAt: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid xs={12}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Responsável
                  </Typography>
                  <LeadResponsavelField
                    usuarios={usuarios}
                    user={user}
                    lead={lead}
                    owner={infoForm.owner}
                    ownerId={infoForm.ownerId}
                    pegando={pegando}
                    onPegar={handlePegarLead}
                    onSelect={(u) =>
                      setInfoForm((p) => ({
                        ...p,
                        owner: u?.name || '',
                        ownerId: u?._id || '',
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* Observações */}
            <SectionCard
              title="Observações"
              icon="solar:notes-bold-duotone"
              onSave={handleSalvarObs}
              saving={savingObs}
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Anote aqui informações relevantes sobre o lead..."
                value={obsForm}
                onChange={(e) => setObsForm(e.target.value)}
              />
            </SectionCard>

            {/* Dados da Empresa / Orçamento */}
            <SectionCard
              title="Dados da Empresa"
              icon="solar:buildings-bold-duotone"
              onSave={handleSalvarEmpresa}
              saving={savingEmpresa}
            >
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    value={empresaForm.nomeEmpresa}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, nomeEmpresa: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Faturamento Mensal (R$)"
                    value={empresaForm.faturamentoMensal}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, faturamentoMensal: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Sócios"
                    value={empresaForm.numeroSocios}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, numeroSocios: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Forma de Atuação"
                    value={empresaForm.formaAtuacao}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, formaAtuacao: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Atividade Principal"
                    value={empresaForm.atividadePrincipal}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, atividadePrincipal: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Funcionários"
                    value={empresaForm.numeroFuncionarios}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, numeroFuncionarios: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descrição da Atividade"
                    value={empresaForm.descricaoAtividade}
                    onChange={(e) => setEmpresaForm((p) => ({ ...p, descricaoAtividade: e.target.value }))}
                  />
                </Grid>
                <Grid xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={empresaForm.possuiFuncionarios}
                        onChange={(e) =>
                          setEmpresaForm((p) => ({ ...p, possuiFuncionarios: e.target.checked }))
                        }
                      />
                    }
                    label="Possui funcionários"
                  />
                </Grid>
              </Grid>

              {/* Orçamento atual (somente leitura) */}
              {lead.additionalInfo?.orcamento && (
                <Box sx={{ mt: 1, p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    💰 Orçamento atual
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <ReadField
                      label="Plano"
                      value={lead.additionalInfo.orcamento.plano || '-'}
                    />
                    <ReadField
                      label="Valor Mensal"
                      value={
                        lead.additionalInfo.orcamento.valor
                          ? fCurrency(lead.additionalInfo.orcamento.valor)
                          : '-'
                      }
                    />
                    <ReadField
                      label="Abertura Gratuita"
                      value={lead.additionalInfo.orcamento.temAberturaGratuita ? 'Sim' : 'Não'}
                    />
                  </Stack>
                </Box>
              )}
            </SectionCard>

            {/* Endereço */}
            <SectionCard
              title="Endereço"
              icon="solar:map-point-bold-duotone"
              onSave={handleSalvarEndereco}
              saving={savingEndereco}
              hideSave={usarEnderecoFiscal}
            >
              {usarEnderecoFiscal ? (
                <Box sx={{ p: 2, bgcolor: alpha('#0096D9', 0.08), borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#0096D9', fontWeight: 600 }}>
                    ✅ Usando Endereço Fiscal Attualize
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="CEP"
                      value={enderecoForm.cep}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, cep: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Endereço"
                      value={enderecoForm.rua}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, rua: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Número"
                      value={enderecoForm.numero}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, numero: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      value={enderecoForm.complemento}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, complemento: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Bairro"
                      value={enderecoForm.bairro}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, bairro: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      value={enderecoForm.cidade}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, cidade: e.target.value }))}
                    />
                  </Grid>
                  <Grid xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Estado"
                      value={enderecoForm.estado}
                      onChange={(e) => setEnderecoForm((p) => ({ ...p, estado: e.target.value }))}
                    />
                  </Grid>
                </Grid>
              )}
            </SectionCard>

            {/* Origem & Campanha (UTM) — somente leitura */}
            <LeadUtmCard lead={lead} />

            {/* Análise Comercial (somente leitura) */}
            {lead.additionalInfo?.analiseComercial && (
              <Card sx={{ p: 3, bgcolor: alpha('#FF9800', 0.08), borderLeft: `4px solid #FF9800` }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:user-speak-rounded-bold-duotone" width={28} sx={{ color: '#FF9800' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>
                      🔔 Análise Comercial Necessária
                    </Typography>
                  </Stack>
                  <Divider />
                  <ReadRow label="Motivo" value={lead.additionalInfo.analiseComercial.motivo || '-'} />
                  <ReadRow label="Plano Detectado" value={lead.additionalInfo.analiseComercial.planoDetectado || '-'} />
                  <ReadRow
                    label="Solicitado em"
                    value={
                      lead.additionalInfo.analiseComercial.solicitadoEm
                        ? fDateTime(lead.additionalInfo.analiseComercial.solicitadoEm)
                        : '-'
                    }
                  />
                </Stack>
              </Card>
            )}

            {/* Páginas Visitadas (somente leitura) */}
            {lead.paginasVisitadas && lead.paginasVisitadas.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  🔍 Páginas Visitadas ({lead.paginasVisitadas.length})
                </Typography>
                <Stack spacing={1}>
                  {lead.paginasVisitadas.map((pagina, index) => (
                    <Box
                      key={index}
                      sx={{ p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.08), borderRadius: 1 }}
                    >
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {index + 1}. {pagina}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* ---- Coluna lateral (atividade) ---- */}
        <Grid xs={12} md={4}>
          <Stack spacing={3}>
            {/* Adicionar Contato */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ➕ Registrar Contato
                </Typography>
                <Chip
                  label={user?.name || 'Sistema'}
                  size="small"
                  sx={{ bgcolor: alpha('#0096D9', 0.1), color: '#0096D9', fontWeight: 600 }}
                />
              </Stack>

              <Stack spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Canal"
                  value={novoContato.channel}
                  onChange={(e) => setNovoContato((p) => ({ ...p, channel: e.target.value }))}
                >
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="ligacao">Ligação</MenuItem>
                  <MenuItem value="email">E-mail</MenuItem>
                  <MenuItem value="meet">Google Meet</MenuItem>
                  <MenuItem value="presencial">Presencial</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observações"
                  value={novoContato.notes}
                  onChange={(e) => setNovoContato((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Descreva o que foi tratado neste contato..."
                />

                <TextField
                  select
                  fullWidth
                  label="Resultado"
                  value={novoContato.outcome}
                  onChange={(e) => setNovoContato((p) => ({ ...p, outcome: e.target.value }))}
                >
                  <MenuItem value="">Sem resultado definido</MenuItem>
                  <MenuItem value="interessado">Interessado</MenuItem>
                  <MenuItem value="nao-interessado">Não Interessado</MenuItem>
                  <MenuItem value="callback">Agendar Retorno</MenuItem>
                  <MenuItem value="sem-resposta">Sem Resposta</MenuItem>
                  <MenuItem value="agendado">Reunião Agendada</MenuItem>
                  <MenuItem value="proposta">Proposta Enviada</MenuItem>
                </TextField>

                <LoadingButton
                  fullWidth
                  variant="contained"
                  loading={adding}
                  onClick={handleAdicionarContato}
                  startIcon={<Iconify icon="solar:add-circle-bold" />}
                >
                  Adicionar Contato
                </LoadingButton>
              </Stack>
            </Card>

            {/* Histórico de Contatos */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
                📋 Histórico de Contatos ({contatos.length})
              </Typography>

              {contatos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Iconify icon="solar:chat-line-bold-duotone" width={56} sx={{ color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum contato registrado ainda
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {contatos.map((contato, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify
                              icon={getChannelIcon(contato.channel)}
                              width={22}
                              sx={{ color: getChannelColor(contato.channel) }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {getChannelLabel(contato.channel)}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {contato.date ? fDateTime(contato.date) : '-'}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {contato.notes}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Iconify icon="solar:user-bold" width={16} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            Por: {contato.agent}
                          </Typography>
                          {contato.outcome && (
                            <Label size="small" color={getOutcomeColor(contato.outcome)}>
                              {getOutcomeLabel(contato.outcome)}
                            </Label>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>

            {/* Histórico de Orçamentos */}
            {orcamentos.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
                  💰 Orçamentos ({orcamentos.length})
                </Typography>
                <Stack spacing={2}>
                  {orcamentos.map((orcamento) => (
                    <Card key={orcamento._id} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            #{orcamento.invoiceNumber}
                          </Typography>
                          <Chip
                            label={getOrcamentoLabel(orcamento.status)}
                            color={getOrcamentoChipColor(orcamento.status)}
                            size="small"
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {orcamento.total != null ? fCurrency(orcamento.total) : '-'}
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<Iconify icon="solar:arrow-right-bold" />}
                            onClick={() => router.push(paths.dashboard.invoice.details(orcamento._id))}
                          >
                            Detalhes
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------

const UTM_FIELDS = [
  { key: 'source', label: 'Source' },
  { key: 'medium', label: 'Medium' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'term', label: 'Term' },
  { key: 'content', label: 'Content' },
  { key: 'gclid', label: 'gclid (Google Ads)' },
  { key: 'fbclid', label: 'fbclid (Meta Ads)' },
  { key: 'referrer', label: 'Referrer' },
  { key: 'landingPage', label: 'Landing page' },
];

function LeadUtmCard({ lead }) {
  const utm = lead.utm || {};
  const preenchidos = UTM_FIELDS.filter((f) => utm[f.key]);
  const semUtm = preenchidos.length === 0;

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <Iconify icon="solar:graph-up-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Origem &amp; Campanha
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />

      <Stack spacing={1.5}>
        <ReadRow label="Origem" value={lead.origem || '-'} />
        {semUtm ? (
          <Typography variant="body2" color="text.secondary">
            Sem dados de campanha (UTM) para este lead.
          </Typography>
        ) : (
          preenchidos.map((f) => (
            <ReadRow
              key={f.key}
              label={f.label}
              value={
                f.key === 'landingPage' || f.key === 'referrer' ? (
                  <Box
                    component="a"
                    href={utm[f.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ wordBreak: 'break-all', color: 'primary.main' }}
                  >
                    {utm[f.key]}
                  </Box>
                ) : (
                  utm[f.key]
                )
              }
            />
          ))
        )}
      </Stack>
    </Card>
  );
}

function SectionCard({ title, icon, children, onSave, saving, hideSave }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon={icon} width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        {!hideSave && (
          <LoadingButton
            variant="contained"
            size="small"
            loading={saving}
            onClick={onSave}
            startIcon={<Iconify icon="solar:diskette-bold" />}
          >
            Salvar
          </LoadingButton>
        )}
      </Stack>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </Card>
  );
}

function ReadField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

function ReadRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Helper Functions (canais / resultados / orçamentos)
// ----------------------------------------------------------------------

function getChannelIcon(channel) {
  const icons = {
    whatsapp: 'logos:whatsapp-icon',
    ligacao: 'solar:phone-bold-duotone',
    email: 'solar:letter-bold-duotone',
    meet: 'logos:google-meet',
    presencial: 'solar:users-group-two-rounded-bold-duotone',
  };
  return icons[channel] || 'solar:chat-round-bold-duotone';
}

function getChannelColor(channel) {
  const colors = {
    whatsapp: '#25D366',
    ligacao: '#0096D9',
    email: '#EA4335',
    meet: '#00897B',
    presencial: '#7B1FA2',
  };
  return colors[channel] || '#666';
}

function getChannelLabel(channel) {
  const labels = {
    whatsapp: 'WhatsApp',
    ligacao: 'Ligação',
    email: 'E-mail',
    meet: 'Google Meet',
    presencial: 'Presencial',
  };
  return labels[channel] || channel;
}

function getOutcomeLabel(outcome) {
  const labels = {
    interessado: 'Interessado',
    'nao-interessado': 'Não Interessado',
    callback: 'Retorno Agendado',
    'sem-resposta': 'Sem Resposta',
    agendado: 'Reunião Agendada',
    proposta: 'Proposta Enviada',
  };
  return labels[outcome] || outcome;
}

function getOutcomeColor(outcome) {
  const colors = {
    interessado: 'success',
    'nao-interessado': 'error',
    callback: 'warning',
    'sem-resposta': 'default',
    agendado: 'info',
    proposta: 'primary',
  };
  return colors[outcome] || 'default';
}

function getOrcamentoLabel(status) {
  const labels = {
    orcamento: 'Orçamento',
    pendente: 'Pendente',
    aprovada: 'Aprovado',
    pago: 'Pago',
    perdida: 'Perdido',
    cancelado: 'Cancelado',
  };
  return labels[status] || status;
}

function getOrcamentoChipColor(status) {
  const colors = {
    orcamento: 'warning',
    pendente: 'warning',
    aprovada: 'success',
    pago: 'success',
    perdida: 'error',
    cancelado: 'default',
  };
  return colors[status] || 'default';
}
