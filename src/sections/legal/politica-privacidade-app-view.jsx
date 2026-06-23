'use client';

import NextLink from 'next/link';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';

import { MotionViewport } from 'src/components/animate';

import { PoliticaPrivacidadeAppHero } from './politica-privacidade-app-hero';

// ----------------------------------------------------------------------

const EMPRESA = 'ATTUALIZE CONTÁBIL';
const EMPRESA_TELEFONE_EXIBICAO = '(41) 3068-1800';
const EMPRESA_TELEFONE_TEL = '+554130681800';
const EMPRESA_EMAIL = 'adm@attualizecontabil.com.br';
const DATA_ATUALIZACAO = '30 de abril de 2026';

const SITE_PUBLICO = 'https://www.attualize.com.br';

const LEGAL = {
  header: '#374151',
  emphasis: '#111827',
  body: '#4B5563',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  borderMuted: '#E5E5E5',
  footer: '#6B7280',
};

const tableContainerSx = {
  border: `1px solid ${LEGAL.border}`,
  borderRadius: 2,
  boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
};

const legalLinkSx = {
  color: LEGAL.header,
  '&:hover': { color: LEGAL.emphasis },
};

// ----------------------------------------------------------------------

function SectionTitle({ children, sx }) {
  return (
    <Typography
      variant="h5"
      component="h2"
      sx={{ mt: { xs: 4, md: 5 }, mb: 2, fontWeight: 700, color: LEGAL.emphasis, ...sx }}
    >
      {children}
    </Typography>
  );
}

function P({ children, sx }) {
  return (
    <Typography
      variant="body1"
      paragraph
      sx={{ mb: 1.5, color: LEGAL.body, '& strong': { color: LEGAL.emphasis }, ...sx }}
    >
      {children}
    </Typography>
  );
}

function TermsNumberedBlock({ items }) {
  return (
    <Stack spacing={1.5} sx={{ my: 2 }}>
      {items.map(([num, body]) => (
        <Typography key={num} variant="body1" sx={{ display: 'flex', gap: 1, color: LEGAL.body }}>
          <Box component="span" sx={{ flexShrink: 0, fontWeight: 600, color: LEGAL.emphasis }}>
            {num}
          </Box>
          <Box component="span" sx={{ flex: 1, '& strong': { color: LEGAL.emphasis } }}>
            {body}
          </Box>
        </Typography>
      ))}
    </Stack>
  );
}

