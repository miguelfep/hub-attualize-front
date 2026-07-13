'use client';

import { useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Link,
  Stack,
  Accordion,
  Container,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { CORES, FAQ_ITEMS, ESPECIALIDADES_INTERNAS } from './dados';

// ----------------------------------------------------------------------
// 3. Por que uma contabilidade especializada em médicos

const BLOCOS_ESPECIALIZADA = [
  {
    icone: 'solar:chart-2-bold-duotone',
    titulo: 'Anexo III via Fator R',
    texto:
      'Planejamos o pró-labore para manter sua folha em 28% da receita e enquadrar a empresa no Anexo III — a diferença entre começar pagando 6% ou 15,5% de imposto.',
  },
  {
    icone: 'solar:hospital-bold-duotone',
    titulo: 'Equiparação hospitalar',
    texto:
      'Para clínicas no Lucro Presumido com procedimentos e exames, aplicamos a redução da base do IRPJ de 32% para 8% e da CSLL de 32% para 12% — economia que pode passar de 60%.',
  },
  {
    icone: 'solar:document-add-bold-duotone',
    titulo: 'Plantões e convênios sem fricção',
    texto:
      'Credenciamos sua empresa no Emissor Nacional e você emite as notas de plantões, consultas e convênios direto pelo nosso portal, com o código de serviço correto para medicina.',
  },
  {
    icone: 'solar:shield-check-bold-duotone',
    titulo: 'CRM-PR e ISS em dia',
    texto:
      'Acompanhamos o registro da empresa no Conselho Regional de Medicina e as obrigações municipais de ISS para você atender sem pendência fiscal ou de registro.',
  },
];

export function SecaoEspecializada() {
  return (
    <Box component="section" aria-labelledby="titulo-especializada" sx={{ py: { xs: 6, md: 10 }, bgcolor: CORES.papel }}>
      <Container maxWidth="lg">
        <Typography
          id="titulo-especializada"
          component="h2"
          variant="h3"
          sx={{ color: CORES.tinta, textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          Por que uma contabilidade especializada em médicos
        </Typography>
        <Grid container spacing={3}>
          {BLOCOS_ESPECIALIZADA.map((bloco) => (
            <Grid key={bloco.titulo} xs={12} sm={6} md={3}>
              <Stack spacing={1.5} sx={{ height: 1 }}>
                <Iconify icon={bloco.icone} width={36} sx={{ color: CORES.azul }} />
                <Typography component="h3" variant="h6" sx={{ color: CORES.tinta }}>
                  {bloco.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: CORES.grafite }}>
                  {bloco.texto}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 4. Conteúdo local — Curitiba/PR

export function SecaoLocalCuritiba() {
  return (
    <Box component="section" aria-labelledby="titulo-local" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="md">
        <Typography id="titulo-local" component="h2" variant="h3" sx={{ color: CORES.tinta, mb: 4 }}>
          O que muda para o médico PJ em Curitiba
        </Typography>

        <Stack spacing={4}>
          <Box>
            <Typography component="h3" variant="h5" sx={{ color: CORES.tinta, mb: 1 }}>
              ISS para médicos em Curitiba
            </Typography>
            <Typography variant="body1" sx={{ color: CORES.grafite, mb: 1.5 }}>
              A alíquota de ISS para os serviços de medicina em Curitiba (subitem 04.01 da lista de
              serviços) varia conforme o modelo de atuação e o regime tributário:
            </Typography>
            <Stack component="ul" spacing={1} sx={{ m: 0, pl: 3, color: CORES.grafite }}>
              <Typography component="li" variant="body1">
                <strong>Pessoa jurídica no Simples Nacional</strong> — o ISS já vem embutido na guia
                única (DAS) e flutua de forma progressiva entre <strong>2% e 5%</strong>, conforme o
                faturamento acumulado e o anexo em que a empresa se enquadra (Anexo III via Fator R
                ou Anexo V).
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Pessoa jurídica no Lucro Presumido</strong> — alíquota de <strong>5%</strong>{' '}
                sobre o faturamento do estabelecimento, conforme a tabela oficial de subitens de
                serviços da Prefeitura de Curitiba. Atendimentos prestados ao <strong>SUS</strong>{' '}
                contam com incentivo fiscal que reduz a alíquota para <strong>2%</strong>.
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Profissional autônomo (pessoa física)</strong> — em vez de percentual sobre
                cada consulta, paga o <strong>ISS Fixo</strong>: uma taxa anual estipulada pelo
                município, lançada geralmente no início do ano, com opção de cota única com desconto
                ou parcelamento.
              </Typography>
              <Typography component="li" variant="body1">
                <strong>Sociedade uniprofissional de médicos</strong> — sociedades formadas apenas
                por médicos que atendem aos requisitos legais podem recolher o ISS em regime fixo
                por profissional, em vez de percentual sobre o faturamento. Avaliamos se o seu caso
                se enquadra.
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: CORES.grafite, mt: 1.5 }}>
              Sobre a Reforma Tributária: o período de transição já começou, mas o Simples Nacional
              e o ISS municipal continuam operando normalmente enquanto os novos impostos (IBS/CBS)
              são introduzidos de forma gradual.
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ color: CORES.tinta, mb: 1 }}>
              Como funciona a NFS-e para médicos em Curitiba
            </Typography>
            <Typography variant="body1" sx={{ color: CORES.grafite }}>
              A emissão da nota fiscal de serviço passou a ser feita pelo{' '}
              <strong>portal nacional da NFS-e (Emissor Nacional)</strong> — e, além dele, a
              Attualize tem <strong>sistema próprio de emissão de nota de serviço</strong>: você
              emite as notas de plantões, consultas particulares e convênios direto pelo nosso
              portal, em poucos cliques, já com o código de serviço correto para medicina. Nós
              cuidamos do credenciamento, da configuração e de qualquer mudança de regra municipal.
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ color: CORES.tinta, mb: 1 }}>
              Registro no CRM-PR e vigilância sanitária
            </Typography>
            <Typography variant="body1" sx={{ color: CORES.grafite }}>
              Além do CNPJ, clínicas e sociedades médicas precisam de{' '}
              <strong>registro no Conselho Regional de Medicina do Paraná (CRM-PR)</strong>, com
              indicação de diretor técnico médico. Consultórios e clínicas em Curitiba também passam
              pelo licenciamento da <strong>Vigilância Sanitária municipal</strong>, com taxa
              conforme o grau de risco da atividade. Orientamos a documentação e conduzimos as duas
              frentes junto com a abertura da empresa.
            </Typography>
          </Box>

          <Box>
            <Typography component="h3" variant="h5" sx={{ color: CORES.tinta, mb: 1 }}>
              Custos de abertura: JUCEPAR e taxas de Curitiba
            </Typography>
            <Typography variant="body1" sx={{ color: CORES.grafite, mb: 1.5 }}>
              O registro na Junta Comercial do Paraná (JUCEPAR) tem valores reajustados pelo INPC,
              definidos por resolução do Conselho de Administração, e varia conforme a natureza
              jurídica:
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 3, color: CORES.grafite }}>
              <Typography component="li" variant="body1">
                Empresário Individual (EI): <strong>R$ 96,90</strong>
              </Typography>
              <Typography component="li" variant="body1">
                Sociedade Limitada (LTDA): <strong>R$ 134,55</strong>
              </Typography>
              <Typography component="li" variant="body1">
                Sociedade Anônima (S/A) ou atas de assembleia: <strong>R$ 269,20</strong>
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: CORES.grafite, mt: 1.5, mb: 1.5 }}>
              O processo é assinado digitalmente pelo sistema Empresa Fácil (conta gov.br nível
              Prata/Ouro ou certificado e-CPF). Já as taxas municipais de Curitiba — reajustadas
              anualmente por decreto (Decreto Municipal nº 2.673) — incluem:
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 3, color: CORES.grafite }}>
              <Typography component="li" variant="body1">
                Taxa de Expediente (emissão do alvará comercial): <strong>R$ 50,95</strong>
              </Typography>
              <Typography component="li" variant="body1">
                Taxa de Licença para Localização (TLL), para comércio e serviço vicinal/bairro:
                pequeno porte até 400 m² <strong>R$ 339,12</strong> · médio porte de 401 a 2.000 m²{' '}
                <strong>R$ 509,62</strong> · grande porte acima de 2.000 m²{' '}
                <strong>R$ 852,43</strong>
              </Typography>
              <Typography component="li" variant="body1">
                Taxa de Vigilância Sanitária (consultórios e clínicas), para imóvel de até 50 m²:
                baixo risco (III) <strong>R$ 109,34</strong> · médio risco (II){' '}
                <strong>R$ 174,18</strong> · alto risco (I) <strong>R$ 328,00</strong>
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: CORES.grafite, mt: 1.5 }}>
              Vale lembrar: a medicina, por ser profissão regulamentada, não se enquadra no MEI —
              então essas taxas fazem parte do custo real de abertura. No diagnóstico gratuito
              apresentamos o custo total do seu caso antes de você decidir.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 7. FAQ — mesmas perguntas/respostas do JSON-LD (importadas de dados.js)

