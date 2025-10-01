import { useState } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PaymentInfoSection({ user, currentPlan, contratos = [] }) {
  const [paymentMethod, setPaymentMethod] = useState({
    type: 'credit_card',
    last4: '**** 1234',
    brand: 'Visa',
    expiryMonth: '12',
    expiryYear: '2025',
  });

  const [billingAddress, setBillingAddress] = useState({
    name: user?.name || 'Nome não informado',
    email: user?.email || 'email@exemplo.com',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 99999-9999',
  });

  const openPaymentDialog = useBoolean();
  const openAddressDialog = useBoolean();

  const formatExpiryDate = (month, year) => `${month.toString().padStart(2, '0')}/${year}`;

  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: 'logos:visa',
      mastercard: 'logos:mastercard',
      amex: 'logos:american-express',
      elo: 'logos:elo',
    };
    return brandIcons[brand?.toLowerCase()] || 'solar:card-bold';
  };

  const getCardBrandColor = (brand) => {
    const brandColors = {
      visa: '#1A1F71',
      mastercard: '#EB001B',
      amex: '#006FCF',
      elo: '#00A651',
    };
    return brandColors[brand?.toLowerCase()] || 'primary.main';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      EMABERTO: 'warning',
      VENCIDO: 'error',
      CANCELADO: 'info',
      RECEBIDO: 'success',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusTexts = {
      EMABERTO: 'Aguardando',
      VENCIDO: 'Vencida',
      CANCELADO: 'Cancelada',
      RECEBIDO: 'Paga',
    };
    return statusTexts[status] || status;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      EMABERTO: 'eva:clock-outline',
      VENCIDO: 'eva:alert-circle-outline',
      CANCELADO: 'eva:close-circle-outline',
      RECEBIDO: 'eva:checkmark-circle-2-fill',
    };
    return statusIcons[status] || 'eva:help-circle-outline';
  };

  const handleCopyPix = (boletoData) => {
    try {
      const boleto = typeof boletoData === 'string' ? JSON.parse(boletoData) : boletoData;
      if (boleto.pixCopiaECola) {
        navigator.clipboard.writeText(boleto.pixCopiaECola);
        // Aqui você pode adicionar um toast de sucesso
        console.log('🎉 PIX copiado! Cole no seu app de pagamento');
      }
    } catch (error) {
      console.error('Erro ao copiar PIX:', error);
    }
  };

  const handleCopyBoleto = (boletoData) => {
    try {
      const boleto = typeof boletoData === 'string' ? JSON.parse(boletoData) : boletoData;
      if (boleto.linhaDigitavel) {
        navigator.clipboard.writeText(boleto.linhaDigitavel);
        // Aqui você pode adicionar um toast de sucesso
        console.log('📄 Linha digitável copiada!');
      }
    } catch (error) {
      console.error('Erro ao copiar boleto:', error);
    }
  };

  return (
    <Card>
      {/* <CardHeader 
        title="Informações de Pagamento" 
        subheader="Gerencie seus métodos de pagamento e endereço de cobrança"
      />
       */}
      <CardContent>
        {/* Método de Pagamento e Endereço - Comentado temporariamente */}
        {/* 
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">Método de Pagamento</Typography>
              <Paper variant="outlined" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: getCardBrandColor(paymentMethod.brand) }}>
                    <Iconify icon={getCardBrandIcon(paymentMethod.brand)} width={24} sx={{ color: 'white' }} />
                  </Avatar>
                  <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{paymentMethod.brand} {paymentMethod.last4}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expira em {formatExpiryDate(paymentMethod.expiryMonth, paymentMethod.expiryYear)}
                    </Typography>
                  </Stack>
                  <Chip label="Principal" color="success" size="small" startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />} />
                </Stack>
              </Paper>
              <Button variant="outlined" startIcon={<Iconify icon="mingcute:add-line" />} size="small">
                Adicionar Método de Pagamento
              </Button>
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">Endereço de Cobrança</Typography>
              <Paper variant="outlined" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">{billingAddress.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{billingAddress.address}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{billingAddress.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">{billingAddress.email}</Typography>
                </Stack>
              </Paper>
              <Button variant="outlined" startIcon={<Iconify icon="mingcute:add-line" />} size="small">
                Editar Endereço
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        */}

        {/* Cobranças por Contrato */}
        <Stack spacing={3} sx={{ mt: 3 }}>
          <Typography variant="h6">Cobranças do Ano Atual</Typography>
          
          {contratos.length > 0 ? (
            <Stack spacing={3}>
              {contratos.map((contrato) => {
                const faturasAnoAtual = contrato.faturas
                  .filter(fatura => {
                    const dataVencimento = new Date(fatura.dataVencimento);
                    const anoAtual = new Date().getFullYear();
                    return dataVencimento.getFullYear() === anoAtual;
                  })
                  .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));

                if (faturasAnoAtual.length === 0) return null;

                return (
                  <Paper key={contrato.contrato._id} variant="outlined" sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                    <Stack spacing={2}>
                      {/* Header do Contrato */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={0.5}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {contrato.contrato.titulo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Valor mensal: {fCurrency(contrato.contrato.valorMensalidade)}
                          </Typography>
                        </Stack>
                        <Chip 
                          label={`${faturasAnoAtual.length} faturas`}
                          color="info"
                          size="small"
                          startIcon={<Iconify icon="solar:bill-list-bold" />}
                        />
                      </Stack>

                      <Divider />

                      {/* Lista de Faturas */}
                      <Stack spacing={1.5}>
                        {faturasAnoAtual.map((fatura) => (
                          <Paper key={fatura._id} variant="outlined" sx={{ p: 2, border: 1, borderColor: 'grey.200' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack spacing={0.5}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  Vencimento: {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
                                </Typography>
                                {fatura.observacoes && (
                                  <Typography variant="caption" color="text.secondary">
                                    {fatura.observacoes}
                                  </Typography>
                                )}
                              </Stack>
                              
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {/* Botões de Pagamento - Antes do Valor */}
                                {fatura.status === 'EMABERTO' && fatura.boleto && (
                                  <Stack direction="row" spacing={1}>
                                    <Button
                                      variant="contained"
                                      startIcon={<Iconify icon="solar:qr-code-bold" />}
                                      onClick={() => handleCopyPix(fatura.boleto)}
                                      size="small"
                                      sx={{ 
                                        bgcolor: '#00C851',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        '&:hover': {
                                          bgcolor: '#00A041',
                                        },
                                      }}
                                    >
                                      PIX
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      startIcon={<Iconify icon="solar:document-text-bold" />}
                                      onClick={() => handleCopyBoleto(fatura.boleto)}
                                      size="small"
                                      sx={{ 
                                        borderColor: 'primary.main',
                                        color: 'primary.main',
                                        minWidth: 'auto',
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        '&:hover': {
                                          borderColor: 'primary.dark',
                                          bgcolor: 'primary.lighter',
                                        },
                                      }}
                                    >
                                      Boleto
                                    </Button>
                                  </Stack>
                                )}

                                <Stack alignItems="flex-end" spacing={0.5}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {fCurrency(fatura.valor)}
                                  </Typography>
                                  <Chip 
                                    label={getStatusLabel(fatura.status)}
                                    color={getStatusColor(fatura.status)}
                                    size="small"
                                    startIcon={<Iconify icon={getStatusIcon(fatura.status)} />}
                                  />
                                </Stack>
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
              <Iconify icon="solar:bill-list-bold-duotone" width={32} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                Nenhuma cobrança encontrada para o ano atual
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
