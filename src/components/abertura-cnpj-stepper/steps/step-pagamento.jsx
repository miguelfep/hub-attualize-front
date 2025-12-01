'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate';
// import { MercadoPagoStatusDialog, MercadoPagoCheckoutDialog } from 'src/components/mercado-pago'; // Removido temporariamente - será implementado depois

// ----------------------------------------------------------------------

export function StepPagamento({ formData, orcamento, onClose, temAberturaGratuita = false, leadId }) {
  const theme = useTheme();
  const [formaPagamento, setFormaPagamento] = useState(null); // 'cartao', 'boleto', 'pix'
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [statusScreenOpen, setStatusScreenOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Valor a pagar do orçamento
  const valorTotal = orcamento?.valor || 0;
  const planoNome = formData.planoSelecionado || orcamento?.plano || 'Plano Selecionado';

  const handleSelecionarFormaPagamento = (forma) => {
    setFormaPagamento(forma);
    
    if (forma === 'cartao') {
      // TODO: Implementar checkout - Mercado Pago removido temporariamente
      alert('Pagamento por cartão de crédito em desenvolvimento');
      // setCheckoutOpen(true); // Removido temporariamente
    } else if (forma === 'boleto') {
      // TODO: Implementar geração de boleto
      alert('Boleto em desenvolvimento');
    } else if (forma === 'pix') {
      // TODO: Implementar pagamento via Pix
      alert('Pix em desenvolvimento');
    }
  };

  const handlePagamentoSucesso = (paymentData) => {
    // Salvar dados do pagamento e abrir Status Screen
    console.log('Pagamento processado:', paymentData);
    setPaymentResult(paymentData);
    setStatusScreenOpen(true);
  };

  const handleStatusScreenClose = () => {
    setStatusScreenOpen(false);
    setPaymentResult(null);
    // Fechar o stepper após ver o status
    onClose?.();
  };

  const handleContatar = () => {
    // Usuário prefere ser contatado
    onClose?.();
  };

    return (
    <Container maxWidth="md">
      <Stack spacing={4} alignItems="center">
        {/* Header */}
        <m.div variants={varFade().inUp}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h3">Escolha a Forma de Pagamento</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              Finalize sua solicitação escolhendo como deseja pagar
          </Typography>
          </Stack>
        </m.div>

        {/* Resumo do Plano Selecionado */}
        <m.div variants={varFade().inUp} style={{ width: '100%' }}>
          <Card
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{planoNome}</Typography>
                {temAberturaGratuita && (
                  <Chip label="ABERTURA GRÁTIS" color="success" size="small" />
                )}
              </Stack>
              
              <Divider />
              
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="body2" color="text.secondary">
                  Valor Total:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  R$ {valorTotal.toFixed(2)}
                </Typography>
              </Stack>

              {orcamento?.detalhes && (
                <Stack spacing={0.5}>
                  {Object.entries(orcamento.detalhes).map(([key, value]) => {
                    if (key.startsWith('adicional') && value > 0) {
                      return (
                        <Stack key={key} direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.disabled">
                            {key === 'adicionalFuncionarios' && '+ Funcionários'}
                            {key === 'adicionalEnderecoFiscal' && '+ Endereço Fiscal'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            R$ {value.toFixed(2)}
          </Typography>
        </Stack>
                      );
                    }
                    return null;
                  })}
                </Stack>
              )}
            </Stack>
          </Card>
        </m.div>

        {/* Opções de Forma de Pagamento */}
        <m.div variants={varFade().inUp} style={{ width: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Como deseja pagar?
      </Typography>

            {/* Cartão de Crédito */}
          <Card
              onClick={() => handleSelecionarFormaPagamento('cartao')}
            sx={{
              p: 3,
              cursor: 'pointer',
                border: `2px solid ${formaPagamento === 'cartao' ? theme.palette.primary.main : 'transparent'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
              sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                  }}
                >
                  <Iconify icon="solar:card-bold" width={32} sx={{ color: 'primary.main' }} />
                </Box>
                <Stack flex={1}>
                  <Typography variant="h6">Cartão de Crédito</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Parcele em até 12x • Aprovação imediata
                  </Typography>
                </Stack>
                <Iconify
                  icon="solar:alt-arrow-right-bold"
                  width={24}
                  sx={{ color: 'text.disabled' }}
                />
              </Stack>
            </Card>

            {/* Boleto Bancário */}
            <Card
              onClick={() => handleSelecionarFormaPagamento('boleto')}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: `2px solid ${formaPagamento === 'boleto' ? theme.palette.primary.main : 'transparent'}`,
                transition: 'all 0.3s ease',
                opacity: 0.6,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.primary.main,
                  opacity: 1,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.16),
                  }}
                >
                  <Iconify icon="solar:bill-list-bold" width={32} sx={{ color: 'info.main' }} />
                    </Box>
                <Stack flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">Boleto Bancário</Typography>
                    <Chip label="EM BREVE" size="small" color="default" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Vencimento em 3 dias úteis
                  </Typography>
                </Stack>
                <Iconify
                  icon="solar:alt-arrow-right-bold"
                  width={24}
                  sx={{ color: 'text.disabled' }}
                />
            </Stack>
          </Card>

            {/* Pix */}
          <Card
              onClick={() => handleSelecionarFormaPagamento('pix')}
            sx={{
                p: 3,
              cursor: 'pointer',
                border: `2px solid ${formaPagamento === 'pix' ? theme.palette.primary.main : 'transparent'}`,
              transition: 'all 0.3s ease',
                opacity: 0.6,
              '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: theme.palette.primary.main,
                  opacity: 1,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
          sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.16),
                  }}
                >
                  <Iconify icon="arcticons:pix" width={32} sx={{ color: 'success.main' }} />
                </Box>
                <Stack flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">Pix</Typography>
                    <Chip label="EM BREVE" size="small" color="default" />
            </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Aprovação instantânea • QR Code
                </Typography>
              </Stack>
                <Iconify
                  icon="solar:alt-arrow-right-bold"
                  width={24}
                  sx={{ color: 'text.disabled' }}
                />
              </Stack>
            </Card>
          </Stack>
        </m.div>

        {/* Informações Adicionais */}
        {temAberturaGratuita && (
          <m.div variants={varFade().inUp} style={{ width: '100%' }}>
              <Card
                sx={{
                  p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                border: `2px dashed ${theme.palette.success.main}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:gift-bold" width={32} sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  🎁 <strong>Abertura de CNPJ GRÁTIS</strong> incluída no seu plano!
                </Typography>
          </Stack>
        </Card>
          </m.div>
      )}

        {/* Botão de Contato */}
        <Stack spacing={2} sx={{ width: '100%' }}>
        <Button
          fullWidth
            size="small"
            variant="text"
            color="inherit"
            onClick={handleContatar}
            startIcon={<Iconify icon="solar:phone-calling-bold" />}
          >
            Prefiro ser contatado pela equipe comercial
        </Button>
        </Stack>
      </Stack>

      {/* Checkout Dialog - Mercado Pago - Removido temporariamente */}
      {/* <MercadoPagoCheckoutDialog
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setFormaPagamento(null);
        }}
        onSuccess={handlePagamentoSucesso}
        valor={valorTotal}
        descricao={`${planoNome}${temAberturaGratuita ? ' + Abertura CNPJ Grátis' : ''}`}
        clienteId={leadId || formData.leadId || 'prospect'}
        dadosUsuario={{
          nome: formData.nome || '',
          email: formData.email || '',
          cpf: formData.cpf || '',
        }}
        metadata={{
          plano: formData.planoSelecionado,
          segmento: 'psicologo',
          aberturaGratuita: temAberturaGratuita,
          leadId: leadId || formData.leadId,
          orcamentoValor: valorTotal,
        }}
      /> */}

      {/* Status Screen Dialog - Resultado do Pagamento - Removido temporariamente */}
      {/* {paymentResult?.mercadoPagoId && (
        <MercadoPagoStatusDialog
          open={statusScreenOpen}
          onClose={handleStatusScreenClose}
          paymentId={paymentResult.mercadoPagoId}
          externalReference={paymentResult.pagamentoId}
        />
      )} */}
    </Container>
  );
}
