'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { getLeads } from 'src/actions/lead';
import { importarLeadComoCliente } from 'src/actions/clientes';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function ImportLeadDialog({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Carregar leads quando o dialog abrir (apenas não convertidos)
  const fetchLeads = useCallback(async () => {
    try {
      setLoadingLeads(true);
      // Buscar apenas leads não convertidos (padrão da API)
      const leadsData = await getLeads({ incluirConvertidos: false });
      const leadsArray = Array.isArray(leadsData)
        ? leadsData
        : leadsData?.leads || leadsData?.data || [];
      // Filtrar leads convertidos como segurança extra
      const leadsNaoConvertidos = leadsArray.filter(
        (lead) => lead.statusLead !== 'convertido'
      );
      setLeads(leadsNaoConvertidos);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast.error('Erro ao buscar leads');
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  // Carregar leads quando o dialog abrir
  useEffect(() => {
    if (open) {
      fetchLeads();
      setSearchQuery('');
      setSelectedLead(null);
    } else {
      // Limpar seleção quando o modal fechar
      setSelectedLead(null);
    }
  }, [open, fetchLeads]);

  // Filtrar leads pela busca
  const leadsFiltered = useMemo(() => {
    if (!searchQuery.trim()) {
      return leads;
    }

    const termo = searchQuery.toLowerCase().trim();
    return leads.filter((lead) => {
      const dadosCombinados = `${lead.nome || ''} ${lead.email || ''} ${lead.telefone || ''} ${lead.cnpj || ''}`;
      return dadosCombinados.toLowerCase().includes(termo);
    });
  }, [leads, searchQuery]);

  // Converter lead em cliente
  const handleImportLead = useCallback(async () => {
    if (!selectedLead) {
      toast.error('Selecione um lead para importar');
      return;
    }

    // Validação: verificar se lead já foi convertido
    if (selectedLead.statusLead === 'convertido') {
      toast.error('Este lead já foi convertido em cliente');
      return;
    }

    // Confirmação antes de importar
    const confirmar = window.confirm(
      `Deseja realmente converter o lead "${selectedLead.nome}" em cliente?\n\n` +
      `Esta ação irá:\n` +
      `- Criar um novo cliente com os dados do lead\n` +
      `- Marcar o lead como "convertido"\n` +
      `- Manter o histórico do lead`
    );

    if (!confirmar) return;

    try {
      setLoading(true);

      const leadId = selectedLead._id || selectedLead.id;
      if (!leadId) {
        throw new Error('ID do lead não encontrado');
      }

      const response = await importarLeadComoCliente(leadId);

      if (response?.success && response?.data) {
        const { cliente, lead } = response.data;
        toast.success(
          `Lead convertido com sucesso! Cliente criado: ${cliente.nome || cliente.razaoSocial}`,
          { duration: 5000 }
        );
        
        // Recarregar lista de leads (remover o convertido)
        await fetchLeads();
        setSelectedLead(null);
        onSuccess?.();
      } else {
        throw new Error(response?.message || 'Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao importar lead:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao importar lead';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorMessage;
        
        // Tratamento específico para cada tipo de erro
        if (errorMessage.toLowerCase().includes('já foi convertido')) {
          toast.error('Este lead já foi convertido em cliente');
          // Recarregar lista para atualizar status
          await fetchLeads();
          setSelectedLead(null);
          return;
        }
        
        if (errorMessage.toLowerCase().includes('já existe um cliente')) {
          toast.error(errorMessage, { duration: 6000 });
          return;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedLead, onSuccess, fetchLeads]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="solar:import-bold" width={32} />
          <Typography variant="h6">Importar Lead como Cliente</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar lead por nome, email, telefone ou CNPJ..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {loadingLeads ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ minHeight: 300, maxHeight: 400 }}>
              <Scrollbar>
                {leadsFiltered.length === 0 ? (
                  <SearchNotFound
                    query={searchQuery}
                    sx={{ py: 10 }}
                  />
                ) : (
                  <Stack spacing={1}>
                    {leadsFiltered.map((lead) => {
                      const leadId = lead._id || lead.id;
                      const selectedId = selectedLead?._id || selectedLead?.id;
                      const isSelected = selectedLead !== null && leadId === selectedId;

                      return (
                        <Box
                          key={leadId}
                          onClick={() => setSelectedLead(lead)}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            border: 2,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : 'primary.light',
                              bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                            },
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack spacing={0.5} flex={1}>
                              <Typography variant="subtitle2">{lead.nome || 'Sem nome'}</Typography>
                              {lead.email && (
                                <Typography variant="body2" color="text.secondary">
                                  {lead.email}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {lead.statusLead && (
                                  <Chip
                                    label={
                                      lead.statusLead === 'novo' ? 'Novo' :
                                      lead.statusLead === 'contatado' ? 'Contatado' :
                                      lead.statusLead === 'convertido' ? 'Convertido' :
                                      lead.statusLead
                                    }
                                    size="small"
                                    color={
                                      lead.statusLead === 'novo' ? 'info' :
                                      lead.statusLead === 'contatado' ? 'warning' :
                                      lead.statusLead === 'convertido' ? 'success' :
                                      'default'
                                    }
                                    variant="soft"
                                  />
                                )}
                                {lead.telefone && (
                                  <Chip
                                    label={`Tel: ${lead.telefone}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {lead.cnpj && (
                                  <Chip
                                    label={`CNPJ: ${lead.cnpj}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {lead.origem && (
                                  <Chip
                                    label={lead.origem}
                                    size="small"
                                    color="primary"
                                    variant="soft"
                                  />
                                )}
                              </Stack>
                            </Stack>
                            {isSelected && (
                              <Iconify icon="eva:checkmark-circle-2-fill" width={24} color="primary.main" />
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Scrollbar>
            </Box>
          )}

          {selectedLead && (
            <Alert 
              severity={selectedLead.statusLead === 'convertido' ? 'warning' : 'info'}
              icon={<Iconify icon="eva:info-fill" />}
            >
              <Typography variant="body2">
                <strong>Lead selecionado:</strong> {selectedLead.nome}
                {selectedLead.statusLead === 'convertido' && (
                  <Box component="span" sx={{ display: 'block', mt: 0.5, color: 'warning.dark' }}>
                    ⚠️ Este lead já foi convertido e não pode ser importado novamente.
                  </Box>
                )}
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleImportLead}
          disabled={
            !selectedLead || 
            loading || 
            selectedLead?.statusLead === 'convertido'
          }
          startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:import-bold" />}
        >
          {loading ? 'Importando...' : 'Importar Lead'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
