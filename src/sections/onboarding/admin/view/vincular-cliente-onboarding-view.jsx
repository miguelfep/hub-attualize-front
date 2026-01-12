'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Card,
  Stack,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TableRow,
  TableCell,
  LinearProgress,
  Chip,
  Box,
  TablePagination,
} from '@mui/material';

import { toast } from 'sonner';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from 'src/components/table';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';

import { listarVinculacoesOnboarding, listarOnboardings } from 'src/actions/onboarding';

import { VincularClienteModal } from '../components/vincular-cliente-modal';

// ----------------------------------------------------------------------

export function VincularClienteOnboardingView({ onboardings: initialOnboardings, error: initialError }) {
  const [vinculacoes, setVinculacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState(initialOnboardings || []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalVinculacoes, setTotalVinculacoes] = useState(0);
  const modalVincular = useBoolean();


  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      // Carrega vinculações com progresso
      const response = await listarVinculacoesOnboarding({
        page: page + 1, // API usa página baseada em 1
        limit: rowsPerPage,
      });

      if (response?.data?.success) {
        const novasVinculacoes = response.data.data || [];
        console.log('Vinculações carregadas:', novasVinculacoes.length, novasVinculacoes);
        setVinculacoes(novasVinculacoes);
        setEstatisticas(response.data.estatisticas || null);
        if (response.data.paginacao) {
          setTotalVinculacoes(response.data.paginacao.total || 0);
        }
      } else if (Array.isArray(response?.data)) {
        setVinculacoes(response.data);
      } else {
        setVinculacoes([]);
      }

      // Carrega onboardings se não vieram como prop (apenas na primeira vez)
      if (!initialOnboardings || initialOnboardings.length === 0) {
        const responseOnboardings = await listarOnboardings({ ativo: true });
        if (responseOnboardings?.data?.success) {
          setOnboardings(responseOnboardings.data.data || []);
        } else if (Array.isArray(responseOnboardings?.data)) {
          setOnboardings(responseOnboardings.data);
        }
      } else {
        setOnboardings(initialOnboardings);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, initialOnboardings]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Agrupa vinculações por usuário para exibição
  const agruparPorUsuario = useCallback((vinculacoes) => {
    const usuariosMap = new Map();

    vinculacoes.forEach((vinculacao) => {
      // Normaliza o userId (pode vir como objeto ou string)
      const userId = vinculacao.userId?._id || vinculacao.userId?.id || vinculacao.userId;
      if (!userId) {
        console.warn('Vinculação sem userId:', vinculacao);
        return;
      }

      const userIdStr = String(userId);

      if (!usuariosMap.has(userIdStr)) {
        usuariosMap.set(userIdStr, {
          _id: userIdStr,
          name: vinculacao.userId?.name || vinculacao.userId?.email || 'Sem nome',
          email: vinculacao.userId?.email || '',
          onboardings: [],
        });
      }

      const usuario = usuariosMap.get(userIdStr);
      
      // Normaliza o onboardingId também
      const onboardingId = vinculacao.onboardingId?._id || vinculacao.onboardingId?.id || vinculacao.onboardingId;
      
      usuario.onboardings.push({
        onboarding: vinculacao.onboardingId || { _id: onboardingId, nome: 'N/A' },
        progresso: {
          concluido: vinculacao.concluido || false,
          progressoPercentual: vinculacao.progressoPercentual || 0,
        },
        ordem: vinculacao.ordem || 0,
        dataInicio: vinculacao.dataInicio,
        ultimaAtualizacao: vinculacao.ultimaAtualizacao,
      });
    });

    // Ordena os onboardings por ordem
    usuariosMap.forEach((usuario) => {
      usuario.onboardings.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    });

    return Array.from(usuariosMap.values());
  }, []);

  const usuariosAgrupados = agruparPorUsuario(vinculacoes);

  const getProgressoGeral = (usuario) => {
    if (!usuario.onboardings || usuario.onboardings.length === 0) {
      return { concluidos: 0, total: 0, percentual: 0 };
    }

    const total = usuario.onboardings.length;
    const concluidos = usuario.onboardings.filter((o) => o.progresso?.concluido).length;
    const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { concluidos, total, percentual };
  };

  const getOnboardingAtual = (usuario) => {
    if (!usuario.onboardings || usuario.onboardings.length === 0) {
      return null;
    }

    // Retorna o primeiro onboarding não concluído
    return usuario.onboardings.find((o) => !o.progresso?.concluido) || usuario.onboardings[0];
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Clientes com Onboarding"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Onboarding', href: paths.onboarding.root },
          { name: 'Vincular Cliente' },
        ]}
        action={
          <Button
            onClick={modalVincular.onTrue}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Vincular Cliente
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {initialError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar dados. Tente novamente mais tarde.
        </Alert>
      )}

      {/* Estatísticas */}
      {estatisticas && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Estatísticas</Typography>
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total de Vinculações
                </Typography>
                <Typography variant="h6">{estatisticas.total || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Concluídos
                </Typography>
                <Typography variant="h6" color="success.main">
                  {estatisticas.concluidos || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Em Andamento
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {estatisticas.emAndamento || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Progresso Médio
                </Typography>
                <Typography variant="h6">
                  {estatisticas.progressoMedio || 0}%
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>
      )}

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Total de Onboardings</TableCell>
                  <TableCell>Progresso</TableCell>
                  <TableCell>Onboardings</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Carregando...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : usuariosAgrupados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Nenhum cliente com onboarding encontrado.
                        </Typography>
                        {vinculacoes.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Debug: {vinculacoes.length} vinculação(ões) carregada(s), mas nenhum usuário agrupado.
                            <br />
                            Verifique o console para mais detalhes.
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  usuariosAgrupados.map((usuario) => {
                      const progressoGeral = getProgressoGeral(usuario);
                      const onboardingAtual = getOnboardingAtual(usuario);

                      return (
                        <TableRow key={usuario._id || usuario.id} hover>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" noWrap>
                                {usuario.name || usuario.email || 'Sem nome'}
                              </Typography>
                              {usuario.email && (
                                <Typography variant="caption" color="text.secondary">
                                  {usuario.email}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {usuario.onboardings?.length || 0} onboarding(s)
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={1}>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Progresso Geral
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {progressoGeral.concluidos}/{progressoGeral.total} ({progressoGeral.percentual}%)
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={progressoGeral.percentual}
                                  color={progressoGeral.percentual === 100 ? 'success' : 'primary'}
                                  sx={{ height: 8, borderRadius: 1 }}
                                />
                              </Box>
                              {onboardingAtual && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Atual: {onboardingAtual.onboarding?.nome || 'N/A'}
                                  </Typography>
                                  {onboardingAtual.progresso && (
                                    <LinearProgress
                                      variant="determinate"
                                      value={onboardingAtual.progresso.progressoPercentual || 0}
                                      sx={{ height: 6, borderRadius: 1 }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              {usuario.onboardings?.slice(0, 3).map((item, idx) => (
                                <Chip
                                  key={idx}
                                  label={
                                    item.progresso?.concluido
                                      ? `✓ ${item.onboarding?.nome || 'N/A'}`
                                      : item.onboarding?.nome || 'N/A'
                                  }
                                  size="small"
                                  color={item.progresso?.concluido ? 'success' : 'default'}
                                  variant={item.progresso?.concluido ? 'filled' : 'outlined'}
                                />
                              ))}
                              {usuario.onboardings?.length > 3 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{usuario.onboardings.length - 3} mais
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Label
                              variant="soft"
                              color={
                                progressoGeral.percentual === 100
                                  ? 'success'
                                  : progressoGeral.percentual > 0
                                    ? 'warning'
                                    : 'default'
                              }
                            >
                              {progressoGeral.percentual === 100
                                ? 'Concluído'
                                : progressoGeral.percentual > 0
                                  ? 'Em Andamento'
                                  : 'Não Iniciado'}
                            </Label>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalVinculacoes}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      <VincularClienteModal
        open={modalVincular.value}
        onClose={modalVincular.onFalse}
        onboardings={onboardings}
        onSuccess={async () => {
          // Volta para a primeira página para garantir que o novo registro apareça
          if (page !== 0) {
            setPage(0);
            // Aguarda a mudança de página
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          // Aguarda um pouco para garantir que a API processou a vinculação
          await new Promise((resolve) => setTimeout(resolve, 800));
          // Força recarregamento dos dados diretamente
          setLoading(true);
          try {
            const response = await listarVinculacoesOnboarding({
              page: 1, // Sempre volta para a primeira página
              limit: rowsPerPage,
            });

            if (response?.data?.success) {
              const novasVinculacoes = response.data.data || [];
              console.log('Recarregando vinculações. Total:', novasVinculacoes.length);
              setVinculacoes(novasVinculacoes);
              setEstatisticas(response.data.estatisticas || null);
              if (response.data.paginacao) {
                setTotalVinculacoes(response.data.paginacao.total || 0);
              }
            } else if (Array.isArray(response?.data)) {
              setVinculacoes(response.data);
            }
          } catch (error) {
            console.error('Erro ao recarregar dados:', error);
            toast.error('Erro ao recarregar lista');
          } finally {
            setLoading(false);
          }
        }}
      />
    </DashboardContent>
  );
}
