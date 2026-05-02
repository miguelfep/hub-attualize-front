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

import { TermosUsoAppHero } from './termos-uso-app-hero';

// ----------------------------------------------------------------------

const EMPRESA = 'ATTUALIZE CONTÁBIL';
const EMPRESA_TELEFONE_EXIBICAO = '(41) 3068-1800';
const EMPRESA_TELEFONE_TEL = '+554130681800';
const EMPRESA_EMAIL = 'adm@attualizecontabil.com.br';
const DATA_ATUALIZACAO = '30 de abril de 2026';

// ----------------------------------------------------------------------

function SectionTitle({ children, sx }) {
  return (
    <Typography
      variant="h5"
      component="h2"
      sx={{ mt: { xs: 4, md: 5 }, mb: 2, fontWeight: 700, ...sx }}
    >
      {children}
    </Typography>
  );
}

function SubsectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" component="h3" sx={{ mt: 2.5, mb: 1, fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

function P({ children, sx }) {
  return (
    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 1.5, ...sx }}>
      {children}
    </Typography>
  );
}

function TermsNumberedBlock({ items }) {
  return (
    <Stack spacing={1.5} sx={{ my: 2 }}>
      {items.map(([num, body]) => (
        <Typography key={num} variant="body1" color="text.secondary" sx={{ display: 'flex', gap: 1 }}>
          <Box component="span" sx={{ flexShrink: 0, fontWeight: 600 }}>
            {num}
          </Box>
          <Box component="span" sx={{ flex: 1 }}>
            {body}
          </Box>
        </Typography>
      ))}
    </Stack>
  );
}

