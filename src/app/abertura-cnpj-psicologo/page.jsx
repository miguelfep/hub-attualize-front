'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { AberturaCnpjStepper } from 'src/components/abertura-cnpj-stepper';

// ----------------------------------------------------------------------

export default function AberturaCnpjPsicologoPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/contabilidade-para-psicologos');
  };

  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        minHeight: '100vh',
        bgcolor: 'background.neutral',
      }}
    >
      <Container maxWidth="lg">
        <AberturaCnpjStepper onClose={handleClose} />
      </Container>
    </Box>
  );
}

