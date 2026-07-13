'use client';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Stack, Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------
// Como implantar a Lei do Salão Parceiro — conteúdo SEO (buscas informacionais
// como "como implantar lei salão parceiro" e "contrato de parceria salão").

const PASSOS_IMPLANTACAO = [
  {
    numero: '1',
    titulo: 'Diagnóstico do negócio',
    texto:
      'Analisamos seu enquadramento atual (MEI, ME, regime de tributação), a equipe e o modelo de repasse praticado hoje — inclusive o que está informal.',
  },
  {
    numero: '2',
    titulo: 'Formalização dos parceiros',
    texto:
      'Cada profissional parceiro precisa de CNPJ próprio (MEI ou ME). Orientamos a abertura de cada um, com a atividade correta e sem custo desnecessário.',
  },
  {
    numero: '3',
    titulo: 'Contratos de parceria',
    texto:
      'Elaboramos os contratos no modelo da Lei 13.352/2016 — cota-parte definida, autonomia do profissional, responsabilidades de cada lado — e orientamos a homologação no sindicato quando exigida.',
  },
  {
    numero: '4',
    titulo: 'Sistema configurado',
    texto:
      'Configuramos o sistema de gestão de parceria: cadastro dos parceiros, percentuais de repasse, emissão de notas fiscais integrada e painel do gestor.',
  },
  {
    numero: '5',
    titulo: 'Rotina mensal em dia',
    texto:
      'Todo mês, a cota-parte de cada parceiro é documentada, as notas são emitidas e o imposto é apurado apenas sobre a sua parte — com a papelada pronta para qualquer fiscalização.',
  },
];

export function SecaoImplantacao({ segmento }) {
  const { cores } = segmento;

  return (
    <Box
      component="section"
      aria-labelledby="titulo-implantacao"
      sx={{ py: { xs: 6, md: 10 }, bgcolor: cores.suave }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.5} sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            id="titulo-implantacao"
            component="h2"
            variant="h3"
            sx={{ color: cores.tinta }}
          >
            Como implantamos a Lei do Salão Parceiro no seu negócio
          </Typography>
          <Typography variant="body1" sx={{ color: cores.grafite, maxWidth: 680, mx: 'auto' }}>
            Implantar a parceria sem critério é o que gera passivo trabalhista. Nosso processo
            cobre o jurídico, o fiscal e a operação do dia a dia — em 5 passos.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {PASSOS_IMPLANTACAO.map((passo) => (
            <Grid key={passo.numero} xs={12} sm={6} md={2.4}>
              <Stack
                spacing={1.5}
                sx={{
                  p: 3,
                  height: 1,
                  borderRadius: 3,
                  bgcolor: '#FFFFFF',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    bgcolor: cores.destaque,
                  }}
                >
                  {passo.numero}
                </Box>
                <Typography component="h3" variant="subtitle1" sx={{ color: cores.tinta }}>
                  {passo.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: cores.grafite }}>
                  {passo.texto}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
