'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Collapse,
  Container,
  Typography,
} from '@mui/material';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  EMABERTO: { label: 'Aguardando pagamento', color: 'warning' },
  VENCIDO: { label: 'Vencida', color: 'error' },
  CANCELADO: { label: 'Cancelada', color: 'default' },
  RECEBIDO: { label: 'Paga', color: 'success' },
  PAGO: { label: 'Paga', color: 'success' },
};

const MS_POR_DIA = 1000 * 60 * 60 * 24;

const FaturaViewPage = ({ faturaData }) => {
  const { valor, dataVencimento, observacoes, boleto, status } = faturaData;

  const [boletoAberto, setBoletoAberto] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const boletoData = boleto ? JSON.parse(boleto) : null;
  const pixCode = boletoData?.pixCopiaECola || null;
  const linhaDigitavel = boletoData?.linhaDigitavel || null;

  const isPaga = status === 'PAGO' || status === 'RECEBIDO';
  const isCancelada = status === 'CANCELADO';
  const statusCfg = STATUS_CONFIG[status] || { label: status, color: 'default' };

  const vencimento = new Date(dataVencimento);
  const formattedDate = vencimento.toLocaleDateString('pt-BR');
  const hoje = new Date();
  const diasParaVencer = Math.ceil((vencimento - hoje) / MS_POR_DIA);
  const isVencida = status === 'VENCIDO' || (!isPaga && !isCancelada && diasParaVencer < 0);

  const handleDownloadBoleto = async (codigoSolicitacao) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );
      const { pdf } = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      link.click();
      toast.success('Download do boleto concluído!');
    } catch (error) {
      toast.error('Erro ao baixar o boleto.');
    }
  };

  const handlePixCopiado = () => {
    setPixCopiado(true);
    toast.success('Código PIX copiado! Agora é só colar no app do seu banco.');
    setTimeout(() => setPixCopiado(false), 4000);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Faixa superior com identidade */}
      <Box
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(
            theme.palette.primary.main,
            0.01
          )})`,
        })}
      >
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box component="img" alt="Attualize" src="/logo/hub-tt.png" sx={{ width: 36, height: 36 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                  Attualize Contábil
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Fatura de honorários
                </Typography>
              </Box>
            </Stack>
            <Chip size="small" variant="outlined" color={statusCfg.color} label={statusCfg.label} />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 8, md: 10 } }}>
        {/* Fatura paga */}
        {isPaga && (
          <Card
            variant="outlined"
            sx={(theme) => ({
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              maxWidth: 560,
              mx: 'auto',
              borderColor: alpha(theme.palette.success.main, 0.4),
              bgcolor: alpha(theme.palette.success.main, 0.04),
            })}
          >
            <Iconify icon="solar:check-circle-bold" width={64} sx={{ color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>
              Fatura paga. Obrigado!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              O pagamento de <strong>{fCurrency(valor)}</strong> foi confirmado. Não é preciso fazer mais nada.
            </Typography>
          </Card>
        )}

        {/* Fatura cancelada */}
        {isCancelada && (
          <Card variant="outlined" sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
            <Iconify icon="solar:close-circle-bold" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>
              Esta fatura foi cancelada
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Se você acredita que isso é um engano, fale com o nosso time de atendimento.
            </Typography>
          </Card>
        )}

        {/* Fatura em aberto */}
        {!isPaga && !isCancelada && (
          <>
            {/* Hero: valor e vencimento em destaque */}
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Sua fatura chegou
              </Typography>
              <Typography variant="h2" sx={{ my: 0.5 }}>
                {fCurrency(valor)}
              </Typography>
              <Typography variant="body2" sx={{ color: isVencida ? 'error.main' : 'text.secondary' }}>
                {isVencida
                  ? `Venceu em ${formattedDate}`
                  : diasParaVencer === 0
                    ? 'Vence hoje'
                    : `Vencimento em ${formattedDate}`}
              </Typography>
            </Box>

            {/* Aversão à perda: urgência para faturas vencidas ou próximas do vencimento */}
            {isVencida && (
              <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />} sx={{ mb: 3, maxWidth: 720, mx: 'auto' }}>
                Fatura vencida — pague agora com PIX para evitar juros e multa. A confirmação é imediata.
              </Alert>
            )}
            {!isVencida && diasParaVencer >= 0 && diasParaVencer <= 3 && (
              <Alert severity="info" icon={<Iconify icon="solar:clock-circle-bold" />} sx={{ mb: 3, maxWidth: 720, mx: 'auto' }}>
                {diasParaVencer === 0
                  ? 'Sua fatura vence hoje. Com PIX o pagamento é confirmado na hora.'
                  : `Faltam ${diasParaVencer} ${diasParaVencer === 1 ? 'dia' : 'dias'} para o vencimento.`}
              </Alert>
            )}

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                alignItems: 'flex-start',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
                maxWidth: 880,
                mx: 'auto',
              }}
            >
              {/* Pagamento — PIX em primeiro plano */}
              <Card variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
                {pixCode ? (
                  <>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap" useFlexGap>
                      <Typography variant="h6">Pague com PIX</Typography>
                      <Chip
                        label="Recomendado"
                        color="success"
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                      É a forma que a maioria dos nossos clientes escolhe: leva menos de 1 minuto.
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 2.5, sm: 3 }}
                      alignItems="center"
                    >
                      {/* QR Code */}
                      <Box
                        sx={(theme) => ({
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: '#fff',
                          border: `1px solid ${theme.palette.divider}`,
                          lineHeight: 0,
                          flexShrink: 0,
                        })}
                      >
                        <QRCodeSVG value={pixCode} size={168} level="M" />
                      </Box>

                      <Stack spacing={1.5} flex={1} width="100%">
                        <Stack spacing={0.75}>
                          {[
                            { icon: 'solar:bolt-bold', text: 'Confirmação na hora' },
                            { icon: 'solar:shield-check-bold', text: 'Seguro e sem taxas' },
                            { icon: 'solar:smartphone-bold', text: 'Escaneie o QR Code ou copie o código' },
                          ].map((item) => (
                            <Stack key={item.icon} direction="row" spacing={1} alignItems="center">
                              <Iconify icon={item.icon} width={18} sx={{ color: 'success.main', flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.text}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <CopyToClipboard text={pixCode} onCopy={handlePixCopiado}>
                          <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            color={pixCopiado ? 'success' : 'primary'}
                            startIcon={
                              <Iconify icon={pixCopiado ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
                            }
                            sx={{ minHeight: 48 }}
                          >
                            {pixCopiado ? 'Código copiado!' : 'Copiar código PIX'}
                          </Button>
                        </CopyToClipboard>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          Abra o app do seu banco, escolha PIX &gt; Copia e Cola, e cole o código.
                        </Typography>
                      </Stack>
                    </Stack>
                  </>
                ) : (
                  !linhaDigitavel && (
                    <Alert severity="info">
                      Estamos gerando a sua cobrança. Atualize a página em instantes ou fale com o nosso
                      atendimento.
                    </Alert>
                  )
                )}

                {/* Boleto — opção secundária, atrás de um clique (fricção assimétrica) */}
                {linhaDigitavel && (
                  <>
                    {pixCode && (
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          ou
                        </Typography>
                      </Divider>
                    )}

                    {pixCode ? (
                      <Button
                        fullWidth
                        color="inherit"
                        onClick={() => setBoletoAberto((prev) => !prev)}
                        endIcon={
                          <Iconify
                            icon={boletoAberto ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                            width={18}
                          />
                        }
                        sx={{ color: 'text.secondary', justifyContent: 'space-between' }}
                      >
                        Prefiro pagar com boleto (compensa em até 3 dias úteis)
                      </Button>
                    ) : (
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Pague com boleto
                      </Typography>
                    )}

                    <Collapse in={boletoAberto || !pixCode}>
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        <Box
                          sx={(theme) => ({
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                            border: `1px solid ${theme.palette.divider}`,
                          })}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.8rem' }}
                          >
                            {linhaDigitavel}
                          </Typography>
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <CopyToClipboard
                            text={linhaDigitavel}
                            onCopy={() => toast.success('Linha digitável copiada!')}
                          >
                            <Button
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              startIcon={<Iconify icon="solar:copy-linear" />}
                            >
                              Copiar linha digitável
                            </Button>
                          </CopyToClipboard>
                          {boletoData?.codigoSolicitacao && (
                            <Button
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              startIcon={<Iconify icon="solar:download-linear" />}
                              onClick={() => handleDownloadBoleto(boletoData.codigoSolicitacao)}
                            >
                              Baixar boleto em PDF
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Collapse>
                  </>
                )}
              </Card>

              {/* Detalhes da fatura */}
              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  position: { md: 'sticky' },
                  top: { md: 24 },
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Detalhes da fatura
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Valor
                    </Typography>
                    <Typography variant="subtitle2">{fCurrency(valor)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Vencimento
                    </Typography>
                    <Typography variant="body2">{formattedDate}</Typography>
                  </Stack>
                  {observacoes && (
                    <>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          Referente a
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {observacoes}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                  <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: 'success.main' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Pagamento seguro · Attualize Contábil
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default FaturaViewPage;
