import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('pdf')) return 'eva:file-text-fill';
  if (mimeType?.includes('word')) return 'eva:file-text-fill';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'eva:file-text-fill';
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'eva:file-text-fill';
  if (mimeType?.includes('zip') || mimeType?.includes('rar')) return 'eva:archive-fill';
  return 'eva:file-fill';
};

const getFileColor = (mimeType) => {
  if (mimeType?.includes('pdf')) return 'error';
  if (mimeType?.includes('word')) return 'primary';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'success';
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'warning';
  if (mimeType?.includes('zip') || mimeType?.includes('rar')) return 'info';
  return 'default';
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Tamanho desconhecido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / 1024**i * 100) / 100} ${sizes[i]}`;
};

export function DocumentMessage({ message, isOwn }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = message.mediaUrl;
    link.download = message.fileName || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    window.open(message.mediaUrl, '_blank');
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        minWidth: 250,
        maxWidth: 300,
      }}
    >
      <Stack spacing={2}>
        {/* Cabeçalho do arquivo */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon={getFileIcon(message.mimeType)}
              width={24}
              color={`${getFileColor(message.mimeType)}.main`}
            />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {message.fileName || 'Documento'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(message.fileSize)}
            </Typography>
          </Box>
        </Stack>

        {/* Tipo de arquivo */}
        <Chip
          label={message.mimeType || 'Arquivo'}
          size="small"
          color={getFileColor(message.mimeType)}
          variant="outlined"
        />

        {/* Ações */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              onClick={handlePreview}
              color="primary"
            >
              <Iconify icon="eva:eye-fill" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={handleDownload}
              color="primary"
            >
              <Iconify icon="eva:download-fill" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}

DocumentMessage.propTypes = {
  message: PropTypes.object.isRequired,
  isOwn: PropTypes.bool,
};
