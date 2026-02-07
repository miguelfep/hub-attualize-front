'use client';

import { useMemo, useState, useCallback } from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetGuiasFiscaisPortal, downloadGuiaFiscalPortal } from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { GuiaFiscalPortalCard } from '../components/guia-fiscal-portal-card';

// ----------------------------------------------------------------------

// Nomes dos meses em português
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function GuiaFiscalPortalListViewImproved() {
  const router = useRouter();
  const theme = useTheme();

  // Estado para controlar qual mês está selecionado para mostrar documentos
  const [mesSelecionado, setMesSelecionado] = useState(null);

  // Buscar todas as guias fiscais
  const { data, isLoading, mutate } = useGetGuiasFiscaisPortal({
    limit: 1000,
  });

  // Agrupar por setor > ano > mês
  const estruturaPorSetor = useMemo(() => {
    const guias = data?.guias || [];
    const estrutura = {
      fiscal: {},
      dp: {},
    };

    guias.forEach((guia) => {
      // Determinar setor
      const categoria = guia.categoria || 'GUIA_FISCAL';
      const setorKey = categoria === 'GUIA_FISCAL' ? 'fiscal' : 'dp';

      // Obter data (vencimento ou criação)
      const dataGuia = guia.dataVencimento 
        ? new Date(guia.dataVencimento) 
        : guia.createdAt 
          ? new Date(guia.createdAt) 
          : new Date();
      
      const ano = dataGuia.getFullYear();
      const mes = dataGuia.getMonth(); // 0-11
      const mesKey = `${setorKey}-${ano}-${String(mes + 1).padStart(2, '0')}`;
      const mesLabel = MESES[mes];

      // Criar estrutura se não existir
      if (!estrutura[setorKey][ano]) {
        estrutura[setorKey][ano] = {};
      }

      if (!estrutura[setorKey][ano][mesKey]) {
        estrutura[setorKey][ano][mesKey] = {
          mes,
          mesLabel,
          mesKey,
          ano,
          guias: [],
        };
      }

      estrutura[setorKey][ano][mesKey].guias.push(guia);
    });

    // Ordenar guias dentro de cada mês (mais recente primeiro)
    Object.keys(estrutura).forEach((setorKey) => {
      Object.keys(estrutura[setorKey]).forEach((ano) => {
        Object.keys(estrutura[setorKey][ano]).forEach((mesKey) => {
          estrutura[setorKey][ano][mesKey].guias.sort((a, b) => {
            const dataA = a.dataVencimento 
              ? new Date(a.dataVencimento) 
              : a.createdAt 
                ? new Date(a.createdAt) 
                : new Date(0);
            const dataB = b.dataVencimento 
              ? new Date(b.dataVencimento) 
              : b.createdAt 
                ? new Date(b.createdAt) 
                : new Date(0);
            return dataB - dataA;
          });
        });
      });
    });

    // Converter para estrutura final
    return {
      fiscal: Object.keys(estrutura.fiscal)
        .sort((a, b) => Number(b) - Number(a)) // Anos mais recentes primeiro
        .map((ano) => ({
          ano: Number(ano),
          meses: Object.values(estrutura.fiscal[ano])
            .sort((a, b) => b.mesKey.localeCompare(a.mesKey)) // Meses mais recentes primeiro
            .map((mes) => mes),
        })),
      dp: Object.keys(estrutura.dp)
        .sort((a, b) => Number(b) - Number(a))
        .map((ano) => ({
          ano: Number(ano),
          meses: Object.values(estrutura.dp[ano])
            .sort((a, b) => b.mesKey.localeCompare(a.mesKey))
            .map((mes) => mes),
        })),
    };
  }, [data?.guias]);

  const handleViewDetails = useCallback(
    (id) => {
      router.push(paths.cliente.guiasFiscais.details(id));
    },
    [router]
  );

  const handleDownload = useCallback(async (id, nomeArquivo) => {
    try {
      await downloadGuiaFiscalPortal(id, nomeArquivo);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download');
    }
  }, []);

  const handleSolicitarAtualizacao = useCallback(async (guiaId, tipoGuia, competencia) => {
    try {
      // TODO: Implementar chamada à API para solicitar atualização de uma guia específica
      // Exemplo: await solicitarAtualizacaoGuia(guiaId);
      const mensagem = competencia 
        ? `Solicitação de atualização enviada para ${tipoGuia} - ${competencia}!`
        : `Solicitação de atualização enviada para ${tipoGuia}!`;
      toast.success(mensagem);
      mutate(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao solicitar atualização:', error);
      toast.error('Erro ao solicitar atualização');
    }
  }, [mutate]);

  // Contar totais
  const totais = useMemo(() => {
    let fiscal = 0;
    let dp = 0;
    
    estruturaPorSetor.fiscal.forEach((anoData) => {
      anoData.meses.forEach((mes) => {
        fiscal += mes.guias.length;
      });
    });

    estruturaPorSetor.dp.forEach((anoData) => {
      anoData.meses.forEach((mes) => {
        dp += mes.guias.length;
      });
    });

    return { fiscal, dp, total: fiscal + dp };
  }, [estruturaPorSetor]);

  // Obter documentos do mês selecionado
  const documentosMesSelecionado = useMemo(() => {
    if (!mesSelecionado) return [];
    
    const [setor, ano] = mesSelecionado.split('-');
    const setorData = estruturaPorSetor[setor];
    if (!setorData) return [];

    const anoData = setorData.find((a) => a.ano === Number(ano));
    if (!anoData) return [];

    const mesData = anoData.meses.find((mesItem) => mesItem.mesKey === mesSelecionado);
    return mesData?.guias || [];
  }, [mesSelecionado, estruturaPorSetor]);

  const handleMesClick = (mesKey) => {
    setMesSelecionado(mesSelecionado === mesKey ? null : mesKey);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 4,
              bgcolor: 'background.neutral',
              borderRadius: '16px 16px 0 0',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Minhas Guias Fiscais
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Visualize e gerencie suas guias fiscais em um só lugar.
          </Typography>
        </Box>
        <Button
          component="a"
          href={paths.cliente.guiasFiscais.calendar}
          variant="outlined"
          startIcon={<Iconify icon="solar:calendar-bold" />}
        >
          Ver Calendário
        </Button>
      </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Resumo de documentos */}
          <Box sx={{ p: 2, mb: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Fiscal:
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {totais.fiscal}
                </Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:file-text-bold-duotone" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Departamento Pessoal:
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {totais.dp}
                </Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:folder-bold-duotone" width={24} sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Total:
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {totais.total}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {isLoading ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Carregando documentos...
              </Typography>
            </Stack>
          ) : estruturaPorSetor.fiscal.length === 0 && estruturaPorSetor.dp.length === 0 ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 10, textAlign: 'center' }}>
              <Iconify icon="solar:folder-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum documento encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não há documentos disponíveis no momento.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
          {/* Setor Fiscal */}
          {estruturaPorSetor.fiscal.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Iconify icon="solar:document-text-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
                  <Typography variant="h5">Fiscal</Typography>
                  <Chip label={totais.fiscal} size="small" color="primary" variant="soft" />
                </Stack>
                <Box sx={{ minHeight: 200, maxHeight: 600, overflow: 'auto' }}>
                  <SimpleTreeView
                    defaultExpandedItems={estruturaPorSetor.fiscal.map((ano) => `fiscal-ano-${ano.ano}`)}
                    sx={{ width: '100%' }}
                  >
                    {estruturaPorSetor.fiscal.map((anoData) => {
                      const totalAno = anoData.meses.reduce((acc, mes) => acc + mes.guias.length, 0);
                      return (
                        <TreeItem
                          key={`fiscal-ano-${anoData.ano}`}
                          itemId={`fiscal-ano-${anoData.ano}`}
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="solar:calendar-bold-duotone" width={18} />
                              <Typography variant="subtitle1">{anoData.ano}</Typography>
                              <Chip label={totalAno} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Stack>
                          }
                        >
                          {anoData.meses.map((mes) => (
                            <TreeItem
                              key={mes.mesKey}
                              itemId={mes.mesKey}
                              label={
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMesClick(mes.mesKey);
                                  }}
                                  sx={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <Iconify icon="solar:calendar-mark-bold-duotone" width={16} />
                                  <Typography variant="body2">{mes.mesLabel}</Typography>
                                  <Chip
                                    label={mes.guias.length}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                    color={mesSelecionado === mes.mesKey ? 'primary' : 'default'}
                                  />
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem>
                      );
                    })}
                  </SimpleTreeView>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Setor Departamento Pessoal */}
          {estruturaPorSetor.dp.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Iconify icon="solar:file-text-bold-duotone" width={32} sx={{ color: 'info.main' }} />
                  <Typography variant="h5">Departamento Pessoal</Typography>
                  <Chip label={totais.dp} size="small" color="info" variant="soft" />
                </Stack>
                <Box sx={{ minHeight: 200, maxHeight: 600, overflow: 'auto' }}>
                  <SimpleTreeView
                    defaultExpandedItems={estruturaPorSetor.dp.map((ano) => `dp-ano-${ano.ano}`)}
                    sx={{ width: '100%' }}
                  >
                    {estruturaPorSetor.dp.map((anoData) => {
                      const totalAno = anoData.meses.reduce((acc, mes) => acc + mes.guias.length, 0);
                      return (
                        <TreeItem
                          key={`dp-ano-${anoData.ano}`}
                          itemId={`dp-ano-${anoData.ano}`}
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Iconify icon="solar:calendar-bold-duotone" width={18} />
                              <Typography variant="subtitle1">{anoData.ano}</Typography>
                              <Chip label={totalAno} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Stack>
                          }
                        >
                          {anoData.meses.map((mes) => (
                            <TreeItem
                              key={mes.mesKey}
                              itemId={mes.mesKey}
                              label={
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMesClick(mes.mesKey);
                                  }}
                                  sx={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <Iconify icon="solar:calendar-mark-bold-duotone" width={16} />
                                  <Typography variant="body2">{mes.mesLabel}</Typography>
                                  <Chip
                                    label={mes.guias.length}
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                    color={mesSelecionado === mes.mesKey ? 'info' : 'default'}
                                  />
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem>
                      );
                    })}
                  </SimpleTreeView>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Área de documentos do mês selecionado */}
          {mesSelecionado && documentosMesSelecionado.length > 0 && (
            <Card sx={{ p: 3, mt: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Iconify icon="solar:document-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6">
                      Documentos do mês selecionado
                    </Typography>
                    <Chip label={documentosMesSelecionado.length} size="small" color="primary" variant="soft" />
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="eva:close-fill" />}
                    onClick={() => setMesSelecionado(null)}
                  >
                    Fechar
                  </Button>
                </Stack>
                <Divider />
                <Scrollbar>
                  <Stack spacing={2}>
                    {documentosMesSelecionado.map((guia) => (
                      <GuiaFiscalPortalCard
                        key={guia._id}
                        guia={guia}
                        onView={handleViewDetails}
                        onDownload={handleDownload}
                        onSolicitarAtualizacao={handleSolicitarAtualizacao}
                      />
                    ))}
                  </Stack>
                </Scrollbar>
              </Stack>
            </Card>
          )}
            </Stack>
          )}
        </CardContent>
      </Card>
      </m.div>
    </LazyMotion>
  );
}
