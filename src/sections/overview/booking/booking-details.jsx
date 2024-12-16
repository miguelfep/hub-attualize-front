'use client';

import { toast } from 'sonner';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';

import { fDate } from 'src/utils/format-time';

import { deleteLicenca, downloadLicenca, updateLicencaWithFile, deletarArquivoLicenca } from 'src/actions/societario';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export function BookingDetails({ fetchLicencas, title, subheader, headLabel, tableData, ...other }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
              <RowItem key={row.id} row={row} fetchLicencas={fetchLicencas} />
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
    </Card>
  );
}

function RowItem({ row, fetchLicencas }) {
  const theme = useTheme();
  const popover = usePopover();
  const lightMode = theme.palette.mode === 'light';
  const [isModalOpen, setModalOpen] = useState(false);
  const [editedLicense, setEditedLicense] = useState({ ...row });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(row.arquivo ? row.arquivo.split('/').pop() : ''); // Nome do arquivo inicial

  const formatStatus = (status) => {
    const statusMap = {
      em_processo: { label: 'Em Processo', color: 'secondary' },
      valida: { label: 'Válida', color: 'success' },
      vencida: { label: 'Vencida', color: 'error' },
      dispensada: { label: 'Dispensada', color: 'info' },
      a_expirar: { label: 'A Expirar', color: 'warning' },
    };
    return statusMap[status] || { label: 'Desconhecido', color: 'default' };
  };

  const statusInfo = formatStatus(row.status);

  const handleOpenModal = () => {
    setEditedLicense({
      ...row,
      dataInicio: row.dataInicio ? row.dataInicio.slice(0, 10) : '',
      dataVencimento: row.dataVencimento ? row.dataVencimento.slice(0, 10) : '',
    });
    setModalOpen(true);
    popover.onClose();
  };

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : ''); // Armazena o nome do arquivo
  };

  const handleSaveChanges = async () => {
    try {
      const dataToSend = {
        ...editedLicense,
        clienteId: editedLicense.cliente._id
      }
      if (file) {       
        await updateLicencaWithFile(editedLicense._id, file, dataToSend);
      } else {
        await updateLicencaWithFile(editedLicense._id, null, dataToSend);
      }
      await fetchLicencas(); 

      toast.success('Atualizado com sucesso')
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar licença')
      console.error('Erro ao atualizar a licença:', error);
    }
  };

  const handleDeleteLicenca = async () => {
     try{
      await deleteLicenca(editedLicense._id);
      await fetchLicencas();
      toast.success('Licença deletada')
     } catch (error){
       toast.error('Erro ao deletar licença')
     }
  }

  const handleDeleteFile = async () => {
    try {
      await deletarArquivoLicenca(editedLicense._id);
      setFile(null);
      setFileName('');
      await fetchLicencas();
      toast.success('Arquivo deletado');
    } catch (error) {
      toast.error('Erro ao deletar arquivo');
    }
  };

  const handleOpenLink = () => {
    if (editedLicense.urldeacesso) {
      window.open(editedLicense.urldeacesso, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(editedLicense.urldeacesso).then(() => {
      toast.success('URL copiada para a área de transferência');
    });
  };


  const handleDownloadLicenca = async () => {
    try {
      const response =  await downloadLicenca(editedLicense._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
     
      const contentDisposition = response.headers['content-disposition'];      
      
      const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '').trim()
      : 'licenca_download.pdf';
            
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Define o nome do arquivo extraído
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
      
      toast.error('Erro ao baixar o arquivo');
    }
  };


  return (
    <>
      <TableRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              variant="rounded"
              alt={row.cliente.razaoSocial}
              src={row.razaoSocial}
              sx={{ width: 48, height: 48 }}
            />
            <ListItemText
              primary={row.cliente.razaoSocial}
              secondary={row.cliente.cnpj}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={row.nome}
            secondary={row.estado}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(row.dataInicio)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(row.dataVencimento)}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
          />
        </TableCell>

        <TableCell>
          <Label
            variant={lightMode ? 'soft' : 'filled'}
            color={statusInfo.color} // Define a cor com base no status
          >
            {statusInfo.label} {/* Exibe o texto formatado */}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ pr: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}s
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleOpenModal}>
            <Iconify icon="eva:edit-2-fill" />
            Ver Licenças
          </MenuItem>

          {row.arquivo && (
            <MenuItem onClick={handleDownloadLicenca}>
              <Iconify icon="eva:cloud-download-fill" />
              Download
            </MenuItem>
          )}
          <Divider sx={{ borderStyle: 'dashed' }} />
          <MenuItem onClick={handleDeleteLicenca}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Deletar
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
      <Box
          p={3}
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            overflowY: 'auto',
            maxHeight: '90vh',
            width: 800,
          }}
        >
          <Typography variant="h6" mb={2}>
            Editar Licença
          </Typography>

          <TextField
            label="Nome da Licença"
            fullWidth
            margin="normal"
            value={editedLicense.nome}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Data de Início"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={editedLicense.dataInicio}
            onChange={(e) => setEditedLicense({ ...editedLicense, dataInicio: e.target.value })}
          />

          <TextField
            label="Data de Vencimento"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={editedLicense.dataVencimento}
            onChange={(e) => setEditedLicense({ ...editedLicense, dataVencimento: e.target.value })}
          />
           <TextField
            label="URL de Acesso"
            fullWidth
            margin="normal"
            value={editedLicense.urldeacesso || ''}
            onChange={(e) => setEditedLicense({ ...editedLicense, urldeacesso: e.target.value })}
            helperText="Adicione ou altere o link de acesso"
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Button
              variant="outlined"
              onClick={handleOpenLink}
              disabled={!editedLicense.urldeacesso}
            >
              Abrir Link
            </Button>
            <Button
              variant="outlined"
              onClick={handleCopyLink}
              disabled={!editedLicense.urldeacesso}
            >
              Copiar Link
            </Button>
          </Box>

          <TextField
            label="Observação"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={editedLicense.observacao || ''}
            onChange={(e) => setEditedLicense({ ...editedLicense, observacao: e.target.value })}
          />


          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editedLicense.status}
              onChange={(e) => setEditedLicense({ ...editedLicense, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="em_processo">Em processo</MenuItem>
              <MenuItem value="valida">Válida</MenuItem>
              <MenuItem value="vencida">Vencida</MenuItem>
              <MenuItem value="dispensada">Dispensada</MenuItem>
              <MenuItem value="a_expirar">A Expirar</MenuItem>
            </Select>
          </FormControl>

          {fileName ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={handleDownloadLicenca}>
                Download
              </Button>
              <Button variant="outlined" color="error" onClick={handleDeleteFile}>
                Deletar
              </Button>
            </Box>
          ) : (
            <Button variant="contained" component="label" fullWidth sx={{ mt: 2, mb: 1 }}>
              Upload Arquivo
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          )}


          {fileName && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              Arquivo carregado: {fileName}
            </Typography>
          )}

          <Button variant="contained" color="primary" onClick={handleSaveChanges} fullWidth>
            Salvar Alterações
          </Button>
        </Box>
      </Modal>
    </>
  );
}
