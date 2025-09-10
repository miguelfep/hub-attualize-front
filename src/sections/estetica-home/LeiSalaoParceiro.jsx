import React from 'react';

import { Box, Stack, Button, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function LeiSalaoParceiro() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'primary.main',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Lei do Salão Parceiro
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Entenda como a Lei nº 13.352/2016 beneficia seu negócio de estética
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Benefícios da Lei Salão Parceiro
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              A tributação para espaços de estética é diferenciada e tem um tratamento bem especial,
              por conta da lei salão parceiro. Se você tem parceiros que se enquadram na lei salão parceiro,
              você terá esse benefício e poderá deduzir as comissões pagas aos seus parceiros da sua base
              de cálculo para fins de apuração.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Funciona assim: O espaço de estética enquadrado como salão parceiro deduz do seu faturamento
              todos os valores repassados aos profissionais parceiros que trabalham por meio da parceria.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Como Funciona a Tributação
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              A sua estética recebe o pagamento dos serviços prestados dentro do seu espaço, faz o rateio
              para o profissional e o que você como salão parceiro repassar para ele, não será somado em
              seu faturamento para fins de tributação.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Dessa forma o proprietário do espaço de estética só será tributado por sua cota parte, ou
              seja, o que realmente fica para a empresa.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Quem Pode Usar a Lei do Salão-Parceiro?
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Existem regras e pré-requisitos para aplicar a lei em seu estabelecimento. A regularização
              dos profissionais parceiros é mais que importante, é obrigatória.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Na redação da lei salão parceiro, fica muito claro que o estabelecimento só poderá manter
              uma relação de parceria com profissionais que estejam ativos e regulares perante os órgãos
              públicos competentes.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Além disso, os funcionários CLT não estão inclusos. Os cabeleireiros, manicures, esteticistas,
              maquiadores, barbeiros, pedicures, etc. que trabalharem em conformidade com a lei salão parceiro
              devem estar enquadrados nas regras do profissional parceiro e com o contrato de parceria
              registrados corretamente.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Quem Pode Aderir à Lei
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Podem aderir à Lei do Salão Parceiro todos os estabelecimentos do ramo de beleza e estética
              que desejam formalizar parcerias com profissionais autônomos. Isso inclui salões de beleza,
              clínicas de estética, barbearias, espaços de manicure e pedicure, entre outros.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Os profissionais parceiros devem estar devidamente regularizados como MEI ou Microempresa
              e precisam comprovar sua situação regular perante a Receita Federal e outros órgãos competentes.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Regras para Repasse de Valores
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              O repasse de valores aos profissionais parceiros deve ser feito mediante comprovação
              através de nota fiscal ou recibo de prestação de serviços. Todos os valores repassados
              devem constar em contrato formal entre as partes, especificando percentuais, valores fixos
              ou a combinação de ambos.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              É fundamental que os repasses sejam realizados de forma transparente e estejam devidamente
              documentados para fins de comprovação perante os órgãos fiscais, assegurando o direito à
              dedução desses valores da base de cálculo dos impostos.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Modelo de Contrato Necessário
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              O contrato de parceria deve ser elaborado com clareza, contendo todas as cláusulas necessárias
              para formalizar a relação entre o estabelecimento e o profissional parceiro. Deve incluir
              identificação completa das partes, objeto do contrato, valores e forma de repasse,
              responsabilidades de cada parte, prazo de vigência e condições de rescisão.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Recomenda-se que o contrato seja registrado em cartório para maior segurança jurídica,
              embora a lei não exija expressamente esse registro. O documento deve estar em conformidade
              com as normas trabalhistas e fiscais vigentes, evitando qualquer caracterização de vínculo
              empregatício.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Responsabilidades do Parceiro x Salão
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              O salão é responsável por fornecer a infraestrutura necessária para a prestação dos serviços,
              incluindo espaço físico, equipamentos básicos e utilities, além de organizar a agenda e
              promover o marketing dos serviços. Cabe também ao estabelecimento a emissão das notas fiscais
              aos clientes e o repasse transparente dos valores combinados.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Já o profissional parceiro é responsável por sua própria regularização fiscal, pelo
              fornecimento de materiais específicos de trabalho, pelo cumprimento dos horários estabelecidos
              e pela qualidade dos serviços prestados. Além disso, deve manter seus equipamentos pessoais
              em ordem e seguir as normas e padrões de qualidade do estabelecimento.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              Riscos Comuns e Como Evitá-los
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Um dos principais riscos é a caracterização indevida de vínculo empregatício pela fiscalização
              trabalhista. Para evitar isso, é essencial que não haja subordinação, fixação de horário
              rígido, obrigatoriedade de frequência ou qualquer outro elemento típico de relação de emprego.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Outro risco comum é a irregularidade fiscal dos profissionais parceiros. Para mitigar esse
              risco, exija sempre a comprovação de regularidade fiscal atualizada e verifique periodicamente
              a situação cadastral dos parceiros perante a Receita Federal.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              Problemas com a documentação dos repasses também são frequentes. Mantenha um controle rigoroso
              de todas as movimentações financeiras, com documentos comprobatórios organizados e à disposição
              para eventual fiscalização. A transparência e a documentação adequada são as melhores proteções
              contra autuações fiscais.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 3 }}>
              MEI x Microempresa (ME)
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 2 }}>
              Os seus profissionais podem atuar com o MEI ou com uma Microempresa enquadrada no Simples
              Nacional, isso vai depender do faturamento de cada um e também de algumas especificações
              individuais a serem analisadas.
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 1 }}>
                • <strong>MEI</strong>: podem faturar até R$ 81.000/ano e podem contratar até 1 auxiliar
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                • <strong>Microempresa (ME)</strong>: limite de até R$ 360.000/ano e não tem limite de contratação de auxiliares
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', pt: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<Iconify icon="mdi:message-text" />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Quero entender meu enquadramento
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
