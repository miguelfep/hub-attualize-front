'use client';

import * as zod from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const IndicacaoSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório' }),
  email: zod.string().email({ message: 'Email inválido' }),
  telefone: zod.string().min(10, { message: 'Telefone inválido' }),
  cpf: zod.string().optional(),
  estado: zod.string().optional(),
  cidade: zod.string().optional(),
  observacoes: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function IndicacaoFormView({ codigo }) {
  const router = useRouter();
  const { criar } = useIndicacoes();
  const [success, setSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(IndicacaoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      estado: '',
      cidade: '',
      observacoes: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoadingSubmit(true);
      
      await criar({
        codigoIndicacao: codigo,
        ...data,
      });
      
      setSuccess(true);
      reset();
    } catch (error) {
      console.error('Erro ao enviar indicação:', error);
    } finally {
      setLoadingSubmit(false);
    }
  });

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Iconify 
                icon="solar:check-circle-bold-duotone" 
                width={80} 
                sx={{ color: 'success.main' }} 
              />
            </Box>
            
            <Typography variant="h4" sx={{ mb: 2 }}>
              Indicação enviada com sucesso!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Obrigado pelo seu interesse! Nossa equipe entrará em contato em breve.
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/')}
            >
              Voltar para o site
            </Button>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Card sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Você foi indicado!
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Preencha o formulário abaixo e nossa equipe entrará em contato para apresentar nossos serviços de contabilidade.
              </Typography>
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Código de indicação:</strong> {codigo}
              </Typography>
            </Alert>

            <form onSubmit={onSubmit}>
              <Stack spacing={3}>
                <TextField
                  {...register('nome')}
                  label="Nome completo *"
                  fullWidth
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                />

                <TextField
                  {...register('email')}
                  label="Email *"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <TextField
                  {...register('telefone')}
                  label="Telefone *"
                  fullWidth
                  placeholder="(00) 00000-0000"
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                />

                <TextField
                  {...register('cpf')}
                  label="CPF"
                  fullWidth
                  placeholder="000.000.000-00"
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    {...register('estado')}
                    label="Estado"
                    fullWidth
                    error={!!errors.estado}
                    helperText={errors.estado?.message}
                  />

                  <TextField
                    {...register('cidade')}
                    label="Cidade"
                    fullWidth
                    error={!!errors.cidade}
                    helperText={errors.cidade?.message}
                  />
                </Stack>

                <TextField
                  {...register('observacoes')}
                  label="Observações"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Conte-nos um pouco sobre sua empresa ou suas necessidades..."
                  error={!!errors.observacoes}
                  helperText={errors.observacoes?.message}
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={loadingSubmit || isSubmitting}
                  fullWidth
                >
                  Enviar indicação
                </LoadingButton>

                <Typography variant="caption" color="text.secondary" textAlign="center">
                  * Campos obrigatórios
                </Typography>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
