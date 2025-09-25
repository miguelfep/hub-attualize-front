import React from 'react';

import { Box, Card, Grid, Stack, Button, Divider, Container, Typography , CardHeader, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function LeiSalaoParceiro() {
  const responsabilidadesProfissional = [
    'Realizar os serviços com qualidade e técnica',
    'Fornecer seus próprios materiais e equipamentos',
    'Emitir nota fiscal de sua cota-parte para o salão',
    'Cumprir com a agenda e horários estabelecidos',
  ];

  const responsabilidadesSalao = [
    'Fornecer espaço físico e infraestrutura básica',
    'Organizar a agenda e promover os serviços',
    'Emissão de nota fiscal ao cliente final',
    'Repassar corretamente os valores aos parceiros',
  ];

  const modeloContrato = [
    'Identificação completa das partes',
    'Objeto (serviços prestados)',
    'Percentuais ou valores de repasse',
    'Responsabilidades de cada parte',
    'Prazo e condições de rescisão'
  ];

  const regrasRepasseValor = [
    'Todo repasse deve ser documentado por nota fiscal ou recibo.',
    'O contrato deve especificar claramente percentuais e formas de repasse.',
    'A transparência é essencial para evitar problemas fiscais.'
  ];

  const podemAderir = [
    'Clínicas de estética',
    'Salões de beleza',
    'Barbearias',
    'Espaços de manicure, pedicure e maquiagem'
  ];

  const riscosComuns = [
    {
      titulo: 'Caracterização de vínculo empregatício',
      descricao: 'Evite subordinação direta, horários rígidos ou controle excessivo.',
    },
    {
      titulo: 'Profissionais irregulares',
      descricao: 'Exija certidão de regularidade fiscal e acompanhe periodicamente.',
    },
    {
      titulo: 'Falta de documentação de repasses',
      descricao: 'Guarde recibos, notas e contratos organizados para fiscalização.',
    },
  ];

  const comparativoEmpresas = [
    {
      titulo: 'MEI',
      caracteristicas: [ 'Faturamento até R$ 81.000/ano', 'Pode contratar até 1 auxiliar', 'Simples e barato de manter' ],
    },
    {
      titulo: 'Microempresa (ME)',
      caracteristicas: [ 'Faturamento até R$ 360.000/ano', 'Pode ter mais auxiliares CLT', 'Mais flexível e robusta para crescimento' ],
    },
  ];

  const pontosResumo = [
    'Garante economia tributária para o salão.',
    'Dá autonomia jurídica e fiscal para os profissionais.',
    'Reduz riscos de vínculo trabalhista indevido.',
    'Exige organização de contratos e repasses.',
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" sx={{ color: 'primary.main', mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Lei do Salão Parceiro
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Entenda como a Lei nº 13.352/2016 pode transformar o seu negócio de estética!
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Benefícios Principais
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              A Lei do Salão Parceiro trouxe um modelo tributário e jurídico diferenciado para salões, clínicas de estética, barbearias e espaços de beleza. O maior benefício é que o <strong>salão parceiro só paga imposto sobre a sua parte</strong> — e não sobre todo o valor recebido dos clientes.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Isso significa que as comissões pagas aos profissionais parceiros são deduzidas do faturamento antes da apuração de impostos.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Como Funciona a Tributação
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              A sua estética recebe o pagamento dos serviços prestados dentro do seu espaço, faz o rateio para o profissional e o que você como salão parceiro repassar para ele, não será somado em seu faturamento para fins de tributação.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Dessa forma, o proprietário do espaço de estética só será tributado por sua cota parte, ou seja, o que realmente fica para a empresa.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              1° O cliente paga o valor integral do serviço no salão/clínica. <br />
              2° O estabelecimento emite a nota fiscal ao cliente. <br />
              3° O valor é repartido: uma parte vai para o profissional parceiro, outra fica para o salão.<br />
              4° <b>Somente a parte que fica para o salão é tributada.</b>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 'bold', mb: 1 }}>
              Exemplo:
            </Typography>
            <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Corte de cabelo: R$ 120,00
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Profissional recebe: R$ 72,00 (60%)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Salão fica com: R$ 48,00 (40%)
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  • Tributos incidem <b>apenas sobre R$ 48,00</b>
                </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Quem Pode Aderir à Lei
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Podem usar a Lei do Salão Parceiro todos os <b>estabelecimentos do ramo de beleza e estética</b>, como:
            </Typography>
            {podemAderir.map((text) => (
              <Typography key={text} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                {`• ${text}`}
              </Typography>
            ))}
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mt: 2 }}>
              Os <b>profissionais parceiros</b> precisam estar <b>regularizados</b> como <b>MEI</b> ou <b>Microempresa (ME).</b>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Regras para Repasse de Valores
            </Typography>
            {regrasRepasseValor.map((text) => (
              <Typography key={text} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                {`• ${text}`}
              </Typography>
            ))}
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Modelo de Contrato de Parceria
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
              O contrato deve incluir:
            </Typography>
            {modeloContrato.map((text) => (
              <Typography key={text} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                {`• ${text}`}
              </Typography>
            ))}
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Responsabilidades de Cada Parte
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 3, sm: 4 }}
              divider={<Divider orientation="vertical" flexItem />}
              sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack sx={{ width: '100%' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Do <strong>Salão Parceiro</strong>:
                </Typography>
                {responsabilidadesSalao.map((text) => (
                  <Typography key={text} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                    {`• ${text}`}
                  </Typography>
                ))}
              </Stack>
              <Stack sx={{ width: '100%' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Do <strong>Profissional Parceiro</strong>:
                </Typography>
                {responsabilidadesProfissional.map((text) => (
                  <Typography key={text} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                    {`• ${text}`}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Riscos Comuns e Como Evitá-los
            </Typography>
            <Stack spacing={2}>
              {riscosComuns.map((risco, index) => (
                <Box key={risco.titulo}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {`${index + 1}° `}<b>{risco.titulo}</b>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, pl: 1 }}>{`• ${risco.descricao}`}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 4, textAlign: 'center' }}>
              MEI ou ME: qual é melhor para o profissional parceiro?
            </Typography>
            <Grid container spacing={4} alignItems="stretch">
              {comparativoEmpresas.map((empresa) => (
                <Grid item xs={12} md={6} key={empresa.titulo}>
                  <Card sx={{ height: '100%',  }}>
                    <CardHeader title={empresa.titulo} titleTypographyProps={{ variant: 'h4', align: 'center' }} sx={{ bgcolor: 'action.hover' }}/>
                    <Divider />
                    <CardContent>
                      {empresa.caracteristicas.map((texto) => (
                        <Typography key={texto} variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>{`• ${texto}`}</Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ bgcolor: 'action.hover', p: { xs: 3, md: 5 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h3" align="center" gutterBottom>Resumindo</Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 3 }}>A Lei do Salão Parceiro:</Typography>
            <Box sx={{ maxWidth: 'md', mx: 'auto', mb: 4 }}>
              {pontosResumo.map((ponto) => (
                 <Typography key={ponto} variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                  {`• ${ponto}`}
                </Typography>
              ))}
            </Box>
            <Divider variant="middle" />
            <Typography variant="h6" align="center" sx={{ color: 'text.primary', mt: 4, lineHeight: 1.7 }}>
              Com <b>apoio contábil especializado</b>, sua clínica ou salão pode aplicar essa lei corretamente, economizar e <b>crescer com segurança</b>.
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 2 }}>
            <Button variant="contained" size="large" endIcon={<Iconify icon="mdi:message-text" />} sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 600, fontSize: '1.1rem' }}>
              Quero entender meu enquadramento
            </Button>
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}
