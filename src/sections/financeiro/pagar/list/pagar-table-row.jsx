import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { deletarContaPagarPorId, buscarParcelasSeguintes } from 'src/actions/contas';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { PagarModalDetails } from '../view/pagar-modal-details';

// ----------------------------------------------------------------------

export function ContaPagarTableRow({ row, selected, onSelectRow, fetchContas }) {
  const popover = usePopover();
  const deleteConfirm = useBoolean();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [parcelasSeguintes, setParcelasSeguintes] = useState(null);

  const isRecorrente = row.tipo === 'RECORRENTE';

  useEffect(() => {
    if (!deleteConfirm.value || !isRecorrente || !row._id) return;
    setParcelasSeguintes(null);
    buscarParcelasSeguintes(row._id)
      .then(setParcelasSeguintes)
      .catch(() => setParcelasSeguintes({ count: 0, parcelas: [] }));
  }, [deleteConfirm.value, isRecorrente, row._id]);

  const handleDeleteConta = async (id, options = {}) => {
    try {
      await deletarContaPagarPorId(id, options);
      toast.success('Conta removida com sucesso!');
      deleteConfirm.onFalse();
      setParcelasSeguintes(null);
      await fetchContas();
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      toast.error('Erro ao remover conta');
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
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatToCurrency(row.valor)}</TableCell>

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
            row.status === 'PAGO' ? 'success' : row.status === 'PENDENTE' ? 'warning' : row.status === 'AGENDADO' ? 'info' : 'default' // Cor padrão para outros status
          }
        >
          {row.status === 'PAGO' ? 'Pago' :
            row.status === 'PENDENTE' ? 'Pendente' :
              row.status === 'AGENDADO' ? 'Agendado' :
                row.status === 'CANCELADO' ? 'Cancelado' :
                  row.status}{' '}
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
          label={row.categoria.nome || 'Categoria Desconhecida'}
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
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  setDetailsOpen(true);
                }}
              >
                <Iconify icon="solar:eye-bold" />
                Ver Detalhes
              </MenuItem>
              <MenuItem
                onClick={() => {
                  popover.onClose();
                  deleteConfirm.onTrue();
                }}
              >
                <Iconify icon="mdi:delete" />
                Remover Conta
              </MenuItem>
            </MenuList>
          </CustomPopover>
        </Stack>
      </TableCell>

      <ConfirmDialog
        open={deleteConfirm.value}
        onClose={() => {
          deleteConfirm.onFalse();
          setParcelasSeguintes(null);
        }}
        title="Remover conta"
        content={
          isRecorrente ? (
            <Stack spacing={1}>
              <Typography variant="body2">
                Escolha se deseja remover só esta parcela ou esta e as parcelas seguintes (não vencidas).
              </Typography>
              {parcelasSeguintes === null ? (
                <Typography variant="body2" color="text.secondary">
                  Carregando parcelas seguintes…
                </Typography>
              ) : parcelasSeguintes.count > 0 ? (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
                    Ao clicar em &quot;Esta e as seguintes&quot;, serão excluídas {parcelasSeguintes.count + 1} parcela(s):
                  </Typography>
                  <Stack component="ul" sx={{ m: 0, pl: 2.5, listStyle: 'disc' }}>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
                      Esta — venc. {format(new Date(row.dataVencimento), 'dd/MM/yyyy')}
                    </Typography>
                    {parcelasSeguintes.parcelas.map((p) => (
                      <Typography
                        component="li"
                        key={p.dataVencimento}
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.25 }}
                      >
                        Parc. {p.parcelas} — venc. {format(new Date(p.dataVencimento), 'dd/MM/yyyy')}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Não há parcelas futuras; será excluída apenas esta.
                </Typography>
              )}
            </Stack>
          ) : (
            'Esta conta será excluída. Deseja continuar?'
          )
        }
        action={
          isRecorrente ? (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteConta(row._id, { apenasEsta: true })}
              >
                Só esta parcela
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteConta(row._id)}
              >
                Esta e as seguintes
              </Button>
            </>
          ) : (
            <Button variant="contained" color="error" onClick={() => handleDeleteConta(row._id)}>
              Excluir
            </Button>
          )
        }
      />

      {/* Modal de Detalhes */}
      <PagarModalDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        conta={row}
      />
    </TableRow>
  );
}
