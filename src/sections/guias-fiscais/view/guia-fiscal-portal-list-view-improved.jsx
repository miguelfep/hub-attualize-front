'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetGuiasFiscaisPortal, downloadGuiaFiscalPortal } from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { GuiaFiscalPortalCard } from '../components/guia-fiscal-portal-card';

// ----------------------------------------------------------------------

export function GuiaFiscalPortalListViewImproved() {
  const router = useRouter();

  const [categoriaAtiva, setCategoriaAtiva] = useState('fiscal'); // 'fiscal' ou 'dp'

  // Buscar todas as guias fiscais
  const { data, isLoading, mutate } = useGetGuiasFiscaisPortal({
    limit: 1000,
  });

  // Agrupar por categoria e ordenar por data (mais recente primeiro)
  const guiasAgrupadas = useMemo(() => {
    const guias = data?.guias || [];
    const grupos = {
      GUIA_FISCAL: [],
      GUIA_DP: [],
      DOCUMENTO_DP: [],
    };

    guias.forEach((guia) => {
      const categoria = guia.categoria || 'GUIA_FISCAL';
      if (grupos[categoria]) {
        grupos[categoria].push(guia);
      }
    });

    // Ordenar cada grupo por data de criação/atualização (mais recente primeiro)
    Object.keys(grupos).forEach((categoria) => {
      grupos[categoria].sort((a, b) => {
        // Priorizar data de vencimento, senão usar createdAt
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
        return dataB - dataA; // Mais recente primeiro
      });
    });

    return grupos;
  }, [data?.guias]);

  // Filtrar guias baseado no toggle ativo e agrupar por mês
  const guiasExibidasPorMes = useMemo(() => {
    let guiasFiltradas = [];
    if (categoriaAtiva === 'fiscal') {
      guiasFiltradas = guiasAgrupadas.GUIA_FISCAL;
    } else {
      // DP: inclui tanto GUIA_DP quanto DOCUMENTO_DP
      guiasFiltradas = [...guiasAgrupadas.GUIA_DP, ...guiasAgrupadas.DOCUMENTO_DP];
    }

    // Agrupar por mês/ano
    const gruposPorMes = {};
    guiasFiltradas.forEach((guia) => {
      const dataVencimento = guia.dataVencimento 
        ? new Date(guia.dataVencimento) 
        : guia.createdAt 
          ? new Date(guia.createdAt) 
          : new Date();
      
      const mesAno = `${dataVencimento.getFullYear()}-${String(dataVencimento.getMonth() + 1).padStart(2, '0')}`;
      const mesAnoLabel = dataVencimento.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!gruposPorMes[mesAno]) {
        gruposPorMes[mesAno] = {
          label: mesAnoLabel.charAt(0).toUpperCase() + mesAnoLabel.slice(1),
          mesAno,
          guias: [],
        };
      }
      gruposPorMes[mesAno].guias.push(guia);
    });

    // Ordenar meses (mais recente primeiro)
    return Object.values(gruposPorMes).sort((a, b) => b.mesAno.localeCompare(a.mesAno));
  }, [categoriaAtiva, guiasAgrupadas]);

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

  const guias = data?.guias || [];
  const totalGuias = guias.length;
  const totalGuiasFiscais = guiasAgrupadas.GUIA_FISCAL.length;
  const totalDP = guiasAgrupadas.GUIA_DP.length + guiasAgrupadas.DOCUMENTO_DP.length;

  const handleCategoriaChange = (event, newCategoria) => {
    if (newCategoria !== null) {
      setCategoriaAtiva(newCategoria);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Guias"
        links={[
          { name: 'Dashboard', href: paths.cliente.dashboard },
          { name: 'Guias' },
        ]}
        action={
          <Button
            component="a"
            href={paths.cliente.guiasFiscais.calendar}
            variant="outlined"
            startIcon={<Iconify icon="solar:calendar-bold" />}
          >
            Ver Calendário
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Toggle para alternar entre Fiscal e DP */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Categoria</Typography>
            <ToggleButtonGroup
              value={categoriaAtiva}
              exclusive
              onChange={handleCategoriaChange}
              aria-label="categoria"
              size="small"
            >
              <ToggleButton value="fiscal" aria-label="fiscal">
                <Iconify icon="solar:document-text-bold-duotone" width={20} sx={{ mr: 1 }} />
                Fiscal ({totalGuiasFiscais})
              </ToggleButton>
              <ToggleButton value="dp" aria-label="dp">
                <Iconify icon="solar:file-text-bold-duotone" width={20} sx={{ mr: 1 }} />
                Departamento Pessoal ({totalDP})
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Card>

      {isLoading ? (
        <Card sx={{ p: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando documentos...
            </Typography>
          </Stack>
        </Card>
      ) : guiasExibidasPorMes.length === 0 ? (
        <Card sx={{ p: 3 }}>
          <Stack alignItems="center" spacing={2}>
            <Iconify icon="solar:file-text-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum documento encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoriaAtiva === 'fiscal' 
                ? 'Nenhuma guia fiscal encontrada.' 
                : 'Nenhum documento de departamento pessoal encontrado.'}
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Scrollbar>
          <Stack spacing={3}>
            {guiasExibidasPorMes.map((grupo) => (
              <Box key={grupo.mesAno}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {grupo.label}
                  </Typography>
                  <Chip 
                    label={grupo.guias.length} 
                    size="small" 
                    color="primary" 
                    variant="soft"
                  />
                </Stack>
                <Stack spacing={2}>
                  {grupo.guias.map((guia) => (
                    <GuiaFiscalPortalCard
                      key={guia._id}
                      guia={guia}
                      onView={handleViewDetails}
                      onDownload={handleDownload}
                      onSolicitarAtualizacao={handleSolicitarAtualizacao}
                    />
                  ))}
                </Stack>
                {guiasExibidasPorMes.indexOf(grupo) < guiasExibidasPorMes.length - 1 && (
                  <Divider sx={{ mt: 3 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      )}

    </DashboardContent>
  );
}
