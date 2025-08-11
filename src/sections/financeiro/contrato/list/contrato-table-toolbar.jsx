import * as XLSX from 'xlsx';
import { useCallback } from 'react';
import { saveAs } from 'file-saver';

import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

export function ContratoTableToolbar({ filters, onResetPage, tableData }) {
  const popover = usePopover();

  const handleFilterTituloOrRazaoSocial = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ titulo: event.target.value }); // Altera o estado para buscar pelo título ou razão social
    },
    [filters, onResetPage]
  );

  const handleExportXLSX = useCallback(() => {
    try {
      // Define os campos e os dados para exportação
      const fields = [
        'titulo',
        'cliente.cnpj',
        'cliente.razaoSocial',
        'tipoContrato',
        'dataInicio',        
        'status',
        'metodoCobranca',
        'valorMensalidade',
      ];

      // Mapeia os dados para um formato legível no Excel
      const exportData = tableData.map((row) => {
        const mappedRow = {};
        fields.forEach((field) => {
          const keys = field.split('.');
          let value = row;
          keys.forEach((key) => {
            value = value ? value[key] : '';
          });
          mappedRow[field] = value;
        });
        return mappedRow;
      });

      // Cria uma planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

      // Converte a planilha para um arquivo binário
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Salva o arquivo como .xlsx
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'contratos.xlsx');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    }
  }, [tableData]);

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.state.titulo}
            onChange={handleFilterTituloOrRazaoSocial}
            placeholder="Buscar por título ou razão social..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={popover.onOpen}
            sx={{
              backgroundColor: 'background.default',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              handleExportXLSX();
            }}
            sx={{
              typography: 'body2',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Iconify icon="solar:export-bold" sx={{ mr: 1.5 }} />
            Exportar XLSX
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
