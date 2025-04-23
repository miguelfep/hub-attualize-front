
import * as XLSX from 'xlsx';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function AlteracaoTableToolbar({ filters, onResetPage, tableData }) {
  const popover = usePopover();


  const handleFilterSearch = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ nome: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleExport = useCallback(() => {
    if (!tableData || tableData.length === 0) {
      return;
    }

    // Prepara os dados para exportação
    const exportData = tableData.map((row) => ({
      Código: row.codigo,
      Nome: row.nome,
      'Razão Social': row.razaoSocial,
      Status: row.status ? 'Ativo' : 'Inativo',
    }));

    // Cria a planilha XLSX
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    // Baixa o arquivo
    XLSX.writeFile(workbook, 'clientes.xlsx');
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
            value={filters.state.search}
            onChange={handleFilterSearch}
            placeholder="Buscar..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={popover.onOpen}>
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
              handleExport();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:export-bold" />
            Exportar
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
