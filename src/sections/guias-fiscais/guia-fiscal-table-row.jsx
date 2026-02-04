'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

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
  };
  return tipoMap[tipo] || tipo;
};

const getCategoriaLabel = (categoria) => {
  const categoriaMap = {
    GUIA_FISCAL: 'Guia Fiscal',
    GUIA_DP: 'Guia DP',
    DOCUMENTO_DP: 'Documento DP',
  };
  return categoriaMap[categoria] || categoria;
};

const getCategoriaColor = (categoria) => {
  const categoriaMap = {
    GUIA_FISCAL: 'primary',
    GUIA_DP: 'info',
    DOCUMENTO_DP: 'secondary',
  };
  return categoriaMap[categoria] || 'default';
};

// ----------------------------------------------------------------------

export function GuiaFiscalTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onDeleteRow, onDownloadRow }) {
  const {
    nomeArquivo,
    tipoGuia,
    categoria,
    cnpj,
    clienteNome,
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
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar variant="rounded" sx={{ width: 36, height: 36 }}>
            <Iconify icon="solar:file-text-bold-duotone" />
          </Avatar>
          <Box>
            <Link
              color="inherit"
              onClick={onViewRow}
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {nomeArquivo || 'Sem nome'}
            </Link>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          {categoria && (
            <Label variant="soft" color={getCategoriaColor(categoria)} size="small">
              {getCategoriaLabel(categoria)}
            </Label>
          )}
          <Label variant="soft" color="info">
            {getTipoGuiaLabel(tipoGuia)}
          </Label>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{cnpj || '-'}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{clienteNome || '-'}</Typography>
      </TableCell>

      <TableCell>
        {dataVencimento ? (
          <Tooltip title={format(new Date(dataVencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}>
            <Box>{fDate(dataVencimento)}</Box>
          </Tooltip>
        ) : (
          '-'
        )}
      </TableCell>

      <TableCell>
        <Stack spacing={0.5}>
          <Label variant="soft" color={getStatusColor(currentStatus)}>
            {getStatusLabel(currentStatus)}
          </Label>
          {statusPagamento && (
            <Label variant="soft" color={getStatusPagamentoColor(statusPagamento)} size="small">
              {getStatusPagamentoLabel(statusPagamento)}
            </Label>
          )}
        </Stack>
      </TableCell>

      <TableCell>{createdAt ? fDate(createdAt) : '-'}</TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="Visualizar">
            <IconButton onClick={onViewRow}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton onClick={onEditRow}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          {onDownloadRow ? (
            <Tooltip title="Download">
              <IconButton onClick={() => onDownloadRow(row._id, row.nomeArquivo)}>
                <Iconify icon="solar:download-bold" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Deletar">
              <IconButton color="error" onClick={onDeleteRow}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
