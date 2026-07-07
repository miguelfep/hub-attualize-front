'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardActionArea from '@mui/material/CardActionArea';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { GuiaFiscalPortalReadEye } from './guia-fiscal-portal-read-eye';
import { getStatusPagamentoChipProps } from '../guia-documento-visualizacao';
import {
  DRIVE_BORDER_COLOR,
  DRIVE_FILE_CARD_SX,
  getDriveFileVisual,
  DRIVE_FOLDER_CARD_SX,
  DRIVE_SURFACE_RADIUS,
  getDriveFolderVisual,
  DRIVE_FILE_PREVIEW_SX,
  DRIVE_FILE_PREVIEW_COMPACT_SX,
} from '../guia-drive-file-visual';

// ----------------------------------------------------------------------

export const DRIVE_MORE_ACTIONS_ICON_BTN_SX = {
  position: 'absolute',
  zIndex: 2,
  p: 0.25,
  minWidth: 28,
  width: 28,
  height: 28,
  color: 'text.secondary',
  bgcolor: 'background.paper',
  borderRadius: '50%',
  boxShadow: (theme) => theme.shadows[1],
  opacity: 0,
  transition: (theme) =>
    theme.transitions.create(['opacity', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  '.MuiCard-root:hover &': { opacity: 1 },
  '&:hover': { bgcolor: 'action.hover' },
};

const DRIVE_CHECKBOX_SX = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 3,
  p: 0,
  opacity: 0,
  transition: (theme) => theme.transitions.create('opacity', { duration: theme.transitions.duration.shorter }),
  '.MuiCard-root:hover &': { opacity: 1 },
  '&.Mui-checked, &.drive-checkbox-visible': { opacity: 1 },
};

function DriveFileExtensionPreview({ nomeArquivo, large = true }) {
  const visual = getDriveFileVisual(nomeArquivo);
  const iconWidth = large ? 48 : 28;

  if (!large) {
    return (
      <Box sx={DRIVE_FILE_PREVIEW_COMPACT_SX}>
        <Iconify icon={visual.icon} width={iconWidth} sx={{ color: visual.color }} />
      </Box>
    );
  }

  return (
    <Box sx={DRIVE_FILE_PREVIEW_SX}>
      <Iconify icon={visual.icon} width={iconWidth} sx={{ color: visual.color }} />
    </Box>
  );
}

export function DriveFileThumbnail({ nomeArquivo, large, sx }) {
  return (
    <Box sx={sx}>
      <DriveFileExtensionPreview nomeArquivo={nomeArquivo} large={large} />
    </Box>
  );
}

function formatFileSize(bytes) {
  const n = Number(bytes);
  if (!n || n <= 0) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function DriveFileMetadataCaption({ file, showIcon = false }) {
  const visual = getDriveFileVisual(file?.nomeArquivo);
  const dateLabel = file?.createdAt ? fDate(file.createdAt) : file?.processadoEm ? fDate(file.processadoEm) : null;
  const sizeLabel = formatFileSize(file?.tamanhoArquivo ?? file?.size ?? file?.fileSize);
  const meta = [dateLabel, sizeLabel].filter(Boolean).join(' · ');

  if (showIcon) {
    return (
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: visual.bg,
            flexShrink: 0,
          }}
        >
          <Iconify icon={visual.icon} width={14} sx={{ color: visual.color }} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }} noWrap>
          {meta || visual.label}
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }} noWrap>
      {[visual.label, meta].filter(Boolean).join(' · ')}
    </Typography>
  );
}

function FolderIconBox({ folder, size = 48, iconSize = 28 }) {
  const visual = getDriveFolderVisual(folder);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: visual.bg,
        color: visual.color,
        flexShrink: 0,
      }}
    >
      <Iconify icon={visual.icon} width={iconSize} />
    </Box>
  );
}

// ----------------------------------------------------------------------

