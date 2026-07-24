'use client';

import { useSWRConfig } from 'swr';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  useGetLoteUpload,
  uploadGuiasFiscaisAsync,
  LOTE_UPLOAD_EM_ANDAMENTO,
} from 'src/actions/guias-fiscais';

import { Label } from 'src/components/label';
import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { GuiaFiscalRevisaoPanel } from '../components/guia-fiscal-revisao-panel';

// ----------------------------------------------------------------------
// Upload em lote ASSÍNCRONO: POST /upload/async responde 202 com loteId;
// o progresso vem por polling (useGetLoteUpload). Arquivos que o sistema
// não classificar caem na fila de revisão manual (painel abaixo).
// ----------------------------------------------------------------------

function resolveClienteIdRedirect(resumo) {
  const guias = resumo?.guias || [];
  const ids = [...new Set(guias.map((g) => g.clienteId).filter(Boolean))];
  return ids.length === 1 ? ids[0] : null;
}

function ResumoLote({ resumo }) {
  if (!resumo) return null;

  return (
    <Stack spacing={1}>
      <Typography variant="body2">✅ Processados: {resumo.processadas}</Typography>
      {resumo.substituidas > 0 && (
        <Typography variant="body2" color="info.main">
          🔄 Guias vencidas atualizadas: {resumo.substituidas}
        </Typography>
      )}
      {resumo.emRevisao > 0 && (
        <Typography variant="body2" color="warning.main">
          🕵️ Aguardando revisão manual: {resumo.emRevisao} (não visíveis no portal — classifique
          no painel abaixo)
        </Typography>
      )}
      {resumo.duplicatas > 0 && (
        <Typography variant="body2" color="warning.main">
          ⚠️ Duplicatas ignoradas: {resumo.duplicatas}
        </Typography>
      )}
      {resumo.erros > 0 && (
        <Typography variant="body2" color="error">
          ❌ Erros: {resumo.erros}
        </Typography>
      )}
      {resumo.errosDetalhados?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Detalhes:
          </Typography>
          {resumo.errosDetalhados.map((erro, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              • {erro.arquivo}: {erro.erro}
            </Typography>
          ))}
        </Box>
      )}
    </Stack>
  );
}

