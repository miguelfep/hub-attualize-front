import { timelineItemClasses } from '@mui/lab/TimelineItem';
import {
  Timeline,
  TimelineDot,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineConnector,
} from '@mui/lab';
import {
  Box,
  List,
  Chip,
  Paper,
  Stack,
  Button,
  ListItem,
  Container,
  Typography,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const handleContatoWhatsapp = () => {
  try {
    const message = encodeURIComponent('Olá, vim pelo site da Attualize (página de estética) e quero agendar uma análise da minha clínica!');
    const whatsappUrl = `https://wa.me/5541996982267?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Erro ao abrir o WhatsApp:', error);
  }
};

const formatarTexto = (text) => {
  if (!text) return '';
  const parts = text.split('**');
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
  );
};

const benefits = [
  {
    icon: '🎯',
    title: 'Se seu CNAE está correto',
    description: 'Alinhamos sua atividade e às normas vigentes do seu nicho.',
  },
  {
    icon: '⚖️',
    title: 'Se você está no regime ideal',
    description: 'Analisamos o enquadramento legal que garante a melhor eficiência financeira para o seu negócio.',
  },
  {
    icon: '💸',
    title: 'Se pode reduzir sua carga tributária',
    description: 'Aplicamos planejamento tributário para evitar o pagamento de impostos indevidos ou em duplicidade.',
  },
  {
    icon: '🤝',
    title: 'Se sua estrutura sanitária está segura',
    description: 'Regularizamos alvarás, licenças e POPs para garantir total tranquilidade em fiscalizações.',
  },
];

const roadmapSteps = [
  {
    id: 'diagnostico',
    title: 'Diagnóstico rápido: como você vai operar?',
    content: `• Sozinha **(sem parceiros)** → pode atuar como **PF (liberal) ou PJ (CNPJ)**.\n• **Com parceiros/terceiros (dentista, biomédico, etc.)** → você **vira empresa** (CNPJ).\n• **Compartilhando espaço** (duas enfermeiras, etc.) → na prática é **clínica**: precisa de um** CNPJ único** para o estabelecimento.`,
    example: null,
    attualizeHelp: 'Simulamos **PF x PJ** (tributos, custos, viabilidade sanitária) e indicamos a melhor rota para **pagar menos e ficar 100% regular**.'
  },
  {
    id: 'cnaes',
    title: 'Liste seus serviços e defina os CNAEs (base de tudo)',
    content: 'Faça uma lista real do que você **vai oferecer**. Isso define **tributos, alvará e fiscalização**.\n\n**CNAEs frequentes**:\n• 9602-5/02 – Serviços de estética/beleza\n• 8630-5/04 – Clínicas **odontológicas** (inclui HOF)\n• 8650-0/01 – **Consultórios de enfermagem** (clínico)\n• 8690-9/04 – **Podologia**\n• 8640-2/… – **Posto de coleta** (quando houver coleta laboratorial)',
    example: 'Se você fará **injetáveis** com biomédico e **micropigmentação**, sua base tende a ser **9602-5/02** + um CNAE de **atividade de saúde** compatível. A Attualize ajusta isso para **bater com a Vigilância** e **tributos**.',
    attualizeHelp: null
  },
  {
    id: 'regime',
    title: 'Natureza jurídica e regime tributário (proteção + economia)',
    content: 'Natureza jurídica (proteção patrimonial):\n• **SLU** (Sociedade Limitada **Unipessoal**) → 1 sócio, **protege bens pessoais**.\n• **LTDA** → com sócios, ideal para expansão.\n• **EI** → simples, **não** separa bens (menos proteção).\n\n**Regime tributário (economia)**:\n• **Simples Nacional (Anexo III/V)** → maioria das clínicas: atenção ao **Fator R**.\n(folha >= 28% do RBT12 pode levar ao Anexo III, com alíquotas menores)\n• **Lucro Presumido** → bom em **margens altas** e folha enxuta; base **presumida** (serviços: 32% da receita para IRPJ/CSLL).\n• **Lucro Real** → grandes operações ou margem baixa.',
    example: null,
    attualizeHelp: 'Rodamos um **planejamento tributário** com seus números (faturamento, folha, margem) para decidir o **regime certo já no início**.'
  },
  {
    id: 'viabilidade',
    title: 'Consulta de Viabilidade (São Paulo – exemplo guiado)',
    content: '**Objetivo**: checar, **antes de alugar/obrar**, se o **endereço** permite suas atividades.\n\n**Passo a passo (SP Capital)**:\n1. Separe: **endereço completo, nº do IPTU, lista de CNAEs**.\n2. Acesse a **VRE|REDESIM** e inicie a **Consulta Prévia de Local**.\n3. Informe o **endereço + CNAEs** responda o questionário.\n4. **Resultado típico**:\n   • **"Permitido"** → siga para abertura.\n   • **"Permitido com restrição"** → pode exigir **adaptações** (acessibilidade, vaga, exaustão, PPCI, etc) \n   • **"Não permitido"** → escolha outro endereço (economiza tempo/dinheiro).\n  5. **Armazene o protocolo**: ele será exigido depois.',
    example: 'Rua X, **Moema** – clínica com estética **9602-5/02 + podologia**. A viabilidade retorna **“Permitido com restrição”** → pede **acessibilidade e licença sanitária**. A Attualize aponta as **adaptações mínimas** e segue com a abertura sem sustos.',
    attualizeHelp: null
  },
  {
    id: 'abertura-licencas',
    title: 'Abertura e licenças (o kit “abre e atende”)',
    content: '1. **CNPJ** (Junta/Receita) → a “identidade” da clínica.\n2. **Inscrição Municipal** (ISS).\n3. **Alvará de Funcionamento** (Prefeitura).\n4. **Licença/Alvará Sanitário** (Vigilância Municipal/Estadual).\n5. **Bombeiros (AVCB/CLCB)** quando exigido pela metragem/uso.',
    example: null,
    attualizeHelp: 'Cuidamos de tudo **ponta a ponta**: CNPJ, Alvará, Vigilância e, quando necessário, Bombeiros — **com a documentação certa na primeira vez**.'
  },
  {
    id: 'risco-sanitario',
    title: 'Classe de risco e escopo sanitário',
    content: '• **Quem define “invasivo” vs “não invasivo” é a Anvisa** (RDCs), não os conselhos.\n • **Injetáveis** costumam ser **alto risco**.\n • Classificação errada (ex.: marcar “não invasivo” fazendo injetável) → interdição.',
    example: 'Clínica com toxina + microagulhamento → tratada como **risco alto**; exigirá **PGRSS**, POPs específicos, rastreabilidade de insumos e controles adicionais.',
    attualizeHelp: null
  },
  {
    id: 'modelo-operacao',
    title: 'Modelo de operação: CLT, parceria, sublocação',
    content: '• **CLT** → todos atuam sob **seu** alvará.\n• **Parceria (Lei do Salão Parceiro)** → contratos formais; **NF do salão para o cliente** e **NF do parceiro para o salão**; repasse documentado;** o salão **tributa só a sua parte**.\n• **Sublocação** → cada profissional responde por **sua sala** e documentos.\n• **Coworking** → espaço precisa estar **regular** para **todas** as atividades.',
    example: null,
    attualizeHelp: 'Criamos **contratos e fluxos de nota** que blindam sua clínica e **evitam vínculo empregatício** indevido.'
  },
  {
    id: 'pasta-sanitaria',
    title: 'Pasta Sanitária (o que o fiscal pede primeiro)',
    content: 'Conteúdo essencial:\n1. **Manual de Boas Práticas/Rotinas** (MRP).\n2. **POPs de cada serviço** + POPs bases(mãos, limpeza/desinfecção, reprocesso, resíduos, acidentes biológicos, esterilização/alta desinfecção, reconstituição, etc.)\n3. **Registros**: limpeza, manutenção/calibração, **rastreio de insumos** (data/lote/validade), temperatura (se aplicável), fichas de anamnese/consentimento.\n4. **PGRSS** (resíduos).\n5. **Ficha de intercorrências**.\n6. **PSP – Plano de Segurança do Paciente** (obrigatório desde 2024).',
    example: null,
    attualizeHelp: 'Dica de especialista Attualize: **as denúncias campeãs (≈45,5%)** são por **falta de POP, manual e registros**. Não basta fazer certo — **tem que comprovar**.'
  },
  {
    id: 'itens-criticos',
    title: 'Itens críticos por área (o que dá autuação rápida)',
    content: '• **Injetáveis**: rastreabilidade pós-reconstituição (data/lote/validade).\n• Minimamente invasiva: descarte em **saco branco leitoso infectante (PGRSS)**.\n • **Odonto: compressor** no local correto + manual de rotinas.\n• **Podologia**: contrato** de coleta de perfurocortantes.\n• **Vacinas: rede de frio** + plano de contingência de energia.\n • **Micropigmentação/tatu/piercing:** contrato de descarte de perfurocortantes.\n • **Depilação: proibido** usar cera “caseira”; **somente** produto regularizado na Anvisa.',
    example: null,
    attualizeHelp: null
  },
  {
    id: 'tributacao-notas',
    title: 'Tributação e notas (sem dor de cabeça)',
    content: '• **ISS é municipal** (geralmente 2%–5%).\n• **Simples Nacional** (Anexo III/V) com **Fator R** pode reduzir a carga.\n• **Lei do Salão Parceiro**:\n • **Salão emite NF ao cliente**.\n • **Profissional emite NF ao salão**.\n • **Repasse documentado** = **deduz da base** do salão (salão tributa só a sua parte).\n',
    example: null,
    attualizeHelp: 'Parametrizamos seu **sistema fiscal** para **emitir NFs** e **separar repasses automaticamente** (evita pagar imposto a mais).'
  },
  {
    id: 'fiscalizacao',
    title: 'Fiscalização: o que esperar e como conduzir',
    content: 'Pode ocorrer por **denúncia, rotina** (seu pedido de licença) ou surpresa (blitz).\n• O fiscal verifica **alvarás, pasta sanitária e a rotina real**.\n• **Sem alvará** em fiscalização surpresa → pode **paralisar** o atendimento.',
    example: null,
    attualizeHelp: 'Entregamos um **checklist de inspeção**, treinamos a equipe e fazemos uma **auditoria preventiva** para você **ficar tranquila**.'
  }
];

export function RegularizationRoadmap() {
  return (
    <Container maxWidth="md" sx={{ my: 5 }}>
      <Stack spacing={6}>
        <Box textAlign="center" sx={{ mt: 5 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Mapa de Regularização
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary" sx={{ mt: 1 }}>
            Seu passo a passo prático para uma operação 100% segura e legal.
          </Typography>
        </Box>

        <Timeline
          sx={{
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {roadmapSteps.map((step, index) => (
            <TimelineItem key={step.id}>
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined" />
                {index < roadmapSteps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ pb: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip label={`Passo ${index + 1}`} color="primary" />
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {step.title}
                      </Typography>
                    </Stack>

                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {formatarTexto(step.content)}
                    </Typography>

                    {step.example && (
                      <Paper sx={{ p: 2, backgroundColor: 'background.neutral', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Exemplo Prático:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatarTexto(step.example)}
                        </Typography>
                      </Paper>
                    )}

                    {step.attualizeHelp && (
                      <Paper sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'primary.light', bgcolor: 'primary.lighter' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                          <Iconify icon="mdi:rocket-launch" color="primary.main" width={24} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                            Como a Attualize ajuda:
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                          {formatarTexto(step.attualizeHelp)}
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        <Stack spacing={3}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Exemplos Práticos Detalhados
          </Typography>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              A - Roteiro para Viabilidade em São Paulo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 2.0 }}>
              1. <strong>Defina os serviços:</strong> Micropigmentação + injetáveis (biomédico).<br />
              2. <strong>CNAEs:</strong> <b>9602-5/02</b> + saúde compatível ao profissional habilitado.<br />
              3. <strong>Documentos:</strong> Separe IPTU e endereço do imóvel (ex.: <b>Moema</b>).<br />
              4. <strong>Ação:</strong> Entre na <b>VRE|REDESIM</b> → <b>Consulta Prévia de Local.</b><br />
              5. <strong>Preenchimento:</strong> Responda o questionário (área, atendimento, acessibilidade, etc.).<br />
              6. <strong>Resultado:</strong> <b>“Permitido com restrição”</b> → precisa de <b>acessibilidade + licença sanitária.</b><br />
              7. <strong>Próximo Passo:</strong> Com o protocolo, abrimos o <b>CNPJ e Inscrição Municipal</b>, e já encaminhamos o <b>alvará sanitário</b> com os <b>POPs</b> e <b>MRP</b> que vamos montar para você.
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              B - Modelo Editável de POP (Procedimento Operacional Padrão)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: 'background.neutral', p: 2, borderRadius: 1.5 }}>
              POP – Higienização das Mãos (CÓD.: POP-HM-01 | Rev.: 00){'\n\n'}
              1. OBJETIVO: Padronizar a higienização para reduzir risco de infecção.{'\n'}
              2. ALCANCE: Todos os profissionais da clínica.{'\n'}
              3. MATERIAIS: Pia, sabonete líquido, álcool 70%, toalhas descartáveis.{'\n'}
              4. PROCEDIMENTO: Friccionar mãos com sabonete (40-60s) ou álcool (20-30s), seguindo técnica padrão.{'\n'}
              5. REGISTROS: Anotar na planilha “REG-LIM-01 – Higienização”.{'\n'}
              6. TREINAMENTO: Semestral, com registro de presença.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary', px: 1 }}>
              <strong>Nosso diferencial:</strong> Criamos POPs específicos (ex.: Reconstituição de Toxina, Esterilização), todos com registros prontos para impressão.
            </Typography>
          </Paper>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 2, border: 2, borderColor: 'success.main', bgcolor: 'success.lighter' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
            <Iconify icon="mdi:check-all" color="success.main" width={32} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'success.darker' }}>
              Checklist Final de Regularização
            </Typography>
          </Stack>
          <List dense sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            {[
              "Lista de serviços pronta e CNAEs definidos",
              "Viabilidade (Prefeitura) aprovada",
              "CNPJ + Inscrição Municipal emitidos",
              "Alvará de Funcionamento solicitado",
              "Licença Sanitária em andamento (com MRP + POPs + PGRSS + PSP)",
              "Bombeiros (quando aplicável)",
              "Modelo de operação definido (CLT / Parceria / etc.)",
              "Contratos formalizados",
              "Emissão de NF configurada corretamente",
              "Calendário fiscal e sanitário implantado",
            ].map(item => (
              <ListItem key={item} disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Iconify icon="mdi:check-circle-outline" color="success.dark" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>


        <Paper sx={{ textAlign: 'center', p: 4, py: 5, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Quer saber se sua clínica paga imposto a mais?
          </Typography>

          <Typography variant='body2' sx={{ py: 3, fontWeight: 'bold', }} >
            Agende uma análise com a Attualize e descubra:
          </Typography>

          <Stack
            spacing={3}
            sx={{
              my: 4,
              maxWidth: 650,
              mx: 'auto',
              textAlign: 'left',
            }}
          >
            {benefits.map((item) => (
              <Stack key={item.title} direction="row" spacing={2} alignItems="flex-start">
                <Typography sx={{ fontSize: '1.5rem', mt: -0.5 }}>
                  {item.icon}
                </Typography>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Button variant="contained" size="large" color="primary" onClick={handleContatoWhatsapp} startIcon={<Iconify icon="mdi:whatsapp" />}>
            Fale com um especialista agora!
          </Button>
        </Paper>


      </Stack>
    </Container>
  );
}