function DriveFolderCardInner({ folder, onOpen, onContextMenu, onMoreClick, hideActions = false }) {
  return (
    <Card
      data-folder-card
      variant="outlined"
      sx={DRIVE_FOLDER_CARD_SX}
      onContextMenu={hideActions ? undefined : onContextMenu}
    >
      {!hideActions && onMoreClick ? (
        <Tooltip title="Mais ações">
          <IconButton
            size="small"
            sx={{ ...DRIVE_MORE_ACTIONS_ICON_BTN_SX, top: 6, right: 6, opacity: 1 }}
            onClick={onMoreClick}
          >
            <Iconify icon="eva:more-vertical-fill" width={16} />
          </IconButton>
        </Tooltip>
      ) : null}
      <CardActionArea onClick={onOpen} sx={{ borderRadius: DRIVE_SURFACE_RADIUS }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ p: 1.25, pr: hideActions ? 1.25 : 5, minHeight: 56 }}
        >
          <FolderIconBox folder={folder} size={32} iconSize={20} />
          <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
            {folder.nome}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export function DriveFolderCardGrid(props) {
  return <DriveFolderCardInner {...props} />;
}

export function DriveFolderStripCard(props) {
  return <DriveFolderCardInner {...props} />;
}

export function DriveFolderCardList({ folder, onOpen, onContextMenu, onMoreClick }) {
  const visual = getDriveFolderVisual(folder);

  return (
    <Card
      data-folder-card
      variant="outlined"
      sx={{
        ...DRIVE_FOLDER_CARD_SX,
        width: '100%',
        maxWidth: 'none',
        flex: '1 1 auto',
      }}
      onContextMenu={onContextMenu}
    >
      <Tooltip title="Mais ações">
        <IconButton size="small" sx={{ ...DRIVE_MORE_ACTIONS_ICON_BTN_SX, top: 6, right: 6, opacity: 1 }} onClick={onMoreClick}>
          <Iconify icon="eva:more-vertical-fill" width={16} />
        </IconButton>
      </Tooltip>
      <CardActionArea onClick={onOpen}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ p: 1.25, pr: 5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: visual.bg,
              color: visual.color,
              flexShrink: 0,
            }}
          >
            <Iconify icon={visual.icon} width={20} />
          </Box>
          <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
            {folder.nome}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

// ----------------------------------------------------------------------


export function DriveFileCardGrid({
  file,
  selected,
  fileMetaLines,
  onToggleSelect,
  onContextMenu,
  onMoreClick,
  onDownload,
}) {
  return (
    <Card
      variant="outlined"
      onContextMenu={onContextMenu}
      className="drive-card"
      sx={{
        ...DRIVE_FILE_CARD_SX,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.lighter' : 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 140,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
        onClick={onToggleSelect}
      >
        <Checkbox
          size="small"
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          sx={{
            ...DRIVE_CHECKBOX_SX,
            position: 'absolute',
            top: 8,
            left: 8,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s',
            '.drive-card:hover &': { opacity: 1 },
          }}
        />

        <Tooltip title="Mais ações">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMoreClick(e);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              opacity: selected ? 1 : 0,
              transition: 'opacity 0.2s',
              '.drive-card:hover &': { opacity: 1 },
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <Iconify icon="eva:more-vertical-fill" width={16} />
          </IconButton>
        </Tooltip>

        <DriveFileExtensionPreview nomeArquivo={file.nomeArquivo} large />
      </Box>

      <Stack spacing={1} sx={{ px: 1.5, py: 1.5 }}>

        <Typography
          variant="subtitle2"
          fontWeight={600}
          noWrap
          title={file.nomeArquivo}
        >
          {file.nomeArquivo || 'Documento'}
        </Typography>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              '& > *': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.75rem',
                color: 'text.secondary',
              },
            }}
          >
            {fileMetaLines}

            {file.tipoGuia && (
              <Typography component="span">
                {file.tipoGuia}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ alignSelf: 'flex-start', mt: 0.5, minWidth: 0, maxWidth: '100%' }}>
          <GuiaFiscalPortalReadEye
            guia={file}
            showInlineSummary
            iconWidth={18}
          />
        </Box>

      </Stack>
    </Card>
  );
}

