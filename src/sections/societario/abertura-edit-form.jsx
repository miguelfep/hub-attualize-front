'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

import { updateAbertura } from 'src/actions/societario';

import { Form, schemaHelper } from 'src/components/hook-form';

import AberturaIniciadoForm from './abertura-iniciado-form';
// Importação dos componentes específicos para cada status
import { AberturaValidacaoForm } from './abertura-validacao-form';
import { AberturaConstituicaoForm } from './abertura-constituicao-form';

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

// ----------------------------------------------------------------------

export function AberturaEditForm({ currentAbertura }) {
  const router = useRouter();
  const loading = useBoolean();

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

  const handleAdvanceStatus = async () => {
    const nextStatus = statusMap[statusAbertura];
    if (nextStatus) {
      loading.onTrue();
      try {
        const response = await updateAbertura(currentAbertura._id, { statusAbertura: nextStatus, somenteAtualizar: false });
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

  const renderStatusComponent = () => {
    switch (statusAbertura) {
      case 'Iniciado':
        return <AberturaIniciadoForm currentAbertura={currentAbertura} />;
      case 'em_validacao':
        return <AberturaValidacaoForm currentAbertura={currentAbertura} />;
      case 'onboarding':
        return <div>Usuário gerado, clique em avançar</div>;  
      default:
        return <AberturaConstituicaoForm currentAbertura={currentAbertura} />;
    }
  };
  return (
    <Form methods={methods}>
      <>{renderStatusComponent()}</>

      <Stack justifyContent="space-between" direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          disabled={!reverseStatusMap[statusAbertura]}
          onClick={handleGoBackStatus}
          loading={loading.value}
        >
          Voltar
        </Button>

        <Button
          variant="contained"
          disabled={!statusMap[statusAbertura]}
          onClick={handleAdvanceStatus}
          loading={loading.value}
        >
          Avançar
        </Button>
      </Stack>
    </Form>
  );
}