'use client';

import axios from 'axios';
import { toast } from 'sonner';
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';

import {
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  CardContent,
  CardActions,
} from '@mui/material';

import { updateAlteracao, sendMessageLink } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';
import { RHFPhoneInput } from 'src/components/hook-form';

export default function AlteracaoIniciadoForm({ currentAlteracao = {}, handleAdvanceStatus }) {
  const router = useRouter();
  const { control, register, getValues, trigger, watch, formState: { errors } } = useFormContext();
  const shouldNotifyOnAdvance = !!watch('notificarWhats');

  const onSave = async (shouldAdvance = false) => {
    const fieldsOk = await trigger(['nome', 'email', 'whatsapp']);
    if (!fieldsOk) {
      toast.error('Preencha nome, e-mail e WhatsApp corretamente.');
      return;
    }
    try {
      const editedData = getValues();
      const res = await updateAlteracao(currentAlteracao._id, {
        ...editedData,
        somenteAtualizar: true,
      });
      if (res.status === 200) {
        toast.success('Dados salvos com sucesso!');
        if (shouldAdvance && handleAdvanceStatus) {
          await handleAdvanceStatus('em_validacao');
        }
      } else {
        const errorMessage = res.data?.message || 'Erro ao salvar os dados';
        toast.error(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao salvar os dados';
      toast.error(`Erro: ${errorMessage}`);
    }
  };

  const onReenviarLink = async () => {
    try {
      nProgress.start();
      const result = await sendMessageLink(currentAlteracao._id);
      if (axios.isAxiosError(result)) {
        toast.error('Erro ao reenviar link');
        return;
      }
      toast.success('Mensagem enviada com sucesso!');
    } finally {
      nProgress.done();
    }
  };

  const viewForm = () => {
    nProgress.start();
    router.push(`/empresa/alteracao/${currentAlteracao._id}`);
  };

  return (
    <Card sx={{ width: '100%', maxWidth: '100%', p: 4, mb: 3 }}>
      <CardContent sx={{ pt: 0, px: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, px: 2 }}>
          Dados da Alteração
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 2 }}>
          Formulário inicial foi enviado ao cliente. Ajuste contato abaixo se necessário e use os
          atalhos para reenviar o link ou abrir o formulário público.
        </Typography>

        <Grid container spacing={0} sx={{ '& > *': { px: 2, mb: 2 } }}>
          <Grid xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Nome"
              defaultValue={currentAlteracao.nome || ''}
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              size="small"
              fullWidth
              label="Email"
              type="email"
              defaultValue={currentAlteracao.email || ''}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', { required: 'E-mail é obrigatório' })}
            />
          </Grid>

          <Grid xs={12} sm={6}>
            <RHFPhoneInput
              name="whatsapp"
              label="WhatsApp"
              placeholder="Digite o número"
              size="small"
              country="BR"
            />
          </Grid>
        </Grid>

        <CardActions sx={{ justifyContent: 'space-between', mt: 2, px: 0, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="ic:baseline-whatsapp" />}
              onClick={onReenviarLink}
            >
              Reenviar link
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="mdi:form" />}
              onClick={viewForm}
            >
              Ver formulário
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button color="success" variant="contained" onClick={() => onSave(false)}>
              Salvar
            </Button>
            {handleAdvanceStatus && (
              <Button color="primary" variant="contained" onClick={() => onSave(true)}>
                Salvar e avançar
              </Button>
            )}
          </Stack>
        </CardActions>
      </CardContent>
    </Card>
  );
}
