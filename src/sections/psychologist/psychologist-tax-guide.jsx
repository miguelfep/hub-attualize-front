'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// Guia tributário nacional — conteúdo de SEO da landing /contabilidade-para-psicologos.
// Texto renderizado no HTML inicial (pré-render), atacando as buscas informacionais
// que trazem psicólogos de todo o Brasil: Fator R, MEI, autônomo x PJ e NFS-e.

const AZUL = '#0096D9';

export function PsychologistTaxGuide() {
  return (
    <Box component="section" aria-labelledby="titulo-guia" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Typography
          id="titulo-guia"
          component="h2"
          variant="h2"
          sx={{ mb: 2, textAlign: 'center' }}
        >
          Impostos do psicólogo:{' '}
          <Box component="span" sx={{ color: '#FEC615' }}>
            o essencial
          </Box>
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 6 }}
        >
          As regras valem para psicólogos de todo o Brasil — só o ISS muda de cidade para cidade. É
          exatamente isso que uma contabilidade especializada acompanha por você.
        </Typography>

        <Stack spacing={4}>
          <Box>
            <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
              Psicólogo não pode ser MEI — e isso não é um problema
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              A psicologia é profissão regulamentada e está fora da lista de atividades do MEI. O
              caminho para deixar de pagar até 27,5% no carnê-leão é abrir uma empresa — em geral
              uma sociedade limitada unipessoal no Simples Nacional. Com o enquadramento certo, o
              imposto começa em 6% sobre o faturamento, e a{' '}
              <Link href="/abertura-cnpj-psicologo" underline="hover" sx={{ fontWeight: 600 }}>
                abertura do CNPJ de psicólogo
              </Link>{' '}
              é 100% digital.
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
              Fator R: a linha dos 28% que define seu imposto
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              O Fator R é a divisão entre a folha de pagamento (incluindo o pró-labore) e a receita
              bruta dos últimos 12 meses. Igual ou acima de 28%, sua empresa é tributada pelo{' '}
              <strong>Anexo III</strong> do Simples Nacional, com alíquotas a partir de 6%; abaixo
              disso, cai no <strong>Anexo V</strong>, que começa em 15,5%. Uma empresa que fatura
              R$ 25 mil por mês pode pagar mais que o dobro de imposto só por estar no anexo errado
              — planejar o pró-labore é o que evita isso. Quer ver com seus números?{' '}
              <Link
                href="/contabilidade-para-psicologos-em-curitiba#calculadora-fator-r"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Use a calculadora gratuita de Fator R
              </Link>
              .
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
              Autônomo ou PJ: quando a troca compensa
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Atendendo como pessoa física, o psicólogo recolhe carnê-leão em tabela progressiva
              que chega a 27,5%, além do INSS de autônomo e do ISS municipal. Como pessoa jurídica
              no Simples, a alíquota efetiva costuma ficar entre 6% e 16%, já incluindo o ISS na
              guia única (DAS). Em média, a partir de R$ 4–5 mil de faturamento mensal a PJ já
              tende a compensar — e o comparativo exato com os seus números faz parte do nosso
              diagnóstico gratuito.
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
              NFS-e, CRP e obrigações em dia
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              A nota fiscal de serviço é emitida pelo portal nacional da NFS-e (Emissor Nacional) —
              e, pelo portal da Attualize, você emite as notas de pacientes e convênios em poucos
              cliques, com o código de serviço correto para psicologia. Também acompanhamos as
              exigências do Conselho Regional de Psicologia e as regras de ISS da sua cidade. Se
              você atende em Curitiba, temos uma página só sobre{' '}
              <Link
                href="/contabilidade-para-psicologos-em-curitiba"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                contabilidade para psicólogos em Curitiba
              </Link>
              , com custos de abertura e ISS locais.
            </Typography>
          </Box>
        </Stack>

        {/* Links internos — outras especialidades (SEO) */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          }}
        >
          <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
            A Attualize também é especialista em
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={{ xs: 1.5, sm: 2.5 }}>
            {[
              {
                titulo: 'Planejador de Empresa (grátis)',
                href: '/planejador-de-empresa?segmento=psicologia',
              },
              { titulo: 'Contabilidade para Médicos', href: '/contabilidade-para-medicos' },
              { titulo: 'Contabilidade para Dentistas', href: '/contabilidade-para-dentistas' },
              {
                titulo: 'Contabilidade para Fisioterapeutas',
                href: '/contabilidade-para-fisioterapeutas',
              },
              {
                titulo: 'Contabilidade para Fonoaudiólogos',
                href: '/contabilidade-para-fonoaudiologos',
              },
              {
                titulo: 'Contabilidade para Nutricionistas',
                href: '/contabilidade-para-nutricionistas',
              },
              { titulo: 'Contabilidade para Terapeutas', href: '/contabilidade-para-terapeutas' },
              {
                titulo: 'Contabilidade para Clínicas de Estética',
                href: '/contabilidade-para-clinicas-de-estetica',
              },
              {
                titulo: 'Contabilidade para a Área da Saúde',
                href: '/contabilidade-para-negocios-da-area-da-saude',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                underline="hover"
                variant="body2"
                sx={{ color: 'text.secondary', '&:hover': { color: AZUL } }}
              >
                {item.titulo}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