export function DriveEmptyDropZone({ onUpload, uploadDisabled, hint }) {
  return (
    <Stack
      alignItems="center"
      spacing={2}
      sx={{
        py: 5,
        px: 3,
        borderRadius: DRIVE_SURFACE_RADIUS,
        border: `2px dashed ${DRIVE_BORDER_COLOR}`,
        bgcolor: '#F8FAFC',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.main',
        }}
      >
        <Iconify icon="solar:cloud-upload-bold-duotone" width={36} />
      </Box>
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="subtitle2" fontWeight={600}>
          Arraste arquivos aqui
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {hint || 'Solte PDFs ou planilhas nesta pasta, ou escolha arquivos no seu computador.'}
        </Typography>
      </Stack>
      <Button
        variant="contained"
        size="medium"
        disabled={uploadDisabled}
        startIcon={<Iconify icon="solar:upload-bold" />}
        onClick={onUpload}
        sx={{ borderRadius: DRIVE_SURFACE_RADIUS }}
      >
        Escolher arquivos
      </Button>
    </Stack>
  );
}

export function DriveFileCardList({
  file,
  selected,
  fileMetaLines,
  onToggleSelect,
  onContextMenu,
  onMoreClick,
  onDownload,
}) {
  return (
    <Card
      variant="outlined"
      className="drive-list-row"
      onContextMenu={onContextMenu}
      onClick={onToggleSelect}
      sx={{
        ...DRIVE_FILE_CARD_SX,
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.lighter' : 'background.paper',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ width: '100%', minWidth: 0 }}
      >
        <Checkbox
          size="small"
          checked={selected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          sx={{
            ...DRIVE_CHECKBOX_SX,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s',
            '.drive-list-row:hover &': { opacity: 1 },
          }}
        />

        <Box sx={{ flexShrink: 0 }}>
          <DriveFileExtensionPreview nomeArquivo={file.nomeArquivo} large={false} />
        </Box>

        <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap title={file.nomeArquivo}>
            {file.nomeArquivo || 'Documento'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.75rem',
                color: 'text.secondary',
              },
            }}
          >
            <DriveFileMetadataCaption file={file} />

            {file.tipoGuia && (
              <Typography component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {file.tipoGuia}
              </Typography>
            )}

            {fileMetaLines}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>

          <Box sx={{ mr: 1 }}>
            <GuiaFiscalPortalReadEye guia={file} showInlineSummary iconWidth={18} />
          </Box>

          {onDownload ? (
            <Tooltip title="Baixar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(e);
                }}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '.drive-list-row:hover &': { opacity: 1 }
                }}
              >
                <Iconify icon="eva:download-outline" width={18} color="text.secondary" />
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title="Mais ações">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMoreClick(e);
              }}
              sx={{
                opacity: selected ? 1 : 0,
                transition: 'opacity 0.2s',
                '.drive-list-row:hover &': { opacity: 1 }
              }}
            >
              <Iconify icon="eva:more-vertical-fill" width={18} color="text.secondary" />
            </IconButton>
          </Tooltip>

        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function DriveRootEmptyZone() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={3}
      sx={{
        py: 8,
        px: 3,
        borderRadius: DRIVE_SURFACE_RADIUS,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F4F6F8' : 'background.neutral'),
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => theme.palette.action.hover,
          color: 'text.disabled',
        }}
      >
        <Iconify icon="solar:file-bold" width={48} />
      </Box>

      <Stack spacing={1} alignItems="center">
        <Typography variant="h6" color="text.secondary">
          Área da Raiz
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400 }}>
          Não é possível visualizar arquivos diretamente aqui. Navegue entre as pastas principais e as
          subpastas para visualizar e baixar os documentos disponíveis.
        </Typography>
      </Stack>
    </Stack>
  );
}

export function DriveFolderEmptyPortal() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        py: 5,
        px: 3,
        borderRadius: DRIVE_SURFACE_RADIUS,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F4F6F8' : 'background.neutral'),
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => theme.palette.action.hover,
          color: 'text.disabled',
        }}
      >
        <Iconify icon="solar:file-bold" width={36} />
      </Box>
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          Nenhum arquivo nesta pasta
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360 }}>
          Os documentos publicados pela sua contabilidade aparecerão aqui para visualização e download.
        </Typography>
      </Stack>
    </Stack>
  );
}

