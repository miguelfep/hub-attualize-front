'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  AlertTitle,
  Box,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Upload } from 'src/components/upload';

import { uploadDasPdf, useApuracao } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';
import { formatarPeriodo } from 'src/utils/apuracao-helpers';

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  // Para pdfjs-dist 4.x, usar unpkg como CDN confiável
  // unpkg é mais confiável que cdnjs para módulos ES
  const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  console.log('[PDF.js] Worker configurado:', workerUrl);
  console.log('[PDF.js] Versão do pdfjs-dist:', pdfjsLib.version);
}

// Utility para converter File para base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1]; // Remover prefixo
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Função para extrair texto do PDF
const extractTextFromPdf = async (file) => {
  try {
    console.log('[PDF Extraction] Iniciando extração do PDF:', file.name);
    console.log('[PDF Extraction] Worker configurado:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('[PDF Extraction] Arquivo carregado, tamanho:', arrayBuffer.byteLength, 'bytes');
    
    // Configurar worker antes de carregar o documento
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log('[PDF Extraction] Worker configurado durante extração:', workerUrl);
    }
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: false,
      verbosity: 0, // Reduzir logs internos
    }).promise;
    console.log('[PDF Extraction] PDF carregado, número de páginas:', pdf.numPages);
    
    let fullText = '';
    
    // Extrair texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`[PDF Extraction] Processando página ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      console.log(`[PDF Extraction] Página ${i} - ${textContent.items.length} itens de texto encontrados`);
      console.log(`[PDF Extraction] Preview texto página ${i}:`, pageText.substring(0, 200));
      fullText += pageText + '\n';
    }
    
    console.log('[PDF Extraction] Extração concluída. Tamanho total do texto:', fullText.length, 'caracteres');
    console.log('[PDF Extraction] Preview do texto completo:', fullText.substring(0, 500));
    
    return fullText;
  } catch (error) {
    console.error('[PDF Extraction] Erro ao extrair texto do PDF:', error);
    console.error('[PDF Extraction] Stack trace:', error.stack);
    throw new Error('Erro ao ler o PDF. Verifique se o arquivo está válido.');
  }
};

