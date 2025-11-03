'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate, fDateTime } from 'src/utils/format-time';

import { addLeadContact, getLeadContacts, updateLeadStatus } from 'src/actions/lead';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function LeadDetailsModal({ open, onClose, leadData, onUpdate }) {
  const theme = useTheme();
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [contatos, setContatos] = useState([]);
  const [adding, setAdding] = useState(false);
  
  // Form de adicionar contato
  const [novoContato, setNovoContato] = useState({
    channel: 'whatsapp',
    notes: '',
    outcome: '',
  });

  // Form de atualizar status
  const [statusForm, setStatusForm] = useState({
    statusLead: '',
    nextFollowUpAt: '',
    owner: user?.name || '', // Pré-preenche com usuário logado
  });

  // Carregar dados do lead e histórico
  const carregarDadosLead = useCallback(async () => {
    if (!leadData?._id) return;
    
    setLoading(true);
    try {
      const result = await getLeadContacts(leadData._id);
      
      if (result.success) {
        setLead(result.lead);
        setContatos(result.contatos || []);
        
        // Preencher form de status com dados atuais (mantém usuário logado se não tiver owner)
        setStatusForm({
          statusLead: result.lead.statusLead || '',
          nextFollowUpAt: result.lead.nextFollowUpAt ? result.lead.nextFollowUpAt.split('T')[0] : '',
          owner: result.lead.owner || user?.name || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar lead:', error);
      toast.error('Erro ao carregar dados do lead');
    }
    setLoading(false);
  }, [leadData?._id, user?.name]);

  useEffect(() => {
    if (open && leadData?._id) {
      carregarDadosLead();
    }
  }, [open, leadData?._id, carregarDadosLead]);

  const handleAdicionarContato = async () => {
    if (!novoContato.notes.trim()) {
      toast.warning('Adicione uma observação sobre o contato');
      return;
    }

    setAdding(true);
    try {
      const result = await addLeadContact(leadData._id, {
        channel: novoContato.channel,
        notes: novoContato.notes,
        outcome: novoContato.outcome,
        agent: user?.name || lead?.owner || 'sistema',
      });

      if (result.success) {
        toast.success('Contato adicionado com sucesso!');
        setNovoContato({ channel: 'whatsapp', notes: '', outcome: '' });
        await carregarDadosLead(); // Recarregar dados
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.error || 'Erro ao adicionar contato');
      }
    } catch (error) {
      toast.error('Erro ao adicionar contato');
    }
    setAdding(false);
  };

  const handleAtualizarStatus = async () => {
    setAdding(true);
    try {
      const updates = {};
      
      if (statusForm.statusLead) updates.statusLead = statusForm.statusLead;
      if (statusForm.nextFollowUpAt) updates.nextFollowUpAt = new Date(statusForm.nextFollowUpAt).toISOString();
      if (statusForm.owner) updates.owner = statusForm.owner;

      const result = await updateLeadStatus(leadData._id, updates);

      if (result.success) {
        toast.success('Status atualizado!');
        await carregarDadosLead();
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
    setAdding(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="solar:user-bold-duotone" width={32} sx={{ color: '#0096D9' }} />
            <Box>
              <Typography variant="h6">{lead?.nome}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ID: {lead?._id} • Criado em {fDate(lead?.createdAt)}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Informações Principais */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
              📋 Informações Principais
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <InfoChip icon="solar:phone-bold" label="Telefone" value={lead?.telefone} />
                <InfoChip icon="solar:letter-bold" label="E-mail" value={lead?.email} />
                <InfoChip icon="solar:map-point-bold" label="Local" value={`${lead?.cidade || '-'} - ${lead?.estado || '-'}`} />
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <InfoChip icon="solar:tag-bold" label="Segmento" value={lead?.segment || '-'} />
                <InfoChip icon="solar:link-bold" label="Origem" value={lead?.origem || '-'} />
                <InfoChip 
                  icon="solar:star-bold" 
                  label="Status" 
                  value={lead?.statusLead || 'novo'} 
                  color={getStatusColor(lead?.statusLead)}
                />
              </Stack>

              {lead?.observacoes && (
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.08), borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>
                    Observações:
                  </Typography>
                  <Typography variant="body2">{lead.observacoes}</Typography>
                </Box>
              )}
            </Stack>
          </Card>

          {/* Dados Adicionais do Formulário */}
          {lead?.additionalInfo && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
                📝 Dados do Formulário
              </Typography>
              
              <Stack spacing={2}>
                {/* Dados da Empresa */}
                {lead.additionalInfo.nomeEmpresa && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>Empresa:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.additionalInfo.nomeEmpresa}</Typography>
                  </Box>
                )}

                {lead.additionalInfo.faturamentoMensal && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>Faturamento Mensal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(lead.additionalInfo.faturamentoMensal)}</Typography>
                  </Box>
                )}

                {/* Endereço */}
                {lead.additionalInfo.endereco && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>Endereço:</Typography>
                    <Typography variant="body2">
                      {lead.additionalInfo.endereco.usarEnderecoFiscal ? (
                        <Chip label="Endereço Fiscal Attualize (PR)" size="small" color="primary" />
                      ) : (
                        `${lead.additionalInfo.endereco.endereco}, ${lead.additionalInfo.endereco.numero} - ${lead.additionalInfo.endereco.bairro}`
                      )}
                    </Typography>
                  </Box>
                )}

                {/* Orçamento */}
                {lead.additionalInfo.orcamento && (
                  <Box sx={{ p: 2, bgcolor: alpha('#FEC615', 0.08), borderRadius: 1, border: `1px solid #FEC615` }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
                      💰 Orçamento:
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Plano: <strong>{lead.additionalInfo.orcamento.plano}</strong>
                      </Typography>
                      {lead.additionalInfo.orcamento.valorMensal && (
                        <Typography variant="body2">
                          Valor: <strong>{formatCurrency(lead.additionalInfo.orcamento.valorMensal)}/mês</strong>
                        </Typography>
                      )}
                      {lead.additionalInfo.orcamento.periodicidade && (
                        <Typography variant="body2">
                          Periodicidade: <strong>{lead.additionalInfo.orcamento.periodicidade}</strong>
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Card>
          )}

          {/* Atualizar Status */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
              ⚙️ Atualizar Status do Lead
            </Typography>
            
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusForm.statusLead}
                onChange={(e) => setStatusForm(prev => ({ ...prev, statusLead: e.target.value }))}
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
                type="date"
                label="Próximo Follow-up"
                value={statusForm.nextFollowUpAt}
                onChange={(e) => setStatusForm(prev => ({ ...prev, nextFollowUpAt: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Responsável"
                value={statusForm.owner}
                onChange={(e) => setStatusForm(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="Nome do responsável"
              />

              <LoadingButton
                variant="contained"
                loading={adding}
                onClick={handleAtualizarStatus}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
              >
                Atualizar Status
              </LoadingButton>
            </Stack>
          </Card>

          {/* Adicionar Contato */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0096D9' }}>
                ➕ Adicionar Contato
              </Typography>
              <Chip 
                label={`Você: ${user?.name || 'Sistema'}`} 
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
                label="Observações do Contato"
                value={novoContato.notes}
                onChange={(e) => setNovoContato(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ex: Cliente pediu retorno amanhã às 14h..."
              />

              <TextField
                select
                fullWidth
                label="Resultado"
                value={novoContato.outcome}
                onChange={(e) => setNovoContato(prev => ({ ...prev, outcome: e.target.value }))}
              >
                <MenuItem value="">Nenhum</MenuItem>
                <MenuItem value="agendado">Agendado</MenuItem>
                <MenuItem value="sem-resposta">Sem Resposta</MenuItem>
                <MenuItem value="interessado">Interessado</MenuItem>
                <MenuItem value="nao-interessado">Não Interessado</MenuItem>
                <MenuItem value="callback">Retornar Depois</MenuItem>
              </TextField>

              <LoadingButton
                variant="contained"
                loading={adding}
                onClick={handleAdicionarContato}
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                sx={{ bgcolor: '#FEC615', color: '#333', '&:hover': { bgcolor: '#e5b213' } }}
              >
                Adicionar Contato
              </LoadingButton>
            </Stack>
          </Card>

          {/* Histórico de Contatos */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0096D9' }}>
              📞 Histórico de Contatos ({contatos.length})
            </Typography>
            
            {contatos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Iconify icon="solar:chat-round-line-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Nenhum contato registrado ainda
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {contatos.map((contato, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.04),
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify 
                            icon={getChannelIcon(contato.channel)} 
                            width={20} 
                            sx={{ color: '#0096D9' }} 
                          />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {getChannelLabel(contato.channel)}
                          </Typography>
                          {contato.outcome && (
                            <Chip label={contato.outcome} size="small" color="primary" />
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {fDateTime(contato.date)}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {contato.notes}
                      </Typography>

                      {contato.agent && (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Por: {contato.agent}
                        </Typography>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function InfoChip({ icon, label, value, color }) {
  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon={icon} width={18} sx={{ color: color || 'text.disabled' }} />
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {label}:
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
        {value || '-'}
      </Typography>
    </Box>
  );
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
    'whatsapp': 'logos:whatsapp-icon',
    'ligacao': 'solar:phone-bold-duotone',
    'email': 'solar:letter-bold-duotone',
    'meet': 'solar:videocamera-bold-duotone',
    'presencial': 'solar:user-speak-rounded-bold-duotone',
  };
  return icons[channel] || 'solar:chat-round-line-bold-duotone';
}

function getChannelLabel(channel) {
  const labels = {
    'whatsapp': 'WhatsApp',
    'ligacao': 'Ligação',
    'email': 'E-mail',
    'meet': 'Google Meet',
    'presencial': 'Presencial',
  };
  return labels[channel] || channel;
}

