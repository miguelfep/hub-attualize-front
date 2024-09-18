import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function AppNewInvoice({ title, subheader, tableData, headLabel, ...other }) {
  console.log(tableData);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 680 }}>
          <TableHeadCustom headLabel={headLabel} />

          <TableBody>
            {tableData.map((row) => (
              <RowItem key={row._id} row={row} />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          Ver todos
        </Button>
      </Box>
    </Card>
  );
}

function RowItem({ row }) {
  const popover = usePopover();

  const [openViewModal, setOpenViewModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);

  const handleDownload = () => {
    popover.onClose();
    setOpenViewModal(true); // Abre o modal de visualização
  };

  const handleSendWhats = () => {
    popover.onClose();
    setOpenMessageModal(true); // Abre o modal de envio de mensagem
  };

  const handleDelete = () => {
    popover.onClose();
    console.info('DELETE', row.id);
  };

  return (
    <>
      <TableRow>
        <TableCell>{row.nome}</TableCell>

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
            {row.receberOrcamento}
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
          <MenuItem onClick={handleDownload}>
            <Iconify icon="eva:eye-fill" />
            Ver
          </MenuItem>

          <MenuItem onClick={handleSendWhats}>
            <Iconify icon="logos:whatsapp-icon" />
            Enviar Mensagem
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>

      {/* Modal para Visualizar Informações */}
      <Modal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {row.nome}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            telefone: {row.telefone}
            <br />
            Email: {row.email}
            <br />
            Segmento: {row.segment}
            <br />
            Origem: {row.origem}
            <br />
            Receber Orçamento: {row.receberOrcamento}
            <br />
            Cidade: {row.cidade} - {row.estado}
          </Typography>
          <br />
          <Typography>{row.observacoes}</Typography>
          <Button onClick={() => setOpenViewModal(false)} sx={{ mt: 2 }}>
            Fechar
          </Button>
        </Box>
      </Modal>

      {/* Modal para Enviar Mensagem */}
      <Modal
        open={openMessageModal}
        onClose={() => setOpenMessageModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enviar Mensagem
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            defaultValue={`Olá ${row.nome}, estamos entrando em contato...`}
            sx={{ mt: 2 }}
          />
          <Button onClick={() => setOpenMessageModal(false)} sx={{ mt: 2 }}>
            Enviar
          </Button>
        </Box>
      </Modal>
    </>
  );
}
