'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { usePortalFuncionarios } from 'src/actions/departamento-pessoal';

import { EmptyContent } from 'src/components/empty-content';

import { useDpPortalContext } from '../dp-shared';
import { PortalDpCompetenciaMensalPanel } from './portal-dp-competencia-mensal-panel';

// ----------------------------------------------------------------------

function errMessage(err) {
  if (typeof err === 'string') return err;
  return err?.message || 'Erro ao carregar dados';
}

export function PortalDpApontamentosHubView() {
  const { enabled, loadingEmpresas, clienteProprietarioId } = useDpPortalContext();
  const { data: funcionarios, isLoading, error } = usePortalFuncionarios(clienteProprietarioId, {});

  const show403 = error && (error?.status === 403 || String(errMessage(error)).includes('403'));

  const elegiveis = (funcionarios || []).filter(
    (f) => f.statusCadastro === 'aprovado' && f.statusVinculo === 'ativo'
  );

  if (loadingEmpresas || !clienteProprietarioId) {
    return (
      <Typography sx={{ p: 2 }} variant="body2" color="text.secondary">
        Carregando…
      </Typography>
    );
  }

  if (!enabled) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        O módulo Departamento Pessoal não está habilitado para esta empresa. Peça à Attualize para ativar a opção
        Possui funcionário no cadastro da empresa para lançar apontamentos.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1160, mx: 'auto', pb: { xs: 3, md: 5 } }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Apontamentos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 640 }}>
          Cada card é um mês: veja se já foi enviado ao escritório. Para incluir ou corrigir lançamentos, abra o mês e use{' '}
          <strong>Lançar ou editar apontamentos</strong>.
        </Typography>
      </Stack>

      {show403 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {errMessage(error)}
        </Alert>
      )}

      <PortalDpCompetenciaMensalPanel clienteProprietarioId={clienteProprietarioId} />

      {!isLoading && elegiveis.length === 0 && (
        <EmptyContent
          filled
          title="Nenhum colaborador elegível"
          description="Quando o cadastro for aprovado e o vínculo estiver ativo, você poderá lançar apontamentos."
          sx={{ py: 6, mb: 3, borderRadius: 2 }}
        />
      )}

      {!isLoading && elegiveis.length > 0 && (
        <Alert severity="info" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
          <strong>Próximo passo:</strong> clique no mês → <strong>Lançar ou editar apontamentos</strong> → escolha o
          colaborador e preencha o formulário.
        </Alert>
      )}
    </Box>
  );
}
