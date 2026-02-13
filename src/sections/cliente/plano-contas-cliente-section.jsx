'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { usePlanoContas } from 'src/hooks/use-plano-contas';

import { Iconify } from 'src/components/iconify';

/**
 * Componente para gerenciar o Plano de Contas do cliente
 * Mostra upload de CSV e tabela com as contas cadastradas
 */
export default function PlanoContasClienteSection({ clienteId, possuiExtrato }) {
  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [busca, setBusca] = useState('');
  const [temPlanoAnterior, setTemPlanoAnterior] = useState(false);

  const {
    contas,
    loading,
    estatisticas,
    importarPlanoContas,
    carregarContas,
    carregarEstatisticas,
    verificarPlanoContas,
  } = usePlanoContas(clienteId);

  // Carregar contas quando o componente montar
  useEffect(() => {
    if (clienteId && possuiExtrato) {
      carregarContas();
      carregarEstatisticas();
      // Verificar se já tem plano de contas
      verificarPlanoContas().then((tem) => setTemPlanoAnterior(tem));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId, possuiExtrato]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setResultado(null);
      }
    },
  });

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PDF');
      return;
    }

    // Confirmar se tem plano anterior
    if (temPlanoAnterior) {
      const confirmar = window.confirm(
        '⚠️ ATENÇÃO: Já existe um plano de contas cadastrado.\n\n' +
        'Esta operação irá REMOVER TODOS os registros anteriores e criar um novo plano.\n\n' +
        'Deseja continuar?'
      );
      
      if (!confirmar) return;
    }

    console.log('Iniciando importação do arquivo:', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      clienteId
    });

    const result = await importarPlanoContas(file);

    console.log('Resultado da importação:', result);

    if (result) {
      setResultado(result);
      setFile(null);
      setTemPlanoAnterior(true);
      // Recarregar tabela (forçar refresh para garantir atualização)
      await carregarContas();
      await carregarEstatisticas(true); // forceRefresh = true
    }
  };

  const handleDownloadTemplate = () => {
    toast.info('O arquivo PDF deve conter uma tabela com: Código T, Classificação, Nome e Grau.');
  };

  // Filtrar contas pela busca
  const contasFiltradas = contas.filter(
    (conta) =>
      conta.codigoSequencial?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.classificacao?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Não mostrar nada se não tiver extrato ativo
  if (!possuiExtrato) {
    return null;
  }

  return (
    <Box>
      {/* Estatísticas */}
      {estatisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={6} sm={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.lighter' }}>
              <Typography variant="h4" color="primary.main">
                {estatisticas.totalContas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Contas
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
              <Typography variant="h4" color="info.main">
                {estatisticas.contasSinteticas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sintéticas
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
              <Typography variant="h4" color="success.main">
                {estatisticas.contasAnaliticas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analíticas
              </Typography>
            </Card>
          </Grid>
          <Grid xs={6} sm={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter' }}>
              <Typography variant="h4" color="warning.main">
                {estatisticas.contasInativas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inativas
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upload de Arquivo */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">
            {estatisticas?.totalContas > 0 ? 'Atualizar' : 'Importar'} Plano de Contas
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownloadTemplate}
            startIcon={<Iconify icon="solar:info-circle-bold-duotone" />}
          >
            Formato do PDF
          </Button>
        </Stack>

        {temPlanoAnterior && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Este cliente já possui um plano de contas cadastrado.</strong>
            </Typography>
            <Typography variant="body2">
              O upload de um novo arquivo irá <strong>REMOVER TODOS</strong> os registros anteriores e criar um novo plano.
            </Typography>
          </Alert>
        )}

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          <Iconify
            icon={isDragActive ? 'solar:cloud-upload-bold-duotone' : 'solar:document-bold-duotone'}
            width={48}
            sx={{ mb: 1, color: 'primary.main' }}
          />
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            {isDragActive
              ? 'Solte o arquivo aqui'
              : 'Arraste e solte o arquivo PDF aqui, ou clique para selecionar'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Formato aceito: PDF (até 10MB)
          </Typography>
        </Box>

        {file && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" icon={<Iconify icon="solar:file-check-bold-duotone" />}>
              <Typography variant="body2">
                <strong>Arquivo selecionado:</strong> {file.name} ({(file.size / 1024).toFixed(2)}{' '}
                KB)
              </Typography>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleImport}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="solar:upload-bold-duotone" />
                )
              }
              sx={{ mt: 2 }}
            >
              {loading ? 'Importando...' : 'Importar Plano de Contas'}
            </Button>
          </Box>
        )}

        {resultado && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={resultado.erros > 0 ? 'warning' : 'success'}
              sx={{ mb: resultado.detalhes?.length > 0 ? 2 : 0 }}
            >
              <Typography variant="body2">
                <strong>✅ Importação concluída:</strong> {resultado.sucesso || 0} contas
                importadas
                {resultado.erros > 0 && `, ${resultado.erros} erros`}
              </Typography>
            </Alert>

            {resultado.detalhes && resultado.detalhes.length > 0 && (
              <Alert severity="warning">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Detalhes dos Erros:
                </Typography>
                {resultado.detalhes.map((detalhe, index) => (
                  <Typography key={index} variant="caption" display="block">
                    • {detalhe}
                  </Typography>
                ))}
              </Alert>
            )}
          </Box>
        )}
      </Card>

      {/* Tabela de Contas */}
      {estatisticas?.totalContas > 0 && (
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6">Plano de Contas Cadastrado</Typography>
              <TextField
                size="small"
                placeholder="Buscar por código, classificação ou nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 400 }}
              />
            </Stack>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Classificação</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">Tipo</TableCell>
                  <TableCell align="center">Nível</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Carregando contas...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : contasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        {busca
                          ? 'Nenhuma conta encontrada com esse termo'
                          : 'Nenhuma conta cadastrada'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contasFiltradas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((conta) => (
                      <TableRow key={conta._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                            {conta.codigoSequencial || conta.codigo || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
                            {conta.classificacao || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{conta.nome}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={conta.tipo === 'S' ? 'Sintética' : 'Analítica'}
                            color={conta.tipo === 'S' ? 'info' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`Nível ${conta.nivel}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={conta.ativo ? 'Ativa' : 'Inativa'}
                            color={conta.ativo ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={contasFiltradas.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Card>
      )}

      {/* Informação quando não há contas */}
      {!loading && estatisticas?.totalContas === 0 && !file && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Nenhum plano de contas cadastrado ainda.</strong>
          </Typography>
          <Typography variant="body2">
            Faça o upload de um arquivo PDF com o plano de contas do cliente para começar.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            💡 O PDF deve conter uma tabela com: Código T, Classificação, Nome e Grau
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
