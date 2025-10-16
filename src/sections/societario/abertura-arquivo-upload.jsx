import { toast } from 'sonner';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { styled } from '@mui/material/styles';
import { Box, Button, Typography, DialogActions } from '@mui/material';

import { uploadArquivo } from 'src/actions/societario';

import { Iconify } from 'src/components/iconify';

const HeadingTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(4),
  },
}));

const documentFieldMapping = {
  RG: 'rgAnexo',
  IPTU: 'iptuAnexo',
  RT: 'documentoRT',
  // Add other mappings as necessary
};

const UploadArquivoAbertura = ({ handleDialogClose, name, clientId, onFileUploaded }) => {
  const [files, setFiles] = useState([]);

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.pdf'],
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles.map((file) => Object.assign(file)));
    },
  });

  const handleSubmit = async (event) => {
    // Prevent the form submission and stop event propagation
    event.preventDefault();
    event.stopPropagation();

    const arquivo = files[0];
    if (!arquivo) {
      toast.error('Por favor, selecione um arquivo antes de enviar.');
      return;
    }

    try {
      const response = await uploadArquivo(clientId, name, arquivo);
      if (response.status === 200) {
        const updatedData = {
          [documentFieldMapping[name]]: response.data[documentFieldMapping[name]],
        };

        handleDialogClose(); // Fecha o diálogo após upload
        onFileUploaded(name, updatedData); // Atualiza os dados no componente pai
        toast.success('Arquivo enviado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo', error);
      toast.error('Erro ao enviar arquivo');
    }
  };

  return (
    <Box {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      {/* Renderizar a imagem de pré-visualização */}
      {files.length ? (
        <img key={files[0].name} alt={files[0].name} src={URL.createObjectURL(files[0])} />
      ) : (
        <div className="flex items-center flex-col md:flex-row">
          <Iconify icon="eva:cloud-upload-fill" width={40} />
          <div className="flex flex-col md:[text-align:unset] text-center">
            <HeadingTypography variant="h5">
              Arraste o arquivo aqui para fazer o upload.
            </HeadingTypography>
            <Typography>
              ou clique aqui{' '}
              <a
                href="/"
                onClick={(e) => e.preventDefault()}
                className="text-textPrimary no-underline"
              >
                buscar
              </a>{' '}
              para localizar o arquivo
            </Typography>
          </div>
        </div>
      )}
      <DialogActions>
        <Button
          color="success"
          variant="outlined"
          onClick={(e) => {
            // Parando a propagação do evento de clique para evitar o envio do formulário principal
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e); // Função de envio de arquivo
          }}
        >
          Enviar
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation(); // Previne a propagação do evento de clique
            handleDialogClose(e); // Fecha o modal
          }}
          color="secondary"
        >
          Fechar
        </Button>
      </DialogActions>
    </Box>
  );
};

export default UploadArquivoAbertura;
