'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import {
  Box,
  Card,
  Table,
  Avatar,
  Divider,
  MenuList,
  MenuItem,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CardHeader,
  ListItemText,
  TablePagination,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { deleteLicenca } from 'src/actions/societario';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import LicenseModal from './LicenseModal';

export function BookingDetails({
  fetchLicencas,
  title,
  subheader,
  headLabel,
  tableData,
  ...other
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedLicense, setSelectedLicense] = useState(null);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (licenca) => {
    setSelectedLicense(licenca);
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      <Scrollbar sx={{ minHeight: 462 }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHeadCustom headLabel={headLabel} />
          <TableBody>
            {paginatedData.map((row) => (
              <RowItem
                key={row.id}
                row={row}
                fetchLicencas={fetchLicencas}
                onOpenModal={handleOpenModal}
              />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <TablePagination
        component="div"
        count={tableData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Linhas por página:"
      />
      {selectedLicense && (
        <LicenseModal
          licenca={selectedLicense}
          fetchLicencas={fetchLicencas}
          onClose={() => setSelectedLicense(null)}
        />
      )}
    </Card>
  );
}

function RowItem({ row, fetchLicencas, onOpenModal }) {
  console.log('row ', row);

  const popover = usePopover();
  const statusMap = {
    em_processo: { label: 'Em Processo', color: 'secondary' },
    valida: { label: 'Válida', color: 'success' },
    vencida: { label: 'Vencida', color: 'error' },
    dispensada: { label: 'Dispensada', color: 'info' },
    a_expirar: { label: 'A Expirar', color: 'warning' },
  };

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            variant="rounded"
            alt={row.cliente.razaoSocial || ' '}
            src={row.razaoSocial}
            sx={{ width: 48, height: 48 }}
          />
          <ListItemText primary={row.cliente.razaoSocial} secondary={row.cliente.cnpj} />
        </Box>
      </TableCell>
      <TableCell>{row.nome}</TableCell>
      <TableCell>{fDate(row.dataInicio)}</TableCell>
      <TableCell>{fDate(row.dataVencimento)}</TableCell>
      <TableCell>
        <Label variant="soft" color={statusMap[row.status]?.color || 'default'}>
          {statusMap[row.status]?.label || 'Desconhecido'}
        </Label>
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem onClick={() => onOpenModal(row)}>
            <Iconify icon="eva:edit-2-fill" /> Ver Licença
          </MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <MenuItem
            onClick={async () => {
              await deleteLicenca(row.id);
              fetchLicencas();
              toast.success('Licença deletada');
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" /> Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </TableRow>
  );
}
