'use client';

import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { Box, Card, Chip, Stack, Button, Switch, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { today } from 'src/utils/format-time';
import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { updateAlteracao } from 'src/actions/societario';

import { Form, schemaHelper } from 'src/components/hook-form';

import AlteracaoValidacaoForm from 'src/sections/societario/alteracao/alteracao-validacao-form';

import AlteracaoKickoffForm from './alteracao-kickoff-form';
import AlteracaoIniciadoForm from './alteracao-iniciado-form';
import AlteracaoEmAlteracaoForm from './alteracao-em-alteracao';

// Campos da etapa "iniciado": nome/e-mail/whatsapp obrigatórios só quando status é `iniciado` (zodResolver ignora `rules` do Controller).
const AlteracaoSchema = zod
  .object({
    razaoSocial: zod.string().min(1, { message: 'Nome empresarial é obrigatório' }),
    dataCriacao: schemaHelper.date({ message: { required_error: 'Data de criação é obrigatória' } }),
    statusAlteracao: zod.enum([
      'iniciado',
      'em_validacao',
      'kickoff',
      'em_alteracao',
      'finalizado',
    ]),
    nome: zod.string().optional(),
    email: zod
      .string()
      .optional()
      .refine((val) => val == null || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'E-mail inválido',
      }),
    whatsapp: zod.string().optional(),
    notificarWhats: zod.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.statusAlteracao !== 'iniciado') return;

    const nome = data.nome?.trim() ?? '';
    if (!nome) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Nome é obrigatório', path: ['nome'] });
    }

    const email = data.email?.trim() ?? '';
    if (!email) {
      ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'E-mail é obrigatório', path: ['email'] });
    }

    const whatsapp = data.whatsapp?.trim() ?? '';
    if (!whatsapp) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'WhatsApp é obrigatório',
        path: ['whatsapp'],
      });
      return;
    }
    if (!isValidPhoneNumber(whatsapp)) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'WhatsApp inválido',
        path: ['whatsapp'],
      });
    }
  });

// Mapeamento dos status (valores iguais ao Mongo / API: iniciado em minúsculo)
const statusMap = {
  iniciado: 'em_validacao',
  em_validacao: 'kickoff',
  kickoff: 'em_alteracao',
  em_alteracao: 'finalizado',
  finalizado: null,
};

const reverseStatusMap = {
  finalizado: 'em_alteracao',
  em_alteracao: 'kickoff',
  kickoff: 'em_validacao',
  em_validacao: 'iniciado',
  iniciado: null,
};

const statusDisplayMap = {
  iniciado: 'Iniciado',
  em_validacao: 'Em Validação',
  kickoff: 'Kickoff',
  em_alteracao: 'Em Alteração',
  finalizado: 'Finalizado',
};
// ----------------------------------------------------------------------

