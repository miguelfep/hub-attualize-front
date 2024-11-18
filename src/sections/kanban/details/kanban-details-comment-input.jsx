import { useState } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { getUser } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput({ comentarios, onAddComment, onDeleteComment }) {
  const user = getUser();
  const [commentText, setCommentText] = useState('');

  // Função para adicionar um novo comentário
  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(), // Gerar um ID temporário; pode ser ajustado conforme o necessário
        responsavel: user.name,
        dataComentario: new Date(),
        texto: commentText,
      };

      onAddComment(newComment);
      setCommentText('');
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 3, px: 2.5 }}>
      {/* Exibição dos comentários */}
      {comentarios.map((comment) => (
        <Stack key={comment.id} direction="row" spacing={2} sx={{ mt: 2 }}>
          <Avatar>{comment.responsavel?.charAt(0).toUpperCase()}</Avatar>
          <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, position: 'relative' }}>
            <Typography variant="subtitle2" gutterBottom>
              {comment.responsavel}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(comment.dataComentario).toLocaleString()}
            </Typography>
            <Typography variant="body1">{comment.texto}</Typography>
            {/* Botão de deletar comentário */}
            <IconButton
              onClick={() => onDeleteComment(comment.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </Paper>
        </Stack>
      ))}
      {/* Input para novo comentário */}
      <Stack direction="row" spacing={2}>
        <Avatar src={user?.photoURL} alt={user?.displayName}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
          <InputBase
            fullWidth
            multiline
            rows={2}
            placeholder="Digite o comentário"
            sx={{ px: 1 }}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Stack direction="row" alignItems="center">
            <Stack direction="row" flexGrow={1}>
              <IconButton>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>
              <IconButton>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
            </Stack>
            <Button variant="contained" onClick={handleAddComment}>
              Comentar
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}
