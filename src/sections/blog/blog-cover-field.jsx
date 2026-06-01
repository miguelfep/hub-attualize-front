'use client';

import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import ImageList from '@mui/material/ImageList';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ImageListItem from '@mui/material/ImageListItem';
import CircularProgress from '@mui/material/CircularProgress';

import { useBoolean } from 'src/hooks/use-boolean';

import { getStorageAssetUrl } from 'src/utils/axios';

import { uploadBlogImage, useGetBlogImages } from 'src/actions/blog';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Campo de imagem de capa: enviar nova imagem (upload) ou escolher uma já
 * armazenada (galeria). Integra com react-hook-form via useFormContext.
 */
export function BlogCoverField({ name = 'coverImage' }) {
  const { watch, setValue } = useFormContext();
  const value = watch(name);

  const inputRef = useRef(null);
  const gallery = useBoolean();
  const [uploading, setUploading] = useState(false);

  const handlePickFile = () => inputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadBlogImage(file);
      setValue(name, url, { shouldValidate: true, shouldDirty: true });
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error(error);
      toast.error(typeof error === 'string' ? error : 'Falha ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromGallery = (url) => {
    setValue(name, url, { shouldValidate: true, shouldDirty: true });
    gallery.onFalse();
  };

  const handleRemove = () => setValue(name, '', { shouldValidate: true, shouldDirty: true });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Imagem de capa</Typography>

      <Card
        variant="outlined"
        sx={{
          position: 'relative',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ...(value && { backgroundImage: `url(${getStorageAssetUrl(value)})` }),
        }}
      >
        {!value && (
          <Stack alignItems="center" spacing={1} sx={{ color: 'text.disabled' }}>
            <Iconify icon="solar:gallery-add-bold" width={40} />
            <Typography variant="caption">Nenhuma imagem selecionada</Typography>
          </Stack>
        )}

        {value && (
          <Tooltip title="Remover">
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}
      </Card>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={
            uploading ? <CircularProgress size={16} /> : <Iconify icon="solar:upload-bold" />
          }
          disabled={uploading}
          onClick={handlePickFile}
        >
          {uploading ? 'Enviando...' : 'Enviar imagem'}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:gallery-bold" />}
          onClick={gallery.onTrue}
        >
          Escolher da galeria
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Stack>

      <GalleryDialog open={gallery.value} onClose={gallery.onFalse} onSelect={handleSelectFromGallery} />
    </Stack>
  );
}

// ----------------------------------------------------------------------

function GalleryDialog({ open, onClose, onSelect }) {
  // Só busca quando o diálogo abre
  const { imagens, imagensLoading } = useGetBlogImages(open);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Escolher imagem da galeria</DialogTitle>
      <DialogContent dividers>
        {imagensLoading && (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Stack>
        )}

        {!imagensLoading && imagens.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
            Nenhuma imagem armazenada ainda. Envie uma imagem ou importe posts do WordPress.
          </Typography>
        )}

        {!imagensLoading && imagens.length > 0 && (
          <ImageList cols={3} gap={8} sx={{ m: 0 }}>
            {imagens.map((img) => (
              <ImageListItem
                key={img.path}
                onClick={() => onSelect(img.url)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: (theme) => `2px solid transparent`,
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box
                  component="img"
                  src={getStorageAssetUrl(img.url)}
                  alt={img.path}
                  loading="lazy"
                  sx={{ height: 140, objectFit: 'cover', width: '100%' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </DialogContent>
    </Dialog>
  );
}
