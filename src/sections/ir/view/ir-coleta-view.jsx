'use client';

import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';

import { useGetPedidoPorToken, salvarFormularioColeta, uploadDocumentoPorToken, submeterValidacaoPorToken } from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';
import IrDocumentList from 'src/components/ir/IrDocumentList';
import UploadMultiArquivo from 'src/components/ir/UploadMultiArquivo';

// ----------------------------------------------------------------------

const OPCOES_DESPESAS = [
  { value: 'escola', label: 'Escola (Infantil, Fundamental, Médio)', icon: 'eva:book-outline' },
  { value: 'universidade', label: 'Universidade', icon: 'eva:award-outline' },
  { value: 'pos_graduacao', label: 'Pós-Graduação, Mestrado ou Doutorado', icon: 'eva:award-fill' },
  { value: 'internacao_hospitalar', label: 'Internação Hospitalar', icon: 'eva:activity-outline' },
  { value: 'consulta_medica', label: 'Consulta Médica', icon: 'eva:heart-outline' },
  { value: 'consulta_odontologica', label: 'Consulta ou Cirurgia Odontológica', icon: 'eva:smiling-face-outline' },
  { value: 'plano_saude', label: 'Plano de Saúde', icon: 'eva:shield-outline' },
  { value: 'plano_previdencia', label: 'Plano de Previdência', icon: 'eva:umbrella-outline' },
  { value: 'empregada_domestica', label: 'Empregada Doméstica', icon: 'eva:home-outline' },
  { value: 'pensao_alimenticia', label: 'Pensão Alimentícia', icon: 'eva:people-outline' },
];

// Documentos obrigatórios por despesa selecionada
const DOCS_REQUERIDOS_POR_DESPESA = {
  escola: { tipo: 'recibo_escola', label: 'Recibo / Boleto Escola' },
  universidade: { tipo: 'recibo_universidade', label: 'Recibo / Boleto Universidade' },
  pos_graduacao: { tipo: 'recibo_pos_graduacao', label: 'Recibo / Boleto Pós-Graduação' },
  internacao_hospitalar: { tipo: 'nota_internacao', label: 'Nota Fiscal ou Recibo de Internação' },
  consulta_medica: { tipo: 'nota_consulta_medica', label: 'Nota Fiscal / Recibo de Consulta Médica' },
  consulta_odontologica: { tipo: 'nota_odontologica', label: 'Nota Fiscal / Recibo Odontológico' },
  plano_saude: { tipo: 'informe_plano_saude', label: 'Informe do Plano de Saúde' },
  plano_previdencia: { tipo: 'informe_previdencia', label: 'Informe de Previdência Privada' },
  empregada_domestica: { tipo: 'recibo_domestica', label: 'Recibos e DARF Empregada Doméstica' },
  pensao_alimenticia: { tipo: 'doc_pensao', label: 'Escritura ou Acordo Judicial de Pensão' },
};

// Tipos de dependentes para multi-select
const TIPOS_DEPENDENTES = [
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'filhos', label: 'Filhos' },
  { value: 'pais', label: 'Pais' },
];

// Tipos de documento para uploads condicionais
const TIPO_DOC_COMPRA_VENDA = 'compra_venda_bens'; // Transferência veicular, escritura, contrato
const TIPO_DOC_INFORME_RENDIMENTOS = 'informe_rendimentos_bancarios';
const TIPO_DOC_EMPRESA_EXTERIOR = 'empresa_exterior_docs';
const TIPO_DOC_REMESSA_EXTERIOR = 'remessa_exterior_comprovantes';
const TIPO_DOC_CONTA_EXTERIOR = 'conta_exterior_informe';
const TIPO_DOC_INFORME_CLT = 'informe_rendimentos_clt';

const UPLOAD_FISCAL_CONFIG = {
  [TIPO_DOC_INFORME_CLT]: {
    titulo: 'Informe(s) de rendimentos CLT',
    descricao: 'Anexe o informe de rendimentos de cada emprego. Se trabalhou em mais de um, envie todos.',
  },
  [TIPO_DOC_COMPRA_VENDA]: {
    titulo: 'Compra e venda de bens',
    descricao: 'Anexe todos os arquivos referentes (Transferência veicular, escritura, contrato).',
  },
  [TIPO_DOC_INFORME_RENDIMENTOS]: {
    titulo: 'Informes de rendimentos bancários',
    descricao: 'Anexe todos os informes de rendimentos bancários, capitalização, etc.',
  },
  [TIPO_DOC_EMPRESA_EXTERIOR]: {
    titulo: 'Empresa no exterior',
    descricao: 'Anexe todos os documentos comprobatórios.',
  },
  [TIPO_DOC_REMESSA_EXTERIOR]: {
    titulo: 'Remessa para o exterior',
    descricao: 'Anexe comprovantes de remessas.',
  },
  [TIPO_DOC_CONTA_EXTERIOR]: {
    titulo: 'Conta bancária no exterior',
    descricao: 'Anexe informe da conta.',
  },
};

// Perguntas fiscais com sub-perguntas condicionais
const PERGUNTAS_FISCAIS = [
  {
    field: 'declarouIrUltimoAno',
    label: 'Declarou Imposto de Renda no último ano?',
  },
  {
    field: 'possuiDependentes',
    label: 'Possui dependentes (filhos, cônjuge dependente, etc.)?',
  },
  {
    field: 'trabalhouAutonomo',
    label: 'Trabalhou como autônomo ou prestou serviços no ano?',
    subPerguntas: [
      { field: 'emitirNotaAutonomo', label: 'Emitiu Nota Fiscal ou recibo como autônomo?' },
    ],
  },
  {
    field: 'trabalhouClt',
    label: 'Trabalhou como CLT (carteira assinada) no ano anterior?',
    subPerguntas: [
      { field: 'quantidadeEmpregosClt', label: 'Em quantos empregos esteve registrado(a)?', tipo: 'number' },
    ],
  },
  {
    field: 'compraVendaBem',
    label: 'Houve compra ou venda de algum bem (imóvel, veículo, etc.)?',
    subPerguntas: [
      { field: 'compraVendaBemTipo', label: 'Que tipo de bem? (ex: imóvel, veículo)', tipo: 'text' },
    ],
  },
  {
    field: 'possuiContaBancaria',
    label: 'Possui conta corrente, poupança ou aplicações financeiras?',
  },
  {
    field: 'possuiEmpresaExterior',
    label: 'Possui empresa no exterior?',
  },
  {
    field: 'enviouRemessaExterior',
    label: 'Enviou remessa de valores para o exterior?',
  },
  {
    field: 'possuiContaBancariaExterior',
    label: 'Possui conta bancária no exterior?',
  },
];

