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
  Chip,
  Stack,
  Dialog,
  Button,
  Switch,
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
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints } from 'src/utils/axios';

import { useGetAllClientes } from 'src/actions/clientes';
import {
  useTags,
  createTag,
  useCategorias,
  createMaterial,
  updateMaterial,
  createCategoria,
  useVinculosMaterial,
  addVinculosMaterial,
  uploadMaterialArquivo,
  removeVinculosMaterial,
  uploadMaterialThumbnail,
  deleteMaterialThumbnail,
} from 'src/actions/comunidade';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

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
  clientesComAcesso: zod.array(zod.string()).optional(),
  visivelSomenteNoCurso: zod.boolean().optional(),
});

// ----------------------------------------------------------------------

export function MaterialNewEditForm({ currentMaterial }) {
  const router = useRouter();

  const [arquivo, setArquivo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null); // preview do arquivo selecionado (blob URL)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [thumbnailPreviewError, setThumbnailPreviewError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Ao abrir/alterar material (edição), resetar estado da thumbnail para exibir a imagem atual
  useEffect(() => {
    setThumbnailPreviewError(false);
    setThumbnailRemoved(false);
  }, [currentMaterial?._id]);

  const [tagsInputValue, setTagsInputValue] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const { data: categorias, mutate: mutateCategorias } = useCategorias({ status: 'ativo' });
  const { data: tags, mutate: mutateTags } = useTags();
  const { data: clientesRaw } = useGetAllClientes();
  const clientes = Array.isArray(clientesRaw) ? clientesRaw : (clientesRaw?.data ?? clientesRaw?.clientes ?? []);
  const { clientes: clientesVinculados, isLoading: loadingVinculos, mutate: mutateVinculos } = useVinculosMaterial(currentMaterial?._id);
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
      clientesComAcesso: currentMaterial?.clientesComAcesso?.map((c) => (typeof c === 'string' ? c : c._id)) || [],
      visivelSomenteNoCurso: currentMaterial?.visivelSomenteNoCurso ?? false,
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

      // Remover thumbnail no backend se o usuário clicou em "Remover" e não enviou nova
      if (currentMaterial?._id && thumbnailRemoved && !thumbnail) {
        try {
          await deleteMaterialThumbnail(materialId);
          toast.success('Thumbnail removida');
        } catch (error) {
          console.error('Erro ao remover thumbnail:', error);
          toast.error('Erro ao remover thumbnail');
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

            <Controller
              name="visivelSomenteNoCurso"
              control={control}
              render={({ field }) => (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Visível somente no curso"
                  />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Se marcado, o material não aparece na listagem da biblioteca no portal; só dentro do curso (como aula).
                  </Typography>
                </Box>
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
            <Stack spacing={2}>
              {/* Thumbnail atual (ao editar) */}
              {currentMaterial?._id && !thumbnailRemoved && !thumbnail && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  {!thumbnailPreviewError ? (
                    <>
                      <Box
                        component="img"
                        src={endpoints.comunidade.materiais.thumbnail(currentMaterial._id)}
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
                  id="material-thumbnail-input"
                  onChange={(e) => {
                    setThumbnail(e.target.files[0] || null);
                    if (e.target.files[0]) setThumbnailRemoved(false);
                  }}
                />
                {!thumbnail && !(currentMaterial?._id && !thumbnailRemoved) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selecione uma imagem (JPG, PNG, GIF, WebP) para capa do material.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>

          <Controller
            name="categorias"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                multiple
                options={categorias || []}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome)}
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                onChange={(event, newValue) => {
                  const ids = newValue.map((v) => (typeof v === 'string' ? v : v._id));
                  setValue('categorias', ids, { shouldValidate: true });
                }}
                value={
                  field.value?.map((id) => categorias?.find((c) => c._id === id) || id) || []
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
                multiple
                freeSolo
                options={tags || []}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.nome || '')}
                isOptionEqualToValue={(option, value) =>
                  (typeof option === 'string' ? option : option._id) ===
                  (typeof value === 'string' ? value : value._id)
                }
                filterSelectedOptions
                inputValue={tagsInputValue}
                onInputChange={(_, value) => setTagsInputValue(value)}
                onChange={async (event, newValue) => {
                  const toCreateNames = newValue
                    .filter((v) => typeof v === 'string')
                    .map((v) => (v || '').trim())
                    .filter(Boolean);

                  if (toCreateNames.length > 0) {
                    setAddingTag(true);
                    try {
                      const createdResults = await Promise.all(
                        toCreateNames.map((nome) => createTag({ nome }))
                      );
                      const createdIds = createdResults.map((r) => r?.tag?._id || r?._id);
                      await mutateTags();
                      let createIndex = 0;
                      const ids = newValue
                        .map((v) => {
                          if (typeof v === 'string') {
                            const nome = (v || '').trim();
                            if (nome) {
                              const id = createdIds[createIndex];
                              createIndex += 1;
                              return id;
                            }
                            return null;
                          }
                          return v?._id || null;
                        })
                        .filter(Boolean);
                      setValue('tags', ids, { shouldValidate: true });
                    } catch (err) {
                      toast.error(err?.message || 'Erro ao criar tag');
                    } finally {
                      setAddingTag(false);
                    }
                  } else {
                    const ids = newValue.filter((v) => v?._id).map((v) => v._id);
                    setValue('tags', ids, { shouldValidate: true });
                  }
                  setTagsInputValue('');
                }}
                value={
                  field.value?.map((id) => tags?.find((t) => t._id === id) || { _id: id, nome: id }) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Digite e pressione Enter para adicionar"
                    error={!!error}
                    helperText={error?.message || 'Digite o nome da tag e pressione Enter. Pode criar novas tags.'}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={typeof option === 'string' ? option : option._id}
                      label={typeof option === 'string' ? option : option.nome}
                      size="small"
                    />
                  ))
                }
              />
            )}
          />
          <Box sx={{ mt: -1, mb: 1 }}>
            <Button
              size="small"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setOpenNovaTag(true)}
              disabled={addingTag}
            >
              {addingTag ? 'Criando tag...' : 'Criar tag no diálogo'}
            </Button>
          </Box>
        </Stack>
      </Card>

      {currentMaterial?._id && (
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
                          await removeVinculosMaterial(currentMaterial._id, [c._id]);
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
              if (!currentMaterial?._id || vinculosToAdd.length === 0) return;
              setSavingVinculos(true);
              try {
                await addVinculosMaterial(currentMaterial._id, vinculosToAdd.map((c) => c._id));
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
          <Button onClick={() => setOpenNovaCategoria(false)} disabled={savingCategoria}>Cancelar</Button>
          <LoadingButton variant="contained" loading={savingCategoria} onClick={handleCreateCategoria}>
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
          <Button onClick={() => setOpenNovaTag(false)} disabled={savingTag}>Cancelar</Button>
          <LoadingButton variant="contained" loading={savingTag} onClick={handleCreateTag}>
            Criar
          </LoadingButton>
        </DialogActions>
      </Dialog>

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
