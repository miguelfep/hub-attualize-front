import { useState } from 'react';
import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
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
import { cancelarBoleto, gerarBoletoPorId, enviarBoletoDigisac } from 'src/actions/financeiro';

// ----------------------------------------------------------------------

export function ReceberTableRow({ row, selected, onSelectRow, fetchCobrancas }) {
  const popover = usePopover();
  const [confirm, setConfirm] = useState({ open: false, action: null });

  // Função para enviar o boleto via WhatsApp
  const handleSendWhatsApp = async () => {
    try {
      const { cliente } = row.contrato;
      const linkDownload = `https://attualize.com.br/fatura/${row._id}`;
      const mensagem = `Olá ${cliente.nome}, aqui está o link do seu boleto referente a: ${row.observacoes}.\n\nLink para acessar: ${linkDownload}`;

      const data = {
        whatsapp: cliente.whatsapp,
        mensagem,
        cabrancaId: row._id,
        atualizarData: true,
      };

      await enviarBoletoDigisac(data);
      toast.success('Boleto enviado via WhatsApp com sucesso!');
      await fetchCobrancas();
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast.error('Erro ao enviar WhatsApp');
    }
  };

  // Função para gerar boleto
  const handleGenerateBoleto = async () => {
    try {
      await gerarBoletoPorId(row._id);
      toast.success('Boleto gerado com sucesso!');
      fetchCobrancas(); // Atualiza as cobranças
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    }
  };

  // Função para cancelar boleto
  const handleCancelarBoleto = async () => {
    try {
      await cancelarBoleto(row._id);
      toast.success('Boleto cancelado com sucesso!');
      fetchCobrancas(); // Atualiza as cobranças
    } catch (error) {
      toast.error('Erro ao cancelar boleto');
    }
  };

  return (
    <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
      {/* Checkbox para seleção */}
      <TableCell padding="checkbox">
        <Checkbox id={row._id} checked={selected} onClick={onSelectRow} />
      </TableCell>

      {/* Coluna Cliente (Razão Social) e Observações */}
      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar alt={row.contrato.cliente.razaoSocial} src={row.contrato._avatar || ''} />
          <Stack sx={{ flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              href={`/dashboard/financeiro/contratos/${row.contrato._id}/edit`}
              color="inherit"
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              {row.contrato.cliente.razaoSocial}
            </Link>
            <Box component="span" sx={{ color: 'text.disabled', fontSize: '12px' }}>
              {row.observacoes || 'Sem observações'}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      {/* Coluna Valor da Cobrança */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fCurrency(row.valor)}</TableCell>

      {/* Coluna Data de Vencimento */}
      <TableCell>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {format(new Date(row.dataVencimento), 'dd/MM/yyyy')}
        </Box>
      </TableCell>

      {/* Coluna Status da Cobrança */}
      <TableCell>
        <Label
          variant="soft"
          color={
            row.status === 'RECEBIDO'
              ? 'success'
              : row.status === 'VENCIDO'
                ? 'error'
                : row.status === 'EMABERTO'
                  ? 'warning'
                  : 'default' // Cor padrão para outros status
          }
        >
          {row.status === 'RECEBIDO'
            ? 'Pago'
            : row.status === 'VENCIDO'
              ? 'Vencida'
              : row.status === 'EMABERTO'
                ? 'Pendente'
                : row.status}{' '}
          {/* Exibe o status como está para status desconhecidos */}
        </Label>
      </TableCell>

      {/* Coluna de verificação de boleto */}
      <TableCell>
        {row.boleto ? (
          <Tooltip title="Boleto Emitido">
            <Iconify icon="eva:checkmark-circle-2-fill" color="green" />
          </Tooltip>
        ) : (
          <Tooltip title="Boleto Não Emitido">
            <Iconify icon="eva:close-circle-fill" color="red" />
          </Tooltip>
        )}
      </TableCell>

      {/* Coluna Data do Último Lembrete */}
      <TableCell sx={{ textAlign: 'center' }}>
        {row.dataUltimoLembrete && (
          <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '12px' }}>
            {new Date(row.dataUltimoLembrete).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            às{' '}
            {new Date(row.dataUltimoLembrete).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Box>
        )}
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
              {/* Ação para gerar boleto, visível apenas se o status não for RECEBIDO */}
              {!row.boleto && row.status !== 'RECEBIDO' && (
                <MenuItem
                  onClick={() => {
                    handleGenerateBoleto();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:bank-plus" />
                  Gerar Boleto
                </MenuItem>
              )}

              {/* Ação para enviar via WhatsApp, disponível apenas se o boleto já foi emitido */}
              {row.boleto && (
                <MenuItem
                  onClick={() => {
                    handleSendWhatsApp();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:whatsapp" />
                  Enviar WhatsApp
                </MenuItem>
              )}

              {/* Ação para cancelar boleto, disponível apenas se o boleto já foi emitido */}
              {row.boleto && (
                <MenuItem
                  onClick={() => {
                    handleCancelarBoleto();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:cancel" />
                  Cancelar Boleto
                </MenuItem>
              )}
            </MenuList>
          </CustomPopover>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
