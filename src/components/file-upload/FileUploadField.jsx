// src/components/FileUploadField.js

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { baseUrl } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
});

export default function FileUploadField({ name, label, existingFileUrl }) {
  const { control, watch } = useFormContext();
  const selectedFile = watch(name);

  const currentFileName = existingFileUrl ? existingFileUrl.split('/').pop() : '';

  const fullFileUrl = existingFileUrl ? `${baseUrl}${existingFileUrl}` : '';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <Box
          sx={{
            p: 2,
            border: (theme) => `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color={error ? 'error' : 'text.primary'}>
              {label}
            </Typography>

            {existingFileUrl && !selectedFile && (
              <Link
                href={fullFileUrl}
                target="_blank"
                rel="noopener"
                download={currentFileName}
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Iconify icon="solar:link-bold" />
                {currentFileName}
              </Link>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  maxWidth: 'calc(100% - 120px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedFile?.name || 'Nenhum arquivo novo.'}
              </Typography>

              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:upload-bold-duotone" />}
              >
                {existingFileUrl ? 'Alterar' : 'Selecionar'}
                <VisuallyHiddenInput 
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
              </Button>
            </Stack>
            {error && <Typography variant="caption" color="error">{error.message}</Typography>}
          </Stack>
        </Box>
      )}
    />
  );
}
