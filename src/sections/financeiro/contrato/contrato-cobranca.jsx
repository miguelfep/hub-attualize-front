import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Stack,
  Table,
  Paper,
  Button,
  Dialog,
  TableRow,
  MenuItem,
  MenuList,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  Tooltip,
  CircularProgress,
} from '@mui/material';

import {
  cancelarBoleto,
  gerarBoletoPorId,
  enviarBoletoDigisac,
  buscarCobrancasContratoId,
} from 'src/actions/financeiro';
import { cancelarNFSeInvoice, gerarNotaCobrancaContratos } from 'src/actions/notafiscal';

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
  const [loadingBoleto, setLoadingBoleto] = useState(false);
  const [loadingNotaFiscal, setLoadingNotaFiscal] = useState({}); // Estado para loading de cada nota fiscal
  const pollingIntervalsRef = useRef({}); // Referência para os intervalos de polling
  const [cancelNotaOpen, setCancelNotaOpen] = useState(false);
  const [notaToCancel, setNotaToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelingNota, setCancelingNota] = useState(false);

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
        `Link para acessar: ${linkDownload}`;

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
    if (loadingBoleto) return;
    setLoadingBoleto(true); // Inicia o estado de loading

    try {
      await gerarBoletoPorId(cobrancaId);
      toast.success('Boleto gerado com sucesso!');
      fetchCobrancas();
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    } finally {
      setLoadingBoleto(false); // Reseta o estado de loading após o fim da ação
    }
  };

  // Função para cancelar boleto
  const handleCancelarBoleto = async (cobrancaId) => {
    try {
      await cancelarBoleto(cobrancaId);
      toast.success('Boleto cancelado com sucesso!');
      fetchCobrancas();
    } catch (error) {
      toast.error('Erro ao cancelar boleto');
    }
  };

  const podeEmitirNotaManual = Boolean(contrato?.emitirNotaFiscal) && (contrato?.momentoEmissaoNota === 'manual');
  
  // Função para verificar se uma cobrança tem nota fiscal em processamento
  const isNotaFiscalProcessando = (cobranca) => {
    if (!cobranca?.notaFiscalId) return false;
    
    // Se notaFiscalId é um objeto, verificar o status
    if (typeof cobranca.notaFiscalId === 'object') {
      const status = cobranca.notaFiscalId?.status?.toLowerCase();
      return status === 'emitindo' || status === 'processando' || cobranca.notaFiscalId?.linkNota === 'Processando...';
    }
    
    // Se é string (ID), assumir que está processando se não tiver linkNota válido
    return !cobranca.notaFiscalId?.linkNota || cobranca.notaFiscalId?.linkNota === 'Processando...';
  };

  // Função para parar polling de uma cobrança
  const pararPollingNotaFiscal = useCallback((cobrancaId) => {
    if (pollingIntervalsRef.current[cobrancaId]) {
      clearInterval(pollingIntervalsRef.current[cobrancaId]);
      delete pollingIntervalsRef.current[cobrancaId];
    }
    setLoadingNotaFiscal((prev) => {
      const newState = { ...prev };
      delete newState[cobrancaId];
      return newState;
    });
  }, []);

  // Função para iniciar polling de uma cobrança específica
  const iniciarPollingNotaFiscal = useCallback((cobrancaId) => {
    // Limpar polling anterior se existir
    pararPollingNotaFiscal(cobrancaId);

    // Iniciar polling a cada 3 segundos
    pollingIntervalsRef.current[cobrancaId] = setInterval(async () => {
      try {
        // Verificar se a cobrança ainda está processando
        const response = await buscarCobrancasContratoId(contratoId);
        const cobrancaAtualizada = response.data?.find((c) => c._id === cobrancaId);
        
        if (cobrancaAtualizada) {
          // Atualizar lista de cobranças
          setCobrancas(response.data);
          
          // Verificar se ainda está processando
          if (!isNotaFiscalProcessando(cobrancaAtualizada)) {
            // Nota fiscal foi processada, parar polling
            pararPollingNotaFiscal(cobrancaId);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status da nota fiscal:', error);
      }
    }, 3000);
  }, [contratoId, pararPollingNotaFiscal]);

  // Limpar polling quando componente desmontar
  useEffect(
    () => () => {
      Object.values(pollingIntervalsRef.current).forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervalsRef.current = {};
    },
    []
  );

  // Verificar cobranças em processamento e iniciar polling
  useEffect(() => {
    const cobrancasProcessando = cobrancas.filter((c) => isNotaFiscalProcessando(c));
    const idsProcessando = new Set(cobrancasProcessando.map((c) => c._id));
    const idsComPolling = new Set(Object.keys(pollingIntervalsRef.current));

    // Iniciar polling para cobranças que estão processando mas não têm polling
    cobrancasProcessando.forEach((cobranca) => {
      if (!idsComPolling.has(cobranca._id)) {
        setLoadingNotaFiscal((prev) => ({ ...prev, [cobranca._id]: true }));
        iniciarPollingNotaFiscal(cobranca._id);
      }
    });

    // Parar polling para cobranças que não estão mais processando
    idsComPolling.forEach((cobrancaId) => {
      if (!idsProcessando.has(cobrancaId)) {
        pararPollingNotaFiscal(cobrancaId);
      }
    });
  }, [cobrancas, iniciarPollingNotaFiscal, pararPollingNotaFiscal]);

  const handleGerarNotaFiscal = async (cobranca) => {
    try {
      setLoadingNotaFiscal((prev) => ({ ...prev, [cobranca._id]: true }));
      
      const response = await gerarNotaCobrancaContratos({ cobrancaId: cobranca._id });
      
      if (response?.status === 200 || response?.data) {
        toast.success('Processando emissão da nota fiscal...');
        
        // Recarregar cobranças para pegar o notaFiscalId
        await fetchCobrancas();
        
        // Aguardar um pouco e recarregar novamente para garantir que o backend atualizou
        setTimeout(async () => {
          await fetchCobrancas();
          
          // Iniciar polling para verificar quando a nota for processada
          iniciarPollingNotaFiscal(cobranca._id);
        }, 1000);
      } else {
        toast.error('Erro ao gerar nota fiscal');
        setLoadingNotaFiscal((prev) => {
          const newState = { ...prev };
          delete newState[cobranca._id];
          return newState;
        });
      }
    } catch (error) {
      console.error('Erro ao gerar nota fiscal:', error);
      toast.error('Erro ao gerar nota fiscal');
      setLoadingNotaFiscal((prev) => {
        const newState = { ...prev };
        delete newState[cobranca._id];
        return newState;
      });
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

  // Função para obter o ID da nota fiscal de uma cobrança
  const getNotaFiscalId = (cobranca) => {
    if (!cobranca?.notaFiscalId) return null;
    if (typeof cobranca.notaFiscalId === 'string') return cobranca.notaFiscalId;
    return cobranca.notaFiscalId._id || cobranca.notaFiscalId.id || null;
  };

  // Função para verificar se a nota fiscal pode ser cancelada
  const podeCancelarNotaFiscal = (cobranca) => {
    if (!cobranca?.notaFiscalId) return false;
    const status = typeof cobranca.notaFiscalId === 'object' 
      ? cobranca.notaFiscalId?.status?.toLowerCase() 
      : null;
    return status === 'emitida' || status === 'autorizada';
  };

  // Função para cancelar nota fiscal
  const handleCancelarNotaFiscal = async () => {
    if (!notaToCancel || !cancelReason) {
      toast.error('Informe o motivo do cancelamento');
      return;
    }

    try {
      setCancelingNota(true);
      const notaFiscalId = getNotaFiscalId(notaToCancel);
      if (!notaFiscalId) {
        toast.error('ID da nota fiscal não encontrado');
        return;
      }

      // Usar a mesma função do portal que faz POST para /cancelar
      const res = await cancelarNFSeInvoice({ 
        nfseId: notaFiscalId, 
        motivo: cancelReason 
      });
      
      if (res?.status === 200) {
        toast.success('Nota fiscal cancelada com sucesso');
        setCancelNotaOpen(false);
        setCancelReason('');
        setNotaToCancel(null);
        
        // Recarregar cobranças para atualizar o status
        await fetchCobrancas();
      } else {
        toast.error('Falha ao cancelar nota fiscal');
      }
    } catch (error) {
      console.error('Erro ao cancelar nota fiscal:', error);
      toast.error('Erro ao cancelar nota fiscal');
    } finally {
      setCancelingNota(false);
    }
  };

  if (loading) {
    return <p>Carregando cobranças...</p>;
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
              <TableCell>Emitido</TableCell>
              <TableCell>Nota Fiscal</TableCell>
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
                <TableCell align="center">
                  {/* Status da Nota Fiscal */}
                  {cobranca?.notaFiscalId ? (
                    isNotaFiscalProcessando(cobranca) || loadingNotaFiscal[cobranca._id] ? (
                      <Tooltip title="Nota fiscal em processamento...">
                        <CircularProgress size={20} />
                      </Tooltip>
                    ) : (
                      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                        <Tooltip title="Baixar nota fiscal">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                              const linkNota = cobranca.notaFiscalId?.linkNota || cobranca.notaFiscalId?.link;
                              if (linkNota && linkNota !== 'Processando...') {
                                window.open(linkNota, '_blank', 'noopener,noreferrer');
                              } else {
                                toast.error('Link da nota fiscal não disponível');
                              }
                            }}
                          >
                            <Iconify icon="solar:download-bold-duotone" />
                          </IconButton>
                        </Tooltip>
                        {podeCancelarNotaFiscal(cobranca) && (
                          <Tooltip title="Cancelar nota fiscal">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setNotaToCancel(cobranca);
                                setCancelNotaOpen(true);
                                handleClosePopover();
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    )
                  ) : null}
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
                          disabled={loadingBoleto}
                        >
                          <Iconify icon="mdi:bank-plus" />
                          {loadingBoleto ? 'Gerando...' : 'Gerar Boleto'}{' '}
                          {/* Exibe mensagem de carregamento */}
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
                      {podeEmitirNotaManual && (
                        <MenuItem
                          onClick={() => {
                            handleGerarNotaFiscal(cobranca);
                            handleClosePopover();
                          }}
                          disabled={loadingNotaFiscal[cobranca._id] || isNotaFiscalProcessando(cobranca)}
                        >
                          <Iconify icon="solar:bill-check-bold" />
                          {loadingNotaFiscal[cobranca._id] || isNotaFiscalProcessando(cobranca)
                            ? 'Processando Nota Fiscal...'
                            : 'Gerar Nota Fiscal'}
                        </MenuItem>
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

      {/* Dialog de Cancelamento de Nota Fiscal */}
      <Dialog open={cancelNotaOpen} onClose={() => setCancelNotaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar Nota Fiscal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Motivo do cancelamento"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              minRows={3}
              helperText="Descreva o motivo do cancelamento da nota fiscal"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCancelNotaOpen(false);
            setCancelReason('');
            setNotaToCancel(null);
          }}>
            Cancelar
          </Button>
          <LoadingButton
            color="error"
            variant="contained"
            loading={cancelingNota}
            disabled={!cancelReason.trim()}
            onClick={handleCancelarNotaFiscal}
          >
            Confirmar Cancelamento
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