export default function AlteracaoEditForm({ alteracaoData }) {
  const loading = useBoolean();
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      razaoSocial: alteracaoData?.razaoSocial || '',
      dataCriacao: alteracaoData?.dataCriacao || today(),
      statusAlteracao: alteracaoData?.statusAlteracao || 'iniciado',
      nome: alteracaoData?.nome || '',
      email: alteracaoData?.email || '',
      whatsapp: normalizePhoneToE164(alteracaoData?.whatsapp),
      notificarWhats: alteracaoData?.notificarWhats ?? true,
    }),
    [alteracaoData]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AlteracaoSchema),
    defaultValues,
  });

  const { watch, setValue, getValues } = methods;
  const statusAlteracao = watch('statusAlteracao');

  useEffect(() => {
    if (alteracaoData?.statusAlteracao != null) {
      setValue('statusAlteracao', alteracaoData.statusAlteracao);
    }
    if (alteracaoData?.razaoSocial != null) {
      setValue('razaoSocial', alteracaoData.razaoSocial || '');
    }
    if (alteracaoData?.dataCriacao != null) {
      setValue('dataCriacao', alteracaoData.dataCriacao || today());
    }
    if (alteracaoData?.nome != null) {
      setValue('nome', alteracaoData.nome || '');
    }
    if (alteracaoData?.email != null) {
      setValue('email', alteracaoData.email || '');
    }
    if (alteracaoData?.whatsapp != null) {
      setValue('whatsapp', normalizePhoneToE164(alteracaoData.whatsapp));
    }
    if (alteracaoData?.notificarWhats != null) {
      setValue('notificarWhats', alteracaoData?.notificarWhats ?? true);
    }
  }, [
    alteracaoData?.statusAlteracao,
    alteracaoData?.razaoSocial,
    alteracaoData?.dataCriacao,
    alteracaoData?.nome,
    alteracaoData?.email,
    alteracaoData?.whatsapp,
    alteracaoData?.notificarWhats,
    setValue,
  ]);

  const handleAdvanceStatus = async (customStatus, notifyOverride) => {
    const nextStatus = customStatus || statusMap[statusAlteracao];
    if (nextStatus) {
      loading.onTrue();
      try {
        const shouldNotify = notifyOverride ?? !!getValues('notificarWhats');
        await updateAlteracao(alteracaoData._id, {
          statusAlteracao: nextStatus,
          somenteAtualizar: false,
          notificarWhats: shouldNotify,
        });
        setValue('statusAlteracao', nextStatus);
        toast.success(
          shouldNotify
            ? 'Status avançado! Notificação WhatsApp enviada.'
            : 'Status avançado sem notificação WhatsApp.'
        );
        router.refresh();
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
        await updateAlteracao(alteracaoData._id, {
          statusAlteracao: previousStatus,
          somenteAtualizar: false,
          notificarWhats: false,
        });
        setValue('statusAlteracao', previousStatus);
        toast.success('Status retornado com sucesso!');
        router.refresh();
      } catch (error) {
        toast.error('Erro ao retornar o status');
      } finally {
        loading.onFalse();
      }
    }
  };

  const handleArquivar = async () => {
    loading.onTrue();
    try {
      await updateAlteracao(alteracaoData._id, { status: false });
      toast.success('Alteração arquivada com sucesso!');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao arquivar alteração');
    } finally {
      loading.onFalse();
    }
  };

  const setStatusLocal = (newStatus) => setValue('statusAlteracao', newStatus);

  if (alteracaoData?.status === false) {
    return (
      <Form methods={methods}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip
            label="Inativo"
            color="default"
            sx={{ fontSize: '1rem', fontWeight: 'bold' }}
          />
        </Box>
        <AlteracaoEmAlteracaoForm currentAlteracao={alteracaoData} isArchived />
      </Form>
    );
  }

  const renderStatusComponent = () => {
    switch (statusAlteracao) {
      case 'iniciado':
        return (
          <AlteracaoIniciadoForm
            currentAlteracao={alteracaoData}
            handleAdvanceStatus={handleAdvanceStatus}
          />
        );
      case 'em_validacao':
        return <AlteracaoValidacaoForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} statusAlteracao={statusAlteracao} setStatusLocal={setStatusLocal} />;
      case 'kickoff':
        return <AlteracaoKickoffForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'em_alteracao':
        return <AlteracaoEmAlteracaoForm currentAlteracao={alteracaoData} handleAdvanceStatus={handleAdvanceStatus} />;
      case 'finalizado':
        return (
          <Card sx={{ width: '100%', maxWidth: '100%', p: 4, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Alteração Finalizada
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
                Arquivar Alteração
              </Button>
            </Stack>
          </Card>
        );
      default:
        return null;
    }
  };

  const shouldShowAdvanceButton = ['iniciado', 'kickoff', 'em_alteracao'].includes(statusAlteracao);

  return (
    <Form methods={methods}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Chip
          label={`Status: ${statusDisplayMap[statusAlteracao] || statusDisplayMap.iniciado}`}
          color="success"
          sx={{ fontSize: '1rem', fontWeight: 'bold' }}
        />
      </Box>
      <>{renderStatusComponent()}</>

      {statusAlteracao !== 'finalizado' && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {shouldShowAdvanceButton && (
            <>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  variant="outlined"
                  disabled={!reverseStatusMap[statusAlteracao] || loading.value}
                  onClick={handleGoBackStatus}
                >
                  Voltar
                </Button>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: watch('notificarWhats') ? 'success.lighter' : 'warning.lighter',
                    border: '1px solid',
                    borderColor: watch('notificarWhats') ? 'success.light' : 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        color="success"
                        checked={!!watch('notificarWhats')}
                        onChange={(_, checked) => setValue('notificarWhats', checked)}
                        disabled={loading.value}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {watch('notificarWhats')
                          ? 'Avançar notificando no Whats'
                          : 'Avançar sem notificar no Whats'}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => handleAdvanceStatus(statusMap[statusAlteracao])}
                  disabled={loading.value}
                >
                  Avançar
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Form>
  );
}