// Função para fazer parsing do texto e extrair dados do DAS
const parseDasData = (text) => {
  console.log('[PDF Parsing] Iniciando parsing dos dados do DAS');
  console.log('[PDF Parsing] Tamanho do texto:', text.length, 'caracteres');
  
  const dados = {
    numeroDocumento: '',
    dataVencimento: '',
    dataLimiteAcolhimento: '',
    valorTotal: '',
  };

  // Normalizar o texto para facilitar busca
  const normalizedText = text.replace(/\s+/g, ' ');
  console.log('[PDF Parsing] Texto normalizado. Tamanho:', normalizedText.length);

  // Extrair número do documento (formato: 07.20.25319.3494827-4 ou similar)
  // No PDF extraído: "07.20.25319.3494827-4" ou "Número: 07.20.25319.3494827-4"
  const numeroDocPatterns = [
    // Padrão específico do DAS: XX.XX.XXXXX.XXXXXXX-X (com pontos e hífen)
    /(?:N[úu]mero|N[úu]m\.?|N[úu]m\.?\s*do\s*)?(?:documento|DAS)?[:\s]*([0-9]{2}\.[0-9]{2}\.[0-9]{5}\.[0-9]{7}-[0-9])/i,
    // Padrão alternativo: número longo com pontos e hífen
    /\b([0-9]{2}\.[0-9]{2}\.[0-9]+\.[0-9]+-[0-9])\b/,
    // Padrão sem "Número do documento" mas com formato específico
    /([0-9]{2}\.[0-9]{2}\.[0-9]{5}\.[0-9]{7}-[0-9])/,
    // Fallback: número longo com hífen
    /\b([0-9]{15,20}-[0-9]{1,2})\b/,
    // Último fallback: qualquer número longo
    /([0-9]{13,20})/,
  ];

  for (let i = 0; i < numeroDocPatterns.length; i++) {
    const pattern = numeroDocPatterns[i];
    const match = normalizedText.match(pattern);
    console.log(`[PDF Parsing] Tentativa ${i + 1} - Número documento - Padrão:`, pattern);
    console.log(`[PDF Parsing] Match encontrado:`, match ? match[1] : 'nenhum');
    if (match && match[1]) {
      dados.numeroDocumento = match[1].trim();
      console.log('[PDF Parsing] ✓ Número do documento extraído:', dados.numeroDocumento);
      break;
    }
  }
  
  if (!dados.numeroDocumento) {
    console.warn('[PDF Parsing] ⚠ Número do documento não encontrado');
  }

  // Extrair data de vencimento
  // No PDF extraído: "Pagar este documento até 21/11/2025" ou "Pagar até: 21/11/2025"
  const dataVencPatterns = [
    // Padrão específico: "Pagar este documento até" ou "Pagar até"
    /(?:Pagar\s*(?:este\s*documento\s*)?at[ée]|at[ée]|Vencimento|Data\s*(?:de\s*)?vencimento)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    // Padrão alternativo
    /(?:Venc\.?|Vencimento)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    // Buscar data próxima a palavras relacionadas
    /(\d{1,2}\/\d{1,2}\/\d{4})(?=.*(?:vencimento|venc|pagar))/i,
  ];

  for (let i = 0; i < dataVencPatterns.length; i++) {
    const pattern = dataVencPatterns[i];
    const match = normalizedText.match(pattern);
    console.log(`[PDF Parsing] Tentativa ${i + 1} - Data vencimento - Padrão:`, pattern);
    console.log(`[PDF Parsing] Match encontrado:`, match ? match[1] : 'nenhum');
    if (match && match[1]) {
      const dataStr = match[1].trim();
      console.log('[PDF Parsing] Data encontrada (formato original):', dataStr);
      // Converter para formato YYYY-MM-DD
      dados.dataVencimento = convertDateToISO(dataStr);
      console.log('[PDF Parsing] Data convertida:', dados.dataVencimento);
      if (dados.dataVencimento) {
        console.log('[PDF Parsing] ✓ Data de vencimento extraída:', dados.dataVencimento);
        break;
      }
    }
  }
  
  if (!dados.dataVencimento) {
    console.warn('[PDF Parsing] ⚠ Data de vencimento não encontrada');
  }

  // Extrair data limite de acolhimento
  const dataAcolhPatterns = [
    /(?:Data\s*(?:limite\s*)?(?:de\s*)?acolhimento|Acolhimento)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:Limite\s*(?:de\s*)?acolhimento)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  ];

  for (let i = 0; i < dataAcolhPatterns.length; i++) {
    const pattern = dataAcolhPatterns[i];
    const match = normalizedText.match(pattern);
    console.log(`[PDF Parsing] Tentativa ${i + 1} - Data acolhimento - Padrão:`, pattern);
    console.log(`[PDF Parsing] Match encontrado:`, match ? match[1] : 'nenhum');
    if (match && match[1]) {
      const dataStr = match[1].trim();
      dados.dataLimiteAcolhimento = convertDateToISO(dataStr);
      if (dados.dataLimiteAcolhimento) {
        console.log('[PDF Parsing] ✓ Data limite de acolhimento extraída:', dados.dataLimiteAcolhimento);
        break;
      }
    }
  }
  
  if (!dados.dataLimiteAcolhimento) {
    console.log('[PDF Parsing] ℹ Data limite de acolhimento não encontrada (opcional)');
  }

  // Extrair valor total - múltiplos padrões
  // No PDF extraído: "Valor Total do Documento 3.412,23" ou "Valor: 3.412,23"
  const valorPatterns = [
    // Padrão específico: "Valor Total do Documento" ou "Valor:"
    /(?:Valor\s*(?:Total\s*)?(?:do\s*)?(?:Documento|Total|a\s*pagar|do\s*DAS|devido)?|Total\s*(?:geral|a\s*pagar|do\s*Documento)?)[:\s]*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/i,
    // Padrão: "R$ 1.234,56" próximo a palavras como "total", "pagar", "devido"
    /R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*(?=.*(?:total|a\s*pagar|devido|pagamento|valor|documento))/i,
    // Padrão: "Valor:" seguido de número
    /(?:Valor|Total)[:\s]*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/i,
    // Padrão simples: buscar todos os valores monetários (usando matchAll com flag global)
    /([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/g,
  ];

  let maiorValor = 0;
  let maiorValorStr = '';

  for (let i = 0; i < valorPatterns.length; i++) {
    const pattern = valorPatterns[i];
    let matches;
    
    // matchAll só funciona com flags globais
    if (pattern.global) {
      matches = [...normalizedText.matchAll(pattern)];
    } else {
      // Para padrões não-globais, usar match
      const match = normalizedText.match(pattern);
      matches = match ? [match] : [];
    }
    
    console.log(`[PDF Parsing] Tentativa ${i + 1} - Valor total - Padrão:`, pattern);
    console.log(`[PDF Parsing] Matches encontrados:`, matches.length);
    
    for (const match of matches) {
      if (match[1]) {
        console.log('[PDF Parsing] Valor encontrado (formato original):', match[1]);
        // Converter de formato brasileiro (1.234,56) para formato numérico
        const valorStr = match[1].trim().replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr);
        console.log('[PDF Parsing] Valor convertido:', valorStr, '->', valor);
        // Aceitar valores >= 0 (incluindo zero)
        if (!isNaN(valor) && valor >= 0 && valor > maiorValor) {
          maiorValor = valor;
          maiorValorStr = valorStr;
          console.log('[PDF Parsing] Novo maior valor encontrado:', maiorValorStr);
        }
      }
    }

    // Se encontrou valor no padrão específico, usar ele (incluindo zero)
    if (i < 3 && maiorValor >= 0) {
      console.log('[PDF Parsing] Valor encontrado em padrão específico, interrompendo busca');
      break;
    }
  }

  if (maiorValorStr) {
    dados.valorTotal = maiorValorStr;
    console.log('[PDF Parsing] ✓ Valor total extraído:', dados.valorTotal);
  } else {
    console.warn('[PDF Parsing] ⚠ Valor total não encontrado');
  }
  
  console.log('[PDF Parsing] Resultado final:', dados);
  return dados;
};

