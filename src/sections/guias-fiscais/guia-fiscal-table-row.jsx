'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { formatDate } from 'src/utils/formatters';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { isGuia, getCompetencia, formatCompetencia } from './utils';

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  // Suporta tanto status antigo quanto statusProcessamento novo
  const statusValue = status?.statusProcessamento || status;
  const statusMap = {
    pendente: 'warning',
    processado: 'success',
    erro: 'error',
  };
  return statusMap[statusValue] || 'default';
};

const getStatusLabel = (status) => {
  // Suporta tanto status antigo quanto statusProcessamento novo
  const statusValue = status?.statusProcessamento || status;
  const labelMap = {
    pendente: 'Pendente',
    processado: 'Processado',
    erro: 'Erro',
  };
  return labelMap[statusValue] || statusValue || status;
};

const getStatusPagamentoLabel = (statusPagamento) => {
  if (!statusPagamento) return null;
  const labelMap = {
    a_pagar: 'A Pagar',
    pago: 'Pago',
    vencido: 'Vencido',
  };
  return labelMap[statusPagamento] || statusPagamento;
};

const getStatusPagamentoColor = (statusPagamento) => {
  if (!statusPagamento) return 'default';
  const colorMap = {
    a_pagar: 'warning',
    pago: 'success',
    vencido: 'error',
  };
  return colorMap[statusPagamento] || 'default';
};

const getTipoGuiaLabel = (tipo) => {
  const tipoMap = {
    // Guias Fiscais
    DAS: 'DAS',
    EXTRATO_PGDAS: 'Extrato PGDAS',
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    PIS: 'PIS',
    COFINS: 'COFINS',
    // Guias DP
    INSS: 'INSS',
    FGTS: 'FGTS',
    // Documentos DP
    HOLERITE: 'Holerite',
    EXTRATO_FOLHA_PAGAMENTO: 'Extrato Folha',
    OUTROS: 'Outros',
  };
  return tipoMap[tipo] || tipo;
};

const getCategoriaLabel = (categoria) => {
  const categoriaMap = {
    GUIA_FISCAL: 'Guia Fiscal',
    GUIA_DP: 'Guia DP',
    DOCUMENTO_DP: 'Documento DP',
    ARQUIVO_GERAL: 'Arquivo geral',
  };
  return categoriaMap[categoria] || categoria;
};

const getCategoriaColor = (categoria) => {
  const categoriaMap = {
    GUIA_FISCAL: 'primary',
    GUIA_DP: 'info',
    DOCUMENTO_DP: 'secondary',
    ARQUIVO_GERAL: 'default',
  };
  return categoriaMap[categoria] || 'default';
};

const formatPastaLabel = (folderId) => {
  if (!folderId) return '-';
  if (typeof folderId === 'object' && folderId.nome) return folderId.nome;
  return '-';
};

const compactLabelSx = {
  height: 20,
  minHeight: 20,
  px: 0.75,
  fontSize: '0.66rem',
  lineHeight: 1,
  '& .MuiLabel-icon': { fontSize: 12 },
};

// ----------------------------------------------------------------------

export function GuiaFiscalTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onDownloadRow,
  onMoveRow,
}) {
  const popover = usePopover();

  const {
    nomeArquivo,
    tipoGuia,
    categoria,
    cnpj,
    clienteId,
    folderId,
    dataVencimento,
    status,
    statusProcessamento,
    statusPagamento,
    createdAt,
    dadosExtraidos,
  } = row;

  // Usar statusProcessamento se disponível, senão usar status (compatibilidade)
  const currentStatus = statusProcessamento || status;

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={selected}
      sx={{ '& .MuiTableCell-root': { py: 0.5 } }}
    >
      <TableCell padding="checkbox">
        <Checkbox disableRipple size="small" checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar variant="rounded" sx={{ width: 24, height: 24 }}>
            <Iconify icon="solar:file-text-bold-duotone" width={14} />
          </Avatar>
          <Box>
            <Link
              color="inherit"
              onClick={onViewRow}
              sx={{
                cursor: 'pointer',
                display: 'inline-block',
                maxWidth: 180,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.8125rem',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {nomeArquivo || 'Sem nome'}
            </Link>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          {categoria && (
            <Label variant="soft" color={getCategoriaColor(categoria)} size="small" sx={compactLabelSx}>
              {getCategoriaLabel(categoria)}
            </Label>
          )}
          <Label variant="soft" color="info" size="small" sx={compactLabelSx}>
            {getTipoGuiaLabel(tipoGuia)}
          </Label>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="caption">{cnpj || '-'}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 140 }}>
          {clienteId?.razaoSocial || '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ maxWidth: 180 }}>
        <Tooltip title={typeof folderId === 'object' && folderId?.slug ? folderId.slug : ''}>
          <Typography variant="caption" noWrap>
            {formatPastaLabel(folderId)}
          </Typography>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          {getCompetencia(row) && (
            <Typography variant="caption" color="text.secondary">
              {(() => {
                const competencia = getCompetencia(row);
                const formatted = formatDate(competencia);
                return formatted === '-' ? formatCompetencia(competencia) : formatted;
              })()}
            </Typography>
          )}
          {/* Vencimento - apenas para guias (não para documentos) */}
          {isGuia(categoria) && dataVencimento && (
            <Tooltip title={formatDate(dataVencimento)}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(dataVencimento)}
                </Typography>
              </Box>
            </Tooltip>
          )}
          {!isGuia(categoria) && !getCompetencia(row) && '-'}
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          <Label variant="soft" color={getStatusColor(currentStatus)} size="small" sx={compactLabelSx}>
            {getStatusLabel(currentStatus)}
          </Label>
          {statusPagamento && (
            <Label variant="soft" color={getStatusPagamentoColor(statusPagamento)} size="small" sx={compactLabelSx}>
              {getStatusPagamentoLabel(statusPagamento)}
            </Label>
          )}
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="caption">{formatDate(createdAt)}</Typography>
      </TableCell>

      <TableCell align="right">
        <Tooltip title="Ações">
          <IconButton size="small" color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" width={18} />
          </IconButton>
        </Tooltip>

        <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
          <MenuList>
            <MenuItem
              onClick={() => {
                popover.onClose();
                onViewRow?.();
              }}
            >
              <Iconify icon="solar:eye-bold" width={18} />
              Visualizar
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
                onEditRow?.();
              }}
            >
              <Iconify icon="solar:pen-bold" width={18} />
              Editar
            </MenuItem>

            {onMoveRow && (
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  onMoveRow();
                }}
              >
                <Iconify icon="mdi:folder-move-outline" width={18} />
                Mover para outra pasta
              </MenuItem>
            )}

            {onDownloadRow && (
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  onDownloadRow(row._id, row.nomeArquivo);
                }}
              >
                <Iconify icon="solar:download-bold" width={18} />
                Download
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                popover.onClose();
                onDeleteRow?.();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              Deletar
            </MenuItem>
          </MenuList>
        </CustomPopover>
      </TableCell>
    </TableRow>
  );
}
