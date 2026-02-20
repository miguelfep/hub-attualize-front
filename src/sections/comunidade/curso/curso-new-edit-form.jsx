'use client';

import { z as zod } from 'zod';
import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Card,
  List,
  Stack,
  Button,
  Dialog,
  Divider,
  MenuItem,
  ListItem,
  TextField,
  CardHeader,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  Autocomplete,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useGetAllClientes } from 'src/actions/clientes';
import {
  useTags,
  createTag,
  createCurso,
  updateCurso,
  useMateriais,
  useCategorias,
  createCategoria,
  useVinculosCurso,
  addVinculosCurso,
  removeVinculosCurso,
  uploadCursoThumbnail,
  deleteCursoThumbnail,
  reordenarMateriaisCurso,
} from 'src/actions/comunidade';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

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
  clientesComAcesso: zod.array(zod.string()).optional(),
});

// ----------------------------------------------------------------------

export function CursoNewEditForm({ currentCurso }) {
  const router = useRouter();

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [thumbnailPreviewError, setThumbnailPreviewError] = useState(false);

  // Preview da imagem selecionada (novo arquivo) – criar e revogar blob URL
  useEffect(() => {
    if (!thumbnail) {
      setThumbnailPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(thumbnail);
    setThumbnailPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  // Ao abrir/alterar curso (edição), resetar estado da thumbnail para exibir a imagem atual
  useEffect(() => {
    setThumbnailPreviewError(false);
    setThumbnailRemoved(false);
  }, [currentCurso?._id]);

  const { data: categorias, mutate: mutateCategorias } = useCategorias({ status: 'ativo' });
  const { data: tags, mutate: mutateTags } = useTags();
  const { data: materiais } = useMateriais({ status: 'ativo' });
  const { data: clientesRaw } = useGetAllClientes();
  const clientes = Array.isArray(clientesRaw) ? clientesRaw : (clientesRaw?.data ?? clientesRaw?.clientes ?? []);
  const { clientes: clientesVinculados, isLoading: loadingVinculos, mutate: mutateVinculos } = useVinculosCurso(currentCurso?._id);
  const [openVinculosDialog, setOpenVinculosDialog] = useState(false);
  const [vinculosToAdd, setVinculosToAdd] = useState([]);
  const [savingVinculos, setSavingVinculos] = useState(false);
  const [openNovaCategoria, setOpenNovaCategoria] = useState(false);
  const [openNovaTag, setOpenNovaTag] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [novaTagNome, setNovaTagNome] = useState('');
  const [savingCategoria, setSavingCategoria] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

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
      clientesComAcesso: currentCurso?.clientesComAcesso?.map((c) => (typeof c === 'string' ? c : c._id)) || [],
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

      // Remover thumbnail no backend se o usuário clicou em "Remover" e não enviou nova
      if (currentCurso?._id && thumbnailRemoved && !thumbnail) {
        try {
          await deleteCursoThumbnail(cursoId);
          toast.success('Thumbnail removida');
        } catch (error) {
          console.error('Erro ao remover thumbnail:', error);
          toast.error('Erro ao remover thumbnail');
        }
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

      // Definir ordem dos materiais (PATCH ordem)
      if (data.materiais?.length > 0) {
        try {
          await reordenarMateriaisCurso(cursoId, data.materiais);
        } catch (err) {
          console.error('Erro ao definir ordem dos materiais:', err);
          toast.error('Ordem dos materiais pode não ter sido aplicada');
        }
      }

      router.push(paths.dashboard.comunidade.cursos.root);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Erro ao salvar curso');
    }
  });

  const handleCreateCategoria = async () => {
    const nome = novaCategoriaNome?.trim();
    if (!nome) {
      toast.error('Informe o nome da categoria');
      return;
    }
    setSavingCategoria(true);
    try {
      const res = await createCategoria({ nome });
      const newId = res?.categoria?._id || res?._id;
      await mutateCategorias();
      if (newId) {
        const current = watch('categorias') || [];
        setValue('categorias', [...current, newId], { shouldValidate: true });
      }
      setNovaCategoriaNome('');
      setOpenNovaCategoria(false);
      toast.success('Categoria criada');
    } catch (err) {
      toast.error(err?.message || 'Erro ao criar categoria');
    } finally {
      setSavingCategoria(false);
    }
  };

  const handleCreateTag = async () => {
    const nome = novaTagNome?.trim();
    if (!nome) {
      toast.error('Informe o nome da tag');
      return;
    }
    setSavingTag(true);
    try {
      const res = await createTag({ nome });
      const newId = res?.tag?._id || res?._id;
      await mutateTags();
      if (newId) {
        const current = watch('tags') || [];
        setValue('tags', [...current, newId], { shouldValidate: true });
      }
      setNovaTagNome('');
      setOpenNovaTag(false);
      toast.success('Tag criada');
    } catch (err) {
      toast.error(err?.message || 'Erro ao criar tag');
    } finally {
      setSavingTag(false);
    }
  };

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

            <Controller
              name="clientesComAcesso"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={clientes}
                  getOptionLabel={(opt) => opt.razaoSocial || opt.nome || opt._id || ''}
                  isOptionEqualToValue={(a, b) => a._id === b._id}
                  value={(field.value || []).map((id) => clientes.find((c) => c._id === id)).filter(Boolean)}
                  onChange={(_, newValue) => field.onChange(newValue.map((c) => c._id))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Clientes com acesso (opcional)"
                      placeholder="Restringir a clientes específicos"
                      helperText="Deixe vazio para não restringir. Se preenchido, apenas estes clientes terão acesso."
                    />
                  )}
                />
              )}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Thumbnail (Imagem de capa)
            </Typography>
            <Stack spacing={2}>
              {/* Thumbnail atual (ao editar) */}
              {currentCurso?._id && !thumbnailRemoved && !thumbnail && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  {!thumbnailPreviewError ? (
                    <>
                      <Box
                        component="img"
                        src={endpoints.comunidade.cursos.thumbnail(currentCurso._id)}
                        alt="Thumbnail atual"
                        onError={() => setThumbnailPreviewError(true)}
                        sx={{
                          width: 200,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Iconify icon="eva:trash-2-outline" />}
                        onClick={() => setThumbnailRemoved(true)}
                      >
                        Remover e enviar nova
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma thumbnail no servidor. Envie uma imagem abaixo.
                    </Typography>
                  )}
                </Stack>
              )}
              {/* Preview do novo arquivo selecionado (o que será enviado) */}
              {thumbnail && thumbnailPreviewUrl && (
                <Stack spacing={1}>
                  <Typography variant="caption" color="primary.main" fontWeight="medium">
                    Nova imagem (será enviada ao salvar)
                  </Typography>
                  <Box
                    component="img"
                    src={thumbnailPreviewUrl}
                    alt="Preview da nova thumbnail"
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {thumbnail.name}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="eva:close-outline" />}
                    onClick={() => setThumbnail(null)}
                  >
                    Remover seleção
                  </Button>
                </Stack>
              )}
              {/* Input para escolher arquivo */}
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  id="curso-thumbnail-input"
                  onChange={(e) => {
                    setThumbnail(e.target.files[0] || null);
                    if (e.target.files[0]) setThumbnailRemoved(false);
                  }}
                />
                {!thumbnail && !(currentCurso?._id && !thumbnailRemoved) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selecione uma imagem (JPG, PNG, GIF, WebP) para capa do curso.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>

          <Controller
            name="materiais"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Box>
                <Autocomplete
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
                      helperText={error?.message || 'Selecione os materiais que farão parte deste curso. Use as setas abaixo para definir a ordem das aulas.'}
                    />
                  )}
                />
                {field.value?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ordem das aulas (reordenar)
                    </Typography>
                    <List dense sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      {field.value.map((id, index) => {
                        const mat = materiais?.find((m) => m._id === id);
                        const titulo = mat?.titulo || id;
                        return (
                          <ListItem
                            key={id}
                            secondaryAction={
                              <Stack direction="row" spacing={0}>
                                <IconButton
                                  size="small"
                                  disabled={index === 0}
                                  onClick={() => {
                                    const next = [...field.value];
                                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                    setValue('materiais', next, { shouldValidate: true });
                                  }}
                                >
                                  <Iconify icon="eva:arrow-up-fill" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  disabled={index === field.value.length - 1}
                                  onClick={() => {
                                    const next = [...field.value];
                                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                    setValue('materiais', next, { shouldValidate: true });
                                  }}
                                >
                                  <Iconify icon="eva:arrow-down-fill" />
                                </IconButton>
                              </Stack>
                            }
                          >
                            <ListItemText primary={`${index + 1}. ${titulo}`} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}
              </Box>
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
                    helperText={error?.message || 'Não encontra? Adicione uma nova categoria.'}
                  />
                )}
              />
            )}
          />
          <Box sx={{ mt: -1, mb: 1 }}>
            <Button
              size="small"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenNovaCategoria(true)}
            >
              Adicionar nova categoria
            </Button>
          </Box>

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
                    helperText={error?.message || 'Não encontra? Adicione uma nova tag.'}
                  />
                )}
              />
            )}
          />
          <Box sx={{ mt: -1, mb: 1 }}>
            <Button
              size="small"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenNovaTag(true)}
            >
              Adicionar nova tag
            </Button>
          </Box>
        </Stack>
      </Card>

      {currentCurso?._id && (
        <Card sx={{ p: 3, mt: 3 }}>
          <CardHeader
            title="Clientes vinculados (vínculos)"
            subheader="Acesso restrito a estes clientes. Gerencie pela API de vínculos."
            action={
              <Button
                size="small"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => setOpenVinculosDialog(true)}
              >
                Adicionar
              </Button>
            }
          />
          {loadingVinculos ? (
            <Typography variant="body2" color="text.secondary">Carregando...</Typography>
          ) : (clientesVinculados?.length ?? 0) === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum cliente vinculado.</Typography>
          ) : (
            <List dense>
              {clientesVinculados.map((c) => (
                <ListItem
                  key={c._id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={async () => {
                        try {
                          await removeVinculosCurso(currentCurso._id, [c._id]);
                          toast.success('Cliente desvinculado');
                          mutateVinculos();
                        } catch (err) {
                          toast.error(err?.message || 'Erro ao desvincular');
                        }
                      }}
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  }
                >
                  <ListItemText primary={c.razaoSocial || c.nome || c._id} />
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      )}

      <Dialog open={openVinculosDialog} onClose={() => setOpenVinculosDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Vincular clientes</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={clientes.filter((c) => !clientesVinculados?.some((v) => v._id === c._id))}
            getOptionLabel={(opt) => opt.razaoSocial || opt.nome || opt._id || ''}
            isOptionEqualToValue={(a, b) => a._id === b._id}
            value={vinculosToAdd}
            onChange={(_, v) => setVinculosToAdd(v)}
            renderInput={(params) => <TextField {...params} label="Clientes" placeholder="Selecione" />}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVinculosDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={vinculosToAdd.length === 0 || savingVinculos}
            onClick={async () => {
              if (!currentCurso?._id || vinculosToAdd.length === 0) return;
              setSavingVinculos(true);
              try {
                await addVinculosCurso(currentCurso._id, vinculosToAdd.map((c) => c._id));
                toast.success('Clientes vinculados');
                setVinculosToAdd([]);
                setOpenVinculosDialog(false);
                mutateVinculos();
              } catch (err) {
                toast.error(err?.message || 'Erro ao vincular');
              } finally {
                setSavingVinculos(false);
              }
            }}
          >
            Vincular
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNovaCategoria} onClose={() => !savingCategoria && setOpenNovaCategoria(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nova categoria</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome"
            value={novaCategoriaNome}
            onChange={(e) => setNovaCategoriaNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategoria()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNovaCategoria(false)} disabled={savingCategoria}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            loading={savingCategoria}
            onClick={handleCreateCategoria}
          >
            Criar
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openNovaTag} onClose={() => !savingTag && setOpenNovaTag(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nova tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome"
            value={novaTagNome}
            onChange={(e) => setNovaTagNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNovaTag(false)} disabled={savingTag}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            loading={savingTag}
            onClick={handleCreateTag}
          >
            Criar
          </LoadingButton>
        </DialogActions>
      </Dialog>

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
