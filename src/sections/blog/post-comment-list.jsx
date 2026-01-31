import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { PostCommentItem } from './post-comment-item';

// ----------------------------------------------------------------------

export function PostCommentList({ comments = [], postId, onCommentAdded }) {
  // Formatar comentários do WordPress
  const formattedComments = comments.map((comment) => {
    // Separar comentários principais (parent === 0) e respostas (parent !== 0)
    const isMainComment = comment.parent === 0;
    
    // Extrair conteúdo HTML do comentário
    let message = '';
    if (typeof comment.content === 'string') {
      message = comment.content;
    } else if (comment.content?.rendered) {
      message = comment.content.rendered;
    }
    
    // Buscar avatar do WordPress - tenta diferentes tamanhos
    // WordPress retorna avatares em author_avatar_urls com diferentes tamanhos (24, 48, 96)
    const avatarUrl =
      comment.author_avatar_urls?.['96'] ||
      comment.author_avatar_urls?.['48'] ||
      comment.author_avatar_urls?.['24'] ||
      '';
    
    return {
      id: comment.id,
      name: comment.author_name || 'Anônimo',
      message,
      postedAt: comment.date || comment.date_gmt,
      avatarUrl,
      parent: comment.parent,
      isMainComment,
    };
  });

  // Organizar comentários principais e suas respostas
  const mainComments = formattedComments.filter((c) => c.isMainComment);
  const replies = formattedComments.filter((c) => !c.isMainComment);

  // Função recursiva para organizar respostas aninhadas
  const organizeReplies = (parentId) => replies
      .filter((reply) => reply.parent === parentId)
      .map((reply) => ({
        ...reply,
        replies: organizeReplies(reply.id), // Respostas de respostas (aninhadas)
      }));

  if (mainComments.length === 0) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {mainComments.map((comment, index) => {
        const commentReplies = organizeReplies(comment.id);

        return (
          <Box key={comment.id}>
            <PostCommentItem
              id={comment.id}
              name={comment.name}
              message={comment.message}
              postedAt={comment.postedAt}
              avatarUrl={comment.avatarUrl}
              postId={postId}
              onReplyAdded={onCommentAdded}
            />
            {commentReplies.length > 0 && (
              <Stack 
                spacing={2}
                sx={{ 
                  ml: { xs: 2, sm: 4, md: 6 }, 
                  mt: 2,
                  pl: { xs: 2, sm: 3 },
                  borderLeft: (theme) => `2px solid ${theme.vars.palette.divider}`,
                }}
              >
                {commentReplies.map((reply) => (
                  <Box key={reply.id}>
                    <PostCommentItem
                      id={reply.id}
                      name={reply.name}
                      message={reply.message}
                      postedAt={reply.postedAt}
                      avatarUrl={reply.avatarUrl}
                      hasReply
                      postId={postId}
                      onReplyAdded={onCommentAdded}
                    />
                    {/* Renderizar respostas aninhadas (respostas de respostas) */}
                    {reply.replies && reply.replies.length > 0 && (
                      <Stack 
                        spacing={2}
                        sx={{ 
                          ml: { xs: 2, sm: 4 }, 
                          mt: 2,
                          pl: { xs: 2, sm: 3 },
                          borderLeft: (theme) => `2px solid ${theme.vars.palette.divider}`,
                        }}
                      >
                        {reply.replies.map((nestedReply) => (
                          <PostCommentItem
                            key={nestedReply.id}
                            id={nestedReply.id}
                            name={nestedReply.name}
                            message={nestedReply.message}
                            postedAt={nestedReply.postedAt}
                            avatarUrl={nestedReply.avatarUrl}
                            hasReply
                            postId={postId}
                            onReplyAdded={onCommentAdded}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
            {index < mainComments.length - 1 && (
              <Divider sx={{ my: 3 }} />
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
