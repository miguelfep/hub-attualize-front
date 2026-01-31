import { z as zod } from 'zod';
import axiosDirect from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const WORDPRESS_URL = 'https://attualizecontabil.com.br';

// ----------------------------------------------------------------------

export const ReplySchema = zod.object({
  author_name: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  author_email: zod.string().email({ message: 'Email inválido!' }),
  content: zod.string().min(1, { message: 'Resposta é obrigatória!' }),
});

// ----------------------------------------------------------------------

export function PostCommentReplyForm({ postId, parentId, parentAuthorName, onReplyAdded, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = { 
    author_name: '',
    author_email: '',
    content: '',
  };

  const methods = useForm({
    resolver: zodResolver(ReplySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!postId || !parentId) {
      toast.error('Erro: ID do post ou comentário não encontrado');
      return;
    }

    setIsSubmitting(true);
    try {
      // Chamar diretamente a API do WordPress
      await axiosDirect.post(
        `${WORDPRESS_URL}/wp-json/wp/v2/comments`,
        {
          post: postId,
          author_name: data.author_name,
          author_email: data.author_email,
          content: data.content,
          parent: parentId, // ID do comentário pai
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      toast.success('Resposta enviada! Ela será publicada após aprovação.');
      reset();
      
      // Recarregar comentários se callback fornecido
      if (onReplyAdded) {
        // Aguardar um pouco antes de recarregar para dar tempo do WordPress processar
        setTimeout(() => {
          onReplyAdded();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      
      // Mostrar mensagem de erro mais específica
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || error.message || 'Erro ao enviar resposta. Tente novamente.';
      
      if (errorData?.code === 'rest_comment_login_required') {
        toast.error(
          'Comentários anônimos não estão habilitados no WordPress. Entre em contato com o administrador do site.',
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1}
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'primary.lighter',
            border: (theme) => `1px solid ${theme.vars.palette.primary.main}`,
          }}
        >
          <Iconify icon="solar:arrow-right-bold" width={16} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Respondendo para <strong>{parentAuthorName}</strong>
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Field.Text
            name="author_name"
            label="Nome"
            placeholder="Seu nome"
            fullWidth
          />
          <Field.Text
            name="author_email"
            label="Email"
            placeholder="seu@email.com"
            type="email"
            fullWidth
          />
        </Stack>

        <Field.Text
          name="content"
          label="Sua resposta"
          placeholder={`Respondendo para ${parentAuthorName}...`}
          multiline
          rows={4}
          fullWidth
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                textTransform: 'none',
                minWidth: 100,
              }}
            >
              Cancelar
            </Button>
          )}
          <LoadingButton 
            type="submit" 
            variant="contained" 
            loading={isSubmitting}
            size="large"
            startIcon={!isSubmitting && <Iconify icon="solar:chat-round-dots-bold" width={18} />}
            sx={{
              minWidth: 160,
              textTransform: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
