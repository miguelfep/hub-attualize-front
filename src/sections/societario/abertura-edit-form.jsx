'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

import { updateAbertura } from 'src/actions/societario';

import { Form, schemaHelper } from 'src/components/hook-form';

import AberturaIniciadoForm from './abertura-iniciado-form';
import { AberturaKickoffForm } from './abertura-kickoff-form';
// Importação dos componentes específicos para cada status
import { AberturaValidacaoForm } from './abertura-validacao-form';
import { AberturaOnboardingForm } from './abertura-onboarding-form';
import { AberturaConstituicaoFormNew } from './abertura-constituicao-form-new';

// Definir o esquema de validação usando Zod
const AberturaSchema = zod.object({
  nomeEmpresarial: zod.string().min(1, { message: 'Nome empresarial é obrigatório' }),
  dataCriacao: schemaHelper.date({ message: { required_error: 'Data de criação é obrigatória' } }),
  statusAbertura: zod.enum([
    'Iniciado',
    'em_validacao',
    'kickoff',
    'em_constituicao',
    'onboarding',
    'finalizado',
  ]),
});

// Mapeamento dos status para facilitar navegação
// Ordem: Iniciado -> em_validacao -> kickoff -> em_constituicao -> onboarding -> finalizado
const statusMap = {
  Iniciado: 'em_validacao',
  em_validacao: 'kickoff',
  kickoff: 'em_constituicao',
  em_constituicao: 'onboarding',
  onboarding: 'finalizado',
  finalizado: null, // Não avança mais a partir daqui
};

// Mapeamento reverso para voltar ao status anterior
const reverseStatusMap = {
  finalizado: 'onboarding',
  onboarding: 'em_constituicao',
  em_constituicao: 'kickoff',
  kickoff: 'em_validacao',
  em_validacao: 'Iniciado',
  Iniciado: null, // Não volta mais a partir daqui
};

const statusDisplayMap = {
  Iniciado: 'Iniciado',
  em_validacao: 'Em Validação',
  kickoff: 'Kickoff',
  em_constituicao: 'Em Constituição',
  onboarding: 'Onboarding',
  finalizado: 'Finalizado',
};
// ----------------------------------------------------------------------

export function AberturaEditForm({ currentAbertura }) {
  const loading = useBoolean();
  const [etapasCompletadas, setEtapasCompletadas] = useState(
    currentAbertura?.etapasCompletadas || []
  );

  const defaultValues = useMemo(
    () => ({
      nomeEmpresarial: currentAbertura?.nomeEmpresarial || '',
      dataCriacao: currentAbertura?.dataCriacao || today(),
      statusAbertura: currentAbertura?.statusAbertura || 'Iniciado',
    }),
    [currentAbertura]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AberturaSchema),
    defaultValues,
  });

  const { watch, setValue } = methods;
  const statusAbertura = watch('statusAbertura');

  // Sincroniza as etapas completadas quando currentAbertura mudar
  useEffect(() => {
    if (currentAbertura?.etapasCompletadas) {
      setEtapasCompletadas(currentAbertura.etapasCompletadas);
    }
  }, [currentAbertura?.etapasCompletadas]);

  // Verifica se todas as etapas estão completas (0 a 10)
  // Se a situação atual for 10 (Abertura concluída), considera todas completas
  const todasEtapasCompletas = () => {
    if (currentAbertura?.situacaoAbertura === 10) return true;
    const todasEtapas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return todasEtapas.every((etapa) => etapasCompletadas.includes(etapa));
  };

  // Verifica se pode avançar do status em_constituicao
  const podeAvancarDeConstituicao = () => {
    if (statusAbertura !== 'em_constituicao') return true;
    return todasEtapasCompletas();
  };

  const handleAdvanceStatus = async (customStatus) => {
    const nextStatus = customStatus || statusMap[statusAbertura];
    if (nextStatus) {
      loading.onTrue();
      try {
        await updateAbertura(currentAbertura._id, {
          statusAbertura: nextStatus,
          somenteAtualizar: false,
        });
        setValue('statusAbertura', nextStatus);
        toast.success('Status avançado com sucesso!');
      } catch (error) {
        console.error('Erro ao avançar o status:', error);
        toast.error('Erro ao avançar o status');
      } finally {
        loading.onFalse();
      }
    }
  };

  const handleGoBackStatus = async () => {
    const previousStatus = reverseStatusMap[statusAbertura];
    if (previousStatus) {
      loading.onTrue();
      try {
        await updateAbertura(currentAbertura._id, { statusAbertura: previousStatus });
        setValue('statusAbertura', previousStatus);
        toast.success('Status retornado com sucesso!');
      } catch (error) {
        console.error(error);
        toast.error('Erro ao retornar o status');
      } finally {
        loading.onFalse();
      }
    }
  };

  const handleArquivar = async () => {
    loading.onTrue();
    try {
      await updateAbertura(currentAbertura._id, { statusAbertura: 'Inativo' });
      setValue('statusAbertura', 'Inativo');
      toast.success('Abertura arquivada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao arquivar abertura');
    } finally {
      loading.onFalse();
    }
  };

  const renderStatusComponent = () => {
    switch (statusAbertura) {
      case 'Iniciado':
        return (
          <AberturaIniciadoForm
            currentAbertura={currentAbertura}
            handleAdvanceStatus={handleAdvanceStatus}
          />
        );
      case 'em_validacao':
        return <AberturaValidacaoForm currentAbertura={currentAbertura} setValue={setValue} />;
      case 'kickoff':
        return <AberturaKickoffForm currentAbertura={currentAbertura} />;
      case 'em_constituicao':
        return (
          <AberturaConstituicaoFormNew
            currentAbertura={currentAbertura}
            onEtapasChange={setEtapasCompletadas}
          />
        );
      case 'onboarding':
        return <AberturaOnboardingForm currentAbertura={currentAbertura} />;
      case 'finalizado':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Abertura Finalizada
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGoBackStatus}
                disabled={loading.value}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleArquivar}
                disabled={loading.value}
              >
                Arquivar Abertura
              </Button>
            </Stack>
          </Box>
        );
      default:
        return <AberturaConstituicaoFormNew currentAbertura={currentAbertura} />;
    }
  };

  const shouldShowAdvanceButton = ['Iniciado', 'kickoff', 'em_constituicao', 'onboarding'].includes(
    statusAbertura
  );

  return (
    <Form methods={methods}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Chip
          label={`Status: ${statusDisplayMap[statusAbertura] || statusAbertura}`}
          color="success"
          sx={{ fontSize: '1rem', fontWeight: 'bold' }}
        />
      </Box>
      <>{renderStatusComponent()}</>

      {statusAbertura !== 'finalizado' && (
        <Stack justifyContent="space-between" direction="row" spacing={2} sx={{ mt: 3 }}>
          {shouldShowAdvanceButton && (
            <Button
              variant="outlined"
              disabled={!reverseStatusMap[statusAbertura] || loading.value}
              onClick={handleGoBackStatus}
            >
              Voltar
            </Button>
          )}
          {shouldShowAdvanceButton && (
            <Button
              variant="contained"
              onClick={() => handleAdvanceStatus(statusMap[statusAbertura])}
              disabled={loading.value || !podeAvancarDeConstituicao()}
              title={
                !podeAvancarDeConstituicao()
                  ? 'Complete todas as etapas da abertura para avançar'
                  : ''
              }
            >
              Avançar
            </Button>
          )}
        </Stack>
      )}
    </Form>
  );
}
