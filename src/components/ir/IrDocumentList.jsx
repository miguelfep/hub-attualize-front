import { ptBR } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const VALIDACAO_COLOR = {
  pendente: 'warning',
  validado: 'success',
  rejeitado: 'error',
};

const VALIDACAO_LABEL = {
  pendente: 'Pendente',
  validado: 'Validado',
  rejeitado: 'Rejeitado',
};

function formatData(isoString) {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return '-';
  }
}

// ----------------------------------------------------------------------

/**
 * Lista de documentos de um pedido IR com badges e ação de download opcional
 * @param {{ documents: Array, onDownload?: (doc) => void, showDownload?: boolean }} props
 */
export default function IrDocumentList({ documents = [], onDownload, showDownload = false }) {
  if (!documents.length) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1.5,
        }}
      >
        <Iconify icon="eva:file-outline" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Nenhum documento enviado ainda.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tipo do documento</TableCell>
            <TableCell>Enviado por</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Validação</TableCell>
            {showDownload && <TableCell align="center">Baixar</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc._id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {doc.tipo_documento}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.fileName}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={doc.uploadedBy === 'admin' ? 'Admin' : 'Cliente'}
                  size="small"
                  color={doc.uploadedBy === 'admin' ? 'primary' : 'default'}
                  variant="soft"
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption">{formatData(doc.data_upload)}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={VALIDACAO_LABEL[doc.status_validacao] ?? doc.status_validacao}
                  color={VALIDACAO_COLOR[doc.status_validacao] ?? 'default'}
                  size="small"
                  variant="soft"
                />
              </TableCell>
              {showDownload && (
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<Iconify icon="eva:download-outline" />}
                    onClick={() => onDownload?.(doc)}
                  >
                    Baixar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
