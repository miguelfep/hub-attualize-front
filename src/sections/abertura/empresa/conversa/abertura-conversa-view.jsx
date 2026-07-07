'use client';

import axios from 'axios';
import { toast } from 'sonner';
import NextLink from 'next/link';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Link,
  Stack,
  Button,
  Container,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

import { normalizePhoneToE164, toPayloadLegacyDigits } from 'src/utils/phone-e164';
import { fCurrency, onlyDigits, formatCPFOrCNPJ, validateCPFOrCNPJ } from 'src/utils/format-number';

import { uploadArquivo, updateAbertura, solicitarAprovacaoPorId } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';
import ComponenteEmConstituicao from 'src/components/abertura/ComponenteEmConstituicao';
import ComponenteAberturaFinalizada from 'src/components/abertura/ComponenteAberturaFinalizada';
import ComponenteAguardandoValidacao from 'src/components/abertura/ComponenteAguardandoValidacao';

// ----------------------------------------------------------------------
// Efeito de digitação (typewriter) para as mensagens do assistente

function TypewriterText({ text, speed = 14, onDone, onProgress }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= text.length) {
      onDone?.();
      return undefined;
    }
    const timer = setTimeout(() => {
      setCount((c) => c + 2);
      onProgress?.();
    }, speed);
    return () => clearTimeout(timer);
  }, [count, text, speed, onDone, onProgress]);

  return <>{text.slice(0, count)}</>;
}

// ----------------------------------------------------------------------
// Helpers de formatação/parse

