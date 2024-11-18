import { useState } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import { getUser } from 'src/auth/context/jwt';

export function KanbanDetailsCommentInput({ comentarios, onAddComment }) {
  const user = getUser();
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        responsavel: user.name,
        texto: commentText,
        dataComentario: new Date(),
      };
      onAddComment(newComment);
      setCommentText('');
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 3, px: 2.5 }}>
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
            <Button variant="contained" onClick={handleAddComment}>
              Comentar
            </Button>
          </Stack>
        </Paper>
      </Stack>

      {comentarios.map((comment) => (
        <Stack key={comment.id} direction="row" spacing={2} sx={{ mt: 2 }}>
          <Avatar>{comment.responsavel?.charAt(0).toUpperCase()}</Avatar>
          <Paper variant="outlined" sx={{ p: 1, flexGrow: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {comment.responsavel}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(comment.dataComentario).toLocaleString()}
            </Typography>
            <Typography variant="body1">{comment.texto}</Typography>
          </Paper>
        </Stack>
      ))}
    </Stack>
  );
}