const STEPS = [
  { label: 'Identificação', icon: 'eva:person-fill', desc: 'Seus dados pessoais' },
  { label: 'Situação fiscal', icon: 'eva:file-text-fill', desc: 'Sobre o ano fiscal' },
  { label: 'Despesas', icon: 'eva:credit-card-fill', desc: 'Deduções e comprovantes' },
  { label: 'Resumo e envio', icon: 'eva:checkmark-circle-fill', desc: 'Revisar e enviar' },
];

const FORM_VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  declarouIrUltimoAno: null,
  possuiDependentes: null,
  dependentesTipos: [],
  dependentesDetalhes: {
    conjuge: { declarar: null, cpf: '' },
    filhos: { declarar: null, filhos: [] }, // filhos: [{ cpf: '', dataNascimento: '' }, ...]
    pais: { declarar: null, cpf: '' },
  },
  trabalhouAutonomo: null,
  emitirNotaAutonomo: null,
  trabalhouClt: null,
  quantidadeEmpregosClt: '',
  compraVendaBem: null,
  compraVendaBemTipo: '',
  possuiContaBancaria: null,
  possuiEmpresaExterior: null,
  enviouRemessaExterior: null,
  possuiContaBancariaExterior: null,
  solicitacaoEspecifica: '',
  senhaGov: '',
  despesas: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

function calcularStepsSalvos(formulario, coletaEnviada) {
  if (!formulario) return [];
  const salvos = [];
  if (formulario.nome || formulario.email) salvos.push(0);
  const respondidas = PERGUNTAS_FISCAIS.filter(
    (p) => formulario[p.field] !== null && formulario[p.field] !== undefined
  );
  if (respondidas.length > 0) salvos.push(1);
  if (Array.isArray(formulario.despesas)) salvos.push(2);
  if (coletaEnviada) salvos.push(3);
  return salvos;
}

function detectarStepInicial(formulario, coletaEnviada) {
  if (!formulario) return 0;
  if (!formulario.nome && !formulario.email) return 0;
  const fiscalRespondidas = PERGUNTAS_FISCAIS.filter(
    (p) => formulario[p.field] !== null && formulario[p.field] !== undefined
  ).length;
  if (fiscalRespondidas === 0) return 1;
  if (!Array.isArray(formulario.despesas)) return 2;
  return coletaEnviada ? 3 : 2;
}

