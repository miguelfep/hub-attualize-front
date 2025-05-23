'use client';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export default function Error({ error, reset }) {
  return (
    <Container sx={{ my: 5 }}>
      <EmptyContent
        filled
        title="Alteração não encontrada!"
        action={
          <Button
            component={RouterLink}
            href="/"
            startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
            sx={{ mt: 3 }}
          >
            Voltar para home
          </Button>
        }
        sx={{ py: 10 }}
      />
    </Container>
  );
}
