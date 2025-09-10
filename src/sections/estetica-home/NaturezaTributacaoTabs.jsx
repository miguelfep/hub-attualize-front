import React, { useState } from 'react';

import { Box, Tab, Tabs, Stack, Paper, Button, Container, Typography  } from '@mui/material';

import { Iconify } from 'src/components/iconify';

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
                  O Empresário Individual é a forma mais simples de formalizar um negócio. Neste modelo,
                  não há separação entre os bens pessoais e os da empresa, o que significa que o patrimônio
                  do empresário responde pelas dívidas do negócio. É uma opção interessante para negócios
                  de menor risco e para profissionais que estão iniciando suas atividades.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Sociedade Limitada Unipessoal (SLU)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A SLU foi introduzida no ordenamento jurídico brasileiro em 2019 e permite que uma única
                  pessoa constitua uma sociedade limitada. A grande vantagem é a separação entre o patrimônio
                  pessoal e o patrimônio da empresa, limitando a responsabilidade do sócio ao capital social
                  investido.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Essa forma jurídica combina a simplicidade do EI com a proteção patrimonial da LTDA,
                  sendo excelente para profissionais que desejam maior segurança jurídica.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  LTDA com Sócios
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A sociedade limitada tradicional com dois ou mais sócios permite a divisão de capital
                  e responsabilidades. Cada sócio responde apenas pelo valor de sua quota, mas todos
                  respondem solidariamente pela integralização do capital social.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Este modelo é ideal quando há mais de um investidor ou quando se planeja expandir
                  o negócio com a entrada de novos sócios no futuro.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Diferenças de Responsabilidade
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  A principal diferença entre as naturezas jurídicas está no nível de responsabilidade
                  do proprietário perante as obrigações da empresa. Enquanto no EI há responsabilidade
                  ilimitada, na SLU e LTDA a responsabilidade é limitada ao capital social.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Essa distinção é crucial para a proteção do patrimônio pessoal em caso de passivos
                  trabalhistas, tributários ou contratuais.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Flexibilidade Societária e Percepção no Mercado
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  A escolha da natureza jurídica também impacta na percepção do mercado. Empresas LTDA
                  geralmente transmitem maior seriedade e estrutura para clientes e fornecedores. Além
                  disso, a LTDA oferece mais flexibilidade para entrada e saída de sócios, sucessão
                  empresarial e planos de expansão.
                </Typography>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  MEI: Limitações e Quando Faz Sentido
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  O Microempreendedor Individual (MEI) é ideal para profissionais que faturam até
                  R$ 81 mil por ano e não pretendem expandir significativamente. As principais limitações
                  incluem a restrição de ter apenas um funcionário e o teto de faturamento relativamente baixo.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  Faz sentido optar pelo MEI quando se está iniciando no mercado, com baixo risco
                  operacional e expectativa de faturamento moderado. A simplicidade burocrática e
                  os custos reduzidos são suas principais vantagens.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Simples Nacional: Anexos III e V
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
                  Clínicas de estética geralmente se enquadram no Anexo III (comércio) ou Anexo V (serviços)
                  do Simples Nacional. A definição do anexo correto depende da preponderância das atividades
                  desenvolvidas.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  O Anexo III tem alíquotas que variam de 6% a 33% e se aplica quando há venda predominante
                  de produtos. Já o Anexo V, com alíquotas entre 15,5% e 30,5%, é para prestadores de serviços
                  em geral.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" sx={{ color: 'text.primary', mb: 2 }}>
                  Impacto do Fator R
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  O Fator R é um cálculo que determina se a empresa se enquadra no Anexo III ou V do Simples
                  Nacional. Ele compara a folha de pagamento (incluindo pró-labore) com o faturamento bruto
                  dos últimos 12 meses. Se a relação for igual ou superior a 28%, a empresa pode optar pelo
                  Anexo III, que geralmente tem alíquotas menores para empresas de serviços.
                </Typography>
              </Box>

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
          <Button
            variant="contained"
            size="large"
            endIcon={<Iconify icon="mdi:calculator" />}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 4,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            Simular Melhor Opção para Meu Negócio
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