// Função para converter data brasileira para ISO (YYYY-MM-DD)
const convertDateToISO = (dateStr) => {
  if (!dateStr) return '';
  
  // Remover espaços e normalizar separadores
  const normalized = dateStr.trim().replace(/\s+/g, '');
  
  // Tentar diferentes formatos
  const formats = [
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/, // DD/MM/YY
  ];

  for (const format of formats) {
    const match = normalized.match(format);
    if (match) {
      let dia = parseInt(match[1], 10);
      let mes = parseInt(match[2], 10);
      let ano = parseInt(match[3], 10);

      // Se o ano tem 2 dígitos, assumir 2000+
      if (ano < 100) {
        ano += 2000;
      }

      // Validar dia e mês
      if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
        return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      }
    }
  }

  return '';
};

// ----------------------------------------------------------------------

export function UploadDasAdminView({ clienteId, apuracaoId: apuracaoIdProp }) {
  const router = useRouter();

  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [dataLimiteAcolhimento, setDataLimiteAcolhimento] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [ambiente, setAmbiente] = useState('teste');
  const [observacoes, setObservacoes] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  // Buscar apuração
  const { data: apuracaoData, isLoading } = useApuracao(apuracaoIdProp);
  const apuracao = apuracaoData?.apuracao || apuracaoData;

  const handleDropFile = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPdfFile(file);
      
      // Tentar extrair dados automaticamente do PDF
      try {
        setExtracting(true);
        toast.info('Lendo PDF e extraindo dados...');
        
        console.log('='.repeat(80));
        console.log('[DAS Upload] Iniciando processo de extração de dados do PDF');
        console.log('[DAS Upload] Arquivo:', file.name, '- Tamanho:', file.size, 'bytes');
        console.log('='.repeat(80));
        
        const text = await extractTextFromPdf(file);
        
        // Log completo do texto extraído para mapeamento
        console.log('='.repeat(80));
        console.log('[DAS Upload] TEXTO COMPLETO EXTRAÍDO DO PDF:');
        console.log('='.repeat(80));
        console.log(text);
        console.log('='.repeat(80));
        console.log('[DAS Upload] FIM DO TEXTO EXTRAÍDO');
        console.log('='.repeat(80));
        
        // Também salvar em um objeto global para inspeção no console
        if (typeof window !== 'undefined') {
          window.lastPdfExtractedText = text;
          console.log('[DAS Upload] Texto salvo em window.lastPdfExtractedText para inspeção');
        }
        
        const dados = parseDasData(text);
        
        console.log('='.repeat(80));
        console.log('[DAS Upload] Processo de extração concluído');
        console.log('[DAS Upload] Dados extraídos:', JSON.stringify(dados, null, 2));
        console.log('='.repeat(80));
        
        // Preencher campos com os dados extraídos
        if (dados.numeroDocumento) {
          setNumeroDocumento(dados.numeroDocumento);
        }
        if (dados.dataVencimento) {
          setDataVencimento(dados.dataVencimento);
        }
        if (dados.dataLimiteAcolhimento) {
          setDataLimiteAcolhimento(dados.dataLimiteAcolhimento);
        }
        if (dados.valorTotal) {
          setValorTotal(dados.valorTotal);
        }
        
        // Verificar se algum dado foi extraído
        const dadosExtraidos = Object.values(dados).some(val => val !== '');
        if (dadosExtraidos) {
          toast.success('Dados extraídos do PDF com sucesso! Verifique e ajuste se necessário.');
        } else {
          toast.warning('Não foi possível extrair dados automaticamente. Preencha manualmente.');
        }
      } catch (error) {
        console.error('='.repeat(80));
        console.error('[DAS Upload] ERRO ao extrair dados do PDF:');
        console.error('[DAS Upload] Tipo do erro:', error.name);
        console.error('[DAS Upload] Mensagem:', error.message);
        console.error('[DAS Upload] Stack:', error.stack);
        console.error('='.repeat(80));
        
        // Se houver texto extraído mas erro no parsing, mostrar o texto
        if (typeof window !== 'undefined' && window.lastPdfExtractedText) {
          console.error('[DAS Upload] Texto extraído antes do erro:');
          console.error(window.lastPdfExtractedText.substring(0, 1000));
        }
        
        toast.warning('Não foi possível ler o PDF automaticamente. Preencha os dados manualmente.');
      } finally {
        setExtracting(false);
      }
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!apuracaoIdProp) {
      toast.error('Apuração não encontrada');
      return;
    }

    if (!numeroDocumento) {
      toast.error('Informe o número do documento');
      return;
    }

    if (!dataVencimento) {
      toast.error('Informe a data de vencimento');
      return;
    }

    if (valorTotal === '' || valorTotal === null || valorTotal === undefined || isNaN(parseFloat(valorTotal))) {
      toast.error('Informe o valor total do DAS (pode ser zero)');
      return;
    }

    const valorTotalNum = parseFloat(valorTotal);
    if (valorTotalNum < 0) {
      toast.error('O valor total não pode ser negativo');
      return;
    }

    if (!pdfFile) {
      toast.error('Faça upload do arquivo PDF');
      return;
    }

    try {
      setUploading(true);

      // Converter PDF para base64
      const pdfBase64 = await fileToBase64(pdfFile);

      // Preparar dados conforme documentação
      const dados = {
        pdfBase64,
        numeroDocumento,
        dataVencimento: dataVencimento.replace(/-/g, ''), // Converter de YYYY-MM-DD para YYYYMMDD
        valorTotal: valorTotalNum,
        ...(dataLimiteAcolhimento && {
          dataLimiteAcolhimento: dataLimiteAcolhimento.replace(/-/g, ''),
        }),
        ...(ambiente && { ambiente }),
        ...(observacoes && {
          observacoes: observacoes.split('\n').filter((obs) => obs.trim()),
        }),
      };

      const response = await uploadDasPdf(apuracaoIdProp, dados);
      const dasCriado = response?.das || response;

      // Verificar se houve substituição automática de DAS
      if (dasCriado?.dasAnteriorCancelado || response?.dasAnteriorCancelado) {
        toast.success('DAS criado com sucesso! O DAS anterior foi cancelado automaticamente.', {
          duration: 6000,
        });
      } else if (valorTotalNum === 0) {
        toast.success('DAS com valor zero criado e disponibilizado para o cliente!', {
          duration: 5000,
        });
      } else {
        toast.success('DAS criado e disponibilizado para o cliente!');
      }

      router.push(
        `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracaoIdProp}`
      );
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer upload do DAS');
      console.error('Erro ao fazer upload do DAS:', error);
    } finally {
      setUploading(false);
    }
  }, [apuracaoIdProp, numeroDocumento, dataVencimento, dataLimiteAcolhimento, valorTotal, ambiente, observacoes, pdfFile, clienteId, router]);

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Upload de DAS"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes', href: paths.dashboard.fiscal.apuracaoClientes },
          {
            name: cliente?.nome || cliente?.razao_social || 'Cliente',
            href: `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}`,
          },
          {
            name: apuracao ? formatarPeriodo(apuracao.periodoApuracao) : 'Apuração',
            href: `${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/${apuracaoIdProp}`,
          },
          { name: 'Upload DAS' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Informações da Apuração */}
        {apuracao && (
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
            <AlertTitle>Apuração Selecionada</AlertTitle>
            <Typography variant="body2">
              Período: <strong>{formatarPeriodo(apuracao.periodoApuracao)}</strong>
              <br />
              Valor calculado:{' '}
              <strong>
                R${' '}
                {apuracao.totalImpostos?.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </Typography>
          </Alert>
        )}

        {/* Informações */}
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
            <AlertTitle>Upload de DAS com Extração Automática</AlertTitle>
            Faça upload do PDF do DAS. O sistema tentará extrair automaticamente o número do documento, 
            datas de vencimento e valor. Verifique os dados preenchidos antes de finalizar.
          </Alert>

          <Alert severity="warning" icon={<Iconify icon="solar:refresh-bold-duotone" />}>
            <AlertTitle>Substituição Automática de DAS</AlertTitle>
            <Typography variant="body2">
              Se já existir um DAS para o mesmo período e ambiente, o DAS anterior será <strong>cancelado automaticamente</strong> 
              para permitir a substituição. Não é necessário cancelar manualmente antes do upload.
            </Typography>
          </Alert>

          <Alert severity="info" icon={<Iconify icon="solar:document-text-bold-duotone" />}>
            <AlertTitle>DAS com Valor Zero</AlertTitle>
            <Typography variant="body2">
              É possível fazer upload de DAS com <strong>valor zero</strong> (quando não há imposto a pagar). 
              O sistema adicionará uma observação automática indicando que é um DAS sem imposto.
            </Typography>
          </Alert>
        </Stack>

        {/* Formulário */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dados do DAS
          </Typography>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número do Documento *"
                  placeholder="000000000000000-8"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  helperText="Número do DAS gerado"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Vencimento *"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Data limite para pagamento"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data Limite Acolhimento"
                  value={dataLimiteAcolhimento}
                  onChange={(e) => setDataLimiteAcolhimento(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Opcional - Data limite para acolhimento"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  step="0.01"
                  min="0"
                  label="Valor Total *"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  helperText="Valor total do DAS (pode ser zero se não houver imposto a pagar)"
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Ambiente"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  helperText="Ambiente do DAS"
                >
                  <MenuItem value="teste">Teste</MenuItem>
                  <MenuItem value="producao">Produção</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observações"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  helperText="Observações opcionais (uma por linha)"
                  placeholder="Observação 1&#10;Observação 2"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Arquivo PDF do DAS *
              </Typography>
              {extracting && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Extraindo dados do PDF...
                  </Typography>
                </Box>
              )}
              <Upload
                file={pdfFile}
                onDrop={handleDropFile}
                onDelete={() => {
                  setPdfFile(null);
                  setNumeroDocumento('');
                  setDataVencimento('');
                  setDataLimiteAcolhimento('');
                  setValorTotal('');
                }}
                accept={{ 'application/pdf': ['.pdf'] }}
                disabled={extracting}
                placeholder={
                  <Stack spacing={0.5} alignItems="center">
                    <Iconify icon="solar:cloud-upload-bold-duotone" width={40} />
                    <Typography variant="body2">Clique ou arraste o arquivo PDF aqui</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apenas arquivos PDF. Os dados serão extraídos automaticamente.
                    </Typography>
                  </Stack>
                }
              />
            </Box>

            <Alert severity="warning" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
              <AlertTitle>Atenção</AlertTitle>
              Ao fazer o upload, o DAS ficará imediatamente disponível para o cliente visualizar e
              baixar no portal. Certifique-se de que todas as informações estão corretas.
              <br />
              <br />
              <strong>Lembre-se:</strong> Se já existir um DAS para este período, ele será cancelado automaticamente.
            </Alert>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                onClick={handleUpload}
                disabled={
                  !apuracaoIdProp ||
                  !numeroDocumento ||
                  !dataVencimento ||
                  valorTotal === '' ||
                  valorTotal === null ||
                  valorTotal === undefined ||
                  isNaN(parseFloat(valorTotal)) ||
                  parseFloat(valorTotal) < 0 ||
                  !pdfFile ||
                  uploading ||
                  isLoading
                }
              >
                {uploading ? 'Enviando...' : 'Criar e Disponibilizar DAS'}
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* Geração via SERPRO (Futuro) */}
        <Card sx={{ p: 3, bgcolor: 'grey.100' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:settings-bold-duotone" width={28} />
            </Box>
            <Stack flex={1}>
              <Typography variant="subtitle1">Geração Automática via SERPRO</Typography>
              <Typography variant="body2" color="text.secondary">
                Em breve será possível gerar o DAS automaticamente através da API do SERPRO, sem
                necessidade de upload manual.
              </Typography>
            </Stack>
            <Chip label="Em Breve" color="default" />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

