'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import {
  Box,
  Modal,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { downloadLicenca, updateLicencaWithFile, deletarArquivoLicenca } from 'src/actions/societario';

export default function LicenseModal({ licenca, fetchLicencas, onClose }) { 
  const [editedLicense, setEditedLicense] = useState({
    ...licenca,
    dataInicio: licenca.dataInicio ? licenca.dataInicio.slice(0, 10) : '',
    dataVencimento: licenca.dataVencimento ? licenca.dataVencimento.slice(0, 10) : ''
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(licenca.arquivo ? licenca.arquivo.split('/').pop() : '');

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');

    const dataToSend = {
      ...editedLicense,
      clienteId: editedLicense.cliente?._id
    };

    try {
      await updateLicencaWithFile(editedLicense._id, selectedFile, dataToSend);
      await fetchLicencas();
      toast.success('Arquivo enviado com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
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
      clienteId: editedLicense.cliente?._id
    };

    try {
      await updateLicencaWithFile(editedLicense._id, file, dataToSend);
      await fetchLicencas();
      toast.success('Licença atualizada com sucesso');
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar licença');
    }
  };

  return (
    <Modal open={Boolean(licenca)} onClose={onClose}>
      <Box p={3} sx={{ bgcolor: 'background.paper', boxShadow: 24, width: 600, maxHeight: '90vh', overflowY: 'auto', mx: 'auto', mt: 5 }}>
        <Typography variant="h6">Editar Licença de {editedLicense.cliente?.razaoSocial}</Typography>
        <TextField fullWidth margin="normal" label="Nome" value={editedLicense.nome} InputProps={{ readOnly: true }} />
        <TextField fullWidth margin="normal" label="Estado" value={editedLicense.estado} onChange={(e) => setEditedLicense({ ...editedLicense, estado: e.target.value })} />
        <TextField fullWidth margin="normal" label="Cidade" value={editedLicense.cidade} onChange={(e) => setEditedLicense({ ...editedLicense, cidade: e.target.value })} />
        <TextField fullWidth margin="normal" label="URL de Acesso" value={editedLicense.urldeacesso || ''} onChange={(e) => setEditedLicense({ ...editedLicense, urldeacesso: e.target.value })} />
        <TextField fullWidth margin="normal" label="Observação" multiline rows={3} value={editedLicense.observacao || ''} onChange={(e) => setEditedLicense({ ...editedLicense, observacao: e.target.value })} />
        <TextField
          fullWidth
          margin="normal"
          label="Data de Início"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={editedLicense.dataInicio}
          onChange={(e) => setEditedLicense({ ...editedLicense, dataInicio: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Data de Vencimento"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={editedLicense.dataVencimento}
          onChange={(e) => setEditedLicense({ ...editedLicense, dataVencimento: e.target.value })}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            value={editedLicense.status}
            onChange={(e) => setEditedLicense({ ...editedLicense, status: e.target.value })}
          >
            <MenuItem value="em_processo">Em Processo</MenuItem>
            <MenuItem value="valida">Válida</MenuItem>
            <MenuItem value="vencida">Vencida</MenuItem>
            <MenuItem value="dispensada">Dispensada</MenuItem>
            <MenuItem value="a_expirar">A Expirar</MenuItem>
          </Select>
        </FormControl>
        {fileName ? (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" onClick={handleDownloadLicenca}>Baixar Arquivo</Button>
            <Button variant="contained" color="error" onClick={handleDeleteFile}>Deletar Arquivo</Button>
          </Box>
        ) : (
          <Button fullWidth variant="contained" component="label" sx={{ mt: 2, mb: 1 }}>
            Upload Arquivo
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
        )}
        <Button fullWidth variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>
          Salvar Alterações
        </Button>
        <Button fullWidth variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
          Fechar
        </Button>
      </Box>
    </Modal>
  );
}
