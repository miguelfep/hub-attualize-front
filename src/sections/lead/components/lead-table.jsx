import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { getStatusColor, getStatusLabel } from '../lead-status';
import { parseLeadDate, getFollowUpStatus, FOLLOWUP_STATUS_COLOR } from '../lead-permissions';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', width: 200 },
  { id: 'segment', label: 'Segmento', width: 120 },
  { id: 'origem', label: 'Origem', width: 250 },
  { id: 'statusLead', label: 'Status', width: 140 },
  { id: 'owner', label: 'Responsável', width: 140 },
  { id: '', width: 50 },
];

// ----------------------------------------------------------------------

export function LeadTable({ leads, loading, page, rowsPerPage, totalCount, onPageChange, onRowsPerPageChange }) {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <TableNoData
                    title="Nenhum lead encontrado"
                    description="Tente ajustar os filtros ou aguarde novos leads chegarem"
                  />
                </TableCell>
              </TableRow>
            ) : (
              leads.map((row) => <LeadTableRow key={row._id} row={row} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        page={page}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function LeadTableRow({ row }) {
  const router = useRouter();
  const popover = usePopover();

  const handleOpenDetails = () => {
    popover.onClose();
    router.push(paths.dashboard.comercial.leadDetails(row._id));
  };

  const handleWhatsApp = () => {
    popover.onClose();
    const mensagem = encodeURIComponent(
      `Olá ${row.nome}, vi que você se interessou pela Attualize. Como posso ajudar?`
    );
    const telefone = row.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
    }
  };

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={handleOpenDetails}>
        <TableCell>
          <Stack spacing={0.5} alignItems="flex-start">
            <Typography variant="subtitle2">{row.nome}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.email}
            </Typography>
            {row.nextFollowUpAt && (
              <Label
                variant="soft"
                color={FOLLOWUP_STATUS_COLOR[getFollowUpStatus(row.nextFollowUpAt)] || 'default'}
                startIcon={
                  <Iconify
                    icon={
                      getFollowUpStatus(row.nextFollowUpAt) === 'overdue'
                        ? 'solar:danger-triangle-bold'
                        : 'solar:calendar-bold'
                    }
                  />
                }
              >
                {fDate(parseLeadDate(row.nextFollowUpAt))}
              </Label>
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <Chip
            label={row.segment || '-'}
            size="small"
            variant="soft"
            sx={{ textTransform: 'capitalize' }}
          />
        </TableCell>

        <TableCell>
          {row.origem ? (
            <Tooltip title={row.origem} arrow placement="top">
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: 250,
                }}
              >
                {row.origem}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              -
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(row.statusLead || 'novo')}>
            {getStatusLabel(row.statusLead || 'novo')}
          </Label>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Iconify icon="solar:user-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {row.owner || '-'}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleOpenDetails}>
            <Iconify icon="solar:eye-bold-duotone" />
            Ver Detalhes
          </MenuItem>

          <MenuItem onClick={handleWhatsApp}>
            <Iconify icon="logos:whatsapp-icon" />
            WhatsApp
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              window.location.href = `mailto:${row.email}`;
            }}
          >
            <Iconify icon="solar:letter-bold-duotone" />
            Enviar Email
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
