'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { getInvoicesByLeadId } from 'src/actions/invoices';
import { getLeadById, addLeadContact, getLeadContacts, updateLeadStatus } from 'src/actions/lead';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function LeadDetailsView({ id }) {
  const theme = useTheme();
  const router = useRouter();
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [currentTab, setCurrentTab] = useState('geral');

  // Form de adicionar contato
  const [novoContato, setNovoContato] = useState({
    channel: 'whatsapp',
    notes: '',
    outcome: '',
  });
  const [adding, setAdding] = useState(false);

  // Form de atualizar CRM
  const [crmForm, setCrmForm] = useState({
    statusLead: '',
    owner: user?.name || '',
    nextFollowUpAt: '',
  });
  const [updating, setUpdating] = useState(false);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [leadResult, contatosResult, orcamentosResult] = await Promise.all([
        getLeadById(id),
        getLeadContacts(id),
        getInvoicesByLeadId(id),
      ]);

      if (leadResult.success) {
        setLead(leadResult.lead);
        setCrmForm({
          statusLead: leadResult.lead.statusLead || '',
          owner: leadResult.lead.owner || user?.name || '',
          nextFollowUpAt: leadResult.lead.nextFollowUpAt
            ? leadResult.lead.nextFollowUpAt.split('T')[0]
            : '',
        });
      }

      if (contatosResult.success) {
        setContatos(contatosResult.contatos || []);
      }

      if (orcamentosResult?.invoices) {
        setOrcamentos(orcamentosResult.invoices || []);
      }
    } catch (error) {
      console.error('Erro ao carregar lead:', error);
      toast.error('Erro ao carregar dados do lead');
    }
    setLoading(false);
  }, [id, user?.name]);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id, carregarDados]);

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

  const handleAtualizarCRM = async () => {
    setUpdating(true);
    try {
      const result = await updateLeadStatus(id, crmForm);

      if (result.success) {
        toast.success('Informações atualizadas com sucesso!');
        await carregarDados();
      } else {
        toast.error(result.error || 'Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro ao atualizar informações');
    }
    setUpdating(false);
  };

  const handleVoltar = () => {
    router.push(paths.dashboard.comercial.leads);
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

  const TABS = [
    { value: 'geral', label: 'Informações Gerais', icon: 'solar:user-bold-duotone' },
    { value: 'crm', label: 'CRM & Contatos', icon: 'solar:chat-round-bold-duotone' },
  ];

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
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
              {lead.email} • {lead.telefone}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
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
            onClick={() => {
              const telefone = lead.telefone?.replace(/\D/g, '');
              if (telefone) {
                window.open(
                  `https://wa.me/55${telefone}?text=${encodeURIComponent(
                    `Olá ${lead.nome}, vi que você se interessou pela Attualize. Como posso ajudar?`
                  )}`,
                  '_blank'
                );
              }
            }}
          >
            WhatsApp
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)} sx={{ mb: 3 }}>
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={<Iconify icon={tab.icon} width={24} />}
            iconPosition="start"
            label={tab.label}
          />
        ))}
      </Tabs>

      {/* Tab Geral */}
      {currentTab === 'geral' && (
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid xs={12} md={6}>
            <InfoCard title="📋 Informações Básicas" icon="solar:user-bold-duotone">
              <InfoRow label="Nome" value={lead.nome} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Telefone" value={lead.telefone} />
              <InfoRow label="Data de Nascimento" value={lead.additionalInfo?.dataNascimento ? fDate(lead.additionalInfo.dataNascimento) : '-'} />
              <InfoRow label="Segmento" value={lead.segment || '-'} />
              <InfoRow label="Origem" value={lead.origem || '-'} />
              <InfoRow label="Criado em" value={fDateTime(lead.createdAt)} />
              <InfoRow label="Última Atualização" value={lead.additionalInfo?.ultimaAtualizacao ? fDateTime(lead.additionalInfo.ultimaAtualizacao) : '-'} />
            </InfoCard>
          </Grid>

          {/* Dados da Empresa */}
          <Grid xs={12} md={6}>
            <InfoCard title="🏢 Dados da Empresa" icon="solar:buildings-bold-duotone">
              <InfoRow label="Nome da Empresa" value={lead.additionalInfo?.nomeEmpresa || '-'} />
              <InfoRow
                label="Faturamento Mensal"
                value={lead.additionalInfo?.faturamentoMensal ? fCurrency(lead.additionalInfo.faturamentoMensal) : '-'}
              />
              <InfoRow label="Número de Sócios" value={lead.additionalInfo?.numeroSocios || '-'} />
              <InfoRow label="Etapa" value={lead.additionalInfo?.etapa || '-'} />
            </InfoCard>
          </Grid>

          {/* Endereço */}
          <Grid xs={12} md={6}>
            <InfoCard title="📍 Endereço" icon="solar:map-point-bold-duotone">
              {lead.additionalInfo?.endereco?.usarEnderecoFiscal ? (
                <Box sx={{ p: 2, bgcolor: alpha('#0096D9', 0.08), borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#0096D9', fontWeight: 600 }}>
                    ✅ Usando Endereço Fiscal Attualize
                  </Typography>
                </Box>
              ) : (
                <>
                  <InfoRow
                    label="CEP"
                    value={lead.endereco?.cep || lead.additionalInfo?.endereco?.cep || lead.cep || '-'}
                  />
                  <InfoRow
                    label="Endereço"
                    value={lead.endereco?.rua || lead.additionalInfo?.endereco?.endereco || '-'}
                  />
                  <InfoRow
                    label="Número"
                    value={lead.endereco?.numero || lead.additionalInfo?.endereco?.numero || '-'}
                  />
                  <InfoRow
                    label="Complemento"
                    value={lead.endereco?.complemento || lead.additionalInfo?.endereco?.complemento || '-'}
                  />
                  <InfoRow
                    label="Bairro"
                    value={lead.endereco?.bairro || lead.additionalInfo?.endereco?.bairro || '-'}
                  />
                  <InfoRow
                    label="Cidade"
                    value={lead.endereco?.cidade || lead.cidade || '-'}
                  />
                  <InfoRow
                    label="Estado"
                    value={lead.endereco?.estado || lead.estado || '-'}
                  />
                </>
              )}
            </InfoCard>
          </Grid>

          {/* Atividades */}
          <Grid xs={12} md={6}>
            <InfoCard title="💼 Atividades" icon="solar:case-bold-duotone">
              <InfoRow label="Atividade Principal" value={lead.additionalInfo?.atividades?.atividadePrincipal || '-'} />
              <InfoRow label="Descrição" value={lead.additionalInfo?.atividades?.descricaoAtividade || '-'} />
              <InfoRow
                label="Possui Funcionários"
                value={lead.additionalInfo?.atividades?.possuiFuncionarios ? 'Sim' : 'Não'}
              />
              <InfoRow label="Número de Funcionários" value={lead.additionalInfo?.atividades?.numeroFuncionarios || '0'} />
              <InfoRow label="Forma de Atuação" value={lead.additionalInfo?.formaAtuacao || '-'} />
            </InfoCard>
          </Grid>

          {/* Orçamento */}
          <Grid xs={12} md={6}>
            <InfoCard title="💰 Orçamento" icon="solar:bill-list-bold-duotone">
              <InfoRow
                label="Plano"
                value={
                  <Chip
                    label={lead.additionalInfo?.orcamento?.plano || '-'}
                    color={lead.additionalInfo?.orcamento?.plano === 'ANÁLISE_COMERCIAL' ? 'warning' : 'primary'}
                    size="small"
                  />
                }
              />
              <InfoRow
                label="Valor Mensal"
                value={lead.additionalInfo?.orcamento?.valor ? fCurrency(lead.additionalInfo.orcamento.valor) : '-'}
              />
              <InfoRow
                label="Valor Base"
                value={lead.additionalInfo?.orcamento?.detalhes?.valorBase ? fCurrency(lead.additionalInfo.orcamento.detalhes.valorBase) : '-'}
              />
              <InfoRow
                label="Adicional Funcionários"
                value={lead.additionalInfo?.orcamento?.detalhes?.adicionalFuncionarios ? fCurrency(lead.additionalInfo.orcamento.detalhes.adicionalFuncionarios) : '-'}
              />
              <InfoRow
                label="Adicional Endereço Fiscal"
                value={lead.additionalInfo?.orcamento?.detalhes?.adicionalEnderecoFiscal ? fCurrency(lead.additionalInfo.orcamento.detalhes.adicionalEnderecoFiscal) : '-'}
              />
              <InfoRow
                label="Abertura Gratuita"
                value={lead.additionalInfo?.orcamento?.temAberturaGratuita ? '✅ Sim' : '❌ Não'}
              />
            </InfoCard>
          </Grid>

          {/* Pagamento */}
          <Grid xs={12} md={6}>
            <InfoCard title="💳 Pagamento" icon="solar:card-bold-duotone">
              {lead.additionalInfo?.pagamento ? (
                <>
                  <InfoRow label="Periodicidade" value={lead.additionalInfo.pagamento.periodicidade || '-'} />
                  <InfoRow label="Método" value={lead.additionalInfo.pagamento.metodoPagamento || '-'} />
                  <InfoRow
                    label="Valor Mensal"
                    value={lead.additionalInfo.pagamento.valorMensal ? fCurrency(lead.additionalInfo.pagamento.valorMensal) : '-'}
                  />
                  <InfoRow
                    label="Valor Total"
                    value={lead.additionalInfo.pagamento.valorTotal ? fCurrency(lead.additionalInfo.pagamento.valorTotal) : '-'}
                  />
                  <InfoRow
                    label="Custo Abertura"
                    value={lead.additionalInfo.pagamento.custoAbertura ? fCurrency(lead.additionalInfo.pagamento.custoAbertura) : '-'}
                  />
                  <InfoRow
                    label="Valor Total + Abertura"
                    value={lead.additionalInfo.pagamento.valorTotalComAbertura ? fCurrency(lead.additionalInfo.pagamento.valorTotalComAbertura) : '-'}
                  />
                  <InfoRow label="Tipo" value={lead.additionalInfo.pagamento.tipo || '-'} />
                  <InfoRow
                    label="Status"
                    value={
                      <Chip
                        label={lead.additionalInfo.pagamento.status || '-'}
                        size="small"
                        color="warning"
                      />
                    }
                  />
                  <InfoRow
                    label="Finalizado em"
                    value={lead.additionalInfo.pagamento.finalizadoEm ? fDateTime(lead.additionalInfo.pagamento.finalizadoEm) : '-'}
                  />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sem informações de pagamento
                </Typography>
              )}
            </InfoCard>
          </Grid>

          {/* Análise Comercial */}
          {lead.additionalInfo?.analiseComercial && (
            <Grid xs={12}>
              <Card sx={{ p: 3, bgcolor: alpha('#FF9800', 0.08), borderLeft: `4px solid #FF9800` }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:user-speak-rounded-bold-duotone" width={28} sx={{ color: '#FF9800' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>
                      🔔 Análise Comercial Necessária
                    </Typography>
                  </Stack>
                  <Divider />
                  <InfoRow label="Motivo" value={lead.additionalInfo.analiseComercial.motivo || '-'} />
                  <InfoRow label="Plano Detectado" value={lead.additionalInfo.analiseComercial.planoDetectado || '-'} />
                  <InfoRow label="Solicitado em" value={fDateTime(lead.additionalInfo.analiseComercial.solicitadoEm)} />
                  <InfoRow
                    label="Status"
                    value={
                      <Chip
                        label={lead.additionalInfo.analiseComercial.status || '-'}
                        color="warning"
                        size="small"
                      />
                    }
                  />
                </Stack>
              </Card>
            </Grid>
          )}

          {/* Observações */}
          {lead.observacoes && (
            <Grid xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📝 Observações
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                  {lead.observacoes}
                </Typography>
              </Card>
            </Grid>
          )}

          {/* Páginas Visitadas */}
          {lead.paginasVisitadas && lead.paginasVisitadas.length > 0 && (
            <Grid xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  🔍 Páginas Visitadas ({lead.paginasVisitadas.length})
                </Typography>
                <Stack spacing={1}>
                  {lead.paginasVisitadas.map((pagina, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {index + 1}. {pagina}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab CRM & Contatos */}
      {currentTab === 'crm' && (
        <Grid container spacing={3}>
          {/* Atualizar CRM */}
          <Grid xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                ⚙️ Atualizar Status do Lead
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={crmForm.statusLead}
                  onChange={(e) => setCrmForm(prev => ({ ...prev, statusLead: e.target.value }))}
                >
                  <MenuItem value="novo">Novo</MenuItem>
                  <MenuItem value="contatado">Contatado</MenuItem>
                  <MenuItem value="qualificado">Qualificado</MenuItem>
                  <MenuItem value="proposta-enviada">Proposta Enviada</MenuItem>
                  <MenuItem value="negociacao">Em Negociação</MenuItem>
                  <MenuItem value="convertido">Convertido</MenuItem>
                  <MenuItem value="perdido">Perdido</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Responsável"
                  value={crmForm.owner}
                  onChange={(e) => setCrmForm(prev => ({ ...prev, owner: e.target.value }))}
                />

                <TextField
                  fullWidth
                  type="date"
                  label="Próximo Follow-up"
                  value={crmForm.nextFollowUpAt}
                  onChange={(e) => setCrmForm(prev => ({ ...prev, nextFollowUpAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />

                <LoadingButton
                  fullWidth
                  variant="contained"
                  loading={updating}
                  onClick={handleAtualizarCRM}
                  sx={{ bgcolor: '#0096D9' }}
                >
                  Atualizar Informações
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>

          {/* Adicionar Contato */}
          <Grid xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ➕ Adicionar Contato
                </Typography>
                <Chip
                  label={`Você: ${user?.name || 'Sistema'}`}
                  size="small"
                  sx={{ bgcolor: alpha('#0096D9', 0.1), color: '#0096D9', fontWeight: 600 }}
                />
              </Stack>

              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label="Canal"
                  value={novoContato.channel}
                  onChange={(e) => setNovoContato(prev => ({ ...prev, channel: e.target.value }))}
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
                  onChange={(e) => setNovoContato(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Descreva o que foi tratado neste contato..."
                />

                <TextField
                  select
                  fullWidth
                  label="Resultado"
                  value={novoContato.outcome}
                  onChange={(e) => setNovoContato(prev => ({ ...prev, outcome: e.target.value }))}
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
          </Grid>

          {/* Histórico de Contatos */}
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                📋 Histórico de Contatos ({contatos.length})
              </Typography>

              {contatos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Iconify
                    icon="solar:chat-line-bold-duotone"
                    width={64}
                    sx={{ color: 'text.disabled', mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Nenhum contato registrado ainda
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {contatos.map((contato, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify
                              icon={getChannelIcon(contato.channel)}
                              width={24}
                              sx={{ color: getChannelColor(contato.channel) }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {getChannelLabel(contato.channel)}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {fDateTime(contato.date)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {contato.notes}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:user-bold" width={16} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            Por: {contato.agent}
                          </Typography>
                          {contato.outcome && (
                            <>
                              <Divider orientation="vertical" flexItem />
                              <Label size="small" color={getOutcomeColor(contato.outcome)}>
                                {getOutcomeLabel(contato.outcome)}
                              </Label>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>

          {/* Histórico de Orçamentos */}
          {orcamentos.length > 0 && (
            <Grid xs={12}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                  💰 Histórico de Orçamentos ({orcamentos.length})
                </Typography>

                <Stack spacing={2}>
                  {orcamentos.map((orcamento) => (
                    <Card key={orcamento._id} variant="outlined" sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify
                              icon="solar:document-text-bold-duotone"
                              width={24}
                              sx={{ color: getOrcamentoColor(orcamento.status) }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Orçamento #{orcamento.invoiceNumber}
                            </Typography>
                            <Chip
                              label={getOrcamentoLabel(orcamento.status)}
                              color={getOrcamentoChipColor(orcamento.status)}
                              size="small"
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {fDateTime(orcamento.createdAt)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" spacing={3} flexWrap="wrap">
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Valor Total
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              {fCurrency(orcamento.total)}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Itens
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {orcamento.items?.length || 0} {orcamento.items?.length === 1 ? 'item' : 'itens'}
                            </Typography>
                          </Box>

                          {orcamento.desconto > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Desconto
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                                - {fCurrency(orcamento.desconto)}
                              </Typography>
                            </Box>
                          )}

                          {orcamento.formaPagamento && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Pagamento
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                {orcamento.formaPagamento}
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        {/* Footer */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:user-bold" width={16} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            Responsável: {orcamento.proprietarioVenda || '-'}
                          </Typography>
                          {orcamento.cobrancas && orcamento.cobrancas.length > 0 && (
                            <>
                              <Divider orientation="vertical" flexItem />
                              <Label size="small" color={getCobrancaChipColor(orcamento.cobrancas[0].status)}>
                                {getCobrancaLabel(orcamento.cobrancas[0].status)}
                              </Label>
                            </>
                          )}
                          <Box sx={{ flex: 1 }} />
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<Iconify icon="solar:arrow-right-bold" />}
                            onClick={() => router.push(paths.dashboard.invoice.details(orcamento._id))}
                            sx={{ minWidth: 'auto' }}
                          >
                            Ver detalhes
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------

function InfoCard({ title, icon, children }) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={1.5}>
        {children}
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 140 }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', flex: 1 }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function getStatusLabel(status) {
  const labels = {
    'novo': 'Novo',
    'contatado': 'Contatado',
    'qualificado': 'Qualificado',
    'proposta-enviada': 'Proposta Enviada',
    'negociacao': 'Em Negociação',
    'convertido': 'Convertido',
    'perdido': 'Perdido',
  };
  return labels[status] || status;
}

function getStatusColor(status) {
  const colors = {
    'novo': 'info',
    'contatado': 'primary',
    'qualificado': 'success',
    'proposta-enviada': 'warning',
    'negociacao': 'warning',
    'convertido': 'success',
    'perdido': 'error',
  };
  return colors[status] || 'default';
}

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

// ----------------------------------------------------------------------
// Helper Functions para Orçamentos
// ----------------------------------------------------------------------

function getOrcamentoLabel(status) {
  const labels = {
    'orcamento': 'Orçamento',
    'pendente': 'Pendente',
    'aprovada': 'Aprovado',
    'pago': 'Pago',
    'perdida': 'Perdido',
    'cancelado': 'Cancelado',
  };
  return labels[status] || status;
}

function getOrcamentoColor(status) {
  const colors = {
    'orcamento': '#FFA726',
    'pendente': '#FFA726',
    'aprovada': '#66BB6A',
    'pago': '#4CAF50',
    'perdida': '#EF5350',
    'cancelado': '#9E9E9E',
  };
  return colors[status] || '#9E9E9E';
}

function getOrcamentoChipColor(status) {
  const colors = {
    'orcamento': 'warning',
    'pendente': 'warning',
    'aprovada': 'success',
    'pago': 'success',
    'perdida': 'error',
    'cancelado': 'default',
  };
  return colors[status] || 'default';
}

function getCobrancaLabel(status) {
  const labels = {
    'EMABERTO': 'Em Aberto',
    'VENCIDO': 'Vencido',
    'RECEBIDO': 'Recebido',
    'CANCELADO': 'Cancelado',
    'PAGO': 'Pago',
  };
  return labels[status] || status;
}

function getCobrancaChipColor(status) {
  const colors = {
    'EMABERTO': 'warning',
    'VENCIDO': 'error',
    'RECEBIDO': 'success',
    'CANCELADO': 'default',
    'PAGO': 'success',
  };
  return colors[status] || 'default';
}