export function SecaoFaq() {
  const [aberta, setAberta] = useState(null);

  return (
    <Box component="section" aria-labelledby="titulo-faq" sx={{ py: { xs: 6, md: 10 }, bgcolor: CORES.papel }}>
      <Container maxWidth="md">
        <Typography
          id="titulo-faq"
          component="h2"
          variant="h3"
          sx={{ color: CORES.tinta, textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          Perguntas frequentes
        </Typography>

        {FAQ_ITEMS.map((item, index) => (
          <Accordion
            key={item.pergunta}
            expanded={aberta === index}
            onChange={(_, expandida) => setAberta(expandida ? index : null)}
            disableGutters
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E2EDF3',
              borderRadius: '12px !important',
              mb: 1.5,
              '&::before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" sx={{ color: CORES.azul }} />}
              sx={{ '&:focus-visible': { outline: `3px solid ${CORES.azul}`, outlineOffset: -3 } }}
            >
              <Typography component="h3" variant="subtitle1" sx={{ color: CORES.tinta }}>
                {item.pergunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ color: CORES.grafite }}>
                {item.resposta}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Links internos para outras especialidades (SEO)

export function SecaoLinksInternos() {
  return (
    <Box component="section" aria-labelledby="titulo-links" sx={{ py: { xs: 5, md: 7 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2EDF3' }}>
      <Container maxWidth="lg">
        <Typography id="titulo-links" component="h2" variant="h6" sx={{ color: CORES.tinta, mb: 2 }}>
          A Attualize também é especialista em
        </Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={{ xs: 1.5, sm: 2.5 }}>
          {ESPECIALIDADES_INTERNAS.map((especialidade) => (
            <Link
              key={especialidade.href}
              href={especialidade.href}
              underline="hover"
              variant="body2"
              sx={{
                color: CORES.grafite,
                '&:hover': { color: CORES.azul },
                '&:focus-visible': { outline: `2px solid ${CORES.azul}`, outlineOffset: 2 },
              }}
            >
              {especialidade.titulo}
            </Link>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
