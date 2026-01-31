'use client';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <Container sx={{ my: 5 }}>
      <EmptyContent
        filled
        title="Post não encontrado!"
        description="A postagem que você está procurando não existe ou foi removida."
        action={
          <Button
            component={RouterLink}
            href={paths.post.blog}
            startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
            sx={{ mt: 3 }}
          >
            Voltar para o blog
          </Button>
        }
        sx={{ py: 10 }}
      />
    </Container>
  );
}
