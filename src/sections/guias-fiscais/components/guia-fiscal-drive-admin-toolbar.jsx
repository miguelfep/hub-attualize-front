'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

import { DRIVE_BORDER_COLOR, DRIVE_SURFACE_RADIUS } from '../guia-drive-file-visual';

// ----------------------------------------------------------------------

export function GuiaFiscalDriveAdminToolbar({
  canGoBack,
  onGoBack,
  onNavigateRoot,
  folderPath = [],
  onNavigateFolder,
  onUpload,
  uploadDisabled,
  filesViewMode,
  onFilesViewModeChange,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{
        py: 1.25,
        px: { xs: 0, sm: 0.25 },
        mb: 0.5,
        borderBottom: `1px solid ${DRIVE_BORDER_COLOR}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
        {canGoBack ? (
          <IconButton size="small" onClick={onGoBack} aria-label="Voltar para pasta anterior">
            <Iconify icon="eva:arrow-ios-back-fill" width={20} />
          </IconButton>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.25,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Button
            size="small"
            color="inherit"
            onClick={onNavigateRoot}
            sx={{
              minWidth: 0,
              px: 1,
              fontWeight: folderPath.length ? 500 : 700,
              color: folderPath.length ? 'text.secondary' : 'text.primary',
            }}
          >
            Drive do cliente
          </Button>

          {folderPath.map((folder, index) => {
            const isLast = index === folderPath.length - 1;
            return (
              <Stack key={folder._id} direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
                <Iconify icon="eva:chevron-right-fill" width={16} sx={{ color: 'text.disabled', flexShrink: 0 }} />
                <Button
                  size="small"
                  color="inherit"
                  disabled={isLast}
                  onClick={() => !isLast && onNavigateFolder(folder._id)}
                  sx={{
                    minWidth: 0,
                    maxWidth: { xs: 140, sm: 220 },
                    px: 1,
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? 'text.primary' : 'text.secondary',
                  }}
                >
                  <Typography variant="body2" noWrap component="span">
                    {folder.nome}
                  </Typography>
                </Button>
              </Stack>
            );
          })}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon="solar:upload-bold" />}
          disabled={uploadDisabled}
          onClick={onUpload}
          sx={{ borderRadius: DRIVE_SURFACE_RADIUS }}
        >
          Enviar arquivos
        </Button>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filesViewMode}
          onChange={(_, value) => {
            if (value) onFilesViewModeChange(value);
          }}
        >
          <ToggleButton value="grid" aria-label="Grade de arquivos">
            <Iconify icon="solar:widget-5-bold-duotone" width={16} />
          </ToggleButton>
          <ToggleButton value="list" aria-label="Lista de arquivos">
            <Iconify icon="solar:list-bold-duotone" width={16} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
