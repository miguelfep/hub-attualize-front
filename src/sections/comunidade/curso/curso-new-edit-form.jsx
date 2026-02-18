'use client';

import { z as zod } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Card,
  Stack,
  Divider,
  MenuItem,
  TextField,
  CardHeader,
  Typography,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';
import {
  useCategorias,
  useTags,
  useMateriais,
  createCurso,
  updateCurso,
  uploadCursoThumbnail,
} from 'src/actions/comunidade';

// ----------------------------------------------------------------------

const CursoSchema = zod.object({
  titulo: zod.string().min(1, 'Título é obrigatório'),
  descricao: zod.string().optional(),
  preco: zod.number().min(0, 'Preço deve ser maior ou igual a 0'),
  tipoAcesso: zod.enum(['gratuito', 'exclusivo_cliente', 'pago'], {
    required_error: 'Tipo de acesso é obrigatório',
  }),
  materiais: zod.array(zod.string()).min(1, 'Selecione pelo menos um material'),
  categorias: zod.array(zod.string()).optional(),
  tags: zod.array(zod.string()).optional(),
  ordem: zod.number().optional(),
  status: zod.enum(['ativo', 'inativo', 'rascunho']).optional(),
});

// ----------------------------------------------------------------------

export function CursoNewEditForm({ currentCurso }) {
  const router = useRouter();

  const [thumbnail, setThumbnail] = useState(null);

  const { data: categorias } = useCategorias({ status: 'ativo' });
  const { data: tags } = useTags();
  const { data: materiais } = useMateriais({ status: 'ativo' });

  const defaultValues = useMemo(
    () => ({
      titulo: currentCurso?.titulo || '',
      descricao: currentCurso?.descricao || '',
      preco: currentCurso?.preco || 0,
      tipoAcesso: currentCurso?.tipoAcesso || 'gratuito',
      materiais:
        currentCurso?.materiais?.map((m) => (typeof m === 'string' ? m : m._id)) || [],
      categorias:
        currentCurso?.categorias?.map((c) => (typeof c === 'string' ? c : c._id)) || [],
      tags: currentCurso?.tags?.map((t) => (typeof t === 'string' ? t : t._id)) || [],
      ordem: currentCurso?.ordem || 0,
      status: currentCurso?.status || 'rascunho',
    }),
    [currentCurso]
  );

  const methods = useForm({
    resolver: zodResolver(CursoSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const tipoAcesso = watch('tipoAcesso');

  useEffect(() => {
    if (currentCurso) {
      reset(defaultValues);
    }
  }, [currentCurso, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let cursoId = currentCurso?._id;

      // Criar ou atualizar curso
      if (currentCurso) {
        const response = await updateCurso(currentCurso._id, data);
        cursoId = response.curso?._id || currentCurso._id;
        toast.success('Curso atualizado com sucesso');
      } else {
        const response = await createCurso(data);
        cursoId = response.curso?._id;
        toast.success('Curso criado com sucesso');
      }

      // Upload de thumbnail (se fornecido)
      if (thumbnail) {
        try {
          await uploadCursoThumbnail(cursoId, thumbnail);
          toast.success('Thumbnail enviada com sucesso');
        } catch (error) {
          console.error('Erro ao fazer upload da thumbnail:', error);
          toast.error('Erro ao fazer upload da thumbnail');
        }
      }

      router.push(paths.dashboard.comunidade.cursos.root);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao salvar curso');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <CardHeader title="Informações Básicas" sx={{ mb: 3 }} />

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Controller
            name="titulo"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Título"
                fullWidth
                required
                error={!!error}
                helperText={error?.message}
              />
            )}
          />

          <Controller
            name="descricao"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                error={!!error}
                helperText={error?.message}
              />
            )}
          />

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Controller
              name="tipoAcesso"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo de Acesso"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                >
                  <MenuItem value="gratuito">Gratuito</MenuItem>
                  <MenuItem value="exclusivo_cliente">Exclusivo Cliente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                </TextField>
              )}
            />

            {tipoAcesso === 'pago' && (
              <Controller
                name="preco"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Preço"
                    type="number"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            )}

            <Controller
              name="ordem"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Ordem de Exibição"
                  type="number"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                >
                  <MenuItem value="rascunho">Rascunho</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </TextField>
              )}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Thumbnail (Imagem)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
          </Box>

          <Controller
            name="materiais"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                {...field}
                multiple
                options={materiais || []}
                getOptionLabel={(option) =>
                  typeof option === 'string'
                    ? materiais.find((m) => m._id === option)?.titulo || option
                    : option.titulo
                }
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => {
                  const ids = newValue.map((v) => (typeof v === 'string' ? v : v._id));
                  setValue('materiais', ids, { shouldValidate: true });
                }}
                value={
                  field.value?.map((id) =>
                    materiais?.find((m) => m._id === id) || id
                  ) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Materiais"
                    required
                    error={!!error}
                    helperText={error?.message || 'Selecione os materiais que farão parte deste curso'}
                  />
                )}
              />
            )}
          />

          <Controller
            name="categorias"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                {...field}
                multiple
                options={categorias || []}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option.nome
                }
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => {
                  const ids = newValue.map((v) => (typeof v === 'string' ? v : v._id));
                  setValue('categorias', ids, { shouldValidate: true });
                }}
                value={
                  field.value?.map((id) =>
                    categorias?.find((c) => c._id === id) || id
                  ) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categorias"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                {...field}
                multiple
                options={tags || []}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option.nome
                }
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => {
                  const ids = newValue.map((v) => (typeof v === 'string' ? v : v._id));
                  setValue('tags', ids, { shouldValidate: true });
                }}
                value={
                  field.value?.map((id) => tags?.find((t) => t._id === id) || id) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />
        </Stack>
      </Card>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ minWidth: 120 }}
        >
          {currentCurso ? 'Atualizar' : 'Criar'}
        </LoadingButton>

        <LoadingButton
          variant="outlined"
          onClick={() => router.push(paths.dashboard.comunidade.cursos.root)}
        >
          Cancelar
        </LoadingButton>
      </Stack>
    </Form>
  );
}
