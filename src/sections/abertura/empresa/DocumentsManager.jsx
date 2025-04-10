import React from 'react';
import { toast } from 'sonner';

import { Box, Grid, Button, Switch, Divider, Typography, FormControlLabel } from '@mui/material';

import { uploadArquivo, deletarArquivo, downloadArquivo } from 'src/actions/societario';

const DocumentsManager = ({ formData, setFormData, aberturaId }) => {
  const handleUpload = async (name) => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf';
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const response = await uploadArquivo(aberturaId, name, file);

            if (response.status === 200) {
              const updatedData = response.data; // A resposta é o objeto atualizado
              setFormData((prev) => ({ ...prev, ...updatedData }));
              toast.success(`${name} enviado com sucesso!`);
            } else {
              throw new Error('Erro ao enviar arquivo.');
            }
          } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
            toast.error(`Erro ao enviar ${name}.`);
          }
        }
      };
      fileInput.click();
    } catch (error) {
      toast.error(`Erro ao iniciar o envio de ${name}.`);
    }
  };

  const handleDownload = async (name) => {
    try {
      const fileUrl = formData[name];
      if (!fileUrl) throw new Error('Arquivo não disponível para download.');

      const filename = fileUrl.split('/').pop();
      const response = await downloadArquivo(aberturaId, name, filename);

      if (response?.data) {
        const blob = new Blob([response.data], { type: response.data.type });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(`${name} baixado com sucesso.`);
      } else {
        throw new Error('Erro ao baixar arquivo.');
      }
    } catch (error) {
      toast.error(`Erro ao baixar ${name}.`);
    }
  };

  const handleDelete = async (name) => {
    try {
      const response = await deletarArquivo(aberturaId, name);

      if (response.status === 200) {
        const updatedData = response.data; // A resposta é o objeto atualizado
        setFormData((prev) => ({ ...prev, ...updatedData }));
        toast.success(`${name} deletado com sucesso.`);
      } else {
        throw new Error('Erro ao deletar arquivo.');
      }
    } catch (error) {
      toast.error(`Erro ao deletar ${name}.`);
    }
  };

  const handleToggleChange = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const documents = [
    { label: 'RG', name: 'rgAnexo' },
    { label: 'IPTU', name: 'iptuAnexo' },
    { label: 'Documento RT', name: 'documentoRT', toggle: 'possuiRT' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Documentos
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Toggles */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.notificarWhats || false}
              onChange={() => handleToggleChange('notificarWhats')}
            />
          }
          label="Notificar whatsapp?"
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.marcaRegistrada || false}
              onChange={() => handleToggleChange('marcaRegistrada')}
            />
          }
          label="Tem marca registrada?"
        />
        {!formData.marcaRegistrada && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.interesseRegistroMarca || false}
                onChange={() => handleToggleChange('interesseRegistroMarca')}
              />
            }
            label="Interesse em registrar marca?"
          />
        )}
        <FormControlLabel
          control={
            <Switch
              checked={formData.possuiRT || false}
              onChange={() => handleToggleChange('possuiRT')}
            />
          }
          label="Possui RT?"
        />
      </Box>

      {/* Document Upload */}
      <Grid container spacing={3}>
        {documents.map((doc) => {
          if (doc.toggle && !formData[doc.toggle]) return null;

          return (
            <Grid item xs={12} sm={6} md={4} key={doc.name}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  padding: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {doc.label}
                </Typography>
                {formData[doc.name] ? (
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleDownload(doc.name)}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Baixar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(doc.name)}
                      fullWidth
                    >
                      Deletar
                    </Button>
                  </Box>
                ) : (
                  <Button variant="contained" onClick={() => handleUpload(doc.name)} fullWidth>
                    Enviar Documento
                  </Button>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DocumentsManager;
