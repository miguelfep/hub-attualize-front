'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

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
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Upload } from 'src/components/upload';

import { uploadDasPdf, useApuracao } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';
import { formatarPeriodo } from 'src/utils/apuracao-helpers';

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

  // Buscar dados do cliente
  const { data: clientes } = useGetAllClientes({ status: true });
  const cliente = clientes?.find((c) => (c._id || c.id) === clienteId);

  // Buscar apuração
  const { data: apuracaoData, isLoading } = useApuracao(apuracaoIdProp);
  const apuracao = apuracaoData?.apuracao || apuracaoData;

  const handleDropFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPdfFile(file);
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

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error('Informe o valor total do DAS');
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
        valorTotal: parseFloat(valorTotal),
        ...(dataLimiteAcolhimento && {
          dataLimiteAcolhimento: dataLimiteAcolhimento.replace(/-/g, ''),
        }),
        ...(ambiente && { ambiente }),
        ...(observacoes && {
          observacoes: observacoes.split('\n').filter((obs) => obs.trim()),
        }),
      };

      await uploadDasPdf(apuracaoIdProp, dados);

      toast.success('DAS criado e disponibilizado para o cliente!');
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
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Upload de DAS (Método Manual)</AlertTitle>
          Faça upload do PDF do DAS gerado manualmente. O documento ficará disponível
          imediatamente para o cliente no portal.
        </Alert>

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
                  helperText="Valor total do DAS"
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
              <Upload
                file={pdfFile}
                onDrop={handleDropFile}
                onDelete={() => setPdfFile(null)}
                accept={{ 'application/pdf': ['.pdf'] }}
                placeholder={
                  <Stack spacing={0.5} alignItems="center">
                    <Iconify icon="solar:cloud-upload-bold-duotone" width={40} />
                    <Typography variant="body2">Clique ou arraste o arquivo PDF aqui</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apenas arquivos PDF
                    </Typography>
                  </Stack>
                }
              />
            </Box>

            <Alert severity="warning" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
              <AlertTitle>Atenção</AlertTitle>
              Ao fazer o upload, o DAS ficará imediatamente disponível para o cliente visualizar e
              baixar no portal. Certifique-se de que todas as informações estão corretas.
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
                  !valorTotal ||
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