function formatData(isoString) {
  try { return format(parseISO(isoString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); }
  catch { return ''; }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function BoolRadio({ label, value, onChange, disabled, compact = false }) {
  return (
    <Box
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: value === true ? 'primary.light' : 'divider',
        bgcolor: value === true ? (t) => alpha(t.palette.primary.main, 0.06) : 'background.paper',
        transition: 'all 0.15s',
      }}
    >
      <FormControl component="fieldset" disabled={disabled} sx={{ width: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <FormLabel
            component="legend"
            sx={{
              typography: compact ? 'caption' : 'body2',
              color: 'text.primary',
              '&.Mui-focused': { color: 'text.primary' },
              flex: 1,
            }}
          >
            {label}
          </FormLabel>
          <RadioGroup
            row
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === 'true')}
          >
            <FormControlLabel value="true" control={<Radio size="small" />} label="Sim" sx={{ mr: 1 }} />
            <FormControlLabel value="false" control={<Radio size="small" />} label="Não" sx={{ mr: 0 }} />
          </RadioGroup>
        </Stack>
      </FormControl>
    </Box>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={20} color="primary.main" />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Stack>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function IrColetaView({ token }) {
  const { data: order, isLoading, error, mutate } = useGetPedidoPorToken(token);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [stepsSalvos, setStepsSalvos] = useState([]);
  const [pendente, setPendente] = useState(false);
  const [coletaEnviada, setColetaEnviada] = useState(false);

  const [modalDespesa, setModalDespesa] = useState(null);
  const [modalUploadFiscal, setModalUploadFiscal] = useState(null);
  const [modalSemDespesas, setModalSemDespesas] = useState(false);
  const [timerSemDespesas, setTimerSemDespesas] = useState(15);
  const [cienteSemDespesas, setCienteSemDespesas] = useState(false);
  const [enviandoColeta, setEnviandoColeta] = useState(false);
  const [showSenhaGov, setShowSenhaGov] = useState(false);

  const autoSaveTimer = useRef(null);
  const iniciado = useRef(false);

  // Comprador: API retorna comprador (ou dadosComprador para compatibilidade)
  const comprador = order?.comprador || order?.dadosComprador;

  // Inicializa form a partir da API (apenas uma vez)
  useEffect(() => {
    if (!order || iniciado.current) return;
    iniciado.current = true;
    const enviada = order.status === 'finalizada';
    if (enviada) setColetaEnviada(true);

    const f = order.formulario;
    const dc = order.comprador || order.dadosComprador;
    setStepsSalvos(calcularStepsSalvos(f, enviada));
    setStep(detectarStepInicial(f, enviada));

    setForm({
      nome: f?.nome ?? dc?.nome ?? '',
      email: f?.email ?? dc?.email ?? '',
      telefone: f?.telefone ?? dc?.telefone ?? '',
      dataNascimento: f?.dataNascimento ? f.dataNascimento.split('T')[0] : '',
      declarouIrUltimoAno: f?.declarouIrUltimoAno ?? null,
      possuiDependentes: f?.possuiDependentes ?? null,
      dependentesTipos: f?.dependentesTipos || [],
      dependentesDetalhes: (() => {
        const dd = f?.dependentesDetalhes || FORM_VAZIO.dependentesDetalhes;
        const def = FORM_VAZIO.dependentesDetalhes;
        const filhosRaw = dd?.filhos;
        const filhosNorm = !filhosRaw
          ? def.filhos
          : Array.isArray(filhosRaw.filhos)
            ? { declarar: filhosRaw.declarar ?? def.filhos.declarar, filhos: filhosRaw.filhos }
            : { declarar: filhosRaw.declarar ?? def.filhos.declarar, filhos: filhosRaw.cpfs ? [{ cpf: filhosRaw.cpfs, dataNascimento: '' }] : [] };
        return { ...def, ...dd, filhos: filhosNorm };
      })(),
      trabalhouAutonomo: f?.trabalhouAutonomo ?? null,
      emitirNotaAutonomo: f?.emitirNotaAutonomo ?? null,
      trabalhouClt: f?.trabalhouClt ?? null,
      quantidadeEmpregosClt: f?.quantidadeEmpregosClt ?? '',
      compraVendaBem: f?.compraVendaBem ?? null,
      compraVendaBemTipo: f?.compraVendaBemTipo || '',
      possuiContaBancaria: f?.possuiContaBancaria ?? null,
      possuiEmpresaExterior: f?.possuiEmpresaExterior ?? null,
      enviouRemessaExterior: f?.enviouRemessaExterior ?? null,
      possuiContaBancariaExterior: f?.possuiContaBancariaExterior ?? null,
      solicitacaoEspecifica: f?.solicitacaoEspecifica || '',
      senhaGov: f?.senhaGov || '',
      despesas: f?.despesas || [],
    });
  }, [order]);

  const setField = (field, value) => {
    setPendente(true);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        salvarFormularioColeta(token, { [field]: value })
          .then(() => mutate((c) => ({ ...c, formularioPreenchido: true }), false))
          .catch(() => { });
      }, 3000);
    }
  };

  const toggleDespesa = (value) => {
    const jaSelecionado = form.despesas.includes(value);
    const docInfo = DOCS_REQUERIDOS_POR_DESPESA[value];
    setPendente(true);
    if (jaSelecionado) {
      setForm((prev) => ({ ...prev, despesas: prev.despesas.filter((d) => d !== value) }));
    } else {
      setForm((prev) => ({ ...prev, despesas: [...prev.despesas, value] }));
      if (docInfo) setModalDespesa({ value, ...docInfo });
    }
  };

  const toggleDependenteTipo = (tipo) => {
    setPendente(true);
    setForm((prev) => {
      const next = prev.dependentesTipos.includes(tipo)
        ? prev.dependentesTipos.filter((t) => t !== tipo)
        : [...prev.dependentesTipos, tipo];
      const detalhes = { ...prev.dependentesDetalhes };
      if (!next.includes(tipo)) {
        detalhes[tipo] = tipo === 'filhos'
          ? { declarar: null, filhos: [] }
          : { declarar: null, cpf: '', cpfs: '' };
      }
      return { ...prev, dependentesTipos: next, dependentesDetalhes: detalhes };
    });
  };

  const setDetalheDependente = (tipo, field, value) => {
    setPendente(true);
    setForm((prev) => ({
      ...prev,
      dependentesDetalhes: {
        ...prev.dependentesDetalhes,
        [tipo]: { ...prev.dependentesDetalhes[tipo], [field]: value },
      },
    }));
  };

  const addFilho = () => {
    setPendente(true);
    setForm((prev) => {
      const current = prev.dependentesDetalhes.filhos || { declarar: null, filhos: [] };
      const filhos = Array.isArray(current.filhos) ? current.filhos : [];
      return {
        ...prev,
        dependentesDetalhes: {
          ...prev.dependentesDetalhes,
          filhos: { ...current, filhos: [...filhos, { cpf: '', dataNascimento: '' }] },
        },
      };
    });
  };

  const removeFilho = (index) => {
    setPendente(true);
    setForm((prev) => {
      const current = prev.dependentesDetalhes.filhos || { declarar: null, filhos: [] };
      const filhos = Array.isArray(current.filhos) ? current.filhos : [];
      return {
        ...prev,
        dependentesDetalhes: {
          ...prev.dependentesDetalhes,
          filhos: { ...current, filhos: filhos.filter((_, i) => i !== index) },
        },
      };
    });
  };

  const setFilho = (index, field, value) => {
    setPendente(true);
    setForm((prev) => {
      const current = prev.dependentesDetalhes.filhos || { declarar: null, filhos: [] };
      const filhos = [...(Array.isArray(current.filhos) ? current.filhos : [])];
      if (!filhos[index]) return prev;
      filhos[index] = { ...filhos[index], [field]: value };
      return {
        ...prev,
        dependentesDetalhes: {
          ...prev.dependentesDetalhes,
          filhos: { ...current, filhos },
        },
      };
    });
  };

  useEffect(() => {
    if (!modalSemDespesas) return undefined;
    setTimerSemDespesas(15);
    setCienteSemDespesas(false);
    const interval = setInterval(() => {
      setTimerSemDespesas((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [modalSemDespesas]);

  const handleEnviarColeta = async () => {
    setEnviandoColeta(true);
    try {
      await salvarPayload(form);
      await submeterValidacaoPorToken(token, form);
      setColetaEnviada(true);
      setStepsSalvos((prev) => [...new Set([...prev, 3])]);
      mutate();
      toast.success('Declaração enviada com sucesso! Nossa equipe validará seus documentos.');
    } catch (err) {
      toast.error(err?.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setEnviandoColeta(false);
    }
  };

  const salvarPayload = useCallback(async (payload) => {
    const clean = { ...payload };
    if (!clean.dataNascimento) delete clean.dataNascimento;
    const result = await salvarFormularioColeta(token, clean);
    mutate((c) => ({ ...c, formulario: result.formulario, formularioPreenchido: true }), false);
    return result;
  }, [token, mutate]);

  const handleAvancar = async () => {
    if (step === 2 && form.despesas.length === 0) {
      setModalSemDespesas(true);
      return;
    }
    setSalvandoForm(true);
    clearTimeout(autoSaveTimer.current);
    try {
      await salvarPayload(form);
      setStepsSalvos((prev) => [...new Set([...prev, step])]);
      setPendente(false);
      setStep((s) => s + 1);
    } catch (err) {
      toast.error(err?.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoForm(false);
    }
  };


  // ─── Loading / Erro ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Carregando seus dados…</Typography>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2} py={5}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'error.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="eva:alert-circle-fill" width={36} color="error.main" />
              </Box>
              <Typography variant="h5" textAlign="center">Link inválido ou expirado</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Não foi possível encontrar o pedido associado a este link.
                Verifique o link enviado por WhatsApp ou entre em contato conosco.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isFinalized = order.status === 'finalizada';
  const statusAposColeta = ['em_validacao', 'em_processo', 'finalizada'].includes(order.status || '');

  const opcoesDespesas = order.opcoesDespesas
    ? order.opcoesDespesas.map((v) => OPCOES_DESPESAS.find((o) => o.value === v) || { value: v, label: v, icon: 'eva:checkmark-outline' })
    : OPCOES_DESPESAS;

  const documentos = order.documents || [];
  const tiposJaEnviados = new Set(documentos.map((doc) => doc.tipo_documento));

  // Progresso geral (0–100)
  const progressoTotal = stepsSalvos.length === 0 ? 0 : Math.round((stepsSalvos.length / TOTAL_STEPS) * 100);

  // ─── Render: status em_validacao / em_processo / finalizada (página completa, sem expor dados) ─
  if (statusAposColeta) {
    const conteudoPorStatus = {
      em_validacao: {
        titulo: 'Documentos em validação',
        subtitulo: 'Seus documentos foram recebidos e estão sendo analisados pela nossa equipe.',
        icon: 'eva:search-outline',
        iconBg: 'info',
        passos: [
          { icon: 'eva:checkmark-circle-2-fill', text: 'Conferindo a integridade e legibilidade dos arquivos enviados' },
          { icon: 'eva:file-text-outline', text: 'Validando as informações do questionário e cruzamento com os comprovantes' },
          { icon: 'eva:people-outline', text: 'Verificando dependentes e demais situações declaradas' },
        ],
        enquantoIsso: [
          'Mantenha o WhatsApp disponível — entraremos em contato caso precisemos de algum documento adicional ou esclarecimento.',
          'Não é necessário reenviar documentos, a menos que solicitemos.',
        ],
        proximosPassos: 'Após a validação, sua declaração seguirá para elaboração e você será notificado em cada etapa.',
      },
      em_processo: {
        titulo: 'Declaração em elaboração',
        subtitulo: 'Sua declaração de IR está sendo preparada pela nossa equipe com base nos documentos e informações enviados.',
        icon: 'eva:file-text-outline',
        iconBg: 'primary',
        passos: [
          { icon: 'eva:edit-2-outline', text: 'Lançamento dos dados e despesas na declaração' },
          { icon: 'eva:shield-outline', text: 'Revisão técnica e conferência dos valores e informes' },
          { icon: 'eva:checkmark-done-2-outline', text: 'Preparação do arquivo final e do recibo para entrega' },
        ],
        enquantoIsso: [
          'O prazo médio de elaboração varia conforme a complexidade; em caso de urgência, entre em contato conosco.',
          'Assim que a declaração for finalizada, você receberá a notificação por WhatsApp e e-mail com o link para download.',
        ],
        proximosPassos: 'Você receberá a declaração e o recibo para download. Guarde os arquivos para envio à Receita Federal dentro do prazo.',
      },
      finalizada: {
        titulo: 'Declaração entregue',
        subtitulo: 'Sua declaração foi concluída e enviada. Obrigado por confiar em nós.',
        icon: 'eva:checkmark-circle-2-fill',
        iconBg: 'success',
        passos: [
          { icon: 'eva:download-outline', text: 'Acesse o seu e-mail para baixar a declaração e o recibo' },
          { icon: 'eva:calendar-outline', text: 'Valide a declaração dentro do prazo estabelecido' },
          { icon: 'eva:archive-outline', text: 'Guarde uma cópia dos arquivos e dos comprovantes para seus registros' },
        ],
        enquantoIsso: [],
        proximosPassos: null,
      },
    };
    const c = conteudoPorStatus[order.status] || conteudoPorStatus.em_validacao;

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.neutral' }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box textAlign="center">
              <Stack direction="row" spacing={1} justifyContent="center" mb={1.5}>
                <Chip label={`IR ${order.year ?? order.ano}`} color="primary" />
                {order.modalidade && (
                  <Chip
                    label={{ basica: 'Básica', intermediaria: 'Intermediária', completa: 'Completa' }[order.modalidade] ?? order.modalidade}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Acompanhamento do pedido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acompanhe o status da sua declaração de Imposto de Renda.
              </Typography>
            </Box>

            {/* Card principal — Status atual */}
            <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
              <Box
                sx={{
                  py: 3,
                  px: 2.5,
                  bgcolor: (t) => alpha(t.palette[c.iconBg]?.main || t.palette.primary.main, 0.08),
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (t) => alpha(t.palette[c.iconBg]?.main || t.palette.primary.main, 0.16),
                    }}
                  >
                    <Iconify icon={c.icon} width={32} sx={{ color: `${c.iconBg}.main` }} />
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {c.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.subtitulo}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                {/* O que estamos fazendo / O que fazer */}
                {c.passos?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1.5 }}>
                      {order.status === 'finalizada' ? 'O que fazer agora' : 'O que estamos fazendo'}
                    </Typography>
                    <Stack spacing={1.5}>
                      {c.passos.map((item, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Iconify
                            icon={item.icon}
                            width={22}
                            sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }}
                          />
                          <Typography variant="body2" color="text.primary">
                            {item.text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}

                {/* Enquanto isso (em_validacao e em_processo) */}
                {c.enquantoIsso?.length > 0 && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1.5 }}>
                      Enquanto isso
                    </Typography>
                    <Stack spacing={1.5}>
                      {c.enquantoIsso.map((texto, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Iconify icon="eva:info-outline" width={20} sx={{ color: 'info.main', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {texto}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                )}

                {/* Próximos passos */}
                {c.proximosPassos && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                      Próximos passos
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {c.proximosPassos}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Dúvidas */}
            <Alert severity="info" icon={<Iconify icon="eva:message-circle-outline" width={24} />} sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Dúvidas ou necessidade de algo mais?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entre em contato conosco pelo WhatsApp ou e-mail informado no seu pedido. Nossa equipe está à disposição para ajudar.
              </Typography>
            </Alert>
          </Stack>
        </Container>
      </Box>
    );
  }

  // ─── Render: coletando_documentos (formulário e dados) ──────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.neutral' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>

          {/* Header */}
          <Box textAlign="center">
            <Stack direction="row" spacing={1} justifyContent="center" mb={1.5}>
              <Chip label={`IR ${order.year ?? order.ano}`} color="primary" />
              {order.modalidade && (
                <Chip
                  label={{ basica: 'Básica', intermediaria: 'Intermediária', completa: 'Completa' }[order.modalidade] ?? order.modalidade}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Portal de envio de documentos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha o questionário e envie seus documentos para agilizarmos sua declaração.
            </Typography>
          </Box>

          {/* Card de informações do pedido (nome, email, telefone do comprador) */}
          {(() => {
            const nomeCliente = order.formulario?.nome || comprador?.nome || order.userId?.name || '—';
            const emailCliente = order.formulario?.email || comprador?.email || order.userId?.email || '—';
            const cpf = comprador?.cpfCnpj;
            const telefone = order.formulario?.telefone || comprador?.telefone;
            const modalidadeLabel = { basica: 'IR Básica', intermediaria: 'IR Intermediária', completa: 'IR Completa' }[order.modalidade];
            return (
              <Card sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.04), border: '1px solid', borderColor: 'primary.lighter' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Iconify icon="eva:person-fill" width={18} sx={{ color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">{nomeCliente}</Typography>
                      <Typography variant="caption" color="text.secondary">{emailCliente}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    <Chip size="small" label={`IR ${order.year ?? order.ano}`} color="primary" variant="soft" />
                    {modalidadeLabel && <Chip size="small" label={modalidadeLabel} color="default" variant="outlined" />}
                    {order.lote && <Chip size="small" label={`${order.lote}º Lote`} color="default" variant="outlined" />}
                    {cpf && (
                      <Chip size="small" icon={<Iconify icon="eva:person-outline" width={14} />} label={cpf} color="default" variant="outlined" />
                    )}
                    {telefone && (
                      <Chip size="small" icon={<Iconify icon="eva:phone-outline" width={14} />} label={telefone} color="default" variant="outlined" />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })()}

          {/* Progresso geral */}
          {!isFinalized && (
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Seu progresso</Typography>
                <Typography variant="subtitle2" color="primary.main">{progressoTotal}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressoTotal}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'divider' }}
              />
              <Stack direction="row" justifyContent="space-between" mt={1.5} flexWrap="wrap" gap={1}>
                {STEPS.map((s, idx) => {
                  const concluido = stepsSalvos.includes(idx);
                  const atual = step === idx;
                  const acessivel = concluido || idx <= step;
                  return (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      onClick={() => { if (acessivel) setStep(idx); }}
                      sx={{ cursor: acessivel ? 'pointer' : 'default', opacity: acessivel ? 1 : 0.4 }}
                    >
                      <Box
                        sx={{
                          width: 22, height: 22, borderRadius: '50%',
                          bgcolor: concluido ? 'success.main' : atual ? 'primary.main' : 'divider',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {concluido
                          ? <Iconify icon="eva:checkmark-fill" width={12} sx={{ color: '#fff' }} />
                          : <Typography variant="caption" sx={{ color: atual ? '#fff' : 'text.secondary', fontSize: 10, fontWeight: 700 }}>{idx + 1}</Typography>
                        }
                      </Box>
                      <Typography
                        variant="caption"
                        color={atual ? 'primary.main' : concluido ? 'success.main' : 'text.secondary'}
                        fontWeight={atual ? 700 : 400}
                      >
                        {s.label}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Card>
          )}

          {isFinalized && (
            <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" width={24} />} sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2">Declaração entregue!</Typography>
              <Typography variant="body2">Sua declaração já foi concluída. Acesse o portal do cliente para baixar o arquivo.</Typography>
            </Alert>
          )}

          {/* Conteúdo por fase */}
          {!isFinalized && (
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>

                {/* ── STEP 0: Identificação ── */}
                {step === 0 && (
                  <Stack spacing={2.5}>
                    <SectionTitle icon="eva:person-fill" title="Seus dados pessoais" subtitle="Precisamos confirmar quem vai declarar o IR" />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField label="Nome completo" value={form.nome} onChange={(e) => setField('nome', e.target.value)} size="small" fullWidth disabled={salvandoForm} />
                      <TextField label="E-mail" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} size="small" fullWidth disabled={salvandoForm} />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <PhoneInput
                        country="BR"
                        label="Telefone / WhatsApp"
                        value={normalizePhoneToE164(form.telefone) || undefined}
                        onChange={(newValue) => setField('telefone', newValue ?? '')}
                        size="small"
                        fullWidth
                        disabled={salvandoForm}
                      />
                      <TextField label="Data de nascimento" type="date" value={form.dataNascimento} onChange={(e) => setField('dataNascimento', e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} disabled={salvandoForm} />
                    </Stack>
                    {pendente && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Iconify icon="eva:clock-outline" width={14} color="text.disabled" />
                        <Typography variant="caption" color="text.disabled">Salvando automaticamente…</Typography>
                      </Stack>
                    )}
                  </Stack>
                )}

                {/* ── STEP 1: Situação fiscal ── */}
                {step === 1 && (
                  <Stack spacing={2}>
                    <SectionTitle icon="eva:file-text-fill" title="Situação fiscal no ano" subtitle="Responda com base no último ano fiscal" />

                    {PERGUNTAS_FISCAIS.map(({ field, label, subPerguntas }) => (
                      <Box key={field}>
                        <BoolRadio
                          label={label}
                          value={form[field]}
                          onChange={(v) => {
                            setField(field, v);
                            if (!v && subPerguntas) {
                              subPerguntas.forEach((sp) => setField(sp.field, sp.tipo === 'text' ? '' : null));
                            }
                            if (field === 'possuiDependentes' && !v) {
                              setForm((prev) => ({ ...prev, dependentesTipos: [], dependentesDetalhes: FORM_VAZIO.dependentesDetalhes }));
                            }
                          }}
                          disabled={salvandoForm}
                        />

                        {/* Dependentes: multi-select (Cônjuge, Filhos, Pais) + declarar como dependente + CPFs */}
                        {field === 'possuiDependentes' && form.possuiDependentes === true && (
                          <Collapse in>
                            <Stack spacing={1.5} mt={1.5} pl={2} sx={{ borderLeft: '3px solid', borderColor: 'primary.lighter' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Quais? (marque os que se aplicam)
                              </Typography>
                              <Stack direction="row" flexWrap="wrap" gap={1}>
                                {TIPOS_DEPENDENTES.map(({ value, label: l }) => {
                                  const sel = form.dependentesTipos.includes(value);
                                  return (
                                    <Chip
                                      key={value}
                                      label={l}
                                      onClick={() => toggleDependenteTipo(value)}
                                      color={sel ? 'primary' : 'default'}
                                      variant={sel ? 'filled' : 'outlined'}
                                      size="small"
                                      sx={{ cursor: 'pointer' }}
                                    />
                                  );
                                })}
                              </Stack>
                              {form.dependentesTipos.length > 0 && (
                                <Stack spacing={1.5} mt={1}>
                                  {form.dependentesTipos.map((tipo) => {
                                    const isFilhos = tipo === 'filhos';
                                    const det = form.dependentesDetalhes[tipo] || (isFilhos ? { declarar: null, filhos: [] } : { declarar: null, cpf: '', cpfs: '' });
                                    const filhosList = isFilhos && Array.isArray(det.filhos) ? det.filhos : [];
                                    return (
                                      <Box key={tipo} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
                                        <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                                          {TIPOS_DEPENDENTES.find((t) => t.value === tipo)?.label}
                                        </Typography>
                                        <BoolRadio
                                          label="Vai declarar como dependente no IR?"
                                          value={det.declarar}
                                          onChange={(v) => setDetalheDependente(tipo, 'declarar', v)}
                                          disabled={salvandoForm}
                                          compact
                                        />
                                        {isFilhos ? (
                                          <>
                                            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                                              {filhosList.map((filho, idx) => (
                                                <Box
                                                  key={idx}
                                                  sx={{
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    bgcolor: 'background.paper',
                                                  }}
                                                >
                                                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="caption" color="text.secondary">Filho {idx + 1}</Typography>
                                                    <Button
                                                      size="small"
                                                      color="error"
                                                      startIcon={<Iconify icon="eva:trash-2-outline" width={16} />}
                                                      onClick={() => removeFilho(idx)}
                                                      disabled={salvandoForm}
                                                    >
                                                      Remover
                                                    </Button>
                                                  </Stack>
                                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                                    <TextField
                                                      label="CPF"
                                                      value={filho.cpf || ''}
                                                      onChange={(e) => setFilho(idx, 'cpf', e.target.value)}
                                                      size="small"
                                                      fullWidth
                                                      placeholder="000.000.000-00"
                                                      disabled={salvandoForm}
                                                    />
                                                    <TextField
                                                      label="Data de nascimento"
                                                      type="date"
                                                      value={filho.dataNascimento || ''}
                                                      onChange={(e) => setFilho(idx, 'dataNascimento', e.target.value)}
                                                      size="small"
                                                      fullWidth
                                                      InputLabelProps={{ shrink: true }}
                                                      disabled={salvandoForm}
                                                    />
                                                  </Stack>
                                                </Box>
                                              ))}
                                            </Stack>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              startIcon={<Iconify icon="eva:plus-outline" width={18} />}
                                              onClick={addFilho}
                                              disabled={salvandoForm}
                                              sx={{ mt: 1 }}
                                            >
                                              Adicionar filho
                                            </Button>
                                          </>
                                        ) : (
                                          det.declarar === true && (
                                            <TextField
                                              label="CPF"
                                              value={det.cpf || ''}
                                              onChange={(e) => setDetalheDependente(tipo, 'cpf', e.target.value)}
                                              size="small"
                                              fullWidth
                                              sx={{ mt: 1 }}
                                              placeholder="000.000.000-00"
                                              disabled={salvandoForm}
                                            />
                                          )
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Stack>
                              )}
                            </Stack>
                          </Collapse>
                        )}

                        {/* Sub-perguntas condicionais */}
                        {subPerguntas && form[field] === true && (
                          <Collapse in>
                            <Stack spacing={1.5} mt={1} pl={2} sx={{ borderLeft: '3px solid', borderColor: 'primary.lighter' }}>
                              {subPerguntas.map((sp) => {
                                if (sp.tipo === 'text') {
                                  return (
                                    <TextField
                                      key={sp.field}
                                      label={sp.label}
                                      value={form[sp.field] || ''}
                                      onChange={(e) => setField(sp.field, e.target.value)}
                                      size="small"
                                      fullWidth
                                      disabled={salvandoForm}
                                      placeholder="Descreva brevemente"
                                    />
                                  );
                                }
                                if (sp.tipo === 'number') {
                                  return (
                                    <TextField
                                      key={sp.field}
                                      label={sp.label}
                                      type="number"
                                      value={form[sp.field] ?? ''}
                                      onChange={(e) => setField(sp.field, e.target.value)}
                                      size="small"
                                      fullWidth
                                      disabled={salvandoForm}
                                      inputProps={{ min: 1 }}
                                      placeholder="1"
                                    />
                                  );
                                }
                                return (
                                  <BoolRadio
                                    key={sp.field}
                                    label={sp.label}
                                    value={form[sp.field]}
                                    onChange={(v) => setField(sp.field, v)}
                                    disabled={salvandoForm}
                                    compact
                                  />
                                );
                              })}
                            </Stack>
                          </Collapse>
                        )}

                        {/* Botão de anexar documentos por tipo (abre modal) */}
                        {[
                          { field: 'trabalhouClt', condition: form.trabalhouClt === true, tipoDoc: TIPO_DOC_INFORME_CLT },
                          { field: 'compraVendaBem', condition: form.compraVendaBem === true, tipoDoc: TIPO_DOC_COMPRA_VENDA },
                          { field: 'possuiContaBancaria', condition: form.possuiContaBancaria === true, tipoDoc: TIPO_DOC_INFORME_RENDIMENTOS },
                          { field: 'possuiEmpresaExterior', condition: form.possuiEmpresaExterior === true, tipoDoc: TIPO_DOC_EMPRESA_EXTERIOR },
                          { field: 'enviouRemessaExterior', condition: form.enviouRemessaExterior === true, tipoDoc: TIPO_DOC_REMESSA_EXTERIOR },
                          { field: 'possuiContaBancariaExterior', condition: form.possuiContaBancariaExterior === true, tipoDoc: TIPO_DOC_CONTA_EXTERIOR },
                        ]
                          .filter((u) => u.field === field && u.condition)
                          .map((u) => {
                            const cfg = UPLOAD_FISCAL_CONFIG[u.tipoDoc] || {};
                            const count = documentos.filter((d) => d.tipo_documento === u.tipoDoc).length;
                            return (
                              <Box key={u.tipoDoc} sx={{ mt: 1.5, p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                  <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2">{cfg.titulo}</Typography>
                                    {count > 0 ? (
                                      <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
                                        <Typography variant="caption" color="success.main" fontWeight={600}>
                                          {count} arquivo(s) enviado(s)
                                        </Typography>
                                      </Stack>
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        Nenhum arquivo enviado
                                      </Typography>
                                    )}
                                  </Stack>
                                  <Button
                                    variant={count > 0 ? 'outlined' : 'contained'}
                                    size="small"
                                    onClick={() => setModalUploadFiscal(u.tipoDoc)}
                                    startIcon={<Iconify icon={count > 0 ? 'eva:edit-2-outline' : 'eva:cloud-upload-outline'} width={18} />}
                                  >
                                    {count > 0 ? 'Gerenciar' : 'Anexar'}
                                  </Button>
                                </Stack>
                              </Box>
                            );
                          })}
                      </Box>
                    ))}

                    {/* Solicitação específica */}
                    <TextField
                      label="Existe mais alguma solicitação específica para a declaração?"
                      value={form.solicitacaoEspecifica}
                      onChange={(e) => setField('solicitacaoEspecifica', e.target.value)}
                      multiline
                      rows={3}
                      size="small"
                      fullWidth
                      placeholder="Descreva aqui, se houver."
                      disabled={salvandoForm}
                    />

                    {/* Senha Gov */}
                    <TextField
                      required
                      label="Senha GOV"
                      type={showSenhaGov ? 'text' : 'password'}
                      value={form.senhaGov || ''}
                      onChange={(e) => setField('senhaGov', e.target.value)}
                      fullWidth
                      placeholder="Senha do gov.br"
                      disabled={salvandoForm}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowSenhaGov((prev) => !prev)}
                              edge="end"
                              tabIndex={-1}
                            >
                              <Iconify
                                icon={showSenhaGov ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                                width={18}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                )}

                {/* ── STEP 2: Despesas ── */}
                {step === 2 && (
                  <Stack spacing={2}>
                    <SectionTitle icon="eva:credit-card-fill" title="Despesas dedutíveis" subtitle="Selecione as despesas que você teve — podem reduzir o imposto" />
                    <Stack spacing={1.5}>
                      {opcoesDespesas.map((opcao) => {
                        const selecionado = form.despesas.includes(opcao.value);
                        return (
                          <Box
                            key={opcao.value}
                            onClick={() => toggleDespesa(opcao.value)}
                            sx={{
                              p: 1.75,
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: selecionado ? 'primary.main' : 'divider',
                              bgcolor: selecionado ? (t) => alpha(t.palette.primary.main, 0.06) : 'background.paper',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: 'primary.light' },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 36, height: 36, borderRadius: 1, flexShrink: 0,
                                  bgcolor: selecionado ? 'primary.main' : (t) => alpha(t.palette.text.primary, 0.06),
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <Iconify icon={opcao.icon} width={18} color={selecionado ? '#fff' : 'text.secondary'} />
                              </Box>
                              <Typography variant="body2" flex={1}>{opcao.label}</Typography>
                              {selecionado && <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                    {form.despesas.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Selecionadas (clique para anexar/ver comprovante ou no × para remover):
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {form.despesas.map((d) => (
                            <Chip
                              key={d}
                              label={opcoesDespesas.find((o) => o.value === d)?.label || d}
                              size="small"
                              color="primary"
                              variant="soft"
                              onClick={() => toggleDespesa(d)}
                              onDelete={() => toggleDespesa(d)}
                            />
                          ))}
                        </Stack>
                      </Stack>
                    )}
                    {form.despesas.length === 0 && (
                      <Typography variant="caption" color="text.secondary" textAlign="center" display="block" py={1}>
                        Nenhuma selecionada — prossiga se não tiver despesas a declarar.
                      </Typography>
                    )}
                  </Stack>
                )}

                {/* ── STEP 3: Resumo e envio ── */}
                {step === 3 && (
                  <Stack spacing={3}>
                    <SectionTitle icon="eva:checkmark-circle-fill" title="Resumo e envio" subtitle="Revise as informações e envie para nossa equipe" />

                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Resumo</Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2"><strong>Nome:</strong> {form.nome || '—'}</Typography>
                        <Typography variant="body2"><strong>E-mail:</strong> {form.email || '—'}</Typography>
                        <Typography variant="body2"><strong>Telefone:</strong> {form.telefone || '—'}</Typography>
                        {form.despesas.length > 0 && (
                          <Typography variant="body2"><strong>Despesas selecionadas:</strong> {form.despesas.map((d) => OPCOES_DESPESAS.find((o) => o.value === d)?.label || d).join(', ')}</Typography>
                        )}
                        {documentos.length > 0 && (
                          <Typography variant="body2"><strong>Documentos anexados:</strong> {documentos.length} arquivo(s)</Typography>
                        )}
                      </Stack>
                    </Card>

                    {documentos.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Documentos enviados</Typography>
                        <IrDocumentList documents={documentos} />
                      </Box>
                    )}

                    {!coletaEnviada ? (
                      <>
                        <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                          Ao clicar em &quot;Enviar declaração&quot;, seus dados e documentos serão enviados para nossa equipe. Você poderá ser contactado em caso de necessidade de mais informações.
                        </Alert>
                        <LoadingButton
                          variant="contained"
                          size="large"
                          fullWidth
                          loading={enviandoColeta}
                          onClick={handleEnviarColeta}
                          startIcon={<Iconify icon="eva:paper-plane-fill" />}
                        >
                          Enviar declaração
                        </LoadingButton>
                      </>
                    ) : (
                      <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" width={24} />} sx={{ borderRadius: 1.5 }}>
                        <Typography variant="subtitle2">Declaração enviada!</Typography>
                        <Typography variant="body2">Nossa equipe analisará seus documentos e entrará em contato se necessário.</Typography>
                      </Alert>
                    )}
                  </Stack>
                )}

                {/* Navegação (steps 0, 1, 2) */}
                {step < 3 && (
                  <>
                    <Divider sx={{ mt: 3, mb: 2.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Button
                        variant="text"
                        color="inherit"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0 || salvandoForm}
                        startIcon={<Iconify icon="eva:arrow-back-fill" />}
                      >
                        Voltar
                      </Button>
                      <LoadingButton
                        variant="contained"
                        size="large"
                        loading={salvandoForm}
                        onClick={handleAvancar}
                        endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                      >
                        Próxima etapa
                      </LoadingButton>
                    </Stack>
                  </>
                )}

              </CardContent>
            </Card>
          )}

          {/* Banner de retomada */}
          {!isFinalized && order.formularioPreenchido && step < 3 && (
            <Alert severity="info" icon={<Iconify icon="eva:save-fill" width={18} />} sx={{ borderRadius: 2 }}>
              Seu progresso é salvo automaticamente. Pode fechar e continuar depois pelo mesmo link.
            </Alert>
          )}

          <Typography variant="caption" color="text.disabled" textAlign="center">
            Portal de coleta — Attualize Contabilidade
          </Typography>

          <Dialog
            open={modalSemDespesas}
            onClose={() => { }}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2.5,
                p: { xs: 1, sm: 2 },
              },
            }}
            slotProps={{
              backdrop: {
                sx: { backdropFilter: 'blur(6px)', bgcolor: 'rgba(0,0,0,0.72)' },
              },
            }}
          >
            <DialogTitle
              component="div"
              sx={{ pb: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              <Box
                sx={(theme) => ({
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 171, 0, 0.16)'
                    : 'rgba(255, 171, 0, 0.12)',
                })}
              >
                <Iconify icon="eva:alert-triangle-fill" width={36} sx={{ color: 'error.main' }} />
              </Box>
              <Typography
                variant="h5"
                component="div"
                textAlign="center"
              >
                Nenhum documento selecionado
              </Typography>
              <Divider sx={{ width: '100%', borderStyle: 'dashed', mt: 1 }} />
            </DialogTitle>

            <DialogContent sx={{ pb: 3, pt: 3 }}>
              <Stack spacing={3} alignItems="center">

                <Alert
                  severity="error"
                  icon={false}
                  sx={{
                    borderRadius: 2,
                    textAlign: 'center',
                    width: '100%',
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <Typography variant="subtitle1" component="div" fontWeight="bold" gutterBottom>
                    Você não selecionou nenhuma despesa dedutível.
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ opacity: 0.85 }}>
                    As despesas dedutíveis (como plano de saúde, educação e previdência privada)
                    são fundamentais para a correta transmissão da sua declaração à{' '}
                    <strong>Receita Federal</strong>. Declarar sem esses dados pode resultar em{' '}
                    <strong>imposto a pagar maior</strong> ou perda de restituição.
                  </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 480 }}>
                  Caso realmente não possua nenhum documento ou despesa dedutível a informar, leia
                  atentamente e confirme sua ciência abaixo.
                </Typography>

                <Box
                  sx={(theme) => ({
                    width: '100%',
                    borderRadius: 2,
                    p: 3,
                    border: '1px dashed',
                    borderColor: timerSemDespesas > 0 ? 'warning.main' : 'success.main',
                    bgcolor: timerSemDespesas > 0
                      ? (theme.palette.mode === 'dark' ? 'rgba(255, 171, 0, 0.04)' : 'rgba(255, 171, 0, 0.04)')
                      : (theme.palette.mode === 'dark' ? 'rgba(84, 214, 44, 0.04)' : 'rgba(84, 214, 44, 0.04)'),
                    transition: 'all 0.3s ease',
                  })}
                >
                  <Stack direction="column" alignItems="center" spacing={2.5}>

                    {/* BARRAS DE PROGRESSO */}
                    <Stack direction="row" alignItems="center" spacing={2.5} width="100%" justifyContent="center">
                      <Box position="relative" display="inline-flex">
                        <CircularProgress
                          variant="determinate"
                          value={timerSemDespesas > 0 ? (timerSemDespesas / 15) * 100 : 100} // Fica totalmente preenchido quando termina
                          size={48}
                          thickness={4.5}
                          color={timerSemDespesas > 0 ? 'warning' : 'success'}
                        />
                        {/* O tempo agora mostra o número ou "OK" quando chega a zero */}
                        <Box
                          sx={{
                            top: 0, left: 0, bottom: 0, right: 0,
                            position: 'absolute', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color={timerSemDespesas > 0 ? 'warning.main' : 'success.main'}
                          >
                            {timerSemDespesas > 0 ? `${timerSemDespesas}s` : 'OK'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box flex={1} maxWidth={280}>
                        <Typography variant="subtitle2" component="div" color={timerSemDespesas > 0 ? 'warning.dark' : 'success.dark'} mb={0.5}>
                          {timerSemDespesas > 0
                            ? 'Leia com atenção o aviso acima...'
                            : 'Você já pode confirmar abaixo!'}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={100 - (timerSemDespesas / 15) * 100}
                          color={timerSemDespesas > 0 ? 'warning' : 'success'}
                          sx={{ borderRadius: 4, height: 8 }}
                        />
                      </Box>
                    </Stack>

                    <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />

                    {/* CHECKBOX */}
                    <FormControlLabel
                      disabled={timerSemDespesas > 0}
                      sx={{ margin: 0 }}
                      control={
                        <Checkbox
                          checked={cienteSemDespesas}
                          onChange={(e) => setCienteSemDespesas(e.target.checked)}
                          color="success"
                          size="medium"
                        />
                      }
                      label={
                        <Typography variant="body2" component="div" sx={{ ml: 0.5 }}>
                          Estou ciente e me responsabilizo por declarar{' '}
                          <Typography component="span" variant="body2" fontWeight="bold" color="error.main">
                            sem nenhum documento ou despesa dedutível
                          </Typography>{' '}
                          anexado.
                        </Typography>
                      }
                    />
                  </Stack>
                </Box>

              </Stack>
            </DialogContent>

            {/* AÇÕES (BOTÕES) CENTRALIZADAS */}
            <DialogActions sx={{ px: 3, pb: 4, pt: 0, justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => setModalSemDespesas(false)}
                sx={{ minWidth: 160 }}
              >
                Voltar e adicionar
              </Button>
              <LoadingButton
                variant="contained"
                color={timerSemDespesas > 0 ? 'warning' : 'success'} // <-- Alterado aqui para ficar verde
                size="large"
                disabled={timerSemDespesas > 0 || !cienteSemDespesas}
                loading={salvandoForm}
                sx={{ minWidth: 220, transition: 'background-color 0.3s' }}
                onClick={async () => {
                  setModalSemDespesas(false);
                  setSalvandoForm(true);
                  clearTimeout(autoSaveTimer.current);
                  try {
                    await salvarPayload(form);
                    setStepsSalvos((prev) => [...new Set([...prev, step])]);
                    setPendente(false);
                    setStep((s) => s + 1);
                  } catch (err) {
                    toast.error(err?.message || 'Erro ao salvar. Tente novamente.');
                  } finally {
                    setSalvandoForm(false);
                  }
                }}
              >
                Prosseguir sem documentos
              </LoadingButton>
            </DialogActions>
          </Dialog>

          {/* Modal: upload de comprovante ao selecionar despesa */}
          <Dialog
            open={!!modalDespesa}
            onClose={() => setModalDespesa(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, maxWidth: 520 } }}
          >
            {modalDespesa && (
              <>
                <DialogTitle sx={{ py: 3, px: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="eva:file-add-outline" width={26} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {DOCS_REQUERIDOS_POR_DESPESA[modalDespesa.value]?.label || modalDespesa.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Anexe o(s) comprovante(s) para esta despesa
                      </Typography>
                    </Box>
                  </Stack>
                </DialogTitle>

                <DialogContent sx={{ px: 3, pb: 0 }}>
                  <UploadMultiArquivo
                    token={token}
                    tipoDoc={modalDespesa.tipo}
                    documentos={documentos}
                    onSuccess={() => mutate()}
                    uploadFn={uploadDocumentoPorToken}
                  />
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => setModalDespesa(null)}
                    sx={{ borderRadius: 1.25, fontWeight: 600 }}
                  >
                    Fechar
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Modal: upload de documentos da situação fiscal */}
          <Dialog
            open={!!modalUploadFiscal}
            onClose={() => setModalUploadFiscal(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, maxWidth: 520 } }}
          >
            {modalUploadFiscal && (() => {
              const cfg = UPLOAD_FISCAL_CONFIG[modalUploadFiscal] || {};
              return (
                <>
                  <DialogTitle sx={{ py: 3, px: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: 'primary.main',
                        }}
                      >
                        <Iconify icon="eva:cloud-upload-outline" width={26} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {cfg.titulo || 'Anexar documentos'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {cfg.descricao || 'Anexe os arquivos necessários.'}
                        </Typography>
                      </Box>
                    </Stack>
                  </DialogTitle>

                  <DialogContent sx={{ px: 3, pb: 0 }}>
                    <UploadMultiArquivo
                      token={token}
                      tipoDoc={modalUploadFiscal}
                      documentos={documentos}
                      onSuccess={() => mutate()}
                      uploadFn={uploadDocumentoPorToken}
                    />
                  </DialogContent>

                  <DialogActions sx={{ p: 3, gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      onClick={() => setModalUploadFiscal(null)}
                      sx={{ borderRadius: 1.25, fontWeight: 600 }}
                    >
                      Fechar
                    </Button>
                  </DialogActions>
                </>
              );
            })()}
          </Dialog>
        </Stack>
      </Container>
    </Box>
  );
}
