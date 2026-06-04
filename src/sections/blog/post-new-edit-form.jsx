import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  archiveBlogPost,
} from 'src/actions/blog';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { BlogCoverField } from './blog-cover-field';

// ----------------------------------------------------------------------

const CATEGORIAS = ['Saúde', 'Beleza', 'Bem-estar', 'Contabilidade', 'Gestão', 'Geral'];

const SEO_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 155;

export const NewPostSchema = zod.object({
  titulo: zod.string().min(1, { message: 'O título é obrigatório!' }),
  resumo: zod.string().min(1, { message: 'O resumo é obrigatório!' }),
  conteudoMarkdown: schemaHelper.editor({ message: { required_error: 'O conteúdo é obrigatório!' } }),
  categoria: zod.string().min(1, { message: 'A categoria é obrigatória!' }),
  coverImage: zod.string().optional(),
  tags: zod.string().array(),
  keywords: zod.string().array(),
  seoTitle: zod.string().optional(),
  metaDescription: zod.string().optional(),
  faq: zod
    .array(
      zod.object({
        pergunta: zod.string(),
        resposta: zod.string(),
      })
    )
    .optional(),
});

// ----------------------------------------------------------------------

export function PostNewEditForm({ currentPost }) {
  const router = useRouter();

  const publishing = useBoolean();
  const archiving = useBoolean();

  const defaultValues = useMemo(
    () => ({
      titulo: currentPost?.titulo || currentPost?.title || '',
      resumo: currentPost?.resumo || currentPost?.description || '',
      conteudoMarkdown: currentPost?.conteudoMarkdown || currentPost?.content || '',
      categoria: currentPost?.categoria || '',
      coverImage: currentPost?.coverImage || currentPost?.coverUrl || '',
      tags: currentPost?.tags || [],
      keywords: currentPost?.keywords || [],
      seoTitle: currentPost?.seoTitle || '',
      metaDescription: currentPost?.metaDescription || '',
      faq: currentPost?.faq || [],
    }),
    [currentPost]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewPostSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: 'faq' });

  const values = watch();

  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);
    }
  }, [currentPost, defaultValues, reset]);

  // Salva (cria ou atualiza) e retorna o post. opcionalmente publica em seguida.
  const persist = useCallback(
    async (data, { publish } = {}) => {
      const payload = { ...data, status: publish ? 'publicado' : currentPost?.status || 'rascunho' };

      let saved;
      if (currentPost?.id) {
        saved = await updateBlogPost(currentPost.id, payload);
      } else {
        saved = await createBlogPost(payload);
      }

      const savedId = saved?._id || currentPost?.id;

      // Garante publicação via endpoint dedicado (gera o .md/sitemap/RSS)
      if (publish && savedId && saved?.status !== 'publicado') {
        await publishBlogPost(savedId);
      }

      return saved;
    },
    [currentPost]
  );

  const onSaveDraft = handleSubmit(async (data) => {
    try {
      await persist(data, { publish: false });
      toast.success(currentPost ? 'Alterações salvas!' : 'Rascunho criado!');
      router.push(paths.dashboard.post.root);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Erro ao salvar o post.');
    }
  });

  const onPublish = handleSubmit(async (data) => {
    publishing.onTrue();
    try {
      await persist(data, { publish: true });
      toast.success('Post publicado!');
      router.push(paths.dashboard.post.root);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Erro ao publicar o post.');
    } finally {
      publishing.onFalse();
    }
  });

  const onArchive = useCallback(async () => {
    if (!currentPost?.id) return;
    archiving.onTrue();
    try {
      await archiveBlogPost(currentPost.id);
      toast.success('Post arquivado.');
      router.push(paths.dashboard.post.root);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Erro ao arquivar o post.');
    } finally {
      archiving.onFalse();
    }
  }, [currentPost, router, archiving]);

  const renderDetails = (
    <Card>
      <CardHeader title="Conteúdo" subheader="Título, resumo, capa e corpo do post" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="titulo" label="Título do post" />

        <Field.Text
          name="resumo"
          label="Resumo"
          multiline
          rows={3}
          helperText="Usado no card e como meta description padrão."
        />

        <BlogCoverField name="coverImage" />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Conteúdo</Typography>
          <Field.Editor name="conteudoMarkdown" sx={{ maxHeight: 560 }} />
        </Stack>
      </Stack>
    </Card>
  );

  const renderProperties = (
    <Card>
      <CardHeader title="Categorização" subheader="Categoria, tags e palavras-chave" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Select name="categoria" label="Categoria">
          {CATEGORIAS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Field.Select>

        <Field.Autocomplete
          name="tags"
          label="Tags"
          placeholder="+ Tags"
          multiple
          freeSolo
          disableCloseOnSelect
          options={[]}
          getOptionLabel={(option) => option}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="info"
                variant="soft"
              />
            ))
          }
        />

        <Field.Autocomplete
          name="keywords"
          label="Palavras-chave (SEO)"
          placeholder="+ Palavras-chave"
          multiple
          freeSolo
          disableCloseOnSelect
          options={[]}
          getOptionLabel={(option) => option}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="info"
                variant="soft"
              />
            ))
          }
        />
      </Stack>
    </Card>
  );

  const renderSeo = (
    <Card>
      <CardHeader title="SEO" subheader="Título e descrição para buscadores" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="seoTitle"
          label="SEO title"
          helperText={`${(values.seoTitle || '').length}/${SEO_TITLE_MAX} caracteres`}
          error={(values.seoTitle || '').length > SEO_TITLE_MAX}
        />

        <Field.Text
          name="metaDescription"
          label="Meta description"
          multiline
          rows={3}
          helperText={`${(values.metaDescription || '').length}/${META_DESCRIPTION_MAX} caracteres`}
          error={(values.metaDescription || '').length > META_DESCRIPTION_MAX}
        />
      </Stack>
    </Card>
  );

  const renderFaq = (
    <Card>
      <CardHeader
        title="FAQ"
        subheader="Perguntas e respostas (geram rich snippet / FAQPage)"
        sx={{ mb: 3 }}
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {fields.map((item, index) => (
          <Stack key={item.id} spacing={1.5} sx={{ position: 'relative' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                Pergunta {index + 1}
              </Typography>
              <IconButton size="small" color="error" onClick={() => remove(index)}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Stack>
            <Field.Text name={`faq.${index}.pergunta`} label="Pergunta" />
            <Field.Text name={`faq.${index}.resposta`} label="Resposta" multiline rows={2} />
          </Stack>
        ))}

        <Button
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => append({ pergunta: '', resposta: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Adicionar pergunta
        </Button>
      </Stack>
    </Card>
  );

  const renderActions = (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5} justifyContent="flex-end">
      {currentPost?.id && currentPost?.status === 'publicado' && (
        <Button
          color="warning"
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="solar:archive-bold" />}
          onClick={onArchive}
          disabled={archiving.value}
        >
          Arquivar
        </Button>
      )}

      <LoadingButton
        type="button"
        color="inherit"
        variant="outlined"
        size="large"
        loading={isSubmitting && !publishing.value}
        onClick={onSaveDraft}
      >
        Salvar rascunho
      </LoadingButton>

      <LoadingButton
        type="button"
        variant="contained"
        size="large"
        loading={publishing.value}
        onClick={onPublish}
      >
        Publicar
      </LoadingButton>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSaveDraft}>
      <Stack spacing={5} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}
        {renderProperties}
        {renderSeo}
        {renderFaq}
        {renderActions}
      </Stack>
    </Form>
  );
}
