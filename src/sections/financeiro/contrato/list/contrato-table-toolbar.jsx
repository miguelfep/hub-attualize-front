import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { saveAs } from 'file-saver';
import { Parser } from 'json2csv';

export function ContratoTableToolbar({ filters, onResetPage, tableData }) {
  const popover = usePopover();


  const handleFilterTituloOrRazaoSocial = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ titulo: event.target.value }); // Altera o estado para buscar pelo título ou razão social
    },
    [filters, onResetPage]
  );

  const handleExportCSV = useCallback(() => {
    try {
      const fields = ['titulo', 'cliente.cnpj', 'cliente.razaoSocial', 'tipoContrato', 'status', 'metodoCobranca', 'valorMensalidade'];
      const parser = new Parser({ fields });
      const csv = parser.parse(tableData);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'contratos.csv');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
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
              handleExportCSV();
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
            Exportar CSV
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