function TermsBulletBlock({ items }) {
  return (
    <Box component="ul" sx={{ pl: 2.5, my: 2, '& li': { mb: 0.75 } }}>
      {items.map((item, i) => (
        <Typography
          key={i}
          component="li"
          variant="body1"
          sx={{ color: LEGAL.body, fontSize: '0.9375rem', '& strong': { color: LEGAL.emphasis } }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );
}


// ----------------------------------------------------------------------

export function PoliticaPrivacidadeAppView() {
  return (
    <>
      <PoliticaPrivacidadeAppHero dataAtualizacao={DATA_ATUALIZACAO} />

      <Container
        component={MotionViewport}
        maxWidth="md"
        sx={{
          py: { xs: 10, md: 15 },
          px: { xs: 2, sm: 3 },
          textAlign: { xs: 'left', md: 'unset' },
        }}
      >
        <Box sx={{ maxWidth: 720, mx: 'auto', '& a': legalLinkSx }}>
          <P sx={{ mt: 0 }}>
            Esta Política de Privacidade descreve como o aplicativo móvel <strong>Hub Attualize</strong> e os serviços
            por ele acessados tratam dados pessoais, em conformidade com a Lei nº 13.709/2018 (LGPD) e com as exigências
            das lojas de aplicativos (Google Play e Apple App Store). Ao usar o App, você reconhece ter lido esta
            política.
          </P>

          <SectionTitle sx={{ mt: 0 }}>1. Controlador, operador e encarregado</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '1.1.',
                <>
                  <strong>Controlador</strong> dos dados tratados no ecossistema Attualize é a{' '}
                  <strong>{EMPRESA}</strong>, com sede em Curitiba/PR, Brasil. Em relação a dados de empresas clientes do
                  escritório e de seus representantes, em regra a empresa cliente e o escritório definem papéis conforme
                  contrato; o App é meio de acesso aos dados já existentes no sistema.
                </>,
              ],
              [
                '1.2.',
                <>
                  O App comunica-se com os servidores em <strong>api.attualizecontabil.com.br</strong> (ou URL
                  substituta informada pela {EMPRESA}).
                </>,
              ],
              [
                '1.3.',
                <>
                  Para exercício dos direitos previstos na LGPD ou dúvidas sobre privacidade, incluindo contato com o{' '}
                  <strong>encarregado de dados (DPO)</strong>, utilize o e-mail{' '}
                  <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
                    {EMPRESA_EMAIL}
                  </Link>
                  . Responderemos no prazo legal aplicável.
                </>,
              ],
            ]}
          />

          <SectionTitle>2. Quais dados coletamos</SectionTitle>
          <P>
            O Hub Attualize <strong>não funciona sem cadastro</strong>: é necessário login para acessar o portal do
            cliente. Os dados abaixo podem ser tratados conforme as funcionalidades habilitadas para sua empresa.
          </P>

          <TableContainer sx={tableContainerSx}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ borderBottom: `1px solid ${LEGAL.borderMuted}` }}>
                  <TableCell sx={{ fontWeight: 800, py: 1.5, color: LEGAL.header }}>Categoria</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5, color: LEGAL.header }}>Exemplos</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5, color: LEGAL.header }}>Como é obtido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { cat: "Conta e identificação", ex: "Nome, e-mail, telefone, CPF/CNPJ do usuário autorizado", font: "Cadastro e uso do App" },
                  { cat: "Autenticação", ex: "Token de sessão, preferências de “manter conectado”", font: "Armazenamento seguro (Keychain/Keystore); API" },
                  { cat: "Notificações push", ex: "Token de push (Expo / FCM / APNs)", font: "Registrado no servidor após permissão" },
                  { cat: "Dados da empresa cliente", ex: "Razão social, CNPJ, endereço, CNAEs, tributação, sócios", font: "Portal/API" },
                  { cat: "Financeiro e fiscal", ex: "Faturas, boletos, extratos, movimentações", font: "Visualização ou upload autorizado" },
                  { cat: "Departamento pessoal", ex: "Dados de funcionários e folha", font: "Cadastro pela empresa autorizada" },
                  { cat: "Certificado digital", ex: "Arquivos .pfx, .p12, .cer, .crt", font: "Upload voluntário pelo usuário" },
                  { cat: "Dispositivo e conexão", ex: "Modelo do aparelho, SO, endereço IP", font: "Gerado automaticamente ao usar o App" },
                  { cat: "Câmera e arquivos", ex: "Imagens ou documentos capturados/selecionados", font: "Somente via ação manual do usuário" },
                ].map((row, index, array) => (
                  <TableRow
                    key={index}
                    sx={{
                      '& td': {
                        borderBottom:
                          index === array.length - 1 ? 'none' : `1px dashed ${LEGAL.borderMuted}`,
                        py: 2,
                      },
                      ...(index % 2 === 0 && { backgroundColor: LEGAL.surface }),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: LEGAL.emphasis, width: '25%' }}>
                      {row.cat}
                    </TableCell>
                    <TableCell sx={{ color: LEGAL.body, fontSize: '0.825rem' }}>{row.ex}</TableCell>
                    <TableCell sx={{ color: LEGAL.body, fontSize: '0.825rem' }}>{row.font}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              my: 3,
              p: 2,
              backgroundColor: LEGAL.surface,
              borderRadius: 2,
              border: `1px solid ${LEGAL.border}`,
              borderLeft: `4px solid ${LEGAL.header}`,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: LEGAL.body, '& strong': { color: LEGAL.emphasis } }}
            >
              💡 <strong>Aviso de Privacidade:</strong> O App{' '}
              <strong>não coleta localização precisa em tempo real</strong> para fins de rastreamento; não utilizamos GPS
              para perfilar usuários.
            </Typography>
          </Box>

          <SectionTitle>3. Como coletamos os dados</SectionTitle>

          <TermsBulletBlock
            items={[
              <>
                <strong>Fornecidos por você:</strong> cadastro, envio de documentos, preenchimento de formulários no App.
              </>,
              <>
                <strong>Automáticos:</strong> dados técnicos necessários para autenticação, segurança, registro de token
                de push e registro de acesso à API (ex.: IP em tráfego HTTPS).
              </>,
              <>
                <strong>Biometria:</strong> Face ID ou impressão digital, quando ativados, usam apenas os mecanismos do
                sistema operacional para desbloquear sessão já autenticada; não armazenamos sua biometria em nossos
                servidores.
              </>,
            ]}
          />

          <SectionTitle>4. Finalidades e bases legais (LGPD)</SectionTitle>
          <P>Tratamos dados pessoais para as finalidades abaixo, com respaldo nas bases legais indicadas:</P>

          <TableContainer sx={{ ...tableContainerSx, my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ borderBottom: `1px solid ${LEGAL.borderMuted}` }}>
                  <TableCell sx={{ fontWeight: 800, py: 1.5, color: LEGAL.header }}>Finalidade</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5, color: LEGAL.header }}>
                    Base legal (art. 7º LGPD)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { fin: "Prestação dos serviços contratados e acesso ao portal do cliente", base: "Execução de contrato ou procedimentos preliminares" },
                  { fin: "Cumprimento de obrigações legais e regulatórias (ex.: contábil, fiscal)", base: "Obrigação legal ou regulatória" },
                  { fin: "Segurança da informação, prevenção a fraudes e suporte", base: "Legítimo interesse, observados seus direitos" },
                  { fin: "Envio de notificações operacionais (guias, boletos, avisos)", base: "Execução de contrato ou consentimento quando exigido" },
                  { fin: "Melhorias do serviço e métricas agregadas", base: "Legítimo interesse ou consentimento, conforme o caso" },
                ].map((row, index, array) => (
                  <TableRow
                    key={index}
                    sx={{
                      '& td': {
                        borderBottom:
                          index === array.length - 1 ? 'none' : `1px dashed ${LEGAL.borderMuted}`,
                        py: 2,
                      },
                      ...(index % 2 === 0 && { backgroundColor: LEGAL.surface }),
                    }}
                  >
                    <TableCell sx={{ color: LEGAL.emphasis, fontWeight: 500, width: '50%' }}>
                      {row.fin}
                    </TableCell>
                    <TableCell sx={{ color: LEGAL.body, fontSize: '0.825rem' }}>{row.base}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle>5. Compartilhamento com terceiros</SectionTitle>
          <P>
            Não vendemos dados pessoais. Podemos compartilhar dados com prestadores necessários ao funcionamento do App,
            sempre sob obrigações contratuais de confidencialidade e segurança, incluindo:
          </P>

          <TermsBulletBlock
            items={[
              <>
                <strong>Google</strong> (Firebase Cloud Messaging / serviços Android) —{' '}
                <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" underline="hover">
                  Política de Privacidade do Google
                </Link>
              </>,
              <>
                <strong>Apple</strong> (serviços de notificação em iOS, quando aplicável)
              </>,
              <>
                <strong>Expo</strong> e provedores de infraestrutura utilizados na distribuição e notificações do app
              </>,
              <>
                <strong>Hospedagem e nuvem</strong> onde rodam os servidores da {EMPRESA}
              </>,
              <>
                <strong>Autoridades públicas</strong>, quando houver determinação legal ou regulatória.
              </>,
            ]}
          />

          <SectionTitle>6. Transferência internacional</SectionTitle>
          <P>
            Alguns provedores (ex.: Google, Apple, infraestrutura em nuvem) podem processar dados em servidores fora do
            Brasil. Nesses casos, adotamos medidas compatíveis com a LGPD, incluindo cláusulas contratuais e escolha de
            fornecedores com padrões reconhecidos de proteção.
          </P>

          <SectionTitle>7. Retenção</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '7.1.',
                <>
                  Mantemos os dados pelo tempo necessário para cumprir as finalidades desta política, obrigações legais e
                  prazos prescricionais aplicáveis ao relacionamento contábil e fiscal.
                </>,
              ],
              [
                '7.2.',
                <>
                  Tokens de sessão no dispositivo podem ser removidos ao sair da conta ou desinstalar o App. Tokens de
                  push podem ser invalidados no servidor ao revogar permissões ou encerrar o uso.
                </>,
              ],
            ]}
          />

          <SectionTitle>8. Segurança</SectionTitle>
          <TermsBulletBlock
            items={[
              <strong>Comunicação com a API por HTTPS (TLS).</strong>,
              <>
                <strong>Credenciais sensíveis</strong> em armazenamento seguro do sistema operacional quando aplicável.
              </>,
              <strong>Controles de acesso e autenticação no backend.</strong>,
              <>
                <strong>Nenhum método é 100% invulnerável;</strong> recomendamos senhas fortes e dispositivos
                atualizados.
              </>,
            ]}
          />

          <SectionTitle>9. Seus direitos (LGPD — art. 18)</SectionTitle>
          <P>Você pode solicitar, conforme a lei:</P>
          <TermsBulletBlock
            items={[
              'Confirmação de tratamento e acesso aos dados;',
              'Correção de dados incompletos, inexatos ou desatualizados;',
              'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;',
              'Portabilidade, quando aplicável;',
              'Eliminação dos dados tratados com consentimento, quando couber;',
              'Informação sobre compartilhamentos e sobre a possibilidade de não fornecer consentimento;',
              'Revogação do consentimento, quando o tratamento se basear nele.',
            ]}
          />
          <P>
            Para exercer seus direitos, envie pedido para{' '}
            <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
              {EMPRESA_EMAIL}
            </Link>
            , indicando nome completo, forma de contato e descrição do pedido. Podemos solicitar informações para
            confirmar sua identidade antes de atender.
          </P>
          <P>
            Você também pode registrar reclamação junto à{' '}
            <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>, conforme regulamentação vigente. Site
            oficial:{' '}
            <Link href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer" underline="hover">
              gov.br/anpd
            </Link>
            .
          </P>

          <SectionTitle>10. Exclusão de dados e conta</SectionTitle>
          <P>
            Você pode solicitar a exclusão de dados pessoais tratados pelo App/portal, observados os prazos legais de
            guarda de documentos contábeis e fiscais que possam impedir a eliminação total imediata. Para solicitar,
            escreva para{' '}
            <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
              {EMPRESA_EMAIL}
            </Link>
            . Também pode cessar o tratamento no dispositivo desinstalando o aplicativo; dados já enviados aos servidores
            seguem as regras desta política e da lei.
          </P>

          <SectionTitle>11. Crianças e adolescentes</SectionTitle>
          <P>
            O Hub Attualize é destinado a representantes de empresas clientes e não é direcionado a menores de 18 anos.
            Não coletamos intencionalmente dados de menores. Se tomarmos conhecimento de cadastro indevido, tomaremos
            medidas para remover as informações conforme a lei.
          </P>

          <SectionTitle>12. Alterações desta política</SectionTitle>
          <P>
            Podemos atualizar esta página para refletir mudanças no App, na legislação ou nas práticas de tratamento. A
            data da última versão aparece no topo deste documento. Recomendamos revisão periódica. O uso continuado do App
            após a publicação da nova versão pode significar ciência das alterações, sem prejuízo dos seus direitos na LGPD.
          </P>

          <SectionTitle>13. Documentos relacionados</SectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <Link component={NextLink} href={paths.termosDeUsoApp} underline="hover">
                  Termos de uso e licença do aplicativo Hub Attualize
                </Link>
                {' '}no site{' '}
                <Link component={NextLink} href="/" underline="hover">
                  {SITE_PUBLICO.replace('https://', '')}
                </Link>
              </>,
            ]}
          />

          <SectionTitle>14. Contato</SectionTitle>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ color: LEGAL.body }}>
              Em caso de dúvidas sobre privacidade ou tratamento de dados:
            </Typography>
            <Typography variant="body1" sx={{ color: LEGAL.emphasis, '& strong': { color: 'primary.main' } }}>
              <Box component="span" sx={{ color: 'primary.main' }}>{EMPRESA}</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: LEGAL.body }}>
              Telefone:{' '}
              <Link href={`tel:${EMPRESA_TELEFONE_TEL}`} underline="hover">
                {EMPRESA_TELEFONE_EXIBICAO}
              </Link>
            </Typography>
            <Typography variant="body1" sx={{ color: LEGAL.body }}>
              E-mail:{' '}
              <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
                {EMPRESA_EMAIL}
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ color: LEGAL.body }}>
              Formulário no site:{' '}
              <Link component={NextLink} href={paths.contact} underline="hover">
                Fale conosco
              </Link>
            </Typography>
          </Stack>

          <Divider sx={{ my: 4, borderColor: LEGAL.borderMuted }} />

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: LEGAL.footer }}>
            Documento da {EMPRESA} referente ao aplicativo móvel Hub Attualize (integração com api.attualizecontabil.com.br
            e demais serviços do ecossistema).
          </Typography>
        </Box>
      </Container >
    </>
  );
}
