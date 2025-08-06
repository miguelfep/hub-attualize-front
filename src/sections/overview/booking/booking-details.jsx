'use client';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';

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
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { TableHeadCustom, getComparator as getLicenceStatusComparator } from 'src/components/table';

import LicenseModal from './LicenseModal';

  const getLicencaComparator = (order, orderBy) => {
    if (orderBy === 'status') {
      return (a, b) => {
      const statusOrder = { vencida: 1, a_expirar: 2, em_processo: 3, valida: 4, dispensada: 5 };
      const valueA = statusOrder[a.status] || 99;
      const valueB = statusOrder[b.status] || 99;

      if (order === 'desc') {
        return valueB < valueA ? -1 : (valueB > valueA ? 1 : 0);
      }
        return valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
      }
    }
    if (orderBy === 'cliente') {
      return (a, b) => {
        const valueA = a.cliente?.razaoSocial || '';
        const valueB = b.cliente?.razaoSocial || '';
        if (order === 'desc') {
          return valueB.localeCompare(valueA);
        }
        return valueA.localeCompare(valueB);
      };
    }
    return getLicenceStatusComparator(order, orderBy);
  }

const statusCycleOrder = ['vencida', 'a_expirar', 'em_processo', 'valida', 'dispensada'];


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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('dataVencimento');
  const [statusFilterIndex, setStatusFilterIndex] = useState(-1);


  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

const onSort = useCallback(
  (id) => {
    if (id === 'status') {
      const availableStatuses = statusCycleOrder.filter((status) =>
        tableData.some((item) => item.status === status)
      );

      if (availableStatuses.length === 0) {
        setStatusFilterIndex(-1);
        setOrderBy('dataVencimento');
        setOrder('asc');
        return;
      }
      // Pega o nome do status que está sendo filtrado no momento
      const currentFilteredStatus = statusCycleOrder[statusFilterIndex];
      // Acha a posição na lista de status disponíveis
      const currentIndexInAvailable = availableStatuses.indexOf(currentFilteredStatus);
      // Calcula o próximo índice
      const nextIndexInAvailable = currentIndexInAvailable + 1;

      if (nextIndexInAvailable >= availableStatuses.length) {
        setStatusFilterIndex(-1);
        setOrderBy('dataVencimento');
        setOrder('asc');
      } else {
        const nextStatusToFilter = availableStatuses[nextIndexInAvailable];
        const finalIndex = statusCycleOrder.indexOf(nextStatusToFilter);

        setStatusFilterIndex(finalIndex);
        setOrderBy(null);
      }
    }
    else {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
      setStatusFilterIndex(-1);
    }
  },
  [order, orderBy, statusFilterIndex, tableData]
);


  const handleOpenModal = (licenca) => {
    setSelectedLicense(licenca);
  };

  const sortedData = [...tableData].sort(getLicencaComparator(order, orderBy));

  const finalData =
    statusFilterIndex === -1
      ? sortedData
      : sortedData.filter((item) => item.status === statusCycleOrder[statusFilterIndex]);

  const paginatedData = finalData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      <Scrollbar sx={{ minHeight: 462 }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHeadCustom
            headLabel={headLabel}
            order={order}
            orderBy={orderBy}
            onSort={onSort}
          />
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
        count={finalData.length}
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