export function DriveFileCardGridPortal({ file, fileMetaLines, isNovo, onDownload, onPreview }) {
  const statusChip = file?.semArquivo ? getStatusPagamentoChipProps(file?.statusPagamento) : null;

  return (
    <Card
      variant="outlined"
      className="drive-card-portal"
      sx={{
        ...DRIVE_FILE_CARD_SX,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 140,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <DriveFileExtensionPreview nomeArquivo={file.nomeArquivo} large />
      </Box>

      <Stack spacing={1} sx={{ px: 1.5, py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap title={file.nomeArquivo} sx={{ flex: 1, minWidth: 0 }}>
            {file.nomeArquivo || 'Documento'}
          </Typography>
          {statusChip ? (
            <Chip label={statusChip.label} color={statusChip.color} size="small" variant="soft" sx={{ height: 22, flexShrink: 0 }} />
          ) : isNovo ? (
            <Chip label="Novo" color="info" size="small" variant="soft" sx={{ height: 22, flexShrink: 0 }} />
          ) : null}
        </Stack>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              '& > *': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.75rem',
                color: 'text.secondary',
              },
            }}
          >
            {fileMetaLines}
            {file.tipoGuia ? <Typography component="span">{file.tipoGuia}</Typography> : null}
          </Box>
        </Stack>

        {onDownload || onPreview ? (
          <Stack direction="row" spacing={1}>
            {onPreview ? (
              <Button
                size="small"
                variant="text"
                startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                onClick={onPreview}
                sx={{ borderRadius: DRIVE_SURFACE_RADIUS }}
              >
                Visualizar
              </Button>
            ) : null}
            {onDownload ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:download-outline" width={18} />}
                onClick={onDownload}
                sx={{ borderRadius: DRIVE_SURFACE_RADIUS }}
              >
                Baixar
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}

export function DriveFileCardListPortal({ file, fileMetaLines, isNovo, onDownload, onPreview }) {
  const statusChip = file?.semArquivo ? getStatusPagamentoChipProps(file?.statusPagamento) : null;

  return (
    <Card
      variant="outlined"
      className="drive-list-row-portal"
      sx={{
        ...DRIVE_FILE_CARD_SX,
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
        <Box sx={{ flexShrink: 0 }}>
          <DriveFileExtensionPreview nomeArquivo={file.nomeArquivo} large={false} />
        </Box>

        <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap title={file.nomeArquivo} sx={{ flex: 1, minWidth: 0 }}>
              {file.nomeArquivo || 'Documento'}
            </Typography>
            {statusChip ? (
              <Chip label={statusChip.label} color={statusChip.color} size="small" variant="soft" sx={{ height: 22, flexShrink: 0 }} />
            ) : isNovo ? (
              <Chip label="Novo" color="info" size="small" variant="soft" sx={{ height: 22, flexShrink: 0 }} />
            ) : null}
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > *': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.75rem',
                color: 'text.secondary',
              },
            }}
          >
            <DriveFileMetadataCaption file={file} />
            {file.tipoGuia ? (
              <Typography component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {file.tipoGuia}
              </Typography>
            ) : null}
            {fileMetaLines}
          </Box>
        </Stack>

        {onPreview ? (
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              onClick={onPreview}
              sx={{
                flexShrink: 0,
                opacity: 0,
                transition: 'opacity 0.2s',
                '.drive-list-row-portal:hover &': { opacity: 1 },
              }}
            >
              <Iconify icon="solar:eye-bold" width={18} color="text.secondary" />
            </IconButton>
          </Tooltip>
        ) : null}
        {onDownload ? (
          <Tooltip title="Baixar">
            <IconButton
              size="small"
              onClick={onDownload}
              sx={{
                flexShrink: 0,
                opacity: 0,
                transition: 'opacity 0.2s',
                '.drive-list-row-portal:hover &': { opacity: 1 },
              }}
            >
              <Iconify icon="eva:download-outline" width={18} color="text.secondary" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Card>
  );
}
