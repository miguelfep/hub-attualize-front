'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getLeads } from 'src/actions/lead';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { LeadTable } from '../components/lead-table';
import { getFollowUpStatus } from '../lead-permissions';
import { LeadKanbanBoard } from '../components/lead-kanban-board';
import { LeadCreateDialog } from '../components/lead-create-dialog';
import { LeadFollowupView } from '../components/lead-followup-view';
import { getLeadStatus, LEAD_STATUS_OPTIONS } from '../lead-status';

// ----------------------------------------------------------------------

const FILTER_OPTIONS = [{ value: 'todos', label: 'Todos', color: 'default' }, ...LEAD_STATUS_OPTIONS];

// ----------------------------------------------------------------------

export function LeadsListView() {
  const theme = useTheme();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Visualização: kanban (padrão, mais visual p/ vendedores) ou lista.
  const [viewMode, setViewMode] = useState('kanban');

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Diálogo de criação de lead
  const [criarAberto, setCriarAberto] = useState(false);

  const carregarLeads = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLeads({ incluirConvertidos: true });
      setLeads(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarLeads();
  }, [carregarLeads]);

  // Filtro por busca (aplica em ambas as visualizações). O filtro por status
  // só faz sentido na lista — no kanban as colunas já são os status.
  const leadsFiltrados = useMemo(
    () =>
      leads.filter((lead) => {
        const matchStatus =
          viewMode === 'kanban' || filtroStatus === 'todos' || getLeadStatus(lead) === filtroStatus;

        const busca = filtroBusca.toLowerCase();
        const matchBusca =
          !filtroBusca ||
          lead.nome?.toLowerCase().includes(busca) ||
          lead.email?.toLowerCase().includes(busca) ||
          lead.telefone?.includes(filtroBusca);

        return matchStatus && matchBusca;
      }),
    [leads, viewMode, filtroStatus, filtroBusca]
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLeads = leadsFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusCount = (status) => {
    if (status === 'todos') return leads.length;
    return leads.filter((l) => getLeadStatus(l) === status).length;
  };

  // Follow-ups atrasados (badge na aba). Usa a base completa, não a filtrada.
  const followupsAtrasados = useMemo(
    () => leads.filter((l) => getFollowUpStatus(l.nextFollowUpAt) === 'overdue').length,
    [leads]
  );

  const handleOpenLead = useCallback(
    (id) => router.push(paths.dashboard.comercial.leadDetails(id)),
    [router]
  );

  return (
    <DashboardContent maxWidth={false}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gerenciamento de Leads
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {leadsFiltrados.length} lead{leadsFiltrados.length !== 1 ? 's' : ''} encontrado
            {leadsFiltrados.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(e, value) => value && setViewMode(value)}
          >
            <ToggleButton value="kanban">
              <Iconify icon="solar:widget-5-bold" width={20} sx={{ mr: 0.5 }} />
              Kanban
            </ToggleButton>
            <ToggleButton value="list">
              <Iconify icon="solar:list-bold" width={20} sx={{ mr: 0.5 }} />
              Lista
            </ToggleButton>
            <ToggleButton value="followup">
              <Iconify icon="solar:calendar-bold" width={20} sx={{ mr: 0.5 }} />
              Follow-ups
              {followupsAtrasados > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.75,
                    px: 0.75,
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'common.white',
                    bgcolor: 'error.main',
                  }}
                >
                  {followupsAtrasados}
                </Box>
              )}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={() => router.push(paths.dashboard.comercial.leadsConvertidos)}
            sx={{ borderColor: 'success.main', color: 'success.main' }}
          >
            Convertidos
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={carregarLeads}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setCriarAberto(true)}
            sx={{ bgcolor: '#0096D9' }}
          >
            Adicionar Lead
          </Button>
        </Stack>
      </Stack>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Stack spacing={viewMode === 'list' ? 3 : 0}>
          <TextField
            fullWidth
            placeholder="Buscar por nome, email ou telefone..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <Iconify
                  icon="solar:magnifer-bold-duotone"
                  width={24}
                  sx={{ color: 'text.disabled', mr: 1 }}
                />
              ),
            }}
          />

          {/* Filtros de status só na lista (no kanban as colunas já são os status) */}
          {viewMode === 'list' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Filtrar por Status:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {FILTER_OPTIONS.map((option) => {
                  const count = getStatusCount(option.value);
                  const isActive = filtroStatus === option.value;

                  return (
                    <Button
                      key={option.value}
                      size="small"
                      variant={isActive ? 'contained' : 'outlined'}
                      onClick={() => {
                        setFiltroStatus(option.value);
                        setPage(0);
                      }}
                      sx={{
                        borderColor: isActive ? undefined : alpha(theme.palette.grey[500], 0.32),
                        color: isActive ? 'white' : 'text.secondary',
                        bgcolor: isActive ? `${option.color}.main` : 'transparent',
                        '&:hover': {
                          bgcolor: isActive
                            ? `${option.color}.dark`
                            : alpha(theme.palette.grey[500], 0.08),
                        },
                      }}
                    >
                      {option.label} ({count})
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </Card>

      {/* Conteúdo */}
      {viewMode === 'kanban' && (
        <LeadKanbanBoard
          leads={leadsFiltrados}
          onStatusChange={carregarLeads}
          onOpen={handleOpenLead}
        />
      )}

      {viewMode === 'list' && (
        <LeadTable
          leads={paginatedLeads}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={leadsFiltrados.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {viewMode === 'followup' && (
        <LeadFollowupView leads={leadsFiltrados} onOpen={handleOpenLead} />
      )}

      <LeadCreateDialog
        open={criarAberto}
        onClose={() => setCriarAberto(false)}
        onCreated={(leadId) => {
          carregarLeads();
          if (leadId) handleOpenLead(leadId);
        }}
      />
    </DashboardContent>
  );
}
