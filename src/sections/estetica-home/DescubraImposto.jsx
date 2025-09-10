import { m } from "framer-motion";

import { Box, Container, Typography } from "@mui/material";

import { varFade } from "src/components/animate";

import { Calculadora } from "./CalculadoraEstetica";

export function DescubraImposto() {
  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>Conheça nossa Calculadora de Impostos</Typography>
          </m.div>
        <Calculadora />
      </Container>
    </Box>
  );
}
