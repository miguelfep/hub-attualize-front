'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Chip, Stack, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';

import { updateAlteracao } from 'src/actions/societario';

import { Form, schemaHelper } from 'src/components/hook-form';

import AlteracaoValidacaoForm from 'src/sections/societario/alteracao/alteracao-validacao-form';

import AlteracaoKickoffForm from './alteracao-kickoff-form';
import AlteracaoIniciadoForm from './alteracao-iniciado-form';
import AlteracaoEmAlteracaoForm from './alteracao-em-alteracao';

// Definir o esquema de validação usando Zod
const AlteracaoSchema = zod.object({
  razaoSocial: zod.string().min(1, { message: 'Nome empresarial é obrigatório' }),
  dataCriacao: schemaHelper.date({ message: { required_error: 'Data de criação é obrigatória' } }),
  statusAlteracao: zod.enum([
    'iniciado',
    'em_validacao',
    'kickoff',
    'em_alteracao',
    'finalizado',
  ]),
});

// Mapeamento dos status para facilitar navegação
const statusMap = {
  Iniciado: 'em_validacao',
  em_validacao: 'kickoff',
  kickoff: 'em_alteracao',
  em_alteracao: 'finalizado',
  finalizado: null, // Não avança mais a partir daqui
};

// Mapeamento reverso para voltar ao status anterior
const reverseStatusMap = {
  finalizado: 'em_alteracao',
  em_alteracao: 'kickoff',
  kickoff: 'em_validacao',
  em_validacao: 'iniciado',
  Iniciado: null, // Não volta mais a partir daqui
};


const statusDisplayMap = {
  Iniciado: 'Iniciado',
  em_validacao: 'Em Validação',
  kickoff: 'Kickoff',
  em_alteracao: 'Em Alteração',
  finalizado: 'Finalizado',
};
// ----------------------------------------------------------------------

export default function AlteracaoEditForm({ alteracaoData }) {
  const loading = useBoolean();

  const defaultValues = useMemo(
    () => ({
      razaoSocial: alteracaoData?.razaoSocial || '',
      dataCriacao: alteracaoData?.dataCriacao || today(),
      statusAlteracao: alteracaoData?.statusAlteracao || 'Iniciado',
    }),
    [alteracaoData]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AlteracaoSchema),
    defaultValues,
  });

  const { watch, setValue } = methods;
  const statusAlteracao = watch('statusAlteracao');

  const handleAdvanceStatus = async (customStatus) => {
    const nextStatus = customStatus || statusMap[statusAlteracao];
    if (nextStatus) {
      loading.onTrue();
      try {
        updateAlteracao(alteracaoData._id, { statusAlteracao: nextStatus, somenteAtualizar: false });
        setValue('statusAlteracao', nextStatus);
        toast.success('Status avançado com sucesso!');
      } catch (error) {
        toast.error('Erro ao avançar o status');
      } finally {
        loading.onFalse();
      }
    }
  };

  const handleGoBackStatus = async () => {
    const previousStatus = reverseStatusMap[statusAlteracao];
    if (previousStatus) {
      loading.onTrue();
      try {
        await updateAlteracao(alteracaoData._id, { statusAlteracao: previousStatus });
        setValue('statusAlteracao', previousStatus);
        toast.success('Status retornado com sucesso!');
      } catch (error) {
        toast.error('Erro ao retornar o status');
      } finally {
        loading.onFalse();
      }
    }
  };

  const renderStatusComponent = () => {
    switch (statusAlteracao) {
      case 'iniciado':
        return <AlteracaoIniciadoForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'em_validacao':
        return <AlteracaoValidacaoForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'kickoff':
        return <AlteracaoKickoffForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'em_alteracao':
        return <AlteracaoEmAlteracaoForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'finalizado':
        return <Typography textAlign='center'>Alteração finalizada com sucesso. Para visualizá-la, volte ao lista de alterações</Typography>;
      default:
        return null;
    }
  };

  const shouldShowAdvanceButton = ['Iniciado', 'kickoff', 'em_validacao'].includes(statusAlteracao);

  return (
    <Form methods={methods}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Chip
          label={`Status: ${statusDisplayMap[statusAlteracao] || 'Iniciado'}`}
          color="success"
          sx={{ fontSize: '1rem', fontWeight: 'bold' }}
        />
      </Box>
      <>{renderStatusComponent()}</>

      <Stack justifyContent="space-between" direction="row" spacing={2} sx={{ mt: 3 }}>
        {shouldShowAdvanceButton && (
          <Button
            variant="outlined"
            disabled={!reverseStatusMap[statusAlteracao]}
            onClick={handleGoBackStatus}
            loading={loading.value}
          >
            Voltar
          </Button>
        )}
        {shouldShowAdvanceButton && (
          <Button
            variant="contained"
            onClick={() => handleAdvanceStatus(statusMap[statusAlteracao])}
            loading={loading.value}
          >
            Avançar
          </Button>
        )}
      </Stack>
    </Form>
  );
}