import { useState } from 'react';
import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { Chip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify'; // Para formatação de datas
import { fCurrency } from 'src/utils/format-number'; // Formatação de moeda
import { toast } from 'sonner';

import { usePopover, CustomPopover } from 'src/components/custom-popover'; // Biblioteca de toast para feedback visual
import { deletarContaPagarPorId } from 'src/actions/contas';
import  {getCategoriaNome } from 'src/utils/constants/categorias';



// ----------------------------------------------------------------------

export function ContaPagarTableRow({ row, selected, onSelectRow, fetchContas }) {
  const popover = usePopover();
  const [confirm, setConfirm] = useState({ open: false, action: null });

  console.log(row);
  

  // Função para deletar ou outra ação que precise ser realizada na conta
  const handleDeleteConta = async (id) => {
    try {
      await deletarContaPagarPorId(id); // Tenta deletar a conta
      toast.success('Conta removida com sucesso!');
      await fetchContas(); // Atualiza as contas
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      toast.error('Erro ao remover conta'); // Somente exibe o toast de erro se falhar
    }
  };
  return (
    <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
      {/* Checkbox para seleção */}
      <TableCell padding="checkbox">
        <Checkbox id={row._id} checked={selected} onClick={onSelectRow} />
      </TableCell>

      {/* Coluna Fornecedor (ou descrição da conta) */}
      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar alt={row.descricao} src={row.banco._id || ''} />
          <Stack sx={{ flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              href={`/dashboard/financeiro/pagar/${row._id}/edit`}
              color="inherit"
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              {row.nome ? row.nome : row.descricao}
            </Link>
            <Box component="span" sx={{ color: 'text.disabled', fontSize: '12px' }}>
              {row.tipo || 'Sem observações'}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      {/* Coluna Valor da Conta */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(row.valor)}</TableCell>

      {/* Coluna Data de Vencimento */}
      <TableCell>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {format(new Date(row.dataVencimento), 'dd/MM/yyyy')}
        </Box>
      </TableCell>

      {/* Coluna Status da Conta */}
      <TableCell>
        <Label
          variant="soft"
          color={
            row.status === 'PAGO' ? 'success' : row.status === 'PENDENTE' ? 'warning' : 'default' // Cor padrão para outros status
          }
        >
          {row.status === 'PAGO' ? 'Pago' : row.status === 'PENDENTE' ? 'Pendente' : row.status}{' '}
          {/* Exibe o status como está para status desconhecidos */}
        </Label>
      </TableCell>

      {/* Coluna Banco */}
      <TableCell>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {row.banco.nome}
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={getCategoriaNome(row.categoria)}
          variant="outlined"
          color="primary" // Pode ajustar a cor conforme necessário, como 'secondary', 'default', etc.
          sx={{ color: 'text.secondary' }} // Estilos opcionais
        />
      </TableCell>

      {/* Ações adicionais */}
      <TableCell>
        <Stack direction="row" alignItems="center">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

          {/* Popover para ações adicionais */}
          <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
            <MenuList>
              {/* Ação para deletar conta */}
              <MenuItem
                onClick={async () => {
                  popover.onClose();
                  await handleDeleteConta(row._id); // Aguarda a operação antes de continuar
                }}
              >
                <Iconify icon="mdi:delete" />
                Remover Conta
              </MenuItem>
            </MenuList>
          </CustomPopover>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
