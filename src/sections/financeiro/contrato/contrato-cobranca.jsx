import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import {
  cancelarBoleto,
  gerarBoletoPorId,
  enviarBoletoDigisac,
  buscarCobrancasContratoId,
} from 'src/actions/financeiro';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import NovaCobrancaForm from './contrato-nova-cobranca-form';

export function ContratoCobrancas({ contratoId, contrato }) {
  const [cobrancas, setCobrancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [cobrancaAtual, setCobrancaAtual] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null });
  const [popoverAnchor, setPopoverAnchor] = useState(null); // Controla o popover individualmente
  const [popoverIndex, setPopoverIndex] = useState(null); // Guarda o índice da cobrança aberta

  const cobrancaStatusTexts = {
    EMABERTO: 'Aguardando pagamento',
    VENCIDO: 'Vencida',
    CANCELADO: 'Cancelado',
    RECEBIDO: 'Pago',
  };

  const cobrancaStatusColors = {
    EMABERTO: 'warning',
    VENCIDO: 'error',
    CANCELADO: 'info',
    RECEBIDO: 'success',
  };

  const fetchCobrancas = useCallback(async () => {
    try {
      const response = await buscarCobrancasContratoId(contratoId);
      setCobrancas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar cobranças:', error);
      toast.error('Erro ao buscar cobranças');
      setLoading(false);
    }
  }, [contratoId]);
  
  useEffect(() => {
    if (contratoId) {
      fetchCobrancas();
    }
  }, [contratoId, fetchCobrancas]);

  const handleOpenModal = (cobranca = null) => {
    setCobrancaAtual(cobranca);
    setOpenModal(true);
  };

  // Função para enviar o boleto via WhatsApp
  const handleSendWhatsApp = async (cobranca) => {
    try {
      const { cliente } = contrato;
      const linkDownload = `https://attualize.com.br/fatura/${cobranca._id}`; // Gera o link de acordo com o ID da cobrança
      const mensagem =
        `Olá ${cliente.nome}, aqui está o link do seu boleto referente a: ${cobranca.observacoes}.\n\n` +
        `Link para download: ${linkDownload}`;

      const data = {
        whatsapp: cliente.whatsapp,
        mensagem,
        cabrancaId: cobranca._id,
        atualizarData: true,
      };

      await enviarBoletoDigisac(data);
      toast.success('Boleto enviado via WhatsApp com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast.error('Erro ao enviar WhatsApp');
    }
  };

  // Função para gerar boleto
  const handleGenerateBoleto = async (cobrancaId) => {
    try {
      await gerarBoletoPorId(cobrancaId);
      toast.success('Boleto gerado com sucesso!');
      fetchCobrancas();
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    }
  };

  // Função para cancelar boleto
  const handleCancelarBoleto = async (cobrancaId) => {
    try {
      console.log('vai cancelar');
      await cancelarBoleto(cobrancaId);
      toast.success('Boleto cancelado com sucesso!');
      fetchCobrancas();
    } catch (error) {
      toast.error('Erro ao cancelar boleto');
    }
  };

  // Função para abrir o popover de um item específico
  const handleOpenPopover = (event, index) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverIndex(index); // Define o índice da cobrança correspondente
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null); // Fecha o popover
    setPopoverIndex(null); // Reseta o índice
  };

  if (loading) {
    return <p>Carregando cobranças...</p>;
  }

  if (!cobrancas.length) {
    return <p>Nenhuma cobrança encontrada para este contrato.</p>;
  }

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
        Nova Cobrança
      </Button>

      {/* Modal de criação/edição de cobrança */}
      <NovaCobrancaForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        contrato={contrato}
        fetchCobrancas={fetchCobrancas}
        cobrancaAtual={cobrancaAtual}
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="cobranças do contrato">
          <TableHead>
            <TableRow>
              <TableCell>Data de Vencimento</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Emitido</TableCell> {/* Nova coluna "Emitido" */}
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cobrancas.map((cobranca, index) => (
              <TableRow key={cobranca._id}>
                <TableCell>{new Date(cobranca.dataVencimento).toLocaleDateString()}</TableCell>
                <TableCell>R$ {cobranca.valor.toFixed(2)}</TableCell>
                <TableCell>
                  <Label
                    variant="soft"
                    color={cobrancaStatusColors[cobranca.status] || 'default'}
                    sx={{ mb: 3 }}
                  >
                    {cobrancaStatusTexts[cobranca.status] || cobranca.status}
                  </Label>
                </TableCell>
                <TableCell align="center">
                  {/* Verifica se o boleto foi emitido e exibe o ícone */}
                  {cobranca.boleto && <Iconify color="green" icon="eva:checkmark-fill" />}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color={popoverIndex === index ? 'inherit' : 'default'}
                    onClick={(event) => handleOpenPopover(event, index)}
                  >
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>

                  {/* CustomPopover específico para cada cobrança */}
                  <CustomPopover
                    open={popoverIndex === index}
                    anchorEl={popoverAnchor}
                    onClose={handleClosePopover}
                  >
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          handleOpenModal(cobranca);
                          handleClosePopover();
                        }}
                      >
                        <Iconify icon="solar:eye-bold" />
                        Ver Detalhes
                      </MenuItem>

                      {/* MenuItem para ver a fatura na frente */}
                      <MenuItem
                        onClick={() => {
                          window.open(`https://attualize.com.br/fatura/${cobranca._id}`, '_blank');
                          handleClosePopover();
                        }}
                      >
                        <Iconify icon="mdi:open-in-new" />
                        Ver Fatura
                      </MenuItem>

                      {!cobranca.boleto ? (
                        <MenuItem
                          onClick={() => {
                            handleGenerateBoleto(cobranca._id);
                            handleClosePopover();
                          }}
                        >
                          <Iconify icon="mdi:bank-plus" />
                          Gerar Boleto
                        </MenuItem>
                      ) : (
                        <>
                          <MenuItem
                            onClick={() => {
                              handleSendWhatsApp(cobranca);
                              handleClosePopover();
                            }}
                          >
                            <Iconify icon="mdi:whatsapp" />
                            Enviar WhatsApp
                          </MenuItem>

                          <MenuItem
                            onClick={() => {
                              handleCancelarBoleto(cobranca._id);
                              handleClosePopover();
                            }}
                          >
                            <Iconify icon="mdi:cancel" />
                            Cancelar Boleto
                          </MenuItem>
                        </>
                      )}
                    </MenuList>
                  </CustomPopover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, action: null })}
        title="Confirmar Ação"
        content="Tem certeza que deseja realizar essa ação?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.action();
              setConfirm({ open: false, action: null });
            }}
          >
            Confirmar
          </Button>
        }
      />
    </>
  );
}
