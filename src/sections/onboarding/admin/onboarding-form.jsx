'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import {
  Card,
  Stack,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Divider,
} from '@mui/material';

import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';

import { criarOnboarding, atualizarOnboarding } from 'src/actions/onboarding';

import { AulasSelector } from './components/aulas-selector';

// ----------------------------------------------------------------------

const aulaItemSchema = zod.object({
  aulaId: zod.string().min(1, 'ID da aula é obrigatório'),
  ordem: zod.number().min(1, 'Ordem deve ser maior que 0'),
  obrigatoria: zod.boolean().optional(),
});

const onboardingSchema = zod.object({
  nome: zod.string().min(1, 'Nome é obrigatório'),
  descricao: zod.string().optional(),
  tipoEmpresa: zod.array(zod.string()).min(1, 'Selecione pelo menos um tipo de empresa'),
  ativo: zod.boolean().default(true),
  ordem: zod.number().default(0),
  aulas: zod.array(aulaItemSchema).default([]),
});

// ----------------------------------------------------------------------

export function OnboardingForm({ onboarding, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Normaliza as aulas para o formato esperado (apenas aulaId, ordem, obrigatoria)
  const normalizeAulas = (aulas) => {
    if (!aulas || !Array.isArray(aulas)) return [];
    
    return aulas.map((aula, index) => {
      // Se a aula veio populada da API (com objeto aulaId completo)
      if (aula.aulaId && typeof aula.aulaId === 'object') {
        return {
          aulaId: aula.aulaId._id || aula.aulaId.id || aula.aulaId,
          ordem: aula.ordem || index + 1,
          obrigatoria: aula.obrigatoria !== undefined ? aula.obrigatoria : undefined,
        };
      }
      
      // Se já está no formato correto
      return {
        aulaId: aula.aulaId || aula._id,
        ordem: aula.ordem || index + 1,
        obrigatoria: aula.obrigatoria !== undefined ? aula.obrigatoria : undefined,
      };
    });
  };

  const methods = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboarding
      ? {
          ...onboarding,
          aulas: normalizeAulas(onboarding.aulas),
        }
      : {
          nome: '',
          descricao: '',
          tipoEmpresa: [],
          ativo: true,
          ordem: 0,
          aulas: [],
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = methods;

  const ativo = watch('ativo');
  const tipoEmpresa = watch('tipoEmpresa') || [];

  const TIPOS_EMPRESA = ['mei', 'saude', 'psicologia', 'geral'];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Garantir que as aulas tenham ordem correta e formato correto
      const aulasComOrdem = (data.aulas || []).map((aula, index) => ({
        aulaId: aula.aulaId, // ID da aula referenciada
        ordem: aula.ordem || index + 1,
        obrigatoria: aula.obrigatoria !== undefined ? aula.obrigatoria : undefined, // Opcional
      }));

      const dadosParaEnviar = {
        ...data,
        aulas: aulasComOrdem,
      };

      if (onboarding?._id) {
        await atualizarOnboarding(onboarding._id, dadosParaEnviar);
        toast.success('Onboarding atualizado com sucesso!');
      } else {
        await criarOnboarding(dadosParaEnviar);
        toast.success('Onboarding criado com sucesso!');
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      toast.error('Erro ao salvar onboarding. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Typography variant="h6">Informações Básicas</Typography>

          <TextField
            label="Nome"
            {...register('nome')}
            error={!!errors.nome}
            helperText={errors.nome?.message}
            fullWidth
          />

          <TextField
            label="Descrição"
            {...register('descricao')}
            error={!!errors.descricao}
            helperText={errors.descricao?.message}
            fullWidth
            multiline
            rows={3}
          />

          <FormControl fullWidth>
            <InputLabel id="tipo-empresa-label">Tipo de Empresa</InputLabel>
            <Select
              labelId="tipo-empresa-label"
              id="tipo-empresa"
              multiple
              value={tipoEmpresa}
              onChange={(e) => setValue('tipoEmpresa', e.target.value)}
              input={<OutlinedInput label="Tipo de Empresa" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              error={!!errors.tipoEmpresa}
            >
              {TIPOS_EMPRESA.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {errors.tipoEmpresa && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.tipoEmpresa.message}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Ordem"
            type="number"
            {...register('ordem', { valueAsNumber: true })}
            error={!!errors.ordem}
            helperText={errors.ordem?.message}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={ativo}
                onChange={(e) => setValue('ativo', e.target.checked)}
              />
            }
            label="Ativo"
          />

          <Divider />

          <AulasSelector />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="eva:save-fill" />}
            >
              {onboarding ? 'Atualizar' : 'Criar'}
            </Button>
          </Stack>
          </Stack>
        </form>
      </Card>
    </FormProvider>
  );
}