export function GuiaFiscalUploadView() {
  const router = useRouter();
  const { mutate: mutateGlobal } = useSWRConfig();

  const [files, setFiles] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [loteId, setLoteId] = useState(null);
  const [loteFinalizadoId, setLoteFinalizadoId] = useState(null);
  // Guarda os arquivos do último envio para permitir "Reenviar substituindo"
  // (o Upload é limpo após o envio, mas os File objects seguem em memória aqui).
  const [arquivosUltimoLote, setArquivosUltimoLote] = useState([]);

  const dialogClientesNaoEncontrados = useBoolean();

  const { lote, error: erroConsultaLote } = useGetLoteUpload(loteId);

  const emAndamento = enviando || LOTE_UPLOAD_EM_ANDAMENTO.includes(lote?.status);
  const resumo = lote?.resumo || null;
  const progresso =
    lote?.totalArquivos > 0 ? Math.round((lote.processados / lote.totalArquivos) * 100) : 0;

  const revalidarListagens = useCallback(
    () =>
      mutateGlobal(
        (key) =>
          typeof key === 'string' &&
          (key.startsWith(endpoints.guiasFiscais.list) ||
            key.startsWith(endpoints.guiasFiscais.pastas)),
        undefined,
        { revalidate: true }
      ),
    [mutateGlobal]
  );

  // Reage à conclusão do lote (polling): toasts + revalidação, uma vez por lote
  useEffect(() => {
    if (!lote || !loteId || loteFinalizadoId === loteId) return;
    if (LOTE_UPLOAD_EM_ANDAMENTO.includes(lote.status)) return;

    setLoteFinalizadoId(loteId);
    revalidarListagens();

    if (lote.status === 'erro') {
      toast.error(lote.erroGeral || 'O processamento do lote falhou. Tente novamente.');
      return;
    }

    const r = lote.resumo || {};
    toast.success(
      `${r.processadas || 0} documento(s) processado(s)${ 
        r.substituidas ? ` • ${r.substituidas} substituído(s)` : '' 
        }${r.duplicatas ? ` • ${r.duplicatas} duplicado(s) ignorado(s)` : ''}`
    );
    if (r.emRevisao > 0) {
      toast.warning(
        `${r.emRevisao} documento(s) aguardando revisão manual — classifique no painel abaixo.`
      );
    }
    if (r.clientesNaoEncontrados?.length > 0) {
      dialogClientesNaoEncontrados.onTrue();
    }
  }, [lote, loteId, loteFinalizadoId, revalidarListagens, dialogClientesNaoEncontrados]);

  const handleDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Apenas arquivos PDF são aceitos');
    }
    setFiles((prev) => [...prev, ...pdfFiles]);
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setFiles([]);
  }, []);

  const enviarLote = useCallback(async (arquivos, { forcarSubstituicao = false } = {}) => {
    if (!arquivos || arquivos.length === 0) {
      toast.error('Selecione pelo menos um arquivo PDF');
      return;
    }

    try {
      setEnviando(true);
      setLoteId(null);
      setLoteFinalizadoId(null);

      const response = await uploadGuiasFiscaisAsync(arquivos, { forcarSubstituicao });

      if (response?.success && response?.data?.loteId) {
        setArquivosUltimoLote(arquivos);
        setLoteId(response.data.loteId);
        setFiles([]);
        toast.info(
          forcarSubstituicao
            ? `Reenviando ${response.data.totalArquivos} arquivo(s), substituindo as guias já existentes...`
            : `Lote com ${response.data.totalArquivos} arquivo(s) enviado — processando em segundo plano.`
        );
      } else {
        toast.error(response?.message || 'Erro ao enviar o lote');
      }
    } catch (error) {
      const data = error?.response?.data;
      let msg = data?.message || error?.message || 'Erro ao fazer upload dos documentos';
      if (data?.code === 'LIMIT_FILE_SIZE') {
        msg = data.message || 'Arquivo muito grande. Verifique o tamanho máximo permitido.';
      } else if (data?.code === 'LIMIT_FILE_COUNT') {
        msg = data.message || 'Muitos arquivos enviados. Verifique o limite permitido.';
      }
      if (data?.arquivosInvalidos?.length) {
        msg += ` (${data.arquivosInvalidos.join(', ')})`;
      }
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  }, []);

  const handleUpload = useCallback(() => enviarLote(files), [enviarLote, files]);

  const handleReenviarSubstituindo = useCallback(
    () => enviarLote(arquivosUltimoLote, { forcarSubstituicao: true }),
    [enviarLote, arquivosUltimoLote]
  );

  const irParaDocumentos = useCallback(async () => {
    await revalidarListagens();
    const params = new URLSearchParams();
    const clienteId = resolveClienteIdRedirect(resumo);
    if (clienteId) params.set('clienteId', clienteId);
    const qs = params.toString();
    router.push(
      qs ? `${paths.dashboard.guiasEDocumentos.list}?${qs}` : paths.dashboard.guiasEDocumentos.list
    );
  }, [revalidarListagens, resumo, router]);

  const statusLote = useMemo(() => {
    if (!lote) return null;
    const map = {
      aguardando: { label: 'Na fila', color: 'default' },
      processando: { label: 'Processando', color: 'info' },
      concluido: { label: 'Concluído', color: 'success' },
      erro: { label: 'Erro', color: 'error' },
    };
    return map[lote.status] || { label: lote.status, color: 'default' };
  }, [lote]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Express"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Documentos e Guias', href: paths.dashboard.guiasEDocumentos.list },
          { name: 'Express' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <Alert severity="info">
          <Typography variant="body2">
            O sistema identifica automaticamente o cliente pelo CNPJ e classifica o tipo do
            documento (com apoio de IA, inclusive PDFs escaneados). O processamento acontece em
            segundo plano — acompanhe o progresso aqui. O que não for identificado com segurança
            cai na <strong>revisão manual</strong> abaixo, sem aparecer para o cliente.
          </Typography>
        </Alert>

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Upload
              multiple
              value={files}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAll}
              accept={{
                'application/pdf': ['.pdf'],
              }}
              helperText="Arraste arquivos PDF aqui ou clique para selecionar (até 100 por lote, 20 MB cada)."
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                component={RouterLink}
                href={paths.dashboard.guiasEDocumentos.list}
                disabled={enviando}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={enviando || files.length === 0}
                startIcon={
                  enviando ? <CircularProgress size={20} /> : <Iconify icon="eva:cloud-upload-fill" />
                }
              >
                {enviando ? 'Enviando...' : 'Enviar Documentos'}
              </Button>
            </Stack>
          </Stack>
        </Card>

        {loteId && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography variant="h6">Processamento do lote</Typography>
                  {statusLote ? (
                    <Label color={statusLote.color}>{statusLote.label}</Label>
                  ) : (
                    <Label color="default">Consultando...</Label>
                  )}
                </Stack>
                {lote && (
                  <Typography variant="body2" color="text.secondary">
                    {lote.processados}/{lote.totalArquivos} arquivo(s)
                  </Typography>
                )}
              </Stack>

              {(!lote || emAndamento) && (
                <LinearProgress
                  variant={lote?.processados > 0 ? 'determinate' : 'indeterminate'}
                  value={progresso}
                />
              )}

              {erroConsultaLote && !lote && (
                <Alert severity="warning">
                  Não foi possível consultar o status do lote — tentando novamente...
                </Alert>
              )}

              {lote?.status === 'erro' && (
                <Alert severity="error">
                  {lote.erroGeral || 'O processamento do lote falhou. Tente novamente.'}
                </Alert>
              )}

              <ResumoLote resumo={resumo} />

              {lote?.status === 'concluido' && resumo?.duplicatas > 0 && arquivosUltimoLote.length > 0 && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="warning"
                      size="small"
                      variant="contained"
                      onClick={handleReenviarSubstituindo}
                      disabled={enviando}
                      startIcon={<Iconify icon="eva:refresh-fill" />}
                    >
                      Reenviar substituindo
                    </Button>
                  }
                >
                  {resumo.duplicatas} guia(s) já existiam e foram ignoradas. Se quiser
                  sobrescrever a versão atual, reenvie substituindo (guias já pagas são
                  preservadas).
                </Alert>
              )}

              {lote?.status === 'concluido' && (
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={irParaDocumentos}
                    endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  >
                    Ver documentos
                  </Button>
                </Stack>
              )}
            </Stack>
          </Card>
        )}

        <GuiaFiscalRevisaoPanel />
      </Stack>

      {/* Dialog para clientes não encontrados */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={dialogClientesNaoEncontrados.value}
        onClose={dialogClientesNaoEncontrados.onFalse}
      >
        <DialogTitle>Clientes Não Encontrados</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Os seguintes arquivos contêm CNPJs que não foram encontrados no sistema:
          </Alert>
          <List>
            {resumo?.clientesNaoEncontrados?.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item.arquivo} secondary={`CNPJ: ${item.cnpj}`} />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Estes documentos não foram processados. Verifique se os clientes estão cadastrados no
            sistema e envie novamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogClientesNaoEncontrados.onFalse}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
