'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  Divider,
  Box,
  IconButton,
  Alert,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { AulaVideoFields } from './aula-video-fields';
import { AulaQuizFields } from './aula-quiz-fields';
import { AulaTextoFields } from './aula-texto-fields';
import { AulaArquivoFields } from './aula-arquivo-fields';

// ----------------------------------------------------------------------

const aulaSchema = zod.object({
  titulo: zod.string().min(1, 'Título é obrigatório'),
  descricao: zod.string().optional(),
  tipo: zod.enum(['video', 'quiz', 'texto', 'arquivo']),
  ordem: zod.number().optional(),
  duracaoEstimada: zod.number().optional(),
  obrigatoria: zod.boolean().default(true),
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

export function AulaFormDialog({ open, onClose, onSave, aula }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(aulaSchema),
    defaultValues: aula || {
      titulo: '',
      descricao: '',
      tipo: 'video',
      ordem: 0,
      duracaoEstimada: undefined,
      obrigatoria: true,
      conteudo: {},
    },
  });

  const tipo = watch('tipo');
  const obrigatoria = watch('obrigatoria');

  useEffect(() => {
    if (aula) {
      reset(aula);
    } else {
      reset({
        titulo: '',
        descricao: '',
        tipo: 'video',
        ordem: 0,
        duracaoEstimada: undefined,
        obrigatoria: true,
        conteudo: {},
      });
    }
  }, [aula, reset, open]);

  const onSubmit = (data) => {
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

    onSave({
      ...data,
      conteudo,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {aula ? 'Editar Aula' : 'Nova Aula'}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
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
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel id="tipo-aula-label">Tipo de Aula</InputLabel>
              <Select
                labelId="tipo-aula-label"
                id="tipo-aula"
                label="Tipo de Aula"
                {...register('tipo')}
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

            <FormControlLabel
              control={
                <Switch
                  checked={obrigatoria}
                  onChange={(e) => setValue('obrigatoria', e.target.checked)}
                />
              }
              label="Aula Obrigatória"
            />

            <Divider />

            <Typography variant="subtitle2">Conteúdo da Aula</Typography>

            {tipo === 'video' && (
              <AulaVideoFields
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}

            {tipo === 'quiz' && (
              <AulaQuizFields
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}

            {tipo === 'texto' && (
              <AulaTextoFields
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}

            {tipo === 'arquivo' && (
              <AulaArquivoFields
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {aula ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

