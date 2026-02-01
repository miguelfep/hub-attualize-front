'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import InputMask from 'react-input-mask';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { criarIndicacao, obterIndicadorPorCodigo } from 'src/actions/indicacoes';

// ----------------------------------------------------------------------

// Função para validar CPF
function validarCPF(cpf) {
  if (!cpf) return true; // CPF é opcional
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

const schema = zod.object({
  nome: zod.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: zod.string().email('Email inválido'),
  telefone: zod
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(
      (val) => {
        const clean = val?.replace(/\D/g, '') || '';
        return clean.length >= 10 && clean.length <= 11;
      },
      'Telefone inválido (deve ter 10 ou 11 dígitos)'
    ),
  cpf: zod
    .string()
    .optional()
    .refine((val) => !val || validarCPF(val), 'CPF inválido'),
  estado: zod.string().optional(),
  cidade: zod.string().optional(),
  observacoes: zod.string().optional(),
});

const defaultValues = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  estado: '',
  cidade: '',
  observacoes: '',
};

// ----------------------------------------------------------------------

export function IndicacaoFormView({ codigoIndicacao }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingIndicador, setLoadingIndicador] = useState(true);
  const [success, setSuccess] = useState(false);
  const [indicador, setIndicador] = useState(null);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    const carregarIndicador = async () => {
      try {
        setLoadingIndicador(true);
        const data = await obterIndicadorPorCodigo(codigoIndicacao);
        if (data?.indicador) {
          setIndicador(data.indicador);
        }
      } catch (error) {
        console.warn('Não foi possível carregar dados do indicador:', error);
      } finally {
        setLoadingIndicador(false);
      }
    };

    if (codigoIndicacao) {
      carregarIndicador();
    }
  }, [codigoIndicacao]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      await criarIndicacao({
        codigoIndicacao,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ''), // Remove formatação
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined, // Remove formatação
        estado: data.estado || undefined,
        cidade: data.cidade || undefined,
        observacoes: data.observacoes || undefined,
      });

      setSuccess(true);
      toast.success('Indicação criada com sucesso!');
      methods.reset();
    } catch (error) {
      console.error('Erro ao criar indicação:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar indicação';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <Card
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
          bgcolor: alpha(theme.palette.success.main, 0.05),
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'success.main',
              color: 'success.contrastText',
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={48} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Indicação enviada com sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Nossa equipe entrará em contato em breve para apresentar nossos serviços.
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Preencha seus dados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete o formulário abaixo para que possamos entrar em contato
          </Typography>
        </Box>

        <Divider />

        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <Field.Text
                  name="nome"
                  label="Nome completo"
                  placeholder="Digite seu nome completo"
                  required
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputMask
                      mask="(99) 99999-9999"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          fullWidth
                          label="Telefone"
                          placeholder="(41) 99999-9999"
                          required
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    </InputMask>
                  )}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <InputMask
                      mask="999.999.999-99"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          fullWidth
                          label="CPF"
                          placeholder="000.000.000-00"
                          helperText={error?.message || 'Opcional'}
                          error={!!error}
                        />
                      )}
                    </InputMask>
                  )}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text
                  name="estado"
                  label="Estado"
                  placeholder="PR"
                  helperText="Opcional"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text
                  name="cidade"
                  label="Cidade"
                  placeholder="Curitiba"
                  helperText="Opcional"
                />
              </Grid>
            </Grid>

            <Field.Text
              name="observacoes"
              label="Observações"
              multiline
              rows={4}
              placeholder="Conte-nos mais sobre você ou sua empresa (opcional)"
              helperText="Opcional - Informações adicionais que possam nos ajudar"
            />

            <Box sx={{ pt: 2 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                loading={isSubmitting || loading}
                startIcon={<Iconify icon="solar:user-plus-bold" />}
                sx={{ py: 1.5 }}
              >
                Enviar Indicação
              </LoadingButton>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
              Ao enviar, você concorda em ser contatado pela nossa equipe
            </Typography>
          </Stack>
        </Form>
      </Stack>
    </Card>
  );
}