function TermsBulletBlock({ items }) {
  return (
    <Box component="ul" sx={{ pl: 2.5, my: 1, '& li': { mb: 0.75 } }}>
      {items.map((item, i) => (
        <Typography key={i} component="li" variant="body1" color="text.secondary">
          {item}
        </Typography>
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function TermosUsoAppView() {
  return (
    <>
      <TermosUsoAppHero dataAtualizacao={DATA_ATUALIZACAO} />

      <Container
        component={MotionViewport}
        maxWidth="md"
        sx={{
          py: { xs: 10, md: 15 },
          px: { xs: 2, sm: 3 },
          textAlign: { xs: 'left', md: 'unset' },
        }}
      >
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <SectionTitle sx={{ mt: 0 }}>1. Partes e definições</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '1.1.',
                <>
                  <strong>“Licenciante”</strong> — entidade responsável pelo software e pela operação do ecossistema
                  (<strong>{EMPRESA}</strong> / titular da marca e do backend), conforme contrato comercial ou políticas
                  divulgadas ao cliente.
                </>,
              ],
              [
                '1.2.',
                <>
                  <strong>“Usuário”</strong> ou <strong>“Você”</strong> — pessoa física autorizada a acessar o app em
                  nome de uma <strong>empresa cliente</strong> do escritório contábil (pessoa jurídica ou empresário
                  individual).
                </>,
              ],
              [
                '1.3.',
                <>
                  <strong>“App”</strong> — aplicativo móvel <strong>Hub Attualize</strong> para iOS e Android, que se
                  conecta aos serviços em <strong>api.attualizecontabil.com.br</strong> (ou URL substituta informada pelo
                  Licenciante).
                </>,
              ],
              [
                '1.4.',
                <>
                  <strong>“Conta”</strong> — credenciais e permissões associadas ao seu login no portal, vinculadas a
                  uma ou mais empresas cadastradas.
                </>,
              ],
            ]}
          />

          <SectionTitle>2. Aceitação da licença e dos termos</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '2.1.',
                <>
                  Ao <strong>instalar, abrir ou usar</strong> o App, você declara ter lido e concordado com esta licença
                  e com os termos aqui descritos.
                </>,
              ],
              ['2.2.', <>Se você <strong>não concordar</strong>, não utilize o App e desinstale-o.</>],
              [
                '2.3.',
                <>
                  O Licenciante pode <strong>atualizar</strong> este documento; a versão vigente deve estar disponível
                  no site ou no App. Uso continuado após aviso razoável pode significar aceitação da nova versão (ajuste
                  conforme orientação jurídica).
                </>,
              ],
            ]}
          />

          <SectionTitle>3. Natureza da licença</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '3.1.',
                <>
                  Concede-se ao Usuário uma licença{' '}
                  <strong>pessoal, intransferível, revogável, não exclusiva e limitada</strong> para usar o App{' '}
                  <strong>somente</strong> em dispositivos que você controla e <strong>estritamente</strong> no escopo
                  do relacionamento contratual entre sua empresa e o escritório ({EMPRESA} / Licenciante).
                </>,
              ],
              [
                '3.2.',
                <>
                  <strong>Não se vende</strong> o App: permanecem todos os direitos de propriedade intelectual (código,
                  marca, layout, textos do Licenciante).
                </>,
              ],
              [
                '3.3.',
                <>
                  É <strong>vedado</strong>: engenharia reversa (exceto quando permitido por lei imperativa), modificação
                  do App, redistribuição, locação, sublicenciamento comercial não autorizado, uso para concorrer de forma
                  ilícita com o serviço, ou uso que viole lei ou direitos de terceiros.
                </>,
              ],
            ]}
          />

          <SectionTitle>4. Conta, segurança e acesso</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '4.1.',
                <>
                  O acesso depende de <strong>credenciais válidas</strong> fornecidas pelo Licenciante ou pelo portal.
                  Você é responsável por <strong>manter sigilo</strong> de senhas e por atividades realizadas na sua
                  Conta.
                </>,
              ],
              [
                '4.2.',
                <>
                  O App pode armazenar <strong>token de sessão</strong> e dados mínimos de identificação em{' '}
                  <strong>armazenamento seguro do dispositivo</strong> (Keychain / Keystore), para manter o login.
                </>,
              ],
              [
                '4.3.',
                <>
                  <strong>Login biométrico</strong> (Face ID / impressão digital), quando disponível e ativado por você,
                  usa apenas os <strong>mecanismos do sistema operacional</strong> para desbloquear uma sessão já
                  existente; o App <strong>não substitui</strong> a política de segurança do fabricante do aparelho.
                </>,
              ],
              [
                '4.4.',
                <>
                  O Licenciante pode <strong>suspender ou encerrar</strong> o acesso em caso de suspeita de fraude,
                  inadimplência, violação destes termos ou fim do contrato com a empresa cliente.
                </>,
              ],
            ]}
          />

          <SectionTitle>5. Funcionalidades do App (descrição geral)</SectionTitle>
          <P>
            O App é um <strong>hub de relacionamento e self-service</strong> para clientes do escritório. O que aparece
            na interface pode variar conforme <strong>permissões e plano</strong> da empresa (configurações no
            backend). Em linhas gerais, o App pode incluir:
          </P>

          <SubsectionTitle>5.1. Início e visão geral</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Dashboard</strong> com indicadores financeiros (ex.: vendas, entradas/saídas quando houver
                extrato), gráficos e calendário fiscal, conforme dados disponibilizados pela API.
              </>,
            ]}
          />

          <SubsectionTitle>5.2. Documentos e obrigações</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Meus documentos</strong> / <strong>Guias e documentos</strong>: listagem, pastas, download ou
                abertura de arquivos e guias fiscais vinculados à empresa.
              </>,
              <>
                <strong>Licenças</strong>: consulta de licenças, validade e situação.
              </>,
              <>
                <strong>Dados da empresa</strong>: informações cadastrais (ex.: razão social, CNPJ, contatos,
                endereço, CNAEs, tributação, quadro societário), conforme retorno da API.
              </>,
            ]}
          />

          <SubsectionTitle>5.3. Comercial (quando habilitado)</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Clientes</strong>, <strong>Serviços</strong>, <strong>Vendas</strong> (orçamentos, status,
                integração com emissão de serviços/NFSe quando contratado).
              </>,
            ]}
          />

          <SubsectionTitle>5.4. Financeiro</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Meu plano</strong> e contratos com o escritório.
              </>,
              <>
                <strong>Faturamento</strong> / faturas e boletos.
              </>,
              <>
                <strong>Extratos bancários</strong>: upload, conciliação e validação de movimentações, quando a empresa
                possuir o módulo.
              </>,
            ]}
          />

          <SubsectionTitle>5.5. Departamento pessoal (quando habilitado)</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Funcionários</strong> e <strong>Apontamentos</strong> (folha, rubricas, lançamentos).
              </>,
            ]}
          />

          <SubsectionTitle>5.6. Programas e conta</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Indicações</strong> e <strong>Recompensas</strong> (programa de indicação / pontos, conforme
                regras do Licenciante).
              </>,
              <>
                <strong>Configurações</strong>: dados da conta, preferências de notificação,{' '}
                <strong>envio de certificado digital</strong> (.pfx, .p12, .cer, .crt até limite de tamanho definido no
                App), alteração de senha e dados de perfil quando disponível.
              </>,
            ]}
          />

          <SubsectionTitle>5.7. Notificações</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Notificações push</strong> (via serviço Expo / Apple / Google) e <strong>notificações
                locais</strong> para lembretes (ex.: faturas, boletos, guias), conforme permissões concedidas no
                sistema.
              </>,
            ]}
          />

          <SubsectionTitle>5.8. Outras telas</SubsectionTitle>
          <TermsBulletBlock
            items={[
              <>
                <strong>Notificações</strong> in-app, <strong>Conteúdos</strong> / <strong>Comunidade</strong> (quando
                existirem rotas ativas no build), <strong>Empresa</strong>, <strong>Guias</strong> em fluxos
                complementares ao menu principal.
              </>,
            ]}
          />

          <TermsNumberedBlock
            items={[
              [
                '5.9.',
                <>
                  Funcionalidades podem ser <strong>ativadas, limitadas ou descontinuadas</strong> sem aviso prévio
                  individual, desde que isso não conflite com contrato firmado com a empresa — ajuste conforme política
                  comercial real.
                </>,
              ],
            ]}
          />

          <SectionTitle>6. Permissões do dispositivo</SectionTitle>
          <P>
            Para operar conforme projetado, o App pode solicitar:
          </P>

          <TableContainer sx={{ my: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Permissão / recurso</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Finalidade típica no App</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Internet</strong></TableCell>
                  <TableCell>Comunicação com a API e serviços de notificação.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Biometria</strong> (Face ID / digital)</TableCell>
                  <TableCell>Atalho opcional para desbloquear sessão já autenticada.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Câmera</strong></TableCell>
                  <TableCell>
                    Captura de imagens para documentos ou fluxos que exijam escaneamento (conforme telas ativas).
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Notificações</strong></TableCell>
                  <TableCell>Alertas de guias, faturas, boletos e avisos operacionais.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Seleção de arquivos / documentos</strong></TableCell>
                  <TableCell>Upload de extratos, certificados e anexos permitidos pelo portal.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Armazenamento seguro</strong></TableCell>
                  <TableCell>Credenciais e preferências sensíveis.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <P>
            O Usuário pode <strong>revogar permissões</strong> nas configurações do sistema; isso pode{' '}
            <strong>impedir</strong> parte das funções.
          </P>

          <SectionTitle>7. Dados pessoais e privacidade</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '7.1.',
                <>
                  O tratamento de <strong>dados pessoais</strong> (do Usuário, de sócios, de funcionários ou de
                  terceiros inseridos no portal) deve observar a <strong>Lei nº 13.709/2018 (LGPD)</strong> e a{' '}
                  <strong>Política de Privacidade</strong> divulgada pelo Licenciante em{' '}
                  <Link component={NextLink} href="/" underline="hover">
                    attualize.com.br
                  </Link>
                  , ou mediante solicitação ao e-mail{' '}
                  <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
                    {EMPRESA_EMAIL}
                  </Link>
                  .
                </>,
              ],
              [
                '7.2.',
                <>
                  Em regra, o <strong>controlador</strong> dos dados da operação contábil é a{' '}
                  <strong>empresa cliente</strong> e/ou o <strong>escritório</strong>, conforme contrato e política; o
                  App é <strong>meio de acesso</strong> aos dados já existentes no sistema.
                </>,
              ],
              [
                '7.3.',
                <>
                  <strong>Tokens de push</strong> podem ser registrados no servidor para direcionar notificações e{' '}
                  <strong>removidos</strong> no logout, conforme implementação atual.
                </>,
              ],
              [
                '7.4.',
                <>
                  Encoraja-se política específica para: finalidades, bases legais, compartilhamentos, prazos de retenção,
                  direitos do titular e canal de contato do encarregado (DPO), quando aplicável.
                </>,
              ],
            ]}
          />

          <SectionTitle>8. Conteúdo, exatidão e limitação de responsabilidade</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '8.1.',
                <>
                  <strong>Informações exibidas</strong> dependem do cadastro e da integração com sistemas terceiros
                  (bancos, Receita, prefeituras etc.). O Licenciante emprega esforços razoáveis, mas <strong>não
                  garante</strong> ausência total de erros, atrasos ou indisponibilidade.
                </>,
              ],
              [
                '8.2.',
                <>
                  O App é fornecido <strong>“no estado em que se encontra”</strong> (“as is”), na medida permitida pela
                  lei aplicável.
                </>,
              ],
              [
                '8.3.',
                <>
                  <strong>Decisões de negócio, fiscal ou trabalhista</strong> continuam sendo da empresa cliente e de
                  seus consultores; o App é <strong>ferramenta de apoio</strong>, não substituto de parecer profissional
                  formal.
                </>,
              ],
              [
                '8.4.',
                <>
                  Na máxima extensão permitida em lei, ficam <strong>excluídas</strong> garantias implícitas e
                  responsabilidade por lucros cessantes, danos indiretos ou perda de dados causada por falha do
                  dispositivo, da rede ou de terceiros — <strong>ajuste</strong> com advogado (algumas exclusões não são
                  válidas para consumidor pessoa física).
                </>,
              ],
            ]}
          />

          <SectionTitle>9. Serviços de terceiros</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '9.1.',
                <>
                  O App pode depender de <strong>Apple</strong>, <strong>Google</strong>, <strong>Expo</strong>{' '}
                  (notificações push), provedores de nuvem e de <strong>API</strong> do Licenciante. O uso desses
                  serviços está sujeito às <strong>políticas e termos</strong> desses terceiros.
                </>,
              ],
              [
                '9.2.',
                <>
                  <strong>Criptografia:</strong> conforme declaração para as lojas (ex.:{' '}
                  <code>ITSAppUsesNonExemptEncryption</code> / conformidade de exportação), quando aplicável.
                </>,
              ],
            ]}
          />

          <SectionTitle>10. Atualizações do App</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '10.1.',
                <>
                  O Licenciante pode distribuir <strong>atualizações</strong> pelas lojas oficiais. Versões antigas
                  podem deixar de ser suportadas.
                </>,
              ],
            ]}
          />

          <SectionTitle>11. Rescisão</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '11.1.',
                <>
                  A licença <strong>cessa automaticamente</strong> ao encerrar o contrato de prestação de serviços, ao
                  revogar o acesso pela empresa ou pelo Licenciante, ou ao violar estes termos.
                </>,
              ],
              ['11.2.', <>Após rescisão, você deve <strong>cessar o uso</strong> e pode desinstalar o App.</>],
            ]}
          />

          <SectionTitle>12. Lei aplicável e foro</SectionTitle>
          <TermsNumberedBlock
            items={[
              [
                '12.1.',
                <>
                  Lei <strong>brasileira</strong>, em especial o Código de Defesa do Consumidor quando o Usuário for{' '}
                  <strong>consumidor</strong>.
                </>,
              ],
              [
                '12.2.',
                <>
                  <strong>Foro:</strong> comarca da Capital do Estado do Paraná — Curitiba/PR, sede do Licenciante,
                  salvo regra imperativa em favor do consumidor.
                </>,
              ],
            ]}
          />

          <SectionTitle>13. Contato</SectionTitle>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Para dúvidas sobre estes termos ou sobre privacidade, entre em contato com o Licenciante:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>{EMPRESA}</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Telefone:{' '}
              <Link href={`tel:${EMPRESA_TELEFONE_TEL}`} underline="hover">
                {EMPRESA_TELEFONE_EXIBICAO}
              </Link>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              E-mail:{' '}
              <Link href={`mailto:${EMPRESA_EMAIL}`} underline="hover">
                {EMPRESA_EMAIL}
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formulário no site:{' '}
              <Link component={NextLink} href={paths.contact} underline="hover">
                Fale conosco
              </Link>
            </Typography>
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Documento da {EMPRESA} referente ao aplicativo móvel Hub Attualize (integração com api.attualizecontabil.com.br
            e demais serviços do ecossistema).
          </Typography>
        </Box>
      </Container>
    </>
  );
}
