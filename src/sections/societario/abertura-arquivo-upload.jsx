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

const UploadArquivoAbertura = ({ handleDialogClose, name, clientId, onFileUploadSuccess }) => {
  const [files, setFiles] = useState([]);
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
    event.preventDefault();
    const arquivo = files[0];

    try {
      const response = await uploadArquivo(clientId, name, arquivo);

      if (response.status === 200) {
        handleDialogClose();
        onFileUploadSuccess(); // Chame o callback aqui
        toast.success('Arquivo enviado com sucesso');
      } else {
        // Tratar erro
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
            e.stopPropagation(); // Parando a propagação do evento
            handleSubmit(e);
          }}
        >
          Enviar
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation(); // Parando a propagação do evento
            handleDialogClose(e);
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
