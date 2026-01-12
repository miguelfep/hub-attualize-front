'use client';

import { useState } from 'react';

import {
  Box,
  TableRow,
  TableHead,
  Checkbox,
  TableCell,
  IconButton,
  Typography,
  Stack,
  Chip,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { AulaTableRowMenu } from './aula-table-row-menu';

// ----------------------------------------------------------------------

export function AulaTableRow({ headLabel, row, selected, onSelectRow, onEditRow, onDeleteRow, rowCount, numSelected }) {
  const [openMenu, setOpenMenu] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  if (headLabel) {
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event) => {
                if (event.target.checked) {
                  onSelectRow?.('selectAll');
                } else {
                  onSelectRow?.('deselectAll');
                }
              }}
              inputProps={{
                'aria-label': 'select all rows',
              }}
            />
          </TableCell>
          {headLabel.map((headCell) => (
            <TableCell key={headCell.id} width={headCell.width}>
              {headCell.label}
            </TableCell>
          ))}
          <TableCell width={88} />
        </TableRow>
      </TableHead>
    );
  }

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" noWrap>
            {row.titulo}
          </Typography>
        </TableCell>

        <TableCell>
          <Chip label={row.tipo} size="small" variant="soft" />
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.obrigatoria ? 'warning' : 'default'}>
            {row.obrigatoria ? 'Sim' : 'Não'}
          </Label>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.ativo ? 'success' : 'default'}>
            {row.ativo ? 'Ativo' : 'Inativo'}
          </Label>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <AulaTableRowMenu
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        onEdit={onEditRow}
        onDelete={onDeleteRow}
      />
    </>
  );
}

