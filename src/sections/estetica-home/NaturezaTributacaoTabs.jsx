import { m } from 'framer-motion';
import React, { useState } from 'react';

import { Box, Tab, Tabs, Stack, Paper, alpha, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate';

import { TabelaRegimesTributarios } from './TabelaRegimesTributarios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function NaturezaTributacaoTabs() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
          Natureza Jurídica e Tributação para Clínicas
        </Typography>

        <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', p: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              backgroundColor: 'background.paper',
              '& .MuiTab-root': {
                fontWeight: 600,
                py: 2,
                fontSize: '1rem'
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
            }}
            TabIndicatorProps={{
              style: {
                backgroundColor: 'primary.main',
                height: 3,
              }
            }}
          >
            <Tab label="Natureza Jurídica" />
            <Tab label="Regime Tributário" />
          </Tabs>

          <TabPanel value={tabValue} index={0} >
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Empresário Individual (EI)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  O <b>Empresário Individual</b> é a forma mais simples de formalizar um negócio. Nesse modelo, não há separação entre bens pessoais e da empresa.
                  Isso significa que, em caso de dívidas, o patrimônio pessoal do empresário pode ser usado para pagar.
                  Indicado para negócios de <b>baixo risco</b> e para profissionais que estão iniciando suas atividades.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Sociedade Limitada Unipessoal (SLU)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A <b>SLU</b>, criada em 2019, permite que uma única pessoa abra uma sociedade limitada.
                  Sua grande vantagem é a <b>proteção patrimonial</b>: os bens pessoais do sócio ficam separados dos da empresa.
                  É uma opção que combina a simplicidade do EI com a segurança da LTDA, sendo ideal para profissionais que buscam <b>mais proteção jurídica.</b>
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Sociedade Limitada (LTDA) com Sócios
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A <b>LTDA tradicional</b> é formada por dois ou mais sócios.
                  Cada um responde apenas pelo valor de sua quota, mas todos são solidários pela integralização do capital social.
                  Esse modelo é recomendado para quem tem <b>sócios investidores</b> ou já pensa em <b>expandir a clínica</b> no futuro com novos parceiros.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Diferenças de Responsabilidade
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • <strong>EI</strong>: responsabilidade ilimitada → o empresário responde com seu patrimônio pessoal.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  • <strong>SLU e LTDA</strong>: responsabilidade limitada ao capital social investido → protege o patrimônio pessoal do sócio.
                </Typography>
                <br />
                <Typography variant="body1"  sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  <i>Essa distinção é crucial para garantir segurança em casos de dívidas trabalhistas, tributárias ou contratuais</i>.
                </Typography>
            </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Flexibilidade Societária e Percepção no Mercado
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  A natureza jurídica escolhida também afeta a imagem da sua clínica.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Clínicas no formato <strong>LTDA</strong> transmitem mais credibilidade para clientes, fornecedores e instituições financeiras.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  • Além disso, a LTDA oferece mais <strong>flexibilidade</strong> para entrada ou saída de sócios, sucessão empresarial e expansão.
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Resumo Prático:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • <strong>EI</strong>: simples, mas de maior risco pessoal
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • <strong>SLU</strong>: simples e com proteção patrimonial
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  • <strong>LTDA</strong>: ideal para quem tem sócios ou quer crescer com segurança
                </Typography>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  MEI: quando faz sentido?
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O MEI é indicado para profissionais que SE ENQUADRAM nas atividades permitidas e estão começando,
                  com faturamento anual de até R$ 81 mil, ou seja, com um faturamento em média de R$6.750 por mês.
                  É uma opção simples, com baixa burocracia e custos reduzidos.
                  <br /> <br />
                  Limitações: só permite <b>1 funcionário</b> e não é adequado para quem tem profissionais parceiros ou pretende expandir.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Simples Nacional: Anexos III e V
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A maioria das clínicas se enquadra no Simples Nacional, mas é importante entender em qual anexo:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • <strong>Anexo III (alíquotas iniciais em 6%)</strong>: para empresas de serviços que atingem o Fator R (folha ≥ 28% do faturamento).
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  • <strong>Anexo V (alíquotas iniciais em 15,5%)</strong>: para empresas de serviços que atingem o Fator R
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O correto enquadramento entre Anexo III e V pode gerar grande diferença de impostos. Impacto gigantesco utilizando o Fator R
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  O Fator R compara a folha de pagamento (incluindo pró-labore) com o faturamento bruto dos últimos 12 meses.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, my: 1 }}>
                  • <strong>Se {'>='} 28% </strong> - enquadramento no <b>Anexo III</b> para empresas de serviços que atingem o Fator R
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  • <strong>Se {'<'} 28% </strong> → enquadramento no Anexo V (alíquotas iniciais mais altas).
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Lucro Presumido: quando avaliar
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O Lucro Presumido pode ser mais vantajoso para clínicas que:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Faturam acima do limite do Simples Nacional (R$ 4,8 milhões/ano)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  • Tem <b>margens altas de lucro</b> e folha de pagamento baixo.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, my: 1 }}>
                  • Estejam em cidades com ISS fixo ou com aliquotas mínimas
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Nesse regime, a tributação é feita sobre uma <b>presunção de lucro (32% da receita)</b>, e não sobre o lucro real ou o faturamento bruto.
                  É fundamental comparar a carga fiscal com o Simples antes de decidir.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  ISS: variação por município
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O <b>ISS (Imposto Sobre Serviços)</b> é municipal, e as alíquotas variam de <b>2% a 5%</b> dependendo da cidade onde a clínica está localizada.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Usar a alíquota incorreta pode gerar <b>multas e autuações fiscais</b>. Sempre confira a lei do município.
                </Typography>
              </Box>

              <TabelaRegimesTributarios />

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Lucro Presumido em Casos Específicos
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O Lucro Presumido pode ser vantajoso para clínicas de estética que faturam acima do limite
                  do Simples Nacional (R$ 4,8 milhões/ano) ou que tenham margens de lucro muito altas. Neste
                  regime, a tributação incide sobre uma presunção de lucro definida por lei.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  É importante realizar uma projeção tributária para comparar a carga fiscal entre o Lucro
                  Presumido e o Simples Nacional, considerando as particularidades de cada negócio.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Alíquotas de ISS Variam por Município
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  O Imposto Sobre Serviços (ISS) é de competência municipal, o que significa que cada cidade
                  pode estabelecer suas próprias alíquotas. Para serviços de estética, as alíquotas geralmente
                  variam entre 2% e 5%, dependendo do município onde a empresa está estabelecida.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mt: 2 }}>
                  É fundamental verificar a legislação específica do município onde a clínica está localizada,
                  pois a alíquota incorreta pode gerar autuações fiscais e multas.
                </Typography>
              </Box>
            </Stack>
          </TabPanel>
        </Paper>

        <Box sx={{ textAlign: 'center', pt: 6 }}>
          <m.div
            variants={varFade().inUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              endIcon={<Iconify icon="mdi:calculator" />}
              sx={(theme) => ({
                border: 'none',
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: { xs: 16, sm: 18 },
                color: 'primary.contrastText',
                backgroundColor: 'primary.main',
                boxShadow: `0px 4px 12px -2px ${alpha(theme.palette.primary.dark, 0.4)}`,
                transition: theme.transitions.create(['transform', 'box-shadow', 'background-color'], {
                  duration: theme.transitions.duration.short,
                }),

                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'primary.dark',
                  boxShadow: `
                    0px 6px 20px -1px ${alpha(theme.palette.primary.dark, 0.5)},
                    0px 0px 15px -2px ${alpha(theme.palette.primary.main, 0.6)}
                  `,
                },
              })}
            >
              Simular Melhor Opção para Meu Negócio
            </Button>
          </m.div>
        </Box>


      </Container>
    </Box>
  );
}