const formatCep = (value) => {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const parseCurrency = (value) => {
  const normalized = String(value)
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const primeiroNome = (nome) => (nome || '').trim().split(' ')[0];

const FORMA_ATUACAO_OPTIONS = [
  'Internet',
  'Fora do estabelecimento',
  'Escritório administrativo',
  'Local próprio',
  'Em estabelecimento de terceiros',
  'Casa do cliente',
  'Outros',
];

const ESTADO_CIVIL_OPTIONS = ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União estável'];

const REGIME_BENS_OPTIONS = [
  'Comunhão Parcial de Bens',
  'Comunhão Universal de Bens',
  'Separação Total de Bens',
];

// ----------------------------------------------------------------------
// Definição das perguntas
//
// Cada step: { key, question(answers), type, options?, when?(answers),
//              validate?(raw) -> mensagem de erro ou null,
//              parse?(raw) -> valor salvo, display?(valor) -> texto do balão do usuário,
//              initial?(aberturaData) -> valor pré-preenchido, skippable? }

function buildSteps(answers, aberturaData) {
  const numSocios = Number(answers.numSocios || 1);

  const sociosSteps = [];
  for (let i = 0; i < numSocios; i += 1) {
    const label = numSocios === 1 ? 'do sócio' : `do ${i + 1}º sócio`;
    sociosSteps.push(
      {
        key: `socio-${i}-nome`,
        type: 'text',
        question: (a) =>
          i === 0
            ? numSocios === 1
              ? `Vamos aos dados do sócio. Pode confirmar o nome completo? Se for você mesmo, é só enviar.`
              : `Vamos aos dados dos sócios, um de cada vez. Qual o nome completo do 1º sócio?`
            : `Anotado! E o nome completo do ${i + 1}º sócio?`,
        initial: () => (i === 0 ? answers.nome || aberturaData?.nome || '' : ''),
        validate: (raw) => (raw.trim().length < 5 ? 'Me diga o nome completo, por favor. 🙂' : null),
      },
      {
        key: `socio-${i}-cpf`,
        type: 'cpf',
        question: () => `Qual o CPF ${label} ${primeiroNome(answers[`socio-${i}-nome`])}?`,
        initial: () => (i === 0 ? answers.cpf || '' : ''),
      },
      {
        key: `socio-${i}-estadoCivil`,
        type: 'options',
        options: ESTADO_CIVIL_OPTIONS,
        question: () => `Qual o estado civil ${label}?`,
      },
      {
        key: `socio-${i}-regimeBens`,
        type: 'options',
        options: REGIME_BENS_OPTIONS,
        when: (a) => a[`socio-${i}-estadoCivil`] === 'Casado',
        question: () => 'Casado(a) em qual regime de bens?',
      },
      {
        key: `socio-${i}-profissao`,
        type: 'text',
        question: () => `Qual a profissão ${label}?`,
      }
    );

    if (numSocios > 1) {
      sociosSteps.push({
        key: `socio-${i}-porcentagem`,
        type: 'number',
        question: () => `Qual a participação ${label} na sociedade? (em %, ex: 50)`,
        validate: (raw) => {
          const n = parseFloat(String(raw).replace(',', '.'));
          if (Number.isNaN(n) || n <= 0 || n > 100) return 'Me passa um número entre 1 e 100. 🙂';
          return null;
        },
        parse: (raw) => parseFloat(String(raw).replace(',', '.')),
        display: (v) => `${v}%`,
      });
      sociosSteps.push({
        key: `socio-${i}-administrador`,
        type: 'boolean',
        question: () => `${primeiroNome(answers[`socio-${i}-nome`]) || 'Esse sócio'} será administrador da empresa?`,
        display: (v) => (v ? 'Sim' : 'Não'),
      });
    }
  }

  return [
    {
      key: 'nome',
      type: 'text',
      question: () => 'Pra começar, me conta: qual o seu nome? 😊',
      initial: (d) => d?.nome || '',
      validate: (raw) => (raw.trim().length < 3 ? 'Pode me dizer seu nome completo?' : null),
    },
    {
      key: 'cpf',
      type: 'cpf',
      question: (a) => `Prazer, ${primeiroNome(a.nome)}! Qual o seu CPF?`,
      initial: (d) => formatCPFOrCNPJ(d?.cpf || ''),
    },
    {
      key: 'email',
      type: 'email',
      question: () => 'Qual e-mail você mais usa? É por ele que vamos te manter informado de tudo. 📬',
      initial: (d) => d?.email || '',
      validate: (raw) => (!/^\S+@\S+\.\S+$/.test(raw.trim()) ? 'Esse e-mail não parece válido. Confere pra mim?' : null),
      parse: (raw) => raw.trim().toLowerCase(),
    },
    {
      key: 'telefone',
      type: 'phone',
      question: () => 'E o seu WhatsApp com DDD?',
      initial: (d) => normalizePhoneToE164(d?.telefone || ''),
    },
    {
      key: 'nomeEmpresarial',
      type: 'text',
      question: () => 'Agora vamos falar da empresa! 🏢 Qual nome você quer registrar (razão social)?',
      initial: (d) => d?.nomeEmpresarial || '',
      validate: (raw) => (raw.trim().length < 3 ? 'Me diga o nome que quer registrar. 🙂' : null),
    },
    {
      key: 'nomeFantasia',
      type: 'text',
      skippable: true,
      skipLabel: 'Usar o mesmo nome',
      question: () => 'E o nome fantasia? Se for o mesmo, é só pular.',
      initial: (d) => d?.nomeFantasia || '',
    },
    {
      key: 'descricaoAtividades',
      type: 'multiline',
      question: () =>
        'Me conta com suas palavras: o que a sua empresa vai fazer? Quanto mais detalhes, melhor a gente enquadra as atividades. ✍️',
      initial: (d) => d?.descricaoAtividades || '',
      validate: (raw) => (raw.trim().length < 10 ? 'Descreve um pouquinho mais, por favor — isso ajuda muito no enquadramento.' : null),
    },
    {
      key: 'formaAtuacao',
      type: 'options',
      options: FORMA_ATUACAO_OPTIONS,
      question: () => 'De que forma a empresa vai atuar principalmente?',
    },
    {
      key: 'usarEnderecoFiscal',
      type: 'choice',
      choices: [
        { label: 'Tenho um endereço', value: false },
        { label: 'Quero usar o endereço fiscal da Attualize', value: true },
      ],
      question: () => 'Onde a empresa vai funcionar? Se preferir, você pode usar o nosso endereço fiscal. 📍',
      display: (v) => (v ? 'Quero usar o endereço fiscal da Attualize' : 'Tenho um endereço'),
    },
    {
      key: 'cep',
      type: 'cep',
      when: (a) => a.usarEnderecoFiscal === false,
      question: () => 'Qual o CEP do endereço?',
      initial: (d) => formatCep(d?.enderecoComercial?.cep || ''),
    },
    {
      key: 'enderecoNumero',
      type: 'text',
      when: (a) => a.usarEnderecoFiscal === false,
      question: (a) =>
        a.enderecoLogradouro
          ? `Achei: ${a.enderecoLogradouro}, ${a.enderecoBairro ? `${a.enderecoBairro} — ` : ''}${a.enderecoCidade}/${a.enderecoEstado}. Qual o número?`
          : 'Qual o número do endereço?',
      initial: (d) => d?.enderecoComercial?.numero || '',
    },
    {
      key: 'enderecoComplemento',
      type: 'text',
      skippable: true,
      skipLabel: 'Sem complemento',
      when: (a) => a.usarEnderecoFiscal === false,
      question: () => 'Tem complemento? (sala, andar, bloco...)',
      initial: (d) => d?.enderecoComercial?.complemento || '',
    },
    {
      key: 'metragemImovel',
      type: 'number',
      when: (a) => a.usarEnderecoFiscal === false,
      question: () => 'Qual a metragem total do imóvel? (em m²)',
      initial: (d) => d?.metragemImovel || '',
      display: (v) => `${v} m²`,
    },
    {
      key: 'metragemUtilizada',
      type: 'number',
      when: (a) => a.usarEnderecoFiscal === false,
      question: () => 'E quantos m² a empresa vai usar?',
      initial: (d) => d?.metragemUtilizada || '',
      display: (v) => `${v} m²`,
    },
    {
      key: 'horarioFuncionamento',
      type: 'text',
      question: () => 'Qual será o horário de funcionamento? (ex: segunda a sexta, das 9h às 18h)',
      initial: (d) => d?.horarioFuncionamento || '',
    },
    {
      key: 'capitalSocial',
      type: 'currency',
      question: () =>
        'Qual o capital social da empresa? É o valor que os sócios investem para começar — pode ser em dinheiro ou bens. 💰',
      initial: (d) => (d?.capitalSocial ? String(d.capitalSocial) : ''),
    },
    {
      key: 'proLabore',
      type: 'currency',
      question: () => 'Quanto você pretende retirar por mês como pró-labore (o "salário" do sócio)?',
      initial: (d) => (d?.proLabore ? String(d.proLabore) : ''),
    },
    {
      key: 'previsaoFaturamento',
      type: 'currency',
      question: () => 'E qual a previsão de faturamento mensal? Não precisa ser exato, é só uma estimativa. 📈',
      initial: (d) => (d?.previsaoFaturamento ? String(d.previsaoFaturamento) : ''),
    },
    {
      key: 'numSocios',
      type: 'options',
      options: ['1', '2', '3', '4'],
      question: () => 'A empresa terá quantos sócios, contando com você?',
      display: (v) => (v === '1' ? 'Só eu' : `${v} sócios`),
    },
    ...sociosSteps,
    {
      key: 'rgAnexo',
      type: 'upload',
      docType: 'rgAnexo',
      skippable: true,
      skipLabel: 'Enviar depois',
      question: () =>
        'Agora vamos aos documentos! 📄 Me envia o RG do representante em PDF? Se não estiver com ele em mãos, pode pular e enviar depois.',
    },
    {
      key: 'iptuAnexo',
      type: 'upload',
      docType: 'iptuAnexo',
      skippable: true,
      skipLabel: 'Enviar depois',
      when: (a) => a.usarEnderecoFiscal === false,
      question: () => 'Perfeito! E o IPTU do imóvel onde a empresa vai funcionar? Também em PDF. 🏠',
    },
    {
      key: 'possuiRT',
      type: 'boolean',
      question: () =>
        'Sua atividade exige um responsável técnico (RT)? É comum em áreas como saúde, engenharia e estética.',
      display: (v) => (v ? 'Sim' : 'Não'),
    },
    {
      key: 'documentoRT',
      type: 'upload',
      docType: 'documentoRT',
      skippable: true,
      skipLabel: 'Enviar depois',
      when: (a) => a.possuiRT === true,
      question: () =>
        'Então me envia o documento de classe do responsável técnico (ex: carteirinha do conselho), em PDF.',
    },
    {
      key: 'senhaGOV',
      type: 'password',
      skippable: true,
      skipLabel: 'Prefiro enviar depois',
      when: () => !(aberturaData?.senhaGOV && String(aberturaData.senhaGOV).length > 0),
      question: () =>
        'Quase lá! Se quiser agilizar, me passa a senha da sua conta gov.br — usamos apenas para os registros nos órgãos públicos, com total segurança. 🔒',
      display: () => '••••••••',
    },
    {
      key: 'observacoes',
      type: 'multiline',
      skippable: true,
      skipLabel: 'Nada a acrescentar',
      question: () => 'Pra fechar: tem algo mais que a gente deva saber?',
      initial: (d) => d?.observacoes || '',
    },
  ];
}

// ----------------------------------------------------------------------
// Monta o payload no formato da abertura a partir das respostas

function buildPayload(answers) {
  const numSocios = Number(answers.numSocios || 1);
  const socios = [];
  for (let i = 0; i < numSocios; i += 1) {
    if (answers[`socio-${i}-nome`]) {
      socios.push({
        nome: answers[`socio-${i}-nome`] || '',
        cpf: onlyDigits(answers[`socio-${i}-cpf`] || ''),
        estadoCivil: answers[`socio-${i}-estadoCivil`] || '',
        regimeBens: answers[`socio-${i}-regimeBens`] || '',
        profissao: answers[`socio-${i}-profissao`] || '',
        porcentagem: numSocios === 1 ? 100 : Number(answers[`socio-${i}-porcentagem`] || 0),
        administrador: numSocios === 1 ? true : Boolean(answers[`socio-${i}-administrador`]),
      });
    }
  }

  const payload = {
    ...(answers.nome !== undefined && { nome: answers.nome }),
    ...(answers.cpf !== undefined && { cpf: onlyDigits(answers.cpf) }),
    ...(answers.email !== undefined && { email: answers.email }),
    ...(answers.telefone !== undefined && { telefone: toPayloadLegacyDigits(answers.telefone) }),
    ...(answers.nomeEmpresarial !== undefined && { nomeEmpresarial: answers.nomeEmpresarial }),
    ...(answers.nomeFantasia !== undefined && {
      nomeFantasia: answers.nomeFantasia || answers.nomeEmpresarial || '',
    }),
    ...(answers.descricaoAtividades !== undefined && { descricaoAtividades: answers.descricaoAtividades }),
    ...(answers.formaAtuacao !== undefined && { formaAtuacao: answers.formaAtuacao }),
    ...(answers.usarEnderecoFiscal !== undefined && { usarEnderecoFiscal: answers.usarEnderecoFiscal }),
    ...(answers.horarioFuncionamento !== undefined && { horarioFuncionamento: answers.horarioFuncionamento }),
    ...(answers.metragemImovel !== undefined && { metragemImovel: answers.metragemImovel }),
    ...(answers.metragemUtilizada !== undefined && { metragemUtilizada: answers.metragemUtilizada }),
    ...(answers.capitalSocial !== undefined && { capitalSocial: answers.capitalSocial }),
    ...(answers.proLabore !== undefined && { proLabore: answers.proLabore }),
    ...(answers.previsaoFaturamento !== undefined && { previsaoFaturamento: answers.previsaoFaturamento }),
    ...(answers.observacoes !== undefined && { observacoes: answers.observacoes }),
    ...(answers.possuiRT !== undefined && { possuiRT: answers.possuiRT }),
    ...(answers.senhaGOV ? { senhaGOV: answers.senhaGOV } : {}),
  };

  if (answers.usarEnderecoFiscal === false && answers.cep) {
    payload.enderecoComercial = {
      cep: onlyDigits(answers.cep),
      logradouro: answers.enderecoLogradouro || '',
      numero: answers.enderecoNumero || '',
      complemento: answers.enderecoComplemento || '',
      bairro: answers.enderecoBairro || '',
      cidade: answers.enderecoCidade || '',
      estado: answers.enderecoEstado || '',
    };
  }

  if (socios.length > 0) {
    payload.socios = socios;
  }

  return payload;
}

// ----------------------------------------------------------------------
// Reconstrói as respostas a partir do que já está salvo no servidor,
// para retomar a conversa de onde a pessoa parou.

function answersFromAbertura(d) {
  const a = {};
  const set = (key, value) => {
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      a[key] = value;
    }
  };

  set('nome', d?.nome);
  if (d?.cpf) set('cpf', formatCPFOrCNPJ(d.cpf));
  set('email', d?.email);
  if (d?.telefone) set('telefone', normalizePhoneToE164(d.telefone));
  set('nomeEmpresarial', d?.nomeEmpresarial);
  set('nomeFantasia', d?.nomeFantasia);
  set('descricaoAtividades', d?.descricaoAtividades);
  set('formaAtuacao', d?.formaAtuacao);
  set('horarioFuncionamento', d?.horarioFuncionamento);
  set('metragemImovel', d?.metragemImovel);
  set('metragemUtilizada', d?.metragemUtilizada);
  set('capitalSocial', d?.capitalSocial);
  set('proLabore', d?.proLabore);
  set('previsaoFaturamento', d?.previsaoFaturamento);
  set('observacoes', d?.observacoes);

  // Documentos já enviados não são pedidos de novo
  set('rgAnexo', d?.rgAnexo);
  set('iptuAnexo', d?.iptuAnexo);
  if (d?.possuiRT === true) {
    a.possuiRT = true;
    set('documentoRT', d?.documentoRT);
  }

  // Endereço: só dá para saber que foi respondido se usarEnderecoFiscal for true
  // ou se já houver um CEP salvo (o default do backend é false).
  const endereco = d?.enderecoComercial;
  if (d?.usarEnderecoFiscal === true) {
    a.usarEnderecoFiscal = true;
  } else if (endereco?.cep) {
    a.usarEnderecoFiscal = false;
    set('cep', formatCep(endereco.cep));
    set('enderecoLogradouro', endereco.logradouro);
    set('enderecoBairro', endereco.bairro);
    set('enderecoCidade', endereco.cidade);
    set('enderecoEstado', endereco.estado);
    set('enderecoNumero', endereco.numero);
    // Se o número já foi respondido, o complemento também passou (mesmo que vazio/pulado)
    if (endereco.numero) a.enderecoComplemento = endereco.complemento || '';
  }

  // Sócios: só considera respondido se houver ao menos um sócio com nome
  const socios = Array.isArray(d?.socios) ? d.socios.filter((s) => s?.nome) : [];
  if (socios.length > 0) {
    a.numSocios = String(socios.length);
    socios.forEach((s, i) => {
      set(`socio-${i}-nome`, s.nome);
      if (s.cpf) set(`socio-${i}-cpf`, formatCPFOrCNPJ(s.cpf));
      set(`socio-${i}-estadoCivil`, s.estadoCivil);
      set(`socio-${i}-regimeBens`, s.regimeBens);
      set(`socio-${i}-profissao`, s.profissao);
      if (socios.length > 1) {
        set(`socio-${i}-porcentagem`, s.porcentagem);
        if (typeof s.administrador === 'boolean') a[`socio-${i}-administrador`] = s.administrador;
      }
    });
  }

  return a;
}

// ----------------------------------------------------------------------

export function AberturaConversaView({ aberturaData }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentKey, setCurrentKey] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const [enviandoAprovacao, setEnviandoAprovacao] = useState(false);
  const [statusAbertura, setStatusAbertura] = useState(aberturaData?.statusAbertura || '');
  const msgId = useRef(0);
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Respostas já salvas no servidor (para retomar de onde parou)
  const initialAnswers = useMemo(() => answersFromAbertura(aberturaData), [aberturaData]);
  const hasProgress = Object.keys(initialAnswers).length > 0;

  const steps = useMemo(() => buildSteps(answers, aberturaData), [answers, aberturaData]);
  const visibleSteps = useMemo(() => steps.filter((s) => !s.when || s.when(answers)), [steps, answers]);
  const currentStep = visibleSteps.find((s) => s.key === currentKey) || null;
  const answeredCount = visibleSteps.filter((s) => answers[s.key] !== undefined).length;
  const progress = finished ? 100 : Math.round((answeredCount / Math.max(visibleSteps.length, 1)) * 100);

  const pushBot = useCallback((text) => {
    msgId.current += 1;
    setTyping(true);
    setMessages((prev) => [...prev, { id: msgId.current, from: 'bot', text }]);
  }, []);

  const pushUser = useCallback((text) => {
    msgId.current += 1;
    setMessages((prev) => [...prev, { id: msgId.current, from: 'user', text }]);
  }, []);

  // Mantém a conversa colada no fim conforme cresce
  const scrollToBottom = useCallback((smooth = false) => {
    const el = chatBoxRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, finished, scrollToBottom]);

  // Foca o input quando o bot termina de digitar
  useEffect(() => {
    if (!typing && currentStep) {
      inputRef.current?.focus();
    }
  }, [typing, currentStep]);

  const startConversation = () => {
    setStarted(true);
    setAnswers(initialAnswers);

    const visiveis = buildSteps(initialAnswers, aberturaData).filter(
      (s) => !s.when || s.when(initialAnswers)
    );
    const proximaPendente = visiveis.find((s) => initialAnswers[s.key] === undefined);

    if (!proximaPendente) {
      // Tudo já respondido em uma visita anterior
      setFinished(true);
      pushBot(
        `Que bom te ver de volta, ${primeiroNome(initialAnswers.nome)}! 😊 Você já tinha respondido tudo. É só revisar e enviar para o nosso time quando quiser.`
      );
      return;
    }

    setCurrentKey(proximaPendente.key);
    setInputValue(proximaPendente.initial?.(aberturaData) || '');

    if (hasProgress) {
      const saudacao = initialAnswers.nome
        ? `Que bom te ver de volta, ${primeiroNome(initialAnswers.nome)}! 😊`
        : 'Que bom te ver por aqui! 😊';
      pushBot(
        `${saudacao} Guardei o que você já respondeu, então vamos continuar de onde paramos. ${proximaPendente.question(initialAnswers)}`
      );
    } else {
      pushBot(
        `Oi! 👋 Que bom te ver por aqui. Eu vou te guiar na abertura da sua empresa — são algumas perguntas rápidas, e você pode parar e voltar quando quiser (suas respostas ficam salvas). ${proximaPendente.question(initialAnswers)}`
      );
    }
  };

  const salvarParcial = useCallback(
    (novasRespostas) => {
      const payload = buildPayload(novasRespostas);
      updateAbertura(aberturaData._id, payload).catch((err) => {
        console.error('Erro ao salvar progresso:', err);
      });
    },
    [aberturaData._id]
  );

  const avancar = (novasRespostas) => {
    const novasVisiveis = buildSteps(novasRespostas, aberturaData).filter(
      (s) => !s.when || s.when(novasRespostas)
    );
    const idx = novasVisiveis.findIndex((s) => s.key === currentKey);
    const proximo = novasVisiveis[idx + 1];

    salvarParcial(novasRespostas);

    if (proximo) {
      setCurrentKey(proximo.key);
      setInputValue(proximo.initial?.(aberturaData) || '');
      pushBot(proximo.question(novasRespostas));
    } else {
      setCurrentKey(null);
      setFinished(true);
      const documentosPendentes = ['rgAnexo', 'iptuAnexo', 'documentoRT'].some(
        (doc) => novasRespostas[doc] === ''
      );
      pushBot(
        `Prontinho, ${primeiroNome(novasRespostas.nome)}! 🎉 Tenho tudo que preciso por enquanto.${
          documentosPendentes
            ? ' Os documentos que ficaram pendentes podem ser enviados depois, pelo formulário completo — sem pressa.'
            : ''
        } Quando estiver tudo certo, é só enviar para o nosso time iniciar a abertura.`
      );
    }
  };

  const responder = (step, rawValue, displayText) => {
    const valor = step.parse ? step.parse(rawValue) : typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    pushUser(displayText ?? (step.display ? step.display(valor) : String(valor)));
    const novasRespostas = { ...answers, [step.key]: valor };
    setAnswers(novasRespostas);
    setInputValue('');
    avancar(novasRespostas);
  };

  const handleSubmitTexto = async () => {
    const step = currentStep;
    if (!step || typing) return;
    const raw = inputValue;

    if (!step.skippable && String(raw).trim() === '') return;

    // Validações por tipo
    if (step.type === 'cpf') {
      if (!validateCPFOrCNPJ(raw) || onlyDigits(raw).length !== 11) {
        pushBot('Hmm, esse CPF não parece válido. Pode conferir os números? 🙂');
        return;
      }
      responder(step, formatCPFOrCNPJ(raw));
      return;
    }

    if (step.type === 'phone') {
      if (onlyDigits(raw).length < 10) {
        pushBot('Preciso do número com DDD, tipo (41) 99999-9999. Pode mandar de novo?');
        return;
      }
      responder(step, raw);
      return;
    }

    if (step.type === 'currency') {
      const valor = parseCurrency(raw);
      if (valor === null || valor < 0) {
        pushBot('Não consegui entender o valor. Pode mandar só os números? Ex: 5000');
        return;
      }
      responder(step, valor, fCurrency(valor));
      return;
    }

    if (step.type === 'number') {
      const n = parseFloat(String(raw).replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        pushBot('Me manda só o número, por favor. 🙂');
        return;
      }
      if (step.validate) {
        const erro = step.validate(raw);
        if (erro) {
          pushBot(erro);
          return;
        }
      }
      responder(step, step.parse ? raw : n);
      return;
    }

    if (step.type === 'cep') {
      const cep = onlyDigits(raw);
      if (cep.length !== 8) {
        pushBot('O CEP precisa ter 8 números. Pode conferir?');
        return;
      }
      setBuscandoCep(true);
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (data.erro) {
          pushBot('Não achei esse CEP. 🤔 Confere os números e me manda de novo?');
          return;
        }
        pushUser(formatCep(cep));
        const novasRespostas = {
          ...answers,
          cep: formatCep(cep),
          enderecoLogradouro: data.logradouro || '',
          enderecoBairro: data.bairro || '',
          enderecoCidade: data.localidade || '',
          enderecoEstado: data.uf || '',
        };
        setAnswers(novasRespostas);
        setInputValue('');
        avancar(novasRespostas);
      } catch (err) {
        pushBot('Tive um problema para buscar o CEP. Pode tentar de novo?');
      } finally {
        setBuscandoCep(false);
      }
      return;
    }

    if (step.type === 'password') {
      responder(step, raw, '••••••••');
      return;
    }

    // text / email / multiline
    if (step.validate) {
      const erro = step.validate(raw);
      if (erro) {
        pushBot(erro);
        return;
      }
    }
    responder(step, raw);
  };

  const handleSkip = () => {
    const step = currentStep;
    if (!step || typing) return;
    pushUser(step.skipLabel || 'Pular');
    const novasRespostas = { ...answers, [step.key]: '' };
    setAnswers(novasRespostas);
    setInputValue('');
    avancar(novasRespostas);
  };

  // Upload de documento dentro da conversa
  const handleEscolherArquivo = () => {
    const step = currentStep;
    if (!step || typing || enviandoArquivo) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setEnviandoArquivo(true);
      try {
        const response = await uploadArquivo(aberturaData._id, step.docType, file);
        if (response?.status !== 200) throw new Error('Falha no upload');

        pushUser(`📎 ${file.name}`);
        const valorSalvo = response.data?.[step.docType] || file.name;
        const novasRespostas = { ...answers, [step.key]: valorSalvo };
        setAnswers(novasRespostas);
        avancar(novasRespostas);
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
        pushBot('Ops, não consegui receber o arquivo. 😕 Pode tentar de novo? Se preferir, é só pular e enviar depois.');
      } finally {
        setEnviandoArquivo(false);
      }
    };
    fileInput.click();
  };

  const handleEnviarAprovacao = async () => {
    setEnviandoAprovacao(true);
    try {
      const payload = { ...buildPayload(answers), statusAbertura: 'em_validacao' };
      await updateAbertura(aberturaData._id, payload);
      await solicitarAprovacaoPorId(aberturaData._id);
      toast.success('Solicitação enviada com sucesso!');
      setStatusAbertura('em_validacao');
    } catch (error) {
      console.error('Erro ao enviar para aprovação:', error);
      toast.error('Erro ao enviar. Tente novamente ou use o formulário completo.');
    } finally {
      setEnviandoAprovacao(false);
    }
  };

  // Estados de status (mesmo comportamento da página clássica)
  if (statusAbertura === 'em_validacao') return <ComponenteAguardandoValidacao />;
  if (statusAbertura === 'em_constituicao') return <ComponenteEmConstituicao formData={aberturaData} />;
  if (statusAbertura === 'finalizado') return <ComponenteAberturaFinalizada formData={aberturaData} />;

  const ultimaMensagem = messages[messages.length - 1];

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        height: '100vh',
        '@supports (height: 100dvh)': { height: '100dvh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Faixa superior com identidade */}
      <Box
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(
            theme.palette.primary.main,
            0.01
          )})`,
        })}
      >
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="img" alt="Attualize" src="/logo/hub-tt.png" sx={{ width: 36, height: 36 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                  Attualize Contábil
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Abertura de empresa
                </Typography>
              </Box>
            </Stack>
            <Link
              component={NextLink}
              href={`/empresa/abertura/${aberturaData._id}`}
              variant="caption"
              sx={{ color: 'text.secondary', textAlign: 'right' }}
            >
              Prefere o formulário tradicional?
            </Link>
          </Stack>
        </Container>
        {started && <LinearProgress variant="determinate" value={progress} sx={{ height: 3 }} />}
      </Box>

      {/* Tela de boas-vindas */}
      {!started && (
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center', flex: 1, overflowY: 'auto' }}>
          <Box
            sx={(theme) => ({
              width: 88,
              height: 88,
              mx: 'auto',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            })}
          >
            <Iconify icon="solar:chat-round-dots-bold" width={44} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            {hasProgress ? 'Que bom te ver de novo!' : 'Vamos abrir a sua empresa?'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 420, mx: 'auto' }}>
            {hasProgress
              ? 'Suas respostas anteriores estão salvas. É só continuar de onde você parou — falta pouco!'
              : 'Em vez de um formulário gigante, preparei uma conversa rápida. Respondendo uma pergunta por vez, em uns 5 minutos a gente termina. Suas respostas ficam salvas automaticamente.'}
          </Typography>
          <Button
            size="large"
            variant="contained"
            onClick={startConversation}
            startIcon={<Iconify icon="solar:chat-round-line-bold" />}
            sx={{ minHeight: 48, px: 4 }}
          >
            {hasProgress ? 'Continuar de onde parei' : 'Vamos começar'}
          </Button>
        </Container>
      )}

      {/* Conversa */}
      {started && (
        <>
          <Box ref={chatBoxRef} sx={{ flex: 1, overflowY: 'auto' }}>
            <Container maxWidth="sm" sx={{ py: 3 }}>
              <Stack spacing={2}>
                {messages.map((msg) => (
                  <Stack
                    key={msg.id}
                    direction="row"
                    spacing={1.5}
                    justifyContent={msg.from === 'user' ? 'flex-end' : 'flex-start'}
                  >
                    {msg.from === 'bot' && (
                      <Box
                        component="img"
                        alt="Attualize"
                        src="/logo/hub-tt.png"
                        sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, mt: 0.5 }}
                      />
                    )}
                    <Box
                      sx={(theme) => ({
                        px: 2,
                        py: 1.25,
                        maxWidth: '80%',
                        borderRadius: 2,
                        ...(msg.from === 'bot'
                          ? {
                              bgcolor: 'background.neutral',
                              borderTopLeftRadius: 4,
                            }
                          : {
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              borderTopRightRadius: 4,
                            }),
                      })}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.from === 'bot' && msg.id === ultimaMensagem?.id ? (
                          <TypewriterText
                            text={msg.text}
                            onDone={() => setTyping(false)}
                            onProgress={scrollToBottom}
                          />
                        ) : (
                          msg.text
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                ))}

                {/* Ações finais */}
                {finished && !typing && (
                  <Stack spacing={1.5} sx={{ pt: 2, pl: 5.5 }}>
                    <Button
                      size="large"
                      variant="contained"
                      onClick={handleEnviarAprovacao}
                      disabled={enviandoAprovacao}
                      startIcon={
                        enviandoAprovacao ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Iconify icon="solar:check-circle-bold" />
                        )
                      }
                      sx={{ minHeight: 48 }}
                    >
                      {enviandoAprovacao ? 'Enviando...' : 'Enviar para o time da Attualize'}
                    </Button>
                    <Button
                      component={NextLink}
                      href={`/empresa/abertura/${aberturaData._id}`}
                      color="inherit"
                      startIcon={<Iconify icon="solar:document-text-linear" />}
                      sx={{ color: 'text.secondary' }}
                    >
                      Revisar tudo no formulário completo
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Container>
          </Box>

          {/* Área de resposta */}
          {currentStep && (
            <Box
              sx={(theme) => ({
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                py: 2,
              })}
            >
              <Container maxWidth="sm">
                {/* Opções em botões */}
                {(currentStep.type === 'options' || currentStep.type === 'choice') && (
                  <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    {(currentStep.type === 'options'
                      ? currentStep.options.map((o) => ({ label: o, value: o }))
                      : currentStep.choices
                    ).map((opcao) => (
                      <Button
                        key={String(opcao.value)}
                        variant="outlined"
                        color="primary"
                        disabled={typing}
                        onClick={() => responder(currentStep, opcao.value, opcao.label)}
                        sx={{ borderRadius: 5 }}
                      >
                        {currentStep.display && currentStep.type === 'options'
                          ? currentStep.display(opcao.value)
                          : opcao.label}
                      </Button>
                    ))}
                  </Stack>
                )}

                {/* Upload de documento */}
                {currentStep.type === 'upload' && (
                  <Button
                    variant="contained"
                    disabled={typing || enviandoArquivo}
                    onClick={handleEscolherArquivo}
                    startIcon={
                      enviandoArquivo ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <Iconify icon="solar:paperclip-bold" />
                      )
                    }
                    sx={{ minHeight: 44 }}
                  >
                    {enviandoArquivo ? 'Enviando...' : 'Anexar arquivo (PDF)'}
                  </Button>
                )}

                {/* Sim / não */}
                {currentStep.type === 'boolean' && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      disabled={typing}
                      onClick={() => responder(currentStep, true, 'Sim')}
                      sx={{ borderRadius: 5, minWidth: 100 }}
                    >
                      Sim
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      disabled={typing}
                      onClick={() => responder(currentStep, false, 'Não')}
                      sx={{ borderRadius: 5, minWidth: 100 }}
                    >
                      Não
                    </Button>
                  </Stack>
                )}

                {/* Telefone */}
                {currentStep.type === 'phone' && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneInput
                      fullWidth
                      size="small"
                      country="BR"
                      value={inputValue}
                      onChange={(v) => setInputValue(v ?? '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmitTexto();
                      }}
                    />
                    <IconButton color="primary" onClick={handleSubmitTexto} disabled={typing}>
                      <Iconify icon="solar:plain-bold" />
                    </IconButton>
                  </Stack>
                )}

                {/* Campos de texto */}
                {['text', 'email', 'cpf', 'cep', 'number', 'currency', 'multiline', 'password'].includes(
                  currentStep.type
                ) && (
                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      inputRef={inputRef}
                      type={currentStep.type === 'password' ? 'password' : 'text'}
                      multiline={currentStep.type === 'multiline'}
                      maxRows={currentStep.type === 'multiline' ? 4 : undefined}
                      placeholder="Digite sua resposta..."
                      value={inputValue}
                      onChange={(e) => {
                        let v = e.target.value;
                        if (currentStep.type === 'cpf') v = formatCPFOrCNPJ(v);
                        if (currentStep.type === 'cep') v = formatCep(v);
                        setInputValue(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && currentStep.type !== 'multiline') {
                          e.preventDefault();
                          handleSubmitTexto();
                        }
                      }}
                      InputProps={{
                        endAdornment: buscandoCep && <CircularProgress size={18} />,
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSubmitTexto}
                      disabled={typing || buscandoCep}
                      sx={{ mb: 0.25 }}
                    >
                      <Iconify icon="solar:plain-bold" />
                    </IconButton>
                  </Stack>
                )}

                {currentStep.skippable && (
                  <Button size="small" color="inherit" onClick={handleSkip} disabled={typing} sx={{ mt: 1, color: 'text.secondary' }}>
                    {currentStep.skipLabel || 'Pular'}
                  </Button>
                )}
              </Container>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
