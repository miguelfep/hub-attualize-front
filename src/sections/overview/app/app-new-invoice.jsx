import React, { useState } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { LeadDetailsModal } from 'src/sections/lead/lead-details-modal';

// ----------------------------------------------------------------------

export function AppNewInvoice({ title, subheader, tableData, headLabel, onUpdate, ...other }) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom headLabel={headLabel} />

          <TableBody>
            {paginatedData.map((row) => (
              <RowItem key={row._id} row={row} onUpdate={onUpdate} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={[100]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

     
    </Card>
  );
}

// ----------------------------------------------------------------------

function RowItem({ row, onUpdate }) {
  const popover = usePopover();

  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);

  const handleOpenDetails = () => {
    popover.onClose();
    setOpenDetailsModal(true);
  };

  const handleSendWhats = () => {
    popover.onClose();
    const mensagem = encodeURIComponent(`Olá ${row.nome}, estamos entrando em contato sobre sua solicitação de abertura de CNPJ.`);
    const telefone = row.telefone?.replace(/\D/g, '');
    if (telefone) {
      window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
    }
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row.id);
  };

  return (
    <>
      <TableRow>
        <TableCell>{row.nome}</TableCell>
        <TableCell>{fDate(row.createdAt, 'DD/MM/YYYY')}</TableCell>
        <TableCell>{row.segment}</TableCell>
        <TableCell>{row.origem}</TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (row.receberOrcamento === 'telefone' && 'warning') ||
              (row.receberOrcamento === 'outros' && 'error') ||
              'success'
            }
          >
            {row.receberOrcamento || "Não definido" }
          </Label>
        </TableCell>
        <TableCell align="right" sx={{ pr: 1 }}>
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
            <Iconify icon="eva:eye-fill" />
            Ver Detalhes
          </MenuItem>
          <MenuItem onClick={handleSendWhats}>
            <Iconify icon="logos:whatsapp-icon" />
            WhatsApp
          </MenuItem>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>

      {/* Modal de Detalhes Completo */}
      <LeadDetailsModal
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        leadData={row}
        onUpdate={onUpdate}
      />
    </>
  );
}
