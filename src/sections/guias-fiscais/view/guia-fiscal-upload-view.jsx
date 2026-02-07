'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetAllClientes } from 'src/actions/clientes';
import { getGuiasFiscais, uploadGuiasFiscais } from 'src/actions/guias-fiscais';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function GuiaFiscalUploadView() {
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [filesWithClientes, setFilesWithClientes] = useState([]); // Arquivos com cliente selecionado
  const [loadingGuias, setLoadingGuias] = useState(false);
  
  const dialogClientesNaoEncontrados = useBoolean();

  // Buscar clientes ativos
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({ status: true });

  // Buscar todas as guias ao entrar na página
  useEffect(() => {
    const fetchAllGuias = async () => {
      try {
        setLoadingGuias(true);
        const response = await getGuiasFiscais({ limit: 1000 });
        console.log('Guias carregadas:', response);
        // Você pode usar essas guias conforme necessário
      } catch (error) {
        console.error('Erro ao buscar guias:', error);
        toast.error('Erro ao carregar guias fiscais');
      } finally {
        setLoadingGuias(false);
      }
    };

    fetchAllGuias();
  }, []);

  const handleDrop = useCallback((acceptedFiles) => {
    // Filtrar apenas PDFs
    const pdfFiles = acceptedFiles.filter((file) => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Apenas arquivos PDF são aceitos');
    }

    // Adicionar os PDFs aos arquivos já selecionados com ID único
    const newFilesWithClientes = pdfFiles.map((file) => {
      const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      return {
        id: fileId,
        file,
        clienteId: null,
        clienteNome: null,
      };
    });
    
    setFiles((prev) => [...prev, ...pdfFiles]);
    setFilesWithClientes((prev) => [...prev, ...newFilesWithClientes]);
  }, []);

  const handleRemoveFile = useCallback((index) => {
    const fileToRemove = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    // Remover pelo nome e tamanho para garantir sincronização
    setFilesWithClientes((prev) => 
      prev.filter((item) => item.file.name !== fileToRemove.name || item.file.size !== fileToRemove.size)
    );
  }, [files]);

  const handleRemoveAll = useCallback(() => {
    setFiles([]);
    setFilesWithClientes([]);
  }, []);

  // Handler para selecionar cliente para um arquivo
  const handleSelectCliente = useCallback(async (fileId, clienteId) => {
    const cliente = clientes.find((c) => c._id === clienteId || c.id === clienteId);
    
    setFilesWithClientes((prev) => prev.map((item) => 
        item.id === fileId
          ? {
              ...item,
              clienteId,
              clienteNome: cliente?.name || cliente?.razaoSocial || '',
            }
          : item
      ));

    // Fazer GET com o clienteId para buscar guias desse cliente
    try {
      const response = await getGuiasFiscais({ clienteId, limit: 1000 });
      console.log(`Guias do cliente ${clienteId}:`, response);
      const total = response?.data?.total || response?.total || 0;
      toast.success(`Guias do cliente carregadas: ${total} encontradas`);
    } catch (error) {
      console.error('Erro ao buscar guias do cliente:', error);
      toast.error('Erro ao buscar guias do cliente');
    }
  }, [clientes]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo PDF');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Iniciando upload de', files.length, 'arquivo(s)');
      console.log('📄 Arquivos:', files.map((f) => ({ name: f.name, size: f.size })));
      
      const response = await uploadGuiasFiscais(files);
      
      console.log('✅ Resposta do upload:', response);

      if (response.success) {
        setUploadResult(response.data);
        
        // Mostrar resumo
        const { processadas, erros, duplicatas, resumo, clientesNaoEncontrados, errosDetalhados } = response.data;
        
        console.log('📊 Resumo do processamento:', {
          processadas,
          erros,
          duplicatas,
          resumo,
          clientesNaoEncontrados: clientesNaoEncontrados?.length || 0,
          errosDetalhados: errosDetalhados?.length || 0,
        });
        
        let mensagem = `${processadas} documento(s) processado(s) com sucesso!`;
        if (duplicatas > 0) {
          mensagem += ` ${duplicatas} documento(s) duplicado(s) foram ignorados.`;
        }
        
        toast.success(mensagem);
        
        // Mostrar aviso sobre duplicatas
        if (duplicatas > 0) {
          toast.warning(`${duplicatas} documento(s) duplicado(s) foram ignorados.`);
        }
        
        // Verificar se há clientes não encontrados
        if (clientesNaoEncontrados && clientesNaoEncontrados.length > 0) {
          dialogClientesNaoEncontrados.onTrue();
        } else if (erros > 0 && duplicatas === 0) {
          toast.warning(`${erros} documento(s) com erro. Verifique os detalhes.`);
        } else {
          // Redirecionar para a lista com parâmetro refresh para forçar atualização
          setTimeout(() => {
            router.push(`${paths.dashboard.guiasFiscais.list}?refresh=${Date.now()}`);
          }, 1500);
        }
      } else {
        console.error('❌ Erro no upload:', response);
        toast.error(response.message || 'Erro ao processar documentos');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      toast.error(error?.message || 'Erro ao fazer upload dos documentos');
    } finally {
      setLoading(false);
    }
  }, [files, router, dialogClientesNaoEncontrados]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Upload de Guias e Documentos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Guias e Documentos', href: paths.dashboard.guiasFiscais.list },
          { name: 'Upload' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            O sistema identifica automaticamente o cliente pelo CNPJ extraído de cada PDF.
            Você pode fazer upload de quantos arquivos quiser.
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
              helperText="Arraste arquivos PDF aqui ou clique para selecionar. Você pode adicionar quantos arquivos quiser. O sistema identificará automaticamente o cliente pelo CNPJ."
            />

            {/* Select de clientes para arquivos sem identificação */}
            {filesWithClientes.length > 0 && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">
                  Selecione o cliente para arquivos sem identificação automática:
                </Typography>
                {filesWithClientes.map((fileWithCliente) => (
                  <Card key={fileWithCliente.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {fileWithCliente.file.name}
                        </Typography>
                        {fileWithCliente.clienteNome && (
                          <Typography variant="caption" color="success.main">
                            Cliente: {fileWithCliente.clienteNome}
                          </Typography>
                        )}
                      </Box>
                      <FormControl sx={{ minWidth: 250 }} size="small">
                        <InputLabel>Selecionar Cliente</InputLabel>
                        <Select
                          value={fileWithCliente.clienteId || ''}
                          label="Selecionar Cliente"
                          onChange={(e) => handleSelectCliente(fileWithCliente.id, e.target.value)}
                          disabled={loadingClientes}
                        >
                          <MenuItem value="">
                            <em>Nenhum</em>
                          </MenuItem>
                          {clientes.map((cliente) => (
                            <MenuItem key={cliente._id || cliente.id} value={cliente._id || cliente.id}>
                              {cliente.name || cliente.razaoSocial || cliente.nome}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}

            {uploadResult && (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Resumo do Processamento
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    ✅ Processados: {uploadResult.processadas}
                  </Typography>
                  {uploadResult.resumo && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        • {uploadResult.resumo.guiasFiscais || 0} Guias Fiscais
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • {uploadResult.resumo.guiasDP || 0} Guias de DP
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • {uploadResult.resumo.documentosDP || 0} Documentos de DP
                      </Typography>
                    </>
                  )}
                  {uploadResult.duplicatas > 0 && (
                    <Typography variant="body2" color="warning.main">
                      ⚠️ Duplicatas ignoradas: {uploadResult.duplicatas}
                    </Typography>
                  )}
                  {uploadResult.erros > 0 && (
                    <Typography variant="body2" color="error">
                      ❌ Erros: {uploadResult.erros}
                    </Typography>
                  )}
                  {uploadResult.errosDetalhados && uploadResult.errosDetalhados.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Detalhes dos erros:
                      </Typography>
                      {uploadResult.errosDetalhados.map((erro, index) => (
                        <Typography key={index} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          • {erro.arquivo}: {erro.erro}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Stack>
              </Card>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                component={RouterLink}
                href={paths.dashboard.guiasFiscais.list}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading || files.length === 0}
                startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="eva:cloud-upload-fill" />}
              >
                {loading ? 'Enviando...' : 'Enviar Documentos'}
              </Button>
            </Stack>
          </Stack>
        </Card>
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
            {uploadResult?.clientesNaoEncontrados?.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.arquivo}
                  secondary={`CNPJ: ${item.cnpj}`}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Estes documentos não foram processados. Verifique se os clientes estão cadastrados no sistema.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogClientesNaoEncontrados.onFalse}>Fechar</Button>
          <Button
            variant="contained"
            onClick={() => {
              dialogClientesNaoEncontrados.onFalse();
              router.push(paths.dashboard.guiasFiscais.list);
            }}
          >
            Ver Lista
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
