'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { IndicacaoHero } from 'src/sections/indicacoes/indicacao-hero';
import { IndicacaoFormView } from 'src/sections/indicacoes/indicacao-form-view';
import { IndicacaoPartners } from 'src/sections/indicacoes/indicacao-partners';
import { obterIndicadorPorCodigo } from 'src/actions/indicacoes';

// ----------------------------------------------------------------------

export default function IndicacaoPage() {
  const params = useParams();
  const codigo = params?.codigo;
  const [indicador, setIndicador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarIndicador = async () => {
      if (!codigo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await obterIndicadorPorCodigo(codigo);
        if (data?.indicador) {
          setIndicador(data.indicador);
        }
      } catch (error) {
        console.warn('Não foi possível carregar dados do indicador:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarIndicador();
  }, [codigo]);

  if (!codigo) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Código de indicação inválido
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <IndicacaoHero indicador={indicador} />

      <Container sx={{ py: { xs: 6, md: 8 }, maxWidth: 800 }}>
        <IndicacaoFormView codigoIndicacao={codigo} />
      </Container>

      <IndicacaoPartners indicador={indicador} />
    </Box>
  );
}
