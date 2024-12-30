import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import * as XLSX from 'xlsx';

import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function ReceberTableToolbar({ filters, setFilters, onResetPage, contas, contasSelecionadas }) {
  const popover = usePopover();

  const handleFilterTituloOrRazaoSocial = useCallback(
    (event) => {
      onResetPage();
      setFilters((prevFilters) => ({
        ...prevFilters,
        descricao: event.target.value,
      }));
    },
    [setFilters, onResetPage]
  );

  const exportarExcel = (dados) => {
    if (!dados || dados.length === 0) {
      alert('Nenhuma conta disponível para exportar.');
      return;
    }

    // Cria os dados da planilha sem formatar o valor como texto
    const dadosPlanilha = dados.map((conta) => ({
      Nome: conta.nome,
      Descrição: conta.descricao,
      Valor: conta.valor, // Insere o valor como número
      Data: conta.dataVencimento,
      Status: conta.status,
    }));

    // Cria a planilha e o workbook
    const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);

    // Aplica o formato de moeda às células da coluna "Valor"
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 2 }); // Coluna "Valor" (índice 2)
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = 'R$ #,##0.00'; // Formato de moeda brasileira
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contas a Pagar');

    // Gera o arquivo Excel
    XLSX.writeFile(workbook, 'Contas_a_Pagar.xlsx');
  };

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
            value={filters.descricao}
            onChange={handleFilterTituloOrRazaoSocial}
            placeholder="Buscar cobrança..."
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
              popover.onClose();
              // Exportar todas as contas exibidas
              exportarExcel(contas);
            }}
          >
            <Iconify icon="solar:export-bold" />
            Exportar Todas
          </MenuItem>

          <MenuItem
            onClick={() => {
              popover.onClose();
              // Exportar somente as contas selecionadas
              exportarExcel(contasSelecionadas);
            }}
          >
            <Iconify icon="solar:export-line-duotone" />
            Exportar Selecionadas
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
