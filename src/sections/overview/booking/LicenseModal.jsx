'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Modal,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
} from '@mui/material';

import {
  downloadLicenca,
  updateLicencaWithFile,
  deletarArquivoLicenca,
  validarArquivoLicenca,
  criarComentarioLicenca,
  listarComentariosLicenca,
  deletarComentarioSocietario,
} from 'src/actions/societario';

import { useAuthContext } from 'src/auth/hooks';

export default function LicenseModal({ licenca, fetchLicencas, onClose }) {
  const { user } = useAuthContext();
  const [editedLicense, setEditedLicense] = useState({
    ...licenca,
    dataInicio: licenca.dataInicio ? licenca.dataInicio.slice(0, 10) : '',
    dataVencimento: licenca.dataVencimento ? licenca.dataVencimento.slice(0, 10) : '',
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(licenca.arquivo ? licenca.arquivo.split('/').pop() : '');
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [tipoComentario, setTipoComentario] = useState('comentario');
  const [visivel, setVisivel] = useState(false);

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validar tamanho do arquivo
    const validacao = validarArquivoLicenca(selectedFile);
    if (!validacao.isValid) {
      toast.error(validacao.error);
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);

    const dataToSend = {
      ...editedLicense,
      clienteId: editedLicense.cliente?._id,
    };

    try {
      await updateLicencaWithFile(editedLicense._id, selectedFile, dataToSend);
      await fetchLicencas();
      toast.success('Arquivo enviado com sucesso');
    } catch (error) {
      if (error.response?.status === 413 || error.status === 413) {
        toast.error(error.response?.data?.message || 'Arquivo muito grande. O tamanho máximo permitido é 20MB.');
      } else {
        toast.error('Erro ao enviar arquivo');
      }
      console.error('Erro ao enviar arquivo:', error);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await deletarArquivoLicenca(editedLicense._id);
      setFile(null);
      setFileName('');
      await fetchLicencas();
      toast.success('Arquivo deletado');
    } catch (error) {
      toast.error('Erro ao deletar arquivo');
    }
  };

  const handleDownloadLicenca = async () => {
    try {
      const response = await downloadLicenca(editedLicense._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'licenca.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erro ao baixar a licença');
    }
  };

  const handleSaveChanges = async () => {
    const dataToSend = {
      ...editedLicense,
      clienteId: editedLicense.cliente?._id,
    };

    // Validar arquivo se houver novo arquivo
    if (file) {
      const validacao = validarArquivoLicenca(file);
      if (!validacao.isValid) {
        toast.error(validacao.error);
        return;
      }
    }

    try {
      await updateLicencaWithFile(editedLicense._id, file, dataToSend);
      await fetchLicencas();
      toast.success('Licença atualizada com sucesso');
      onClose();
    } catch (error) {
      if (error.response?.status === 413 || error.status === 413) {
        toast.error(error.response?.data?.message || 'Arquivo muito grande. O tamanho máximo permitido é 20MB.');
      } else {
        toast.error('Erro ao atualizar licença');
      }
      console.error('Erro ao atualizar licença:', error);
    }
  };

  const loadComentarios = async () => {
    try {
      const res = await listarComentariosLicenca(editedLicense._id, true);
      setComentarios(res.data?.data || []);
    } catch (error) {
      // Silencia erro
    }
  };

  useEffect(() => {
    loadComentarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedLicense._id]);

  const handleCriarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      await criarComentarioLicenca(editedLicense._id, {
        autor: user?.name || user?.email || 'Usuário',
        comentario: novoComentario,
        tipo: tipoComentario,
        visivel,
      });
      setNovoComentario('');
      await loadComentarios();
    } catch (error) {
      toast.error('Erro ao criar comentário');
    }
  };

  const handleDeletarComentario = async (comentarioId) => {
    try {
      await deletarComentarioSocietario(comentarioId);
      await loadComentarios();
      toast.success('Comentário deletado');
    } catch (error) {
      toast.error('Erro ao deletar comentário');
    }
  };

  return (
    <Modal open={Boolean(licenca)} onClose={onClose}>
      <Box
        p={3}
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 24,
          width: 1100,
          maxHeight: '90vh',
          overflowY: 'auto',
          mx: 'auto',
          mt: 5,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Editar Licença de {editedLicense.cliente?.razaoSocial}</Typography>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField fullWidth label="Nome" value={editedLicense.nome} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid xs={12} sm={3}>
            <TextField fullWidth label="Estado" value={editedLicense.estado} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid xs={12} sm={3}>
            <TextField fullWidth label="Cidade" value={editedLicense.cidade} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid xs={12}>
            <TextField fullWidth label="URL de Acesso" value={editedLicense.urldeacesso || ''} onChange={(e) => setEditedLicense({ ...editedLicense, urldeacesso: e.target.value })} />
          </Grid>
          <Grid xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editedLicense.status}
                label="Status"
                onChange={(e) => {
                  const status = e.target.value;
                  setEditedLicense({
                    ...editedLicense,
                    status,
                    dataVencimento: status === 'dispensada' ? '' : editedLicense.dataVencimento,
                  });
                }}
              >
                <MenuItem value="em_processo">Em Processo</MenuItem>
                <MenuItem value="valida">Válida</MenuItem>
                <MenuItem value="vencida">Vencida</MenuItem>
                <MenuItem value="dispensada">Dispensada</MenuItem>
                <MenuItem value="a_expirar">A Expirar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Data de Início"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editedLicense.dataInicio}
              onChange={(e) => setEditedLicense({ ...editedLicense, dataInicio: e.target.value })}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <TextField
              fullWidth
              label="Data de Vencimento"
              type="date"
              InputLabelProps={{ shrink: true }}
              disabled={editedLicense.status === 'dispensada'}
              value={editedLicense.status === 'dispensada' ? '' : editedLicense.dataVencimento}
              onChange={(e) => setEditedLicense({ ...editedLicense, dataVencimento: e.target.value })}
            />
          </Grid>
          <Grid xs={12}>
            <TextField fullWidth label="Observação" multiline rows={3} value={editedLicense.observacao || ''} onChange={(e) => setEditedLicense({ ...editedLicense, observacao: e.target.value })} />
          </Grid>
        </Grid>
        {fileName ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" onClick={handleDownloadLicenca}>
              Baixar Arquivo
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteFile}>
              Deletar Arquivo
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="contained" component="label">
              Upload Arquivo (máx. 20MB)
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
            {file && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>
        )}
        <Button fullWidth variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>
          Salvar Alterações
        </Button>
        <Button fullWidth variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          Fechar
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Comentários e Observações</Typography>
          <Grid container spacing={1} alignItems="stretch" sx={{ mb: 2 }}>
            <Grid xs={12}>
              <TextField label="Novo comentário" value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} fullWidth multiline maxRows={6} />
            </Grid>
            <Grid xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={tipoComentario} label="Tipo" onChange={(e) => setTipoComentario(e.target.value)}>
                  <MenuItem value="comentario">Comentário</MenuItem>
                  <MenuItem value="observacao">Observação</MenuItem>
                  <MenuItem value="atualizacao">Atualização</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Visibilidade</InputLabel>
                <Select value={visivel ? 'publico' : 'interno'} label="Visibilidade" onChange={(e) => setVisivel(e.target.value === 'publico')}>
                  <MenuItem value="publico">Visível ao cliente</MenuItem>
                  <MenuItem value="interno">Interno</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={4} display="flex" alignItems="center" justifyContent="flex-end">
              <Button variant="contained" onClick={handleCriarComentario}>Adicionar</Button>
            </Grid>
          </Grid>

          <Box sx={{ position: 'relative', pl: 3, '&:before': { content: '""', position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, bgcolor: 'divider' } }}>
            {comentarios.map((c) => (
              <Box key={c._id} sx={{ position: 'relative', mb: 2, pl: 2 }}>
                <Box sx={{ position: 'absolute', left: -2, top: 6, width: 10, height: 10, borderRadius: '50%', bgcolor: c.visivel ? 'success.main' : 'text.disabled' }} />
                <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <span>{c.autor} • {new Date(c.dataComentario).toLocaleString()}</span>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{c.tipo}{c.visivel ? ' (público)' : ' (interno)'}</span>
                    {(c.autor === user?.name || c.autor === user?.email) && (
                      <IconButton size="small" aria-label="Excluir comentário" onClick={() => handleDeletarComentario(c._id)}>
                        ×
                      </IconButton>
                    )}
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.comentario}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
