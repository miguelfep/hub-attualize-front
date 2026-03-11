'use client';

import { useState, useCallback } from 'react';
import { CardPayment } from '@mercadopago/sdk-react';

import {
  Box,
  Alert,
  Stack,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import axios, { endpoints } from 'src/utils/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MercadoPagoCheckoutDialog({
  open,
  onClose,
  onSuccess,
  valor,
  descricao,
  clienteId,
  dadosUsuario = {},
  metadata = {},
}) {
  const [loading, setLoading] = useState(false);

  // Callback quando o Brick retornar os dados do formulário
  const onSubmit = useCallback(
    async (formData) => {
      try {
        setLoading(true);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📤 DADOS DO FORMULÁRIO (Card Payment Brick):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎫 Token:', formData.token);
        console.log('💰 Valor:', formData.transaction_amount);
        console.log('💳 Método:', formData.payment_method_id);
        console.log('🔢 Parcelas:', formData.installments);
        console.log('🏦 Issuer:', formData.issuer_id);
        console.log('📧 Pagador:', formData.payer?.email);
        console.log('🆔 Doc:', formData.payer?.identification?.type, formData.payer?.identification?.number);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 Objeto completo:', formData);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Enviar para nosso backend processar
        console.log('📡 Enviando para backend processar...');
        
        // Separar nome completo em first_name e last_name
        const nomeCompleto = dadosUsuario.nome || formData.payer?.first_name || '';
        const partesNome = nomeCompleto.trim().split(' ');
        const firstName = partesNome[0] || '';
        const lastName = partesNome.slice(1).join(' ') || 'Sobrenome';

        const payload = {
          clienteId,
          token: formData.token,
          valor: formData.transaction_amount,
          parcelas: formData.installments,
          paymentMethodId: formData.payment_method_id,
          issuerId: formData.issuer_id,
          descricao,
          pagador: {
            email: dadosUsuario.email || formData.payer?.email || '',
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: formData.payer?.identification?.type || 'CPF',
              number: dadosUsuario.cpf?.replace(/\D/g, '') || formData.payer?.identification?.number || '',
            },
          },
          metadata,
        };

        const response = await axios.post(endpoints.mercadoPago.pagamentoUnico, payload);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📦 RESULTADO DO BACKEND:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Success:', response.data.success);
        console.log('📝 Message:', response.data.message);
        console.log('🆔 Payment ID:', response.data.data?.pagamentoId);
        console.log('🆔 Mercado Pago ID:', response.data.data?.mercadoPagoId);
        console.log('📊 Status:', response.data.data?.status);
        console.log('📝 Status Detail:', response.data.data?.statusDetail);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 Response completo:', response.data);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Passar o resultado completo para o callback (inclui paymentId para Status Screen)
        const { data: resultData } = response.data;
        
        if (resultData?.status === 'approved') {
          console.log('✅ SUCESSO: Pagamento aprovado!');
          // Fechar checkout e abrir status screen
          onSuccess?.(resultData);
          onClose();
        } else if (resultData?.status === 'pending' || resultData?.status === 'in_process') {
          console.log('⏳ PENDENTE: Aguardando confirmação');
          // Fechar checkout e abrir status screen
          onSuccess?.(resultData);
          onClose();
        } else if (resultData?.status === 'rejected') {
          console.log('❌ RECUSADO:', resultData.statusDetail);
          // Também mostrar status screen para rejeições
          onSuccess?.(resultData);
          onClose();
        } else {
          toast.error('Erro ao processar pagamento');
          console.log('⚠️ ERRO: Status desconhecido');
        }
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO AO PROCESSAR:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Erro:', error);
        console.error('Response:', error.response?.data);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const errorMessage = error?.response?.data?.message || 'Erro ao processar pagamento';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [clienteId, descricao, metadata, dadosUsuario, onSuccess, onClose]
  );

  // Callback de erro
  const onError = useCallback(async (error) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERRO DO MERCADO PAGO:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Erro:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    toast.error('Erro ao processar dados do cartão. Verifique as informações e tente novamente.');
  }, []);

  // Callback quando o Brick estiver pronto
  const onReady = useCallback(async () => {
    console.log('✅ Card Payment Brick carregado e pronto para uso');
    console.log('💰 Valor a processar:', valor);
    console.log('📝 Descrição:', descricao);
    console.log('👤 Cliente ID:', clienteId);
    console.log('📦 Metadata:', metadata);
  }, [valor, descricao, clienteId, metadata]);

  // Configurações do Brick
  const initialization = {
    amount: valor,
    payer: {
      email: dadosUsuario.email || '',
      firstName: dadosUsuario.nome?.split(' ')[0] || '',
      lastName: dadosUsuario.nome?.split(' ').slice(1).join(' ') || '',
      identification: {
        type: 'CPF',
        number: dadosUsuario.cpf?.replace(/\D/g, '') || '',
      },
    },
  };

  const customization = {
    visual: {
      style: {
        theme: 'default',
      },
    },
    paymentMethods: {
      maxInstallments: 4,
      minInstallments: 1,
    },
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="logos:mercadopago" width={32} />
            <Typography variant="h6">Pagamento Seguro</Typography>
          </Stack>
          {!loading && (
            <Button size="small" onClick={onClose} sx={{ minWidth: 'auto' }}>
              <Iconify icon="solar:close-circle-bold" width={24} />
            </Button>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Resumo do Pedido */}
          <Alert severity="info" icon={<Iconify icon="solar:bill-check-bold" />}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">{descricao}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Total: R$ {valor?.toFixed(2)}
              </Typography>
            </Stack>
          </Alert>

          <Divider />

          {/* Card Payment Brick do Mercado Pago */}
          {open && (
            <Box sx={{ minHeight: 400 }}>
              <CardPayment
                initialization={initialization}
                customization={customization}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
              />
            </Box>
          )}

          {/* Informações de Segurança */}
          <Alert severity="success" icon={<Iconify icon="solar:shield-check-bold" />}>
            <Typography variant="caption">
              🔒 <strong>Pagamento 100% seguro</strong> - Processado diretamente pelo Mercado Pago.
              Não armazenamos dados do seu cartão.
            </Typography>
          </Alert>

          {/* Bandeiras Aceitas */}
          <Stack spacing={1}>
            <Typography variant="caption" color="text.disabled" textAlign="center">
              Aceitamos as principais bandeiras:
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {['Visa', 'Mastercard', 'Amex', 'Elo', 'Hipercard'].map((bandeira) => (
                <Box
                  key={bandeira}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {bandeira}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* Instruções de Teste */}
          <Alert severity="warning" icon={<Iconify icon="solar:info-circle-bold" />}>
            <Typography variant="caption">
              <strong>📋 Abra o Console (F12)</strong> para ver o log completo do pagamento processado
              pelo Mercado Pago.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

