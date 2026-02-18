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
import { useCategorias, useTags, createMaterial, updateMaterial, uploadMaterialArquivo, uploadMaterialThumbnail } from 'src/actions/comunidade';

// ----------------------------------------------------------------------

const MaterialSchema = zod.object({
  titulo: zod.string().min(1, 'Título é obrigatório'),
  descricao: zod.string().optional(),
  tipo: zod.enum(['ebook', 'videoaula', 'documento', 'link', 'outro'], {
    required_error: 'Tipo é obrigatório',
  }),
  preco: zod.number().min(0, 'Preço deve ser maior ou igual a 0'),
  tipoAcesso: zod.enum(['gratuito', 'exclusivo_cliente', 'pago'], {
    required_error: 'Tipo de acesso é obrigatório',
  }),
  linkExterno: zod.string().optional(),
  categorias: zod.array(zod.string()).optional(),
  tags: zod.array(zod.string()).optional(),
  duracao: zod.number().optional(),
  ordem: zod.number().optional(),
  status: zod.enum(['ativo', 'inativo', 'rascunho']).optional(),
});

// ----------------------------------------------------------------------

export function MaterialNewEditForm({ currentMaterial }) {
  const router = useRouter();

  const [arquivo, setArquivo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: categorias } = useCategorias({ status: 'ativo' });
  const { data: tags } = useTags();

  const defaultValues = useMemo(
    () => ({
      titulo: currentMaterial?.titulo || '',
      descricao: currentMaterial?.descricao || '',
      tipo: currentMaterial?.tipo || 'ebook',
      preco: currentMaterial?.preco || 0,
      tipoAcesso: currentMaterial?.tipoAcesso || 'gratuito',
      linkExterno: currentMaterial?.linkExterno || '',
      categorias: currentMaterial?.categorias?.map((c) => (typeof c === 'string' ? c : c._id)) || [],
      tags: currentMaterial?.tags?.map((t) => (typeof t === 'string' ? t : t._id)) || [],
      duracao: currentMaterial?.duracao || undefined,
      ordem: currentMaterial?.ordem || 0,
      status: currentMaterial?.status || 'rascunho',
    }),
    [currentMaterial]
  );

  const methods = useForm({
    resolver: zodResolver(MaterialSchema),
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

  const tipo = watch('tipo');
  const tipoAcesso = watch('tipoAcesso');

  useEffect(() => {
    if (currentMaterial) {
      reset(defaultValues);
    }
  }, [currentMaterial, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let materialId = currentMaterial?._id;

      // Criar ou atualizar material
      if (currentMaterial) {
        const response = await updateMaterial(currentMaterial._id, data);
        materialId = response.material?._id || currentMaterial._id;
        toast.success('Material atualizado com sucesso');
      } else {
        const response = await createMaterial(data);
        materialId = response.material?._id;
        toast.success('Material criado com sucesso');
      }

      // Upload de arquivo (se fornecido e não for link)
      // Para videoaulas: só faz upload se não tiver linkExterno (YouTube)
      const temLinkExterno = tipo === 'videoaula' && data.linkExterno;
      if (arquivo && tipo !== 'link' && !temLinkExterno) {
        try {
          await uploadMaterialArquivo(materialId, arquivo, (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          });
          toast.success('Arquivo enviado com sucesso');
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          toast.error('Erro ao fazer upload do arquivo');
        }
      }

      // Upload de thumbnail (se fornecido)
      if (thumbnail) {
        try {
          await uploadMaterialThumbnail(materialId, thumbnail);
          toast.success('Thumbnail enviada com sucesso');
        } catch (error) {
          console.error('Erro ao fazer upload da thumbnail:', error);
          toast.error('Erro ao fazer upload da thumbnail');
        }
      }

      router.push(paths.dashboard.comunidade.materiais.root);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao salvar material');
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
              name="tipo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Tipo"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                >
                  <MenuItem value="ebook">E-book</MenuItem>
                  <MenuItem value="videoaula">Videoaula</MenuItem>
                  <MenuItem value="documento">Documento</MenuItem>
                  <MenuItem value="link">Link</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                </TextField>
              )}
            />

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

            {tipo === 'link' && (
              <Controller
                name="linkExterno"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Link Externo"
                    fullWidth
                    required
                    error={!!error}
                    helperText={error?.message || 'URL do link externo'}
                  />
                )}
              />
            )}

            {tipo === 'videoaula' && (
              <>
                <Controller
                  name="linkExterno"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Link do YouTube (opcional)"
                      fullWidth
                      error={!!error}
                      helperText={error?.message || 'URL do YouTube (ex: https://www.youtube.com/watch?v=VIDEO_ID). Deixe vazio se for fazer upload de arquivo.'}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  )}
                />
                <Controller
                  name="duracao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Duração (minutos)"
                      type="number"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </>
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

          {(tipo !== 'link' && !(tipo === 'videoaula' && watch('linkExterno'))) && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Arquivo {tipo === 'videoaula' && '(opcional se tiver link do YouTube)'}
              </Typography>
              <input
                type="file"
                accept={tipo === 'videoaula' ? '.mp4,.avi,.mov' : '.pdf,.doc,.docx,.mp4,.avi,.mov'}
                onChange={(e) => setArquivo(e.target.files[0])}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Enviando: {uploadProgress}%
                </Typography>
              )}
              {tipo === 'videoaula' && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Para videoaulas, você pode usar link do YouTube (acima) OU fazer upload de arquivo de vídeo
                </Typography>
              )}
            </Box>
          )}

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
            name="categorias"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                {...field}
                multiple
                options={categorias || []}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome)}
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => setValue('categorias', newValue, { shouldValidate: true })}
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
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome)}
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => setValue('tags', newValue, { shouldValidate: true })}
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

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <LoadingButton
          variant="outlined"
          onClick={() => router.push(paths.dashboard.comunidade.materiais.root)}
        >
          Cancelar
        </LoadingButton>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {currentMaterial ? 'Atualizar' : 'Criar'}
        </LoadingButton>
      </Stack>
    </Form>
  );
}
