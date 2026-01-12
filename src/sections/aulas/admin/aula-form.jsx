'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import {
  Card,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material';

import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';

import { criarAula, atualizarAula } from 'src/actions/onboarding';

import { AulaVideoFields } from 'src/sections/onboarding/admin/components/aula-video-fields';
import { AulaQuizFields } from 'src/sections/onboarding/admin/components/aula-quiz-fields';
import { AulaTextoFields } from 'src/sections/onboarding/admin/components/aula-texto-fields';
import { AulaArquivoFields } from 'src/sections/onboarding/admin/components/aula-arquivo-fields';

// ----------------------------------------------------------------------

const aulaSchema = zod.object({
  titulo: zod.string().min(1, 'Título é obrigatório'),
  descricao: zod.string().optional(),
  tipo: zod.enum(['video', 'quiz', 'texto', 'arquivo']),
  duracaoEstimada: zod.number().optional(),
  obrigatoria: zod.boolean().default(true),
  ativo: zod.boolean().default(true),
  tags: zod.array(zod.string()).optional(),
  conteudo: zod.any().optional(),
});

// ----------------------------------------------------------------------

const TIPOS_AULA = [
  { value: 'video', label: 'Vídeo' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'texto', label: 'Texto' },
  { value: 'arquivo', label: 'Arquivo' },
];

// ----------------------------------------------------------------------

export function AulaForm({ aula, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(aulaSchema),
    defaultValues: aula || {
      titulo: '',
      descricao: '',
      tipo: 'video',
      duracaoEstimada: undefined,
      obrigatoria: true,
      ativo: true,
      tags: [],
      conteudo: {},
    },
  });

  const tipo = watch('tipo');
  const obrigatoria = watch('obrigatoria');
  const ativo = watch('ativo');
  const tags = watch('tags') || [];

  useEffect(() => {
    if (aula) {
      // Resetar formulário com dados da aula
      Object.keys(aulaSchema.shape).forEach((key) => {
        if (aula[key] !== undefined) {
          setValue(key, aula[key]);
        }
      });
    }
  }, [aula, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Garantir que o conteúdo está no formato correto
      const conteudo = data.conteudo || {};

      // Limpar campos que não pertencem ao tipo selecionado
      if (data.tipo === 'video') {
        conteudo.urlVideo = conteudo.urlVideo || '';
        delete conteudo.texto;
        delete conteudo.urlArquivo;
        delete conteudo.perguntas;
      } else if (data.tipo === 'texto') {
        conteudo.texto = conteudo.texto || '';
        delete conteudo.urlVideo;
        delete conteudo.urlArquivo;
        delete conteudo.perguntas;
      } else if (data.tipo === 'arquivo') {
        conteudo.urlArquivo = conteudo.urlArquivo || '';
        delete conteudo.urlVideo;
        delete conteudo.texto;
        delete conteudo.perguntas;
      } else if (data.tipo === 'quiz') {
        conteudo.perguntas = conteudo.perguntas || [];
        delete conteudo.urlVideo;
        delete conteudo.texto;
        delete conteudo.urlArquivo;
      }

      const dadosParaEnviar = {
        ...data,
        conteudo,
      };

      if (aula?._id) {
        await atualizarAula(aula._id, dadosParaEnviar);
        toast.success('Aula atualizada com sucesso!');
      } else {
        await criarAula(dadosParaEnviar);
        toast.success('Aula criada com sucesso!');
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      toast.error('Erro ao salvar aula. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Typography variant="h6">Informações Básicas</Typography>

          <TextField
            label="Título"
            {...register('titulo')}
            error={!!errors.titulo}
            helperText={errors.titulo?.message}
            fullWidth
            required
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
            <InputLabel id="tipo-aula-label">Tipo de Aula</InputLabel>
            <Select
              labelId="tipo-aula-label"
              id="tipo-aula"
              label="Tipo de Aula"
              value={tipo}
              onChange={(e) => {
                setValue('tipo', e.target.value);
                // Resetar conteúdo ao mudar tipo
                setValue('conteudo', {});
              }}
            >
              {TIPOS_AULA.map((tipoOption) => (
                <MenuItem key={tipoOption.value} value={tipoOption.value}>
                  {tipoOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Duração Estimada (minutos)"
            type="number"
            {...register('duracaoEstimada', { valueAsNumber: true })}
            error={!!errors.duracaoEstimada}
            helperText={errors.duracaoEstimada?.message}
            fullWidth
          />

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={tags}
            onChange={(event, newValue) => {
              setValue('tags', newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Digite e pressione Enter para adicionar uma tag"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
              ))
            }
          />

          <FormControlLabel
            control={
              <Switch checked={obrigatoria} onChange={(e) => setValue('obrigatoria', e.target.checked)} />
            }
            label="Aula Obrigatória"
          />

          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setValue('ativo', e.target.checked)} />}
            label="Ativo"
          />

          <Divider />

          <Typography variant="h6">Conteúdo da Aula</Typography>

          {tipo === 'video' && (
            <AulaVideoFields register={register} watch={watch} setValue={setValue} errors={errors} />
          )}

          {tipo === 'quiz' && (
            <AulaQuizFields register={register} watch={watch} setValue={setValue} errors={errors} />
          )}

          {tipo === 'texto' && (
            <AulaTextoFields register={register} watch={watch} setValue={setValue} errors={errors} />
          )}

          {tipo === 'arquivo' && (
            <AulaArquivoFields register={register} watch={watch} setValue={setValue} errors={errors} />
          )}

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
              {aula ? 'Atualizar' : 'Criar'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}

